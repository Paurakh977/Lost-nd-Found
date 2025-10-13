'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, Package, Shield, CheckCircle, ArrowLeft, AlertCircle, Users, Map } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@clerk/nextjs';
import ItemPlaceholder from '@/components/ItemPlaceholder';

// JWT User interface
interface JWTUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  primaryEmailAddress?: {
    emailAddress: string;
  };
}

interface CaseItem {
  _id: string;
  title: string;
  description: string;
  type: 'lost' | 'found' | 'verification';
  status: 'pending' | 'active' | 'resolved';
  urgencyLevel: 'low' | 'medium' | 'high' | null;
  reportedTime: string;
  location: {
    type: string;
    coordinates?: [number, number];
    address: string;
    details?: string;
  };
  itemDetails: {
    detailedDescription: string;
    category?: string;
    brand?: string;
    model?: string;
    color?: string;
    serialNumber?: string;
    identifyingFeatures?: string;
    estimatedValue?: number;
  };
  images: string[];
  reportedBy: {
    clerkId: string;
    name: string;
    email?: string;
  };
  assignedOfficer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  resolution?: any;
  createdAt: string;
  updatedAt: string;
}

interface Officer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  address: {
    province: string;
    district: string;
    municipality: string;
    ward: string;
  };
}

interface LocationData {
  provinces: Array<{ name: string; districts: Array<{ name: string; municipalities: Array<{ name: string }> }> }>;
}

export default function PublicCaseDetailPage() {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const { pushToast, removeToast, toasts } = useToast();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [jwtUser, setJwtUser] = useState<JWTUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Determine which user to use (JWT or Clerk)
  const user = jwtUser || clerkUser;
  
  const [caseItem, setCaseItem] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [checkingClaim, setCheckingClaim] = useState(false);
  
  // Related case IDs for linking (from email or search)
  const [relatedFoundCaseId, setRelatedFoundCaseId] = useState<string | null>(null); // When viewing LOST case
  const [relatedLostCaseId, setRelatedLostCaseId] = useState<string | null>(null); // When viewing FOUND case
  
  // Claim evidence states
  const [claimDescription, setClaimDescription] = useState('');
  const [claimImages, setClaimImages] = useState<File[]>([]);
  const [claimantInfo, setClaimantInfo] = useState({
    phone: '',
    address: {
      province: '',
      district: '',
      municipality: '',
      ward: '',
      fullAddress: ''
    }
  });

  // Check for JWT user first, then fall back to Clerk
  useEffect(() => {
    if (clerkLoaded && !clerkUser) {
      // No Clerk user, check for JWT user
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            // Transform JWT user to match Clerk user format
            setJwtUser({
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              fullName: `${data.user.firstName} ${data.user.lastName}`,
              primaryEmailAddress: {
                emailAddress: data.user.email
              }
            });
          }
        })
        .catch(() => {
          setJwtUser(null);
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else if (clerkLoaded) {
      setAuthLoading(false);
    }
  }, [clerkLoaded, clerkUser]);

  // Extract foundCaseId or lostCaseId from query params
  // foundCaseId: when viewing LOST case (from email)
  // lostCaseId: when viewing FOUND case (from search page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const foundId = searchParams.get('foundCaseId');
      const lostId = searchParams.get('lostCaseId');
      
      if (foundId) {
        setRelatedFoundCaseId(foundId);
        console.log('[Case Detail] Related FOUND case ID from URL (viewing LOST case):', foundId);
      }
      
      if (lostId) {
        setRelatedLostCaseId(lostId);
        console.log('[Case Detail] Related LOST case ID from URL (viewing FOUND case):', lostId);
      }
    }
  }, []);
  
  // Fetch case details
  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/cases/${params.caseId}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch case');
        setCaseItem(data.case);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error fetching case');
      } finally {
        setLoading(false);
      }
    };

    if (params.caseId) {
      fetchCase();
    }
  }, [params.caseId]);

  // Fetch location data for officer selection
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Fetch the mapping files to build the nested structure
        const [provinceDistrictsRes, districtMunicipalitiesRes] = await Promise.all([
          fetch('/address/map-province-districts.json'),
          fetch('/address/map-districts-municipalities.json')
        ]);
        
        const provinceDistrictsMap = await provinceDistrictsRes.json();
        const districtMunicipalitiesMap = await districtMunicipalitiesRes.json();
        
        // Build the nested structure expected by the component
        const provinces = Object.keys(provinceDistrictsMap).map(provinceName => ({
          name: provinceName,
          districts: provinceDistrictsMap[provinceName].map((districtName: string) => ({
            name: districtName,
            municipalities: (districtMunicipalitiesMap[districtName] || []).map((municipalityName: string) => ({
              name: municipalityName
            }))
          }))
        }));
        
        setLocationData({ provinces });
      } catch (e) {
        console.error('Failed to fetch location data:', e);
      }
    };

    fetchLocationData();
  }, []);

  // Fetch officers when district/municipality is selected
  useEffect(() => {
    if (selectedDistrict && selectedMunicipality) {
      fetchOfficers();
    } else {
      // Clear officers list when selections change
      setOfficers([]);
      if (selectedOfficer) {
        setSelectedOfficer('');
      }
    }
  }, [selectedDistrict, selectedMunicipality]);

  const fetchOfficers = async () => {
    try {
      setLoadingOfficers(true);
      const res = await fetch(`/api/officers/by-location?district=${encodeURIComponent(selectedDistrict)}&municipality=${encodeURIComponent(selectedMunicipality)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOfficers(data.officers);
      } else {
        setOfficers([]);
      }
    } catch (e) {
      console.error('Failed to fetch officers:', e);
      setOfficers([]);
    } finally {
      setLoadingOfficers(false);
    }
  };

  const handleClaimForVerification = async () => {
    if (!caseItem) return;

    // Check if user is authenticated
    if (!user) {
      pushToast('error', 'Authentication Required', 'Please sign in to claim this item');
      // Redirect to sign-in page
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/cases/${params.caseId}`)}`);
      return;
    }

    // Always show the modal to collect claim evidence and claimant information
    setShowClaimModal(true);
    
    // If already assigned to an officer, pre-select them
    if (caseItem.status === 'active' && caseItem.assignedOfficer) {
      setSelectedOfficer(caseItem.assignedOfficer._id);
    }
  };

  const submitVerificationRequest = async (officerId: string) => {
    try {
      setSubmitting(true);
      
      // Upload evidence images first
      const evidenceImageUrls: string[] = [];
      if (claimImages.length > 0) {
        for (const file of claimImages) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'evidence');
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            evidenceImageUrls.push(uploadData.filename);
          }
        }
      }
      
      // Get user info (from JWT or Clerk)
      const userName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      const userEmail = user?.primaryEmailAddress?.emailAddress || user?.email || '';
      const userId = user?.id;
      
      console.log('[Claim Submission] User info:', {
        userId: userId || 'MISSING',
        userName,
        userEmail: userEmail ? `${userEmail.substring(0, 3)}***` : 'MISSING',
        isJWTUser: !!jwtUser,
        isClerkUser: !!clerkUser
      });
      
      // Determine which related case ID to use based on the current case type
      // If viewing a LOST case (with foundCaseId query param), link to FOUND case
      // If viewing a FOUND case (with lostCaseId query param), link to LOST case
      const relatedCaseId = relatedFoundCaseId || relatedLostCaseId;
      
      console.log('[Claim Submission] 🔍 CRITICAL - Related case linking:', {
        currentCaseId: params.caseId,
        currentCaseType: caseItem?.type,
        relatedFoundCaseId: relatedFoundCaseId || 'NONE',
        relatedLostCaseId: relatedLostCaseId || 'NONE',
        finalRelatedCaseId: relatedCaseId || 'NONE'
      });
      
      if (!userId) {
        pushToast('error', 'Authentication Error', 'User ID not found. Please sign in again.');
        return;
      }
      
      const requestBody: any = { 
        clerkUserId: userId,
        relatedFoundCaseId: relatedCaseId || undefined, // Link to related case (FOUND if viewing LOST, or LOST if viewing FOUND)
        claimEvidence: {
          description: claimDescription.trim(),
          images: evidenceImageUrls,
          claimantInfo: {
            name: userName,
            email: userEmail,
            phone: claimantInfo.phone.trim(),
            address: {
              province: claimantInfo.address.province || undefined,
              district: claimantInfo.address.district || undefined,
              municipality: claimantInfo.address.municipality || undefined,
              ward: claimantInfo.address.ward || undefined,
              fullAddress: claimantInfo.address.fullAddress || undefined
            }
          }
        }
      };
      
      console.log('[Claim Submission] Including relatedFoundCaseId:', relatedFoundCaseId || 'none');
      
      // Only include officerId if one was selected
      if (officerId) {
        requestBody.officerId = officerId;
      }
      
      const res = await fetch(`/api/cases/${params.caseId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        const message = officerId 
          ? 'Your claim has been submitted for verification. The assigned officer will review your case.'
          : 'Your claim has been submitted for verification. It will be available for officers to review and take on.';
        pushToast('success', 'Verification Request Submitted', message);
        setShowClaimModal(false);
        // Reset form
        setClaimDescription('');
        setClaimImages([]);
        setClaimantInfo({
          phone: '',
          address: { province: '', district: '', municipality: '', ward: '', fullAddress: '' }
        });
        // Refresh case data
        window.location.reload();
      } else {
        pushToast('error', 'Submission Failed', data.error || 'Failed to submit verification request');
      }
    } catch (e) {
      pushToast('error', 'Submission Failed', 'An error occurred while submitting your request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Just store the File objects locally, don't upload yet
    // Upload will happen when the user submits the claim
    const newFiles = Array.from(files);
    setClaimImages(prev => [...prev, ...newFiles]);
    pushToast('info', 'Images Added', `${newFiles.length} image(s) added. They will be uploaded when you submit.`);
  };

  const removeImage = (index: number) => {
    setClaimImages(prev => prev.filter((_, i) => i !== index));
  };

  // Check if user has already claimed when component mounts or user changes
  useEffect(() => {
    const checkExistingClaim = async () => {
      if (user?.id && params.caseId) {
        try {
          setCheckingClaim(true);
          const queryParams = new URLSearchParams();
          queryParams.append('caseId', params.caseId);
          queryParams.append('clerkUserId', user.id);
          
          const checkRes = await fetch(`/api/claims?${queryParams.toString()}`);
          const checkData = await checkRes.json();
          
          if (checkData.success && checkData.hasClaimed) {
            setHasClaimed(true);
            pushToast('warning', 'Already Claimed', 'You have already submitted a claim for this item.');
          } else {
            setHasClaimed(false);
          }
        } catch (e) {
          console.error('Failed to check existing claim:', e);
        } finally {
          setCheckingClaim(false);
        }
      }
    };

    checkExistingClaim();
  }, [params.caseId, user?.id]);

  const handleSubmitClaim = async () => {
    // Check if user is authenticated
    if (!user) {
      pushToast('error', 'Authentication Required', 'Please sign in to claim this item');
      return;
    }
    
    if (!claimDescription.trim()) {
      pushToast('error', 'Description Required', 'Please provide a description proving your ownership');
      return;
    }
    
    if (!claimantInfo.phone.trim()) {
      pushToast('error', 'Phone Required', 'Please provide your phone number');
      return;
    }

    if (hasClaimed) {
      pushToast('error', 'Already Claimed', 'You have already submitted a claim for this item.');
      return;
    }
    
    // Officer selection is optional - if no officer selected, case remains unassigned
    await submitVerificationRequest(selectedOfficer || '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error || !caseItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The case you are looking for does not exist or has been removed.'}</p>
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const typeIcon = caseItem.type === 'lost' ? <Package className="w-5 h-5" />
    : caseItem.type === 'found' ? <CheckCircle className="w-5 h-5" />
    : <Shield className="w-5 h-5" />;

  const hasImage = caseItem.images && caseItem.images.length > 0;

  // Allow claiming for 'lost', 'verification', and 'found' types (as long as not resolved)
  // LOST/VERIFICATION: user claims they lost the item
  // FOUND: user claims this is the item they lost (reverse scenario from search)
  const canClaim = (caseItem.type === 'lost' || caseItem.type === 'verification' || caseItem.type === 'found') && caseItem.status !== 'resolved' && !hasClaimed;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src="/Logo.png" alt="GOTUS" className="h-8 w-auto" />
              <span className="ml-3 text-xl font-bold text-gray-900">GOTUS</span>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Header */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-start gap-6">
                {hasImage ? (
                  <img 
                    src={`/uploads/${caseItem.images[0]}`}
                    alt={caseItem.title} 
                    className="w-32 h-32 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                  />
                ) : (
                  <ItemPlaceholder className="w-32 h-32 rounded-lg flex-shrink-0 border border-gray-200" itemType={caseItem.type} />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{caseItem.title}</h1>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                      {typeIcon}
                      <span className="ml-2 capitalize">{caseItem.type}</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      caseItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      caseItem.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {caseItem.status}
                    </span>
                    {caseItem.urgencyLevel && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        caseItem.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                        caseItem.urgencyLevel === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {caseItem.urgencyLevel} priority
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">{caseItem.description}</p>
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseItem.itemDetails.brand && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Brand</span>
                    <p className="text-gray-900">{caseItem.itemDetails.brand}</p>
                  </div>
                )}
                {caseItem.itemDetails.model && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Model</span>
                    <p className="text-gray-900">{caseItem.itemDetails.model}</p>
                  </div>
                )}
                {caseItem.itemDetails.color && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Color</span>
                    <p className="text-gray-900">{caseItem.itemDetails.color}</p>
                  </div>
                )}
                {caseItem.itemDetails.category && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category</span>
                    <p className="text-gray-900">{caseItem.itemDetails.category}</p>
                  </div>
                )}
                {caseItem.itemDetails.estimatedValue && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estimated Value</span>
                    <p className="text-gray-900">${caseItem.itemDetails.estimatedValue}</p>
                  </div>
                )}
              </div>
              {caseItem.itemDetails.identifyingFeatures && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-500">Identifying Features</span>
                  <p className="text-gray-900 mt-1">{caseItem.itemDetails.identifyingFeatures}</p>
                </div>
              )}
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-500">Detailed Description</span>
                <p className="text-gray-900 mt-1 whitespace-pre-line">{caseItem.itemDetails.detailedDescription}</p>
              </div>
            </div>

            {/* Additional Images */}
            {caseItem.images && caseItem.images.length > 1 && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {caseItem.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={`/uploads/${image}`}
                      alt={`${caseItem.title} - Image ${index + 2}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => { e.currentTarget.src = '/icons/icon-512x512.png'; }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Case Info */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900 font-medium">{caseItem.location.address}</p>
                    {caseItem.location.details && (
                      <p className="text-sm text-gray-600">{caseItem.location.details}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Reported</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(caseItem.reportedTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Reported By</p>
                    <p className="text-gray-900 font-medium">{caseItem.reportedBy.name}</p>
                  </div>
                </div>
                {caseItem.assignedOfficer && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Assigned Officer</p>
                      <p className="text-gray-900 font-medium">
                        {caseItem.assignedOfficer.firstName} {caseItem.assignedOfficer.lastName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Claim Button */}
            {canClaim && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {caseItem.type === 'found' ? 'Is this your lost item?' : 'Think this is yours?'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {caseItem.type === 'found' 
                    ? 'If this found item belongs to you, submit a claim to prove ownership. An officer will review your evidence and help verify.'
                    : 'If you believe this item belongs to you, you can submit a verification request. An officer will review your claim and help verify ownership.'
                  }
                </p>
                <button
                  onClick={handleClaimForVerification}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {caseItem.type === 'found' ? 'Claim This Found Item' : 'Claim This Item'}
                </button>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Reporter Email</p>
                <a 
                  href={`mailto:${caseItem.reportedBy.email}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {caseItem.reportedBy.email}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Claim This Item</h3>
            <p className="text-gray-600 mb-6">
              Please provide evidence and your information to claim this item. An officer will review your claim.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Evidence */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Evidence of Ownership</h4>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description * <span className="text-gray-500">(Required)</span>
                  </label>
                  <textarea
                    value={claimDescription}
                    onChange={(e) => setClaimDescription(e.target.value)}
                    placeholder="Describe how you can prove this item belongs to you. Include specific details, serial numbers, unique features, purchase receipts, or any other evidence..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required
                  />
                </div>

                {/* Evidence Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence Images <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="evidence-upload"
                      disabled={submitting}
                    />
                    <label
                      htmlFor="evidence-upload"
                      className="cursor-pointer flex flex-col items-center justify-center py-4 hover:bg-gray-50"
                    >
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        Click to add evidence images
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF up to 10MB each</p>
                    </label>
                  </div>
                  
                  {/* Preview uploaded images */}
                  {claimImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {claimImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Personal Info & Officer Selection */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Your Information</h4>
                
                {/* Personal Details */}
                <div className="space-y-3">
                  {/* Display user info from Clerk (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">From your account</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.primaryEmailAddress?.emailAddress || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">From your account</p>
                    {checkingClaim && (
                      <p className="text-xs text-blue-600 mt-1">Checking if you've already claimed...</p>
                    )}
                    {hasClaimed && (
                      <p className="text-xs text-red-600 mt-1 font-medium">⚠️ You have already submitted a claim for this item</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={claimantInfo.phone}
                      onChange={(e) => setClaimantInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your contact number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <textarea
                      value={claimantInfo.address.fullAddress}
                      onChange={(e) => setClaimantInfo(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, fullAddress: e.target.value }
                      }))}
                      placeholder="Your complete address..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  {caseItem.status === 'active' && caseItem.assignedOfficer ? (
                    // Case already has an assigned officer
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Assigned Officer</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {caseItem.assignedOfficer.firstName} {caseItem.assignedOfficer.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{caseItem.assignedOfficer.email}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          This officer will review your claim.
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Need to select an officer
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Select Officer <span className="text-gray-500 text-sm font-normal">(Optional)</span></h4>
                      <p className="text-sm text-gray-600 mb-3">
                        You can select a specific officer, or leave it unassigned for any officer to take the case.
                      </p>
                      
                      {/* Province Selection */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                        <select
                          value={selectedProvince}
                          onChange={(e) => {
                            setSelectedProvince(e.target.value);
                            setSelectedDistrict('');
                            setSelectedMunicipality('');
                            setOfficers([]);
                            setSelectedOfficer('');
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Province</option>
                          {locationData?.provinces?.map(province => (
                            <option key={province.name} value={province.name}>
                              {province.name}
                            </option>
                          )) || []}
                        </select>
                      </div>
                      
                      {/* District Selection */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setSelectedMunicipality('');
                            setOfficers([]);
                            setSelectedOfficer('');
                          }}
                          disabled={!selectedProvince}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Select District</option>
                          {selectedProvince && locationData?.provinces
                            ?.find(province => province.name === selectedProvince)
                            ?.districts?.map(district => (
                              <option key={district.name} value={district.name}>
                                {district.name}
                              </option>
                            )) || []}
                        </select>
                      </div>

                      {/* Municipality Selection */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Municipality</label>
                        <select
                          value={selectedMunicipality}
                          onChange={(e) => {
                            setSelectedMunicipality(e.target.value);
                            setOfficers([]);
                            setSelectedOfficer('');
                          }}
                          disabled={!selectedDistrict}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Select Municipality</option>
                          {selectedDistrict && locationData?.provinces
                            ?.flatMap(province => province.districts || [])
                            ?.find(district => district.name === selectedDistrict)
                            ?.municipalities?.map(municipality => (
                              <option key={municipality.name} value={municipality.name}>
                                {municipality.name}
                              </option>
                            )) || []
                          }
                        </select>
                      </div>

                      {/* Officer Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Officer</label>
                        {loadingOfficers ? (
                          <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-center">
                            Loading officers...
                          </div>
                        ) : (
                          <select
                            value={selectedOfficer}
                            onChange={(e) => setSelectedOfficer(e.target.value)}
                            disabled={!selectedMunicipality || officers.length === 0}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          >
                            <option value="">
                              {officers.length === 0 ? 'No officers available' : 'Select Officer'}
                            </option>
                            {officers.map(officer => (
                              <option key={officer._id} value={officer._id}>
                                {officer.firstName} {officer.lastName} - {officer.department}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowClaimModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={submitting || !claimDescription.trim() || !claimantInfo.phone.trim() || hasClaimed || checkingClaim || !user}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : hasClaimed ? 'Already Claimed' : checkingClaim ? 'Checking...' : !user ? 'Sign In Required' : 'Submit Claim'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{toast.title}</p>
                <p className="text-sm opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

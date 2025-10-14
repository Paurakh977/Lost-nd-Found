'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCaseDetail } from '../../hooks/useCaseDetail';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, Package, Shield, CheckCircle, ArrowLeft, FileText, Mail, Phone, MapPinned } from 'lucide-react';
import ItemPlaceholder from '@/components/ItemPlaceholder';

interface Claim {
  id: string;
  claimantInfo: {
    name: string;
    email: string;
    phone?: string;
    address: {
      province?: string;
      district?: string;
      municipality?: string;
      ward?: string;
      fullAddress?: string;
    };
  };
  evidence: {
    description: string;
    images?: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: any;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CaseDetailPage() {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const { caseItem, loading, error } = useCaseDetail(params.caseId);
  
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState<string | null>(null);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  // Fetch claims for verification cases
  useEffect(() => {
    if (caseItem && caseItem.type === 'verification') {
      fetchClaims();
    }
  }, [caseItem]);

  const fetchClaims = async () => {
    try {
      setClaimsLoading(true);
      setClaimsError(null);
      const res = await fetch(`/api/cases/${params.caseId}/claims`);
      const data = await res.json();
      if (res.ok && data.success) {
        setClaims(data.claims);
      } else {
        setClaimsError(data.error || 'Failed to fetch claims');
      }
    } catch (e) {
      setClaimsError('Error fetching claims');
    } finally {
      setClaimsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="h-4 w-72 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !caseItem) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => router.back()} className="mb-4 inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <p className="text-red-600">{error || 'Case not found'}</p>
      </div>
    );
  }

  const typeIcon = caseItem.type === 'lost' ? <Package className="w-4 h-4" />
    : caseItem.type === 'found' ? <CheckCircle className="w-4 h-4" />
    : <Shield className="w-4 h-4" />;

  const hasImage = caseItem.images && caseItem.images.length > 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button onClick={() => router.back()} className="mb-6 inline-flex items-center text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-white rounded-xl border p-6">
          <div className="flex items-start gap-4">
            {hasImage ? (
              <img 
                src={`/uploads/${caseItem.images[0]}`}
                alt={caseItem.title} 
                className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <ItemPlaceholder className="w-24 h-24 rounded-lg border border-gray-200" itemType={caseItem.type} />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">{caseItem.title}</h1>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{typeIcon}<span className="ml-1 capitalize">{caseItem.type}</span></span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  caseItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  caseItem.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>{caseItem.status}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{caseItem.description}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {caseItem.location.address}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(caseItem.reportedTime).toLocaleString()}</div>
            {caseItem.location.details && <div className="md:col-span-2">Details: {caseItem.location.details}</div>}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Item Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {caseItem.itemDetails.brand && <div>Brand: {caseItem.itemDetails.brand}</div>}
              {caseItem.itemDetails.model && <div>Model: {caseItem.itemDetails.model}</div>}
              {caseItem.itemDetails.color && <div>Color: {caseItem.itemDetails.color}</div>}
              {caseItem.itemDetails.category && <div>Category: {caseItem.itemDetails.category}</div>}
              {caseItem.itemDetails.identifyingFeatures && <div className="md:col-span-2">Features: {caseItem.itemDetails.identifyingFeatures}</div>}
              <div className="md:col-span-2">Description: {caseItem.itemDetails.detailedDescription}</div>
            </div>
          </div>

          {caseItem.assignedOfficer && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Assigned Officer</h2>
              <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4" /> {caseItem.assignedOfficer.firstName} {caseItem.assignedOfficer.lastName} ({caseItem.assignedOfficer.email})</div>
            </div>
          )}

          {/* Claims Section for Verification Cases */}
          {caseItem.type === 'verification' && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Claims ({claims.length})
              </h2>
              
              {claimsLoading ? (
                <div className="text-sm text-gray-500">Loading claims...</div>
              ) : claimsError ? (
                <div className="text-sm text-red-600">{claimsError}</div>
              ) : claims.length === 0 ? (
                <div className="text-sm text-gray-500">No claims submitted yet</div>
              ) : (
                <div className="space-y-3">
                  {claims.map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm">{claim.claimantInfo.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              claim.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {claim.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {claim.claimantInfo.email}
                            </span>
                            {claim.claimantInfo.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {claim.claimantInfo.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedClaimId(expandedClaimId === claim.id ? null : claim.id)}
                          className="text-blue-600 text-xs hover:underline"
                        >
                          {expandedClaimId === claim.id ? 'Hide' : 'View'} Details
                        </button>
                      </div>
                      
                      {expandedClaimId === claim.id && (
                        <div className="mt-3 pt-3 border-t space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500">Evidence Description:</label>
                            <p className="text-sm text-gray-700 mt-1">{claim.evidence.description}</p>
                          </div>
                          
                          {claim.evidence.images && claim.evidence.images.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-gray-500">Evidence Images:</label>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {claim.evidence.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={`/uploads/evidence/${img}`}
                                    alt={`Evidence ${idx + 1}`}
                                    className="w-full h-24 object-cover rounded"
                                    onError={(e) => { e.currentTarget.src = '/icons/icon-512x512.png'; }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {claim.claimantInfo.address.fullAddress && (
                            <div>
                              <label className="text-xs font-medium text-gray-500">Address:</label>
                              <p className="text-sm text-gray-700 mt-1">{claim.claimantInfo.address.fullAddress}</p>
                            </div>
                          )}
                          
                          {claim.reviewNotes && (
                            <div>
                              <label className="text-xs font-medium text-gray-500">Review Notes:</label>
                              <p className="text-sm text-gray-700 mt-1">{claim.reviewNotes}</p>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            Submitted: {new Date(claim.createdAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-2">Reporter</h2>
          <div className="text-sm text-gray-700">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /> {caseItem.reportedBy.name}</div>
            {caseItem.reportedBy.email && <div className="mt-1">{caseItem.reportedBy.email}</div>}
            <div className="mt-1 text-gray-500">Clerk ID: {caseItem.reportedBy.clerkId}</div>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Timestamps</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Created: {new Date(caseItem.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(caseItem.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



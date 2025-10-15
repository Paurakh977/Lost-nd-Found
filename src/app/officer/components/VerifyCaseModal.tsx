'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, User, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

interface Claim {
  id: string;
  claimantInfo: {
    name: string;
    email: string;
    phone?: string;
    address: any;
  };
  evidence: {
    description: string;
    images?: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface VerifyCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any) => void;
  case?: any;
}

export default function VerifyCaseModal({ isOpen, onClose, onConfirm, case: caseItem }: VerifyCaseModalProps) {
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [assignType, setAssignType] = useState<'itemAssignedTo' | 'foundBy'>('itemAssignedTo');
  const [assignee, setAssignee] = useState({
    name: '',
    contactInfo: ''
  });
  const [showAssignee, setShowAssignee] = useState(false);
  
  // Claims state
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  // Fetch claims when modal opens
  useEffect(() => {
    if (isOpen && caseItem?._id) {
      fetchClaims();
    }
  }, [isOpen, caseItem?._id]);

  const fetchClaims = async () => {
    if (!caseItem?._id) return;
    
    try {
      setClaimsLoading(true);
      const res = await fetch(`/api/cases/${caseItem._id}/claims`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        const allClaims = data.claims || [];
        
        // Merge legacy claimEvidence if exists and not in new claims
        if (caseItem.claimEvidence) {
          const legacyExists = allClaims.some(
            (c: Claim) => c.claimantInfo.email === caseItem.claimEvidence.claimantInfo.email
          );
          
          if (!legacyExists) {
            allClaims.unshift({
              id: 'legacy',
              claimantInfo: caseItem.claimEvidence.claimantInfo,
              evidence: {
                description: caseItem.claimEvidence.description,
                images: caseItem.claimEvidence.images || []
              },
              status: 'pending',
              createdAt: caseItem.claimEvidence.submittedAt || caseItem.createdAt
            });
          }
        }
        
        setClaims(allClaims);
        // Auto-select first pending claim
        const firstPending = allClaims.find((c: Claim) => c.status === 'pending');
        if (firstPending) {
          setSelectedClaimId(firstPending.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setClaimsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClaimId && claims.length > 0) {
      alert('Please select a claim to review');
      return;
    }
    
    if (!outcome.trim()) {
      alert('Outcome is required');
      return;
    }

    if (isVerified === null) {
      alert('Please select verification status');
      return;
    }

    const payload = {
      claimId: selectedClaimId,
      outcome: outcome.trim(),
      notes: notes.trim() || undefined,
      isVerified,
      ...(showAssignee && assignee.name && {
        assignType,
        assignee: {
          name: assignee.name.trim(),
          contactInfo: assignee.contactInfo.trim() || undefined
        }
      })
    };

    onConfirm(payload);
  };

  const handleClose = () => {
    setOutcome('');
    setNotes('');
    setIsVerified(null);
    setAssignee({ name: '', contactInfo: '' });
    setShowAssignee(false);
    setClaims([]);
    setSelectedClaimId(null);
    setExpandedClaimId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Verify Case</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {caseItem && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{caseItem.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{caseItem.description}</p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Reported by: {caseItem.reportedBy?.name} | {caseItem.location?.address}
            </div>
          </div>
        )}

        {/* Claims List Section */}
        {claimsLoading ? (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-300">Loading claims...</p>
          </div>
        ) : claims.length > 0 ? (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center justify-between">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
                All Claims ({claims.length})
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Select a claim to review</span>
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedClaimId === claim.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                  }`}
                  onClick={() => setSelectedClaimId(claim.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          checked={selectedClaimId === claim.id}
                          onChange={() => setSelectedClaimId(claim.id)}
                          className="mr-1"
                        />
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{claim.claimantInfo.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          claim.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          claim.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 ml-5">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedClaimId(expandedClaimId === claim.id ? null : claim.id);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs flex items-center gap-1"
                    >
                      {expandedClaimId === claim.id ? (
                        <><ChevronUp className="w-4 h-4" /> Hide</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> View</>
                      )}
                    </button>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedClaimId === claim.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Evidence:</label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{claim.evidence.description}</p>
                      </div>
                      
                      {claim.evidence.images && claim.evidence.images.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Images:</label>
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            {claim.evidence.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={`/uploads/evidence/${img}`}
                                alt={`Evidence ${idx + 1}`}
                                className="w-full h-20 object-cover rounded"
                                onError={(e) => { e.currentTarget.src = '/icons/icon-512x512.png'; }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {claim.claimantInfo.address?.fullAddress && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Address:</label>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{claim.claimantInfo.address.fullAddress}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Submitted: {new Date(claim.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">No claims have been submitted for this case yet.</p>
          </div>
        )}

        {/* Legacy Claim Evidence Section (if no new claims) */}
        {!claimsLoading && claims.length === 0 && caseItem?.claimEvidence && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Claim Evidence
            </h4>
            
            {/* Claimant Information */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Claimant Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-400 font-medium">Name:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-200">{caseItem.claimEvidence.claimantInfo.name}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-400 font-medium">Email:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-200">{caseItem.claimEvidence.claimantInfo.email}</span>
                </div>
                {caseItem.claimEvidence.claimantInfo.phone && (
                  <div>
                    <span className="text-blue-700 dark:text-blue-400 font-medium">Phone:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-200">{caseItem.claimEvidence.claimantInfo.phone}</span>
                  </div>
                )}
                {caseItem.claimEvidence.claimantInfo.address?.fullAddress && (
                  <div className="md:col-span-2">
                    <span className="text-blue-700 dark:text-blue-400 font-medium">Address:</span>
                    <span className="ml-2 text-blue-900 dark:text-blue-200">{caseItem.claimEvidence.claimantInfo.address.fullAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Description */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Evidence Description</h5>
              <p className="text-sm text-blue-900 dark:text-blue-200 bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                {caseItem.claimEvidence.description}
              </p>
            </div>

            {/* Evidence Images */}
            {caseItem.claimEvidence.images && caseItem.claimEvidence.images.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Evidence Images</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {caseItem.claimEvidence.images.map((image: string, index: number) => (
                    <div key={index} className="relative">
                      <img
                        src={`/uploads/evidence/${image}`}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.currentTarget.src = '/icons/icon-512x512.png';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
              Submitted on: {new Date(caseItem.claimEvidence.submittedAt).toLocaleString()}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Verification Status *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isVerified"
                  checked={isVerified === true}
                  onChange={() => setIsVerified(true)}
                  className="mr-2"
                />
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-green-700 dark:text-green-300 font-medium">Verified</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isVerified"
                  checked={isVerified === false}
                  onChange={() => setIsVerified(false)}
                  className="mr-2"
                />
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-1" />
                <span className="text-red-700 dark:text-red-300 font-medium">Not Verified</span>
              </label>
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Outcome *
            </label>
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Describe the verification outcome..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or observations..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          {/* Assignment Section */}
          {isVerified === true && (
            <div>
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={showAssignee}
                  onChange={(e) => setShowAssignee(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assign item to someone
                </span>
              </label>

              {showAssignee && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200 dark:border-blue-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assignment Type
                    </label>
                    <select
                      value={assignType}
                      onChange={(e) => setAssignType(e.target.value as 'itemAssignedTo' | 'foundBy')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="itemAssignedTo">Item Assigned To (Owner)</option>
                      <option value="foundBy">Found By (Finder)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={assignee.name}
                      onChange={(e) => setAssignee(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={showAssignee}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Information
                    </label>
                    <input
                      type="text"
                      value={assignee.contactInfo}
                      onChange={(e) => setAssignee(prev => ({ ...prev, contactInfo: e.target.value }))}
                      placeholder="Email or phone number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Complete Verification
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

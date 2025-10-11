'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, User, Mail, Phone } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!outcome.trim()) {
      alert('Outcome is required');
      return;
    }

    if (isVerified === null) {
      alert('Please select verification status');
      return;
    }

    const payload = {
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Verify Case</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {caseItem && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{caseItem.title}</h3>
            <p className="text-sm text-gray-600">{caseItem.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              Reported by: {caseItem.reportedBy?.name} | {caseItem.location?.address}
            </div>
          </div>
        )}

        {/* Claim Evidence Section */}
        {caseItem?.claimEvidence && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Claim Evidence
            </h4>
            
            {/* Claimant Information */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-blue-800 mb-2">Claimant Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Name:</span>
                  <span className="ml-2 text-blue-900">{caseItem.claimEvidence.claimantInfo.name}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Email:</span>
                  <span className="ml-2 text-blue-900">{caseItem.claimEvidence.claimantInfo.email}</span>
                </div>
                {caseItem.claimEvidence.claimantInfo.phone && (
                  <div>
                    <span className="text-blue-700 font-medium">Phone:</span>
                    <span className="ml-2 text-blue-900">{caseItem.claimEvidence.claimantInfo.phone}</span>
                  </div>
                )}
                {caseItem.claimEvidence.claimantInfo.address?.fullAddress && (
                  <div className="md:col-span-2">
                    <span className="text-blue-700 font-medium">Address:</span>
                    <span className="ml-2 text-blue-900">{caseItem.claimEvidence.claimantInfo.address.fullAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Description */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-blue-800 mb-2">Evidence Description</h5>
              <p className="text-sm text-blue-900 bg-white p-3 rounded border">
                {caseItem.claimEvidence.description}
              </p>
            </div>

            {/* Evidence Images */}
            {caseItem.claimEvidence.images && caseItem.claimEvidence.images.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-blue-800 mb-2">Evidence Images</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {caseItem.claimEvidence.images.map((image: string, index: number) => (
                    <div key={index} className="relative">
                      <img
                        src={`/uploads/evidence/${image}`}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src = '/icons/icon-512x512.png';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-blue-600">
              Submitted on: {new Date(caseItem.claimEvidence.submittedAt).toLocaleString()}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
                <CheckCircle className="w-5 h-5 text-green-600 mr-1" />
                <span className="text-green-700 font-medium">Verified</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isVerified"
                  checked={isVerified === false}
                  onChange={() => setIsVerified(false)}
                  className="mr-2"
                />
                <XCircle className="w-5 h-5 text-red-600 mr-1" />
                <span className="text-red-700 font-medium">Not Verified</span>
              </label>
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outcome *
            </label>
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Describe the verification outcome..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <span className="text-sm font-medium text-gray-700">
                  Assign item to someone
                </span>
              </label>

              {showAssignee && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Type
                    </label>
                    <select
                      value={assignType}
                      onChange={(e) => setAssignType(e.target.value as 'itemAssignedTo' | 'foundBy')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="itemAssignedTo">Item Assigned To (Owner)</option>
                      <option value="foundBy">Found By (Finder)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={assignee.name}
                      onChange={(e) => setAssignee(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={showAssignee}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Information
                    </label>
                    <input
                      type="text"
                      value={assignee.contactInfo}
                      onChange={(e) => setAssignee(prev => ({ ...prev, contactInfo: e.target.value }))}
                      placeholder="Email or phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete Verification
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCaseDetail } from '../../hooks/useCaseDetail';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, Package, Shield, CheckCircle, ArrowLeft } from 'lucide-react';

export default function CaseDetailPage() {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const { caseItem, loading, error } = useCaseDetail(params.caseId);

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

  const imageUrl = caseItem.images && caseItem.images.length > 0
    ? `/uploads/${caseItem.images[0]}`
    : '/icons/icon-512x512.png';

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button onClick={() => router.back()} className="mb-6 inline-flex items-center text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-white rounded-xl border p-6">
          <div className="flex items-start gap-4">
            <img src={imageUrl} alt={caseItem.title} className="w-24 h-24 rounded-lg object-cover"
                 onError={(e) => { e.currentTarget.src = '/icons/icon-512x512.png'; }} />
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



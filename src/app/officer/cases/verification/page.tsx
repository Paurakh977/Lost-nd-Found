'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Search, Filter, ArrowLeft } from 'lucide-react';
import { CaseItem } from '../../types';
import { useVerificationCases } from '../../hooks/useVerificationCases';
import { useVerifyCase } from '../../hooks/useVerifyCase';
import { useToast } from '@/hooks/useToast';
import { CaseCard } from '../../components/CaseCard';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import VerifyCaseModal from '../../components/VerifyCaseModal';
import CaseDetailModal from '../../../../components/CaseDetailModal';

export default function VerificationCasesPage() {
  const router = useRouter();
  const { pushToast, removeToast, toasts } = useToast();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [verifyForCase, setVerifyForCase] = useState<CaseItem | null>(null);

  const { cases, loading, error, pagination, refetch } = useVerificationCases(
    currentPage,
    10,
    searchTerm,
    sortBy,
    sortOrder
  );

  const { verifyCase } = useVerifyCase();

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleVerify = async (payload: any) => {
    if (!verifyForCase) return;
    
    const res = await verifyCase(verifyForCase._id, payload);
    if (res.success) {
      pushToast('success', 'Case Verified', 'The verification has been completed successfully.');
      setVerifyForCase(null);
      await refetch();
      window.dispatchEvent(new Event('officer:refresh-stats'));
    } else {
      pushToast('error', 'Verification Failed', res.error || 'Failed to verify case');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Verification Cases</h1>
                  <p className="text-sm text-gray-500">Review and verify item ownership claims</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Search and Filters */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search cases by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="reportedTime">Reported Time</option>
                  <option value="urgencyLevel">Priority</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Cases List */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Verification Cases ({pagination?.total || 0})
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Cases requiring ownership verification
              </p>
            </div>

            <div>
              {loading ? (
                <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>
              ) : error ? (
                <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
              ) : cases.length === 0 ? (
                <div className="p-6">
                  <EmptyState 
                    type="general" 
                    message="No verification cases assigned to you." 
                  />
                </div>
              ) : (
                cases.map((caseItem: CaseItem, index: number) => (
                  <CaseCard
                    key={caseItem._id}
                    case={caseItem}
                    showAssignButton={false}
                    showResolveButton={false}
                    showVerifyButton={true}
                    onVerifyClick={(caseItem: CaseItem) => setVerifyForCase(caseItem)}
                    index={index}
                    onViewDetails={(id: string) => { 
                      const c = cases.find((x: CaseItem) => x._id === id); 
                      setSelectedCase(c || null); 
                    }}
                  />
                ))
              )}
            </div>

            {pagination && (
              <div className="p-6 border-t">
                <Pagination pagination={pagination} onPageChange={goToPage} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Modals */}
        <CaseDetailModal 
          case={selectedCase} 
          isOpen={!!selectedCase} 
          onClose={() => setSelectedCase(null)} 
        />

        <VerifyCaseModal
          isOpen={!!verifyForCase}
          onClose={() => setVerifyForCase(null)}
          onConfirm={handleVerify}
          case={verifyForCase}
        />

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
    </div>
  );
}

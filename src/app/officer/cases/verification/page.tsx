'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Search, Package, ArrowLeft } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'resolved'>('all');
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [verifyForCase, setVerifyForCase] = useState<CaseItem | null>(null);

  const { cases, loading, error, pagination, refetch } = useVerificationCases(
    currentPage,
    10,
    searchTerm,
    'createdAt',
    'desc'
  );

  const { verifyCase } = useVerifyCase();

  // Filter cases by status
  const filteredCases = statusFilter === 'all' 
    ? cases 
    : cases.filter(c => c.status === statusFilter);

  const goToPage = (page: number) => {
    setCurrentPage(page);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 relative z-10"
      >
        <div className="flex items-center gap-4 mb-4">
          <motion.button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push('/officer/dashboard');
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 group cursor-pointer relative z-20"
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{ pointerEvents: 'auto' }}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Dashboard</span>
          </motion.button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Verification Cases</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cases requiring ownership verification</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
      >
        {/* Search and Filters */}
        <div className="p-4 flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search verification cases..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 px-2">
            <Shield className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'active' | 'resolved')}
              className="py-1.5 pl-1 pr-6 bg-transparent text-xs text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">All Status</option>
              <option value="pending" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Pending</option>
              <option value="active" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Active</option>
              <option value="resolved" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Resolved</option>
            </select>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : error ? (
            <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
          ) : filteredCases.length === 0 ? (
            <div className="p-6">
              <EmptyState 
                type="general" 
                message="No verification cases assigned to you." 
              />
            </div>
          ) : (
            filteredCases.map((caseItem: CaseItem, index: number) => (
              <CaseCard
                key={caseItem._id}
                case={caseItem}
                showAssignButton={false}
                showResolveButton={false}
                showVerifyButton={true}
                onVerifyClick={(caseItem: CaseItem) => setVerifyForCase(caseItem)}
                index={index}
                onViewDetails={(id: string) => { 
                  const c = filteredCases.find((x: CaseItem) => x._id === id); 
                  setSelectedCase(c || null); 
                }}
              />
            ))
          )}
        </div>

        {pagination && (
          <Pagination pagination={pagination} onPageChange={goToPage} />
        )}
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
  );
}

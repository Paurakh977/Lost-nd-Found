'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMyActiveCases } from '../../hooks/useMyActiveCases';
import { CaseCard } from '../../components/CaseCard';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { Search, Package, ArrowLeft, Activity } from 'lucide-react';
import CaseDetailModal from '../../../../components/CaseDetailModal';
import { useResolveCase } from '../../hooks/useResolveCase';
import { ToastContainer } from '../../../../components/Toast';
import type { ToastType } from '../../../../components/Toast';
import ResolveCaseModal from '../../components/ResolveCaseModal';
import type { CaseItem } from '../../types';
import { useRouter } from 'next/navigation';

export default function MyActiveCasesPage() {
  const router = useRouter();
  const { cases, pagination, loading, error, filters, setFilters, goToPage, refetch } = useMyActiveCases(1, 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const { resolveCase } = useResolveCase();
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; title: string; message?: string }>>([]);
  const pushToast = (type: ToastType, title: string, message?: string) => { const id = Math.random().toString(36).slice(2); setToasts((p) => [...p, { id, type, title, message }]); };
  const removeToast = (id: string) => setToasts((p) => p.filter(t => t.id !== id));
  const [resolveForCase, setResolveForCase] = useState<CaseItem | null>(null);

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
              console.log('Button clicked!');
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
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Active Cases</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cases currently assigned to you</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
      >
        <div className="p-4 flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setFilters({ ...filters, search: e.target.value }); }}
              placeholder="Search my cases..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 px-2">
            <Package className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as 'all' | 'lost' | 'found' | 'verification' })}
              className="py-1.5 pl-1 pr-6 bg-transparent text-xs text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">All Types</option>
              <option value="lost" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Lost</option>
              <option value="found" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Found</option>
              <option value="verification" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Verification</option>
            </select>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : error ? (
            <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
          ) : cases.length === 0 ? (
            <div className="p-6"><EmptyState type="general" message="No active cases assigned to you." /></div>
          ) : (
            cases.map((caseItem, index) => (
              <CaseCard
                key={caseItem._id}
                case={caseItem}
                showAssignButton={false}
                showResolveButton={true}
                onResolveClick={(caseItem) => setResolveForCase(caseItem)}
                index={index}
                onViewDetails={(id) => { const c = cases.find(x => x._id === id); setSelectedCase(c || null); }}
              />
            ))
          )}
        </div>

        {pagination && (
          <Pagination pagination={pagination} onPageChange={goToPage} />
        )}
      </motion.div>
      <CaseDetailModal case={selectedCase} isOpen={!!selectedCase} onClose={() => setSelectedCase(null)} />
      <ResolveCaseModal
        isOpen={!!resolveForCase}
        onClose={() => setResolveForCase(null)}
        onConfirm={async (payload) => {
          if (!resolveForCase) return;
          const res = await resolveCase(resolveForCase._id, payload);
          if (res.success) {
            pushToast('success', 'Case resolved', 'The case was marked as resolved successfully.');
            setResolveForCase(null);
            // Refresh the list and stats
            await refetch();
            window.dispatchEvent(new Event('officer:refresh-stats'));
          } else {
            pushToast('error', 'Resolve failed', res.error);
          }
        }}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}



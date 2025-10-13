'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Package } from 'lucide-react';
import { useUnassignedCases } from '../hooks/useUnassignedCases';
import { CaseCard } from './CaseCard';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import CaseDetailModal from '../../../components/CaseDetailModal';
import type { ToastType } from '../../../components/Toast';

interface UnassignedCasesPanelProps {
  onToast?: (type: ToastType, title: string, message?: string) => void;
}

export default function UnassignedCasesPanel({ onToast }: UnassignedCasesPanelProps) {
  const { cases, pagination, loading, filters, setFilters, goToPage, removeCase } = useUnassignedCases(1, 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<'all' | 'lost' | 'found' | 'verification'>('all');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  return (
    <motion.div
      className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 dark:border-gray-700 overflow-hidden"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Unassigned Cases</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <div className="relative w-full sm:w-64 mb-2 sm:mb-0">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setFilters({ ...filters, search: e.target.value }); }}
                placeholder="Search cases..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/70 rounded-md border border-gray-100 dark:border-gray-600 px-2">
                <Package className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <select
                  value={activityTypeFilter}
                  onChange={(e) => { setActivityTypeFilter(e.target.value as any); setFilters({ ...filters, type: e.target.value as any }); }}
                  className="py-1.5 pl-1 pr-6 bg-transparent text-xs text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">All Types</option>
                  <option value="lost" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Lost Items</option>
                  <option value="found" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Found Items</option>
                  <option value="verification" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Verification</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : cases.length === 0 ? (
          <div className="p-6">
            <EmptyState type={searchQuery ? 'search' : 'unassigned'} />
          </div>
        ) : (
          cases.map((caseItem, index) => (
            <CaseCard
              key={caseItem._id}
              case={caseItem}
              onAssignSuccess={(id) => { 
                removeCase(id); 
                onToast?.('success', 'Case assigned', 'The case was assigned to you successfully.'); 
                window.dispatchEvent(new Event('officer:refresh-stats')); 
              }}
              onViewDetails={(id) => { const c = cases.find(x => x._id === id); setSelectedCase(c); }}
              onAssignError={(msg) => { onToast?.('error', 'Assignment failed', msg); }}
              index={index}
            />
          ))
        )}
      </div>
      {pagination && (
        <Pagination pagination={pagination} onPageChange={goToPage} />
      )}

      <CaseDetailModal case={selectedCase} isOpen={!!selectedCase} onClose={() => setSelectedCase(null)} />
    </motion.div>
  );
}



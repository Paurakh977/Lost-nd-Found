'use client';

import React, { useState } from 'react';
import { useMyActiveCases } from '../../hooks/useMyActiveCases';
import { CaseCard } from '../../components/CaseCard';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { Search, Package } from 'lucide-react';
import CaseDetailModal from '../../../../components/CaseDetailModal';
import { useResolveCase } from '../../hooks/useResolveCase';
import { ToastContainer } from '../../../../components/Toast';
import type { ToastType } from '../../../../components/Toast';
import ResolveCaseModal from '../../components/ResolveCaseModal';

export default function MyActiveCasesPage() {
  const { cases, pagination, loading, error, filters, setFilters, goToPage, refetch } = useMyActiveCases(1, 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const { resolveCase } = useResolveCase();
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; title: string; message?: string }>>([]);
  const pushToast = (type: ToastType, title: string, message?: string) => { const id = Math.random().toString(36).slice(2); setToasts((p) => [...p, { id, type, title, message }]); };
  const removeToast = (id: string) => setToasts((p) => p.filter(t => t.id !== id));
  const [resolveForCase, setResolveForCase] = useState<any | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Active Cases</h1>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setFilters({ ...filters, search: e.target.value }); }}
              placeholder="Search my cases..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-50 rounded-md border border-gray-100">
            <Package className="w-3.5 h-3.5 text-gray-400 ml-2" />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
              className="py-1.5 pl-1 pr-6 bg-transparent text-xs text-gray-600 focus:outline-none appearance-none"
              style={{ backgroundPosition: 'right 0.25rem center', backgroundSize: '0.75em 0.75em' }}
            >
              <option value="all">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
              <option value="verification">Verification</option>
            </select>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="p-6 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
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
                onViewDetails={(id) => { const c = cases.find(x => x._id === id); setSelectedCase(c); }}
              />
            ))
          )}
        </div>

        {pagination && (
          <Pagination pagination={pagination} onPageChange={goToPage} />
        )}
      </div>
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



'use client';

import React, { useState } from 'react';
import { useMyResolvedCases } from '../../hooks/useMyResolvedCases';
import { CaseCard } from '../../components/CaseCard';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { Search, Package, CheckCircle } from 'lucide-react';
import CaseDetailModal from '../../../../components/CaseDetailModal';

export default function MyResolvedCasesPage() {
  const { cases, pagination, loading, error, filters, setFilters, goToPage } = useMyResolvedCases(1, 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Resolved Cases</h1>
            <p className="text-sm text-gray-600">Cases you have successfully resolved</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setFilters({ ...filters, search: e.target.value }); }}
              placeholder="Search resolved cases..."
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
            <div className="p-6">
              <EmptyState 
                type="general" 
                message={searchQuery ? "No resolved cases match your search." : "No resolved cases yet. Cases you resolve will appear here."} 
              />
            </div>
          ) : (
            cases.map((caseItem, index) => (
              <CaseCard
                key={caseItem._id}
                case={caseItem}
                showAssignButton={false}
                showResolveButton={false}
                index={index}
                onViewDetails={(id) => { const c = cases.find(x => x._id === id); setSelectedCase(c); }}
              />
            ))
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <Pagination pagination={pagination} onPageChange={goToPage} />
        )}
      </div>

      <CaseDetailModal case={selectedCase} isOpen={!!selectedCase} onClose={() => setSelectedCase(null)} />
    </div>
  );
}



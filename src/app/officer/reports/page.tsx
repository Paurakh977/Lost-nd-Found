'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  Download,
  Filter,
  X,
  ChevronDown,
  Calendar,
  Search,
  Loader2,
  CheckCircle,
  Package,
  Shield,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OfficerReportFilters, OfficerCaseReportData, OfficerClaimReportData } from '../../../types/reports';
import {
  generateOfficerCaseReport,
  downloadExcel,
  OFFICER_CASE_COLUMNS,
  OFFICER_CLAIM_COLUMNS,
} from '../../../lib/excel-export';
import { ToastContainer, ToastType } from '../../../components/Toast';
import { format } from 'date-fns';

export default function OfficerReportsPage() {
  const router = useRouter();
  
  // State management
  const [cases, setCases] = useState<OfficerCaseReportData[]>([]);
  const [claims, setClaims] = useState<OfficerClaimReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; title: string; message?: string }>>([]);
  const [officer, setOfficer] = useState<any>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Column selection
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedCaseColumns, setSelectedCaseColumns] = useState<Set<string>>(new Set());
  const [selectedClaimColumns, setSelectedClaimColumns] = useState<Set<string>>(new Set());
  
  // Filters
  const [filters, setFilters] = useState<OfficerReportFilters>({
    caseType: 'all',
    caseStatus: 'all',
    claimStatus: 'all',
    caseCreatedFrom: '',
    caseCreatedTo: '',
    reportedTimeFrom: '',
    reportedTimeTo: '',
  });

  const pushToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initialize selected columns (all checked by default)
  useEffect(() => {
    setSelectedCaseColumns(new Set(OFFICER_CASE_COLUMNS.map(col => col.key)));
    setSelectedClaimColumns(new Set(OFFICER_CLAIM_COLUMNS.map(col => col.key)));
  }, []);

  // Toggle column selection
  const toggleCaseColumn = (columnKey: string) => {
    const column = OFFICER_CASE_COLUMNS.find(col => col.key === columnKey);
    if (column?.alwaysIncluded) return;
    
    const newSelection = new Set(selectedCaseColumns);
    if (newSelection.has(columnKey)) {
      newSelection.delete(columnKey);
    } else {
      newSelection.add(columnKey);
    }
    setSelectedCaseColumns(newSelection);
  };

  const toggleClaimColumn = (columnKey: string) => {
    const column = OFFICER_CLAIM_COLUMNS.find(col => col.key === columnKey);
    if (column?.alwaysIncluded) return;
    
    const newSelection = new Set(selectedClaimColumns);
    if (newSelection.has(columnKey)) {
      newSelection.delete(columnKey);
    } else {
      newSelection.add(columnKey);
    }
    setSelectedClaimColumns(newSelection);
  };

  const selectAllCaseColumns = () => {
    setSelectedCaseColumns(new Set(OFFICER_CASE_COLUMNS.map(col => col.key)));
  };

  const deselectAllCaseColumns = () => {
    const alwaysIncluded = OFFICER_CASE_COLUMNS.filter(col => col.alwaysIncluded).map(col => col.key);
    setSelectedCaseColumns(new Set(alwaysIncluded));
  };

  const selectAllClaimColumns = () => {
    setSelectedClaimColumns(new Set(OFFICER_CLAIM_COLUMNS.map(col => col.key)));
  };

  const deselectAllClaimColumns = () => {
    const alwaysIncluded = OFFICER_CLAIM_COLUMNS.filter(col => col.alwaysIncluded).map(col => col.key);
    setSelectedClaimColumns(new Set(alwaysIncluded));
  };

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const params = new URLSearchParams();
      
      if (filters.caseType && filters.caseType !== 'all') params.append('caseType', filters.caseType);
      if (filters.caseStatus && filters.caseStatus !== 'all') params.append('caseStatus', filters.caseStatus);
      if (filters.claimStatus && filters.claimStatus !== 'all') params.append('claimStatus', filters.claimStatus);
      if (filters.caseCreatedFrom) params.append('caseCreatedFrom', filters.caseCreatedFrom);
      if (filters.caseCreatedTo) params.append('caseCreatedTo', filters.caseCreatedTo);
      if (filters.reportedTimeFrom) params.append('reportedTimeFrom', filters.reportedTimeFrom);
      if (filters.reportedTimeTo) params.append('reportedTimeTo', filters.reportedTimeTo);
      params.append('page', '1');
      params.append('limit', '1000'); // Fetch all for report

      const response = await fetch(`/api/officer/reports?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCases(data.data.cases || []);
        setClaims(data.data.claims || []);
        setOfficer(data.officer);
        setTotalRecords(data.data.cases.length);
        pushToast('success', 'Report Generated', `Loaded ${data.data.cases.length} cases and ${data.data.claims.length} claims`);
      } else {
        const error = await response.json();
        pushToast('error', 'Failed to Generate Report', error.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      pushToast('error', 'Error', 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Handle export to Excel
  const handleExport = (selectedOnly: boolean = false) => {
    try {
      const casesToExport = selectedOnly 
        ? cases.filter(c => selectedCases.has(c._id)) 
        : cases;
      
      const caseIds = new Set(casesToExport.map(c => c._id));
      const claimsToExport = claims.filter(cl => caseIds.has(cl.caseId.toString()));

      if (casesToExport.length === 0) {
        pushToast('error', 'No Data', 'No cases available to export');
        return;
      }

      const filtersSummary = formatFilters(filters);
      const filename = `officer_report_${officer?.firstName || 'officer'}`;

      const workbook = generateOfficerCaseReport(
        casesToExport,
        claimsToExport,
        selectedCaseColumns,
        selectedClaimColumns,
        {
          filename,
          sheetName: 'Officer Reports',
          includeTimestamp: true,
          includeFilters: true,
          filtersSummary,
          officer,
        }
      );

      downloadExcel(workbook, filename, true);
      pushToast('success', 'Export Successful', `Downloaded ${casesToExport.length} cases and ${claimsToExport.length} claims`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      pushToast('error', 'Export Failed', 'Failed to export data to Excel');
    }
  };

  const formatFilters = (filters: OfficerReportFilters): string => {
    const parts: string[] = [];
    if (filters.caseType && filters.caseType !== 'all') parts.push(`Case Type: ${filters.caseType}`);
    if (filters.caseStatus && filters.caseStatus !== 'all') parts.push(`Case Status: ${filters.caseStatus}`);
    if (filters.claimStatus && filters.claimStatus !== 'all') parts.push(`Claim Status: ${filters.claimStatus}`);
    if (filters.caseCreatedFrom) parts.push(`Created From: ${filters.caseCreatedFrom}`);
    if (filters.caseCreatedTo) parts.push(`Created To: ${filters.caseCreatedTo}`);
    if (filters.reportedTimeFrom) parts.push(`Reported From: ${filters.reportedTimeFrom}`);
    if (filters.reportedTimeTo) parts.push(`Reported To: ${filters.reportedTimeTo}`);
    return parts.length > 0 ? parts.join(' | ') : 'No filters applied';
  };

  // Toggle case selection
  const toggleCaseSelection = (caseId: string) => {
    const newSelection = new Set(selectedCases);
    if (newSelection.has(caseId)) {
      newSelection.delete(caseId);
    } else {
      newSelection.add(caseId);
    }
    setSelectedCases(newSelection);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const currentPageCases = paginatedCases.map(c => c._id);
    const allSelected = currentPageCases.every(id => selectedCases.has(id));
    
    const newSelection = new Set(selectedCases);
    if (allSelected) {
      currentPageCases.forEach(id => newSelection.delete(id));
    } else {
      currentPageCases.forEach(id => newSelection.add(id));
    }
    setSelectedCases(newSelection);
  };

  // Toggle case expansion
  const toggleCaseExpansion = (caseId: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(caseId)) {
      newExpanded.delete(caseId);
    } else {
      newExpanded.add(caseId);
    }
    setExpandedCases(newExpanded);
  };

  // Paginated data
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return cases.slice(startIndex, endIndex);
  }, [cases, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  // Get claims for a case
  const getClaimsForCase = (caseId: string) => {
    return claims.filter(claim => claim.caseId.toString() === caseId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              onClick={() => router.push('/officer/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </motion.button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Case Reports</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate and export reports for your assigned cases</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Panel */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-6 space-y-4"
              >
                {/* Case Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Package className="w-4 h-4 inline mr-1" />
                      Case Type
                    </label>
                    <select
                      value={filters.caseType}
                      onChange={(e) => setFilters(prev => ({ ...prev, caseType: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                      <option value="verification">Verification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Status</label>
                    <select
                      value={filters.caseStatus}
                      onChange={(e) => setFilters(prev => ({ ...prev, caseStatus: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Claim Status</label>
                    <select
                      value={filters.claimStatus}
                      onChange={(e) => setFilters(prev => ({ ...prev, claimStatus: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Claims</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Date Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Case Created From
                      </label>
                      <input
                        type="date"
                        value={filters.caseCreatedFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, caseCreatedFrom: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                      <input
                        type="date"
                        value={filters.caseCreatedTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, caseCreatedTo: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Reported Time From
                      </label>
                      <input
                        type="date"
                        value={filters.reportedTimeFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, reportedTimeFrom: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                      <input
                        type="date"
                        value={filters.reportedTimeTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, reportedTimeTo: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={fetchReportData}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Generate Report
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setFilters({
                        caseType: 'all',
                        caseStatus: 'all',
                        claimStatus: 'all',
                        caseCreatedFrom: '',
                        caseCreatedTo: '',
                        reportedTimeFrom: '',
                        reportedTimeTo: '',
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Column Selector and Export Actions */}
        {cases.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCases.size > 0 ? (
                  `${selectedCases.size} case${selectedCases.size !== 1 ? 's' : ''} selected`
                ) : (
                  `Showing ${cases.length} case${cases.length !== 1 ? 's' : ''} with ${claims.length} claim${claims.length !== 1 ? 's' : ''}`
                )}
              </div>

              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                {showColumnSelector ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showColumnSelector ? 'Hide' : 'Customize'} Columns
              </button>
            </div>

            {/* Column Selector Modal */}
            <AnimatePresence>
              {showColumnSelector && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Columns for Excel Export</h3>
                    
                    {/* Case Columns */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">Case Columns</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={selectAllCaseColumns}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            Select All
                          </button>
                          <span className="text-gray-400">|</span>
                          <button
                            onClick={deselectAllCaseColumns}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {OFFICER_CASE_COLUMNS.map((column) => (
                          <label
                            key={column.key}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                              column.alwaysIncluded
                                ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                                : selectedCaseColumns.has(column.key)
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-500'
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCaseColumns.has(column.key)}
                              onChange={() => toggleCaseColumn(column.key)}
                              disabled={column.alwaysIncluded}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                            />
                            <span className={`text-sm font-medium ${
                              column.alwaysIncluded
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {column.label}
                              {column.alwaysIncluded && <span className="text-xs ml-1">(Required)</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Claim Columns */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">Claim Columns</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={selectAllClaimColumns}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            Select All
                          </button>
                          <span className="text-gray-400">|</span>
                          <button
                            onClick={deselectAllClaimColumns}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {OFFICER_CLAIM_COLUMNS.map((column) => (
                          <label
                            key={column.key}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                              column.alwaysIncluded
                                ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                                : selectedClaimColumns.has(column.key)
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-500'
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedClaimColumns.has(column.key)}
                              onChange={() => toggleClaimColumn(column.key)}
                              disabled={column.alwaysIncluded}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                            />
                            <span className={`text-sm font-medium ${
                              column.alwaysIncluded
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {column.label}
                              {column.alwaysIncluded && <span className="text-xs ml-1">(Required)</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCases.size > 0 && `${selectedCases.size} case${selectedCases.size !== 1 ? 's' : ''} selected`}
              </div>

              <div className="flex gap-3">
                {selectedCases.size > 0 && (
                  <button
                    onClick={() => handleExport(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Selected ({selectedCases.size})
                  </button>
                )}

                <button
                  onClick={() => handleExport(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export All to Excel
                </button>
              </div>
            </div>
          </>
        )}

        {/* Data Table */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading report data...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center justify-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Configure your filters above and click "Generate Report" to view data
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={paginatedCases.length > 0 && paginatedCases.every(c => selectedCases.has(c._id))}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Case</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reported</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Claims</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedCases.map((caseItem, index) => {
                    const caseClaims = getClaimsForCase(caseItem._id);
                    const isExpanded = expandedCases.has(caseItem._id);
                    
                    return (
                      <React.Fragment key={caseItem._id}>
                        <motion.tr
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedCases.has(caseItem._id)}
                              onChange={() => toggleCaseSelection(caseItem._id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{caseItem.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{caseItem._id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                              caseItem.type === 'lost' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                              caseItem.type === 'found' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                              'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                            }`}>
                              {caseItem.type === 'lost' ? <Package className="w-3 h-3" /> : 
                               caseItem.type === 'found' ? <CheckCircle className="w-3 h-3" /> :
                               <Shield className="w-3 h-3" />}
                              {caseItem.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              caseItem.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                              caseItem.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(caseItem.reportedTime), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {caseItem.claimsCount || 0}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleCaseExpansion(caseItem._id)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                            >
                              {isExpanded ? 'Hide' : 'View'} Details
                            </button>
                          </td>
                        </motion.tr>
                        
                        {/* Expanded Row with Claims */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Case Details</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Description:</span>
                                      <p className="text-gray-900 dark:text-white">{caseItem.description}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                      <p className="text-gray-900 dark:text-white">{caseItem.location.address}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Reported By:</span>
                                      <p className="text-gray-900 dark:text-white">{caseItem.reportedBy.name}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Item Category:</span>
                                      <p className="text-gray-900 dark:text-white">{caseItem.itemDetails.category || 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                {caseClaims.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                      Related Claims ({caseClaims.length})
                                    </h4>
                                    <div className="space-y-2">
                                      {caseClaims.map((claim) => (
                                        <div key={claim._id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {claim.claimantInfo.name}
                                              </p>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {claim.claimantInfo.email}
                                              </p>
                                            </div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                              claim.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                              claim.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                                              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                            }`}>
                                              {claim.status}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      First
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

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
  MapPin,
  Shield,
  Building,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  ArrowLeft,
  Search,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OfficerReportData, InstitutionalUserData, ReportFilters } from '../../../types/reports';
import { 
  generateOfficerReport, 
  generateInstitutionalReport, 
  downloadExcel,
  formatFiltersForExcel 
} from '../../../lib/excel-export';
import { ToastContainer, ToastType } from '../../../components/Toast';
import { format } from 'date-fns';

type ReportType = 'officer' | 'institutional';

export default function AdminReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType>('officer');
  const [officerData, setOfficerData] = useState<OfficerReportData[]>([]);
  const [institutionalData, setInstitutionalData] = useState<InstitutionalUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; title: string; message?: string }>>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Column selection for Excel export
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());

  // Filters state
  const [filters, setFilters] = useState<ReportFilters>({
    province: '',
    district: '',
    municipality: '',
    ward: '',
    departments: [],
    institutions: [],
    isActive: undefined,
    dateFrom: '',
    dateTo: '',
    minResolutionRate: undefined,
    maxResolutionRate: undefined,
    minCasesResolved: undefined,
    maxCasesResolved: undefined,
  });

  // Address data for cascading selects
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [addressData, setAddressData] = useState<any>(null);

  // Departments and institutions for multi-select
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableInstitutions, setAvailableInstitutions] = useState<string[]>([]);

  const pushToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Define available columns for each report type
  const officerColumns = [
    { key: 'serialNumber', label: 'S.N.', alwaysIncluded: true },
    { key: 'firstName', label: 'First Name', alwaysIncluded: true },
    { key: 'lastName', label: 'Last Name', alwaysIncluded: true },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'status', label: 'Status' },
    { key: 'province', label: 'Province' },
    { key: 'district', label: 'District' },
    { key: 'municipality', label: 'Municipality' },
    { key: 'ward', label: 'Ward' },
    { key: 'accountCreated', label: 'Account Created' },
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'totalCases', label: 'Total Cases Assigned' },
    { key: 'activeCases', label: 'Active Cases' },
    { key: 'resolvedCases', label: 'Resolved Cases' },
    { key: 'pendingCases', label: 'Pending Cases' },
    { key: 'lostCases', label: 'Lost Cases' },
    { key: 'foundCases', label: 'Found Cases' },
    { key: 'verificationCases', label: 'Verification Cases' },
    { key: 'resolutionRate', label: 'Resolution Rate (%)' },
    { key: 'avgResolutionTime', label: 'Avg Resolution Time (days)' },
    { key: 'resolvedThisWeek', label: 'Resolved This Week' },
    { key: 'resolvedThisMonth', label: 'Resolved This Month' },
    { key: 'claimsReviewed', label: 'Claims Reviewed' },
    { key: 'claimsApproved', label: 'Claims Approved' },
    { key: 'claimsRejected', label: 'Claims Rejected' },
    { key: 'claimsPending', label: 'Claims Pending' },
  ];

  const institutionalColumns = [
    { key: 'serialNumber', label: 'S.N.', alwaysIncluded: true },
    { key: 'firstName', label: 'First Name', alwaysIncluded: true },
    { key: 'lastName', label: 'Last Name', alwaysIncluded: true },
    { key: 'email', label: 'Email' },
    { key: 'institutionName', label: 'Institution Name' },
    { key: 'status', label: 'Status' },
    { key: 'province', label: 'Province' },
    { key: 'district', label: 'District' },
    { key: 'municipality', label: 'Municipality' },
    { key: 'ward', label: 'Ward' },
    { key: 'accountCreated', label: 'Account Created' },
    { key: 'totalCasesReported', label: 'Total Cases Reported' },
    { key: 'lostCases', label: 'Lost Cases' },
    { key: 'foundCases', label: 'Found Cases' },
    { key: 'verificationCases', label: 'Verification Cases' },
    { key: 'activeCases', label: 'Active Cases' },
    { key: 'pendingCases', label: 'Pending Cases' },
    { key: 'resolvedCases', label: 'Resolved Cases' },
    { key: 'totalClaimsFiled', label: 'Total Claims Filed' },
    { key: 'claimsApproved', label: 'Claims Approved' },
    { key: 'claimsRejected', label: 'Claims Rejected' },
    { key: 'claimsPending', label: 'Claims Pending' },
  ];

  // Initialize selected columns (all checked by default)
  useEffect(() => {
    const columns = reportType === 'officer' ? officerColumns : institutionalColumns;
    setSelectedColumns(new Set(columns.map(col => col.key)));
  }, [reportType]);

  // Load address data on mount
  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const [provincesRes, districtsRes, provinceDistrictsRes, districtMunicipalitiesRes, municipalityWardsRes] = await Promise.all([
          fetch('/address/all-provinces.json').then(res => res.json()),
          fetch('/address/all-districts.json').then(res => res.json()),
          fetch('/address/map-province-districts.json').then(res => res.json()),
          fetch('/address/map-districts-municipalities.json').then(res => res.json()),
          fetch('/address/map-municipalities-wards.json').then(res => res.json()),
        ]);

        setProvinces(provincesRes);
        setAddressData({
          districts: districtsRes,
          provinceDistricts: provinceDistrictsRes,
          districtMunicipalities: districtMunicipalitiesRes,
          municipalityWards: municipalityWardsRes,
        });
      } catch (error) {
        console.error('Error loading address data:', error);
      }
    };

    loadAddressData();
  }, []);

  // Update cascading address selects
  useEffect(() => {
    if (filters.province && addressData?.provinceDistricts) {
      setDistricts(addressData.provinceDistricts[filters.province] || []);
    } else {
      setDistricts([]);
    }
  }, [filters.province, addressData]);

  useEffect(() => {
    if (filters.district && addressData?.districtMunicipalities) {
      setMunicipalities(addressData.districtMunicipalities[filters.district] || []);
    } else {
      setMunicipalities([]);
    }
  }, [filters.district, addressData]);

  useEffect(() => {
    if (filters.municipality && addressData?.municipalityWards) {
      setWards(addressData.municipalityWards[filters.municipality] || []);
    } else {
      setWards([]);
    }
  }, [filters.municipality, addressData]);

  // Fetch departments or institutions for filters
  useEffect(() => {
    fetchFilterOptions();
  }, [reportType]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`/api/admin/users?role=${reportType}&limit=1000`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (reportType === 'officer') {
          const depts = [...new Set(data.users.map((u: any) => u.department).filter(Boolean))];
          setAvailableDepartments(depts);
        } else {
          const insts = [...new Set(data.users.map((u: any) => u.institutionName).filter(Boolean))];
          setAvailableInstitutions(insts);
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Toggle column selection
  const toggleColumn = (columnKey: string) => {
    const columns = reportType === 'officer' ? officerColumns : institutionalColumns;
    const column = columns.find(col => col.key === columnKey);
    
    // Don't allow toggling always-included columns
    if (column?.alwaysIncluded) return;
    
    const newSelection = new Set(selectedColumns);
    if (newSelection.has(columnKey)) {
      newSelection.delete(columnKey);
    } else {
      newSelection.add(columnKey);
    }
    setSelectedColumns(newSelection);
  };

  const selectAllColumns = () => {
    const columns = reportType === 'officer' ? officerColumns : institutionalColumns;
    setSelectedColumns(new Set(columns.map(col => col.key)));
  };

  const deselectAllColumns = () => {
    const columns = reportType === 'officer' ? officerColumns : institutionalColumns;
    const alwaysIncluded = columns.filter(col => col.alwaysIncluded).map(col => col.key);
    setSelectedColumns(new Set(alwaysIncluded));
  };

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1); // Reset to page 1 on new fetch
    try {
      const params = new URLSearchParams({
        type: reportType,
      });

      // Add filters to query
      if (filters.province) params.append('province', filters.province);
      if (filters.district) params.append('district', filters.district);
      if (filters.municipality) params.append('municipality', filters.municipality);
      if (filters.ward) params.append('ward', filters.ward);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      if (reportType === 'officer') {
        if (filters.departments && filters.departments.length > 0) {
          params.append('departments', filters.departments.join(','));
        }
        if (filters.minResolutionRate !== undefined) params.append('minResolutionRate', filters.minResolutionRate.toString());
        if (filters.maxResolutionRate !== undefined) params.append('maxResolutionRate', filters.maxResolutionRate.toString());
        if (filters.minCasesResolved !== undefined) params.append('minCasesResolved', filters.minCasesResolved.toString());
        if (filters.maxCasesResolved !== undefined) params.append('maxCasesResolved', filters.maxCasesResolved.toString());
        if (filters.minActiveCases !== undefined) params.append('minActiveCases', filters.minActiveCases.toString());
        if (filters.maxActiveCases !== undefined) params.append('maxActiveCases', filters.maxActiveCases.toString());
      } else {
        if (filters.institutions && filters.institutions.length > 0) {
          params.append('institutions', filters.institutions.join(','));
        }
      }

      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (reportType === 'officer') {
          setOfficerData(data.data || []);
        } else {
          setInstitutionalData(data.data || []);
        }
        setTotalRecords(data.data.length);
        pushToast('success', 'Report Generated', `Loaded ${data.data.length} records`);
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
  }, [reportType, filters]);

  // Handle export to Excel with column selection
  const handleExport = (selectedOnly: boolean = false) => {
    try {
      const dataToExport = reportType === 'officer'
        ? selectedOnly ? officerData.filter(d => selectedRows.has(d.userId)) : officerData
        : selectedOnly ? institutionalData.filter(d => selectedRows.has(d.userId)) : institutionalData;

      if (dataToExport.length === 0) {
        pushToast('error', 'No Data', 'No data available to export');
        return;
      }

      const filtersSummary = formatFiltersForExcel(filters);
      const filename = `${reportType}_report`;
      const sheetName = reportType === 'officer' ? 'Officer Reports' : 'Institutional Users';

      // Generate filtered Excel based on selected columns
      const workbook = generateFilteredExcelReport(
        dataToExport,
        reportType,
        selectedColumns,
        {
          filename,
          sheetName,
          includeTimestamp: true,
          includeFilters: true,
          filtersSummary,
        }
      );

      downloadExcel(workbook, filename, true);
      pushToast('success', 'Export Successful', `Downloaded ${dataToExport.length} records with ${selectedColumns.size} columns`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      pushToast('error', 'Export Failed', 'Failed to export data to Excel');
    }
  };

  // Generate Excel with selected columns only
  const generateFilteredExcelReport = (
    data: any[],
    type: 'officer' | 'institutional',
    selectedCols: Set<string>,
    options: any
  ) => {
    const XLSX = require('xlsx');
    const workbook = XLSX.utils.book_new();
    
    // Prepare filtered rows based on selected columns
    const rows = data.map((item, index) => {
      const row: any = {};
      
      if (type === 'officer') {
        if (selectedCols.has('serialNumber')) row['S.N.'] = index + 1;
        if (selectedCols.has('firstName')) row['First Name'] = item.firstName;
        if (selectedCols.has('lastName')) row['Last Name'] = item.lastName;
        if (selectedCols.has('email')) row['Email'] = item.email;
        if (selectedCols.has('department')) row['Department'] = item.department;
        if (selectedCols.has('status')) row['Status'] = item.isActive ? 'Active' : 'Inactive';
        if (selectedCols.has('province')) row['Province'] = item.address?.province || 'N/A';
        if (selectedCols.has('district')) row['District'] = item.address?.district || 'N/A';
        if (selectedCols.has('municipality')) row['Municipality'] = item.address?.municipality || 'N/A';
        if (selectedCols.has('ward')) row['Ward'] = item.address?.ward || 'N/A';
        if (selectedCols.has('accountCreated')) row['Account Created'] = format(new Date(item.createdAt), 'yyyy-MM-dd');
        if (selectedCols.has('lastLogin')) row['Last Login'] = item.lastLogin ? format(new Date(item.lastLogin), 'yyyy-MM-dd HH:mm') : 'Never';
        if (selectedCols.has('totalCases')) row['Total Cases Assigned'] = item.totalCasesAssigned;
        if (selectedCols.has('activeCases')) row['Active Cases'] = item.activeCases;
        if (selectedCols.has('resolvedCases')) row['Resolved Cases'] = item.resolvedCases;
        if (selectedCols.has('pendingCases')) row['Pending Cases'] = item.pendingCases;
        if (selectedCols.has('lostCases')) row['Lost Cases'] = item.lostCases;
        if (selectedCols.has('foundCases')) row['Found Cases'] = item.foundCases;
        if (selectedCols.has('verificationCases')) row['Verification Cases'] = item.verificationCases;
        if (selectedCols.has('resolutionRate')) row['Resolution Rate (%)'] = item.resolutionRate.toFixed(2);
        if (selectedCols.has('avgResolutionTime')) row['Avg Resolution Time (days)'] = item.averageResolutionTime?.toFixed(1) || 'N/A';
        if (selectedCols.has('resolvedThisWeek')) row['Resolved This Week'] = item.casesResolvedThisWeek;
        if (selectedCols.has('resolvedThisMonth')) row['Resolved This Month'] = item.casesResolvedThisMonth;
        if (selectedCols.has('claimsReviewed')) row['Claims Reviewed'] = item.claimsReviewed;
        if (selectedCols.has('claimsApproved')) row['Claims Approved'] = item.claimsApproved;
        if (selectedCols.has('claimsRejected')) row['Claims Rejected'] = item.claimsRejected;
        if (selectedCols.has('claimsPending')) row['Claims Pending'] = item.claimsPending;
      } else {
        if (selectedCols.has('serialNumber')) row['S.N.'] = index + 1;
        if (selectedCols.has('firstName')) row['First Name'] = item.firstName;
        if (selectedCols.has('lastName')) row['Last Name'] = item.lastName;
        if (selectedCols.has('email')) row['Email'] = item.email;
        if (selectedCols.has('institutionName')) row['Institution Name'] = item.institutionName;
        if (selectedCols.has('status')) row['Status'] = item.isActive ? 'Active' : 'Inactive';
        if (selectedCols.has('province')) row['Province'] = item.address?.province || 'N/A';
        if (selectedCols.has('district')) row['District'] = item.address?.district || 'N/A';
        if (selectedCols.has('municipality')) row['Municipality'] = item.address?.municipality || 'N/A';
        if (selectedCols.has('ward')) row['Ward'] = item.address?.ward || 'N/A';
        if (selectedCols.has('accountCreated')) row['Account Created'] = format(new Date(item.createdAt), 'yyyy-MM-dd');
        if (selectedCols.has('totalCasesReported')) row['Total Cases Reported'] = item.totalCasesReported;
        if (selectedCols.has('lostCases')) row['Lost Cases'] = item.lostCases;
        if (selectedCols.has('foundCases')) row['Found Cases'] = item.foundCases;
        if (selectedCols.has('verificationCases')) row['Verification Cases'] = item.verificationCases;
        if (selectedCols.has('activeCases')) row['Active Cases'] = item.activeCases;
        if (selectedCols.has('pendingCases')) row['Pending Cases'] = item.pendingCases;
        if (selectedCols.has('resolvedCases')) row['Resolved Cases'] = item.resolvedCases;
        if (selectedCols.has('totalClaimsFiled')) row['Total Claims Filed'] = item.totalClaimsFiled;
        if (selectedCols.has('claimsApproved')) row['Claims Approved'] = item.claimsApproved;
        if (selectedCols.has('claimsRejected')) row['Claims Rejected'] = item.claimsRejected;
        if (selectedCols.has('claimsPending')) row['Claims Pending'] = item.claimsPending;
      }
      
      return row;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName);
    
    return workbook;
  };

  // Handle address filter changes
  const handleAddressChange = (field: keyof Pick<ReportFilters, 'province' | 'district' | 'municipality' | 'ward'>, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields
      ...(field === 'province' && { district: '', municipality: '', ward: '' }),
      ...(field === 'district' && { municipality: '', ward: '' }),
      ...(field === 'municipality' && { ward: '' }),
    }));
  };

  // Toggle row selection
  const toggleRowSelection = (userId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedRows(newSelection);
  };

  // Select all rows on current page
  const toggleSelectAll = () => {
    const currentPageData = paginatedData as (OfficerReportData | InstitutionalUserData)[];
    const currentPageIds = currentPageData.map(d => d.userId);
    const allCurrentPageSelected = currentPageIds.every(id => selectedRows.has(id));
    
    const newSelection = new Set(selectedRows);
    if (allCurrentPageSelected) {
      // Deselect all on current page
      currentPageIds.forEach(id => newSelection.delete(id));
    } else {
      // Select all on current page
      currentPageIds.forEach(id => newSelection.add(id));
    }
    setSelectedRows(newSelection);
  };

  // Paginated data
  const paginatedData = useMemo(() => {
    const currentData = reportType === 'officer' ? officerData : institutionalData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return currentData.slice(startIndex, endIndex);
  }, [reportType, officerData, institutionalData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (reportType === 'officer') {
      const total = officerData.length;
      const active = officerData.filter(o => o.isActive).length;
      const totalResolved = officerData.reduce((sum, o) => sum + o.resolvedCases, 0);
      const avgResolutionRate = total > 0 ? officerData.reduce((sum, o) => sum + o.resolutionRate, 0) / total : 0;

      return { total, active, totalResolved, avgResolutionRate };
    } else {
      const total = institutionalData.length;
      const active = institutionalData.filter(i => i.isActive).length;
      const totalCases = institutionalData.reduce((sum, i) => sum + i.totalCasesReported, 0);
      const totalClaims = institutionalData.reduce((sum, i) => sum + i.totalClaimsFiled, 0);

      return { total, active, totalCases, totalClaims };
    }
  }, [reportType, officerData, institutionalData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              onClick={() => router.push('/admin/dashboard')}
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
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reports & Analytics</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate comprehensive reports and export to Excel</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Type Tabs */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 inline-flex gap-2 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => { setReportType('officer'); setSelectedRows(new Set()); }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                reportType === 'officer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Officer Reports
              </div>
            </button>
            <button
              onClick={() => { setReportType('institutional'); setSelectedRows(new Set()); }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                reportType === 'institutional'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Institutional Users
              </div>
            </button>
          </div>
        </div>

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
                {/* Location Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Province
                    </label>
                    <select
                      value={filters.province}
                      onChange={(e) => handleAddressChange('province', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">All Provinces</option>
                      {provinces.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                    <select
                      value={filters.district}
                      onChange={(e) => handleAddressChange('district', e.target.value)}
                      disabled={!filters.province}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm disabled:opacity-50"
                    >
                      <option value="">All Districts</option>
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Municipality</label>
                    <select
                      value={filters.municipality}
                      onChange={(e) => handleAddressChange('municipality', e.target.value)}
                      disabled={!filters.district}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm disabled:opacity-50"
                    >
                      <option value="">All Municipalities</option>
                      {municipalities.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ward</label>
                    <select
                      value={filters.ward}
                      onChange={(e) => handleAddressChange('ward', e.target.value)}
                      disabled={!filters.municipality}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm disabled:opacity-50"
                    >
                      <option value="">All Wards</option>
                      {wards.map(w => (
                        <option key={w} value={w}>Ward {w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Department/Institution & Status Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportType === 'officer' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                      <select
                        value={filters.departments?.[0] || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, departments: e.target.value ? [e.target.value] : [] }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      >
                        <option value="">All Departments</option>
                        {availableDepartments.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
                      <select
                        value={filters.institutions?.[0] || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, institutions: e.target.value ? [e.target.value] : [] }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      >
                        <option value="">All Institutions</option>
                        {availableInstitutions.map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                      onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value === '' ? undefined : e.target.value === 'true' }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="true">Active Only</option>
                      <option value="false">Inactive Only</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date From
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Officer-specific Performance Filters */}
                {reportType === 'officer' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        Min Resolution Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.minResolutionRate || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, minResolutionRate: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Min Cases Resolved
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={filters.minCasesResolved || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, minCasesResolved: e.target.value ? parseInt(e.target.value) : undefined }))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Min Active Cases
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={filters.minActiveCases || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, minActiveCases: e.target.value ? parseInt(e.target.value) : undefined }))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                )}

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
                        province: '',
                        district: '',
                        municipality: '',
                        ward: '',
                        departments: [],
                        institutions: [],
                        isActive: undefined,
                        dateFrom: '',
                        dateTo: '',
                        minResolutionRate: undefined,
                        maxResolutionRate: undefined,
                        minCasesResolved: undefined,
                        maxCasesResolved: undefined,
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

        {/* Summary Stats */}
        {(officerData.length > 0 || institutionalData.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total {reportType === 'officer' ? 'Officers' : 'Users'}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.total}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.active}</p>
                </div>
              </div>
            </motion.div>

            {reportType === 'officer' ? (
              <>
                <motion.div
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Resolved</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{(summaryStats as any).totalResolved}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Resolution Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{(summaryStats as any).avgResolutionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Cases Reported</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{(summaryStats as any).totalCases}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Claims Filed</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{(summaryStats as any).totalClaims}</p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}

        {/* Column Selector and Export Actions */}
        {(officerData.length > 0 || institutionalData.length > 0) && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRows.size > 0 ? (
                  <>
                    {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
                  </>
                ) : (
                  <>
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} records
                  </>
                )}
              </div>

              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                <Filter className="w-4 h-4" />
                Customize Columns ({selectedColumns.size})
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
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Columns for Excel Export</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={selectAllColumns}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          Select All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={deselectAllColumns}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          Deselect All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={() => setShowColumnSelector(false)}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(reportType === 'officer' ? officerColumns : institutionalColumns).map((column) => (
                        <label
                          key={column.key}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            column.alwaysIncluded
                              ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                              : selectedColumns.has(column.key)
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-500'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedColumns.has(column.key)}
                            onChange={() => toggleColumn(column.key)}
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
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRows.size > 0 ? (
                  <>
                    {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
                  </>
                ) : (
                  <>
                    Showing {reportType === 'officer' ? officerData.length : institutionalData.length} records
                  </>
                )}
              </div>

              <div className="flex gap-3">
                {selectedRows.size > 0 && (
                  <button
                    onClick={() => handleExport(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Selected ({selectedRows.size})
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
        ) : (officerData.length === 0 && institutionalData.length === 0) ? (
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
                        checked={(() => {
                          const currentPageData = paginatedData as (OfficerReportData | InstitutionalUserData)[];
                          const currentPageIds = currentPageData.map(d => d.userId);
                          return currentPageIds.length > 0 && currentPageIds.every(id => selectedRows.has(id));
                        })()}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                    {reportType === 'officer' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Cases</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Resolved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Resolution Rate</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Institution</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cases Reported</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Claims Filed</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportType === 'officer'
                    ? (paginatedData as OfficerReportData[]).map((officer, index) => (
                        <motion.tr
                          key={officer.userId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(officer.userId)}
                              onChange={() => toggleRowSelection(officer.userId)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{officer.firstName} {officer.lastName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{officer.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{officer.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{officer.totalCasesAssigned}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{officer.resolvedCases}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              officer.resolutionRate >= 75
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : officer.resolutionRate >= 50
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}>
                              {officer.resolutionRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              officer.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {officer.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    : (paginatedData as InstitutionalUserData[]).map((user, index) => (
                        <motion.tr
                          key={user.userId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(user.userId)}
                              onChange={() => toggleRowSelection(user.userId)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.institutionName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div className="font-medium">{user.totalCasesReported} Total</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.lostCases}L / {user.foundCases}F / {user.verificationCases}V
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div className="font-medium">{user.totalClaimsFiled} Total</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.claimsApproved}✓ / {user.claimsRejected}✗ / {user.claimsPending}⏳
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              user.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
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
                    
                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
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

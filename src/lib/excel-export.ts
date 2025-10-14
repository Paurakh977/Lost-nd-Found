import * as XLSX from 'xlsx';
import { OfficerReportData, InstitutionalUserData, ExcelExportOptions } from '../types/reports';
import { format } from 'date-fns';

/**
 * Generate Excel workbook for Officer Reports
 */
export function generateOfficerReport(
  data: OfficerReportData[],
  options: ExcelExportOptions
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // Prepare data rows with serial numbers
  const rows = data.map((officer, index) => ({
    'S.N.': index + 1,
    'First Name': officer.firstName,
    'Last Name': officer.lastName,
    'Email': officer.email,
    'Department': officer.department,
    'Status': officer.isActive ? 'Active' : 'Inactive',
    'Province': officer.address?.province || 'N/A',
    'District': officer.address?.district || 'N/A',
    'Municipality': officer.address?.municipality || 'N/A',
    'Ward': officer.address?.ward || 'N/A',
    'Account Created': format(new Date(officer.createdAt), 'yyyy-MM-dd'),
    'Last Login': officer.lastLogin ? format(new Date(officer.lastLogin), 'yyyy-MM-dd HH:mm') : 'Never',
    
    // Case Statistics
    'Total Cases Assigned': officer.totalCasesAssigned,
    'Active Cases': officer.activeCases,
    'Resolved Cases': officer.resolvedCases,
    'Pending Cases': officer.pendingCases,
    
    // Case Type Breakdown
    'Lost Cases': officer.lostCases,
    'Found Cases': officer.foundCases,
    'Verification Cases': officer.verificationCases,
    
    // Performance Metrics
    'Resolution Rate (%)': officer.resolutionRate.toFixed(2),
    'Avg Resolution Time (days)': officer.averageResolutionTime?.toFixed(1) || 'N/A',
    'Resolved This Week': officer.casesResolvedThisWeek,
    'Resolved This Month': officer.casesResolvedThisMonth,
    
    // Claim Statistics
    'Claims Reviewed': officer.claimsReviewed,
    'Claims Approved': officer.claimsApproved,
    'Claims Rejected': officer.claimsRejected,
    'Claims Pending': officer.claimsPending,
  }));
  
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 6 },  // S.N.
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 30 }, // Email
    { wch: 20 }, // Department
    { wch: 10 }, // Status
    { wch: 15 }, // Province
    { wch: 15 }, // District
    { wch: 20 }, // Municipality
    { wch: 10 }, // Ward
    { wch: 15 }, // Account Created
    { wch: 18 }, // Last Login
    { wch: 12 }, // Total Cases Assigned
    { wch: 12 }, // Active Cases
    { wch: 12 }, // Resolved Cases
    { wch: 12 }, // Pending Cases
    { wch: 12 }, // Lost Cases
    { wch: 12 }, // Found Cases
    { wch: 15 }, // Verification Cases
    { wch: 15 }, // Resolution Rate
    { wch: 20 }, // Avg Resolution Time
    { wch: 15 }, // Resolved This Week
    { wch: 15 }, // Resolved This Month
    { wch: 15 }, // Claims Reviewed
    { wch: 15 }, // Claims Approved
    { wch: 15 }, // Claims Rejected
    { wch: 15 }, // Claims Pending
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add filter summary if provided
  if (options.includeFilters && options.filtersSummary) {
    XLSX.utils.sheet_add_aoa(worksheet, [[options.filtersSummary]], { origin: -1 });
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName);
  
  // Add summary statistics sheet
  const summaryData = calculateOfficerSummary(data);
  const summaryWs = XLSX.utils.json_to_sheet([summaryData]);
  XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary');
  
  return workbook;
}

/**
 * Generate Excel workbook for Institutional User Reports
 */
export function generateInstitutionalReport(
  data: InstitutionalUserData[],
  options: ExcelExportOptions
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // Prepare data rows with serial numbers
  const rows = data.map((user, index) => ({
    'S.N.': index + 1,
    'First Name': user.firstName,
    'Last Name': user.lastName,
    'Email': user.email,
    'Institution Name': user.institutionName,
    'Status': user.isActive ? 'Active' : 'Inactive',
    'Province': user.address?.province || 'N/A',
    'District': user.address?.district || 'N/A',
    'Municipality': user.address?.municipality || 'N/A',
    'Ward': user.address?.ward || 'N/A',
    'Account Created': format(new Date(user.createdAt), 'yyyy-MM-dd'),
    
    // Case Statistics
    'Total Cases Reported': user.totalCasesReported,
    'Lost Cases': user.lostCases,
    'Found Cases': user.foundCases,
    'Verification Cases': user.verificationCases,
    'Active Cases': user.activeCases,
    'Pending Cases': user.pendingCases,
    'Resolved Cases': user.resolvedCases,
    
    // Claim Statistics
    'Total Claims Filed': user.totalClaimsFiled,
    'Claims Approved': user.claimsApproved,
    'Claims Rejected': user.claimsRejected,
    'Claims Pending': user.claimsPending,
  }));
  
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 6 },  // S.N.
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 30 }, // Email
    { wch: 30 }, // Institution Name
    { wch: 10 }, // Status
    { wch: 15 }, // Province
    { wch: 15 }, // District
    { wch: 20 }, // Municipality
    { wch: 10 }, // Ward
    { wch: 15 }, // Account Created
    { wch: 12 }, // Total Cases Reported
    { wch: 12 }, // Lost Cases
    { wch: 12 }, // Found Cases
    { wch: 15 }, // Verification Cases
    { wch: 12 }, // Active Cases
    { wch: 12 }, // Pending Cases
    { wch: 12 }, // Resolved Cases
    { wch: 15 }, // Total Claims Filed
    { wch: 15 }, // Claims Approved
    { wch: 15 }, // Claims Rejected
    { wch: 15 }, // Claims Pending
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add filter summary if provided
  if (options.includeFilters && options.filtersSummary) {
    XLSX.utils.sheet_add_aoa(worksheet, [[options.filtersSummary]], { origin: -1 });
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName);
  
  // Add summary statistics sheet
  const summaryData = calculateInstitutionalSummary(data);
  const summaryWs = XLSX.utils.json_to_sheet([summaryData]);
  XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary');
  
  return workbook;
}

/**
 * Calculate summary statistics for officers
 */
function calculateOfficerSummary(data: OfficerReportData[]) {
  const totalOfficers = data.length;
  const activeOfficers = data.filter(o => o.isActive).length;
  const totalCases = data.reduce((sum, o) => sum + o.totalCasesAssigned, 0);
  const totalResolved = data.reduce((sum, o) => sum + o.resolvedCases, 0);
  const totalActive = data.reduce((sum, o) => sum + o.activeCases, 0);
  const avgResolutionRate = totalOfficers > 0 
    ? data.reduce((sum, o) => sum + o.resolutionRate, 0) / totalOfficers 
    : 0;
  const totalClaimsReviewed = data.reduce((sum, o) => sum + o.claimsReviewed, 0);
  const totalClaimsApproved = data.reduce((sum, o) => sum + o.claimsApproved, 0);
  
  return {
    'Total Officers': totalOfficers,
    'Active Officers': activeOfficers,
    'Inactive Officers': totalOfficers - activeOfficers,
    'Total Cases Assigned': totalCases,
    'Total Resolved Cases': totalResolved,
    'Total Active Cases': totalActive,
    'Average Resolution Rate (%)': avgResolutionRate.toFixed(2),
    'Total Claims Reviewed': totalClaimsReviewed,
    'Total Claims Approved': totalClaimsApproved,
  };
}

/**
 * Calculate summary statistics for institutional users
 */
function calculateInstitutionalSummary(data: InstitutionalUserData[]) {
  const totalUsers = data.length;
  const activeUsers = data.filter(u => u.isActive).length;
  const totalCases = data.reduce((sum, u) => sum + u.totalCasesReported, 0);
  const totalClaims = data.reduce((sum, u) => sum + u.totalClaimsFiled, 0);
  const totalResolved = data.reduce((sum, u) => sum + u.resolvedCases, 0);
  
  return {
    'Total Institutional Users': totalUsers,
    'Active Users': activeUsers,
    'Inactive Users': totalUsers - activeUsers,
    'Total Cases Reported': totalCases,
    'Total Resolved Cases': totalResolved,
    'Total Claims Filed': totalClaims,
  };
}

/**
 * Download Excel file to user's computer
 */
export function downloadExcel(workbook: XLSX.WorkBook, filename: string, includeTimestamp: boolean = true): void {
  try {
    // Add timestamp to filename if requested
    const finalFilename = includeTimestamp
      ? `${filename}_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xlsx`
      : `${filename}.xlsx`;
    
    // Write workbook to binary
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and download
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    throw new Error('Failed to download Excel file');
  }
}

/**
 * Format filters for display in Excel
 */
export function formatFiltersForExcel(filters: Record<string, any>): string {
  const parts: string[] = [];
  
  if (filters.province) parts.push(`Province: ${filters.province}`);
  if (filters.district) parts.push(`District: ${filters.district}`);
  if (filters.municipality) parts.push(`Municipality: ${filters.municipality}`);
  if (filters.ward) parts.push(`Ward: ${filters.ward}`);
  if (filters.department) parts.push(`Department: ${filters.department}`);
  if (filters.institution) parts.push(`Institution: ${filters.institution}`);
  if (filters.isActive !== undefined) parts.push(`Status: ${filters.isActive ? 'Active' : 'Inactive'}`);
  if (filters.dateFrom) parts.push(`From: ${filters.dateFrom}`);
  if (filters.dateTo) parts.push(`To: ${filters.dateTo}`);
  
  return parts.length > 0 ? `Filters Applied: ${parts.join(' | ')}` : 'No filters applied';
}

/**
 * Column definitions for Officer Case Reports
 */
export const OFFICER_CASE_COLUMNS = [
  { key: 'serialNumber', label: 'S.N.', alwaysIncluded: true },
  { key: 'caseId', label: 'Case ID', alwaysIncluded: true },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'urgencyLevel', label: 'Urgency Level' },
  { key: 'reportedTime', label: 'Reported Time' },
  { key: 'createdAt', label: 'Case Created At' },
  { key: 'reportedByName', label: 'Reported By (Name)' },
  { key: 'reportedByEmail', label: 'Reported By (Email)' },
  { key: 'locationAddress', label: 'Location Address' },
  { key: 'locationDetails', label: 'Location Details' },
  { key: 'itemDescription', label: 'Item Description' },
  { key: 'itemCategory', label: 'Category' },
  { key: 'itemBrand', label: 'Brand' },
  { key: 'itemModel', label: 'Model' },
  { key: 'itemColor', label: 'Color' },
  { key: 'itemSerialNumber', label: 'Serial Number' },
  { key: 'itemIdentifyingFeatures', label: 'Identifying Features' },
  { key: 'itemEstimatedValue', label: 'Estimated Value' },
  { key: 'assignedOfficer', label: 'Assigned Officer' },
  { key: 'linkedCaseId', label: 'Linked Case ID' },
  { key: 'claimsCount', label: 'Related Claims' },
  { key: 'resolutionStatus', label: 'Resolution Status' },
  { key: 'resolvedAt', label: 'Resolved At' },
  { key: 'resolvedBy', label: 'Resolved By' },
  { key: 'resolutionOutcome', label: 'Resolution Outcome' },
  { key: 'resolutionNotes', label: 'Resolution Notes' },
];

export const OFFICER_CLAIM_COLUMNS = [
  { key: 'serialNumber', label: 'S.N.', alwaysIncluded: true },
  { key: 'claimId', label: 'Claim ID', alwaysIncluded: true },
  { key: 'caseId', label: 'Case ID' },
  { key: 'caseTitle', label: 'Case Title' },
  { key: 'caseType', label: 'Case Type' },
  { key: 'claimantName', label: 'Claimant Name' },
  { key: 'claimantEmail', label: 'Claimant Email' },
  { key: 'claimantPhone', label: 'Claimant Phone' },
  { key: 'claimantAddress', label: 'Claimant Address' },
  { key: 'evidenceDescription', label: 'Evidence Description' },
  { key: 'status', label: 'Claim Status' },
  { key: 'reviewedBy', label: 'Reviewed By' },
  { key: 'reviewedAt', label: 'Reviewed At' },
  { key: 'reviewNotes', label: 'Review Notes' },
  { key: 'createdAt', label: 'Claim Submitted At' },
];

/**
 * Generate Excel workbook for Officer Case Reports
 */
export function generateOfficerCaseReport(
  cases: any[],
  claims: any[],
  selectedCaseColumns: Set<string>,
  selectedClaimColumns: Set<string>,
  options: ExcelExportOptions & { officer?: any; filtersSummary?: string }
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // ===== CASES SHEET =====
  const caseRows = cases.map((caseItem, index) => {
    const row: any = {};
    
    if (selectedCaseColumns.has('serialNumber')) row['S.N.'] = index + 1;
    if (selectedCaseColumns.has('caseId')) row['Case ID'] = caseItem._id?.toString() || 'N/A';
    if (selectedCaseColumns.has('title')) row['Title'] = caseItem.title || 'N/A';
    if (selectedCaseColumns.has('description')) row['Description'] = caseItem.description || 'N/A';
    if (selectedCaseColumns.has('type')) row['Type'] = caseItem.type || 'N/A';
    if (selectedCaseColumns.has('status')) row['Status'] = caseItem.status || 'N/A';
    if (selectedCaseColumns.has('urgencyLevel')) row['Urgency Level'] = caseItem.urgencyLevel || 'N/A';
    if (selectedCaseColumns.has('reportedTime')) {
      row['Reported Time'] = caseItem.reportedTime ? format(new Date(caseItem.reportedTime), 'yyyy-MM-dd HH:mm') : 'N/A';
    }
    if (selectedCaseColumns.has('createdAt')) {
      row['Case Created At'] = caseItem.createdAt ? format(new Date(caseItem.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A';
    }
    if (selectedCaseColumns.has('reportedByName')) row['Reported By (Name)'] = caseItem.reportedBy?.name || 'N/A';
    if (selectedCaseColumns.has('reportedByEmail')) row['Reported By (Email)'] = caseItem.reportedBy?.email || 'N/A';
    if (selectedCaseColumns.has('locationAddress')) row['Location Address'] = caseItem.location?.address || 'N/A';
    if (selectedCaseColumns.has('locationDetails')) row['Location Details'] = caseItem.location?.details || 'N/A';
    if (selectedCaseColumns.has('itemDescription')) row['Item Description'] = caseItem.itemDetails?.detailedDescription || 'N/A';
    if (selectedCaseColumns.has('itemCategory')) row['Category'] = caseItem.itemDetails?.category || 'N/A';
    if (selectedCaseColumns.has('itemBrand')) row['Brand'] = caseItem.itemDetails?.brand || 'N/A';
    if (selectedCaseColumns.has('itemModel')) row['Model'] = caseItem.itemDetails?.model || 'N/A';
    if (selectedCaseColumns.has('itemColor')) row['Color'] = caseItem.itemDetails?.color || 'N/A';
    if (selectedCaseColumns.has('itemSerialNumber')) row['Serial Number'] = caseItem.itemDetails?.serialNumber || 'N/A';
    if (selectedCaseColumns.has('itemIdentifyingFeatures')) row['Identifying Features'] = caseItem.itemDetails?.identifyingFeatures || 'N/A';
    if (selectedCaseColumns.has('itemEstimatedValue')) row['Estimated Value'] = caseItem.itemDetails?.estimatedValue || 'N/A';
    if (selectedCaseColumns.has('assignedOfficer')) {
      row['Assigned Officer'] = caseItem.assignedOfficer 
        ? `${caseItem.assignedOfficer.firstName} ${caseItem.assignedOfficer.lastName}`
        : 'N/A';
    }
    if (selectedCaseColumns.has('linkedCaseId')) row['Linked Case ID'] = caseItem.linkedCaseId?.toString() || 'N/A';
    if (selectedCaseColumns.has('claimsCount')) row['Related Claims'] = caseItem.claimsCount || 0;
    if (selectedCaseColumns.has('resolutionStatus')) row['Resolution Status'] = caseItem.resolution ? 'Resolved' : 'Unresolved';
    if (selectedCaseColumns.has('resolvedAt')) {
      row['Resolved At'] = caseItem.resolution?.resolvedAt 
        ? format(new Date(caseItem.resolution.resolvedAt), 'yyyy-MM-dd HH:mm')
        : 'N/A';
    }
    if (selectedCaseColumns.has('resolvedBy')) {
      row['Resolved By'] = caseItem.resolution?.resolvedBy 
        ? `${caseItem.resolution.resolvedBy.firstName} ${caseItem.resolution.resolvedBy.lastName}`
        : 'N/A';
    }
    if (selectedCaseColumns.has('resolutionOutcome')) row['Resolution Outcome'] = caseItem.resolution?.outcome || 'N/A';
    if (selectedCaseColumns.has('resolutionNotes')) row['Resolution Notes'] = caseItem.resolution?.notes || 'N/A';
    
    return row;
  });
  
  const casesWorksheet = XLSX.utils.json_to_sheet(caseRows);
  XLSX.utils.book_append_sheet(workbook, casesWorksheet, 'Cases');
  
  // ===== CLAIMS SHEET =====
  const claimRows = claims.map((claim, index) => {
    const row: any = {};
    
    if (selectedClaimColumns.has('serialNumber')) row['S.N.'] = index + 1;
    if (selectedClaimColumns.has('claimId')) row['Claim ID'] = claim._id?.toString() || 'N/A';
    if (selectedClaimColumns.has('caseId')) row['Case ID'] = claim.caseId?.toString() || 'N/A';
    if (selectedClaimColumns.has('caseTitle')) row['Case Title'] = claim.caseTitle || 'N/A';
    if (selectedClaimColumns.has('caseType')) row['Case Type'] = claim.caseType || 'N/A';
    if (selectedClaimColumns.has('claimantName')) row['Claimant Name'] = claim.claimantInfo?.name || 'N/A';
    if (selectedClaimColumns.has('claimantEmail')) row['Claimant Email'] = claim.claimantInfo?.email || 'N/A';
    if (selectedClaimColumns.has('claimantPhone')) row['Claimant Phone'] = claim.claimantInfo?.phone || 'N/A';
    if (selectedClaimColumns.has('claimantAddress')) {
      const addr = claim.claimantInfo?.address;
      row['Claimant Address'] = addr?.fullAddress || 
        [addr?.province, addr?.district, addr?.municipality, addr?.ward].filter(Boolean).join(', ') || 'N/A';
    }
    if (selectedClaimColumns.has('evidenceDescription')) row['Evidence Description'] = claim.evidence?.description || 'N/A';
    if (selectedClaimColumns.has('status')) row['Claim Status'] = claim.status || 'N/A';
    if (selectedClaimColumns.has('reviewedBy')) {
      row['Reviewed By'] = claim.reviewedBy 
        ? `${claim.reviewedBy.firstName} ${claim.reviewedBy.lastName}`
        : 'N/A';
    }
    if (selectedClaimColumns.has('reviewedAt')) {
      row['Reviewed At'] = claim.reviewedAt 
        ? format(new Date(claim.reviewedAt), 'yyyy-MM-dd HH:mm')
        : 'N/A';
    }
    if (selectedClaimColumns.has('reviewNotes')) row['Review Notes'] = claim.reviewNotes || 'N/A';
    if (selectedClaimColumns.has('createdAt')) {
      row['Claim Submitted At'] = claim.createdAt 
        ? format(new Date(claim.createdAt), 'yyyy-MM-dd HH:mm')
        : 'N/A';
    }
    
    return row;
  });
  
  const claimsWorksheet = XLSX.utils.json_to_sheet(claimRows);
  XLSX.utils.book_append_sheet(workbook, claimsWorksheet, 'Claims');
  
  // ===== SUMMARY SHEET =====
  const summaryData = [
    {
      'Report Type': 'Officer Case Report',
      'Officer': options.officer ? `${options.officer.firstName} ${options.officer.lastName}` : 'N/A',
      'Department': options.officer?.department || 'N/A',
      'Generated At': format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      'Total Cases': cases.length,
      'Total Claims': claims.length,
      'Filters': options.filtersSummary || 'None',
    }
  ];
  
  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
  
  return workbook;
}

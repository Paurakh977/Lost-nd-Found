// Type definitions for Admin Reporting Feature

export interface OfficerReportData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  isActive: boolean;
  address?: {
    province?: string;
    district?: string;
    municipality?: string;
    ward?: string;
  };
  createdAt: Date;
  lastLogin?: Date;
  
  // Case Statistics
  totalCasesAssigned: number;
  activeCases: number;
  resolvedCases: number;
  pendingCases: number;
  
  // Case Type Breakdown
  lostCases: number;
  foundCases: number;
  verificationCases: number;
  
  // Performance Metrics
  resolutionRate: number; // Percentage of resolved cases
  averageResolutionTime?: number; // Average time in days to resolve cases
  casesResolvedThisWeek: number;
  casesResolvedThisMonth: number;
  
  // Claim Statistics
  claimsReviewed: number;
  claimsApproved: number;
  claimsRejected: number;
  claimsPending: number;
}

export interface InstitutionalUserData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  institutionName: string;
  isActive: boolean;
  address?: {
    province?: string;
    district?: string;
    municipality?: string;
    ward?: string;
  };
  createdAt: Date;
  
  // Case Statistics (cases reported by this institutional user)
  totalCasesReported: number;
  lostCases: number;
  foundCases: number;
  verificationCases: number;
  activeCases: number;
  pendingCases: number;
  resolvedCases: number;
  
  // Claim Statistics (claims filed by this institutional user)
  totalClaimsFiled: number;
  claimsApproved: number;
  claimsRejected: number;
  claimsPending: number;
}

export interface ReportFilters {
  // User Selection
  userIds?: string[];
  
  // Role-specific filters
  departments?: string[]; // For officers
  institutions?: string[]; // For institutional users
  
  // Location Filters (hierarchical)
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  
  // Status Filters
  isActive?: boolean;
  
  // Date Range
  dateFrom?: string; // ISO string
  dateTo?: string; // ISO string
  createdAfter?: string; // User creation date filter
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  
  // Performance Filters (Officers only)
  minResolutionRate?: number; // 0-100
  maxResolutionRate?: number; // 0-100
  minCasesResolved?: number;
  maxCasesResolved?: number;
  minActiveCases?: number;
  maxActiveCases?: number;
  
  // Pagination
  page?: number;
  limit?: number;
}

export interface ReportResponse<T> {
  success: boolean;
  data: T[];
  summary: {
    totalRecords: number;
    filteredRecords: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface ExcelExportOptions {
  filename: string;
  sheetName: string;
  includeTimestamp?: boolean;
  includeFilters?: boolean;
  filtersSummary?: string;
}

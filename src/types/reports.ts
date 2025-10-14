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

// Officer Case Report Types
export interface OfficerCaseReportData {
  _id: string;
  title: string;
  description: string;
  type: 'lost' | 'found' | 'verification';
  status: 'pending' | 'active' | 'resolved';
  urgencyLevel: 'low' | 'medium' | 'high' | null;
  reportedTime: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Reporter Information
  reportedBy: {
    clerkId: string;
    name: string;
    email?: string;
  };
  
  // Location
  location: {
    address: string;
    coordinates?: [number, number];
    details?: string;
  };
  
  // Item Details
  itemDetails: {
    detailedDescription: string;
    category?: string;
    brand?: string;
    model?: string;
    color?: string;
    serialNumber?: string;
    identifyingFeatures?: string;
    estimatedValue?: number;
  };
  
  // Officer Information
  assignedOfficer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  // Linked Case
  linkedCaseId?: string;
  
  // Resolution
  resolution?: {
    resolvedAt: Date;
    resolvedBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    outcome: string;
    notes?: string;
    itemAssignedTo?: {
      clerkId?: string;
      name: string;
      contactInfo?: string;
    };
    foundBy?: {
      clerkId?: string;
      name: string;
      contactInfo?: string;
    };
  };
  
  // Claim Evidence (for verification cases)
  claimEvidence?: {
    description: string;
    claimantInfo: {
      name: string;
      email: string;
      phone?: string;
      address: {
        province?: string;
        district?: string;
        municipality?: string;
        ward?: string;
        fullAddress?: string;
      };
    };
    submittedAt: Date;
  };
  
  // Related claims count
  claimsCount?: number;
}

export interface OfficerClaimReportData {
  _id: string;
  caseId: string;
  caseTitle?: string;
  caseType?: string;
  clerkUserId?: string;
  relatedFoundCaseId?: string;
  
  claimantInfo: {
    name: string;
    email: string;
    phone?: string;
    address: {
      province?: string;
      district?: string;
      municipality?: string;
      ward?: string;
      fullAddress?: string;
    };
  };
  
  evidence: {
    description: string;
  };
  
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfficerReportFilters {
  // Case Filters
  caseType?: 'all' | 'lost' | 'found' | 'verification';
  caseStatus?: 'all' | 'pending' | 'active' | 'resolved';
  
  // Claim Filters
  claimStatus?: 'all' | 'pending' | 'approved' | 'rejected';
  
  // Date Filters (separate options)
  caseCreatedFrom?: string; // ISO string
  caseCreatedTo?: string;
  reportedTimeFrom?: string;
  reportedTimeTo?: string;
  
  // Pagination
  page?: number;
  limit?: number;
}

export interface OfficerReportResponse {
  success: boolean;
  data: {
    cases: OfficerCaseReportData[];
    claims: OfficerClaimReportData[];
  };
  summary: {
    totalCases: number;
    totalClaims: number;
    filteredCases: number;
    filteredClaims: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  officer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  error?: string;
}

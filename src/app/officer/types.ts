// Officer Dashboard TypeScript Interfaces

export interface OfficerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  role: 'officer';
}

export interface OfficerDashboardStats {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  pendingVerifications: number;
  lostReports: number;
  foundReports: number;
  todayReports: number;
  weeklyGrowth: number;
}

export interface CaseItem {
  _id: string;
  title: string;
  description: string;
  type: 'lost' | 'found' | 'verification';
  status: 'pending' | 'active' | 'resolved';
  urgencyLevel: 'low' | 'medium' | 'high' | null;
  reportedTime: string;
  location: {
    type: string;
    coordinates?: [number, number];
    address: string;
    details?: string;
  };
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
  images: string[];
  reportedBy: {
    clerkId: string;
    name: string;
    email?: string;
  };
  assignedOfficer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DashboardAPIResponse {
  success: boolean;
  officer: OfficerInfo;
  stats: OfficerDashboardStats;
}

export interface UnassignedCasesAPIResponse {
  success: boolean;
  cases: CaseItem[];
  pagination: PaginationMeta;
}

export interface UrgentCasesAPIResponse {
  success: boolean;
  cases: CaseItem[];
  pagination: PaginationMeta;
}

export interface MyCasesAPIResponse {
  success: boolean;
  cases: CaseItem[];
  pagination: PaginationMeta;
}

export interface AssignCaseAPIResponse {
  success: boolean;
  message: string;
  case: CaseItem;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

// Filter types for case queries
export interface CaseFilters {
  type?: 'all' | 'lost' | 'found' | 'verification';
  status?: 'all' | 'pending' | 'active' | 'resolved';
  search?: string;
  sortBy?: 'createdAt' | 'urgencyLevel' | 'reportedTime';
  sortOrder?: 'asc' | 'desc';
}

import { useState, useEffect, useCallback } from 'react';
import { PaginationMeta } from '../types';

interface VerificationCase {
  _id: string;
  title: string;
  description: string;
  type: 'verification';
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
  claimEvidence?: {
    description: string;
    images?: string[];
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
    submittedAt: string;
  };
  resolution?: any;
  createdAt: string;
  updatedAt: string;
}


interface UseVerificationCasesReturn {
  cases: VerificationCase[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  refetch: () => Promise<void>;
  goToPage: (page: number) => void;
}

export function useVerificationCases(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): UseVerificationCasesReturn {
  const [cases, setCases] = useState<VerificationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        type: 'verification',
        sortBy,
        sortOrder,
        ...(search && { search })
      });

      const res = await fetch(`/api/officer/cases/my/verification?${params}`, { 
        credentials: 'include' 
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch verification cases');
      }
      
      setCases(data.cases || []);
      setPagination(data.pagination || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching verification cases');
      setCases([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);

  const goToPage = useCallback((newPage: number) => {
    // This would typically be handled by the parent component
    // by updating the page state and re-calling the hook
    console.log('Navigate to page:', newPage);
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return { cases, loading, error, pagination, refetch: fetchCases, goToPage };
}

import { useState, useEffect, useCallback } from 'react';
import { CaseItem, PaginationMeta, UrgentCasesAPIResponse, CaseFilters } from '../types';

interface UseUrgentCasesReturn {
  cases: CaseItem[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  filters: Pick<CaseFilters, 'type' | 'status'>;
  setFilters: (filters: Pick<CaseFilters, 'type' | 'status'>) => void;
  refetch: () => Promise<void>;
  goToPage: (page: number) => void;
  removeCase: (caseId: string) => void;
}

/**
 * Custom hook to fetch and manage urgent cases (high urgency, unassigned)
 */
export function useUrgentCases(initialPage = 1, initialLimit = 5): UseUrgentCasesReturn {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Pick<CaseFilters, 'type' | 'status'>>({
    type: 'all',
    status: 'pending',
  });
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit] = useState(initialLimit);

  const fetchUrgentCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const response = await fetch(`/api/officer/urgent-cases?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch urgent cases');
      }

      const data: UrgentCasesAPIResponse = await response.json();

      if (data.success) {
        setCases(data.cases);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch urgent cases');
      }
    } catch (err) {
      console.error('Urgent cases fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  // Fetch when dependencies change
  useEffect(() => {
    fetchUrgentCases();
  }, [fetchUrgentCases]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const removeCase = useCallback((caseId: string) => {
    setCases((prevCases) => prevCases.filter((c) => c._id !== caseId));
    // Update pagination total count
    if (pagination) {
      setPagination({
        ...pagination,
        total: pagination.total - 1,
      });
    }
  }, [pagination]);

  return {
    cases,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchUrgentCases,
    goToPage,
    removeCase,
  };
}

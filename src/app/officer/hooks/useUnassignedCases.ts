import { useState, useEffect, useCallback, useRef } from 'react';
import { CaseItem, PaginationMeta, UnassignedCasesAPIResponse, CaseFilters } from '../types';

interface UseUnassignedCasesReturn {
  cases: CaseItem[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  filters: CaseFilters;
  setFilters: (filters: CaseFilters) => void;
  refetch: () => Promise<void>;
  goToPage: (page: number) => void;
  removeCase: (caseId: string) => void;
}

/**
 * Custom hook to fetch and manage unassigned cases with filtering, search, and pagination
 */
export function useUnassignedCases(initialPage = 1, initialLimit = 10): UseUnassignedCasesReturn {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CaseFilters>({
    type: 'all',
    status: 'pending',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit] = useState(initialLimit);

  // Debounce timer for search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnassignedCases = useCallback(async () => {
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
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }

      const response = await fetch(`/api/officer/unassigned-cases?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch unassigned cases');
      }

      const data: UnassignedCasesAPIResponse = await response.json();

      if (data.success) {
        setCases(data.cases);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch unassigned cases');
      }
    } catch (err) {
      console.error('Unassigned cases fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  // Fetch when dependencies change, but debounce search
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search is being used, debounce it
    if (filters.search) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchUnassignedCases();
      }, 500); // 500ms debounce
    } else {
      // No search, fetch immediately
      fetchUnassignedCases();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchUnassignedCases, filters.search]);

  // Fetch immediately when non-search filters change
  useEffect(() => {
    if (!filters.search) {
      fetchUnassignedCases();
    }
  }, [currentPage, filters.type, filters.status, filters.sortBy, filters.sortOrder]);

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
    refetch: fetchUnassignedCases,
    goToPage,
    removeCase,
  };
}

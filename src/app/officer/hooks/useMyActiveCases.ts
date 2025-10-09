import { useState, useEffect, useCallback, useRef } from 'react';
import { CaseItem, PaginationMeta, CaseFilters } from '../types';

interface UseMyActiveCasesReturn {
  cases: CaseItem[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  filters: Pick<CaseFilters, 'type' | 'search' | 'sortBy' | 'sortOrder'>;
  setFilters: (filters: Pick<CaseFilters, 'type' | 'search' | 'sortBy' | 'sortOrder'>) => void;
  goToPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function useMyActiveCases(initialPage = 1, initialLimit = 10): UseMyActiveCasesReturn {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Pick<CaseFilters, 'type' | 'search' | 'sortBy' | 'sortOrder'>>({
    type: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActiveCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: currentPage.toString(), limit: limit.toString() });
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const res = await fetch(`/api/officer/cases/my/active?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch active cases');
      setCases(data.cases);
      setPagination(data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching active cases');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (filters.search) {
      searchTimeoutRef.current = setTimeout(() => { fetchActiveCases(); }, 500);
    } else {
      fetchActiveCases();
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [fetchActiveCases, filters.search]);

  useEffect(() => { if (!filters.search) fetchActiveCases(); }, [currentPage, filters.type, filters.sortBy, filters.sortOrder]);

  return { cases, pagination, loading, error, filters, setFilters, goToPage: setCurrentPage, refetch: fetchActiveCases };
}



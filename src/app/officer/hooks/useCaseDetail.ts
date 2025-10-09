import { useState, useEffect, useCallback } from 'react';
import { CaseItem } from '../types';

interface UseCaseDetailReturn {
  caseItem: CaseItem | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCaseDetail(caseId: string): UseCaseDetailReturn {
  const [caseItem, setCaseItem] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/officer/cases/${caseId}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch case');
      setCaseItem(data.case);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching case');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  return { caseItem, loading, error, refetch: fetchDetail };
}



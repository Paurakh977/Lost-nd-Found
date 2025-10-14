import { useState, useCallback } from 'react';

interface ResolvePayload {
  outcome: string;
  notes?: string;
  assignType?: 'itemAssignedTo' | 'foundBy';
  assignee?: { clerkId?: string; name: string; contactInfo?: string };
}

export function useResolveCase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveCase = useCallback(async (caseId: string, payload: ResolvePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/officer/cases/${caseId}/resolve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to resolve');
      return { success: true, case: data.case } as const;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to resolve';
      setError(msg);
      return { success: false, error: msg } as const;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resolveCase, loading, error };
}



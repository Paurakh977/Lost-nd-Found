import { useState } from 'react';

interface VerifyCasePayload {
  outcome: string;
  notes?: string;
  isVerified: boolean;
  assignType?: 'itemAssignedTo' | 'foundBy';
  assignee?: {
    clerkId?: string;
    name: string;
    contactInfo?: string;
  };
}

interface UseVerifyCaseReturn {
  loading: boolean;
  error: string | null;
  verifyCase: (caseId: string, payload: VerifyCasePayload) => Promise<{ success: boolean; error?: string }>;
}

export function useVerifyCase(): UseVerifyCaseReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyCase = async (caseId: string, payload: VerifyCasePayload) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/officer/cases/${caseId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify case');
      }

      return { success: true };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error verifying case';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, verifyCase };
}

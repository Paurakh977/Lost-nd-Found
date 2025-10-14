import { useState, useCallback } from 'react';
import { AssignCaseAPIResponse } from '../types';

interface UseAssignCaseReturn {
  assignCase: (caseId: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to handle case assignment with proper error handling
 */
export function useAssignCase(): UseAssignCaseReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignCase = useCallback(async (caseId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/officer/cases/${caseId}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        // Handle specific error cases
        if (response.status === 409) {
          // Case already assigned (race condition)
          const errorMsg = data.error || 'This case has already been assigned to another officer';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        } else if (response.status === 404) {
          const errorMsg = 'Case not found';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        } else {
          const errorMsg = data.error || 'Failed to assign case';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      }
    } catch (err) {
      console.error('Assign case error:', err);
      const errorMsg = err instanceof Error ? err.message : 'An error occurred while assigning case';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assignCase,
    loading,
    error,
  };
}

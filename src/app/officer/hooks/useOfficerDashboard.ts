import { useState, useEffect, useCallback } from 'react';
import { OfficerDashboardStats, OfficerInfo, DashboardAPIResponse } from '../types';

interface UseOfficerDashboardReturn {
  officer: OfficerInfo | null;
  stats: OfficerDashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage officer dashboard statistics
 * Automatically fetches data on mount and provides a refetch function
 */
export function useOfficerDashboard(): UseOfficerDashboardReturn {
  const [officer, setOfficer] = useState<OfficerInfo | null>(null);
  const [stats, setStats] = useState<OfficerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/officer/dashboard', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard data');
      }

      const data: DashboardAPIResponse = await response.json();

      if (data.success) {
        setOfficer(data.officer);
        setStats(data.stats);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Expose a global event to refetch after assignment without prop drilling
  useEffect(() => {
    const handler = () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchDashboard();
    };
    window.addEventListener('officer:refresh-stats', handler as EventListener);
    return () => {
      window.removeEventListener('officer:refresh-stats', handler as EventListener);
    };
  }, [fetchDashboard]);

  return {
    officer,
    stats,
    loading,
    error,
    refetch: fetchDashboard,
  };
}

/**
 * Helper function to manually update stats (for optimistic updates)
 */
export function updateStatsAfterAssignment(
  currentStats: OfficerDashboardStats | null
): OfficerDashboardStats | null {
  if (!currentStats) return null;

  return {
    ...currentStats,
    totalCases: currentStats.totalCases + 1,
    activeCases: currentStats.activeCases + 1,
  };
}

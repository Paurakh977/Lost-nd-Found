'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OfficerNavbar from './dashboard/OfficerNavbar';

interface OfficerLayoutProps {
  children: React.ReactNode;
}

export default function OfficerLayout({ children }: OfficerLayoutProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const storedUser = localStorage.getItem('customUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setLoading(false);
          return;
        }

        // If no stored user, check with API
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user && data.user.role === 'officer') {
            setCurrentUser(data.user);
            localStorage.setItem('customUser', JSON.stringify(data.user));
          } else {
            // Not an officer, redirect to sign-in
            router.push('/sign-in');
          }
        } else {
          // Not authenticated, redirect to sign-in
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('customUser');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show navbar if user is not loaded
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800">
      <OfficerNavbar currentUser={currentUser} onSignOut={handleSignOut} />
      {children}
    </div>
  );
}

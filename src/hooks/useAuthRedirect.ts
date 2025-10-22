'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface UseAuthRedirectOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  fallbackUrl?: string;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Track JWT authentication state
  const [isJWTAuthenticated, setIsJWTAuthenticated] = useState<boolean | null>(null);
  const [isJWTChecked, setIsJWTChecked] = useState(false);

  const {
    requireAuth = false,
    redirectTo = '/search',
    fallbackUrl = '/'
  } = options;
  
  // Check JWT authentication on mount
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (!cancelled) {
          if (response.ok) {
            const data = await response.json();
            setIsJWTAuthenticated(data?.success && data?.user ? true : false);
          } else {
            setIsJWTAuthenticated(false);
          }
          setIsJWTChecked(true);
        }
      } catch (error) {
        if (!cancelled) {
          setIsJWTAuthenticated(false);
          setIsJWTChecked(true);
        }
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, []);
  
  // Combined authentication status - user is authenticated if EITHER Clerk OR JWT succeeds
  const isAuthenticated = isClerkSignedIn || isJWTAuthenticated === true;
  const isLoaded = isClerkLoaded && isJWTChecked;

  // Redirect to sign-in with return URL
  const redirectToSignIn = useCallback((returnUrl?: string) => {
    const targetUrl = returnUrl || window.location.pathname;
    const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(targetUrl)}`;
    router.push(signInUrl);
  }, [router]);

  // Redirect to sign-up with return URL
  const redirectToSignUp = useCallback((returnUrl?: string) => {
    const targetUrl = returnUrl || window.location.pathname;
    const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(targetUrl)}`;
    router.push(signUpUrl);
  }, [router]);

  // Handle protected action (like "Start Free Search")
  const handleProtectedAction = useCallback((targetUrl?: string) => {
    if (!isLoaded) {
      return false; // Still loading, don't do anything
    }

    if (isAuthenticated) {
      // User is authenticated (either Clerk or JWT), proceed to target URL
      router.push(targetUrl || redirectTo);
      return true;
    } else {
      // User is not authenticated, redirect to sign-in
      redirectToSignIn(targetUrl || redirectTo);
      return false;
    }
  }, [isLoaded, isAuthenticated, router, redirectTo, redirectToSignIn]);

  // Auto-redirect based on authentication state
  useEffect(() => {
    if (!isLoaded) return;

    if (requireAuth && !isAuthenticated) {
      redirectToSignIn();
    }
  }, [isLoaded, isAuthenticated, requireAuth, redirectToSignIn]);

  // Handle redirect after successful authentication
  const handleAuthSuccess = useCallback(() => {
    const redirectUrl = searchParams?.get('redirect_url') || fallbackUrl;
    router.push(redirectUrl);
  }, [searchParams, router, fallbackUrl]);

  return {
    isLoaded,
    isSignedIn: isAuthenticated, // Return combined auth status
    isClerkSignedIn, // Also expose individual auth states
    isJWTAuthenticated,
    user,
    redirectToSignIn,
    redirectToSignUp,
    handleProtectedAction,
    handleAuthSuccess,
  };
}

// Specific hook for handling search functionality
export function useSearchRedirect() {
  return useAuthRedirect({
    requireAuth: false,
    redirectTo: '/search',
    fallbackUrl: '/'
  });
}

// Hook for protecting routes that require authentication
export function useProtectedRoute() {
  return useAuthRedirect({
    requireAuth: true,
    fallbackUrl: '/'
  });
}

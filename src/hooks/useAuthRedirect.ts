'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface UseAuthRedirectOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  fallbackUrl?: string;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    requireAuth = false,
    redirectTo = '/search',
    fallbackUrl = '/'
  } = options;

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

    if (isSignedIn) {
      // User is authenticated, proceed to target URL
      router.push(targetUrl || redirectTo);
      return true;
    } else {
      // User is not authenticated, redirect to sign-in
      redirectToSignIn(targetUrl || redirectTo);
      return false;
    }
  }, [isLoaded, isSignedIn, router, redirectTo, redirectToSignIn]);

  // Auto-redirect based on authentication state
  useEffect(() => {
    if (!isLoaded) return;

    if (requireAuth && !isSignedIn) {
      redirectToSignIn();
    }
  }, [isLoaded, isSignedIn, requireAuth, redirectToSignIn]);

  // Handle redirect after successful authentication
  const handleAuthSuccess = useCallback(() => {
    const redirectUrl = searchParams?.get('redirect_url') || fallbackUrl;
    router.push(redirectUrl);
  }, [searchParams, router, fallbackUrl]);

  return {
    isLoaded,
    isSignedIn,
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

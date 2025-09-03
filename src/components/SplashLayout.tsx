'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SplashScreen from './SplashScreen';
import TransitionPage from './TransitionPage';

interface SplashLayoutProps {
  children: React.ReactNode;
}

// Navigation context for intercepting navigation
interface NavigationContextType {
  navigateTo: (path: string) => void;
  isNavigating: boolean;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within SplashLayout');
  }
  return context;
};

const SplashLayout: React.FC<SplashLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const isFirstMount = useRef(true);
  const hasShownSplash = useRef(false);

  // Custom navigation function
  const navigateTo = (path: string) => {
    if (path === pathname) return; // Don't navigate to current page
    
    if (hasShownSplash.current && !showSplash) {
      // Start transition and delay navigation
      setPendingNavigation(path);
      setShowTransition(true);
      setIsNavigating(true);
    } else {
      // Direct navigation (for first visit or during splash)
      router.push(path);
    }
  };

  // Handle initial splash screen - ONLY on first visit
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      
      // Check if this is a fresh visit
      const lastVisit = localStorage.getItem('lastVisit');
      const currentTime = Date.now();
      
      // If no lastVisit or more than 1 second ago (indicates refresh/new visit)
      if (!lastVisit || currentTime - parseInt(lastVisit) > 1000) {
        setShowSplash(true);
        hasShownSplash.current = true;
      }
      
      // Update last visit time
      localStorage.setItem('lastVisit', currentTime.toString());
    }
  }, []); // Only run once on mount

  // Handle navigation after panels are closed
  useEffect(() => {
    if (pendingNavigation && !isNavigating) {
      // Navigation has been completed, reset state
      setPendingNavigation(null);
    }
  }, [pendingNavigation, isNavigating]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Ensure we don't show transition immediately after splash
    setTimeout(() => {
      hasShownSplash.current = true;
    }, 100);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    setIsNavigating(false);
    setPendingNavigation(null);
  };

  // Handle transition phases
  const handleTransitionPhase = (phase: 'closing' | 'closed' | 'opening') => {
    if (phase === 'closed' && pendingNavigation) {
      // Panels are fully closed, now navigate to the new page immediately
      // Use replace to avoid adding to history stack
      setTimeout(() => {
        router.replace(pendingNavigation);
      }, 10); // Small delay to ensure smooth transition
    }
  };

  const navigationContextValue: NavigationContextType = {
    navigateTo,
    isNavigating,
  };

  return (
    <NavigationContext.Provider value={navigationContextValue}>
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {showTransition && (
        <TransitionPage 
          onComplete={handleTransitionComplete}
          onPhaseChange={handleTransitionPhase}
        />
      )}
      {/* Keep children visible during transition for glass effect */}
      <div 
        className={showSplash ? 'hidden' : ''} 
        style={{ 
          visibility: showTransition ? 'visible' : 'visible',
          position: 'relative',
          zIndex: showTransition ? 1 : 'auto'
        }}
      >
        {children}
      </div>
    </NavigationContext.Provider>
  );
};

export default SplashLayout;
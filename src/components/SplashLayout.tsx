'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import SplashScreen from './SplashScreen';
import TransitionPage from './TransitionPage';

interface SplashLayoutProps {
  children: React.ReactNode;
}

const SplashLayout: React.FC<SplashLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [previousPath, setPreviousPath] = useState('');
  const isFirstMount = useRef(true);
  const hasShownSplash = useRef(false);

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
      setPreviousPath(pathname);
    }
  }, []); // Only run once on mount

  // Handle page transitions - ONLY during navigation
  useEffect(() => {
    if (isFirstMount.current) return; // Skip on first mount
    
    // If path changed and we've already shown splash, show transition
    if (pathname !== previousPath && previousPath !== '' && hasShownSplash.current && !showSplash) {
      setShowTransition(true);
      setPreviousPath(pathname);
    }
  }, [pathname, previousPath, showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Ensure we don't show transition immediately after splash
    setTimeout(() => {
      hasShownSplash.current = true;
    }, 100);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
  };

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {showTransition && (
        <TransitionPage onComplete={handleTransitionComplete} />
      )}
      <div className={showSplash || showTransition ? 'hidden' : ''}>
        {children}
      </div>
    </>
  );
};

export default SplashLayout;
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SplashScreen from './SplashScreen';
import TransitionPage from './TransitionPage';

interface SplashLayoutProps {
  children: React.ReactNode;
}

const SplashLayout: React.FC<SplashLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [previousPath, setPreviousPath] = useState('');

  // Handle initial splash screen
  useEffect(() => {
    // Always show splash on page load/refresh
    // Use a timestamp to detect actual page refresh vs navigation
    const currentTime = Date.now();
    const lastVisit = localStorage.getItem('lastVisit');
    
    // If no lastVisit or more than 1 second ago (indicates refresh/new visit)
    if (!lastVisit || currentTime - parseInt(lastVisit) > 1000) {
      setShowSplash(true);
      setIsFirstVisit(true);
    }
    
    // Update last visit time
    localStorage.setItem('lastVisit', currentTime.toString());
    
    // Initialize previous path
    setPreviousPath(pathname);
  }, []);

  // Handle page transitions
  useEffect(() => {
    // Skip on initial render
    if (previousPath === '') {
      return;
    }
    
    // If path changed, show transition
    if (pathname !== previousPath) {
      setShowTransition(true);
      setPreviousPath(pathname);
    }
  }, [pathname, previousPath]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
  };

  return (
    <>
      {showSplash && isFirstVisit && (
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
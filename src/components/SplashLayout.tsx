'use client';

import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';

interface SplashLayoutProps {
  children: React.ReactNode;
}

const SplashLayout: React.FC<SplashLayoutProps> = ({ children }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

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
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && isFirstVisit && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      <div className={showSplash ? 'hidden' : ''}>
        {children}
      </div>
    </>
  );
};

export default SplashLayout;
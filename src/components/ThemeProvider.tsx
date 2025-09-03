'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      isDark: false,
      toggleTheme: () => {},
      mounted: false,
    };
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Debounce timer ref to prevent rapid consecutive toggles
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memoized toggle function with debouncing to prevent unnecessary re-renders
  const toggleTheme = useCallback(() => {
    // Prevent rapid consecutive toggles
    if (debounceTimerRef.current) return;
    
    // Set a debounce timer to prevent multiple toggles in quick succession
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
    }, 300); // 300ms debounce time
    
    setIsDark(prev => {
      const newTheme = !prev;
      // Use requestAnimationFrame for smoother DOM updates
      requestAnimationFrame(() => {
        if (newTheme) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      });
      return newTheme;
    });
  }, []);

  // Single useEffect for initialization
  useEffect(() => {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    let initialTheme = false; // Default to light
    
    if (savedTheme === 'dark') {
      initialTheme = true;
    } else if (savedTheme === 'light') {
      initialTheme = false;
    } else {
      // No saved preference - default to light
      initialTheme = false;
    }
    
    // Apply theme immediately to prevent flash
    if (initialTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setIsDark(initialTheme);
    setMounted(true);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    isDark,
    toggleTheme,
    mounted
  }), [isDark, toggleTheme, mounted]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
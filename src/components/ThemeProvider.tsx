'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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

  // Memoized toggle function to prevent unnecessary re-renders
  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newTheme = !prev;
      // Immediately update DOM and localStorage
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
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
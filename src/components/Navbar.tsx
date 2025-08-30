'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Info, Mail } from 'lucide-react';
import { cn } from "../lib/utlis";
import { useNavigation } from './SplashLayout';
import { useTheme } from './ThemeProvider';
  import SkyToggle from './ui/SkyToggle';

interface NavItem {
  name: string;
  url: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

// Using the optimized SkyToggle component from './ui/SkyToggle'

// Optimized Navbar Component with improved performance
const Navbar: React.FC = () => {
  const { isDark, toggleTheme, mounted } = useTheme();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Home');
  const pathname = usePathname();
  const { navigateTo, isNavigating } = useNavigation();
  
  // Use a ref to track if this is the initial render
  const isInitialRender = React.useRef(true);

  // Memoize nav items to prevent recreation
  const navItems: NavItem[] = useMemo(() => [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '/about', icon: Info },
    { name: 'Contact', url: '/contact', icon: Mail },
  ], []);

  // Memoized handlers
  const handleTabHover = useCallback((tabName: string | null) => {
    setHoveredTab(tabName);
  }, []);

  const handleTabClick = useCallback((name: string, url: string) => {
    if (!isNavigating) {
      setActiveTab(name);
      navigateTo(url);
    }
  }, [isNavigating, navigateTo]);

  const handleLogoClick = useCallback(() => {
    if (!isNavigating) {
      setActiveTab('Home');
      navigateTo('/');
    }
  }, [isNavigating, navigateTo]);

  // Update active tab based on pathname - optimized to prevent unnecessary updates
  useEffect(() => {
    const currentItem = navItems.find(item => item.url === pathname);
    if (currentItem && currentItem.name !== activeTab) {
      setActiveTab(currentItem.name);
    }
    
    // Mark initial render complete
    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
  }, [pathname, navItems, activeTab]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 pt-6">
        <div className="flex justify-center">
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xl py-2 px-3 rounded-full shadow-lg h-14 w-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-6">
      <div className="flex justify-center">
        <motion.div 
          className="flex items-center gap-1 bg-white/80 dark:bg-black/80 border border-gray-200/50 dark:border-white/10 backdrop-blur-xl py-2 px-3 rounded-full shadow-lg relative"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-white/5"
            disabled={isNavigating}
          >
            <motion.div 
              className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-xs">G</span>
            </motion.div>
            <span className="text-sm font-bold text-gray-800 dark:text-white hidden sm:block">GOTUS</span>
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            const isHovered = hoveredTab === item.name;

            return (
              <button
                key={item.name}
                onClick={() => handleTabClick(item.name, item.url)}
                onMouseEnter={() => handleTabHover(item.name)}
                onMouseLeave={() => handleTabHover(null)}
                disabled={isNavigating}
                className={cn(
                  "relative cursor-pointer text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2",
                  "text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white",
                  isActive && "text-blue-600 dark:text-blue-400",
                  isNavigating && "opacity-50 cursor-not-allowed"
                )}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0.1, 0.2, 0.1],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-sm" />
                    <div className="absolute inset-[-2px] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-md" />
                  </motion.div>
                )}

                <motion.span 
                  className="relative z-10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={16} strokeWidth={2} className="sm:hidden" />
                  <span className="hidden sm:inline">{item.name}</span>
                </motion.span>

                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-gray-100/50 dark:bg-white/5 rounded-full -z-10"
                    />
                  )}
                </AnimatePresence>

                {/* Cute mascot for active item */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-mascot"
                    className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <motion.div 
                      className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs"
                      animate={{
                        y: [0, -2, 0],
                        rotate: isHovered ? [0, -10, 10, 0] : 0,
                        scale: isHovered ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        y: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        },
                        rotate: {
                          duration: 0.5,
                        },
                        scale: {
                          duration: 0.3,
                        }
                      }}
                    >
                      ✨
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-500 rotate-45 transform -translate-x-1/2"
                      animate={{
                        y: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    />
                  </motion.div>
                )}
              </button>
            );
          })}

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* Sky Toggle - Optimized with external component */}
          <div className="flex items-center h-10">
            <motion.div
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              // Use layout transition to prevent layout shifts
              layout
              layoutId="theme-toggle"
            >
              <SkyToggle isDark={isDark} onToggle={toggleTheme} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Navbar;
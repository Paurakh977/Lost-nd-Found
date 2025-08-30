'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Info, Mail } from 'lucide-react';
import { cn } from "../lib/utlis";
import { useNavigation } from './SplashLayout';
import { useTheme } from './ThemeProvider';

interface NavItem {
  name: string;
  url: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

// Optimized Sky Toggle Component
const SkyToggle = React.memo<{ isDark: boolean; onToggle: () => void }>(({ isDark, onToggle }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <label className="theme-switch cursor-pointer flex items-center">
        <input 
          type="checkbox" 
          className="theme-switch__checkbox" 
          checked={isDark}
          onChange={onToggle}
        />
        <div className="theme-switch__container">
          <div className="theme-switch__clouds" />
          <div className="theme-switch__stars-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor" />
            </svg>
          </div>
          <div className="theme-switch__circle-container">
            <div className="theme-switch__sun-moon-container">
              <div className="theme-switch__moon">
                <div className="theme-switch__spot" />
                <div className="theme-switch__spot" />
                <div className="theme-switch__spot" />
              </div>
            </div>
          </div>
        </div>
      </label>
      
      <style jsx>{`
        .theme-switch {
          --toggle-size: 20px;
          --container-width: 4em;
          --container-height: 2em;
          --container-radius: 4em;
          --container-light-bg: #3D7EAE;
          --container-night-bg: #1D1F2C;
          --circle-container-diameter: 2.4em;
          --sun-moon-diameter: 1.6em;
          --sun-bg: #ECCA2F;
          --moon-bg: #C4C9D1;
          --spot-color: #959DB1;
          --circle-container-offset: calc((var(--circle-container-diameter) - var(--container-height)) / 2 * -1);
          --stars-color: #fff;
          --clouds-color: #F3FDFF;
          --back-clouds-color: #AACADF;
          --transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
          --circle-transition: .2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-switch, .theme-switch *, .theme-switch *::before, .theme-switch *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-size: var(--toggle-size);
        }

        .theme-switch__container {
          width: var(--container-width);
          height: var(--container-height);
          background-color: var(--container-light-bg);
          border-radius: var(--container-radius);
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0em -0.062em 0.062em rgba(0, 0, 0, 0.25), 0em 0.062em 0.125em rgba(255, 255, 255, 0.94);
          transition: var(--transition);
          position: relative;
          display: flex;
          align-items: center;
          will-change: background-color;
        }

        .theme-switch__container::before {
          content: "";
          position: absolute;
          z-index: 1;
          inset: 0;
          box-shadow: 0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset, 0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset;
          border-radius: var(--container-radius);
        }

        .theme-switch__checkbox {
          display: none;
        }

        .theme-switch__circle-container {
          width: var(--circle-container-diameter);
          height: var(--circle-container-diameter);
          background-color: rgba(255, 255, 255, 0.1);
          position: absolute;
          left: calc(var(--circle-container-offset) + 0.4em);
          top: calc(var(--circle-container-offset) + 0.4em);
          border-radius: var(--container-radius);
          box-shadow: inset 0 0 0 2.4em rgba(255, 255, 255, 0.1), 0 0 0 0.5em rgba(255, 255, 255, 0.1), 0 0 0 1em rgba(255, 255, 255, 0.1);
          display: flex;
          transition: var(--circle-transition);
          pointer-events: none;
          will-change: left;
        }

        .theme-switch__sun-moon-container {
          pointer-events: auto;
          position: relative;
          z-index: 2;
          width: var(--sun-moon-diameter);
          height: var(--sun-moon-diameter);
          margin: auto;
          border-radius: var(--container-radius);
          background-color: var(--sun-bg);
          box-shadow: 0.062em 0.062em 0.062em 0em rgba(254, 255, 239, 0.61) inset, 0em -0.062em 0.062em 0em #a1872a inset;
          filter: drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25)) drop-shadow(0em 0.062em 0.125em rgba(0, 0, 0, 0.25));
          overflow: hidden;
          transition: var(--transition);
        }

        .theme-switch__moon {
          transform: translateX(100%);
          width: 100%;
          height: 100%;
          background-color: var(--moon-bg);
          border-radius: inherit;
          box-shadow: 0.062em 0.062em 0.062em 0em rgba(254, 255, 239, 0.61) inset, 0em -0.062em 0.062em 0em #969696 inset;
          transition: var(--transition);
          position: relative;
          will-change: transform;
        }

        .theme-switch__spot {
          position: absolute;
          top: 0.6em;
          left: 0.25em;
          width: 0.6em;
          height: 0.6em;
          border-radius: var(--container-radius);
          background-color: var(--spot-color);
          box-shadow: 0em 0.0312em 0.062em rgba(0, 0, 0, 0.25) inset;
        }

        .theme-switch__spot:nth-of-type(2) {
          width: 0.3em;
          height: 0.3em;
          top: 0.75em;
          left: 1.1em;
        }

        .theme-switch__spot:nth-last-of-type(3) {
          width: 0.2em;
          height: 0.2em;
          top: 0.25em;
          left: 0.65em;
        }

        .theme-switch__clouds {
          width: 1em;
          height: 1em;
          background-color: var(--clouds-color);
          border-radius: var(--container-radius);
          position: absolute;
          bottom: -0.5em;
          left: 0.25em;
          box-shadow: 0.75em 0.25em var(--clouds-color), -0.25em -0.25em var(--back-clouds-color), 1.15em 0.3em var(--clouds-color), 0.4em -0.1em var(--back-clouds-color), 1.75em 0 var(--clouds-color), 1em -0.05em var(--back-clouds-color), 2.35em 0.25em var(--clouds-color), 1.6em -0.25em var(--back-clouds-color), 2.9em -0.05em var(--clouds-color), 2.1em 0em var(--back-clouds-color), 3.6em -0.25em var(--clouds-color), 2.7em -0.35em var(--back-clouds-color);
          transition: var(--transition);
          will-change: bottom;
        }

        .theme-switch__stars-container {
          position: absolute;
          color: var(--stars-color);
          top: -100%;
          left: 0.25em;
          width: 2.2em;
          height: auto;
          transition: var(--transition);
          will-change: top, transform;
        }

        /* Checked state styles */
        .theme-switch__checkbox:checked + .theme-switch__container {
          background-color: var(--container-night-bg);
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__circle-container {
          left: calc(100% - var(--circle-container-offset) - var(--circle-container-diameter));
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__circle-container:hover {
          left: calc(100% - var(--circle-container-offset) - var(--circle-container-diameter) - 0.15em);
        }

        .theme-switch__circle-container:hover {
          left: calc(var(--circle-container-offset) + 0.15em);
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__moon {
          transform: translate(0);
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__clouds {
          bottom: -3.2em;
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__stars-container {
          top: 50%;
          transform: translateY(-50%);
        }
      `}</style>
    </div>
  );
});

SkyToggle.displayName = 'SkyToggle';

// Optimized Navbar Component
const Navbar: React.FC = () => {
  const { isDark, toggleTheme, mounted } = useTheme();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Home');
  const pathname = usePathname();
  const { navigateTo, isNavigating } = useNavigation();

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

  // Update active tab based on pathname
  useEffect(() => {
    const currentItem = navItems.find(item => item.url === pathname);
    if (currentItem) {
      setActiveTab(currentItem.name);
    }
  }, [pathname, navItems]);

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

          {/* Sky Toggle */}
          <div className="flex items-center h-10">
            <motion.div
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Info, Mail, Circle } from 'lucide-react';
import { cn } from "../lib/utlis";
import { useNavigation } from './SplashLayout';
import { useTheme } from './ThemeProvider';
import SkyToggle from './ui/SkyToggle';

interface NavItem {
  name: string;
  url: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

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
                  "relative cursor-pointer text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300",
                  "text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white",
                  isActive && "text-blue-600 dark:text-white",
                  isNavigating && "opacity-50 cursor-not-allowed"
                )}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.03, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="absolute inset-0 bg-blue-500/25 dark:bg-blue-400/25 rounded-full blur-md" />
                    <div className="absolute inset-[-4px] bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-xl" />
                    <div className="absolute inset-[-8px] bg-blue-500/15 dark:bg-blue-400/15 rounded-full blur-2xl" />
                    <div className="absolute inset-[-12px] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl" />

                    <div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 dark:from-blue-400/0 dark:via-blue-400/20 dark:to-blue-400/0"
                      style={{
                        animation: "shine 3s ease-in-out infinite"
                      }}
                    />
                  </motion.div>
                )}

                <motion.span
                  className="hidden sm:inline relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
                <motion.span
                  className="sm:hidden relative z-10"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={18} strokeWidth={2.5} />
                </motion.span>

                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    />
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div
                    layoutId="anime-mascot"
                    className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="relative w-12 h-12">
                      <motion.div
                        className="
            absolute w-10 h-10 
            bg-gray-50 dark:bg-white            /* Light: off-white for contrast, Dark: pure white */
            border border-gray-400 dark:border-transparent  /* Stronger border only in light mode */
            shadow-lg dark:shadow-sm            /* Stronger shadow in light mode */
            rounded-full 
            ring-1 ring-gray-300 dark:ring-transparent /* Subtle ring for extra contrast in light mode */
            left-1/2 -translate-x-1/2
            "
                        animate={
                          isHovered ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, -5, 5, 0],
                            transition: {
                              duration: 0.5,
                              ease: "easeInOut"
                            }
                          } : {
                            y: [0, -3, 0],
                            transition: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }
                          }
                        }
                      >
                        <motion.div
                          className="absolute w-2 h-2 bg-black rounded-full"
                          animate={
                            isHovered ? {
                              scaleY: [1, 0.2, 1],
                              transition: {
                                duration: 0.2,
                                times: [0, 0.5, 1]
                              }
                            } : {}
                          }
                          style={{ left: '25%', top: '40%' }}
                        />
                        <motion.div
                          className="absolute w-2 h-2 bg-black rounded-full"
                          animate={
                            isHovered ? {
                              scaleY: [1, 0.2, 1],
                              transition: {
                                duration: 0.2,
                                times: [0, 0.5, 1]
                              }
                            } : {}
                          }
                          style={{ right: '25%', top: '40%' }}
                        />
                        <motion.div
                          className="absolute w-2 h-1.5 bg-pink-300 rounded-full"
                          animate={{
                            opacity: isHovered ? 0.8 : 0.6
                          }}
                          style={{ left: '15%', top: '55%' }}
                        />
                        <motion.div
                          className="absolute w-2 h-1.5 bg-pink-300 rounded-full"
                          animate={{
                            opacity: isHovered ? 0.8 : 0.6
                          }}
                          style={{ right: '15%', top: '55%' }}
                        />

                        <motion.div
                          className="absolute w-4 h-2 border-b-2 border-black rounded-full"
                          animate={
                            isHovered ? {
                              scaleY: 1.5,
                              y: -1
                            } : {
                              scaleY: 1,
                              y: 0
                            }
                          }
                          style={{ left: '30%', top: '60%' }}
                        />
                        <AnimatePresence>
                          {isHovered && (
                            <>
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute -top-1 -right-1 w-2 h-2 text-yellow-300"
                              >
                                ✨
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ delay: 0.1 }}
                                className="absolute -top-2 left-0 w-2 h-2 text-yellow-300"
                              >
                                ✨
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-1 left-1/2 w-4 h-4 -translate-x-1/2"
                        animate={
                          isHovered ? {
                            y: [0, -4, 0],
                            transition: {
                              duration: 0.3,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }
                          } : {
                            y: [0, 2, 0],
                            transition: {
                              duration: 1,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.5
                            }
                          }
                        }
                      >
                        <div className="
    w-full h-full 
    bg-gray-50 dark:bg-white    /* Light: subtle gray, Dark: pure white */
    border border-gray-400 dark:border-transparent /* Outline in light mode */
    shadow-md dark:shadow-sm    /* Stronger shadow in light mode */
    rotate-45 transform origin-center
  " />
                      </motion.div>
                    </div>
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
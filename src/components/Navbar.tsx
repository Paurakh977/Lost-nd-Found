'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Info, Mail, Circle, LogIn, UserPlus, Bot } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { cn } from "../lib/utlis";
import { useNavigation } from './SplashLayout';
import { useTheme } from './ThemeProvider';
import SkyToggle from './ui/SkyToggle';
import UserProfile from './UserProfile';

interface NavItem {
  name: string;
  url: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

const Navbar: React.FC = () => {
  const { isDark, toggleTheme, mounted } = useTheme();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
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
    { name: 'Agentic Search', url: '/search', icon: Bot },
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

  const handleSignInClick = useCallback(() => {
    if (!isNavigating) {
      navigateTo('/sign-in');
    }
  }, [isNavigating, navigateTo]);

  const handleSignUpClick = useCallback(() => {
    if (!isNavigating) {
      navigateTo('/sign-up');
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
    <div className="fixed top-0 left-0 right-0 z-[55] pt-3 sm:pt-6 px-2 sm:px-0">
      <div className="flex justify-center">
        <motion.div
          className="flex items-center gap-0.5 sm:gap-1 bg-white/80 dark:bg-black/80 border border-gray-200/50 dark:border-white/10 backdrop-blur-xl py-1.5 sm:py-2 px-2 sm:px-3 rounded-full shadow-lg relative max-w-[95vw]"
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
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-white/5"
            disabled={isNavigating}
          >
            <motion.div
              className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-[10px] sm:text-xs">G</span>
            </motion.div>
            <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white hidden sm:block">GOTUS</span>
          </button>

          <div className="w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 mx-1 sm:mx-2" />

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
                  "relative cursor-pointer text-xs sm:text-sm font-semibold px-2 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full transition-all duration-300",
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
                  className="hidden md:inline relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
                <motion.span
                  className="hidden sm:inline md:hidden relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name === 'Agentic Search' ? 'AI Search' : item.name}
                </motion.span>
                <motion.span
                  className="sm:hidden relative z-10"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={16} strokeWidth={2.5} />
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
                    className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-[60]"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }}
                  >
                    <div className="relative w-10 h-10">
                      <motion.div
                        className="absolute w-8 h-8 bg-gray-50 dark:bg-white border border-gray-400 dark:border-transparent shadow-lg dark:shadow-sm rounded-full ring-1 ring-gray-300 dark:ring-transparent left-1/2 -translate-x-1/2"
                        animate={
                          isHovered ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, -5, 5, 0],
                            transition: {
                              duration: 0.5,
                              ease: "easeInOut"
                            }
                          } : {
                            y: [0, -2, 0],
                            transition: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }
                          }
                        }
                      >
                        <motion.div
                          className="absolute w-1.5 h-1.5 bg-black rounded-full"
                          animate={
                            isHovered ? {
                              scaleY: [1, 0.2, 1],
                              transition: {
                                duration: 0.2,
                                times: [0, 0.5, 1]
                              }
                            } : {}
                          }
                          style={{ left: '25%', top: '35%' }}
                        />
                        <motion.div
                          className="absolute w-1.5 h-1.5 bg-black rounded-full"
                          animate={
                            isHovered ? {
                              scaleY: [1, 0.2, 1],
                              transition: {
                                duration: 0.2,
                                times: [0, 0.5, 1]
                              }
                            } : {}
                          }
                          style={{ right: '25%', top: '35%' }}
                        />
                        <motion.div
                          className="absolute w-1.5 h-1 bg-pink-300 rounded-full"
                          animate={{
                            opacity: isHovered ? 0.8 : 0.6
                          }}
                          style={{ left: '15%', top: '50%' }}
                        />
                        <motion.div
                          className="absolute w-1.5 h-1 bg-pink-300 rounded-full"
                          animate={{
                            opacity: isHovered ? 0.8 : 0.6
                          }}
                          style={{ right: '15%', top: '50%' }}
                        />

                        <motion.div
                          className="absolute w-3 h-1.5 border-b-2 border-black rounded-full"
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
                        className="absolute -bottom-0.5 left-1/2 w-3 h-3 -translate-x-1/2"
                        animate={
                          isHovered ? {
                            y: [0, -3, 0],
                            transition: {
                              duration: 0.3,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }
                          } : {
                            y: [0, 1, 0],
                            transition: {
                              duration: 1,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.5
                            }
                          }
                        }
                      >
                        <div className="w-full h-full bg-gray-50 dark:bg-white border border-gray-400 dark:border-transparent shadow-md dark:shadow-sm rotate-45 transform origin-center" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </button>
            );
          })}

          <div className="w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 mx-1 sm:mx-2" />

          {/* Authentication Section */}
          {isLoaded ? (
            isSignedIn ? (
              // Show user profile when authenticated
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Theme Toggle */}
                <motion.div
                  className="flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                  layoutId="theme-toggle"
                >
                  <SkyToggle isDark={isDark} onToggle={toggleTheme} />
                </motion.div>
                
                {/* User Profile */}
                <UserProfile />
              </div>
            ) : (
              // Show sign in/up buttons when not authenticated
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Theme Toggle */}
                <motion.div
                  className="flex items-center justify-center mr-1 sm:mr-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                  layoutId="theme-toggle"
                >
                  <SkyToggle isDark={isDark} onToggle={toggleTheme} />
                </motion.div>

                {/* Sign In Button */}
                <motion.button
                  onClick={handleSignInClick}
                  disabled={isNavigating}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <LogIn size={14} strokeWidth={2} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </motion.button>

                {/* Sign Up Button with Enhanced Shine Effect */}
                <motion.button
                  onClick={handleSignUpClick}
                  disabled={isNavigating}
                  className="relative flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-full shadow-md hover:shadow-lg overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Base gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-900 to-black" />
                  
                  {/* Moving shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 70%, transparent)',
                      width: '200%',
                    }}
                  />
                  
                  {/* Subtle aurora glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-purple-500/10 opacity-50" />
                  
                  {/* Button content */}
                  <div className="relative z-10 flex items-center gap-1">
                    <UserPlus size={14} strokeWidth={2} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </div>
                </motion.button>
              </div>
            )
          ) : (
            // Loading state
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Navbar;
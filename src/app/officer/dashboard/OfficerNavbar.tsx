'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  ChevronDown,
  LogOut,
  UserCheck,
  Search,
  FileText,
  Shield,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Home,
  Settings,
  Menu,
  X,
  Package,
  Eye,
  Activity
} from 'lucide-react';

interface OfficerNavbarProps {
  currentUser: any;
  onSignOut: () => void;
}

export default function OfficerNavbar({ currentUser, onSignOut }: OfficerNavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [notifications] = useState(12); // Mock notification count
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Fixed Sign out handler
  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    setIsSigningOut(true);
    setActiveDropdown(null); // Close dropdown immediately
    
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear localStorage regardless of API response
      localStorage.removeItem('customUser');
      
      // Call the parent onSignOut callback if provided
      if (onSignOut && typeof onSignOut === 'function') {
        onSignOut();
      }
      
      // Force redirect to sign-in page
      window.location.href = '/sign-in';
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local data and redirect
      localStorage.removeItem('customUser');
      
      if (onSignOut && typeof onSignOut === 'function') {
        onSignOut();
      }
      
      window.location.href = '/sign-in';
    } finally {
      setIsSigningOut(false);
    }
  };

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      x: -300,
      transition: { duration: 0.3 }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const menuItems = [
    {
      name: 'Reports',
      icon: FileText,
      href: '/officer/reports',
      items: [
        { name: 'Lost Item Reports', count: 45, color: 'text-red-600', href: '/officer/reports/lost' },
        { name: 'Found Item Reports', count: 32, color: 'text-green-600', href: '/officer/reports/found' },
        { name: 'All Reports', count: 77, color: 'text-blue-600', href: '/officer/reports/all' }
      ]
    },
    {
      name: 'Cases',
      icon: Shield,
      href: '/officer/cases',
      items: [
        { name: 'Active Cases', count: 23, color: 'text-orange-600', href: '/officer/cases/active' },
        { name: 'Under Investigation', count: 15, color: 'text-yellow-600', href: '/officer/cases/investigation' },
        { name: 'Resolved Cases', count: 133, color: 'text-green-600', href: '/officer/cases/resolved' },
        { name: 'Closed Cases', count: 89, color: 'text-gray-600', href: '/officer/cases/closed' }
      ]
    },
    {
      name: 'Verification',
      icon: CheckCircle,
      href: '/officer/verification',
      items: [
        { name: 'Pending Verification', count: 8, color: 'text-orange-600', href: '/officer/verification/pending' },
        { name: 'In Progress', count: 12, color: 'text-blue-600', href: '/officer/verification/progress' },
        { name: 'Verified Claims', count: 156, color: 'text-green-600', href: '/officer/verification/verified' },
        { name: 'Rejected Claims', count: 23, color: 'text-red-600', href: '/officer/verification/rejected' }
      ]
    },
    {
      name: 'Tracking',
      icon: Search,
      href: '/officer/tracking',
      items: [
        { name: 'Item Tracking', count: 0, color: 'text-blue-600', href: '/officer/tracking/items' },
        { name: 'Case Timeline', count: 0, color: 'text-purple-600', href: '/officer/tracking/timeline' },
        { name: 'Status Updates', count: 0, color: 'text-indigo-600', href: '/officer/tracking/updates' }
      ]
    }
  ];

  const notificationItems = [
    {
      id: '1',
      title: 'New Lost Report',
      description: 'iPhone 15 Pro reported lost at Central Mall',
      time: '5 min ago',
      type: 'urgent',
      read: false
    },
    {
      id: '2',
      title: 'Match Found',
      description: 'Potential match for wallet case #2024-001',
      time: '1 hour ago',
      type: 'success',
      read: false
    },
    {
      id: '3',
      title: 'Verification Required',
      description: 'Document verification needed for case #2024-045',
      time: '2 hours ago',
      type: 'warning',
      read: true
    },
    {
      id: '4',
      title: 'Case Resolved',
      description: 'Laptop successfully returned to owner',
      time: '1 day ago',
      type: 'info',
      read: true
    }
  ];

  const handleNavigation = (href: string) => {
    console.log(`Navigate to: ${href}`);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    GOTUS
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Officer Portal</p>
                </div>
              </div>
            </motion.div>

            {/* Desktop Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                onClick={() => handleNavigation('/officer/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">Dashboard</span>
              </motion.button>

              {menuItems.map((menu) => (
                <div key={menu.name} className="relative">
                  <motion.button
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                    onClick={() => toggleDropdown(menu.name)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <menu.icon className="w-4 h-4" />
                    <span className="font-medium">{menu.name}</span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === menu.name ? 'rotate-180' : ''
                      }`} 
                    />
                  </motion.button>

                  <AnimatePresence>
                    {activeDropdown === menu.name && (
                      <motion.div
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        {menu.items.map((item, index) => (
                          <motion.button
                            key={item.name}
                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
                            onClick={() => handleNavigation(item.href)}
                            whileHover={{ x: 4 }}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            {item.count > 0 && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gray-100 ${item.color}`}>
                                {item.count}
                              </span>
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Side - User Menu */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Mobile Menu Button */}
              <motion.button
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                onClick={toggleMobileMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                  onClick={() => toggleDropdown('notifications')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {notifications > 9 ? '9+' : notifications}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {activeDropdown === 'notifications' && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50 max-h-96 overflow-y-auto"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            Mark all as read
                          </button>
                        </div>
                      </div>
                      
                      {notificationItems.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-2 ${
                            notification.read ? 'border-transparent' : 'border-blue-500 bg-blue-50/30'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </p>
                              <p className={`text-xs mt-1 ${
                                notification.read ? 'text-gray-500' : 'text-gray-600'
                              }`}>
                                {notification.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      
                      <div className="px-4 py-3 border-t border-gray-100">
                        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <motion.button
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50/50 rounded-lg transition-all duration-200"
                  onClick={() => toggleDropdown('profile')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {currentUser?.department} • Officer
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block ${
                      activeDropdown === 'profile' ? 'rotate-180' : ''
                    }`} 
                  />
                </motion.button>

                <AnimatePresence>
                  {activeDropdown === 'profile' && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                        <p className="text-xs text-gray-500">{currentUser?.department}</p>
                      </div>
                      
                      <motion.button
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => handleNavigation('/officer/profile')}
                        whileHover={{ x: 4 }}
                      >
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Profile</span>
                      </motion.button>
                      
                      <motion.button
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => handleNavigation('/officer/settings')}
                        whileHover={{ x: 4 }}
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Settings</span>
                      </motion.button>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <motion.button
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-150 ${
                          isSigningOut 
                            ? 'bg-red-50 text-red-400 cursor-not-allowed' 
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        whileHover={!isSigningOut ? { x: 4 } : {}}
                      >
                        <LogOut className={`w-4 h-4 ${isSigningOut ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">
                          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                        </span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              className="fixed top-16 left-0 right-0 bg-white shadow-xl z-50 lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Dashboard */}
                <motion.button
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => handleNavigation('/officer/dashboard')}
                  whileHover={{ x: 4 }}
                >
                  <Home className="w-5 h-5 text-gray-600" />
                  <span className="text-base font-medium text-gray-900">Dashboard</span>
                </motion.button>

                {/* Menu Items */}
                {menuItems.map((menu, menuIndex) => (
                  <div key={menu.name} className="space-y-2">
                    <motion.div
                      className="flex items-center space-x-3 px-4 py-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: menuIndex * 0.1 }}
                    >
                      <menu.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-base font-semibold text-gray-900">{menu.name}</span>
                    </motion.div>
                    <div className="ml-6 space-y-1">
                      {menu.items.map((item, itemIndex) => (
                        <motion.button
                          key={item.name}
                          className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => handleNavigation(item.href)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (menuIndex * 0.1) + (itemIndex * 0.05) }}
                        >
                          <span className="text-sm text-gray-700">{item.name}</span>
                          {item.count > 0 && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gray-100 ${item.color}`}>
                              {item.count}
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Mobile Sign Out Button */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <motion.button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isSigningOut 
                        ? 'bg-red-50 text-red-400 cursor-not-allowed' 
                        : 'hover:bg-red-50 text-red-600'
                    }`}
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    whileHover={!isSigningOut ? { x: 4 } : {}}
                  >
                    <LogOut className={`w-5 h-5 ${isSigningOut ? 'animate-spin' : ''}`} />
                    <span className="text-base font-medium">
                      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
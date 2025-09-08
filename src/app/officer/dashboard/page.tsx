'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Users, 
  Clock, 
  LogOut,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OfficerStats {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  pendingReviews: number;
}

export default function OfficerDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<OfficerStats>({
    totalCases: 0,
    activeCases: 0,
    resolvedCases: 0,
    pendingReviews: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get current user from localStorage
    const customUser = localStorage.getItem('customUser');
    if (customUser) {
      try {
        const userData = JSON.parse(customUser);
        if (userData.role !== 'officer') {
          router.push('/');
          return;
        }
        setCurrentUser(userData);
      } catch (error) {
        router.push('/sign-in');
        return;
      }
    } else {
      router.push('/sign-in');
      return;
    }

    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalCases: 156,
        activeCases: 23,
        resolvedCases: 133,
        pendingReviews: 8
      });
      setIsLoading(false);
    }, 1000);
  }, [router]);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        localStorage.removeItem('customUser');
        window.location.href = '/sign-in';
      } else {
        console.error('Sign out failed:', response.status);
        // Still clear local storage and redirect
        localStorage.removeItem('customUser');
        window.location.href = '/sign-in';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local storage and redirect
      localStorage.removeItem('customUser');
      window.location.href = '/sign-in';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Officer Dashboard</h1>
                <p className="text-sm text-gray-500">Manage cases and track progress</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-xs text-gray-500">{currentUser?.department} • Officer</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {currentUser?.firstName}!</h2>
              <p className="text-blue-100 mt-1">Here's what's happening in your department today.</p>
            </div>
            <div className="hidden md:block">
              <Calendar className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cases</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCases}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Cases</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeCases}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resolved Cases</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolvedCases}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingReviews}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Search functionality coming soon!')}
              >
                <Search className="w-5 h-5 text-blue-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Search Records</p>
                  <p className="text-xs text-gray-500">Find specific cases or reports</p>
                </div>
              </motion.button>
              
              <motion.button 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Report creation coming soon!')}
              >
                <FileText className="w-5 h-5 text-green-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Create Report</p>
                  <p className="text-xs text-gray-500">Generate new case report</p>
                </div>
              </motion.button>
              
              <motion.button 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Team collaboration coming soon!')}
              >
                <Users className="w-5 h-5 text-purple-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Team Collaboration</p>
                  <p className="text-xs text-gray-500">Work with team members</p>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Case #2024-001 has been updated</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Report submitted for Case #2024-015</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New case assigned: Case #2024-022</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Team meeting scheduled for tomorrow</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

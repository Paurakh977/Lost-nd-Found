'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  FileText, 
  Users, 
  Shield, 
  LogOut,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Database
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InstitutionalStats {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  dataShared: number;
}

export default function InstitutionalDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<InstitutionalStats>({
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    dataShared: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get current user from localStorage
    const customUser = localStorage.getItem('customUser');
    if (customUser) {
      try {
        const userData = JSON.parse(customUser);
        if (userData.role !== 'institutional') {
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
        totalRequests: 89,
        approvedRequests: 67,
        pendingRequests: 12,
        dataShared: 54
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
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Institutional Portal</h1>
                <p className="text-sm text-gray-500">Manage data requests and compliance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-xs text-gray-500">{currentUser?.institutionName}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Building className="w-4 h-4 text-green-600" />
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
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome, {currentUser?.institutionName}</h2>
              <p className="text-green-100 mt-1">Monitor your data sharing and compliance status.</p>
            </div>
            <div className="hidden md:block">
              <Database className="w-16 h-16 text-green-200" />
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
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
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
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approvedRequests}</p>
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
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingRequests}</p>
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
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Data Shared</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.dataShared}</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Data request submission coming soon!')}
              >
                <FileText className="w-5 h-5 text-blue-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Submit Data Request</p>
                  <p className="text-xs text-gray-500">Request access to specific datasets</p>
                </div>
              </motion.button>
              
              <motion.button 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Compliance reporting coming soon!')}
              >
                <Shield className="w-5 h-5 text-green-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Compliance Report</p>
                  <p className="text-xs text-gray-500">View compliance status</p>
                </div>
              </motion.button>
              
              <motion.button 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Analytics dashboard coming soon!')}
              >
                <BarChart3 className="w-5 h-5 text-purple-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Analytics</p>
                  <p className="text-xs text-gray-500">View usage analytics</p>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Financial Records 2024</p>
                      <p className="text-xs text-gray-500">Approved • 2 days ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Student Enrollment Data</p>
                      <p className="text-xs text-gray-500">Pending • 1 week ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Staff Directory</p>
                      <p className="text-xs text-gray-500">Approved • 1 week ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Compliance Status */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-900">Data Privacy Compliance</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">100%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-900">Security Protocols</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">98%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-900">Documentation Updates</span>
                  </div>
                  <span className="text-sm font-medium text-orange-600">75%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-900">Access Controls</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">100%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

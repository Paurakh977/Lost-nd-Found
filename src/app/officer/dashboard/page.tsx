'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Users, 
  Clock, 
  Shield,
  AlertCircle,
  TrendingUp,
  Activity,
  Calendar,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import OfficerNavbar from './OfficerNavbar';

interface OfficerStats {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  pendingVerifications: number;
  lostReports: number;
  foundReports: number;
  todayReports: number;
  weeklyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'lost' | 'found' | 'verification' | 'resolved';
  title: string;
  description: string;
  time: string;
  status: 'pending' | 'active' | 'resolved' | 'verified';
  location?: string;
  priority: 'low' | 'medium' | 'high';
}

interface PendingCase {
  id: string;
  title: string;
  type: 'lost' | 'found' | 'verification';
  reporter: string;
  location: string;
  timeAgo: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
}

export default function OfficerDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<OfficerStats>({
    totalCases: 0,
    activeCases: 0,
    resolvedCases: 0,
    pendingVerifications: 0,
    lostReports: 0,
    foundReports: 0,
    todayReports: 0,
    weeklyGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pendingCases, setPendingCases] = useState<PendingCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get current user from localStorage or mock data
    const mockUser = {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@globaltrack.com',
      department: 'Lost & Found Division',
      role: 'officer'
    };
    setCurrentUser(mockUser);

    // Simulate loading stats and data
    setTimeout(() => {
      setStats({
        totalCases: 234,
        activeCases: 45,
        resolvedCases: 189,
        pendingVerifications: 12,
        lostReports: 127,
        foundReports: 107,
        todayReports: 8,
        weeklyGrowth: 12.5
      });

      setRecentActivity([
        {
          id: '1',
          type: 'lost',
          title: 'iPhone 15 Pro Lost',
          description: 'Lost at Central Mall, Food Court area',
          time: '2 hours ago',
          status: 'pending',
          location: 'Central Mall',
          priority: 'high'
        },
        {
          id: '2',
          type: 'found',
          title: 'Wallet Found',
          description: 'Brown leather wallet found at Metro Station',
          time: '4 hours ago',
          status: 'active',
          location: 'Metro Station',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'verification',
          title: 'Verification Request',
          description: 'Owner claiming Apple Watch Series 9',
          time: '6 hours ago',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '4',
          type: 'resolved',
          title: 'Case Resolved',
          description: 'Laptop returned to original owner',
          time: '1 day ago',
          status: 'resolved',
          priority: 'low'
        }
      ]);

      setPendingCases([
        {
          id: 'CASE-2024-001',
          title: 'Lost MacBook Pro',
          type: 'lost',
          reporter: 'Sarah Johnson',
          location: 'University Campus',
          timeAgo: '3 hours ago',
          priority: 'high',
          status: 'Under Investigation'
        },
        {
          id: 'CASE-2024-002',
          title: 'Found Car Keys',
          type: 'found',
          reporter: 'Mike Chen',
          location: 'Shopping Center',
          timeAgo: '5 hours ago',
          priority: 'medium',
          status: 'Pending Match'
        },
        {
          id: 'CASE-2024-003',
          title: 'Ownership Verification',
          type: 'verification',
          reporter: 'Emma Davis',
          location: 'City Park',
          timeAgo: '1 day ago',
          priority: 'high',
          status: 'Verification Required'
        }
      ]);

      setIsLoading(false);
    }, 1500);
  }, []);

  const handleSignOut = async () => {
    try {
      // Mock sign out process
      console.log('Signing out...');
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/sign-in';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lost': return <Package className="w-4 h-4" />;
      case 'found': return <CheckCircle className="w-4 h-4" />;
      case 'verification': return <Shield className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Fetching your latest data...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <OfficerNavbar currentUser={currentUser} onSignOut={handleSignOut} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white mb-8 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <motion.h1 
                className="text-3xl md:text-4xl font-bold mb-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Welcome back, {currentUser?.firstName}! 👋
              </motion.h1>
              <motion.p 
                className="text-blue-100 text-lg mb-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Here's what's happening in your department today
              </motion.p>
              <motion.div 
                className="flex items-center space-x-6 text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Today: {stats.todayReports} new reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{stats.weeklyGrowth}% this week</span>
                </div>
              </motion.div>
            </div>
            <motion.div 
              className="hidden md:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Activity className="w-16 h-16 text-blue-200" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'Total Cases', 
              value: stats.totalCases, 
              icon: FileText, 
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50',
              change: '+12%',
              changeType: 'increase'
            },
            { 
              title: 'Active Cases', 
              value: stats.activeCases, 
              icon: Activity, 
              color: 'from-orange-500 to-orange-600',
              bgColor: 'bg-orange-50',
              change: '+8%',
              changeType: 'increase'
            },
            { 
              title: 'Resolved Cases', 
              value: stats.resolvedCases, 
              icon: CheckCircle, 
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50',
              change: '+15%',
              changeType: 'increase'
            },
            { 
              title: 'Pending Verifications', 
              value: stats.pendingVerifications, 
              icon: Shield, 
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50',
              change: '-5%',
              changeType: 'decrease'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              className={`${stat.bgColor} p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="p-6 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (index * 0.1), duration: 0.4 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 ${getPriorityColor(activity.priority)} rounded-xl flex items-center justify-center`}>
                      {getTypeIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <div className="flex items-center space-x-3">
                        {activity.location && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{activity.location}</span>
                          </div>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          activity.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                    <button className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pending Cases Sidebar */}
          <motion.div
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Urgent Cases</h3>
              <p className="text-sm text-gray-600">Requires immediate attention</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {pendingCases.map((case_, index) => (
                <motion.div
                  key={case_.id}
                  className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1), duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {case_.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Case ID: {case_.id}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(case_.priority)}`}>
                      {case_.priority}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{case_.reporter}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{case_.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{case_.timeAgo}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">{case_.status}</span>
                      <div className="flex items-center space-x-1">
                        <motion.button
                          className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions Grid */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {[
            {
              title: 'Search & Match',
              description: 'Find matches between lost and found items',
              icon: Search,
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50',
              hoverColor: 'hover:bg-blue-100'
            },
            {
              title: 'Create Report',
              description: 'Generate new case report or update existing',
              icon: FileText,
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50',
              hoverColor: 'hover:bg-green-100'
            },
            {
              title: 'Verify Ownership',
              description: 'Process ownership verification requests',
              icon: Shield,
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50',
              hoverColor: 'hover:bg-purple-100'
            },
            {
              title: 'Team Collaboration',
              description: 'Coordinate with team members and departments',
              icon: Users,
              color: 'from-orange-500 to-orange-600',
              bgColor: 'bg-orange-50',
              hoverColor: 'hover:bg-orange-100'
            },
            {
              title: 'Emergency Cases',
              description: 'Handle high-priority and urgent cases',
              icon: AlertCircle,
              color: 'from-red-500 to-red-600',
              bgColor: 'bg-red-50',
              hoverColor: 'hover:bg-red-100'
            },
            {
              title: 'Analytics & Reports',
              description: 'View statistics and generate reports',
              icon: TrendingUp,
              color: 'from-indigo-500 to-indigo-600',
              bgColor: 'bg-indigo-50',
              hoverColor: 'hover:bg-indigo-100'
            }
          ].map((action, index) => (
            <motion.button
              key={action.title}
              className={`${action.bgColor} ${action.hoverColor} p-6 rounded-2xl border border-white/50 text-left transition-all duration-300 hover:shadow-lg group`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + (index * 0.1), duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => console.log(`${action.title} clicked`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-500 transition-colors">
                {action.description}
              </p>
            </motion.button>
          ))}
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
              >
                {stats.lostReports}
              </motion.div>
              <p className="text-gray-300">Lost Reports</p>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
              >
                {stats.foundReports}
              </motion.div>
              <p className="text-gray-300">Found Reports</p>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
              >
                {Math.round((stats.resolvedCases / stats.totalCases) * 100)}%
              </motion.div>
              <p className="text-gray-300">Success Rate</p>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
              >
                4.8
              </motion.div>
              <p className="text-gray-300">Satisfaction Rating</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
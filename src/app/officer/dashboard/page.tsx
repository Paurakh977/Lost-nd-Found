'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  FileText,
  Users,
  Clock,
  Shield,
  AlertCircle,
  Filter,
  TrendingUp,
  Activity,
  Calendar,
  MapPin,
  Eye,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Package
} from 'lucide-react';
import OfficerNavbar from './OfficerNavbar';
import { useOfficerDashboard } from '../hooks/useOfficerDashboard';
import { useUnassignedCases } from '../hooks/useUnassignedCases';
import { useUrgentCases } from '../hooks/useUrgentCases';
import { CaseCard } from '../components/CaseCard';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { DashboardLoadingSkeleton } from '../components/LoadingSkeleton';
import UnassignedCasesPanel from '../components/UnassignedCasesPanel';
import { ToastContainer } from '../../../components/Toast';
import type { ToastType } from '../../../components/Toast';
import { useNavigation } from '../../../components/SplashLayout';

export default function OfficerDashboard() {
  const { navigateTo } = useNavigation();
  const { officer, stats, loading: statsLoading } = useOfficerDashboard();
  const {
    cases: unassignedCases,
    pagination: unassignedPagination,
    loading: unassignedLoading,
    filters: unassignedFilters,
    setFilters: setUnassignedFilters,
    goToPage: unassignedGoToPage,
    removeCase: removeFromUnassigned,
  } = useUnassignedCases(1, 10);

  const {
    cases: urgentCases,
    pagination: urgentPagination,
    loading: urgentLoading,
    filters: urgentFilters,
    setFilters: setUrgentFilters,
    goToPage: urgentGoToPage,
    removeCase: removeFromUrgent,
  } = useUrgentCases(1, 5);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'resolved'>('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<'all' | 'lost' | 'found' | 'verification'>('all');
  const [urgentCaseTypeFilter, setUrgentCaseTypeFilter] = useState<'all' | 'lost' | 'found' | 'verification'>('all');
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; title: string; message?: string }>>([]);

  const pushToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleNavigation = (path: string) => {
    navigateTo(path);
  };

  // Wire search and filters to server-side unassigned cases endpoint (status is always pending for unassigned)
  useEffect(() => {
    setUnassignedFilters({
      ...unassignedFilters,
      status: 'pending',
      type: activityTypeFilter,
      search: searchQuery,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, activityTypeFilter]);

  // Wire urgent filter to server-side urgent cases endpoint
  useEffect(() => {
    setUrgentFilters({
      ...urgentFilters,
      status: statusFilter,
      type: urgentCaseTypeFilter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, urgentCaseTypeFilter]);

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
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isLoading = statsLoading || unassignedLoading || urgentLoading;
  if (isLoading) return <DashboardLoadingSkeleton />;

  return (
    <>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-indigo-700 dark:via-indigo-800 dark:to-purple-900 rounded-2xl p-8 text-white mb-8 overflow-hidden"
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
                Welcome back, {officer?.firstName}! 👋
              </motion.h1>
              <motion.p 
                className="text-blue-100 dark:text-blue-200 text-lg mb-4"
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
                  <span>Today: {stats?.todayReports ?? 0} new reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{stats?.weeklyGrowth ?? 0}% this week</span>
                </div>
              </motion.div>
            </div>
            <motion.div 
              className="hidden md:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Activity className="w-16 h-16 text-blue-200 dark:text-blue-300" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'Total Cases', 
              value: stats?.totalCases ?? 0, 
              icon: FileText, 
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50',
              darkBgColor: 'dark:bg-gray-800/80',
              change: '+12%',
              changeType: 'increase'
            },
            { 
              title: 'Active Cases', 
              value: stats?.activeCases ?? 0, 
              icon: Activity, 
              color: 'from-orange-500 to-orange-600',
              bgColor: 'bg-orange-50',
              darkBgColor: 'dark:bg-gray-800/80',
              change: '+8%',
              changeType: 'increase',
              href: '/officer/cases/active'
            },
            { 
              title: 'Resolved Cases', 
              value: stats?.resolvedCases ?? 0, 
              icon: CheckCircle, 
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50',
              darkBgColor: 'dark:bg-gray-800/80',
              change: '+15%',
              changeType: 'increase',
              href: '/officer/cases/resolved'
            },
            { 
              title: 'Pending Verifications', 
              value: stats?.pendingVerifications ?? 0, 
              icon: Shield, 
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50',
              darkBgColor: 'dark:bg-gray-800/80',
              change: '-5%',
              changeType: 'decrease',
              href: '/officer/cases/verification'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              className={`${stat.bgColor} ${stat.darkBgColor} p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => {
                // Navigate for Active Cases card
                if ((stat as any).href) {
                  handleNavigation((stat as any).href);
                }
              }}
              role={(stat as any).href ? 'button' : undefined}
              style={{ cursor: (stat as any).href ? 'pointer' as const : 'default' as const }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <UnassignedCasesPanel onToast={pushToast} />

          {/* Urgent Cases Sidebar */}
          <motion.div
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 dark:border-gray-700 overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Urgent Cases</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Requires immediate attention</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/70 rounded-md border border-gray-100 dark:border-gray-600 px-2">
                  <Package className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <select
                    value={urgentCaseTypeFilter}
                    onChange={(e) => setUrgentCaseTypeFilter(e.target.value as any)}
                    className="py-1.5 pl-1 pr-6 bg-transparent text-xs text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">All Types</option>
                    <option value="lost" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Lost Items</option>
                    <option value="found" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Found Items</option>
                    <option value="verification" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Verification</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {urgentCases.length === 0 ? (
                <div className="p-4">
                  <EmptyState type="urgent" message="No urgent cases for now" />
                </div>
              ) : (
                urgentCases.map((caseItem, index) => (
                  <CaseCard
                    key={caseItem._id}
                    case={caseItem}
                    onAssignSuccess={(id) => {
                      removeFromUrgent(id);
                      removeFromUnassigned(id);
                      pushToast('success', 'Case assigned', 'The urgent case was assigned to you.');
                      window.dispatchEvent(new Event('officer:refresh-stats'));
                    }}
                    onViewDetails={(id) => {
                      handleNavigation(`/officer/cases/${id}`);
                    }}
                    onAssignError={(message) => {
                      pushToast('error', 'Assignment failed', message);
                    }}
                    isUrgent
                    index={index}
                  />
                ))
              )}
            </div>
            {urgentPagination && (
              <Pagination pagination={urgentPagination} onPageChange={urgentGoToPage} />
            )}
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
              darkBgColor: 'dark:bg-gray-800/80',
              hoverColor: 'hover:bg-blue-100',
              darkHoverColor: 'dark:hover:bg-gray-700/80'
            },
            {
              title: 'Create Report',
              description: 'Generate new case report or update existing',
              icon: FileText,
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50',
              darkBgColor: 'dark:bg-gray-800/80',
              hoverColor: 'hover:bg-green-100',
              darkHoverColor: 'dark:hover:bg-gray-700/80'
            },
            {
              title: 'Verify Ownership',
              description: 'Process ownership verification requests',
              icon: Shield,
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50',
              darkBgColor: 'dark:bg-gray-800/80',
              hoverColor: 'hover:bg-purple-100',
              darkHoverColor: 'dark:hover:bg-gray-700/80'
            },
            {
              title: 'Team Collaboration',
              description: 'Coordinate with team members and departments',
              icon: Users,
              color: 'from-orange-500 to-orange-600',
              bgColor: 'bg-orange-50',
              darkBgColor: 'dark:bg-gray-800/80',
              hoverColor: 'hover:bg-orange-100',
              darkHoverColor: 'dark:hover:bg-gray-700/80'
            },
            {
              title: 'Emergency Cases',
              description: 'Handle high-priority and urgent cases',
              icon: AlertCircle,
              color: 'from-red-500 to-red-600',
              bgColor: 'bg-red-50',
              darkBgColor: 'dark:bg-gray-800/80',
              hoverColor: 'hover:bg-red-100',
              darkHoverColor: 'dark:hover:bg-gray-700/80'
            },
            {
              title: 'Analytics & Reports',
              description: 'View statistics and generate reports',
              icon: TrendingUp,
              color: 'from-indigo-500 to-indigo-600',
              bgColor: 'bg-indigo-50',
              darkBgColor: 'dark:bg-gray-800/80',
              hoverColor: 'hover:bg-indigo-100',
              darkHoverColor: 'dark:hover:bg-gray-700/80'
            }
          ].map((action, index) => (
            <motion.button
              key={action.title}
              className={`${action.bgColor} ${action.darkBgColor} ${action.hoverColor} ${action.darkHoverColor} p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-left transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/50 group`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + (index * 0.1), duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Handle specific actions
                if (action.title === 'Search & Match') {
                  handleNavigation('/search');
                } else if (action.title === 'Verify Ownership') {
                  handleNavigation('/officer/cases/verification');
                } else if (action.title === 'Create Report') {
                  handleNavigation('/officer/reports');
                } else if (action.title === 'Team Collaboration') {
                  pushToast('info', 'Coming Soon', 'Team collaboration features are currently under development. Stay tuned!');
                } else if (action.title === 'Emergency Cases') {
                  pushToast('info', 'Coming Soon', 'Emergency case management features will be available soon!');
                } else if (action.title === 'Analytics & Reports') {
                  pushToast('info', 'Coming Soon', 'Advanced analytics dashboard is on the way!');
                } else {
                  handleNavigation(`/officer/${action.title.toLowerCase().replace(/\s+/g, '-')}`);
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
                {action.description}
              </p>
            </motion.button>
          ))}
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-8 text-white"
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
                {stats?.lostReports ?? 0}
              </motion.div>
              <p className="text-gray-300 dark:text-gray-400">Lost Reports</p>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
              >
                {stats?.foundReports ?? 0}
              </motion.div>
              <p className="text-gray-300 dark:text-gray-400">Found Reports</p>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
              >
                {stats && stats.totalCases > 0 ? Math.round((stats.resolvedCases / stats.totalCases) * 100) : 0}%
              </motion.div>
              <p className="text-gray-300 dark:text-gray-400">Success Rate</p>
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
              <p className="text-gray-300 dark:text-gray-400">Satisfaction Rating</p>
            </div>
          </div>
        </motion.div>
      </main>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

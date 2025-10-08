'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Filter,
  SortDesc,
  ChevronDown,
  X,
  Search,
  FileText,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

// Types
interface CaseItem {
  _id: string;
  title: string;
  description: string;
  type: 'lost' | 'found' | 'verification';
  status: 'pending' | 'active' | 'resolved';
  urgencyLevel: 'low' | 'medium' | 'high' | null;
  reportedTime: string;
  location: {
    address: string;
    details?: string;
  };
  itemDetails: {
    detailedDescription: string;
    category?: string;
    brand?: string;
    color?: string;
  };
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  active: number;
  resolved: number;
  lost: number;
  found: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  type: 'clerk' | 'jwt';
  imageUrl?: string;
  createdAt?: string;
}

// Utility functions
const safeFormatDate = (dateValue: any, formatStr: string, fallback: string = 'Unknown'): string => {
  try {
    if (!dateValue) return fallback;
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return format(date, formatStr);
  } catch (e) {
    return fallback;
  }
};

const safeFormatDistanceToNow = (dateValue: any, fallback: string = 'Recently'): string => {
  try {
    if (!dateValue) return fallback;
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (e) {
    return fallback;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'active':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'lost':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'found':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'verification':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'active':
      return <AlertCircle className="w-4 h-4" />;
    case 'resolved':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, active: 0, resolved: 0, lost: 0, found: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal state
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch user data and cases
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let userId: string | undefined;
        let userName: string | undefined;
        let userEmail: string | undefined;
        let userRole: string | undefined;
        let userType: 'clerk' | 'jwt' = 'clerk';
        let userCreatedAt: string | undefined;

        // First, try to check JWT user (our own server, no rate limits)
        let jwtChecked = false;
        try {
          const meResponse = await fetch('/api/auth/me', { 
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          jwtChecked = true;
          
          if (meResponse.ok) {
            const meData = await meResponse.json();
            if (meData.success && meData.user) {
              userId = meData.user.id;
              userName = `${meData.user.firstName} ${meData.user.lastName}`.trim();
              userEmail = meData.user.email;
              userRole = meData.user.role;
              userType = 'jwt';
              userCreatedAt = meData.user.createdAt;
              console.log('[Profile] ✅ Using JWT user:', { userId, userName, userEmail, userRole });
            } else {
              console.log('[Profile] ⚠️ JWT response invalid, falling back to Clerk');
            }
          } else if (meResponse.status === 401) {
            console.log('[Profile] ℹ️ No JWT token (401), falling back to Clerk');
          }
        } catch (err) {
          console.log('[Profile] ❌ JWT check error:', err);
        }

        // Fallback to Clerk user only if JWT check failed or returned no user
        if (!userId && isLoaded && clerkUser) {
          userId = clerkUser.id;
          userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User';
          userEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
          userType = 'clerk';
          userCreatedAt = clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : undefined;
          console.log('[Profile] ✅ Using Clerk user:', { userId, userName, userEmail });
        }

        if (!userId) {
          setError('Unable to load user data');
          setLoading(false);
          return;
        }

        // Set user data
        setUserData({
          id: userId,
          name: userName || 'User',
          email: userEmail || '',
          role: userRole,
          type: userType,
          imageUrl: userType === 'clerk' ? clerkUser?.imageUrl : undefined,
          createdAt: userCreatedAt,
        });

        // Fetch cases
        const casesResponse = await fetch('/api/cases/user-cases', {
          credentials: 'include',
        });

        if (!casesResponse.ok) {
          throw new Error('Failed to fetch cases');
        }

        const casesData = await casesResponse.json();
        
        if (casesData.success) {
          setCases(casesData.cases || []);
          setStats(casesData.stats || { total: 0, pending: 0, active: 0, resolved: 0, lost: 0, found: 0 });
        } else {
          throw new Error(casesData.error || 'Failed to fetch cases');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded, clerkUser]);

  // Filtered and sorted cases
  const filteredCases = useMemo(() => {
    let filtered = [...cases];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.location.address.toLowerCase().includes(query) ||
        c.itemDetails.category?.toLowerCase().includes(query) ||
        c.itemDetails.brand?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [cases, statusFilter, typeFilter, sortBy, searchQuery]);

  // Paginated cases
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCases, currentPage, itemsPerPage]);

  const hasMorePages = currentPage * itemsPerPage < filteredCases.length;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <motion.div
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </motion.div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl p-4 shadow-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              >
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              {userData?.type === 'clerk' && userData.imageUrl ? (
                <img
                  src={userData.imageUrl}
                  alt={userData.name}
                  className="w-20 h-20 rounded-full ring-4 ring-blue-500/20 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-blue-500/20">
                  <span className="text-3xl font-bold text-white">
                    {userData?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {userData?.name}
                </h1>
                {userData?.role && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full capitalize">
                    {userData.role}
                  </span>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{userData?.email}</span>
                </div>
                {userData?.createdAt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {safeFormatDate(userData.createdAt, 'MMM yyyy', 'recently')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Cases', value: stats.total, icon: Package, color: 'blue', delay: 0 },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow', delay: 0.1 },
            { label: 'Active', value: stats.active, icon: AlertCircle, color: 'blue', delay: 0.2 },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'green', delay: 0.3 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20 hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </span>
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: stat.delay + 0.2, type: 'spring' }}
                className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}
              >
                {stat.value}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20"
        >
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
              <option value="verification">Verification</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
            <div className="flex items-center space-x-2 mt-4 flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {statusFilter !== 'all' && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setStatusFilter('all')}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full flex items-center space-x-1 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <span>Status: {statusFilter}</span>
                  <X className="w-3 h-3" />
                </motion.button>
              )}
              {typeFilter !== 'all' && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setTypeFilter('all')}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm rounded-full flex items-center space-x-1 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <span>Type: {typeFilter}</span>
                  <X className="w-3 h-3" />
                </motion.button>
              )}
              {searchQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-sm rounded-full flex items-center space-x-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span>Search: {searchQuery}</span>
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {paginatedCases.length} of {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Cases List */}
        {filteredCases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-white/20 dark:border-gray-700/20 text-center"
          >
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Cases Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : "You haven't filed any cases yet"}
            </p>
            {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {paginatedCases.map((caseItem, index) => (
                <motion.div
                  key={caseItem._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setSelectedCase(caseItem);
                    setShowModal(true);
                  }}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                    {/* Thumbnail */}
                    {caseItem.images && caseItem.images.length > 0 ? (
                      <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        <img
                          src={`/uploads/${caseItem.images[0]}`}
                          alt={caseItem.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full md:w-32 h-32 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}

                    {/* Case Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                          {caseItem.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(caseItem.type)} capitalize`}>
                            {caseItem.type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(caseItem.status)} capitalize`}>
                            {getStatusIcon(caseItem.status)}
                            <span>{caseItem.status}</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {caseItem.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{caseItem.location.address}</span>
                        </div>
                        {caseItem.createdAt && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{safeFormatDistanceToNow(caseItem.createdAt)}</span>
                          </div>
                        )}
                        {caseItem.itemDetails.category && (
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span className="capitalize">{caseItem.itemDetails.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More */}
            {hasMorePages && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-4"
              >
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>Load More</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Case Detail Modal */}
      <AnimatePresence>
        {showModal && selectedCase && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Case Details
                    </h2>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedCase.type)} capitalize`}>
                      {selectedCase.type}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1 ${getStatusColor(selectedCase.status)} capitalize`}>
                      {getStatusIcon(selectedCase.status)}
                      <span>{selectedCase.status}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Images */}
                  {selectedCase.images && selectedCase.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedCase.images.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img
                            src={`/uploads/${img}`}
                            alt={`${selectedCase.title} - ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedCase.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedCase.description}
                    </p>
                  </div>

                  {/* Item Details */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Item Details</span>
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedCase.itemDetails.detailedDescription}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedCase.itemDetails.category && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="ml-2 text-gray-900 dark:text-white capitalize">{selectedCase.itemDetails.category}</span>
                        </div>
                      )}
                      {selectedCase.itemDetails.brand && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Brand:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedCase.itemDetails.brand}</span>
                        </div>
                      )}
                      {selectedCase.itemDetails.color && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Color:</span>
                          <span className="ml-2 text-gray-900 dark:text-white capitalize">{selectedCase.itemDetails.color}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Location</span>
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedCase.location.address}
                    </p>
                    {selectedCase.location.details && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCase.location.details}
                      </p>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {selectedCase.createdAt && (
                      <div>
                        <span>Filed: </span>
                        <span className="font-medium">{safeFormatDate(selectedCase.createdAt, 'PPpp', 'Unknown date')}</span>
                      </div>
                    )}
                    {selectedCase.updatedAt && (
                      <div>
                        <span>Updated: </span>
                        <span className="font-medium">{safeFormatDistanceToNow(selectedCase.updatedAt, 'Recently')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

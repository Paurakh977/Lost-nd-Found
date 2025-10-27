'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Eye, Calendar, MapPin, Package, CheckCircle, Shield, ChevronLeft, ChevronRight, X, Search, Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useTheme } from '@/components/ThemeProvider';
import CaseDetailModal from '@/components/CaseDetailModal';
import ItemPlaceholder from '@/components/ItemPlaceholder';

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
  reportedBy: {
    clerkId: string;
    name: string;
    email?: string;
  };
  assignedOfficer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasMore: boolean;
}

export default function ExplorePage() {
  const { isDark } = useTheme();
  const router = useRouter();
  
  // Authentication - Check both Clerk and JWT
  const { isSignedIn: isClerkSignedIn, isLoaded: isClerkAuthLoaded } = useAuth();
  const { isLoaded: isClerkUserLoaded } = useUser();
  const [jwtUser, setJwtUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
    hasMore: false
  });

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modal state
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Check JWT authentication
  useEffect(() => {
    const fetchJWTUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setJwtUser(data.user);
          }
        }
      } catch (error) {
        console.error('Error fetching JWT user:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    fetchJWTUser();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (authChecked && isClerkAuthLoaded && isClerkUserLoaded) {
      const isAuthenticated = isClerkSignedIn || jwtUser;
      if (!isAuthenticated) {
        router.push('/sign-in?redirect_url=/explore');
      }
    }
  }, [authChecked, isClerkAuthLoaded, isClerkUserLoaded, isClerkSignedIn, jwtUser, router]);

  // Debounce search query to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch cases
  const fetchCases = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      
      if (debouncedSearchQuery.trim()) params.append('search', debouncedSearchQuery.trim());
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/cases/explore?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setCases(data.cases);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases(1);
  }, [debouncedSearchQuery, statusFilter, typeFilter, startDate, endDate]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCases(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleViewDetails = (caseItem: CaseItem) => {
    setSelectedCase(caseItem);
    setShowModal(true);
  };

  const handleNavigateToCase = (caseId: string) => {
    router.push(`/cases/${caseId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lost': return <Package className="w-4 h-4" />;
      case 'found': return <CheckCircle className="w-4 h-4" />;
      case 'verification': return <Shield className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lost': 
        return isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700';
      case 'found': 
        return isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700';
      case 'verification': 
        return isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
      default: 
        return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': 
        return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
      case 'active': 
        return isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
      default: 
        return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  // Show loading state while checking auth
  if (!authChecked || !isClerkAuthLoaded || !isClerkUserLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-black' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-4xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Explore Cases
          </h1>
          <p className={`text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Browse all active lost and found cases
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-neutral-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, description, category, brand, color..."
              className={`w-full pl-12 pr-${searchQuery && searchQuery !== debouncedSearchQuery ? '12' : '4'} py-4 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-neutral-900/60 border-neutral-800/50 text-white placeholder-neutral-500 focus:bg-neutral-900 focus:border-neutral-700' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500/50 focus:outline-none`}
            />
            {/* Show loading spinner when debouncing */}
            {searchQuery && searchQuery !== debouncedSearchQuery && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <Loader2 className={`w-4 h-4 animate-spin ${
                  isDark ? 'text-neutral-500' : 'text-gray-400'
                }`} />
              </div>
            )}
            {/* Show clear button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                  isDark 
                    ? 'text-neutral-500 hover:text-white hover:bg-neutral-800' 
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Search hint */}
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 text-sm ${
                isDark ? 'text-neutral-500' : 'text-gray-500'
              }`}
            >
              Searching in: title, location, description, category, brand, color
            </motion.p>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 rounded-xl border ${
            isDark ? 'bg-neutral-900/40 border-neutral-800/50 backdrop-blur-sm' : 'bg-white border-gray-200'
          } p-4`}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-neutral-800/60 hover:bg-neutral-700/60 text-white border border-neutral-700/50' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
            </button>

            {(searchQuery || statusFilter || typeFilter || startDate || endDate) && (
              <button
                onClick={clearFilters}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Clear filters</span>
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden"
              >
                {/* Status Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-neutral-900/60 border-neutral-700/50 text-white focus:bg-neutral-900 focus:border-neutral-600' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500/50 focus:border-transparent`}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="verification">Verification</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-neutral-900/60 border-neutral-700/50 text-white focus:bg-neutral-900 focus:border-neutral-600' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500/50 focus:border-transparent`}
                  >
                    <option value="">All</option>
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-neutral-900/60 border-neutral-700/50 text-white focus:bg-neutral-900 focus:border-neutral-600' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500/50 focus:border-transparent`}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-neutral-900/60 border-neutral-700/50 text-white focus:bg-neutral-900 focus:border-neutral-600' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500/50 focus:border-transparent`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <div className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {cases.length} of {pagination.totalCount} cases
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`rounded-xl border ${
                  isDark ? 'bg-neutral-900/40 border-neutral-800/50 backdrop-blur-sm' : 'bg-white border-gray-200'
                } p-6 animate-pulse`}
              >
                <div className={`w-full h-48 rounded-lg mb-4 ${
                  isDark ? 'bg-neutral-800/50' : 'bg-gray-200'
                }`} />
                <div className={`h-4 rounded mb-2 ${
                  isDark ? 'bg-neutral-800/50' : 'bg-gray-200'
                }`} />
                <div className={`h-4 rounded w-2/3 ${
                  isDark ? 'bg-neutral-800/50' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
        ) : cases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-16 rounded-xl border ${
              isDark ? 'bg-neutral-900/40 border-neutral-800/50 backdrop-blur-sm' : 'bg-white border-gray-200'
            }`}
          >
            <Package className={`w-16 h-16 mx-auto mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No cases found
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Try adjusting your filters
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem, index) => (
              <motion.div
                key={caseItem._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border ${
                  isDark 
                    ? 'bg-neutral-900/40 border-neutral-800/50 hover:border-neutral-700/70 backdrop-blur-sm hover:bg-neutral-900/60' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } overflow-hidden transition-all duration-300 hover:shadow-lg group`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {caseItem.images && caseItem.images.length > 0 ? (
                    <img
                      src={`/uploads/${caseItem.images[0]}`}
                      alt={caseItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.appendChild(
                          document.createElement('div')
                        );
                      }}
                    />
                  ) : (
                    <ItemPlaceholder itemType={caseItem.type} className="w-full h-full" />
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(caseItem.type)}`}>
                      {getTypeIcon(caseItem.type)}
                      {caseItem.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className={`font-semibold text-lg mb-2 line-clamp-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {caseItem.title}
                  </h3>

                  <p className={`text-sm mb-3 line-clamp-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {caseItem.description}
                  </p>

                  {/* Location */}
                  <div className={`flex items-start gap-2 mb-3 text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{caseItem.location.address}</span>
                  </div>

                  {/* Date */}
                  <div className={`flex items-center gap-2 mb-4 text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(caseItem.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(caseItem)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'bg-neutral-800/60 hover:bg-neutral-700/60 text-white border border-neutral-700/50' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </button>
                    <button
                      onClick={() => handleNavigateToCase(caseItem._id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                pagination.currentPage === 1
                  ? isDark ? 'bg-neutral-900/40 text-neutral-600 cursor-not-allowed border border-neutral-800/50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDark ? 'bg-neutral-800/60 hover:bg-neutral-700/60 text-white border border-neutral-700/50' : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === pagination.currentPage;
                
                // Show first page, last page, current page, and pages around current
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                        isCurrentPage
                          ? isDark ? 'bg-blue-600/90 text-white border border-blue-500/50' : 'bg-blue-600 text-white'
                          : isDark 
                            ? 'bg-neutral-800/60 hover:bg-neutral-700/60 text-white border border-neutral-700/50' 
                            : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.currentPage - 2 ||
                  pageNum === pagination.currentPage + 2
                ) {
                  return <span key={pageNum} className={isDark ? 'text-gray-600' : 'text-gray-400'}>...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`p-2 rounded-lg transition-colors ${
                pagination.currentPage === pagination.totalPages
                  ? isDark ? 'bg-neutral-900/40 text-neutral-600 cursor-not-allowed border border-neutral-800/50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDark ? 'bg-neutral-800/60 hover:bg-neutral-700/60 text-white border border-neutral-700/50' : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          case={selectedCase}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCase(null);
          }}
        />
      )}
    </div>
  );
}

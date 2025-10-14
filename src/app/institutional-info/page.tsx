'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Mail,
  Calendar,
  Shield,
  MapPinned,
  ChevronDown,
  ArrowLeft,
  User,
  Phone,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Package
} from 'lucide-react';
import { format } from 'date-fns';

// Types
interface InstitutionalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  institutionName?: string;
  department?: string;
  profileImage?: string;
  address?: {
    province?: string;
    district?: string;
    municipality?: string;
    ward?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  createdAt: string;
  lastLogin?: string;
}

interface CaseStats {
  total: number;
  pending: number;
  active: number;
  resolved: number;
}

export default function InstitutionalInfoPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<InstitutionalUser | null>(null);
  const [caseStats, setCaseStats] = useState<CaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMapLocation, setShowMapLocation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!userResponse.ok) {
          throw new Error('Not authenticated');
        }

        const userData = await userResponse.json();

        if (!userData.success || userData.user.role !== 'institutional') {
          router.push('/');
          return;
        }

        setUserData(userData.user);

        // Fetch case statistics
        try {
          const statsResponse = await fetch('/api/cases/user-cases?page=1&limit=1', {
            credentials: 'include',
          });

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success && statsData.stats) {
              setCaseStats(statsData.stats);
            }
          }
        } catch (err) {
          console.error('Error fetching stats:', err);
        }
      } catch (err) {
        console.error('Error fetching institutional data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const safeFormatDate = (dateValue: any, formatStr: string): string => {
    try {
      if (!dateValue) return 'N/A';
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatStr);
    } catch (e) {
      return 'N/A';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading institutional information...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'You do not have permission to view this page.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <motion.button
          onClick={() => router.back()}
          className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {userData.profileImage ? (
                <img
                  src={`/api/profile/image/${userData.profileImage}?t=${Date.now()}`}
                  alt={`${userData.firstName} ${userData.lastName}`}
                  className="w-24 h-24 rounded-2xl ring-4 ring-blue-500/20 object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-blue-500/20 shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" />
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {userData.firstName} {userData.lastName}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{userData.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full capitalize">
                    {userData.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards (if available) */}
        {caseStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Total Cases', value: caseStats.total, icon: Package, color: 'blue' },
              { label: 'Pending', value: caseStats.pending, icon: Clock, color: 'yellow' },
              { label: 'Active', value: caseStats.active, icon: AlertCircle, color: 'blue' },
              { label: 'Resolved', value: caseStats.resolved, icon: CheckCircle, color: 'green' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 dark:border-gray-700/20 hover:scale-105 transition-transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </span>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
                <div className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Institution Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Institution Details</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData.institutionName && (
              <div className="flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Institution Name</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {userData.institutionName}
                  </p>
                </div>
              </div>
            )}

            {userData.department && (
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {userData.department}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {safeFormatDate(userData.createdAt, 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>

            {userData.lastLogin && (
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {safeFormatDate(userData.lastLogin, 'PPpp')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Address Information */}
        {userData.address && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span>Address Information</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userData.address.province && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Province</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {userData.address.province}
                  </p>
                </div>
              )}
              {userData.address.district && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">District</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {userData.address.district}
                  </p>
                </div>
              )}
              {userData.address.municipality && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Municipality</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {userData.address.municipality}
                  </p>
                </div>
              )}
              {userData.address.ward && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ward</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {userData.address.ward}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* GPS Location */}
        {userData.location?.latitude && userData.location?.longitude && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <MapPinned className="w-6 h-6 text-red-600 dark:text-red-400" />
                <span>GPS Location</span>
              </h2>
              <button
                onClick={() => setShowMapLocation(!showMapLocation)}
                className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>{showMapLocation ? 'Hide Map' : 'View on Map'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMapLocation ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <p className="text-base font-medium text-gray-900 dark:text-white mb-4">
              {userData.location.address || `${userData.location.latitude.toFixed(6)}, ${userData.location.longitude.toFixed(6)}`}
            </p>

            {/* Map Dropdown */}
            <AnimatePresence>
              {showMapLocation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                    <iframe
                      title="Institution Location Map"
                      width="100%"
                      height="400"
                      frameBorder="0"
                      style={{ border: 0, borderRadius: '8px' }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${userData.location.longitude - 0.01},${userData.location.latitude - 0.01},${userData.location.longitude + 0.01},${userData.location.latitude + 0.01}&layer=mapnik&marker=${userData.location.latitude},${userData.location.longitude}`}
                      allowFullScreen
                    />
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Lat: {userData.location.latitude.toFixed(6)}, Lng: {userData.location.longitude.toFixed(6)}</span>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${userData.location.latitude}&mlon=${userData.location.longitude}#map=15/${userData.location.latitude}/${userData.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <span>Open in OpenStreetMap</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              onClick={() => router.push('/profile')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">View Profile</span>
            </motion.button>

            <motion.button
              onClick={() => router.push('/search')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Search Cases</span>
            </motion.button>

            <motion.button
              onClick={() => router.push('/')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">Go Home</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-white/50 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-12 h-4 bg-gray-200 rounded"></div>
      </div>
      <div>
        <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function CaseCardSkeleton() {
  return (
    <motion.div
      className="p-6 border-b border-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-start space-x-4 animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded mb-3"></div>
          <div className="flex items-center space-x-3">
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white mb-8 animate-pulse">
          <div className="h-8 w-64 bg-white/20 rounded mb-4"></div>
          <div className="h-4 w-96 bg-white/20 rounded mb-4"></div>
          <div className="flex items-center space-x-6">
            <div className="h-4 w-32 bg-white/20 rounded"></div>
            <div className="h-4 w-32 bg-white/20 rounded"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100 animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
            <div>
              {[1, 2, 3].map((i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100 animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
            <div>
              {[1, 2].map((i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Search, Inbox } from 'lucide-react';

interface EmptyStateProps {
  type?: 'urgent' | 'unassigned' | 'search' | 'general';
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ type = 'general', message, icon }: EmptyStateProps) {
  // Default messages and icons based on type
  const getDefaultContent = () => {
    switch (type) {
      case 'urgent':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          message: 'No urgent cases right now! 🎉',
          subMessage: 'All high-priority cases have been handled. Great work!',
          color: 'from-green-50 to-emerald-50',
        };
      case 'unassigned':
        return {
          icon: <Inbox className="w-16 h-16 text-blue-500" />,
          message: 'No unassigned cases',
          subMessage: 'All cases have been assigned to officers. Check back later for new cases.',
          color: 'from-blue-50 to-indigo-50',
        };
      case 'search':
        return {
          icon: <Search className="w-16 h-16 text-gray-400" />,
          message: 'No results found',
          subMessage: 'Try adjusting your search or filter criteria.',
          color: 'from-gray-50 to-slate-50',
        };
      default:
        return {
          icon: <Package className="w-16 h-16 text-gray-400" />,
          message: 'No cases available',
          subMessage: 'There are no cases to display at the moment.',
          color: 'from-gray-50 to-slate-50',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayIcon = icon || defaultContent.icon;
  const displayMessage = message || defaultContent.message;

  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-br ${defaultContent.color} rounded-xl`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        {displayIcon}
      </motion.div>
      
      <motion.h3
        className="text-lg font-semibold text-gray-900 mb-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {displayMessage}
      </motion.h3>
      
      <motion.p
        className="text-sm text-gray-600 text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {defaultContent.subMessage}
      </motion.p>
      
      {type === 'urgent' && (
        <motion.div
          className="mt-4 px-4 py-2 bg-white rounded-lg shadow-sm border border-green-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-green-700 font-medium">
            ✨ Keep up the excellent work!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

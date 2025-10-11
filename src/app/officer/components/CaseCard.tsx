import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  User, 
  Package, 
  CheckCircle, 
  Shield, 
  Eye,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import { CaseItem } from '../types';
import { motion as Motion } from 'framer-motion';
import { useAssignCase } from '../hooks/useAssignCase';

interface CaseCardProps {
  case: CaseItem;
  onAssignSuccess?: (caseId: string) => void;
  showAssignButton?: boolean;
  showResolveButton?: boolean;
  showVerifyButton?: boolean;
  onResolveClick?: (caseItem: CaseItem) => void;
  onVerifyClick?: (caseItem: CaseItem) => void;
  isUrgent?: boolean;
  index?: number;
  onViewDetails?: (caseId: string) => void;
  onAssignError?: (message: string, caseId: string) => void;
}

export function CaseCard({ 
  case: caseItem, 
  onAssignSuccess, 
  showAssignButton = true,
  showResolveButton = false,
  showVerifyButton = false,
  onResolveClick,
  onVerifyClick,
  isUrgent = false,
  index = 0,
  onViewDetails,
  onAssignError,
}: CaseCardProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const { assignCase } = useAssignCase();

  const handleAssignClick = async () => {
    setIsAssigning(true);
    setAssignError(null);

    const result = await assignCase(caseItem._id);

    if (result.success) {
      // Call success callback
      onAssignSuccess?.(caseItem._id);
    } else {
      // Show error message temporarily
      setAssignError(result.error || 'Failed to assign case');
      if (result.error) {
        onAssignError?.(result.error, caseItem._id);
      }
      setTimeout(() => {
        setAssignError(null);
        // If it was a conflict, also trigger success to remove from list
        if (result.error?.includes('already been assigned')) {
          onAssignSuccess?.(caseItem._id);
        }
      }, 3000);
    }

    setIsAssigning(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lost':
        return <Package className="w-4 h-4" />;
      case 'found':
        return <CheckCircle className="w-4 h-4" />;
      case 'verification':
        return <Shield className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (urgency: string | null) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const imageUrl = caseItem.images && caseItem.images.length > 0 
    ? `/uploads/${caseItem.images[0]}` 
    : '/icons/icon-192x192.png';

  return (
    <motion.div
      className={`p-6 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors ${
        isUrgent ? 'bg-red-50/30 dark:bg-red-900/10' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ x: 5 }}
    >
      <div className="flex items-start space-x-4">
        {/* Case Image */}
        <img 
          src={imageUrl} 
          alt={caseItem.title} 
          className="flex-shrink-0 w-10 h-10 rounded-xl object-cover" 
          onError={(e) => {
            e.currentTarget.src = '/icons/icon-192x192.png';
          }}
        />
        
        {/* Case Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex items-center gap-2">
              {caseItem.title}
              {isUrgent && (
                <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
              )}
            </h4>
            <div className="flex items-center space-x-2">
              {caseItem.urgencyLevel && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(caseItem.urgencyLevel)}`}>
                  {caseItem.urgencyLevel}
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                {formatTimeAgo(caseItem.createdAt)}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">{caseItem.description}</p>
          
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            {/* Location */}
            {caseItem.location.address && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{caseItem.location.address}</span>
              </div>
            )}
            
            {/* Status */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              caseItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              caseItem.status === 'active' ? 'bg-blue-100 text-blue-800' :
              caseItem.status === 'resolved' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {caseItem.status}
            </span>
            
            {/* Type */}
            <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              caseItem.type === 'lost' ? 'bg-red-50 text-red-700' :
              caseItem.type === 'found' ? 'bg-green-50 text-green-700' :
              caseItem.type === 'verification' ? 'bg-purple-50 text-purple-700' :
              'bg-gray-50 text-gray-700'
            }`}>
              {getTypeIcon(caseItem.type)}
              <span className="ml-1">
                {caseItem.type === 'lost' ? 'Lost Item' :
                 caseItem.type === 'found' ? 'Found Item' :
                 caseItem.type === 'verification' ? 'Verification' : caseItem.type}
              </span>
            </span>
            
            {/* Reporter */}
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{caseItem.reportedBy.name}</span>
            </div>
          </div>
          
          {/* Error Message */}
          {assignError && (
            <motion.div
              className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-red-600">{assignError}</p>
            </motion.div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {showAssignButton && (
            <motion.button
              type="button"
              onClick={handleAssignClick}
              disabled={isAssigning}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isAssigning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              whileHover={!isAssigning ? { scale: 1.05 } : {}}
              whileTap={!isAssigning ? { scale: 0.95 } : {}}
            >
              {isAssigning ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </span>
              ) : (
                'Assign to Me'
              )}
            </motion.button>
          )}
          
          {showResolveButton && (
            <motion.button
              type="button"
              onClick={() => onResolveClick?.(caseItem)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Resolve case"
            >
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                Resolve
              </span>
            </motion.button>
          )}
          
          {showVerifyButton && (
            <motion.button
              type="button"
              onClick={() => onVerifyClick?.(caseItem)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-purple-600 hover:bg-purple-700 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Verify case"
            >
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Verify
              </span>
            </motion.button>
          )}
          
          <motion.button
            type="button"
            className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="View details"
            onClick={() => onViewDetails?.(caseItem._id)}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, User, Tag, DollarSign, AlertCircle } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface CaseDetailModalProps {
  case: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function CaseDetailModal({ case: caseData, isOpen, onClose }: CaseDetailModalProps) {
  const { isDark } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!caseData) return null;

  const images = Array.isArray(caseData.images) ? caseData.images : [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatDate = (date: string | Date) => {
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl ${
                isDark ? 'bg-gray-900/95 border border-gray-800/50' : 'bg-white/95 border border-gray-200/50'
              } backdrop-blur-xl shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800/50' : 'border-gray-200/50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      caseData.type === 'found' 
                        ? (isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700')
                        : (isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700')
                    }`}>
                      {caseData.type?.toUpperCase()}
                    </span>
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {caseData.title}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-full transition-colors ${
                      isDark ? 'hover:bg-gray-800/50 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Images Section */}
                  <div className="space-y-4">
                    {images.length > 0 ? (
                      <div className="relative">
                        <div className="aspect-square overflow-hidden rounded-xl border border-gray-200/20">
                          <img
                            src={`/uploads/${images[currentImageIndex]}`}
                            alt={`${caseData.title} - Image ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {hasMultipleImages && (
                          <>
                            {/* Navigation buttons */}
                            <button
                              onClick={prevImage}
                              className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                                isDark ? 'bg-black/50 text-white hover:bg-black/70' : 'bg-white/80 text-gray-800 hover:bg-white'
                              } backdrop-blur-sm transition-all`}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={nextImage}
                              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                                isDark ? 'bg-black/50 text-white hover:bg-black/70' : 'bg-white/80 text-gray-800 hover:bg-white'
                              } backdrop-blur-sm transition-all`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            
                            {/* Image counter */}
                            <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                              isDark ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-800'
                            } backdrop-blur-sm`}>
                              {currentImageIndex + 1} / {images.length}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className={`aspect-square flex items-center justify-center rounded-xl border-2 border-dashed ${
                        isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'
                      }`}>
                        <div className="text-center">
                          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                          <p>No images available</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Image thumbnails */}
                    {hasMultipleImages && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((img: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === currentImageIndex
                                ? (isDark ? 'border-blue-500' : 'border-blue-600')
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={`/uploads/${img}`}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Description
                      </h3>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {caseData.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Item Details */}
                    {caseData.itemDetails && (
                      <div>
                        <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Item Details
                        </h3>
                        <div className="space-y-3">
                          {caseData.itemDetails.detailedDescription && (
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Detailed Description
                              </label>
                              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {caseData.itemDetails.detailedDescription}
                              </p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-3">
                            {caseData.itemDetails.brand && (
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Brand
                                </label>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {caseData.itemDetails.brand}
                                </p>
                              </div>
                            )}
                            
                            {caseData.itemDetails.model && (
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Model
                                </label>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {caseData.itemDetails.model}
                                </p>
                              </div>
                            )}
                            
                            {caseData.itemDetails.color && (
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Color
                                </label>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {caseData.itemDetails.color}
                                </p>
                              </div>
                            )}
                            
                            {caseData.itemDetails.category && (
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Category
                                </label>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {caseData.itemDetails.category}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {caseData.itemDetails.identifyingFeatures && (
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Identifying Features
                              </label>
                              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {caseData.itemDetails.identifyingFeatures}
                              </p>
                            </div>
                          )}
                          
                          {caseData.itemDetails.estimatedValue && (
                            <div className="flex items-center gap-2">
                              <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Estimated Value: ${caseData.itemDetails.estimatedValue}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location & Time */}
                    <div className="space-y-3">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Location & Time
                      </h3>
                      
                      {caseData.location && (
                        <div className="flex items-start gap-2">
                          <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {caseData.location.address}
                            </p>
                            {caseData.location.details && (
                              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {caseData.location.details}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Reported: {formatDate(caseData.reportedTime || caseData.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Reporter Info */}
                    {caseData.reportedBy && (
                      <div className="space-y-2">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Reported By
                        </h3>
                        <div className="flex items-center gap-2">
                          <User className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {caseData.reportedBy.name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Status & Urgency */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Tag className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Status: <span className="capitalize">{caseData.status || 'pending'}</span>
                        </span>
                      </div>
                      
                      {caseData.urgencyLevel && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          caseData.urgencyLevel === 'high'
                            ? (isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700')
                            : caseData.urgencyLevel === 'medium'
                            ? (isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                            : (isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700')
                        }`}>
                          {caseData.urgencyLevel} priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

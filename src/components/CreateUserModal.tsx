'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, User, Mail, Lock, Building, Briefcase } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  editingUser?: User | null;
  onUserUpdated?: () => void;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'officer' | 'institutional';
  department?: string;
  institutionName?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'officer' | 'institutional';
  department: string;
  institutionName: string;
}

export default function CreateUserModal({ isOpen, onClose, onUserCreated, editingUser, onUserUpdated }: CreateUserModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'officer',
    department: '',
    institutionName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData & { general: string }>>({});

  // Populate form when editing
  useEffect(() => {
    if (editingUser) {
      setFormData({
        email: editingUser.email,
        password: '', // Don't populate password for security
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        role: editingUser.role,
        department: editingUser.department || '',
        institutionName: editingUser.institutionName || '',
      });
    } else {
      // Reset form for creating new user
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'officer',
        department: '',
        institutionName: '',
      });
    }
  }, [editingUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: Partial<FormData & { general: string }> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    // Only require password for new users
    if (!editingUser) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    
    if (formData.role === 'officer' && !formData.department) {
      newErrors.department = 'Department is required for officers';
    }
    
    if (formData.role === 'institutional' && !formData.institutionName) {
      newErrors.institutionName = 'Institution name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      // For updates, only send changed fields
      const requestBody = editingUser ? 
        (formData.password ? formData : { ...formData, password: undefined }) : 
        formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        if (editingUser) {
          onUserUpdated?.();
        } else {
          onUserCreated();
        }
        onClose();
        // Reset form
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'officer',
          department: '',
          institutionName: '',
        });
      } else {
        setErrors({ general: data.error || `Failed to ${editingUser ? 'update' : 'create'} user` });
      }
    } catch (error) {
      console.error(`Error ${editingUser ? 'updating' : 'creating'} user:`, error);
      setErrors({ general: `An error occurred while ${editingUser ? 'updating' : 'creating'} the user` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center">
            <motion.div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            <motion.div
              className="relative inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl z-[10000]"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingUser && <span className="text-xs text-gray-500">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value as FormData['role'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="officer">Officer</option>
                    <option value="institutional">Institutional</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Conditional Fields */}
                {formData.role === 'officer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.department ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Investigation, Patrol, Forensics"
                      />
                    </div>
                    {errors.department && (
                      <p className="mt-1 text-xs text-red-600">{errors.department}</p>
                    )}
                  </div>
                )}

                {formData.role === 'institutional' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.institutionName}
                        onChange={(e) => handleInputChange('institutionName', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.institutionName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., City University, Medical Center"
                      />
                    </div>
                    {errors.institutionName && (
                      <p className="mt-1 text-xs text-red-600">{errors.institutionName}</p>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {isLoading ? 
                      (editingUser ? 'Updating...' : 'Creating...') : 
                      (editingUser ? 'Update User' : 'Create User')
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

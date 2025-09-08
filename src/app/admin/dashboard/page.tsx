'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Building, 
  Plus, 
  Search, 
  MoreVertical,
  LogOut,
  Settings,
  BarChart3,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import CreateUserModal from '../../../components/CreateUserModal';
import UserActionsDropdown from '../../../components/UserActionsDropdown';
import { ToastContainer, ToastType } from '../../../components/Toast';

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

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  officers: number;
  institutional: number;
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    officers: 0,
    institutional: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }>>([]);
  const router = useRouter();

  // Toast helper functions
  const addToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    // Get current user from localStorage
    const customUser = localStorage.getItem('customUser');
    if (customUser) {
      try {
        const userData = JSON.parse(customUser);
        if (userData.role !== 'admin') {
          router.push('/');
          return;
        }
        setCurrentUser(userData);
      } catch (error) {
        router.push('/sign-in');
        return;
      }
    } else {
      router.push('/sign-in');
      return;
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?page=1&limit=50&role=${selectedRole}&search=${searchTerm}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        
        // Calculate stats
        const totalUsers = data.users?.length || 0;
        const activeUsers = data.users?.filter((u: User) => u.isActive).length || 0;
        const admins = data.users?.filter((u: User) => u.role === 'admin').length || 0;
        const officers = data.users?.filter((u: User) => u.role === 'officer').length || 0;
        const institutional = data.users?.filter((u: User) => u.role === 'institutional').length || 0;
        
        setStats({
          totalUsers,
          activeUsers,
          admins,
          officers,
          institutional
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, searchTerm]);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        localStorage.removeItem('customUser');
        window.location.href = '/sign-in';
      } else {
        console.error('Sign out failed:', response.status);
        // Still clear local storage and redirect
        localStorage.removeItem('customUser');
        window.location.href = '/sign-in';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local storage and redirect
      localStorage.removeItem('customUser');
      window.location.href = '/sign-in';
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowCreateModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/admin/users/${user.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (response.ok) {
          addToast('success', 'User Deleted', `${user.firstName} ${user.lastName} has been permanently deleted.`);
          fetchUsers(); // Refresh the list
        } else {
          const data = await response.json();
          addToast('error', 'Delete Failed', data.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        addToast('error', 'Delete Failed', 'An error occurred while deleting the user');
      }
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    console.log('Toggling status for user:', user.id, 'Current status:', user.isActive);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const action = user.isActive ? 'deactivated' : 'activated';
        addToast('success', 'User Status Updated', `${user.firstName} ${user.lastName} has been ${action}.`);
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        console.error('Error response:', data);
        addToast('error', 'Status Update Failed', data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      addToast('error', 'Status Update Failed', 'An error occurred while updating the user status');
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingUser(null);
  };

  const handleUserCreated = () => {
    fetchUsers();
    addToast('success', 'User Created', 'New user has been successfully created.');
  };

  const handleUserUpdated = () => {
    fetchUsers();
    addToast('success', 'User Updated', 'User information has been successfully updated.');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'officer':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'institutional':
        return <Building className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'officer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'institutional':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage users and system settings</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
                </div>
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Officers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.officers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Institutional</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.institutional}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Users Management */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </button>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="officer">Officer</option>
                  <option value="institutional">Institutional</option>
                </select>
              </div>
            </div>
          </div>
          
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department/Institution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department || user.institutionName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <UserActionsDropdown
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                      onToggleStatus={handleToggleUserStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </motion.div>
      </main>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onUserCreated={handleUserCreated}
        onUserUpdated={handleUserUpdated}
        editingUser={editingUser}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

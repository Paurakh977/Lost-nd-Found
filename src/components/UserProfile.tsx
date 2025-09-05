'use client';

import React from 'react';
import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className = '' }: UserProfileProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({
        redirectUrl: '/', // Redirect to home page after sign out
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    // Navigate to profile page if you have one, or just close for now
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
        
        {/* User avatar */}
        <img
          src={user.imageUrl}
          alt={user.fullName || user.emailAddresses[0]?.emailAddress || 'User'}
          className="w-full h-full object-cover"
        />
        
        {/* Online indicator */}
        <motion.div
          className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[65]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              className="absolute top-full right-0 mt-2 w-64 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-white/20 dark:border-zinc-700/20 rounded-2xl shadow-xl overflow-hidden z-[70]"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-gray-200/20 dark:border-zinc-700/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500/20">
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <motion.button
                  onClick={handleProfileClick}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-zinc-700/50 transition-colors group"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <User className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                  Profile Settings
                </motion.button>

                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-zinc-700/50 transition-colors group"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors" />
                  Account Settings
                </motion.button>

                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-zinc-700/50 transition-colors group"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Shield className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-green-500 transition-colors" />
                  Privacy & Security
                </motion.button>

                {/* Divider */}
                <div className="my-2 border-t border-gray-200/20 dark:border-zinc-700/20" />

                {/* Sign Out */}
                <motion.button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors group"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <LogOut className="w-4 h-4 mr-3 group-hover:text-red-500 transition-colors" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Alternative minimal version using Clerk's UserButton directly with custom styling
export function ClerkUserProfile({ className = '' }: UserProfileProps) {
  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-8 h-8 ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300",
            userButtonPopoverCard: "bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-white/20 dark:border-zinc-700/20 rounded-2xl shadow-xl",
            userButtonPopoverActionButton: "hover:bg-gray-100/50 dark:hover:bg-zinc-700/50 transition-colors",
            userButtonPopoverActionButtonText: "text-gray-700 dark:text-gray-300",
            userButtonPopoverActionButtonIcon: "text-gray-500 dark:text-gray-400",
          },
        }}
        afterSignOutUrl="/"
      />
    </motion.div>
  );
}

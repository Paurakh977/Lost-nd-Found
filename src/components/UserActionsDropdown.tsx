'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Edit3, Trash2, UserX, UserCheck, Shield } from 'lucide-react';

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

interface UserActionsDropdownProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export default function UserActionsDropdown({ 
  user, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: UserActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const actions = [
    {
      label: 'Edit User',
      icon: Edit3,
      onClick: () => {
        onEdit(user);
        setIsOpen(false);
      },
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: user.isActive ? 'Deactivate' : 'Activate',
      icon: user.isActive ? UserX : UserCheck,
      onClick: () => {
        onToggleStatus(user);
        setIsOpen(false);
      },
      className: user.isActive 
        ? 'text-orange-700 hover:bg-orange-50' 
        : 'text-green-700 hover:bg-green-50',
    },
    {
      label: 'Delete User',
      icon: Trash2,
      onClick: () => {
        onDelete(user);
        setIsOpen(false);
      },
      className: 'text-red-700 hover:bg-red-50',
      disabled: user.role === 'admin', // Don't allow deleting admin users
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-3 transition-colors ${
                    action.disabled 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : action.className
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

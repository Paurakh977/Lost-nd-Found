'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Edit3, Trash2, UserX, UserCheck, Shield } from 'lucide-react';
import { createPortal } from 'react-dom';

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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const dropdownHeight = 120; // Approximate height of dropdown
      const dropdownWidth = 192; // w-48 = 192px

      let top = rect.bottom + 4;
      let left = rect.right - dropdownWidth;

      // Adjust if dropdown would go off-screen vertically
      if (top + dropdownHeight > windowHeight) {
        top = rect.top - dropdownHeight - 4;
      }

      // Adjust if dropdown would go off-screen horizontally
      if (left < 8) {
        left = 8;
      } else if (left + dropdownWidth > windowWidth - 8) {
        left = windowWidth - dropdownWidth - 8;
      }

      setDropdownPosition({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isClickOnButton = buttonRef.current && buttonRef.current.contains(target);
      const isClickOnDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      
      if (!isClickOnButton && !isClickOnDropdown) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      if (isOpen) {
        setIsOpen(false);
      }
    }

    function handleResize() {
      if (isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      document.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const actions = [
    {
      label: 'Edit User',
      icon: Edit3,
      onClick: () => {
        onEdit(user);
        setIsOpen(false);
      },
      className: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    },
    {
      label: user.isActive ? 'Deactivate' : 'Activate',
      icon: user.isActive ? UserX : UserCheck,
      onClick: () => {
        onToggleStatus(user);
        setIsOpen(false);
      },
      className: user.isActive 
        ? 'text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30' 
        : 'text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30',
    },
    {
      label: 'Delete User',
      icon: Trash2,
      onClick: () => {
        onDelete(user);
        setIsOpen(false);
      },
      className: 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30',
      disabled: user.role === 'admin', // Don't allow deleting admin users
    },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        aria-label="User actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Portal the dropdown to body to avoid clipping */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Dropdown */}
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="fixed w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50"
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
                }}
              >
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      disabled={action.disabled}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-3 transition-colors ${
                        action.disabled 
                          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                          : action.className
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pages, hasNextPage, hasPrevPage, total } = pagination;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisible = 5;

    if (pages <= maxVisible) {
      // Show all pages if total pages <= maxVisible
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page, last page, current page, and surrounding pages
      pageNumbers.push(1);

      if (page > 3) {
        pageNumbers.push('...');
      }

      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
        if (i !== 1 && i !== pages) {
          pageNumbers.push(i);
        }
      }

      if (page < pages - 2) {
        pageNumbers.push('...');
      }

      if (pages > 1) {
        pageNumbers.push(pages);
      }
    }

    return pageNumbers;
  };

  if (pages <= 1) {
    return null; // Don't show pagination if only one page
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing page <span className="font-semibold">{page}</span> of{' '}
        <span className="font-semibold">{pages}</span>{' '}
        <span className="text-gray-400 dark:text-gray-500">({total} total items)</span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <motion.button
          onClick={() => hasPrevPage && onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className={`p-2 rounded-lg transition-colors ${
            hasPrevPage
              ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          }`}
          whileHover={hasPrevPage ? { scale: 1.05 } : {}}
          whileTap={hasPrevPage ? { scale: 0.95 } : {}}
          title="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {/* Page Numbers */}
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-gray-500">
                ...
              </span>
            );
          }

          const isActive = pageNum === page;

          return (
            <motion.button
              key={pageNum}
              onClick={() => onPageChange(pageNum as number)}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              whileHover={!isActive ? { scale: 1.05 } : {}}
              whileTap={!isActive ? { scale: 0.95 } : {}}
            >
              {pageNum}
            </motion.button>
          );
        })}

        {/* Next Button */}
        <motion.button
          onClick={() => hasNextPage && onPageChange(page + 1)}
          disabled={!hasNextPage}
          className={`p-2 rounded-lg transition-colors ${
            hasNextPage
              ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          }`}
          whileHover={hasNextPage ? { scale: 1.05 } : {}}
          whileTap={hasNextPage ? { scale: 0.95 } : {}}
          title="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

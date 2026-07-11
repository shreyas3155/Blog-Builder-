'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex items-center justify-between border-t border-border/40 px-4 py-4 sm:px-6 mt-8 select-none">
      {/* Mobile view: simple Next/Prev */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-xl border border-border/50 bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary/20 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-xl border border-border/50 bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary/20 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          Next
        </button>
      </div>

      {/* Desktop view: details + full pagination buttons */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-xs items-center gap-1.5" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-border/50 bg-card text-muted-foreground hover:bg-secondary/20 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer h-[34px] w-[34px]"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((page, idx) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-muted-foreground select-none"
                  >
                    ...
                  </span>
                );
              }
              const isActive = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(page)}
                  className={`inline-flex items-center justify-center min-w-[34px] h-[34px] rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'border-border/50 bg-card text-muted-foreground hover:bg-secondary/20 hover:text-foreground'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-border/50 bg-card text-muted-foreground hover:bg-secondary/20 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer h-[34px] w-[34px]"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
}

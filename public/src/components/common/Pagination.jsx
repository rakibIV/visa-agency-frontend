import React from 'react';
import { motion } from 'framer-motion';

export default function Pagination({ page, setPage, totalPages }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-xl text-sm font-bold border border-navy-100 text-navy-600 bg-white hover:bg-navy-50 hover:text-navy-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        Previous
      </button>

      <div className="flex items-center gap-1 hidden sm:flex">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
              p === page
                ? 'bg-accent-600 text-white shadow-md'
                : 'text-navy-600 hover:bg-navy-50 border border-transparent hover:border-navy-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      
      {/* Mobile abbreviated indicator */}
      <div className="sm:hidden px-4 py-2 text-sm font-bold text-navy-600 bg-navy-50 rounded-xl">
        {page} / {totalPages}
      </div>

      <button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-xl text-sm font-bold border border-navy-100 text-navy-600 bg-white hover:bg-navy-50 hover:text-navy-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        Next
      </button>
    </div>
  );
}

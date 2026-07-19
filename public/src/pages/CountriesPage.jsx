import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import CountryCard from '../components/ui/CountryCard';
import SearchIcon from '@mui/icons-material/Search';
import Pagination from '../components/common/Pagination';

export default function CountriesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // Debounce search in a real app, but for now we'll just use it directly or via form submit if needed.
  // We can just rely on the API call.

  const { data, isLoading } = useQuery({
    queryKey: ['countries', search, page],
    queryFn: () => api.get('/countries/', { params: { page, ...(search ? { search } : {}) } }).then(r => r.data),
    keepPreviousData: true,
  });

  const countries = data?.results ?? data ?? [];
  const totalPages = data?.count ? Math.ceil(data.count / 20) : 1;
  const filtered = countries.filter(c => c.is_active);

  return (
    <div className="bg-surface-dim min-h-screen">
      {/* ═══════════════════════════════════════════
          HERO — Compact with Integrated Search
      ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-navy-950 text-white relative overflow-hidden grain">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-navy-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

        <div className="container-narrow relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="display-lg font-heading text-white mb-4">
              Explore Destinations
            </h1>
            <p className="body-lg text-navy-300 mb-10 max-w-xl mx-auto">
              Find your perfect destination and discover visa opportunities worldwide.
            </p>

            {/* Integrated Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-navy-400 group-focus-within:text-accent-400 transition-colors">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search for a country (e.g. Canada, Germany)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:bg-white/15 focus:border-accent-500/50 transition-all text-lg shadow-elevated"
              />
              
              {/* Clear button */}
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-4 flex items-center text-navy-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COUNTRIES GRID
      ═══════════════════════════════════════════ */}
      <section className="section-py">
        <div className="container-wide">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-navy-50 shadow-soft">
                  <div className="h-48 bg-navy-100/50 rounded-t-3xl" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-navy-100 rounded w-2/3" />
                    <div className="h-4 bg-navy-50 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-navy-50 shadow-soft max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center text-navy-300 mx-auto mb-6">
                <SearchIcon fontSize="large" />
              </div>
              <h3 className="heading-md font-heading text-navy-900 mb-2">No countries found</h3>
              <p className="text-navy-500">We couldn't find any countries matching "{search}".<br/>Try adjusting your search term.</p>
              <button 
                onClick={() => setSearch('')}
                className="mt-6 px-6 py-2.5 bg-navy-50 hover:bg-navy-100 text-navy-700 font-bold rounded-full transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="eyebrow text-navy-500">
                  Showing {filtered.length} {filtered.length === 1 ? 'country' : 'countries'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filtered.map((country, i) => (
                  <CountryCard key={country.slug || i} country={country} index={i} />
                ))}
              </div>
              
              <Pagination page={page} setPage={setPage} totalPages={totalPages} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

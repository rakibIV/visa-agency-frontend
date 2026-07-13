import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import SectionHeading from '../components/ui/SectionHeading';
import CountryCard from '../components/ui/CountryCard';

export default function CountriesPage() {
  const [search, setSearch] = useState('');

  const { data: countries, isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api.get('/countries/').then(r => r.data.results ?? r.data),
  });

  const filtered = countries?.filter(c =>
    c.is_active && c.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <>
      {/* Hero Banner */}
      <section className="gradient-hero pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <img src="/src/assets/hero.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black text-white mb-4 font-heading"
          >
            Explore Countries
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-navy-200 text-lg max-w-xl mx-auto mb-8"
          >
            Find your perfect destination and discover visa opportunities worldwide.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto"
          >
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search countries..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:bg-white/15 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Countries Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse shadow-navy">
                  <div className="h-48 bg-navy-100 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-navy-100 rounded w-2/3" />
                    <div className="h-3 bg-navy-50 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-navy-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
              </svg>
              <h3 className="text-lg font-bold text-navy-800">No countries found</h3>
              <p className="text-navy-500 text-sm mt-1">Try adjusting your search term.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-navy-500 mb-6 font-medium">{filtered.length} countries available</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((country, i) => (
                  <CountryCard key={country.slug || i} country={country} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

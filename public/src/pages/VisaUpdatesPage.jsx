import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

export default function VisaUpdatesPage() {
  const [filter, setFilter] = useState('ALL');

  const { data: updates, isLoading } = useQuery({
    queryKey: ['visa-updates'],
    queryFn: () => api.get('/public/applicant-results/current-month/').then(r => r.data),
  });

  const filteredUpdates = useMemo(() => {
    if (!updates) return [];
    if (filter === 'ALL') return updates;
    return updates.filter(u => u.status?.toUpperCase() === filter);
  }, [updates, filter]);

  return (
    <div className="bg-surface-dim min-h-screen pb-24">
      {/* ═══════════════════════════════════════════
          HERO — Dynamic Pulse
      ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-white border-b border-navy-50 relative overflow-hidden grain">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="container-narrow relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center text-green-600 border border-navy-100 shadow-soft relative">
              <NotificationsActiveIcon fontSize="large" />
              <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="display-lg font-heading text-navy-900 mb-4">
            Live Results Feed
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="body-lg text-navy-500 max-w-xl mx-auto">
            Real-time feed of visa approvals and decisions for the current month.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CONTENT — Sticky Filter & Feed
      ═══════════════════════════════════════════ */}
      <section className="container-narrow mt-12 relative z-10">
        
        {/* Filter Pills */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-full p-1.5 shadow-soft border border-navy-50">
            {['ALL', 'APPROVED', 'REJECTED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  filter === f 
                    ? 'bg-navy-900 text-white shadow-md' 
                    : 'text-navy-500 hover:text-navy-900 hover:bg-navy-50'
                }`}
              >
                {f === 'ALL' ? 'All Updates' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Results Feed */}
        {isLoading ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-navy-50 shadow-soft" />
            ))}
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-soft border border-navy-50 max-w-3xl mx-auto">
            <NotificationsActiveIcon sx={{ fontSize: 48 }} className="text-navy-300 mx-auto mb-4" />
            <h3 className="heading-md font-heading text-navy-900 mb-2">No updates found</h3>
            <p className="text-navy-500">No {filter !== 'ALL' ? filter.toLowerCase() : ''} decisions have been recorded for this month yet.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {filteredUpdates.map((update, i) => {
                const isApproved = update.status?.toUpperCase() === 'APPROVED';
                
                return (
                  <motion.div
                    key={update.application_id || i}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-navy-50 shadow-soft hover:shadow-card transition-shadow relative overflow-hidden"
                  >
                    {/* Status accent border */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isApproved ? 'bg-green-500' : 'bg-red-500'}`} />
                    
                    <div className="flex items-center gap-4 ml-2">
                      <div className="flex items-center gap-3 shrink-0">
                        {update.photo ? (
                          <img 
                            src={update.photo} 
                            alt="Applicant" 
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border border-navy-100 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-navy-50 flex items-center justify-center text-navy-300 font-bold text-xl font-heading border border-navy-100 shadow-sm">
                            {update.applicant_name?.charAt(0) || 'A'}
                          </div>
                        )}
                        <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-surface-dim text-navy-400 font-bold border border-navy-50">
                          <span className="text-sm font-heading">{new Date(update.result_date || Date.now()).getDate()}</span>
                          <span className="text-[10px] uppercase tracking-wider">{new Date(update.result_date || Date.now()).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="heading-md font-heading text-navy-900 line-clamp-1">{update.applicant_name}</h4>
                        <div className="flex flex-col gap-1 mt-1 text-sm text-navy-500 font-medium">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-navy-900 font-bold">ID: {update.application_id}</span>
                            <span className="text-navy-300 hidden sm:inline">•</span>
                            <span className="text-navy-700">Passport: {update.passport_number || 'N/A'}</span>
                            <span className="text-navy-300 hidden sm:inline">•</span>
                            <span className="text-navy-700">{update.email || 'N/A'}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className="text-navy-900">{update.country}</span>
                            <span className="text-navy-300">•</span>
                            <span>{update.visa}</span>
                            <span className="text-navy-300 hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{update.job}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between sm:justify-end border-t border-navy-50 pt-3 sm:pt-0 sm:border-none">
                      <div className="sm:hidden text-xs text-navy-400 font-bold">
                        {new Date(update.result_date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border ${
                        isApproved 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {update.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}

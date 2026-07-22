import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

export default function VisaUpdatesPage() {
  const [filter, setFilter] = useState('ALL');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Calculate zoom level to force desktop view on mobile
  useEffect(() => {
    const updateZoom = () => {
      const width = window.innerWidth;
      // Use 1250 to account for padding on the container so the 1200px table doesn't get squeezed
      if (width < 1250) {
        setZoomLevel(width / 1250);
      } else {
        setZoomLevel(1);
      }
    };
    
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

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
    <div className="bg-surface-dim min-h-screen pb-24 overflow-x-hidden">
      <div 
        className="origin-top" 
        style={{ 
          zoom: zoomLevel < 1 ? zoomLevel : 1,
          minWidth: zoomLevel < 1 ? '1250px' : '100%'
        }}
      >
        {/* ═══════════════════════════════════════════
            HERO — Dynamic Pulse
        ═══════════════════════════════════════════ */}
        <section 
          className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-white border-b border-navy-50 relative overflow-hidden grain"
          style={{
            paddingTop: zoomLevel < 1 
              ? `${(typeof window !== 'undefined' && window.innerWidth >= 1024 ? 160 : 128) / zoomLevel}px` 
              : undefined
          }}
        >
        <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
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
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 mt-12 relative z-10">
        
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
          <div className="bg-white rounded-[2rem] shadow-card border border-navy-50 overflow-x-auto w-full">
            <table className="w-full min-w-[1200px] text-left border-collapse">
              <thead>
                <tr className="bg-navy-900 text-white border-b border-navy-800">
                  <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em] w-16 text-center">No</th>
                  <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em]">Name</th>
                  <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em]">App ID</th>
                  <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em]">Passport</th>
                  <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em]">Country</th>
                  <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em]">Visa</th>
                  <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em]">Job</th>
                  <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em] w-28 text-center">Date</th>
                  <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em] w-32 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50/50">
                <AnimatePresence>
                  {filteredUpdates.map((update, index) => {
                    const isApproved = update.status?.toUpperCase() === 'APPROVED';
                    const rowBg = index % 2 === 0 ? "bg-white" : "bg-[#fbfcfd]";
                    
                    return (
                      <motion.tr
                        key={update.application_id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className={`${rowBg} hover:bg-navy-50/40 transition-colors duration-200 group relative`}
                      >
                        <td className="py-4 px-6 text-center relative">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${isApproved ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div className="inline-flex w-8 h-8 rounded-xl bg-navy-50 text-navy-900 items-center justify-center font-bold text-sm group-hover:bg-accent-50 group-hover:text-accent-700 transition-colors">
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            {update.photo ? (
                              <img 
                                src={update.photo} 
                                alt="Applicant" 
                                className="w-10 h-10 rounded-xl object-cover border border-navy-100 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-300 font-bold text-xl font-heading border border-navy-100 shadow-sm">
                                {update.applicant_name?.charAt(0) || 'A'}
                              </div>
                            )}
                            <div className="font-bold text-navy-900 text-[14px] whitespace-nowrap">{update.applicant_name}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-navy-700 text-[13px]">{update.application_id}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-navy-700 text-[13px]">{update.passport_number || 'N/A'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-navy-900 text-[13px]">{update.country}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-navy-600 text-[13px]">{update.visa}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-navy-700 font-medium text-[13px] truncate max-w-[150px]">{update.job}</div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="font-bold text-navy-900 text-xs">
                            {new Date(update.result_date || Date.now()).getDate()} {new Date(update.result_date || Date.now()).toLocaleString('default', { month: 'short' })}
                          </div>
                          <div className="text-[9px] text-navy-400 font-bold uppercase mt-0.5">
                            {new Date(update.result_date || Date.now()).getFullYear()}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase w-full border ${
                            isApproved 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {update.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

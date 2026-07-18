import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import StaffProfileModal from '../components/ui/StaffProfileModal';

export default function MonthlySlotsPage() {
  const { data: slots, isLoading } = useQuery({
    queryKey: ['monthly-slots'],
    queryFn: () => api.get('/public/staff-slots/current-month/').then(r => r.data),
  });

  const [selectedStaff, setSelectedStaff] = useState(null);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-surface-dim min-h-screen pb-24">
      {/* ═══════════════════════════════════════════
          HERO — Consultant Header
      ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-white border-b border-navy-50 relative overflow-hidden grain">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent-50 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 -translate-y-1/3" />
        
        <div className="container-narrow relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center text-accent-600 border border-navy-100 shadow-soft">
              <GroupIcon fontSize="large" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="display-lg font-heading text-navy-900 mb-4">
            Staff Slots
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="body-lg text-navy-500 max-w-xl mx-auto mb-8">
            Connect with our expert team and check their availability for {currentMonth}.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-50 rounded-full border border-navy-100 text-navy-700 font-bold text-sm shadow-soft"
          >
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            Live Availability
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LEADERBOARD / SLOTS GRID
      ═══════════════════════════════════════════ */}
      <section className="container-narrow mt-12 relative z-10">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-24 animate-pulse shadow-soft border border-navy-50" />
            ))}
          </div>
        ) : slots?.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-soft border border-navy-50">
            <GroupIcon sx={{ fontSize: 48 }} className="text-navy-300 mx-auto mb-4" />
            <h3 className="heading-md font-heading text-navy-900 mb-2">No Staff Available</h3>
            <p className="text-navy-500">Staff slots for this month haven't been updated yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {slots?.map((slot, index) => {
              const isLocked = slot.remaining_slot === 0;

              return (
                <motion.div
                  key={slot.staff_slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative bg-white rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-6 justify-between border shadow-soft hover:shadow-card transition-all duration-300 group ${
                    isLocked ? 'border-navy-100 opacity-75 grayscale-[50%]' : 'border-navy-50 cursor-pointer'
                  }`}
                  onClick={() => setSelectedStaff({ slug: slot.staff_slug, name: slot.staff_name })}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank Number */}
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-navy-50 text-navy-400 flex items-center justify-center font-bold text-lg font-heading border border-navy-100 group-hover:bg-accent-50 group-hover:text-accent-600 group-hover:border-accent-200 transition-colors">
                      #{index + 1}
                    </div>
                    
                    {/* Staff Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="heading-md font-heading text-navy-900 group-hover:text-accent-600 transition-colors">{slot.staff_name}</h3>
                        {isLocked && <LockIcon fontSize="small" className="text-navy-300" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="text-navy-500 font-medium">{slot.designation}</span>
                        {slot.office && (
                          <>
                            <span className="text-navy-300">•</span>
                            <span className="text-navy-500 font-bold">{slot.office}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slot Stats & Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8 sm:ml-18 lg:ml-0 w-full lg:w-auto mt-4 sm:mt-0">
                    <div className="flex items-center gap-4 lg:gap-8 bg-surface-dim px-6 py-4 rounded-2xl border border-navy-50 w-full sm:w-auto justify-center">
                      <div className="text-center">
                        <div className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-1">Total Target</div>
                        <div className="text-xl font-black text-navy-900 font-heading">{slot.total_slot}</div>
                      </div>
                      <div className="w-px h-10 bg-navy-100" />
                      <div className="text-center">
                        <div className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-1">Slots Left</div>
                        <div className={`text-xl font-black font-heading ${
                          isLocked ? 'text-red-500' : 'text-accent-600'
                        }`}>
                          {slot.remaining_slot}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStaff({ slug: slot.staff_slug, name: slot.staff_name });
                      }}
                      className={`shrink-0 inline-flex items-center justify-center gap-2 px-6 py-4 w-full sm:w-auto text-sm font-bold rounded-2xl transition-all border bg-navy-900 hover:bg-accent-600 text-white border-navy-900 hover:border-accent-600 shadow-soft`}
                    >
                      <LockIcon fontSize="small" className="opacity-90" /> View Profile
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Staff Profile Modal */}
      <StaffProfileModal
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        staffSlug={selectedStaff?.slug}
        staffName={selectedStaff?.name}
      />
    </div>
  );
}

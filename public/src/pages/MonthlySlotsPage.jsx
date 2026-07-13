import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import SectionHeading from '../components/ui/SectionHeading';
import LockIcon from '@mui/icons-material/Lock';
import StaffProfileModal from '../components/ui/StaffProfileModal';

export default function MonthlySlotsPage() {
  const { data: slots, isLoading } = useQuery({
    queryKey: ['monthly-slots'],
    queryFn: () => api.get('/public/staff-slots/current-month/').then(r => r.data),
  });

  const [selectedStaff, setSelectedStaff] = useState(null);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
          >
            Staff Leaderboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-navy-200 text-lg max-w-xl mx-auto"
          >
            Current month performance and slot availability across our global branches.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mt-8 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white font-semibold"
          >
            <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            {currentMonth}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-24 animate-pulse shadow-navy border border-navy-100" />
              ))}
            </div>
          ) : !slots || slots.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-navy-800">No slot data available</h3>
              <p className="text-navy-500 text-sm mt-1">Check back later for updates.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-navy-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-navy-900 text-white text-xs uppercase tracking-widest">
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Staff Name</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Branch</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Target Completion</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Total Slots</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Used Slots</th>
                      <th className="px-6 py-4 font-bold text-center whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50">
                    {slots.map((slot, i) => {
                      const percentage = Math.min(100, Math.round((slot.used_slot / slot.total_slot) * 100)) || 0;
                      return (
                        <tr key={slot.id || i} className="hover:bg-navy-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-navy-100 overflow-hidden shrink-0 border border-navy-200">
                                {slot.photo ? (
                                  <img src={slot.photo} alt={slot.staff_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-navy-400 font-bold">
                                    {slot.staff_name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-navy-900">{slot.staff_name}</div>
                                <div className="text-xs text-navy-500 font-medium">{slot.designation}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-700">
                            {slot.office}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-navy-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-accent-500' : 'bg-navy-400'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-navy-900">{percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-navy-900">
                            {slot.total_slot}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-navy-900">
                            {slot.used_slot}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => setSelectedStaff({ name: slot.staff_name })}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-navy-50 hover:bg-navy-900 hover:text-white text-navy-900 text-xs font-bold rounded-lg transition-colors border border-navy-100 hover:border-navy-900"
                              >
                                <LockIcon fontSize="small" className="opacity-70" /> View Profile
                              </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── MODALS ─── */}
      <StaffProfileModal
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        staffName={selectedStaff?.name}
      />
    </>
  );
}

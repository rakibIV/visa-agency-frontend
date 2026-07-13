import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import SectionHeading from '../components/ui/SectionHeading';

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
    <>
      <section className="gradient-hero pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Live Visa Updates
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-navy-200 text-lg max-w-xl mx-auto">
            Real-time feed of visa approvals and decisions for the current month.
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-navy-50 rounded-xl p-1 shadow-sm border border-navy-100">
              {['ALL', 'APPROVED', 'REJECTED'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    filter === f 
                      ? 'bg-white text-navy-900 shadow-sm' 
                      : 'text-navy-500 hover:text-navy-700'
                  }`}
                >
                  {f === 'ALL' ? 'All Updates' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-navy-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-navy-900 text-white text-xs uppercase tracking-widest">
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Date</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">App ID</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Applicant</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Visa Details</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50">
                    {[...Array(6)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><div className="w-20 h-4 bg-navy-50 rounded animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="w-16 h-4 bg-navy-50 rounded animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-navy-50 animate-pulse" /><div className="w-24 h-4 bg-navy-50 rounded animate-pulse" /></div></td>
                        <td className="px-6 py-4"><div className="w-32 h-4 bg-navy-50 rounded animate-pulse mb-1" /><div className="w-48 h-3 bg-navy-50 rounded animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="w-16 h-6 bg-navy-50 rounded-full animate-pulse" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-navy-100 border-dashed">
              <svg className="w-12 h-12 text-navy-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-navy-800">No updates found</h3>
              <p className="text-navy-500 text-sm mt-1">There are no {filter !== 'ALL' ? filter.toLowerCase() : ''} results for this month yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-navy-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-navy-900 text-white text-xs uppercase tracking-widest">
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Date</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">App ID</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Applicant</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Visa Details</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50">
                    {filteredUpdates.map((item, i) => (
                      <tr key={i} className="hover:bg-navy-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600 font-medium">
                          {new Date(item.result_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-navy-400 font-bold tracking-wide">
                          #{item.application_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-navy-50 border border-navy-100 flex items-center justify-center shrink-0 text-navy-500 font-bold text-sm">
                              {item.applicant_name.charAt(0)}
                            </div>
                            <span className="font-bold text-navy-900">{item.applicant_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-navy-700">{item.visa}</div>
                          <div className="text-xs text-navy-500">{item.country} • {item.job}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

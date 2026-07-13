import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

export default function StatusCheckPage() {
  const [applicationId, setApplicationId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const { data } = await api.post('/public/applicant-status/', {
        application_id: applicationId.trim().toUpperCase(),
        email: email.trim(),
        phone: phone.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'No matching applicant found. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <img src="/src/assets/hero.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6">
              <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 font-heading">Track Your Application</h1>
            <p className="text-navy-200 text-lg max-w-xl mx-auto">
              Enter your application details below to check your current visa processing status.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-24">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-navy-lg border border-navy-100/50"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-1.5">Application ID</label>
              <input
                type="text"
                value={applicationId}
                onChange={e => setApplicationId(e.target.value)}
                placeholder="e.g. ARG72Q9A"
                required
                className="w-full px-4 py-3 bg-navy-50 border border-navy-200 rounded-xl text-navy-900 font-mono uppercase placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-navy-50 border border-navy-200 rounded-xl text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01700000000"
                required
                className="w-full px-4 py-3 bg-navy-50 border border-navy-200 rounded-xl text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white font-bold rounded-xl shadow-lg shadow-accent-600/25 transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                  Check Status
                </>
              )}
            </button>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-8 space-y-6"
            >
              {/* Main Card */}
              <div className="bg-white rounded-2xl p-8 shadow-navy-lg border border-navy-100/50">
                <div className="flex items-start gap-5">
                  {/* Photo */}
                  <div className="w-20 h-20 rounded-2xl bg-navy-100 overflow-hidden shrink-0 ring-4 ring-navy-100">
                    {result.photo ? (
                      <img src={result.photo} alt={result.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-navy-300">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-xl font-extrabold text-navy-900">{result.full_name}</h2>
                        <p className="text-sm text-navy-500 font-mono">{result.application_id}</p>
                      </div>
                      <span
                        className="px-4 py-1.5 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: result.status_color ? `${result.status_color}20` : '#E0EAFF',
                          color: result.status_color || '#0F2B5B',
                        }}
                      >
                        {result.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-navy-100">
                  <div>
                    <span className="text-xs text-navy-500 font-semibold uppercase">Country</span>
                    <p className="text-sm font-bold text-navy-900 mt-0.5">{result.country}</p>
                  </div>
                  <div>
                    <span className="text-xs text-navy-500 font-semibold uppercase">Visa Type</span>
                    <p className="text-sm font-bold text-navy-900 mt-0.5">{result.visa}</p>
                  </div>
                  <div>
                    <span className="text-xs text-navy-500 font-semibold uppercase">Job Position</span>
                    <p className="text-sm font-bold text-navy-900 mt-0.5">{result.job}</p>
                  </div>
                  {result.assigned_staff && (
                    <div>
                      <span className="text-xs text-navy-500 font-semibold uppercase">Assigned Agent</span>
                      <p className="text-sm font-bold text-navy-900 mt-0.5">{result.assigned_staff.name}</p>
                      {result.assigned_staff.designation && (
                        <p className="text-xs text-navy-400">{result.assigned_staff.designation}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              {result.status_history?.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-navy border border-navy-100/50">
                  <h3 className="text-lg font-bold text-navy-900 mb-6">Status Timeline</h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-navy-100" />
                    <div className="space-y-6">
                      {result.status_history.map((entry, i) => (
                        <div key={i} className="relative flex gap-4">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0"
                            style={{ backgroundColor: entry.color ? `${entry.color}20` : '#E0EAFF' }}
                          >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || '#0F2B5B' }} />
                          </div>
                          <div className="pt-1">
                            <p className="text-sm font-bold text-navy-900">{entry.status}</p>
                            <p className="text-xs text-navy-500 mt-0.5">
                              {new Date(entry.changed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

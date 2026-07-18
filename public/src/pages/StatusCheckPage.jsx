import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FactCheckIcon from '@mui/icons-material/FactCheck';

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
    <div className="bg-surface-dim min-h-screen pb-24">
      {/* ═══════════════════════════════════════════
          HERO — Minimal Context
      ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden bg-navy-950 text-white grain">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 to-navy-900" />
        
        <div className="container-narrow relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md mb-6 shadow-soft">
              <AssignmentTurnedInIcon fontSize="large" className="text-accent-400" />
            </div>
            <h1 className="display-lg font-heading text-white mb-4">Track Application</h1>
            <p className="body-lg text-navy-300 max-w-xl mx-auto">
              Enter your secure application details below to check your real-time processing status.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FORM & RESULTS — Centered Focus
      ═══════════════════════════════════════════ */}
      <div className="container-narrow -mt-10 relative z-10">
        <div className="max-w-xl mx-auto">
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 sm:p-10 shadow-elevated border border-navy-50"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block eyebrow text-navy-500 mb-2 ml-1">Application ID</label>
                <input
                  type="text"
                  value={applicationId}
                  onChange={e => setApplicationId(e.target.value)}
                  placeholder="e.g. ARG72Q9A"
                  required
                  className="w-full px-5 py-4 bg-surface-dim border border-navy-100 rounded-xl text-navy-900 font-mono text-lg tracking-wider uppercase placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all font-bold"
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block eyebrow text-navy-500 mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    className="w-full px-5 py-3.5 bg-surface-dim border border-navy-100 rounded-xl text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block eyebrow text-navy-500 mb-2 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter phone"
                    required
                    className="w-full px-5 py-3.5 bg-surface-dim border border-navy-100 rounded-xl text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-navy-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Check Status'}
                {!loading && <ArrowForwardIcon fontSize="small" />}
              </button>
            </form>
          </motion.div>

          {/* Results Area */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mt-8 space-y-6"
              >
                {/* Applicant Summary */}
                <div className="bg-white rounded-3xl p-8 shadow-card border border-navy-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-50 rounded-bl-[100px] -z-10" />
                  
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div className="flex items-center gap-5">
                      {result.photo ? (
                        <img 
                          src={result.photo} 
                          alt={result.full_name} 
                          className="w-16 h-16 rounded-2xl object-cover border border-navy-100 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center text-navy-400 font-bold text-2xl font-heading border border-navy-100 shrink-0 shadow-sm">
                          {result.full_name?.charAt(0) || 'A'}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-black text-navy-900 font-heading mb-1">{result.full_name}</h2>
                        <div className="inline-flex items-center gap-2 text-sm text-navy-500 bg-navy-50 px-3 py-1 rounded-md font-mono">
                          <FactCheckIcon fontSize="small" />
                          {result.application_id}
                        </div>
                      </div>
                    </div>
                    
                    <span
                      className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: result.status_color ? `${result.status_color}15` : '#E0EAFF',
                        color: result.status_color || '#0F2B5B',
                        border: `1px solid ${result.status_color ? `${result.status_color}30` : '#C1D4FE'}`
                      }}
                    >
                      {result.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-navy-50">
                    <div>
                      <span className="eyebrow text-navy-400 block mb-1">Destination</span>
                      <p className="text-base font-bold text-navy-900">{result.country}</p>
                    </div>
                    <div>
                      <span className="eyebrow text-navy-400 block mb-1">Visa Type</span>
                      <p className="text-base font-bold text-navy-900">{result.visa}</p>
                    </div>
                    <div>
                      <span className="eyebrow text-navy-400 block mb-1">Position</span>
                      <p className="text-base font-bold text-navy-900">{result.job}</p>
                    </div>
                    {result.assigned_staff && (
                      <div>
                        <span className="eyebrow text-navy-400 block mb-1">Agent</span>
                        <p className="text-base font-bold text-navy-900">{result.assigned_staff.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                {result.status_history?.length > 0 && (
                  <div className="bg-white rounded-3xl p-8 shadow-card border border-navy-50">
                    <h3 className="heading-md font-heading text-navy-900 mb-8">Status Timeline</h3>
                    
                    <div className="relative">
                      {/* Vertical connector */}
                      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-navy-100" />
                      
                      <div className="space-y-8">
                        {result.status_history.map((entry, i) => (
                          <div key={i} className="relative flex gap-6">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 mt-0.5 ring-4 ring-white"
                              style={{ backgroundColor: entry.color ? `${entry.color}20` : '#E0EAFF' }}
                            >
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || '#0F2B5B' }} />
                            </div>
                            <div>
                              <p className="text-base font-bold text-navy-900">{entry.status}</p>
                              <p className="text-sm text-navy-500 font-medium mt-1">
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
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContactPageIcon from '@mui/icons-material/ContactPage';

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
      const data = err?.response?.data;
      if (data?.detail) {
        setError(data.detail);
      } else if (data && typeof data === 'object') {
        const firstErr = Object.values(data).flat()[0];
        setError(firstErr || 'No matching applicant found. Please check your credentials and try again.');
      } else {
        setError('No matching applicant found. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-28">
      {/* ═══════════════════════════════════════════
          HERO — Minimal Header
      ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-24 relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-navy-950 to-navy-950" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-narrow relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md mb-5 shadow-inner">
              <AssignmentTurnedInIcon className="text-accent-400 text-2xl" />
            </div>
            <h1 className="display-lg font-heading text-white mb-3">Track Application</h1>
            <p className="body-lg text-slate-300 max-w-xl mx-auto">
              Real-time processing updates and verified progress details.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FORM & RESULTS AREA
      ═══════════════════════════════════════════ */}
      <div className="container-narrow -mt-12 relative z-20">
        <div className="max-w-2xl mx-auto space-y-10">
          
          {/* Search Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Application ID</label>
                <input
                  type="text"
                  value={applicationId}
                  onChange={e => setApplicationId(e.target.value)}
                  placeholder="e.g. SV123456789 or ARG72Q9A"
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-base tracking-wider uppercase placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all font-bold"
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter phone"
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-1 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-2xl transition-all shadow-lg shadow-navy-950/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Retrieving Records...' : 'Check Status'}
                {!loading && <ArrowForwardIcon fontSize="small" />}
              </button>
            </form>
          </motion.div>

          {/* Results Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* 1. Header Profile Banner */}
                <div className="bg-gradient-to-br from-navy-900 via-navy-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      {result.photo ? (
                        <img 
                          src={result.photo} 
                          alt={result.full_name} 
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-md shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl border border-white/20 shrink-0 shadow-md">
                          {result.full_name?.charAt(0) || 'A'}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">{result.full_name}</h2>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mt-1">
                          <FactCheckIcon style={{ fontSize: 16 }} className="text-accent-400" />
                          <span>{result.application_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="self-start sm:self-auto">
                      <span
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm"
                        style={{
                          backgroundColor: result.status_color ? `${result.status_color}25` : 'rgba(255,255,255,0.1)',
                          color: result.status_color || '#FFFFFF',
                          borderColor: result.status_color ? `${result.status_color}50` : 'rgba(255,255,255,0.2)'
                        }}
                      >
                        <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: result.status_color || '#3B82F6' }} />
                        {result.status}
                      </span>
                    </div>
                  </div>

                  {/* Stat Strip (No nested boxes) */}
                  <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <FlightTakeoffIcon style={{ fontSize: 14 }} className="text-accent-400" />
                        <span>Destination</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{result.country || '—'}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <ContactPageIcon style={{ fontSize: 14 }} className="text-accent-400" />
                        <span>Visa Type</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{result.visa || '—'}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <WorkIcon style={{ fontSize: 14 }} className="text-accent-400" />
                        <span>Position</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{result.job || '—'}</p>
                    </div>

                    {result.assigned_staff && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <PersonIcon style={{ fontSize: 14 }} className="text-accent-400" />
                          <span>Assigned Agent</span>
                        </div>
                        <p className="text-sm font-bold text-white truncate">{result.assigned_staff.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Timeline Section */}
                {result.status_history?.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                        <CheckCircleIcon fontSize="small" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Application Progress Timeline</h3>
                    </div>

                    <div className="relative pl-3 space-y-6">
                      {/* Vertical line connecting dots */}
                      <div className="absolute left-[21px] top-3 bottom-3 w-0.5 bg-slate-200" />

                      {result.status_history.map((entry, i) => (
                        <div key={i} className="relative flex items-start gap-4 z-10">
                          {/* Circle dot indicator */}
                          <div
                            className="w-5 h-5 rounded-full ring-4 ring-white shrink-0 mt-0.5 shadow-sm"
                            style={{ backgroundColor: entry.color || '#2563EB' }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{entry.status}</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">
                              {new Date(entry.changed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Financial Breakdown Section */}
                {(result.payments?.length > 0 || result.refunds?.length > 0) && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <AccountBalanceWalletIcon fontSize="small" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Financial History</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Payments List */}
                      {result.payments?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <ReceiptLongIcon style={{ fontSize: 16 }} /> Payment Logs
                          </h4>
                          <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                            {result.payments.map((payment, i) => (
                              <div key={payment.id || i} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase font-mono">{payment.receipt_number || `REC-${payment.id?.slice(0,6)}`}</span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">{payment.installment_type} Installment</span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium">
                                    {payment.payment_method} • {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A'}
                                  </p>
                                </div>
                                <div className="text-right font-black text-slate-900 text-lg">
                                  ৳{Number(payment.amount).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Refunds List */}
                      {result.refunds?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                            <ReceiptLongIcon style={{ fontSize: 16 }} /> Refund Logs
                          </h4>
                          <div className="divide-y divide-rose-100 bg-rose-50/30 rounded-2xl border border-rose-100 overflow-hidden">
                            {result.refunds.map((refund, i) => (
                              <div key={refund.id || i} className="p-4 sm:p-5 flex items-center justify-between hover:bg-rose-50/70 transition-colors">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-rose-400 uppercase font-mono">{refund.receipt_number || `REF-${refund.id?.slice(0,6)}`}</span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 capitalize">Refund ({refund.refund_status})</span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium">
                                    {refund.refund_method} • {new Date(refund.created_at).toLocaleDateString('en-GB')}
                                  </p>
                                </div>
                                <div className="text-right font-black text-rose-700 text-lg">
                                  ৳{Number(refund.refund_amount).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

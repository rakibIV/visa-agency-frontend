import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import VerifiedIcon from '@mui/icons-material/Verified';
import TimelineIcon from '@mui/icons-material/Timeline';
import BadgeIcon from '@mui/icons-material/Badge';
import SearchIcon from '@mui/icons-material/Search';

export default function StatusCheckPage() {
  const [applicationId, setApplicationId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'finance'

  // Fetch company info and logos to get the 'Up & Down' logo variation
  const { data: companyInfo } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then(r => r.data.results?.[0] ?? r.data?.[0]),
    staleTime: 1000 * 60 * 5,
  });

  const { data: companyLogosList } = useQuery({
    queryKey: ['company-logos-list'],
    queryFn: () => api.get('/company-logos/').then(r => r.data.results ?? r.data).catch(() => []),
    staleTime: 1000 * 60 * 5,
  });

  const { data: currenciesData } = useQuery({
    queryKey: ['currencies-list'],
    queryFn: () => api.get('/currencies/').then(r => r.data.results ?? r.data).catch(() => []),
    staleTime: 1000 * 60 * 30,
  });

  const currenciesList = Array.isArray(currenciesData) ? currenciesData : [];

  const getCurrencySymbol = (code) => {
    if (!code) return '৳';
    const upper = code.toUpperCase();
    const found = currenciesList.find(c => c.code === upper);
    if (found?.symbol) return found.symbol;
    const defaultSymbols = {
      BDT: '৳',
      SAR: 'SAR ',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'AED ',
      OMR: 'OMR ',
      QAR: 'QAR ',
      KWD: 'KWD ',
      BHD: 'BHD ',
      MYR: 'RM',
      SGD: 'S$',
      INR: '₹',
    };
    return defaultSymbols[upper] || `${upper} `;
  };

  const formatPaymentAmount = (amount, currencyCode) => {
    const symbol = getCurrencySymbol(currencyCode);
    const num = Number(amount) || 0;
    return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const allLogos = Array.isArray(companyInfo?.logos) && companyInfo.logos.length ? companyInfo.logos : (companyLogosList || []);
  const upDownLogoObj = allLogos.find(
    (l) => l.title?.toLowerCase().includes('up') || l.serial_number === 2
  );

  const getLogoUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') {
      return img.startsWith('http') ? img : `https://res.cloudinary.com/prfvuhln/${img}`;
    }
    return null;
  };

  const upDownLogoUrl = getLogoUrl(upDownLogoObj?.image) || getLogoUrl(companyInfo?.company_logo);

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
      setActiveTab('overview');
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
    <div className="bg-slate-100/70 min-h-screen pb-28 font-sans selection:bg-accent-500 selection:text-white">
      
      {/* ═══════════════════════════════════════════
          1. HERO HEADER — Brand Identity & Search
      ═══════════════════════════════════════════ */}
      <section className="pt-28 pb-20 lg:pt-36 lg:pb-24 relative overflow-hidden bg-gradient-to-b from-navy-950 via-slate-950 to-navy-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-narrow relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            {/* Top Brand Logo Showcase */}
            {upDownLogoUrl ? (
              <div className="flex justify-center mb-6">
                <div className="px-6 py-4 bg-white rounded-3xl shadow-2xl border border-white/20 flex items-center justify-center backdrop-blur-md">
                  <img
                    src={upDownLogoUrl}
                    alt={companyInfo?.company_name || 'Agency Logo'}
                    className="h-20 sm:h-24 md:h-28 max-w-[340px] sm:max-w-[440px] object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-navy-950 shadow-xl mb-5">
                <AssignmentTurnedInIcon className="text-accent-500 text-3xl" />
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight mb-3">
              Application Portal
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto font-medium">
              Check real-time processing updates, verified milestones, and financial records.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. SEARCH CARD & RESULTS CONTAINER
      ═══════════════════════════════════════════ */}
      <div className="container-narrow -mt-10 relative z-20">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Floating Search Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-300/40 border border-slate-200/80"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <SearchIcon className="text-accent-500" fontSize="small" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Search Application Record</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 ml-1">Application ID</label>
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
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter registered email"
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all font-semibold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter registered phone"
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all font-semibold text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
                  <span className="text-base">⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-2xl transition-all shadow-lg shadow-navy-950/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group text-sm tracking-wider uppercase"
              >
                {loading ? 'Searching Records...' : 'Check Status Now'}
                {!loading && <ArrowForwardIcon fontSize="small" className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </motion.div>

          {/* ═══════════════════════════════════════════
              3. REFINED ELEGANT PROFILE PROFILE VIEW
          ═══════════════════════════════════════════ */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden"
              >
                {/* A. Top Brand Header Strip (Centered Up & Down Logo) */}
                <div className="bg-white px-6 py-6 border-b border-slate-200/80 flex items-center justify-center text-center shadow-2xs">
                  {upDownLogoUrl ? (
                    <img
                      src={upDownLogoUrl}
                      alt={companyInfo?.company_name || 'Agency Logo'}
                      className="h-20 sm:h-24 md:h-28 max-w-[340px] sm:max-w-[440px] object-contain drop-shadow-xs mx-auto"
                    />
                  ) : (
                    <h2 className="text-xl font-black text-slate-900 tracking-wider uppercase font-serif">
                      {companyInfo?.company_name || 'Official Visa Agency'}
                    </h2>
                  )}
                </div>

                {/* B. Executive Applicant Banner */}
                <div className="bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 p-6 sm:p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Title Row: Avatar + Name + Live Status Pill Beside Name */}
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 sm:gap-5">
                      {result.photo ? (
                        <img
                          src={result.photo}
                          alt={result.full_name}
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl shrink-0"
                        />
                      ) : (
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-3xl border border-white/20 shrink-0 shadow-xl">
                          {result.full_name?.charAt(0) || 'A'}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{result.full_name}</h2>
                          <VerifiedIcon fontSize="small" className="text-accent-400" />
                          
                          {/* Live Status Tag Right Beside Name */}
                          <span
                            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-sm"
                            style={{
                              backgroundColor: result.status_color ? `${result.status_color}25` : 'rgba(255,255,255,0.15)',
                              color: result.status_color || '#FFFFFF',
                              borderColor: result.status_color ? `${result.status_color}60` : 'rgba(255,255,255,0.3)'
                            }}
                          >
                            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: result.status_color || '#3B82F6' }} />
                            {result.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold">
                          <FactCheckIcon style={{ fontSize: 16 }} className="text-accent-400" />
                          <span>App ID: {result.application_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4-Pillar Overview Grid */}
                  <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 text-slate-200 border-t border-white/10 mt-6">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <FlightTakeoffIcon style={{ fontSize: 13 }} className="text-accent-400" />
                        <span>Destination</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{result.country || '—'}</p>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <ContactPageIcon style={{ fontSize: 13 }} className="text-accent-400" />
                        <span>Visa Category</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{result.visa || '—'}</p>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <WorkIcon style={{ fontSize: 13 }} className="text-accent-400" />
                        <span>Primary Job</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{result.job || '—'}</p>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <WorkIcon style={{ fontSize: 13 }} className="text-accent-400" />
                        <span>Secondary Job</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{result.secondary_job || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* C. Segmented Section Navigation Tabs */}
                <div className="border-b border-slate-200 bg-slate-50/80 px-6 pt-3 flex items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                      activeTab === 'overview'
                        ? 'border-navy-950 text-navy-950 bg-white rounded-t-xl shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BadgeIcon fontSize="small" />
                    <span>Credentials & Info</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                      activeTab === 'timeline'
                        ? 'border-navy-950 text-navy-950 bg-white rounded-t-xl shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <TimelineIcon fontSize="small" />
                    <span>Processing Timeline</span>
                    {result.status_history?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                        {result.status_history.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('finance')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                      activeTab === 'finance'
                        ? 'border-navy-950 text-navy-950 bg-white rounded-t-xl shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <AccountBalanceWalletIcon fontSize="small" />
                    <span>Financial History</span>
                    {(result.payments?.length > 0 || result.refunds?.length > 0) && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                        {(result.payments?.length || 0) + (result.refunds?.length || 0)}
                      </span>
                    )}
                  </button>
                </div>

                {/* D. Dynamic Tab Contents */}
                <div className="p-6 sm:p-8">
                  
                  {/* TAB 1: OVERVIEW & CREDENTIALS */}
                  {activeTab === 'overview' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <PersonIcon fontSize="small" className="text-blue-600" />
                          Personal Credentials & Information
                        </h3>
                        <span className="text-xs text-slate-400 font-bold uppercase font-mono">
                          Verified Document
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Passport Number</span>
                          <span className="font-mono font-black text-slate-900 text-base">{result.passport_number || '—'}</span>
                        </div>

                        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                          <span className="font-bold text-slate-900 text-base">{result.date_of_birth || '—'}</span>
                        </div>

                        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">NID / National ID</span>
                          <span className="font-mono font-black text-slate-900 text-base">{result.nid_number || '—'}</span>
                        </div>

                        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Phone Number</span>
                          <span className="font-bold text-slate-900 text-base">{result.phone || '—'}</span>
                        </div>

                        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Email Address</span>
                          <span className="font-bold text-slate-900 text-base truncate block">{result.email || '—'}</span>
                        </div>

                        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Place of Birth</span>
                          <span className="font-bold text-slate-900 text-base">{result.place_of_birth || '—'}</span>
                        </div>

                        {result.father_name && (
                          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Father's Name</span>
                            <span className="font-bold text-slate-900 text-base">{result.father_name}</span>
                          </div>
                        )}

                        {result.nationality && (
                          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nationality</span>
                            <span className="font-bold text-slate-900 text-base">{result.nationality}</span>
                          </div>
                        )}

                        {result.current_country && (
                          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Country of Residence</span>
                            <span className="font-bold text-slate-900 text-base">{result.current_country}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: PROCESSING TIMELINE */}
                  {activeTab === 'timeline' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircleIcon fontSize="small" className="text-blue-600" />
                          Processing Milestones
                        </h3>
                        <span className="text-xs text-slate-400 font-bold uppercase font-mono">
                          Live History
                        </span>
                      </div>

                      {result.status_history?.length > 0 ? (
                        <div className="relative pl-4 space-y-6 pt-2 max-w-2xl">
                          <div className="absolute left-[25px] top-4 bottom-4 w-0.5 bg-slate-200" />

                          {result.status_history.map((entry, i) => (
                            <div key={i} className="relative flex items-start gap-4 z-10">
                              <div
                                className="w-5 h-5 rounded-full ring-4 ring-white shrink-0 mt-0.5 shadow-xs"
                                style={{ backgroundColor: entry.color || '#2563EB' }}
                              />
                              <div className="flex-1 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                                <p className="text-base font-black text-slate-900 leading-snug">{entry.status}</p>
                                <p className="text-xs font-semibold text-slate-400">
                                  {new Date(entry.changed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-slate-400 font-medium text-sm">
                          No status history recorded yet.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 3: FINANCIAL HISTORY */}
                  {activeTab === 'finance' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {(() => {
                        const hasRefund = result.refunds && result.refunds.length > 0;
                        return (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <AccountBalanceWalletIcon fontSize="small" className={hasRefund ? 'text-rose-600' : 'text-emerald-600'} />
                                Verified Financial History
                              </h3>
                              {hasRefund && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-wider">
                                  Refund Issued
                                </span>
                              )}
                            </div>

                            {/* Active Refund Statements */}
                            {hasRefund && (
                              <div className="space-y-3 p-5 bg-rose-50/70 rounded-2xl border border-rose-200">
                                <h4 className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-2">
                                  <ReceiptLongIcon style={{ fontSize: 16 }} /> Active Refund Statements
                                </h4>
                                <div className="divide-y divide-rose-200/80 bg-white rounded-xl border border-rose-200/70 overflow-hidden">
                                  {result.refunds.map((refund, i) => (
                                    <div key={refund.id || i} className="p-4 sm:p-5 flex items-center justify-between hover:bg-rose-50/40 transition-colors">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-rose-600 font-mono">{refund.receipt_number || `REF-${refund.id?.slice(0, 6)}`}</span>
                                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 capitalize">Refund ({refund.refund_status})</span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-semibold">
                                          Method: {refund.refund_method} • Date: {new Date(refund.created_at).toLocaleDateString('en-GB')}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Refund Amount</span>
                                        <span className="font-black text-rose-700 text-lg sm:text-xl">
                                          {formatPaymentAmount(refund.refund_amount, refund.currency || 'BDT')}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Payment Logs */}
                            {result.payments?.length > 0 ? (
                              <div className={`space-y-3 ${hasRefund ? 'opacity-60' : ''}`}>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                  <ReceiptLongIcon style={{ fontSize: 16 }} /> {hasRefund ? 'Previous Payment Logs (Historical Record)' : 'Official Payment Logs'}
                                </h4>
                                <div className="divide-y divide-slate-100 bg-slate-50/60 rounded-2xl border border-slate-200 overflow-hidden">
                                  {result.payments.map((payment, i) => (
                                    <div key={payment.id || i} className="p-4 sm:p-5 hover:bg-slate-100/50 transition-colors space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase font-mono">{payment.receipt_number || `REC-${payment.id?.slice(0, 6)}`}</span>
                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${hasRefund ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-800'}`}>
                                              {payment.installment_type} Installment
                                            </span>
                                          </div>
                                          <p className="text-xs text-slate-500 font-medium">
                                            Method: {payment.payment_method} • Date: {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A'}
                                          </p>
                                        </div>
                                        <div className={`text-right ${hasRefund ? 'text-slate-400' : 'text-slate-900'}`}>
                                          <div className="font-black text-lg sm:text-xl">
                                            {formatPaymentAmount(payment.amount, payment.currency)}
                                          </div>
                                          {payment.currency && payment.currency !== 'BDT' && (
                                            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                              {payment.currency}
                                            </div>
                                          )}
                                          {payment.euro_amount && payment.currency !== 'EUR' && (
                                            <div className="text-[10px] font-bold text-blue-600">
                                              (≈ €{Number(payment.euro_amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} EUR)
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {(payment.important_note || payment.note) && (
                                        <div className="pt-2 border-t border-slate-200/50 bg-amber-50/70 border border-amber-200/60 p-3.5 rounded-xl text-xs text-amber-900 space-y-1">
                                          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
                                            <span>📌</span> Important Note:
                                          </span>
                                          <p className="leading-relaxed whitespace-pre-line text-[11px] font-semibold text-amber-950">
                                            {payment.important_note || payment.note}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              !hasRefund && (
                                <div className="text-center py-10 text-slate-400 font-medium text-sm">
                                  No payment logs recorded yet.
                                </div>
                              )
                            )}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

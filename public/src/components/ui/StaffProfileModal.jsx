import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';
import logoImg from '../../assets/logo.png';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `https://res.cloudinary.com/prfvuhln/${url}`;
};

export default function StaffProfileModal({ isOpen, onClose, staffName }) {
  const { data: companyInfo } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then((r) => r.data.results?.[0] ?? r.data?.[0]),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmployeeId('');
      setPassword('');
      setError('');
      setProfile(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post(`/public/staff-profiles/access/`, { employee_id: employeeId, password });
      
      setProfile({
        photo: data.profile?.photo,
        name: data.profile?.full_name || data.profile?.name || staffName || '',
        designation: data.profile?.designation,
        public_bio: data.profile?.public_bio,
        languages: data.profile?.languages,
        public_email: data.profile?.email,
        public_phone: data.profile?.phone,
        public_whatsapp: data.profile?.whatsapp,
        office_name: data.profile?.office,
        father_name: data.profile?.father_name || '',
        passport_number: data.profile?.passport_number || '',
        date_of_birth: data.profile?.date_of_birth || '',
        joining_date: data.profile?.joining_date || '',
        gender: data.profile?.gender || '',
        nationality: data.profile?.nationality || '',
        signature: data.profile?.signature || null,
        sub_staffs: data.sub_staffs || [],
        current_month_slot: data.slot_summary ? {
          used_slot: data.slot_summary.current_month_used_slot || 0,
          total_slot: data.slot_summary.current_month_total_slot || 0,
        } : null,
        lifetime_stats: data.slot_summary ? {
          total_used_slots: data.slot_summary.lifetime_used_slot || 0,
          approved_visas: data.slot_summary.approved_visas || 0,
          rejected_visas: data.slot_summary.rejected_visas || 0,
          processing_visas: data.slot_summary.processing_visas || 0,
        } : null
      });
    } catch (err) {
      setError(err?.response?.data?.detail || 'Incorrect password or Employee ID.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const companyLogo = getImageUrl(companyInfo?.company_logo) || logoImg;
  const companySig = getImageUrl(companyInfo?.company_signature);
  const staffSig = getImageUrl(profile?.signature);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden border border-navy-100"
        >
          {/* Global Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-navy-950/40 hover:bg-navy-950/80 text-white rounded-full flex items-center justify-center transition-all z-30 backdrop-blur-md border border-white/20 shadow-lg active:scale-95"
            title="Close Profile"
          >
            <CloseIcon fontSize="small" />
          </button>

          {!profile ? (
            /* PASSWORD PROMPT SCREEN */
            <div className="p-8 sm:p-14 text-center overflow-y-auto my-auto flex flex-col items-center justify-center">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-navy-50 text-navy-900 rounded-3xl flex items-center justify-center mb-6 shadow-md border border-navy-100 relative"
              >
                <LockIcon style={{ fontSize: 36 }} className="text-navy-900" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-white animate-pulse" />
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-navy-900 font-heading tracking-tight mb-2">
                Personnel Profile Portal
              </h2>
              <p className="text-navy-500 text-sm mb-8 max-w-sm font-medium leading-relaxed">
                Enter credentials to unlock the verified official profile for <span className="text-navy-900 font-bold">{staffName}</span>.
              </p>

              <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <div className="space-y-3">
                  <div className="text-left">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-500 mb-1.5 ml-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. EMP-1001"
                      className="w-full px-5 py-3.5 bg-navy-50/60 border border-navy-200 rounded-2xl text-navy-900 font-semibold text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="text-left">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-500 mb-1.5 ml-1">
                      Security Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-5 py-3.5 bg-navy-50/60 border border-navy-200 rounded-2xl text-navy-900 font-semibold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500 transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-accent-50 border border-accent-200 text-accent-700 rounded-xl text-xs font-bold text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-2xl shadow-xl shadow-navy-900/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-sm tracking-wide"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <VerifiedIcon fontSize="small" className="text-gold-400" />
                      <span>Unlock Verified Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* UNLOCKED PROFILE VIEW - EXECUTIVE CREDENTIAL PORTAL */
            <div className="overflow-y-auto flex-1 bg-navy-50/40 p-4 sm:p-8 space-y-6">
              
              {/* MAIN ID CREDENTIAL CARD */}
              <div className="bg-white rounded-[2rem] shadow-xl border border-navy-100 overflow-hidden">
                
                {/* Header Branding Banner */}
                <div className="relative bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-6 sm:p-8 border-b-4 border-accent-600 overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-gold-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Logo Frame on White Surface for Pure Clarity */}
                      <div className="p-2.5 bg-white rounded-2xl border border-white/20 shadow-md shrink-0 flex items-center justify-center">
                        <img 
                          src={companyLogo} 
                          alt={companyInfo?.company_name || 'Agency Logo'} 
                          className="h-12 max-w-[160px] object-contain" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                            Verified Official
                          </span>
                        </div>
                        <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-heading mt-1">
                          {companyInfo?.company_name || 'Al Raiyan Group'}
                        </h1>
                        <p className="text-xs text-navy-200 font-medium">
                          Trust • Process • Success
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-navy-100 shrink-0">
                      <VerifiedIcon className="text-gold-400" fontSize="small" />
                      <span className="font-bold tracking-wider uppercase text-[10px]">ID: {employeeId}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Hero Body */}
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start border-b border-navy-100">
                  
                  {/* Left: Avatar Photo */}
                  <div className="flex flex-col items-center shrink-0 space-y-3">
                    <div className="relative group">
                      <div className="w-36 h-44 sm:w-40 sm:h-48 rounded-2xl p-1 bg-gradient-to-b from-navy-700 via-navy-900 to-navy-950 shadow-xl overflow-hidden">
                        <div className="w-full h-full rounded-[0.85rem] overflow-hidden bg-navy-50 relative">
                          {profile.photo ? (
                            <img
                              src={getImageUrl(profile.photo)}
                              alt={profile.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-navy-900 text-white font-black text-5xl font-heading">
                              {profile.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border-2 border-white">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        <span>ACTIVE</span>
                      </div>
                    </div>

                    <div className="bg-navy-900 text-white px-4 py-1.5 rounded-xl font-mono text-xs font-bold tracking-widest shadow-sm">
                      #{employeeId}
                    </div>
                  </div>

                  {/* Right: Info & Contact Strip */}
                  <div className="flex-1 text-center sm:text-left space-y-4 w-full">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-navy-50 text-navy-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-navy-200">
                        <BadgeIcon style={{ fontSize: 14 }} className="text-navy-600" />
                        <span>{profile.designation || 'Staff Personnel'}</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-navy-900 font-heading tracking-tight leading-tight">
                        {profile.name}
                      </h2>
                      {profile.office_name && (
                        <p className="text-xs sm:text-sm text-navy-600 font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                          <LocationOnIcon fontSize="small" className="text-accent-600" />
                          <span>{profile.office_name} Branch</span>
                        </p>
                      )}
                    </div>

                    {profile.public_bio && (
                      <p className="text-xs sm:text-sm text-navy-700 bg-navy-50/70 p-3.5 rounded-xl border border-navy-100 italic leading-relaxed">
                        "{profile.public_bio}"
                      </p>
                    )}

                    {/* Quick Interactive Contacts */}
                    <div className="pt-2 flex flex-wrap gap-2.5 justify-center sm:justify-start">
                      {profile.public_whatsapp && (
                        <a
                          href={`https://wa.me/${profile.public_whatsapp?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
                        >
                          <WhatsAppIcon style={{ fontSize: 16 }} />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {profile.public_phone && (
                        <a
                          href={`tel:${profile.public_phone}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold shadow-md shadow-navy-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                          <PhoneIcon style={{ fontSize: 16 }} />
                          <span>{profile.public_phone}</span>
                        </a>
                      )}

                      {profile.public_email && (
                        <a
                          href={`mailto:${profile.public_email}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-xs font-bold shadow-md shadow-accent-600/20 transition-all hover:scale-105 active:scale-95"
                        >
                          <EmailIcon style={{ fontSize: 16 }} />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* PERSONAL INFORMATION GRID */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-navy-500 mb-3 flex items-center gap-2">
                      <AssignmentIndIcon style={{ fontSize: 16 }} className="text-accent-600" />
                      <span>Verified Personal Information</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-navy-50/60 p-3.5 rounded-2xl border border-navy-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-navy-500">Father's Name</span>
                        <span className="font-bold text-navy-900 text-xs sm:text-sm mt-0.5 block truncate">{profile.father_name || 'N/A'}</span>
                      </div>

                      <div className="bg-navy-50/60 p-3.5 rounded-2xl border border-navy-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-navy-500">Passport No</span>
                        <span className="font-mono font-bold text-navy-900 text-xs sm:text-sm mt-0.5 block tracking-wide">{profile.passport_number || 'N/A'}</span>
                      </div>

                      <div className="bg-navy-50/60 p-3.5 rounded-2xl border border-navy-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-navy-500">Date of Birth</span>
                        <span className="font-bold text-navy-900 text-xs sm:text-sm mt-0.5 block">{profile.date_of_birth || 'N/A'}</span>
                      </div>

                      <div className="bg-navy-50/60 p-3.5 rounded-2xl border border-navy-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-navy-500">Joining Date</span>
                        <span className="font-bold text-navy-900 text-xs sm:text-sm mt-0.5 block">{profile.joining_date || 'N/A'}</span>
                      </div>

                      <div className="bg-navy-50/60 p-3.5 rounded-2xl border border-navy-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-navy-500">Gender</span>
                        <span className="font-bold text-navy-900 text-xs sm:text-sm capitalize mt-0.5 block">{profile.gender || 'N/A'}</span>
                      </div>

                      <div className="bg-navy-50/60 p-3.5 rounded-2xl border border-navy-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-navy-500">Nationality</span>
                        <span className="font-bold text-navy-900 text-xs sm:text-sm mt-0.5 block">{profile.nationality || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* SLOTS & PERFORMANCE STATS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Monthly & Lifetime Slot Allocations */}
                    <div className="bg-navy-900 text-white p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                          <CalendarMonthIcon style={{ fontSize: 16 }} />
                          Current Month Slot
                        </span>
                        <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-0.5 rounded-md border border-white/15">
                          {profile.current_month_slot?.used_slot || 0} / {profile.current_month_slot?.total_slot || 0}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="w-full h-2.5 bg-navy-950 rounded-full overflow-hidden p-0.5 border border-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-gold-500 to-amber-400 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                profile.current_month_slot?.total_slot
                                  ? Math.min(
                                      100,
                                      Math.round(
                                        (profile.current_month_slot.used_slot /
                                          profile.current_month_slot.total_slot) *
                                          100
                                      )
                                    )
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-navy-200 mt-1.5 font-medium">
                          <span>
                            {profile.current_month_slot?.total_slot
                              ? `${Math.round(
                                  (profile.current_month_slot.used_slot /
                                    profile.current_month_slot.total_slot) *
                                    100
                                )}% Utilized`
                              : 'No Slots Allocated'}
                          </span>
                          <span>Lifetime: {profile.lifetime_stats?.total_used_slots || 0} Slots</span>
                        </div>
                      </div>

                      {profile.languages?.length > 0 && (
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-navy-300 font-medium">Languages</span>
                          <span className="font-bold text-white">{profile.languages.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Visa Case Statistics */}
                    <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm space-y-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-navy-500 flex items-center gap-1.5">
                        <BusinessIcon style={{ fontSize: 16 }} className="text-navy-700" />
                        Visa Track Record
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-100">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircleIcon style={{ fontSize: 16 }} className="text-emerald-600" />
                            Approved Visas
                          </span>
                          <span className="font-black text-emerald-900 text-sm">{profile.lifetime_stats?.approved_visas || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-amber-50/80 rounded-xl border border-amber-100">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <HourglassTopIcon style={{ fontSize: 16 }} className="text-gold-600" />
                            Processing Cases
                          </span>
                          <span className="font-black text-amber-900 text-sm">{profile.lifetime_stats?.processing_visas || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-rose-50/80 rounded-xl border border-rose-100">
                          <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                            <CancelIcon style={{ fontSize: 16 }} className="text-accent-600" />
                            Rejected Cases
                          </span>
                          <span className="font-black text-rose-900 text-sm">{profile.lifetime_stats?.rejected_visas || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUB-STAFF REPRESENTATIVES (IF ANY) */}
                  {profile.sub_staffs?.length > 0 && (
                    <div className="bg-navy-50/60 p-4 rounded-2xl border border-navy-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-navy-500 mb-3">
                        Assigned Support Team
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {profile.sub_staffs.map((sub) => (
                          <div key={sub.id} className="p-3 bg-white rounded-xl border border-navy-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-navy-900">{sub.name}</span>
                            {sub.phone && (
                              <a href={`tel:${sub.phone}`} className="text-xs font-semibold text-navy-600 hover:text-navy-900 hover:underline">
                                {sub.phone}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* AUTHORIZED SIGNATURE & COMPANY SEAL FOOTER (LIGHT CRISP DOCUMENT SURFACE) */}
                <div className="bg-navy-50/80 px-6 sm:px-8 py-6 border-t border-navy-100 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Official Statement */}
                    <div className="text-center md:text-left max-w-sm space-y-1">
                      <div className="flex items-center justify-center md:justify-start gap-2 text-navy-900">
                        <VerifiedIcon fontSize="small" className="text-gold-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-700">Official Verification Seal</span>
                      </div>
                      <p className="text-xs text-navy-600 leading-relaxed font-medium">
                        This credential certifies that <strong className="text-navy-900 font-bold">{profile.name}</strong> is an officially authorized representative of <strong className="text-navy-900 font-bold">{companyInfo?.company_name || 'our agency'}</strong>.
                      </p>
                    </div>

                    {/* Signatures Area */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                      {/* Staff Member Signature */}
                      {staffSig && (
                        <div className="flex flex-col items-center bg-white p-3 rounded-2xl border border-navy-200 shadow-sm min-w-[130px]">
                          <img
                            src={staffSig}
                            alt="Staff Digital Signature"
                            className="h-12 max-w-[140px] object-contain"
                          />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-navy-500 mt-1 border-t border-navy-100 pt-1 w-full text-center">
                            Personnel Signature
                          </span>
                        </div>
                      )}

                      {/* Company Signature / Official Seal */}
                      {companySig ? (
                        <div className="flex flex-col items-center bg-white p-3 rounded-2xl border border-navy-200 shadow-sm min-w-[140px]">
                          <img
                            src={companySig}
                            alt="Company Official Signature"
                            className="h-12 max-w-[150px] object-contain"
                          />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gold-600 font-bold mt-1 border-t border-navy-100 pt-1 w-full text-center">
                            Official Company Seal
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center bg-white p-3.5 rounded-2xl border border-navy-200 shadow-sm min-w-[140px] text-center">
                          <div className="w-10 h-10 rounded-full bg-navy-50 text-gold-500 flex items-center justify-center font-black text-lg border border-navy-200">
                            ✓
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-navy-700 mt-1 border-t border-navy-100 pt-1 w-full text-center">
                            Digitally Authenticated
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

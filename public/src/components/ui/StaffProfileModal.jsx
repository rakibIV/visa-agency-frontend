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
import LanguageIcon from '@mui/icons-material/Language';
import logoImg from '../../assets/logo.png';

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
        name: data.profile?.full_name || '',
        designation: data.profile?.designation,
        public_bio: data.profile?.public_bio,
        languages: data.profile?.languages,
        public_email: data.profile?.email,
        public_phone: data.profile?.phone,
        public_whatsapp: data.profile?.whatsapp,
        office_name: data.profile?.office,
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
      setError(err?.response?.data?.detail || 'Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl z-10 max-h-[90vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-20 backdrop-blur-md"
            style={{ mixBlendMode: 'difference' }}
          >
            <CloseIcon fontSize="small" />
          </button>

          {!profile ? (
            /* PASSWORD PROMPT */
            <div className="p-8 sm:p-12 text-center overflow-y-auto">
              <div className="w-20 h-20 bg-navy-50 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <LockIcon fontSize="large" />
              </div>
              <h2 className="text-3xl font-black text-navy-900 font-heading mb-2">Protected Profile</h2>
              <p className="text-navy-500 mb-8 max-w-sm mx-auto">
                Please enter the public profile password to view detailed information for {staffName}.
              </p>

              <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
                <div className="mb-4">
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Employee ID"
                    className="w-full px-5 py-4 mb-4 bg-navy-50 border border-navy-100 rounded-xl text-center text-navy-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full px-5 py-4 bg-navy-50 border border-navy-100 rounded-xl text-center text-navy-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-bold mb-4">{error}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl shadow-lg shadow-navy-900/20 hover:bg-navy-800 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Unlock Profile'}
                </button>
              </form>
            </div>
          ) : (
            /* PROFILE VIEW - ID CARD VIBE */
            <div className="overflow-y-auto flex-1 bg-[#f4f7fb] p-6 sm:p-10 relative">
              
              {/* ID CARD CONTAINER */}
              <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-navy-100 overflow-hidden flex flex-col relative">
                
                {/* ID Card Top Graphic / Branding */}
                <div className="relative bg-white pt-6 pb-4 px-8 border-b-[6px] border-navy-900 flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute top-0 left-0 w-48 h-48 bg-navy-900/5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2" />
                  {companyInfo?.company_logo ? (
                    <img src={companyInfo.company_logo.startsWith('http') ? companyInfo.company_logo : `https://res.cloudinary.com/prfvuhln/${companyInfo.company_logo}`} alt={companyInfo.company_name} className="h-14 sm:h-16 object-contain z-10" />
                  ) : (
                    <img src={logoImg} alt="Default Logo" className="h-14 sm:h-16 object-contain z-10" />
                  )}
                  <div className="text-[10px] sm:text-xs font-bold text-navy-600 uppercase tracking-[0.2em] mt-2 z-10">
                    {companyInfo?.company_name || 'Global Visa Services'}
                  </div>
                  <div className="text-[9px] font-bold text-accent-600 uppercase tracking-widest mt-1 z-10">
                    Trust • Process • Success
                  </div>
                </div>

                {/* ID Card Body */}
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSJyZ2JhKDAsIDAsIDAsIDAuMDMpIi8+Cjwvc3ZnPg==')]">
                  
                  {/* Left Column: Photo & ID */}
                  <div className="flex flex-col items-center w-full sm:w-56 shrink-0 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-48 sm:w-full aspect-[3/4] rounded-2xl border-[6px] border-navy-900 overflow-hidden shadow-lg relative bg-navy-50"
                    >
                      {profile.photo ? (
                        <motion.img 
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                          src={profile.photo.startsWith('http') ? profile.photo : `https://res.cloudinary.com/prfvuhln/${profile.photo}`} 
                          alt={profile.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-navy-300">
                          {profile.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                    
                    {/* Fake Barcode or Employee ID area */}
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="w-48 sm:w-full bg-navy-900 text-white rounded-xl p-3 text-center flex flex-col items-center relative overflow-hidden shadow-md group cursor-default"
                    >
                      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjIwIj4KPHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMjAiIGZpbGw9IiNmZmYiLz4KPC9zdmc+')] background-repeat-x group-hover:opacity-20 transition-opacity" />
                      <div className="relative z-10 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center shrink-0 group-hover:border-accent-400 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:text-accent-400 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                        </div>
                        <div className="text-left">
                          <div className="text-[9px] text-navy-300 uppercase tracking-widest leading-none mb-1 group-hover:text-accent-200 transition-colors">ID NO.</div>
                          <div className="font-mono font-bold tracking-wider text-sm leading-none">{employeeId}</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="flex-1 flex flex-col pt-2 sm:pt-1 text-center sm:text-left items-center sm:items-start">
                    <div className="inline-block bg-navy-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full sm:rounded-l-none sm:rounded-r-full sm:-ml-8 mb-4 sm:mb-6 shadow-md relative w-max">
                      <div className="hidden sm:block absolute -left-2 top-0 bottom-0 w-2 bg-navy-800" />
                      Employee Identification
                    </div>
                    
                    <h2 className="text-2xl sm:text-[28px] font-black text-navy-900 font-heading leading-tight uppercase mb-3">
                      {profile.name}
                    </h2>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 mb-6 bg-navy-50/80 hover:bg-navy-50 p-3 rounded-xl border border-navy-100 transition-colors w-full justify-center sm:justify-start"
                    >
                      <div className="w-8 h-8 rounded-lg bg-navy-900 text-white flex items-center justify-center shrink-0">
                        <LockIcon fontSize="small" style={{ fontSize: 16 }} />
                      </div>
                      <div>
                        <div className="text-[10px] text-navy-500 uppercase tracking-widest leading-none mb-1">Designation</div>
                        <div className="text-sm font-bold text-navy-900 uppercase tracking-wide leading-none">
                          {profile.designation}
                        </div>
                      </div>
                    </motion.div>

                    {/* Contact List */}
                    <div className="space-y-3 sm:space-y-4 pt-4 border-t border-navy-100 relative w-full flex flex-col items-center sm:items-start">
                      {/* Decorative line */}
                      <div className="hidden sm:block absolute top-0 left-0 w-12 h-1 bg-accent-500 -mt-[1px]" />
                      
                      {profile.public_whatsapp && (
                        <motion.a 
                          href={`https://wa.me/${profile.public_whatsapp?.replace?.(/\D/g, '') || ''}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-4 group w-max sm:w-full"
                        >
                          <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center shrink-0 shadow-md group-hover:bg-green-500 transition-colors">
                            <WhatsAppIcon fontSize="small" />
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] text-navy-500 font-bold uppercase tracking-wider leading-none mb-1 group-hover:text-green-600 transition-colors">WhatsApp</div>
                            <div className="text-sm font-bold text-navy-900 leading-none group-hover:text-green-700 transition-colors">{profile.public_whatsapp}</div>
                          </div>
                        </motion.a>
                      )}
                      
                      {profile.public_phone && (
                        <motion.a 
                          href={`tel:${profile.public_phone}`}
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-4 group w-max sm:w-full"
                        >
                          <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center shrink-0 shadow-md group-hover:bg-accent-600 transition-colors">
                            <PhoneIcon fontSize="small" />
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] text-navy-500 font-bold uppercase tracking-wider leading-none mb-1 group-hover:text-accent-600 transition-colors">Phone</div>
                            <div className="text-sm font-bold text-navy-900 leading-none group-hover:text-accent-700 transition-colors">{profile.public_phone}</div>
                          </div>
                        </motion.a>
                      )}

                      {profile.public_email && (
                        <motion.a 
                          href={`mailto:${profile.public_email}`}
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-4 group w-full max-w-[240px] sm:max-w-none"
                        >
                          <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center shrink-0 shadow-md group-hover:bg-accent-600 transition-colors">
                            <EmailIcon fontSize="small" />
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="text-[10px] text-navy-500 font-bold uppercase tracking-wider leading-none mb-1 group-hover:text-accent-600 transition-colors">E-mail</div>
                            <div className="text-sm font-bold text-navy-900 truncate leading-none group-hover:text-accent-700 transition-colors">{profile.public_email}</div>
                          </div>
                        </motion.a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Section */}
                <div className="px-6 sm:px-8 pb-8 bg-white relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Performance Metrics */}
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="group"
                    >
                      <div className="bg-navy-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-t-xl flex items-center gap-2 group-hover:bg-accent-600 transition-colors duration-300">
                        <svg className="w-3.5 h-3.5 text-accent-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Performance Details
                      </div>
                      <div className="bg-navy-50/50 group-hover:bg-navy-50 border border-navy-100 border-t-0 rounded-b-xl p-4 text-xs space-y-2 transition-colors duration-300">
                        <div className="flex justify-between items-center py-1 border-b border-navy-100 border-dashed hover:bg-white hover:px-2 -mx-2 px-2 rounded transition-all">
                          <span className="text-navy-500 font-bold uppercase tracking-wider text-[10px]">Branch</span>
                          <span className="font-bold text-navy-900">{profile.office_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-navy-100 border-dashed hover:bg-white hover:px-2 -mx-2 px-2 rounded transition-all">
                          <span className="text-navy-500 font-bold uppercase tracking-wider text-[10px]">Month Slots</span>
                          <span className="font-bold text-navy-900">{profile.current_month_slot?.used_slot || 0} / {profile.current_month_slot?.total_slot || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-navy-100 border-dashed hover:bg-white hover:px-2 -mx-2 px-2 rounded transition-all">
                          <span className="text-navy-500 font-bold uppercase tracking-wider text-[10px]">Languages</span>
                          <span className="font-bold text-navy-900 truncate max-w-[120px] text-right" title={profile.languages?.join(', ')}>{profile.languages?.join(', ') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 hover:bg-white hover:px-2 -mx-2 px-2 rounded transition-all">
                          <span className="text-navy-500 font-bold uppercase tracking-wider text-[10px]">Lifetime Slots</span>
                          <span className="font-bold text-navy-900">{profile.lifetime_stats?.total_used_slots || 0}</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Visa Stats */}
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="group"
                    >
                      <div className="bg-navy-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-t-xl flex items-center gap-2 group-hover:bg-accent-600 transition-colors duration-300">
                        <svg className="w-3.5 h-3.5 text-accent-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Visa Statistics
                      </div>
                      <div className="bg-navy-50/50 group-hover:bg-navy-50 border border-navy-100 border-t-0 rounded-b-xl p-4 text-xs space-y-2 transition-colors duration-300">
                        <div className="flex justify-between items-center py-1 border-b border-navy-100 border-dashed hover:bg-white hover:px-2 -mx-2 px-2 rounded transition-all">
                          <span className="text-navy-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 block"></span> Approved
                          </span>
                          <span className="font-bold text-navy-900">{profile.lifetime_stats?.approved_visas || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-navy-100 border-dashed hover:bg-white hover:px-2 -mx-2 px-2 rounded transition-all">
                          <span className="text-navy-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block"></span> Processing
                          </span>
                          <span className="font-bold text-navy-900">{profile.lifetime_stats?.processing_visas || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 hover:bg-white hover:px-2 -mx-2 px-2 rounded transition-all">
                          <span className="text-navy-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 block"></span> Rejected
                          </span>
                          <span className="font-bold text-navy-900">{profile.lifetime_stats?.rejected_visas || 0}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Footer Signature Area */}
                <div className="bg-navy-50/50 px-8 py-5 border-t border-navy-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
                  {/* Decorative corner swoosh */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent-600 rounded-tl-full opacity-10" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-navy-900 rounded-tl-full opacity-10" />
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-4 border-navy-100 shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-accent-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-accent-600/30">
                        ✓
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] text-navy-400 font-bold uppercase tracking-widest leading-none mb-1">Signature Authority</div>
                      <div className="font-[cursive] text-2xl text-navy-900 -mt-1 opacity-80 select-none">Auth</div>
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-right text-[9px] sm:text-[10px] text-navy-500 leading-relaxed max-w-[240px]">
                    This certifies that the holder is an<br/>
                    Officially Authorized Representative of<br/>
                    <strong className="text-navy-900 font-black tracking-wide text-xs uppercase">{companyInfo?.company_name || 'OUR COMPANY'}</strong>
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

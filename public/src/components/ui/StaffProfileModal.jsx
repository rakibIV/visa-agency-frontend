import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';

export default function StaffProfileModal({ isOpen, onClose, staffSlug, staffName }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
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
      const { data } = await api.post(`/public/staff-profiles/${staffSlug}/access/`, { password });
      setProfile(data);
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
          className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-navy-50 text-navy-500 rounded-full flex items-center justify-center hover:bg-navy-100 hover:text-navy-900 transition-colors z-20"
          >
            <CloseIcon fontSize="small" />
          </button>

          {!profile ? (
            /* PASSWORD PROMPT */
            <div className="p-10 sm:p-12 text-center">
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
            /* PROFILE VIEW */
            <div>
              {/* Header */}
              <div className="bg-navy-900 text-white p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                <div className="relative z-10 w-32 h-32 rounded-[1.5rem] bg-navy-800 border-4 border-white/10 overflow-hidden shrink-0 shadow-xl">
                  {profile.photo ? (
                    <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-navy-400">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="relative z-10 text-center sm:text-left flex-1">
                  <h2 className="text-3xl font-black mb-1 font-heading">{profile.name}</h2>
                  <p className="text-accent-400 font-bold mb-3">{profile.designation}</p>
                  
                  {/* Bio */}
                  {profile.public_bio && (
                    <p className="text-navy-200 text-sm leading-relaxed mb-4 line-clamp-3">
                      {profile.public_bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    {profile.languages?.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white tracking-wide">
                        {lang.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 grid sm:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-2 border-b border-navy-50 pb-2">Contact Details</h3>
                  
                  {profile.public_email && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-500 flex items-center justify-center shrink-0">
                        <EmailIcon fontSize="small" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Email</div>
                        <a href={`mailto:${profile.public_email}`} className="text-sm font-semibold text-navy-900 hover:text-accent-600 transition-colors">{profile.public_email}</a>
                      </div>
                    </div>
                  )}

                  {profile.public_phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-500 flex items-center justify-center shrink-0">
                        <PhoneIcon fontSize="small" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Phone</div>
                        <a href={`tel:${profile.public_phone}`} className="text-sm font-semibold text-navy-900 hover:text-accent-600 transition-colors">{profile.public_phone}</a>
                      </div>
                    </div>
                  )}

                  {profile.public_whatsapp && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <WhatsAppIcon fontSize="small" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">WhatsApp</div>
                        <a href={`https://wa.me/${profile.public_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-navy-900 hover:text-accent-600 transition-colors">{profile.public_whatsapp}</a>
                      </div>
                    </div>
                  )}
                  
                  {profile.office_name && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-500 flex items-center justify-center shrink-0">
                        <LocationOnIcon fontSize="small" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Branch</div>
                        <div className="text-sm font-semibold text-navy-900">{profile.office_name}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-2 border-b border-navy-50 pb-2">Performance Metrics</h3>
                  
                  {/* Current Month */}
                  {profile.current_month_slot && (
                    <div className="bg-navy-50 rounded-xl p-4 border border-navy-100">
                      <div className="text-[10px] font-bold text-navy-500 uppercase tracking-widest mb-2">Current Month Progress</div>
                      <div className="flex justify-between items-end mb-2">
                        <div className="text-2xl font-black text-navy-900 leading-none">{profile.current_month_slot.used_slot}</div>
                        <div className="text-xs font-bold text-navy-400 uppercase tracking-wider">Target: {profile.current_month_slot.total_slot}</div>
                      </div>
                      <div className="w-full h-1.5 bg-navy-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (profile.current_month_slot.used_slot / profile.current_month_slot.total_slot) * 100)}%` }}
                          className="h-full bg-accent-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Lifetime */}
                  {profile.lifetime_stats && (
                    <div className="bg-navy-900 text-white rounded-xl p-4">
                      <div className="text-[10px] font-bold text-navy-300 uppercase tracking-widest mb-2">Lifetime Achieved</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-black leading-none">{profile.lifetime_stats.total_used_slots}</div>
                        <div className="text-xs font-bold text-accent-400 uppercase tracking-widest">Successful Visas</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

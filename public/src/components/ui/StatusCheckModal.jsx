import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchIcon from '@mui/icons-material/Search';

export default function StatusCheckModal({ isOpen, onClose }) {
  const [applicationId, setApplicationId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApplicationId('');
      setEmail('');
      setPhone('');
      setResult(null);
      setError('');
    }
  }, [isOpen]);

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
      setError(err?.response?.data?.detail || 'No matching applicant found. Please verify your details.');
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
          className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-navy-50 text-navy-500 rounded-full flex items-center justify-center hover:bg-navy-100 hover:text-navy-900 transition-colors z-20"
          >
            <CloseIcon fontSize="small" />
          </button>

          {!result ? (
            /* TRACKING FORM */
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-accent-50 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AssignmentTurnedInIcon fontSize="large" />
              </div>
              <h2 className="text-3xl font-black text-navy-900 font-heading mb-2">Track Application</h2>
              <p className="text-navy-500 mb-8 max-w-sm mx-auto">
                Enter your application details to securely check your real-time visa status.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-navy-500 uppercase tracking-widest mb-1.5 ml-2">Application ID</label>
                  <input
                    type="text"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    placeholder="e.g. ARG72Q9A"
                    className="w-full px-5 py-4 bg-navy-50 border border-navy-100 rounded-xl text-navy-900 font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all placeholder-navy-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-navy-500 uppercase tracking-widest mb-1.5 ml-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-5 py-4 bg-navy-50 border border-navy-100 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all placeholder-navy-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-navy-500 uppercase tracking-widest mb-1.5 ml-2">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full px-5 py-4 bg-navy-50 border border-navy-100 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all placeholder-navy-300"
                    required
                  />
                </div>
                
                {error && <p className="text-red-500 text-sm font-bold text-center mt-2">{error}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-navy-900 text-white font-bold rounded-xl shadow-lg shadow-navy-900/20 hover:bg-navy-800 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? 'Searching...' : <><SearchIcon fontSize="small" /> Check Status</>}
                </button>
              </form>
            </div>
          ) : (
            /* RESULT VIEW */
            <div className="p-10">
              <div className="text-center mb-8 border-b border-navy-50 pb-8">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                  result.current_status?.type === 'APPROVED' ? 'bg-green-50 text-green-600' :
                  result.current_status?.type === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-accent-50 text-accent-600'
                }`}>
                  <AssignmentTurnedInIcon sx={{ fontSize: 48 }} />
                </div>
                <h2 className="text-3xl font-black text-navy-900 font-heading">{result.current_status?.name}</h2>
                <p className="text-navy-500 mt-2 max-w-sm mx-auto">{result.current_status?.public_message}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-navy-50">
                  <span className="text-xs font-bold text-navy-400 uppercase tracking-widest">Application ID</span>
                  <span className="font-mono font-bold text-navy-900">{result.application_id}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-navy-50">
                  <span className="text-xs font-bold text-navy-400 uppercase tracking-widest">Country</span>
                  <span className="font-bold text-navy-900">{result.country_name}</span>
                </div>
                {result.processing_time && (
                  <div className="flex justify-between items-center py-3 border-b border-navy-50">
                    <span className="text-xs font-bold text-navy-400 uppercase tracking-widest">Est. Processing</span>
                    <span className="font-bold text-navy-900">{result.processing_time}</span>
                  </div>
                )}
                {result.agency_contact && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs font-bold text-navy-400 uppercase tracking-widest">Support</span>
                    <a href={`tel:${result.agency_contact}`} className="font-bold text-accent-600 hover:underline">{result.agency_contact}</a>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setResult(null)}
                className="w-full mt-8 py-4 bg-navy-50 text-navy-900 font-bold rounded-xl hover:bg-navy-100 transition-colors"
              >
                Check Another Application
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

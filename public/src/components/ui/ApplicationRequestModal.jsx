import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../../api/client';

export default function ApplicationRequestModal({ isOpen, onClose, targetVisaId, targetVisaName }) {
  const [requestData, setRequestData] = useState({ name: '', email: '', phone: '', message: '' });
  const [requestStatus, setRequestStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRequestStatus('loading');
    try {
      await api.post('/public/application-requests/', {
        ...requestData,
        target_visa: targetVisaId,
      });
      setRequestStatus('success');
      setTimeout(() => {
        setRequestStatus('idle');
        setRequestData({ name: '', email: '', phone: '', message: '' });
        onClose();
      }, 3000);
    } catch (error) {
      setRequestStatus('error');
      setTimeout(() => setRequestStatus('idle'), 5000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="relative bg-navy-900 p-6 sm:p-8 text-white shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <CloseIcon fontSize="small" />
                </button>
                <div className="inline-block px-3 py-1 bg-accent-500/20 text-accent-300 text-xs font-bold uppercase tracking-wider rounded-full mb-3 border border-accent-500/30">
                  Application Request
                </div>
                <h3 className="text-2xl font-black font-heading leading-tight">
                  Apply for {targetVisaName}
                </h3>
                <p className="text-navy-200 text-sm mt-2 font-medium">
                  Provide your basic details, and our agents will contact you to start the process.
                </p>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 overflow-y-auto">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={requestData.name}
                      onChange={e => setRequestData({ ...requestData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-navy-50 border border-navy-100 text-navy-900 focus:outline-none focus:border-accent-500 focus:bg-white transition-all font-medium"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={requestData.email}
                      onChange={e => setRequestData({ ...requestData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-navy-50 border border-navy-100 text-navy-900 focus:outline-none focus:border-accent-500 focus:bg-white transition-all font-medium"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={requestData.phone}
                      onChange={e => setRequestData({ ...requestData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-navy-50 border border-navy-100 text-navy-900 focus:outline-none focus:border-accent-500 focus:bg-white transition-all font-medium"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Message / Inquiry</label>
                    <textarea
                      rows={3}
                      value={requestData.message}
                      onChange={e => setRequestData({ ...requestData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-navy-50 border border-navy-100 text-navy-900 focus:outline-none focus:border-accent-500 focus:bg-white transition-all font-medium resize-none"
                      placeholder="Any specific questions or details?"
                    ></textarea>
                  </div>

                  {requestStatus === 'success' && (
                    <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      Request submitted! We'll reach out shortly.
                    </div>
                  )}
                  {requestStatus === 'error' && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2">
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={requestStatus === 'loading' || requestStatus === 'success'}
                    className="w-full py-4 mt-2 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {requestStatus === 'loading' ? 'Submitting...' : 'Apply Now'} <ArrowForwardIcon fontSize="small" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

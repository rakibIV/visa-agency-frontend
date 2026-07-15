import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle'); // idle, loading, success, error

  const { data: company, isLoading } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then(r => {
      const results = r.data.results ?? r.data;
      return Array.isArray(results) ? results[0] : results;
    }),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      await api.post('/public/messages/', formData);
      setFormStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 4000);
    } catch (error) {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-navy-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <section className="gradient-hero pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Get in Touch
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-navy-200 text-lg max-w-xl mx-auto">
            We are here to help and answer any question you might have. We look forward to hearing from you.
          </motion.p>
        </div>
      </section>

      <section className="py-20 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-navy-lg border border-navy-100"
          >
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {company?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-navy-50 text-accent-600 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-1">Phone</p>
                        <a href={`tel:${company.phone}`} className="text-lg font-bold text-navy-900 hover:text-accent-600 transition-colors">{company.phone}</a>
                      </div>
                    </div>
                  )}

                  {company?.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-navy-50 text-accent-600 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-1">Email</p>
                        <a href={`mailto:${company.email}`} className="text-lg font-bold text-navy-900 hover:text-accent-600 transition-colors break-all">{company.email}</a>
                      </div>
                    </div>
                  )}

                  {company?.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-navy-50 text-accent-600 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-1">Head Office</p>
                        <p className="text-base font-medium text-navy-800 leading-relaxed">{company.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-navy-50 rounded-3xl p-8 border border-navy-100 flex flex-col">
                 <h3 className="text-2xl font-black text-navy-900 mb-2">Send us a message</h3>
                 <p className="text-sm text-navy-600 mb-8">
                   Fill out the form below and we will get back to you as soon as possible.
                 </p>
                 
                 <form onSubmit={handleSubmit} className="space-y-5 flex-1">
                   <div>
                     <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Full Name <span className="text-red-500">*</span></label>
                     <input
                       type="text"
                       required
                       value={formData.name}
                       onChange={e => setFormData({ ...formData, name: e.target.value })}
                       className="w-full px-4 py-3 rounded-xl bg-white border border-navy-200 text-navy-900 focus:outline-none focus:border-accent-500 transition-all font-medium"
                       placeholder="e.g. John Doe"
                     />
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <div>
                       <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Email <span className="text-red-500">*</span></label>
                       <input
                         type="email"
                         required
                         value={formData.email}
                         onChange={e => setFormData({ ...formData, email: e.target.value })}
                         className="w-full px-4 py-3 rounded-xl bg-white border border-navy-200 text-navy-900 focus:outline-none focus:border-accent-500 transition-all font-medium"
                         placeholder="you@example.com"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Phone <span className="text-red-500">*</span></label>
                       <input
                         type="tel"
                         required
                         value={formData.phone}
                         onChange={e => setFormData({ ...formData, phone: e.target.value })}
                         className="w-full px-4 py-3 rounded-xl bg-white border border-navy-200 text-navy-900 focus:outline-none focus:border-accent-500 transition-all font-medium"
                         placeholder="+1 234 567 890"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Subject <span className="text-red-500">*</span></label>
                     <input
                       type="text"
                       required
                       value={formData.subject}
                       onChange={e => setFormData({ ...formData, subject: e.target.value })}
                       className="w-full px-4 py-3 rounded-xl bg-white border border-navy-200 text-navy-900 focus:outline-none focus:border-accent-500 transition-all font-medium"
                       placeholder="How can we help you?"
                     />
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Message <span className="text-red-500">*</span></label>
                     <textarea
                       required
                       value={formData.message}
                       onChange={e => setFormData({ ...formData, message: e.target.value })}
                       className="w-full px-4 py-3 rounded-xl bg-white border border-navy-200 text-navy-900 focus:outline-none focus:border-accent-500 transition-all font-medium min-h-[120px] resize-y"
                       placeholder="Tell us more about your inquiry..."
                     />
                   </div>

                   <button 
                     type="submit" 
                     disabled={formStatus === 'loading' || formStatus === 'success'}
                     className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold shadow-md transition-all ${
                       formStatus === 'success' 
                         ? 'bg-green-500 text-white cursor-default' 
                         : formStatus === 'error'
                           ? 'bg-red-500 text-white'
                           : 'bg-accent-600 hover:bg-accent-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                     }`}
                   >
                     {formStatus === 'loading' ? (
                       <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : formStatus === 'success' ? (
                       'Message Sent Successfully!'
                     ) : formStatus === 'error' ? (
                       'Error. Please try again.'
                     ) : (
                       'Send Message'
                     )}
                   </button>
                 </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

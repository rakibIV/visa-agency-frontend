import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

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
        <div className="w-12 h-12 border-4 border-navy-100 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface-dim selection:bg-accent-600 selection:text-white min-h-screen">
      {/* ═══════════════════════════════════════════
          HERO — Minimal Text Hero
      ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 relative overflow-hidden bg-white">
        <div className="container-wide relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="eyebrow text-accent-600 mb-6 block">Support 24/7</span>
            <h1 className="display-hero font-heading text-navy-900 mb-6">
              Let's Start a <br className="hidden sm:block" />Conversation
            </h1>
            <p className="body-lg text-navy-600">
              Whether you have a question about visa processing, pricing, or our services, our team is ready to answer all your questions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CONTACT INFO & FORM — Split Layout
      ═══════════════════════════════════════════ */}
      <section className="section-py relative z-10">
        <div className="container-wide">
          <div className="bg-white rounded-[2.5rem] shadow-elevated border border-navy-50 overflow-hidden">
            <div className="grid lg:grid-cols-5 h-full">
              
              {/* Left Column: Contact Details */}
              <div className="lg:col-span-2 bg-navy-950 text-white p-6 sm:p-10 lg:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="heading-lg font-heading text-white mb-3">Contact Information</h3>
                    <p className="text-navy-300 mb-10 sm:mb-12">Fill up the form and our team will get back to you within 24 hours.</p>

                    <div className="space-y-6 sm:space-y-8">
                      {company?.phone && (
                        <div className="flex items-center gap-4 sm:gap-5 group">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-400 group-hover:bg-accent-600 group-hover:text-white transition-colors shrink-0">
                            <PhoneIcon fontSize="small" />
                          </div>
                          <div className="min-w-0">
                            <p className="eyebrow text-navy-400 mb-1">Phone</p>
                            <a href={`tel:${company.phone}`} className="text-base sm:text-lg font-medium text-white hover:text-accent-400 transition-colors truncate block">
                              {company.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {company?.email && (
                        <div className="flex items-center gap-4 sm:gap-5 group">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-400 group-hover:bg-accent-600 group-hover:text-white transition-colors shrink-0">
                            <EmailIcon fontSize="small" />
                          </div>
                          <div className="min-w-0">
                            <p className="eyebrow text-navy-400 mb-1">Email</p>
                            <a href={`mailto:${company.email}`} className="text-base sm:text-lg font-medium text-white hover:text-accent-400 transition-colors truncate block">
                              {company.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {company?.address && (
                        <div className="flex items-center gap-4 sm:gap-5 group">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-400 group-hover:bg-accent-600 group-hover:text-white transition-colors shrink-0">
                            <PlaceIcon fontSize="small" />
                          </div>
                          <div>
                            <p className="eyebrow text-navy-400 mb-1">Location</p>
                            <p className="text-base sm:text-lg font-medium text-white">
                              {company.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Optional social icons could go here at the bottom */}
                  <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10">
                    <p className="text-sm text-navy-400">
                      Office Hours: Monday - Friday <br />
                      9:00 AM to 6:00 PM (AST)
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="lg:col-span-3 p-6 sm:p-10 lg:p-14">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-bold text-navy-900 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="w-full px-5 py-4 bg-surface-dim border border-navy-100 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 focus:bg-white transition-all font-medium" 
                        placeholder="John Doe" 
                      />
                    </div>
                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-bold text-navy-900 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        required 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className="w-full px-5 py-4 bg-surface-dim border border-navy-100 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 focus:bg-white transition-all font-medium" 
                        placeholder="john@example.com" 
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-bold text-navy-900 ml-1">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        required 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className="w-full px-5 py-4 bg-surface-dim border border-navy-100 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 focus:bg-white transition-all font-medium" 
                        placeholder="+966 XX XXX XXXX" 
                      />
                    </div>
                    {/* Subject */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-bold text-navy-900 ml-1">Subject</label>
                      <input 
                        type="text" 
                        id="subject" 
                        required 
                        value={formData.subject} 
                        onChange={e => setFormData({...formData, subject: e.target.value})} 
                        className="w-full px-5 py-4 bg-surface-dim border border-navy-100 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 focus:bg-white transition-all font-medium" 
                        placeholder="How can we help?" 
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-bold text-navy-900 ml-1">Message</label>
                    <textarea 
                      id="message" 
                      rows={5} 
                      required 
                      value={formData.message} 
                      onChange={e => setFormData({...formData, message: e.target.value})} 
                      className="w-full px-5 py-4 bg-surface-dim border border-navy-100 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 focus:bg-white transition-all font-medium resize-none" 
                      placeholder="Write your message here..." 
                    />
                  </div>

                  {/* Status Messages */}
                  {formStatus === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Message sent successfully! We'll be in touch shortly.
                    </div>
                  )}
                  {formStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Failed to send message. Please try again or call us directly.
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={formStatus === 'loading'} 
                      className="w-full sm:w-auto px-10 py-4 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-full transition-all shadow-lg shadow-accent-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 hover:-translate-y-0.5"
                    >
                      {formStatus === 'loading' ? 'Sending Message...' : 'Send Message'}
                      <ArrowForwardIcon fontSize="small" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

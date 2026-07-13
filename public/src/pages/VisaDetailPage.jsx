import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '../api/client';

export default function VisaDetailPage() {
  const { slug } = useParams();
  const [openFaq, setOpenFaq] = useState(null);

  const { data: visa, isLoading } = useQuery({
    queryKey: ['visa', slug],
    queryFn: () => api.get(`/visas/${slug}/`).then(r => r.data),
  });

  const { data: jobs } = useQuery({
    queryKey: ['visa-jobs', slug],
    queryFn: () => api.get(`/visas/${slug}/jobs/`).then(r => r.data.results ?? r.data),
    enabled: !!slug,
  });

  const { data: steps } = useQuery({
    queryKey: ['visa-steps', slug],
    queryFn: () => api.get(`/visas/${slug}/steps/`).then(r => r.data.results ?? r.data),
    enabled: !!slug,
  });

  const { data: requirements } = useQuery({
    queryKey: ['visa-requirements', slug],
    queryFn: () => api.get(`/visas/${slug}/requirements/`).then(r => r.data.results ?? r.data),
    enabled: !!slug,
  });

  const { data: faqs } = useQuery({
    queryKey: ['visa-faqs', slug],
    queryFn: () => api.get(`/visas/${slug}/faqs/`).then(r => r.data.results ?? r.data),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="w-12 h-12 border-4 border-navy-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!visa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-soft">
          <h2 className="text-3xl font-black text-navy-900 mb-4">Visa Not Found</h2>
          <p className="text-navy-500 mb-6">The visa program you are looking for does not exist.</p>
          <Link to="/visas" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5">
            ← Explore Visas
          </Link>
        </div>
      </div>
    );
  }

  const countrySlug = visa.country?.slug || visa.country_slug;
  const countryName = visa.country?.name || visa.country_name || 'Destination';

  return (
    <div className="bg-navy-50 min-h-screen pb-20">
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-navy-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900 to-navy-950" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={countrySlug ? `/countries/${countrySlug}` : '/countries'} className="inline-flex items-center gap-2 text-sm text-navy-300 hover:text-white mb-6 transition-colors bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Back to {countryName}
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <span className="inline-block py-1 px-3 rounded-full bg-accent-500/20 text-accent-400 text-xs font-bold tracking-wider uppercase mb-4 border border-accent-500/30">
                  {countryName} Visa Program
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight mb-4">
                  {visa.name}
                </h1>
                {visa.description && (
                  <p className="text-lg text-navy-200 leading-relaxed font-medium">
                    {visa.description}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Card (Overlapping Hero) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-10 mb-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-navy-100 flex flex-wrap lg:flex-nowrap gap-6 sm:gap-10 justify-between items-center backdrop-blur-xl">
          {visa.minimum_salary && (
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-400 uppercase tracking-wider">Salary Range</p>
                  <p className="text-xl font-black text-navy-900">From {visa.currency || 'USD'} {Number(visa.minimum_salary).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          
          {visa.duration_in_months && (
            <div className="flex-1 min-w-[200px] lg:border-l lg:border-navy-100 lg:pl-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-400 uppercase tracking-wider">Duration</p>
                  <p className="text-xl font-black text-navy-900">{visa.duration_in_months} Months</p>
                </div>
              </div>
            </div>
          )}

          {visa.working_hours_per_week && (
            <div className="flex-1 min-w-[200px] lg:border-l lg:border-navy-100 lg:pl-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-400 uppercase tracking-wider">Work Hours</p>
                  <p className="text-xl font-black text-navy-900">{visa.working_hours_per_week} hrs/week</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Steps Timeline */}
            {steps?.length > 0 && (
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-navy-100">
                <h2 className="text-2xl font-black text-navy-900 mb-8 font-heading flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                  </div>
                  Application Process
                </h2>
                
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-navy-50 rounded-full" />
                  
                  <div className="space-y-10">
                    {steps.sort((a, b) => (a.step_number || a.display_order || 0) - (b.step_number || b.display_order || 0)).map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative flex gap-8 group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-md border-2 border-accent-100 flex items-center justify-center font-black text-lg text-accent-600 z-10 shrink-0 group-hover:scale-110 group-hover:border-accent-600 group-hover:bg-accent-600 group-hover:text-white transition-all duration-300">
                          {step.step_number || i + 1}
                        </div>
                        <div className="pt-2">
                          <h3 className="text-xl font-bold text-navy-900 mb-2">{step.title}</h3>
                          {step.description && <p className="text-navy-600 leading-relaxed text-base">{step.description}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Listing */}
            {jobs?.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-navy-900 mb-6 font-heading flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.118l-1.631.124A10.126 10.126 0 0 1 12 21c-2.454 0-4.733-.86-6.497-2.308l-1.631-.124c-1.085-.082-1.872-1.024-1.872-2.118v-4.25c0-1.094.787-2.036 1.872-2.118l1.631-.124A10.126 10.126 0 0 1 12 7c2.454 0 4.733.86 6.497 2.308l1.631.124c1.085.082 1.872 1.024 1.872 2.118Z" /></svg>
                  </div>
                  Available Positions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {jobs.filter(j => j.is_active !== false).map((job, i) => (
                    <motion.div
                      key={job.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-3xl p-6 shadow-sm border border-navy-100 hover:shadow-hover hover:border-accent-200 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-navy-900 group-hover:text-accent-600 transition-colors">{job.title}</h3>
                        {job.vacancy_count && (
                          <span className="px-2.5 py-1 bg-navy-50 text-navy-600 text-xs font-bold rounded-lg border border-navy-100 shrink-0">
                            {job.vacancy_count} Open
                          </span>
                        )}
                      </div>
                      
                      {job.description && <p className="text-sm text-navy-600 line-clamp-2 mb-5 leading-relaxed">{job.description}</p>}
                      
                      <div className="pt-4 border-t border-navy-50 flex items-center justify-between mt-auto">
                        {job.salary ? (
                          <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                            {job.salary}
                          </span>
                        ) : (
                          <span className="text-sm text-navy-400 font-medium">Salary Negotiable</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Static What's Included Block */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-navy-100">
              <h2 className="text-2xl font-black text-navy-900 mb-8 font-heading flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>
                </div>
                What's Included in Our Service
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4 p-4 rounded-2xl bg-navy-50/50">
                  <div className="text-2xl">📄</div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-1">Document Verification</h4>
                    <p className="text-sm text-navy-600 leading-relaxed">Comprehensive review of all your documents to ensure 100% compliance with embassy standards.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-navy-50/50">
                  <div className="text-2xl">🗣️</div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-1">Interview Preparation</h4>
                    <p className="text-sm text-navy-600 leading-relaxed">One-on-one mock interviews and expert tips to help you confidently clear the embassy interview.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-navy-50/50">
                  <div className="text-2xl">✈️</div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-1">Travel & Accommodation Assist</h4>
                    <p className="text-sm text-navy-600 leading-relaxed">Guidance on booking flights and finding suitable accommodation upon arrival.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-navy-50/50">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-1">Dedicated Consultant</h4>
                    <p className="text-sm text-navy-600 leading-relaxed">A personal visa expert assigned to your case, available 24/7 for any queries or updates.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area (Right) */}
          <div className="space-y-8">
            {/* Action Card */}
            <div className="bg-gradient-to-br from-accent-600 to-accent-800 rounded-3xl p-8 shadow-lg shadow-accent-600/30 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-32 h-32 transform translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
              </div>
              <h3 className="text-2xl font-black mb-4 relative z-10">Ready to Apply?</h3>
              <p className="text-accent-100 mb-8 text-sm font-medium relative z-10">
                Begin your journey today. Our experts will guide you through every step of the process.
              </p>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-accent-700 hover:bg-navy-50 font-black rounded-xl transition-all hover:scale-105 relative z-10">
                Start Application
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>

            {/* Static Guarantee Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-navy-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-navy-900 leading-tight">Our Guarantee</h3>
                  <p className="text-xs font-bold text-navy-400 uppercase tracking-wider">100% Transparency</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-navy-700">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  No hidden fees or unexpected charges
                </li>
                <li className="flex items-start gap-3 text-sm text-navy-700">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Secure handling of all sensitive documents
                </li>
                <li className="flex items-start gap-3 text-sm text-navy-700">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Continuous updates on application status
                </li>
              </ul>
            </div>

            {/* Requirements */}
            {requirements?.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-navy-100">
                <h2 className="text-xl font-black text-navy-900 mb-6 font-heading flex items-center gap-2">
                  <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" /></svg>
                  Requirements
                </h2>
                <div className="space-y-4">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-navy-50/50 border border-navy-50">
                      <div className="w-6 h-6 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-900">{req.title}</p>
                        {req.description && <p className="text-sm text-navy-600 mt-1 leading-relaxed">{req.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {faqs?.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-navy-100">
                <h2 className="text-xl font-black text-navy-900 mb-6 font-heading flex items-center gap-2">
                  <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>
                  Questions?
                </h2>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border border-navy-100 rounded-2xl overflow-hidden bg-white hover:border-navy-300 transition-colors">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between"
                      >
                        <span className="text-sm font-bold text-navy-900 pr-4 leading-snug">{faq.question}</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${openFaq === i ? 'bg-accent-600 text-white' : 'bg-navy-50 text-navy-400'}`}>
                          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-5"
                          >
                            <p className="text-sm text-navy-600 leading-relaxed border-t border-navy-50 pt-3">{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

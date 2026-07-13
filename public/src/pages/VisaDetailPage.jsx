import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-navy-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!visa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy-900">Visa Not Found</h2>
          <Link to="/countries" className="text-accent-600 font-semibold mt-2 inline-block">← Back to Countries</Link>
        </div>
      </div>
    );
  }

  const countrySlug = visa.country?.slug || visa.country_slug;
  const countryName = visa.country?.name || visa.country_name || 'Country';

  const badges = [
    visa.minimum_salary && { label: `From ${visa.currency || 'USD'} ${Number(visa.minimum_salary).toLocaleString()}`, color: 'green' },
    visa.maximum_salary && { label: `Up to ${visa.currency || 'USD'} ${Number(visa.maximum_salary).toLocaleString()}`, color: 'green' },
    visa.duration_in_months && { label: `${visa.duration_in_months} months duration`, color: 'blue' },
    visa.working_hours_per_week && { label: `${visa.working_hours_per_week} hrs/week`, color: 'purple' },
    visa.overtime_available && { label: 'Overtime Available', color: 'amber' },
  ].filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <img src="/src/assets/hero.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={countrySlug ? `/countries/${countrySlug}` : '/countries'} className="inline-flex items-center gap-2 text-sm text-navy-200 hover:text-white mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Back to {countryName}
          </Link>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-black text-white mb-3 font-heading">
            {visa.name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-navy-200 text-lg mb-6">
            {countryName}
          </motion.p>
          {badges.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2">
              {badges.map((badge, i) => {
                const colors = {
                  green: 'bg-green-500/20 text-green-300 border-green-500/30',
                  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                };
                return (
                  <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[badge.color]}`}>
                    {badge.label}
                  </span>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Description */}
        {visa.description && (
          <div className="bg-white rounded-2xl p-8 shadow-navy border border-navy-100/50">
            <h2 className="text-xl font-bold text-navy-900 mb-4 font-heading">About This Visa</h2>
            <p className="text-navy-700 leading-relaxed whitespace-pre-line">{visa.description}</p>
          </div>
        )}

        {/* Steps Timeline */}
        {steps?.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-navy border border-navy-100/50">
            <h2 className="text-xl font-bold text-navy-900 mb-8 font-heading">Application Process</h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-navy-100" />
              <div className="space-y-8">
                {steps.sort((a, b) => (a.step_number || a.display_order || 0) - (b.step_number || b.display_order || 0)).map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="relative flex gap-5"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent-600 text-white flex items-center justify-center font-bold text-sm z-10 shrink-0">
                      {step.step_number || i + 1}
                    </div>
                    <div className="pt-1.5">
                      <h3 className="text-base font-bold text-navy-900">{step.title}</h3>
                      {step.description && <p className="text-sm text-navy-600 mt-1">{step.description}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Jobs */}
        {jobs?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-navy-900 mb-6 font-heading">Available Job Positions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.filter(j => j.is_active !== false).map((job, i) => (
                <motion.div
                  key={job.id || i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-navy border border-navy-100/50 hover:shadow-navy-lg transition-all"
                >
                  <h3 className="text-base font-bold text-navy-900 mb-2">{job.title}</h3>
                  {job.description && <p className="text-sm text-navy-600 line-clamp-2 mb-3">{job.description}</p>}
                  <div className="flex flex-wrap gap-2">
                    {job.salary && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full">{job.salary}</span>
                    )}
                    {job.vacancy_count && (
                      <span className="px-2 py-0.5 bg-navy-50 text-navy-600 text-xs font-bold rounded-full">{job.vacancy_count} vacancies</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {requirements?.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-navy border border-navy-100/50">
            <h2 className="text-xl font-bold text-navy-900 mb-6 font-heading">Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{req.title}</p>
                    {req.description && <p className="text-xs text-navy-500 mt-0.5">{req.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {faqs?.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-navy border border-navy-100/50">
            <h2 className="text-xl font-bold text-navy-900 mb-6 font-heading">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-navy-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-navy-50/50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-navy-900 pr-4">{faq.question}</span>
                    <svg className={`w-5 h-5 text-navy-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-4">
                      <p className="text-sm text-navy-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-4">
          <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl shadow-lg shadow-accent-600/25 transition-all hover:-translate-y-0.5">
            Apply Now — Contact Us
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>
      </div>
    </>
  );
}

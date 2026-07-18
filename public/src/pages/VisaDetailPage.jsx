import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '../api/client';
import ApplicationRequestModal from '../components/ui/ApplicationRequestModal';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ListAltIcon from '@mui/icons-material/ListAlt';

export default function VisaDetailPage() {
  const { slug } = useParams();
  const [openFaq, setOpenFaq] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-surface-dim">
        <div className="w-12 h-12 border-4 border-navy-100 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!visa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dim">
        <div className="text-center p-12 bg-white rounded-3xl shadow-soft border border-navy-50 max-w-lg">
          <h2 className="heading-lg font-heading text-navy-900 mb-4">Visa Not Found</h2>
          <p className="body-sm text-navy-500 mb-8">The visa program you are looking for does not exist or has been removed.</p>
          <Link to="/visas" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5">
            View All Visas
          </Link>
        </div>
      </div>
    );
  }

  const countryName = visa.country?.name || visa.country_name;
  const countrySlug = visa.country?.slug || visa.country_slug;

  return (
    <div className="bg-surface-dim min-h-screen pb-24">
      {/* ═══════════════════════════════════════════
          HERO — Focused Detail
      ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-navy-950 relative overflow-hidden grain">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link to="/visas" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 text-sm font-bold transition-colors">
              <ArrowForwardIcon className="rotate-180" fontSize="small" /> Back to Visas
            </Link>

            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  {visa.country?.flag && (
                    <img src={visa.country.flag} alt="" className="w-4 h-4 rounded-full object-cover" />
                  )}
                  {countryName}
                </span>
                {visa.category?.name && (
                  <span className="px-3 py-1.5 bg-accent-600/20 text-accent-400 border border-accent-600/30 rounded-lg text-xs font-bold uppercase tracking-widest">
                    {visa.category.name}
                  </span>
                )}
              </div>
              
              <h1 className="display-lg font-heading text-white mb-6">
                {visa.name}
              </h1>

              {/* Key Stats Row */}
              {(visa.minimum_processing_days || visa.minimum_salary) && (
                <div className="flex flex-wrap gap-4 sm:gap-8 mt-8 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
                  {visa.minimum_processing_days && (
                    <div className="flex items-center gap-3">
                      <AccessTimeIcon className="text-accent-400" />
                      <div>
                        <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Processing Time</div>
                        <div className="text-sm text-white font-medium">{visa.minimum_processing_days}{visa.maximum_processing_days ? ` - ${visa.maximum_processing_days}` : ''} Days</div>
                      </div>
                    </div>
                  )}
                  {visa.minimum_salary && (
                    <>
                      {visa.minimum_processing_days && <div className="w-px h-10 bg-white/10 hidden sm:block" />}
                      <div className="flex items-center gap-3">
                        <AttachMoneyIcon className="text-accent-400" />
                        <div>
                          <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Min Salary</div>
                          <div className="text-sm text-white font-medium">${visa.minimum_salary}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container-wide mt-12 grid lg:grid-cols-12 gap-12 items-start">
        {/* ═══════════════════════════════════════════
            MAIN CONTENT AREA (Left 8 cols)
        ═══════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Overview */}
          {visa.description && (
            <section>
              <h2 className="heading-lg font-heading text-navy-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <ArticleIcon fontSize="small" />
                </span>
                Program Overview
              </h2>
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-navy-50 prose prose-navy max-w-none">
                <div dangerouslySetInnerHTML={{ __html: visa.description }} />
              </div>
            </section>
          )}

          {/* Job Openings */}
          {jobs && jobs.length > 0 && (
            <section>
              <h2 className="heading-lg font-heading text-navy-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <WorkIcon fontSize="small" />
                </span>
                Available Positions
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {jobs.map((job, i) => (
                  <div key={job.id || i} className="bg-white p-5 rounded-2xl border border-navy-50 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h4 className="font-bold text-navy-900 mb-1">{job.title}</h4>
                    {job.vacancies && (
                      <span className="inline-block px-2 py-1 bg-navy-50 text-navy-500 text-xs font-bold rounded mt-2">
                        {job.vacancies} Openings
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Requirements */}
          {requirements && requirements.length > 0 && (
            <section>
              <h2 className="heading-lg font-heading text-navy-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <ListAltIcon fontSize="small" />
                </span>
                Eligibility & Requirements
              </h2>
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-navy-50 space-y-6">
                {requirements.map((req, i) => (
                  <div key={req.id || i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm mb-1">{req.title}</h4>
                      {req.description && <p className="text-sm text-navy-600 leading-relaxed">{req.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Process Steps */}
          {steps && steps.length > 0 && (
            <section>
              <h2 className="heading-lg font-heading text-navy-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <AssignmentTurnedInIcon fontSize="small" />
                </span>
                Application Process
              </h2>
              <div className="relative pl-6">
                <div className="absolute left-[35px] top-4 bottom-4 w-0.5 bg-navy-100" />
                <div className="space-y-8">
                  {steps.map((step, i) => (
                    <div key={step.id || i} className="relative flex gap-6">
                      <div className="w-8 h-8 rounded-full bg-white border-4 border-navy-100 flex items-center justify-center z-10 mt-1 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-accent-500" />
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-navy-50 flex-grow">
                        <div className="text-xs font-bold text-accent-600 uppercase tracking-widest mb-1">Step {step.step_number}</div>
                        <h4 className="font-bold text-navy-900 text-lg mb-2">{step.title}</h4>
                        {step.description && <p className="text-sm text-navy-600 leading-relaxed">{step.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* FAQs */}
          {faqs && faqs.length > 0 && (
            <section>
              <h2 className="heading-lg font-heading text-navy-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <HelpOutlineIcon fontSize="small" />
                </span>
                FAQ
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={faq.id || i} className="bg-white rounded-2xl border border-navy-50 shadow-sm overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-navy-900 hover:text-accent-600 transition-colors gap-4"
                      >
                        <span className="text-sm sm:text-base leading-tight">{faq.question}</span>
                        <svg className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-5"
                          >
                            <p className="text-sm text-navy-600 leading-relaxed border-t border-navy-50 pt-4">{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ═══════════════════════════════════════════
            SIDEBAR AREA (Right 4 cols)
        ═══════════════════════════════════════════ */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            
            {/* CTA Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-navy-50 text-center">
              <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600 mx-auto mb-6">
                <AssignmentTurnedInIcon fontSize="large" />
              </div>
              <h3 className="heading-md font-heading text-navy-900 mb-3">Begin Application</h3>
              <p className="text-sm text-navy-500 mb-8">
                Ready to take the next step? Request a callback from our experts to evaluate your profile for this program.
              </p>
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="block w-full py-4 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-600/20"
              >
                Apply Now
              </button>
            </div>

            {/* Back to Country link */}
            {countrySlug && (
              <Link
                to={`/countries/${countrySlug}`}
                className="flex items-center gap-4 bg-navy-900 p-4 rounded-2xl hover:bg-navy-800 transition-colors group"
              >
                {visa.country?.flag && (
                  <img src={visa.country.flag} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/20" />
                )}
                <div>
                  <div className="text-[10px] text-navy-300 font-bold uppercase tracking-widest mb-0.5">Explore more in</div>
                  <div className="text-sm font-bold text-white group-hover:text-accent-400 transition-colors">{countryName}</div>
                </div>
                <ArrowForwardIcon className="text-white ml-auto group-hover:translate-x-1 transition-transform" fontSize="small" />
              </Link>
            )}

          </div>
        </div>
      </div>

      <ApplicationRequestModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        contextInfo={`Interested in: ${visa.title} (${countryName})`}
      />
    </div>
  );
}

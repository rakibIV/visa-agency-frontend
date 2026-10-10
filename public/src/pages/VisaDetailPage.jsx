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
import PaymentsIcon from '@mui/icons-material/Payments';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { formatSalary, formatContractDuration, formatProcessingTime } from '../utils/currency';

export default function VisaDetailPage() {
  const { slug } = useParams();
  const [openFaq, setOpenFaq] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

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
        <div className="w-10 h-10 border-4 border-navy-100 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!visa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dim">
        <div className="text-center p-10 bg-white rounded-3xl shadow-soft border border-navy-50 max-w-lg">
          <h2 className="text-2xl font-bold font-heading text-navy-900 mb-3">Visa Not Found</h2>
          <p className="text-sm text-navy-500 mb-6">The visa opportunity you are looking for does not exist or has been archived.</p>
          <Link to="/visas" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-bold rounded-xl transition-all">
            View All Visas
          </Link>
        </div>
      </div>
    );
  }

  const countryName = visa.country?.name || visa.country_name;
  const countrySlug = visa.country?.slug || visa.country_slug;
  const visaTitle = visa.title || visa.name;

  // Selected currency
  const activeCurrency =
    visa.currency ||
    jobs?.[0]?.currency ||
    visa.country?.currency ||
    'EUR';

  // Processing Time
  const processingTimeStr =
    formatProcessingTime(visa.minimum_processing_days, visa.maximum_processing_days) ||
    visa.processing_time ||
    (visa.country?.processing_time ? `${visa.country.processing_time} Days` : '90 - 180 Days');

  // Overall Salary Range calculation
  const visaMinSal = visa.minimum_salary !== null && visa.minimum_salary !== undefined && visa.minimum_salary !== ''
    ? Number(visa.minimum_salary)
    : (jobs?.length ? Math.min(...jobs.map(j => Number(j.minimum_salary || 0)).filter(n => n > 0)) : null);

  const visaMaxSal = visa.maximum_salary !== null && visa.maximum_salary !== undefined && visa.maximum_salary !== ''
    ? Number(visa.maximum_salary)
    : (jobs?.length ? Math.max(...jobs.map(j => Number(j.maximum_salary || 0)).filter(n => n > 0)) : null);

  const hasSalary = (visaMinSal && !isNaN(visaMinSal) && visaMinSal > 0) || (visaMaxSal && !isNaN(visaMaxSal) && visaMaxSal > 0);
  const salaryRangeStr = hasSalary ? formatSalary(visaMinSal, visaMaxSal, activeCurrency) : 'Competitive';

  // Overall Contract Duration
  const visaContractMonths = visa.duration_in_months || jobs?.[0]?.contract_duration_months || null;
  const contractDurationStr = visaContractMonths ? formatContractDuration(visaContractMonths) : '12 - 24 Months';

  // Overall Duty Days & Hours
  const dutyDaysVal = jobs?.[0]?.duty_days_per_week || null;
  const dutyDaysStr = dutyDaysVal ? `${dutyDaysVal} Days/Wk` : '5-6 Days/Wk';

  const dutyHoursStr = jobs?.[0]?.duty_hours_per_day
    ? `${jobs[0].duty_hours_per_day}h/Day`
    : (visa.working_hours_per_week ? `${visa.working_hours_per_week}h/Wk` : '8h/Day');

  return (
    <div className="bg-surface-dim min-h-screen pb-20">
      {/* ═══════════════════════════════════════════
          HERO — Streamlined & Proportional
      ═══════════════════════════════════════════ */}
      <section className="pt-28 pb-12 lg:pt-36 lg:pb-16 bg-navy-950 relative overflow-hidden grain">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/visas" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white mb-6 text-xs font-semibold transition-colors">
              <ArrowForwardIcon className="rotate-180" sx={{ fontSize: 16 }} /> Back to Visas
            </Link>

            <div className="max-w-4xl">
              {/* Top Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/15 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  {visa.country?.flag && (
                    <img src={visa.country.flag} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                  )}
                  {countryName}
                </span>
                {visa.category?.name && (
                  <span className="px-2.5 py-1 bg-accent-500/20 text-accent-300 border border-accent-500/30 rounded-lg text-xs font-semibold">
                    {visa.category.name}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/70 rounded-lg text-xs font-medium">
                  Currency: {activeCurrency}
                </span>
              </div>
              
              {/* Visa Title - Normal Balanced Font Size */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white mb-6 tracking-tight leading-snug">
                {visaTitle}
              </h1>

              {/* Single Compact Specifications Strip (No Giant Duplication) */}
              <div className="flex flex-wrap gap-2.5 sm:gap-4 p-3.5 sm:p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
                <div className="flex items-center gap-2 px-2 py-1">
                  <AccessTimeIcon className="text-accent-400" sx={{ fontSize: 18 }} />
                  <div>
                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Processing</div>
                    <div className="text-xs sm:text-sm text-white font-bold">{processingTimeStr}</div>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block self-center" />

                <div className="flex items-center gap-2 px-2 py-1">
                  <PaymentsIcon className="text-emerald-400" sx={{ fontSize: 18 }} />
                  <div>
                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Salary</div>
                    <div className="text-xs sm:text-sm text-white font-bold">{salaryRangeStr}</div>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block self-center" />

                <div className="flex items-center gap-2 px-2 py-1">
                  <CalendarMonthIcon className="text-blue-400" sx={{ fontSize: 18 }} />
                  <div>
                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Contract</div>
                    <div className="text-xs sm:text-sm text-white font-bold">{contractDurationStr}</div>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block self-center" />

                <div className="flex items-center gap-2 px-2 py-1">
                  <ScheduleIcon className="text-amber-400" sx={{ fontSize: 18 }} />
                  <div>
                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Schedule</div>
                    <div className="text-xs sm:text-sm text-white font-bold">{dutyDaysStr} • {dutyHoursStr}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container-wide mt-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* ═══════════════════════════════════════════
            MAIN CONTENT AREA (Left 8 cols)
        ═══════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Overview Section */}
          {visa.description && (
            <section>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-950 mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <ArticleIcon sx={{ fontSize: 18 }} />
                </span>
                Program Overview
              </h2>
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-navy-50 text-sm sm:text-base text-navy-700 leading-relaxed prose prose-navy max-w-none">
                <div dangerouslySetInnerHTML={{ __html: visa.description }} />
              </div>
            </section>
          )}

          {/* Available Positions / Job Openings (Compact & Focused) */}
          {jobs && jobs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-950 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                    <WorkIcon sx={{ fontSize: 18 }} />
                  </span>
                  Available Positions ({jobs.length})
                </h2>
              </div>

              <div className="space-y-4">
                {jobs.map((job, i) => {
                  const jobCurrency = job.currency || activeCurrency;
                  const jobSalaryStr = (job.minimum_salary || job.maximum_salary)
                    ? formatSalary(job.minimum_salary, job.maximum_salary, jobCurrency)
                    : salaryRangeStr;
                  const jobContract = formatContractDuration(job.contract_duration_months || visaContractMonths) || contractDurationStr;
                  const jobDutyDays = job.duty_days_per_week ? `${job.duty_days_per_week} Days/Wk` : dutyDaysStr;
                  const jobDutyHours = job.duty_hours_per_day ? `${job.duty_hours_per_day}h/Day` : dutyHoursStr;

                  return (
                    <div
                      key={job.id || i}
                      className="bg-white rounded-2xl border border-navy-100/70 p-5 sm:p-6 shadow-soft hover:shadow-card transition-all duration-200 relative overflow-hidden group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-500" />

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-bold font-heading text-navy-950 group-hover:text-accent-600 transition-colors">
                              {job.title}
                            </h3>
                            {job.vacancies && (
                              <span className="px-2 py-0.5 bg-accent-50 text-accent-700 text-[11px] font-bold rounded-md border border-accent-200/50">
                                {job.vacancies} Openings
                              </span>
                            )}
                            {job.location && (
                              <span className="px-2 py-0.5 bg-navy-50 text-navy-600 text-[11px] font-semibold rounded-md">
                                📍 {job.location}
                              </span>
                            )}
                          </div>
                          {job.description && (
                            <p className="text-xs sm:text-sm text-navy-600 line-clamp-2 leading-relaxed">
                              {job.description}
                            </p>
                          )}
                        </div>

                        {/* Salary Badge */}
                        <div className="sm:text-right shrink-0 bg-emerald-50 border border-emerald-200/60 px-3 py-2 rounded-xl">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Salary</div>
                          <div className="text-sm sm:text-base font-extrabold text-emerald-800 font-heading">
                            {jobSalaryStr}
                          </div>
                        </div>
                      </div>

                      {/* Compact Job Specs Line */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-navy-50 text-xs text-navy-600">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-50/80 rounded-lg font-medium">
                          📄 {jobContract}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-50/80 rounded-lg font-medium">
                          ⏱ {processingTimeStr}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-50/80 rounded-lg font-medium">
                          ⏰ {jobDutyDays} • {jobDutyHours}
                        </span>
                        {job.overtime_available && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/50 rounded-lg font-semibold">
                            ⚡ Overtime: {job.overtime_rate || 'Yes'}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJobForApply(job);
                            setIsApplyModalOpen(true);
                          }}
                          className="ml-auto px-4 py-2 bg-navy-900 hover:bg-accent-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          Apply &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Requirements Section */}
          {requirements && requirements.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-950 mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <ListAltIcon sx={{ fontSize: 18 }} />
                </span>
                Eligibility & Requirements
              </h2>
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-navy-50 space-y-5">
                {requirements.map((req, i) => (
                  <div key={req.id || i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm mb-0.5">{req.title}</h4>
                      {req.description && <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">{req.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Application Steps */}
          {steps && steps.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-950 mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />
                </span>
                Application Process
              </h2>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={step.id || i} className="bg-white p-5 rounded-2xl shadow-soft border border-navy-50 flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-accent-50 text-accent-700 font-bold font-heading flex items-center justify-center shrink-0 text-xs">
                      {step.step_number || i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm sm:text-base mb-1">{step.title}</h4>
                      {step.description && <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">{step.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {faqs && faqs.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-950 mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <HelpOutlineIcon sx={{ fontSize: 18 }} />
                </span>
                Frequently Asked Questions
              </h2>
              <div className="space-y-2.5">
                {faqs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={faq.id || i} className="bg-white rounded-2xl border border-navy-50 shadow-soft overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-navy-900 hover:text-accent-600 transition-colors gap-3 cursor-pointer text-sm"
                      >
                        <span>{faq.question}</span>
                        <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-4"
                          >
                            <p className="text-xs sm:text-sm text-navy-600 leading-relaxed border-t border-navy-50 pt-3">{faq.answer}</p>
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
          <div className="sticky top-28 space-y-5">
            
            {/* CTA Box */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-navy-50 text-center">
              <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600 mx-auto mb-4">
                <AssignmentTurnedInIcon sx={{ fontSize: 26 }} />
              </div>
              <h3 className="text-lg font-bold font-heading text-navy-900 mb-2">Begin Application</h3>
              <p className="text-xs text-navy-500 mb-5 leading-relaxed">
                Ready to take the next step? Request an evaluation with our immigration specialists for this program.
              </p>

              <button
                onClick={() => {
                  setSelectedJobForApply(null);
                  setIsApplyModalOpen(true);
                }}
                className="block w-full py-3.5 bg-accent-600 hover:bg-accent-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-accent-600/20 cursor-pointer"
              >
                Apply Now
              </button>
            </div>

            {/* Back to Country link */}
            {countrySlug && (
              <Link
                to={`/countries/${countrySlug}`}
                className="flex items-center gap-3 bg-navy-900 p-4 rounded-2xl hover:bg-navy-800 transition-colors group"
              >
                {visa.country?.flag && (
                  <img src={visa.country.flag} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                )}
                <div>
                  <div className="text-[10px] text-navy-300 font-bold uppercase tracking-wider">Destination</div>
                  <div className="text-xs sm:text-sm font-bold text-white group-hover:text-accent-400 transition-colors">{countryName}</div>
                </div>
                <ArrowForwardIcon className="text-white ml-auto group-hover:translate-x-1 transition-transform" sx={{ fontSize: 16 }} />
              </Link>
            )}

          </div>
        </div>
      </div>

      <ApplicationRequestModal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedJobForApply(null);
        }}
        contextInfo={
          selectedJobForApply
            ? `Interested in Job: ${selectedJobForApply.title} - ${visaTitle} (${countryName})`
            : `Interested in: ${visaTitle} (${countryName})`
        }
      />
    </div>
  );
}

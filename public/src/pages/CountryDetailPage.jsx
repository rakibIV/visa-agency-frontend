import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '../api/client';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import CollectionsIcon from '@mui/icons-material/Collections';

export default function CountryDetailPage() {
  const { slug } = useParams();
  const [openFaq, setOpenFaq] = useState(null);

  const { data: country, isLoading } = useQuery({
    queryKey: ['country', slug],
    queryFn: () => api.get(`/countries/${slug}/`).then(r => r.data),
  });

  const { data: visas } = useQuery({
    queryKey: ['country-visas', slug],
    queryFn: () => api.get(`/visas/?country__slug=${slug}`).then(r => r.data.results ?? r.data),
    enabled: !!slug,
  });

  const { data: faqs } = useQuery({
    queryKey: ['country-faqs', slug],
    queryFn: () => api.get(`/countries/${slug}/faqs/`).then(r => r.data.results ?? r.data),
    enabled: !!slug,
  });

  const { data: requirements } = useQuery({
    queryKey: ['country-requirements', slug],
    queryFn: () => api.get(`/countries/${slug}/requirements/`).then(r => r.data.results ?? r.data),
    enabled: !!slug,
  });

  const { data: gallery } = useQuery({
    queryKey: ['country-gallery', slug],
    queryFn: () => api.get(`/countries/${slug}/gallery/`).then(r => r.data.results ?? r.data),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dim">
        <div className="w-12 h-12 border-4 border-navy-100 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dim">
        <div className="text-center p-12 bg-white rounded-3xl shadow-soft border border-navy-50 max-w-lg">
          <h2 className="heading-lg font-heading text-navy-900 mb-4">Destination Not Found</h2>
          <p className="body-sm text-navy-500 mb-8">The country you are looking for does not exist or has been removed from our programs.</p>
          <Link to="/countries" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5">
            View All Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-dim min-h-screen pb-24">
      {/* ═══════════════════════════════════════════
          HERO — Immersive Destination
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-[60vh] flex flex-col justify-end pb-16 lg:pb-24 pt-32 bg-navy-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {country.image ? (
            <img src={country.image} alt={country.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy-800 to-navy-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/20" />
        </div>
        
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link to="/countries" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 text-sm font-bold transition-colors">
              <ArrowForwardIcon className="rotate-180" fontSize="small" /> Back to Destinations
            </Link>

            <div className="flex items-end gap-6 mb-6">
              {country.flag && (
                <img src={country.flag} alt="" className="w-20 h-20 rounded-full border-4 border-white/20 shadow-2xl object-cover" />
              )}
              <div>
                <span className="eyebrow text-accent-400 mb-2 block">Destination Guide</span>
                <h1 className="display-hero font-heading text-white">{country.name}</h1>
              </div>
            </div>
            
            {country.description && (
              <p className="body-lg text-white/80 max-w-3xl leading-relaxed">
                {country.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container-wide mt-12 grid lg:grid-cols-12 gap-12 items-start">
        {/* ═══════════════════════════════════════════
            MAIN CONTENT AREA (Left 8 cols)
        ═══════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* General Information */}
          {country.info && country.info.length > 0 && (
            <section>
              <h2 className="heading-lg font-heading text-navy-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <FactCheckIcon fontSize="small" />
                </span>
                Overview
              </h2>
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-navy-50 prose prose-navy max-w-none">
                <div dangerouslySetInnerHTML={{ __html: country.info }} />
              </div>
            </section>
          )}

          {/* Visa Requirements */}
          {requirements && requirements.length > 0 && (
            <section>
              <h2 className="heading-lg font-heading text-navy-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <FactCheckIcon fontSize="small" />
                </span>
                Requirements
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {requirements.map((req, i) => (
                  <div key={req.id || i} className="bg-white p-5 rounded-2xl border border-navy-50 shadow-sm flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm mb-1">{req.title}</h4>
                      {req.description && <p className="text-xs text-navy-500 leading-relaxed">{req.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {gallery && gallery.length > 0 && (
            <section>
              <h2 className="heading-lg font-heading text-navy-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-navy-50 text-accent-600 flex items-center justify-center border border-navy-100">
                  <CollectionsIcon fontSize="small" />
                </span>
                Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.map((img, i) => (
                  <a key={img.id || i} href={img.image} target="_blank" rel="noopener noreferrer" className="block relative aspect-square rounded-2xl overflow-hidden group shadow-soft border border-navy-50">
                    <img src={img.image} alt={img.caption || ''} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/20 transition-colors" />
                  </a>
                ))}
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
                Frequently Asked Questions
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
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-navy-50">
              <span className="eyebrow text-accent-600 mb-2 block">Available Programs</span>
              <h3 className="heading-md font-heading text-navy-900 mb-6">Visa Options in {country.name}</h3>

              {!visas || visas.length === 0 ? (
                <p className="text-sm text-navy-500 bg-surface-dim p-4 rounded-xl border border-navy-50">
                  There are currently no active visa programs listed for this destination.
                </p>
              ) : (
                <div className="space-y-3">
                  {visas.map((visa, i) => (
                    <Link
                      key={visa.slug || i}
                      to={`/visas/${visa.slug}`}
                      className="group flex flex-col p-4 rounded-2xl bg-surface-dim hover:bg-navy-50 border border-navy-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-navy-900 group-hover:text-accent-600 transition-colors mb-1 line-clamp-1">{visa.name}</span>
                      {visa.minimum_processing_days && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                          {visa.minimum_processing_days}{visa.maximum_processing_days ? ` - ${visa.maximum_processing_days}` : ''} Days Processing
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-navy-950 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-600/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="heading-md font-heading text-white mb-3">Ready to apply?</h3>
              <p className="text-sm text-navy-300 mb-6">Our experts are ready to guide you through the process.</p>
              <Link to="/contact" className="block w-full py-3.5 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-600/20 text-sm">
                Get Free Consultation
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

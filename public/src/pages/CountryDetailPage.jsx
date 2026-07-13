import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import api from '../api/client';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-navy-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy-900">Country Not Found</h2>
          <Link to="/countries" className="text-accent-600 font-semibold mt-2 inline-block">← Back to Countries</Link>
        </div>
      </div>
    );
  }

  const infoItems = [
    { label: 'Capital', value: country.capital, icon: '🏛️' },
    { label: 'Currency', value: country.currency, icon: '💰' },
    { label: 'Language', value: country.language, icon: '🗣️' },
    { label: 'Time Zone', value: country.time_zone, icon: '🕐' },
    { label: 'Processing', value: country.processing_time, icon: '⏱️' },
    { label: 'Nationality', value: country.nationality, icon: '🌍' },
  ].filter(item => item.value);

  return (
    <>
      {/* Hero */}
      <section className="relative h-80 sm:h-96 overflow-hidden">
        {country.image ? (
          <img src={country.image} alt={country.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Link to="/countries" className="inline-flex items-center gap-2 text-sm text-navy-200 hover:text-white mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
              Back to Countries
            </Link>
            <div className="flex items-center gap-4">
              {country.flag && (
                <img src={country.flag} alt="" className="w-14 h-14 rounded-xl object-cover shadow-lg ring-2 ring-white/20" />
              )}
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">{country.name}</h1>
                {country.short_description && (
                  <p className="text-navy-200 mt-1">{country.short_description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Info Grid */}
        {infoItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {infoItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-4 text-center shadow-navy border border-navy-100/50"
              >
                <span className="text-2xl mb-1 block">{item.icon}</span>
                <span className="text-xs text-navy-500 font-semibold uppercase tracking-wider">{item.label}</span>
                <p className="text-sm font-bold text-navy-900 mt-1">{item.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Description */}
        {country.description && (
          <div className="bg-white rounded-2xl p-8 shadow-navy border border-navy-100/50">
            <h2 className="text-xl font-bold text-navy-900 mb-4 font-heading">About {country.name}</h2>
            <p className="text-navy-700 leading-relaxed whitespace-pre-line">{country.description}</p>
          </div>
        )}

        {/* Available Visas */}
        {visas?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-navy-900 mb-6 font-heading">Available Visas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visas.filter(v => v.is_active).map((visa, i) => (
                <motion.div
                  key={visa.slug || i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/visas/${visa.slug}`}
                    className="block bg-white rounded-2xl p-6 shadow-navy border border-navy-100/50 hover:shadow-navy-lg hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-accent-600 transition-colors">{visa.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {visa.minimum_salary && (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                          From {visa.currency || country.currency} {Number(visa.minimum_salary).toLocaleString()}
                        </span>
                      )}
                      {visa.duration_in_months && (
                        <span className="px-2.5 py-1 bg-navy-50 text-navy-600 text-xs font-bold rounded-full">
                          {visa.duration_in_months} months
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-navy-600 line-clamp-2">{visa.description || 'Click to learn more about this visa option.'}</p>
                    <span className="inline-flex items-center gap-1 text-accent-600 text-sm font-semibold mt-3 group-hover:translate-x-1 transition-transform">
                      View Details
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {requirements?.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-navy border border-navy-100/50">
            <h2 className="text-xl font-bold text-navy-900 mb-6 font-heading">Requirements</h2>
            <div className="space-y-3">
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

        {/* Gallery */}
        {gallery?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-navy-900 mb-6 font-heading">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square rounded-xl overflow-hidden shadow-navy"
                >
                  <img src={img.image} alt={img.caption || ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </motion.div>
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
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-5 pb-4"
                    >
                      <p className="text-sm text-navy-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

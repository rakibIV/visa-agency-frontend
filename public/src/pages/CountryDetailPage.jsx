import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="w-12 h-12 border-4 border-navy-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-soft">
          <h2 className="text-3xl font-black text-navy-900 mb-4">Country Not Found</h2>
          <p className="text-navy-500 mb-6">The destination you are looking for does not exist or has been removed.</p>
          <Link to="/countries" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5">
            ← Back to Destinations
          </Link>
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

  const activeVisas = visas?.filter(v => v.is_active !== false) || [];

  return (
    <div className="bg-navy-50 min-h-screen pb-20">
      {/* Premium Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {country.image ? (
          <img src={country.image} alt={country.name} className="absolute inset-0 w-full h-full object-cover scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
        <div className="absolute inset-0 bg-black/20" /> {/* Extra contrast */}
        
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 pb-16">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Link to="/countries" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-200 hover:text-white mb-6 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                  All Destinations
                </Link>
                <div className="flex items-center gap-5">
                  {country.flag && (
                    <img src={country.flag} alt={`${country.name} Flag`} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20" />
                  )}
                  <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight drop-shadow-lg">
                      {country.name}
                    </h1>
                    {country.short_description && (
                      <p className="text-navy-100 mt-2 text-lg max-w-xl font-medium drop-shadow-md">
                        {country.short_description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12">
        {/* Info Grid */}
        {infoItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {infoItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 text-center shadow-soft border border-white/50 hover:-translate-y-1 transition-transform"
              >
                <span className="text-3xl mb-2 block drop-shadow-sm">{item.icon}</span>
                <span className="text-xs text-navy-400 font-bold uppercase tracking-wider">{item.label}</span>
                <p className="text-base font-bold text-navy-900 mt-1">{item.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area (Left/Center) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {country.description && (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-navy-100">
                <h2 className="text-2xl font-black text-navy-900 mb-6 font-heading flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                  </div>
                  About {country.name}
                </h2>
                <p className="text-navy-700 leading-relaxed whitespace-pre-line text-lg mb-8">{country.description}</p>
                
                {/* Static Trust Block */}
                <div className="border-t border-navy-100 pt-8 mt-8">
                  <h3 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.536a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
                    Why Choose {country.name}?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-navy-50/50 rounded-2xl p-4 border border-navy-50">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl mb-3">🌟</div>
                      <h4 className="font-bold text-navy-900 text-sm mb-1">High Standard of Living</h4>
                      <p className="text-xs text-navy-600 leading-relaxed">Experience world-class healthcare, education, and unparalleled quality of life.</p>
                    </div>
                    <div className="bg-navy-50/50 rounded-2xl p-4 border border-navy-50">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl mb-3">📈</div>
                      <h4 className="font-bold text-navy-900 text-sm mb-1">Career Growth</h4>
                      <p className="text-xs text-navy-600 leading-relaxed">Robust economy offering lucrative opportunities and professional development.</p>
                    </div>
                    <div className="bg-navy-50/50 rounded-2xl p-4 border border-navy-50">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl mb-3">🤝</div>
                      <h4 className="font-bold text-navy-900 text-sm mb-1">Welcoming Culture</h4>
                      <p className="text-xs text-navy-600 leading-relaxed">Join a diverse, multicultural society that embraces international talent.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Available Visas - Premium UI */}
            {activeVisas.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-navy-900 font-heading">Available Visas</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {activeVisas.map((visa, i) => (
                    <motion.div
                      key={visa.slug || i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group"
                    >
                      <Link
                        to={`/visas/${visa.slug}`}
                        className="block bg-white rounded-3xl p-6 shadow-sm hover:shadow-hover border border-navy-100 hover:border-accent-200 transition-all duration-300 transform group-hover:-translate-y-1 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-accent-500 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                        </div>
                        <h3 className="text-xl font-bold text-navy-900 mb-3 group-hover:text-accent-600 transition-colors pr-12">{visa.name}</h3>
                        
                        <div className="space-y-2 mb-4">
                          {visa.minimum_salary && (
                            <div className="flex items-center gap-2 text-sm text-green-700 font-semibold bg-green-50 w-max px-3 py-1.5 rounded-lg">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                              From {visa.currency || country.currency} {Number(visa.minimum_salary).toLocaleString()}
                            </div>
                          )}
                          {visa.duration_in_months && (
                            <div className="flex items-center gap-2 text-sm text-blue-700 font-semibold bg-blue-50 w-max px-3 py-1.5 rounded-lg">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                              {visa.duration_in_months} Months
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-navy-600 line-clamp-2 relative z-10">{visa.description || 'View full program requirements and apply.'}</p>
                        
                        <div className="mt-5 flex items-center justify-between border-t border-navy-50 pt-4 relative z-10">
                          <span className="text-accent-600 font-bold text-sm">Explore Program</span>
                          <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center text-navy-400 group-hover:bg-accent-600 group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {gallery?.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-navy-900 mb-6 font-heading">Destination Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="aspect-square rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer"
                    >
                      <img src={img.image} alt={img.caption || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <p className="text-white text-sm font-semibold truncate">{img.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Static Trust Banner */}
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-3xl p-8 sm:p-10 shadow-lg text-white flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <div className="relative z-10 space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black font-heading">Need help with your application?</h3>
                <p className="text-navy-200 text-lg">Our experts have a 98% success rate for {country.name}.</p>
              </div>
              <div className="relative z-10 shrink-0">
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-600 hover:bg-accent-500 text-white font-black rounded-xl transition-all hover:scale-105 shadow-lg shadow-accent-600/30">
                  Talk to an Expert
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Area (Right) */}
          <div className="space-y-8">
            {/* Requirements */}
            {requirements?.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-navy-100">
                <h2 className="text-xl font-black text-navy-900 mb-6 font-heading flex items-center gap-2">
                  <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  Requirements
                </h2>
                <div className="space-y-5">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center shrink-0 mt-0.5 border border-accent-100">
                        <span className="text-sm font-bold">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-base font-bold text-navy-900 leading-snug">{req.title}</p>
                        {req.description && <p className="text-sm text-navy-500 mt-1.5 leading-relaxed">{req.description}</p>}
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
                  Quick FAQs
                </h2>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border border-navy-100 rounded-2xl overflow-hidden bg-navy-50/30">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-navy-50 transition-colors"
                      >
                        <span className="text-sm font-bold text-navy-900 pr-4">{faq.question}</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${openFaq === i ? 'bg-accent-600 text-white' : 'bg-white text-navy-400 border border-navy-200'}`}>
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
                            <p className="text-sm text-navy-600 leading-relaxed border-t border-navy-100/50 pt-3">{faq.answer}</p>
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

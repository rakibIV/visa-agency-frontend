import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleIcon from '@mui/icons-material/Article';

export default function VisasPage() {
  const { data: visas, isLoading } = useQuery({
    queryKey: ['all-visas'],
    queryFn: () => api.get('/visas/').then(r => r.data.results ?? r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dim">
        <div className="w-12 h-12 border-4 border-navy-100 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  const activeVisas = visas?.filter(v => v.is_active !== false) || [];

  return (
    <div className="bg-surface-dim min-h-screen">
      {/* ═══════════════════════════════════════════
          HERO — Compact Dark Gradient
      ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-navy-950 relative overflow-hidden grain">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        
        {/* Decorative accents */}
        <div className="absolute left-0 top-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container-narrow relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow text-accent-400 mb-4 block">
              Explore Opportunities
            </span>
            <h1 className="display-lg font-heading text-white mb-6">
              Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">Visa Programs</span>
            </h1>
            <p className="body-lg text-navy-300 max-w-2xl mx-auto">
              Discover your pathway to international success with our comprehensive range of specialized visa options and employment programs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          VISAS GRID — Accent Strip Cards
      ═══════════════════════════════════════════ */}
      <section className="section-py">
        <div className="container-wide">
          {activeVisas.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-soft border border-navy-50 max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center text-navy-300 mx-auto mb-6">
                <ArticleIcon fontSize="large" />
              </div>
              <h3 className="heading-md font-heading text-navy-900 mb-2">No Visas Available</h3>
              <p className="text-navy-500">Please check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {activeVisas.map((visa, i) => {
                const countrySlug = visa.country?.slug || visa.country_slug;
                const countryName = visa.country?.name || visa.country_name || 'Destination';
                
                // Determine accent color based on index or category
                const accentColors = ['bg-blue-500', 'bg-accent-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'];
                const accentColor = accentColors[i % accentColors.length];
                
                return (
                  <motion.div
                    key={visa.slug || i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  >
                    <Link
                      to={`/visas/${visa.slug}`}
                      className="group flex flex-col h-full bg-white rounded-3xl shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden relative border border-navy-50 hover:-translate-y-1"
                    >
                      {/* Accent Strip */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${accentColor} transition-all duration-300 group-hover:w-2`} />
                      
                      <div className="p-8 lg:p-10 flex flex-col flex-grow ml-2">
                        {/* Header: Country + Title */}
                        <div className="mb-6 flex-grow">
                          <div className="flex items-center gap-2 mb-4">
                            {visa.country?.flag && (
                              <img src={visa.country.flag} alt="" className="w-6 h-6 rounded-full object-cover shadow-sm" />
                            )}
                            <span className="text-xs font-bold text-navy-500 uppercase tracking-widest">{countryName}</span>
                          </div>
                          <h3 className="heading-md font-heading text-navy-900 group-hover:text-accent-600 transition-colors line-clamp-2">
                            {visa.title}
                          </h3>
                        </div>

                        {/* Details Tags */}
                        <div className="flex flex-wrap gap-2 mb-8">
                          {visa.processing_time && (
                            <span className="px-3 py-1.5 bg-navy-50 text-navy-600 text-xs font-semibold rounded-lg">
                              ⏱ {visa.processing_time}
                            </span>
                          )}
                          {visa.visa_category?.name && (
                            <span className="px-3 py-1.5 bg-navy-50 text-navy-600 text-xs font-semibold rounded-lg">
                              {visa.visa_category.name}
                            </span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center pt-6 border-t border-navy-50 mt-auto">
                          <span className="text-lg font-bold text-navy-900 font-heading">
                            {visa.price ? `$${visa.price}` : 'Consult'}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-navy-50 group-hover:bg-accent-600 text-navy-400 group-hover:text-white flex items-center justify-center transition-colors">
                            <ArrowForwardIcon fontSize="small" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

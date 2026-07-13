import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function VisasPage() {
  const { data: visas, isLoading } = useQuery({
    queryKey: ['all-visas'],
    queryFn: () => api.get('/visas/').then(r => r.data.results ?? r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="w-12 h-12 border-4 border-navy-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  const activeVisas = visas?.filter(v => v.is_active !== false) || [];

  return (
    <>
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-navy-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900 to-navy-950" />
          <div 
            className="absolute inset-0 opacity-[0.05]" 
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} 
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-accent-500/10 text-accent-400 text-sm font-bold tracking-wider uppercase mb-4 border border-accent-500/20">
              Explore Opportunities
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight mb-6">
              Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">Visa Programs</span>
            </h1>
            <p className="text-lg md:text-xl text-navy-200 max-w-2xl mx-auto leading-relaxed">
              Discover your pathway to international success with our comprehensive range of specialized visa options and employment programs.
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute left-0 top-1/4 w-64 h-64 bg-accent-600/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
        <div className="absolute right-0 bottom-1/4 w-64 h-64 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
      </section>

      {/* Visas Grid Section */}
      <section className="py-20 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeVisas.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-navy-100">
              <h3 className="text-xl font-bold text-navy-900 mb-2">No Visas Available</h3>
              <p className="text-navy-500">Please check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeVisas.map((visa, i) => {
                const countrySlug = visa.country?.slug || visa.country_slug;
                const countryName = visa.country?.name || visa.country_name || 'Destination';
                
                return (
                  <motion.div
                    key={visa.slug || i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group"
                  >
                    <Link
                      to={`/visas/${visa.slug}`}
                      className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-hover border border-navy-100/60 transition-all duration-300 transform group-hover:-translate-y-2 relative"
                    >
                      {/* Top Accent Line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-accent-600 mb-1 flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                              </svg>
                              {countryName}
                            </span>
                            <h3 className="text-2xl font-bold text-navy-900 group-hover:text-accent-600 transition-colors font-heading leading-tight">
                              {visa.name}
                            </h3>
                          </div>
                        </div>

                        <p className="text-navy-600 text-sm mb-8 line-clamp-3 leading-relaxed flex-1">
                          {visa.description || 'Explore the requirements and benefits of this visa program. Click to view full details and apply today.'}
                        </p>

                        <div className="space-y-3 mb-8">
                          {visa.minimum_salary && (
                            <div className="flex items-center gap-3 text-sm font-semibold bg-green-50/50 p-3 rounded-xl border border-green-100/50">
                              <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                              </div>
                              <div>
                                <span className="block text-xs text-navy-500 font-medium uppercase tracking-wider">Salary</span>
                                <span className="text-green-700">From {visa.currency || 'USD'} {Number(visa.minimum_salary).toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                          
                          {visa.duration_in_months && (
                            <div className="flex items-center gap-3 text-sm font-semibold bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                              </div>
                              <div>
                                <span className="block text-xs text-navy-500 font-medium uppercase tracking-wider">Duration</span>
                                <span className="text-blue-700">{visa.duration_in_months} Months</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-5 border-t border-navy-100 flex items-center justify-between mt-auto">
                          <span className="text-accent-600 font-bold text-sm">View Full Details</span>
                          <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center group-hover:bg-accent-600 group-hover:text-white text-navy-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
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
    </>
  );
}

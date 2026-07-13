import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import SectionHeading from '../components/ui/SectionHeading';

export default function AboutPage() {
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then(r => {
      const results = r.data.results ?? r.data;
      return Array.isArray(results) ? results[0] : results;
    }),
  });

  const { data: offices, isLoading: officesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches/').then(r => r.data.results ?? r.data),
  });

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-navy-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <section className="gradient-hero pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            About {company?.company_name || 'Us'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-navy-200 text-lg max-w-2xl mx-auto">
            Discover who we are and what drives us to provide world-class visa services.
          </motion.p>
        </div>
      </section>

      <section className="py-20 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-navy-lg border border-navy-100"
          >
            {company?.about ? (
              <div className="prose prose-navy max-w-none text-navy-700 leading-relaxed whitespace-pre-line text-lg">
                {company.about}
              </div>
            ) : (
              <p className="text-navy-500 text-center text-lg py-10">Welcome to our agency. We are dedicated to providing excellent service.</p>
            )}
            
            {(company?.mission || company?.vision) && (
              <div className="grid sm:grid-cols-2 gap-8 mt-12 pt-12 border-t border-navy-100">
                {company.mission && (
                  <div>
                    <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600 mb-5">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-3">Our Mission</h3>
                    <p className="text-navy-600 leading-relaxed text-sm whitespace-pre-line">{company.mission}</p>
                  </div>
                )}
                {company.vision && (
                  <div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-5">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-3">Our Vision</h3>
                    <p className="text-navy-600 leading-relaxed text-sm whitespace-pre-line">{company.vision}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-20 bg-navy-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Our Offices" subtitle="Visit us at any of our global branches for expert consultation." />
          
          {officesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="bg-white h-48 rounded-2xl animate-pulse shadow-sm" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offices?.filter(o => o.is_active).map((office, i) => (
                <motion.div
                  key={office.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-navy border border-navy-100 hover:shadow-navy-lg transition-all group relative overflow-hidden"
                >
                  {office.is_head_office && (
                    <div className="absolute top-4 right-4 bg-accent-100 text-accent-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                      Head Office
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-navy-900 mb-4 pr-20">{office.branch_name}</h3>
                  <div className="space-y-3 text-sm">
                    {office.phone && (
                      <div className="flex items-start gap-3 text-navy-600">
                        <svg className="w-5 h-5 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                        {office.phone}
                      </div>
                    )}
                    {office.email && (
                      <div className="flex items-start gap-3 text-navy-600">
                        <svg className="w-5 h-5 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                        {office.email}
                      </div>
                    )}
                    {office.address && (
                      <div className="flex items-start gap-3 text-navy-600">
                        <svg className="w-5 h-5 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                        {office.address}
                      </div>
                    )}
                    {office.office_hours && (
                      <div className="flex items-start gap-3 text-navy-600 mt-4 pt-3 border-t border-navy-50">
                        <svg className="w-5 h-5 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        <span className="font-medium text-navy-700">{office.office_hours}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

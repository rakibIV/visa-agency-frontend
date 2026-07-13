import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function ContactPage() {
  const { data: company, isLoading } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then(r => {
      const results = r.data.results ?? r.data;
      return Array.isArray(results) ? results[0] : results;
    }),
  });

  if (isLoading) {
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
            Get in Touch
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-navy-200 text-lg max-w-xl mx-auto">
            We are here to help and answer any question you might have. We look forward to hearing from you.
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
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {company?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-navy-50 text-accent-600 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-1">Phone</p>
                        <a href={`tel:${company.phone}`} className="text-lg font-bold text-navy-900 hover:text-accent-600 transition-colors">{company.phone}</a>
                      </div>
                    </div>
                  )}

                  {company?.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-navy-50 text-accent-600 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-1">Email</p>
                        <a href={`mailto:${company.email}`} className="text-lg font-bold text-navy-900 hover:text-accent-600 transition-colors break-all">{company.email}</a>
                      </div>
                    </div>
                  )}

                  {company?.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-navy-50 text-accent-600 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-1">Head Office</p>
                        <p className="text-base font-medium text-navy-800 leading-relaxed">{company.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Form Placeholder */}
              <div className="bg-navy-50 rounded-2xl p-6 border border-navy-100 flex flex-col justify-center text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                   <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.43 3 11.996c0 2.29.98 4.346 2.553 5.823l.11.103.01.009.009.011c.14.148.243.344.298.544.137.5.337 1.488.75 2.923A.75.75 0 0 0 7.42 22c1.684 0 2.95-.5 3.753-1.077l.115-.084c.15-.113.333-.166.516-.145a9.664 9.664 0 0 0 1.254.12h.024Z" />
                   </svg>
                 </div>
                 <h3 className="text-lg font-bold text-navy-900 mb-2">Send us a message</h3>
                 <p className="text-sm text-navy-600 mb-6">
                   Reach out to us via email or phone for any inquiries regarding visa processing, status updates, or general information.
                 </p>
                 {company?.email && (
                   <a href={`mailto:${company.email}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl shadow-md transition-all">
                     Email Us Now
                   </a>
                 )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

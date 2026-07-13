import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import SectionHeading from '../components/ui/SectionHeading';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export default function NoticesPage() {
  const { data: notices, isLoading } = useQuery({
    queryKey: ['public-notices'],
    queryFn: () => api.get('/notices/').then(r => r.data.results ?? r.data),
  });

  return (
    <>
      <section className="gradient-hero pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
              <CampaignIcon fontSize="large" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Announcements & Notices
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-navy-200 text-lg max-w-xl mx-auto">
            Stay updated with the latest news, policy changes, and important information regarding your visa processes.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-[#FDFDFD]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-32 animate-pulse shadow-sm border border-navy-50" />
              ))}
            </div>
          ) : notices?.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-navy-100 border-dashed">
              <AssignmentTurnedInIcon sx={{ fontSize: 48 }} className="text-navy-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-2">No Notices Available</h3>
              <p className="text-navy-500">There are no active announcements at this time. Please check back later.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {notices?.map((notice, i) => (
                <motion.div
                  key={notice.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-card border border-navy-50 transition-all duration-300 relative overflow-hidden group"
                >
                  {notice.is_pinned && (
                    <div className="absolute top-0 right-0 bg-accent-500 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-bl-xl shadow-sm z-10 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Pinned
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-400 flex items-center justify-center shrink-0 border border-navy-100 group-hover:bg-navy-900 group-hover:text-white group-hover:border-navy-900 transition-colors">
                      <CampaignIcon />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy-900 mb-2">{notice.title}</h3>
                      <p className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-4">
                        Posted on: {new Date(notice.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      
                      {notice.content && (
                        <div className="prose prose-sm prose-navy text-navy-600 max-w-none mb-4">
                          <p>{notice.content}</p>
                        </div>
                      )}
                      
                      {notice.attachment && (
                        <a 
                          href={notice.attachment} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-navy-50 hover:bg-navy-100 text-navy-700 text-sm font-bold rounded-lg transition-colors border border-navy-100"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View Attachment
                        </a>
                      )}
                    </div>
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

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Pagination from '../components/common/Pagination';
import { motion } from 'framer-motion';
import api from '../api/client';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export default function NoticesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['public-notices', page],
    queryFn: () => api.get('/notices/', { params: { page } }).then(r => r.data),
    keepPreviousData: true,
  });

  const notices = data?.results ?? data ?? [];
  const totalPages = data?.count ? Math.ceil(data.count / 20) : 1;

  return (
    <div className="bg-surface-dim min-h-screen pb-24">
      {/* ═══════════════════════════════════════════
          HERO — Minimal Header
      ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-white border-b border-navy-50 relative overflow-hidden grain">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-50 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="container-narrow relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center text-accent-600 border border-navy-100 shadow-soft">
              <CampaignIcon fontSize="large" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="display-lg font-heading text-navy-900 mb-4">
            Notices & Updates
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="body-lg text-navy-500 max-w-xl mx-auto">
            Stay updated with the latest news, policy changes, and important information regarding your visa processes.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          NOTICES LIST — Clean Timeline/List
      ═══════════════════════════════════════════ */}
      <section className="container-narrow mt-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-40 animate-pulse shadow-soft border border-navy-50" />
              ))}
            </div>
          ) : notices?.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-navy-50 shadow-soft">
              <AssignmentTurnedInIcon sx={{ fontSize: 48 }} className="text-navy-300 mx-auto mb-4" />
              <h3 className="heading-md font-heading text-navy-900 mb-2">No Notices Available</h3>
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
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft hover:shadow-card border border-navy-50 transition-all duration-300 relative overflow-hidden group"
                >
                  {notice.is_pinned && (
                    <div className="absolute top-0 right-0 bg-accent-50 text-accent-600 text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-bl-2xl z-10 flex items-center gap-1.5 border-b border-l border-accent-100">
                      <span className="w-1.5 h-1.5 bg-accent-600 rounded-full animate-pulse" /> Pinned
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 relative z-10">
                    {/* Date/Icon Column */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-400 flex items-center justify-center border border-navy-100 group-hover:bg-accent-600 group-hover:text-white group-hover:border-accent-600 transition-colors mb-2">
                        <CampaignIcon />
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="text-xs font-bold text-navy-900">
                          {new Date(notice.created_at).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-black text-navy-900 font-heading leading-none">
                          {new Date(notice.created_at).getDate()}
                        </div>
                        <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">
                          {new Date(notice.created_at).getFullYear()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Column */}
                    <div className="flex-grow pt-1">
                      <div className="sm:hidden text-xs font-bold text-navy-500 uppercase tracking-widest mb-2">
                        {new Date(notice.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <h3 className="heading-md font-heading text-navy-900 mb-4">{notice.title}</h3>
                      
                      {notice.content && (
                        <div className="prose prose-sm text-navy-600 max-w-none mb-6">
                          <p>{notice.content}</p>
                        </div>
                      )}
                      
                      {notice.attachment && (
                        <a 
                          href={notice.attachment} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-50 hover:bg-navy-100 text-navy-700 text-sm font-bold rounded-xl transition-colors border border-navy-100 hover:border-navy-200 w-fit"
                        >
                          <svg className="w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          
          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}

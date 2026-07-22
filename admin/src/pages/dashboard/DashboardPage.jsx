import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  ArrowUturnLeftIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChevronRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import api from '../../api/client';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function StatCard({ label, value, sub, Icon, bg, iconColor, to }) {
  const CardContent = (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/80 group h-full"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl transition-all group-hover:scale-150 ${bg}`}></div>
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{value}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium bg-slate-100/50 inline-block px-2 py-0.5 rounded-md">{sub}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm border border-slate-50 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  return to ? <Link to={to} className="block">{CardContent}</Link> : CardContent;
}

const QUICK_ACTIONS = [
  { label: 'New Applicant', desc: 'Create profile', Icon: UserPlusIcon, to: '/applicants/new', bg: 'from-blue-600 via-blue-700 to-indigo-800', shadow: 'shadow-blue-500/30' },
  { label: 'Monthly Slots', desc: 'Manage calendar', Icon: CalendarDaysIcon, to: '/slots', bg: 'from-violet-600 via-purple-600 to-fuchsia-700', shadow: 'shadow-violet-500/30' },
  { label: 'Refunds Hub', desc: 'Process returns', Icon: ArrowUturnLeftIcon, to: '/refunds', bg: 'from-orange-500 via-orange-600 to-red-600', shadow: 'shadow-orange-500/30' },
  { label: 'Agreements', desc: 'Legal docs', Icon: DocumentTextIcon, to: '/agreements', bg: 'from-emerald-500 via-emerald-600 to-teal-700', shadow: 'shadow-emerald-500/30' },
];

export default function DashboardPage() {
  // Fetch all statuses to identify approved/rejected UUIDs
  const { data: statuses } = useQuery({
    queryKey: ['dash-statuses'],
    queryFn: () => api.get('/application-statuses/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 15,
  });

  const approvedId = statuses?.find(s => s.slug === 'approved' || s.name?.toLowerCase() === 'approved')?.id;
  const rejectedId = statuses?.find(s => s.slug?.includes('reject') || s.name?.toLowerCase().includes('reject'))?.id;

  // Total applicants
  const { data: allData, isLoading: loadingAll } = useQuery({
    queryKey: ['dash-total'],
    queryFn: () => api.get('/applicants/', { params: { page_size: 1 } }).then(r => r.data),
    staleTime: 1000 * 60 * 3,
  });

  // Approved count
  const { data: approvedData, isLoading: loadingApproved } = useQuery({
    queryKey: ['dash-approved', approvedId],
    queryFn: () => api.get('/applicants/', { params: { status: approvedId, page_size: 1 } }).then(r => r.data),
    enabled: !!approvedId,
    staleTime: 1000 * 60 * 3,
  });

  // Rejected count
  const { data: rejectedData, isLoading: loadingRejected } = useQuery({
    queryKey: ['dash-rejected', rejectedId],
    queryFn: () => api.get('/applicants/', { params: { status: rejectedId, page_size: 1 } }).then(r => r.data),
    enabled: !!rejectedId,
    staleTime: 1000 * 60 * 3,
  });

  // Recent Applicants (for Action Required)
  const { data: recentApplicants } = useQuery({
    queryKey: ['dash-recent'],
    queryFn: () => api.get('/applicants/', { params: { page_size: 6 } }).then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 3,
  });

  // Pending Soft Applications (Leads)
  const { data: pendingRequests } = useQuery({
    queryKey: ['dash-pending-requests'],
    queryFn: () => api.get('/application-requests/', { params: { status: 'PENDING', page_size: 5 } }).then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 3,
  });

  // Current Month Data
  const { data: currentMonthResults } = useQuery({
    queryKey: ['dash-current-month-results'],
    queryFn: () => api.get('/public/applicant-results/current-month/').then(r => r.data).catch(() => []),
    staleTime: 1000 * 60 * 3,
  });

  const { data: currentMonthSlots } = useQuery({
    queryKey: ['dash-current-month-slots'],
    queryFn: () => api.get('/public/staff-slots/current-month/').then(r => r.data).catch(() => []),
    staleTime: 1000 * 60 * 3,
  });

  const monthApprovedCount = currentMonthResults?.filter(r => r.status_name?.toLowerCase().includes('approve'))?.length || 0;
  const monthRejectedCount = currentMonthResults?.filter(r => r.status_name?.toLowerCase().includes('reject'))?.length || 0;
  const monthSlotsPreview = currentMonthSlots?.slice(0, 3) || [];

  const total = loadingAll ? '...' : (allData?.count ?? allData?.length ?? '—');
  const approved = loadingApproved || !approvedId ? '—' : (approvedData?.count ?? approvedData?.length ?? 0);
  const rejected = loadingRejected || !rejectedId ? '—' : (rejectedData?.count ?? rejectedData?.length ?? 0);

  // In progress = total - approved - rejected
  let inProgress = '—';
  if (typeof total === 'number' && typeof approved === 'number' && typeof rejected === 'number') {
    inProgress = total - approved - rejected;
  }

  const stats = [
    { label: 'Total Applicants', value: total, sub: 'All time registrations', Icon: UsersIcon, bg: 'bg-blue-500', iconColor: 'text-blue-600', to: '/applicants' },
    { label: 'Visa Approved', value: approved, sub: 'Successfully completed', Icon: CheckBadgeIcon, bg: 'bg-emerald-500', iconColor: 'text-emerald-600', to: approvedId ? `/applicants?status=${approvedId}` : '/applicants' },
    { label: 'Visa Rejected', value: rejected, sub: 'Final rejection status', Icon: XCircleIcon, bg: 'bg-red-500', iconColor: 'text-red-600', to: rejectedId ? `/applicants?status=${rejectedId}` : '/applicants' },
    { label: 'In Progress', value: inProgress, sub: 'Currently processing', Icon: ClockIcon, bg: 'bg-amber-500', iconColor: 'text-amber-500', to: '/applicants' },
  ];

  const storedUser = localStorage.getItem('user');
  const username = storedUser ? JSON.parse(storedUser).username : 'Admin';

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
      {/* Hero Greeting Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0d1f4e] via-[#1a3673] to-[#244b9e] p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 blur-[100px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-400 opacity-10 blur-[80px] rounded-full pointer-events-none transform -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-black tracking-tight mb-2"
            >
              Welcome back, <span className="text-blue-300">{username}</span> 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-blue-100/80 text-base font-medium max-w-xl"
            >
              Here's an overview of your agency's performance and pending tasks today. Keep up the great work!
            </motion.p>
          </div>
          
          {/* Current Month Highlights Card inside Hero */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="flex gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0"
          >
            <div>
              <p className="text-xs text-blue-200 font-medium uppercase tracking-wider mb-1">Month Approvals</p>
              <p className="text-2xl font-bold text-white">{monthApprovedCount}</p>
            </div>
            <div className="w-px bg-white/20"></div>
            <div>
              <p className="text-xs text-blue-200 font-medium uppercase tracking-wider mb-1">Month Rejections</p>
              <p className="text-2xl font-bold text-white">{monthRejectedCount}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Action Required */}
        <div className="lg:col-span-8 space-y-6">
          
          <motion.div variants={container} initial="hidden" animate="show" className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Action Required</h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Recent applicants waiting for your attention</p>
              </div>
              <Link to="/applicants" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                View All <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentApplicants?.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <DocumentTextIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">No recent applications.</p>
                </div>
              ) : (
                recentApplicants?.map((app, i) => (
                  <motion.div 
                    variants={fadeUp}
                    key={app.id} 
                    className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm transition-all gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-base shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-700 transition-colors">
                        {app.full_name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-900 transition-colors truncate">{app.full_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md tracking-wide truncate max-w-[80px] sm:max-w-none">
                            {app.visa_name || 'No Visa'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                          <span className="text-[12px] text-slate-500 font-medium truncate">
                            {app.status_name || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/applicants/${app.id}`} className="shrink-0 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 sm:px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all">
                      Review
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Pending Soft Applications */}
          <motion.div variants={container} initial="hidden" animate="show" className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Pending Soft Applications</h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Leads awaiting your review</p>
              </div>
              <Link to="/website/application-requests" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                View All <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {pendingRequests?.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <DocumentTextIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">No pending leads right now.</p>
                </div>
              ) : (
                pendingRequests?.map((req, i) => (
                  <motion.div 
                    variants={fadeUp}
                    key={req.id} 
                    className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-500 font-black text-base shrink-0 group-hover:from-indigo-200 group-hover:to-indigo-300 group-hover:text-indigo-800 transition-colors">
                        {req.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-900 transition-colors truncate">{req.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md tracking-wide truncate max-w-[120px] sm:max-w-none">
                            {req.target_visa_name ? `${req.target_country_name} - ${req.target_visa_name}` : 'General Inquiry'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                          <span className="text-[12px] text-slate-500 font-medium truncate">
                            {req.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to="/website/application-requests" className="shrink-0 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all">
                      Review
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Quick Actions & Slots Preview */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions Grid */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {QUICK_ACTIONS.map((a, i) => (
              <Link key={a.label} to={a.to}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden flex items-center gap-3 p-4 rounded-2xl text-white bg-gradient-to-r ${a.bg} shadow-md ${a.shadow} cursor-pointer group h-full`}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                    <a.Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{a.label}</h4>
                    <p className="text-[10px] font-medium text-white/80 mt-0.5">{a.desc}</p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 ml-auto text-white/50 group-hover:text-white transition-colors" />
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* Current Month Slots Preview */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="flex items-center gap-2 mb-4">
               <CalendarIcon className="w-5 h-5 text-blue-600" />
               <h4 className="text-sm font-bold text-slate-800">Current Month Slots</h4>
             </div>
             
             {monthSlotsPreview.length === 0 ? (
               <p className="text-xs text-slate-500 font-medium">No slots scheduled for this month.</p>
             ) : (
               <div className="space-y-3">
                 {monthSlotsPreview.map((slot, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                     <div>
                       <p className="text-xs font-bold text-slate-700">{slot.staff_name || 'Staff'}</p>
                       <p className="text-[10px] font-medium text-slate-500 mt-0.5">{slot.designation || 'Agent'}</p>
                     </div>
                     <div className="text-right">
                       <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg uppercase">
                         {slot.month_name || 'Active'}
                       </span>
                     </div>
                   </div>
                 ))}
                 <Link to="/slots" className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 mt-2">
                   View all slots →
                 </Link>
               </div>
             )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}

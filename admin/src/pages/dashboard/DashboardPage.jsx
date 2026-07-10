import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  ArrowUturnLeftIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/client';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function StatCard({ label, value, sub, Icon, bg, iconColor }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4"
    >
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-slate-800 mt-1">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{sub}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </motion.div>
  );
}

const QUICK_ACTIONS = [
  { label: 'New Applicant', Icon: UserPlusIcon, to: '/applicants/new', color: 'from-blue-600 to-blue-700' },
  { label: 'Monthly Slots', Icon: CalendarDaysIcon, to: '/slots', color: 'from-violet-600 to-violet-700' },
  { label: 'Refunds Hub', Icon: ArrowUturnLeftIcon, to: '/refunds', color: 'from-orange-500 to-orange-600' },
  { label: 'Agreements', Icon: DocumentCheckIcon, to: '/agreements', color: 'from-emerald-500 to-emerald-600' },
];

export default function DashboardPage() {
  // Fetch all statuses to identify approved/rejected UUIDs
  const { data: statuses } = useQuery({
    queryKey: ['dashboard-statuses'],
    queryFn: () => api.get('/application-statuses/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  // Derive status UUIDs
  const approvedId = statuses?.find(s => s.slug === 'approved' || s.name?.toLowerCase() === 'approved')?.id;
  const rejectedId = statuses?.find(s => s.slug === 'rejected' || s.name?.toLowerCase() === 'rejected')?.id;

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
    queryFn: () => api.get('/applicants/', { params: { page_size: 5 } }).then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 3,
  });

  const total = loadingAll ? '...' : (allData?.count ?? allData?.length ?? '—');
  const approved = loadingApproved || !approvedId ? '—' : (approvedData?.count ?? approvedData?.length ?? 0);
  const rejected = loadingRejected || !rejectedId ? '—' : (rejectedData?.count ?? rejectedData?.length ?? 0);

  // In progress = total - approved - rejected
  let inProgress = '—';
  if (typeof total === 'number' && typeof approved === 'number' && typeof rejected === 'number') {
    inProgress = total - approved - rejected;
  }

  const stats = [
    { label: 'Total Applicants', value: total, sub: 'All time', Icon: UsersIcon, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Visa Approved', value: approved, sub: 'Final status', Icon: CheckCircleIcon, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Visa Rejected', value: rejected, sub: 'Final status', Icon: XCircleIcon, bg: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'In Progress', value: inProgress, sub: 'Awaiting decision', Icon: ClockIcon, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  const storedUser = localStorage.getItem('user');
  const username = storedUser ? JSON.parse(storedUser).username : 'Admin';

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Welcome back, {username} 👋</h2>
        <p className="text-slate-400 text-sm mt-0.5">Here's what's happening in your visa agency today.</p>
      </div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Action Required */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <motion.div variants={container} initial="hidden" animate="show" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.label} to={a.to}>
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex flex-col items-center justify-center gap-2.5 py-5 px-4 rounded-xl text-white text-sm font-semibold bg-gradient-to-br ${a.color} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <a.Icon className="w-6 h-6" />
                    {a.label}
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Action Required Ledger */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Required</p>
              <Link to="/applicants" className="text-xs font-bold text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            <div className="space-y-3">
              {recentApplicants?.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No recent applications.</p>
              ) : (
                recentApplicants?.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0">
                        {app.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{app.full_name}</p>
                        <p className="text-xs text-slate-500">{app.visa_name || 'No Visa Assigned'} • {app.status_name || 'Pending'}</p>
                      </div>
                    </div>
                    <Link to={`/applicants/${app.id}`} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      Review
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Widgets */}
        <div className="space-y-6">
          {/* Recent Agreements Status */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 shadow-sm text-white">
            <div className="flex items-center gap-2 mb-4">
              <DocumentCheckIcon className="w-5 h-5 text-emerald-200" />
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Agreements</p>
            </div>
            <p className="text-sm text-emerald-50 leading-relaxed mb-4">
              Track and manage legal documents for all active applicants. Ensure agreements are printed after the first payment.
            </p>
            <Link to="/agreements" className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl transition-colors">
              Manage Agreements
            </Link>
          </div>

          {/* Refunds Quick Access */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-sm text-white">
            <div className="flex items-center gap-2 mb-4">
              <CurrencyDollarIcon className="w-5 h-5 text-orange-200" />
              <p className="text-xs font-bold text-orange-100 uppercase tracking-wider">Financial</p>
            </div>
            <p className="text-sm text-orange-50 leading-relaxed mb-4">
              Access the Refunds Ledger to process returns via Bank Transfer, Cash, or Cheque securely.
            </p>
            <Link to="/refunds" className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl transition-colors">
              Open Refunds Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

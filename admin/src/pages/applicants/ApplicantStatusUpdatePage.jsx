import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  processing: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  approved:   'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  rejected:   'bg-red-100 text-red-600 ring-1 ring-red-200',
  cancelled:  'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
};
import toast from 'react-hot-toast';
import api from '../../api/client';
import { parseApiError } from '../../utils/errorParser';
import Pagination from '../../components/common/Pagination';

export default function ApplicantStatusUpdatePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Fetch all statuses for the filter dropdown
  const { data: statuses } = useQuery({
    queryKey: ['application-statuses'],
    queryFn: () => api.get('/application-statuses/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 15,
  });

  // Fetch applicants
  const { data, isLoading, isError } = useQuery({
    queryKey: ['applicants-status-update', search, statusFilter, page],
    queryFn: () => api.get('/applicants/', { 
      params: { 
        page,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {})
      } 
    }).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });

  const applicants = data?.results ?? data ?? [];
  const totalPages = data?.count ? Math.ceil(data.count / 20) : 1;

  // Mutation to quickly update an applicant's status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statusId }) => api.patch(`/applicants/${id}/change-status/`, { new_status: statusId, send_email: true }),
    onSuccess: () => {
      toast.success('Status updated successfully!');
      queryClient.invalidateQueries(['applicants-status-update']);
      queryClient.invalidateQueries(['applicants']); // Also invalidate main applicants page
    },
    onError: (err) => toast.error(parseApiError(err)),
  });

  const handleStatusChange = (applicantId, newStatusId) => {
    if (!newStatusId) return;
    updateStatusMutation.mutate({ id: applicantId, statusId: newStatusId });
  };

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quick Status Update</h2>
          <p className="text-slate-400 text-sm mt-0.5">Rapidly manage and update applicant statuses</p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, passport, or application no..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <FunnelIcon className="w-4 h-4 text-slate-400 mr-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-sm font-semibold text-slate-600 focus:outline-none focus:ring-0 pr-4"
          >
            <option value="">All Statuses</option>
            {statuses?.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm mt-3">Loading applicants...</p>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400 text-sm">Failed to load applicants.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">App ID</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Applicant Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Passport</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applicants.map((applicant, i) => (
                  <motion.tr
                    key={applicant.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 font-semibold">
                      {applicant.application_id || `#${applicant.id?.slice(0, 8)}`}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                          {applicant.photo ? (
                            <img src={applicant.photo} alt={applicant.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <Link to={`/applicants/${applicant.id}`} className="font-bold text-slate-800 hover:text-blue-700 hover:underline">
                            {applicant.full_name}
                          </Link>
                          <p className="text-xs text-slate-400">{applicant.phone_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600 font-semibold">{applicant.passport_number}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${STATUS_STYLES[applicant.status_name?.toLowerCase()] || STATUS_STYLES.pending}`}>
                        {applicant.status_name || 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 relative">
                       {updateStatusMutation.isPending && updateStatusMutation.variables?.id === applicant.id ? (
                         <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                           <ArrowPathIcon className="w-4 h-4 animate-spin" />
                           Updating...
                         </div>
                       ) : (
                        <select
                          value={applicant.status || ''}
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                          className="w-full max-w-[200px] border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" disabled>Select Status...</option>
                          {statuses?.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                       )}
                    </td>
                  </motion.tr>
                ))}
                {applicants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No applicants found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
}

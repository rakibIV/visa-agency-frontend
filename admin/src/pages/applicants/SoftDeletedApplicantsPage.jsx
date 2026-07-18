import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  processing: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  approved:   'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  rejected:   'bg-red-100 text-red-600 ring-1 ring-red-200',
  cancelled:  'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
};

export default function SoftDeletedApplicantsPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: applicantsResponse, isLoading, isError } = useQuery({
    queryKey: ['deleted-applicants', search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      // Backend action endpoint is /applicants/deleted/
      return api.get(`/applicants/deleted/?${params.toString()}`).then(r => r.data);
    },
  });

  const applicants = applicantsResponse?.results || applicantsResponse || [];

  const restoreMutation = useMutation({
    mutationFn: (id) => api.post(`/applicants/${id}/restore/`),
    onSuccess: () => {
      toast.success('Applicant restored successfully!');
      queryClient.invalidateQueries(['deleted-applicants']);
      queryClient.invalidateQueries(['applicants']);
    },
    onError: (err) => {
      toast.error('Failed to restore applicant: ' + (err.response?.data?.detail || err.message));
    }
  });

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Deleted Applicants</h1>
          <p className="text-slate-500 text-sm mt-1">Review and restore soft-deleted applicants</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, passport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm mt-3">Loading deleted applicants...</p>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400 text-sm">Failed to load deleted applicants.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['App ID', 'Applicant', 'Passport', 'Visa / Destination', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
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
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden opacity-75 grayscale">
                          {applicant.photo ? (
                            <img src={applicant.photo} alt={applicant.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-700">
                          {applicant.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs font-semibold">
                      {applicant.passport_number || '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-700 text-xs font-medium">
                      {applicant.visa_name || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[applicant.status_name?.toLowerCase()] || STATUS_STYLES.pending}`}>
                        {applicant.status_name || 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to restore this applicant?')) {
                            restoreMutation.mutate(applicant.id);
                          }
                        }}
                        disabled={restoreMutation.isPending && restoreMutation.variables === applicant.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition disabled:opacity-50"
                      >
                        <ArrowUturnLeftIcon className="w-4 h-4" /> Restore
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {applicants.length === 0 && (
              <div className="py-20 text-center text-slate-400">
                <UserIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No deleted applicants found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

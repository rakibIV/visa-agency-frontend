import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/client';

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  processing: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  approved:   'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  rejected:   'bg-red-100 text-red-600 ring-1 ring-red-200',
  cancelled:  'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
};

export default function ApplicantsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['applicants', search],
    queryFn: () => api.get('/applicants/', { params: search ? { search } : {} }).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });

  const applicants = data?.results ?? data ?? [];

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Applicants</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage all visa applicants</p>
        </div>
        <Link to="/applicants/new">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold shadow hover:bg-blue-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            New Applicant
          </motion.button>
        </Link>
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
        <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors font-medium">
          <FunnelIcon className="w-4 h-4" />
          Filter
        </button>
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
                  {['App ID', 'Applicant', 'Passport', 'Visa / Destination', 'Status', 'Assigned Staff', 'Actions'].map((h) => (
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
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                          {applicant.photo ? (
                            <img src={applicant.photo} alt={applicant.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        {/* Applicant name is a direct anchor to their profile */}
                        <Link
                          to={`/applicants/${applicant.id}`}
                          className="font-semibold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
                        >
                          {applicant.full_name}
                        </Link>
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
                    <td className="px-5 py-4 text-slate-600 text-xs font-medium">
                      {applicant.assigned_staff_name || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/applicants/${applicant.id}/edit`}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors inline-block"
                        title="Edit"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {applicants.length === 0 && (
              <div className="py-20 text-center text-slate-400">
                <UserIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No applicants found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

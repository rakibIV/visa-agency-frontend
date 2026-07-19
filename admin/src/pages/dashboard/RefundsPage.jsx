import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowUturnLeftIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import Pagination from '../../components/common/Pagination';

const STATUS_COLORS = {
  rejected: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  approved: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  processing: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'payment confirmed': 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
  'profile created': 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200',
};

function getStatusColor(statusName) {
  if (!statusName) return 'bg-slate-100 text-slate-600';
  return STATUS_COLORS[statusName.toLowerCase()] ?? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
}

export default function RefundsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Fetch applicants — search is backend-handled
  const { data, isLoading } = useQuery({
    queryKey: ['refund-applicants', searchTerm, page],
    queryFn: () =>
      api.get('/applicants/', { params: { page, search: searchTerm || undefined } })
        .then(r => r.data),
  });

  const applicants = data?.results ?? data ?? [];
  const totalPages = data?.count ? Math.ceil(data.count / 20) : 1;

  // When no search: show applicants whose status name contains "rejected" or "refund"
  // When searching: show all results
  const filteredApplicants = applicants?.filter(a => {
    if (searchTerm) return true;
    const statusName = (a.status_name || a.status?.name || '').toLowerCase();
    return statusName.includes('reject') || statusName.includes('refund');
  });

  const hasResults = filteredApplicants && filteredApplicants.length > 0;

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <ArrowUturnLeftIcon className="w-7 h-7 text-orange-500" />
            Refund Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View rejected applicants and process refunds. By default shows rejected / refund-status applicants.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, passport, or Application ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Visa / Job</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Refund Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-sm text-slate-400">
                    Loading records…
                  </td>
                </tr>
              ) : !hasResults ? (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center">
                    <BanknotesIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No applicants found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {searchTerm
                        ? 'No results for that search term.'
                        : 'No rejected or refund-status applicants at the moment.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app) => {
                  const statusName = app.status_name || app.status?.name || 'Unknown';
                  const isRejected = statusName.toLowerCase().includes('reject');
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Applicant — name is a clickable anchor to their profile */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {app.photo ? (
                            <img src={app.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-sm border border-orange-100">
                              {app.full_name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            {/* NAME AS ANCHOR LINK */}
                            <Link
                              to={`/applicants/${app.id}`}
                              className="text-sm font-bold text-blue-700 hover:text-orange-600 hover:underline transition-colors"
                            >
                              {app.full_name}
                            </Link>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              {app.application_id} · {app.passport_number}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700 font-medium">{app.visa_name || '—'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{app.job_name || ''}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(statusName)}`}>
                          {statusName}
                        </span>
                      </td>

                      {/* Action column — direct link to the Refunds tab */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/applicants/${app.id}?tab=refunds`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm border
                            ${isRejected
                              ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-orange-200 hover:text-orange-600'
                            }`}
                        >
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                          {isRejected ? 'Process Refund' : 'View Refunds'}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
}

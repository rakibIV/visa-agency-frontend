import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserIcon,
  CalendarDaysIcon,
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
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000 * 60); // update every minute
    return () => clearInterval(timer);
  }, []);

  // Fetch all statuses for the filter dropdown
  const { data: statuses } = useQuery({
    queryKey: ['application-statuses', 'v2'],
    queryFn: () => api.get('/application-statuses/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 15,
  });

  // Fetch applicants
  const { data, isLoading, isError } = useQuery({
    queryKey: ['applicants-status-update', search, statusFilter, page],
    queryFn: () => api.get('/applicants/', { 
      params: { 
        page,
        ordering: '-updated_at',
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
    onSuccess: (res, variables) => {
      toast.success('Status updated successfully!');
      setRecentlyUpdated((prev) => ({
        ...prev,
        [variables.id]: Date.now(),
      }));
      queryClient.invalidateQueries(['applicants-status-update']);
      queryClient.invalidateQueries(['applicants']); // Also invalidate main applicants page
    },
    onError: (err) => toast.error(parseApiError(err)),
  });

  // Mutation to reset a rejected applicant
  const resetApplicantMutation = useMutation({
    mutationFn: (applicantId) => api.post(`/applicants/${applicantId}/reset/`),
    onSuccess: () => {
      toast.success('Applicant profile reset successfully! Financials & agreements cleared.');
      queryClient.removeQueries();
      queryClient.invalidateQueries();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    },
    onError: (err) => toast.error(parseApiError(err)),
  });

  const isPaymentStatus = (status) => {
    if (!status) return null;
    const name = (status.name || '').toLowerCase();
    const slug = (status.slug || '').toLowerCase();
    if (name.includes('1st payment') || slug.includes('1st-payment') || name.includes('first payment')) {
      return { type: 'INITIAL', label: '1st Payment', lockReason: 'Requires 1st Payment' };
    }
    if (name.includes('2nd payment') || slug.includes('2nd-payment') || name.includes('second payment')) {
      return { type: 'SECOND', label: '2nd Payment', lockReason: 'Requires 2nd Payment' };
    }
    if (name.includes('payment confirmed') || slug.includes('payment-confirmed')) {
      return { type: 'CONFIRMED', label: 'Payment Confirmed', lockReason: 'Requires All Payments' };
    }
    return null;
  };

  const handleStatusChange = (applicantId, newStatusId) => {
    if (!newStatusId) return;

    const targetStatus = statuses?.find(s => String(s.id) === String(newStatusId));
    const applicant = applicants.find(a => String(a.id) === String(applicantId));

    if (targetStatus && applicant) {
      const pInfo = isPaymentStatus(targetStatus);
      if (pInfo) {
        const hasInitial = Boolean(applicant.has_initial_payment || (applicant.paid_installments || []).includes('INITIAL'));
        const hasSecond = Boolean(applicant.has_second_payment || (applicant.paid_installments || []).includes('SECOND'));
        const isConfirmed = Boolean(applicant.is_payment_confirmed);

        if (pInfo.type === 'INITIAL' && !hasInitial) {
          toast.error(
            `⚠️ Cannot directly update to "${targetStatus.name}" without making payment! Please record the 1st payment in the applicant's profile first.`,
            { duration: 6000 }
          );
          return;
        }
        if (pInfo.type === 'SECOND' && !hasSecond) {
          toast.error(
            `⚠️ Cannot directly update to "${targetStatus.name}" without making payment! Please record the 2nd installment payment first.`,
            { duration: 6000 }
          );
          return;
        }
        if (pInfo.type === 'CONFIRMED' && !isConfirmed) {
          toast.error(
            `⚠️ Cannot directly update to "${targetStatus.name}" without making payment! Please record all required installment payments first.`,
            { duration: 6000 }
          );
          return;
        }
      }

      const hasAnyPayment = (applicant.paid_installments || []).length > 0 || applicant.has_initial_payment;
      if (!hasAnyPayment && !targetStatus.name?.toLowerCase().includes('disable') && !targetStatus.name?.toLowerCase().includes('reject')) {
        toast.error(
          `⚠️ Applicant has no recorded payments. Please make a payment before updating status.`,
          { duration: 6000 }
        );
        return;
      }
    }

    updateStatusMutation.mutate({ id: applicantId, statusId: newStatusId });
  };

  const getStatusOptions = (applicant) => {
    if (!statuses || statuses.length === 0) return { options: [], currentSerial: null };
    const sorted = [...statuses].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    const currentId = applicant.status;
    const currentName = applicant.status_name;
    const currIdx = sorted.findIndex(
      s => String(s.id) === String(currentId) || s.name === currentName
    );

    const currentSerial = currIdx >= 0 ? currIdx + 1 : null;

    const hasInitial = Boolean(applicant.has_initial_payment || (applicant.paid_installments || []).includes('INITIAL'));
    const hasSecond = Boolean(applicant.has_second_payment || (applicant.paid_installments || []).includes('SECOND'));
    const isConfirmed = Boolean(applicant.is_payment_confirmed);

    const options = sorted.map((s, idx) => {
      const isCurrent = String(s.id) === String(currentId) || s.name === currentName;
      const isForward = currIdx >= 0 && idx > currIdx;
      const isRejection = s.name?.toLowerCase().includes('reject') || s.slug?.toLowerCase().includes('reject');

      let isAllowed = currIdx === -1 || isCurrent || isForward || isRejection;
      let lockReason = '';

      const pInfo = isPaymentStatus(s);
      if (pInfo && !isCurrent) {
        if (pInfo.type === 'INITIAL' && !hasInitial) {
          isAllowed = false;
          lockReason = pInfo.lockReason;
        } else if (pInfo.type === 'SECOND' && !hasSecond) {
          isAllowed = false;
          lockReason = pInfo.lockReason;
        } else if (pInfo.type === 'CONFIRMED' && !isConfirmed) {
          isAllowed = false;
          lockReason = pInfo.lockReason;
        }
      }

      return {
        ...s,
        serialNumber: idx + 1,
        isCurrent,
        isAllowed,
        lockReason,
      };
    });

    return { options, currentSerial };
  };

  const getDaysInfo = (applicant) => {
    if (recentlyUpdated[applicant.id]) {
      return { days: 0, label: '0 Days Ago (Just Now)' };
    }
    const dateStr = applicant.updated_at || applicant.created_at;
    if (!dateStr) return null;

    const updatedAt = new Date(dateStr);
    const diffTime = Math.max(0, now - updatedAt.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { days: 0, label: '0 Days Ago (Today)' };
    } else if (diffDays === 1) {
      return { days: 1, label: '1 Day Ago' };
    } else {
      return { days: diffDays, label: `${diffDays} Days Ago` };
    }
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
                {applicants.map((applicant, i) => {
                  const dayInfo = getDaysInfo(applicant);
                  const { options: statusOptions, currentSerial } = getStatusOptions(applicant);

                  return (
                    <motion.tr
                      key={applicant.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/80 transition-colors text-sm"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-slate-700">{applicant.application_id}</td>
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
                            <p className="text-xs text-slate-400">{applicant.profile?.phone || applicant.phone_number || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600 font-semibold">{applicant.passport_number}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-md text-xs font-bold ${STATUS_STYLES[applicant.status_name?.toLowerCase()] || STATUS_STYLES.pending}`}>
                          {applicant.status_name || 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4 relative">
                        <div className="flex items-center gap-3">
                          {updateStatusMutation.isPending && updateStatusMutation.variables?.id === applicant.id ? (
                            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                              <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              Updating...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select
                                value={applicant.status || ''}
                                onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                                className="w-full max-w-[240px] border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="" disabled>Select Status...</option>
                                {statusOptions.map(s => (
                                  <option 
                                    key={s.id} 
                                    value={s.id}
                                    disabled={!s.isAllowed}
                                    className={!s.isAllowed ? 'text-slate-400 bg-slate-50' : 'text-slate-800 font-semibold'}
                                  >
                                    {s.name}{s.isCurrent ? ' (Current)' : s.lockReason ? ` (${s.lockReason})` : !s.isAllowed ? ' (Locked)' : ''}
                                  </option>
                                ))}
                              </select>

                              {(!applicant.has_initial_payment || !applicant.is_payment_confirmed) && (
                                <Link
                                  to={`/applicants/${applicant.id}`}
                                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-2xs"
                                  title="Record payment for applicant"
                                >
                                  + Pay
                                </Link>
                              )}

                              {applicant.status_name?.toLowerCase().includes('reject') && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`⚠️ WARNING: Are you sure you want to reset ${applicant.full_name}'s profile? This will permanently DELETE all payments, money receipts, refunds, and agreements, and reset status back to initial.`)) {
                                      resetApplicantMutation.mutate(applicant.id);
                                    }
                                  }}
                                  disabled={resetApplicantMutation.isPending}
                                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                  <ArrowPathIcon className={`w-3.5 h-3.5 ${resetApplicantMutation.isPending && resetApplicantMutation.variables === applicant.id ? 'animate-spin' : ''}`} />
                                  Reset
                                </button>
                              )}
                            </div>
                          )}

                          {dayInfo && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm shrink-0 whitespace-nowrap ${
                              dayInfo.days === 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100'
                                : dayInfo.days <= 7
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              <CalendarDaysIcon className="w-3.5 h-3.5" />
                              {dayInfo.label}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
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

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  UserIcon,
  CreditCardIcon,
  ArrowPathRoundedSquareIcon,
  DocumentIcon,
  DocumentTextIcon,
  MapPinIcon,
  BanknotesIcon,
  PlusIcon,
  PrinterIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import AgreementPrintView from './AgreementPrintView';
import ReceiptPrintView from './ReceiptPrintView';
import RefundPrintView from './RefundPrintView';

import FormModal from '../../components/common/FormModal';
import CrudTable from '../../components/common/CrudTable';
import toast from 'react-hot-toast';

export default function ApplicantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'general');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showReceiptPrintView, setShowReceiptPrintView] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);
  const [showRefundPrintView, setShowRefundPrintView] = useState(false);
  const [selectedRefundForPrint, setSelectedRefundForPrint] = useState(null);
  const [printType, setPrintType] = useState('all'); // 'all', 'form', 'tc', 'clauses'
  const [showBengali, setShowBengali] = useState(false);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [preferredRefundMethod, setPreferredRefundMethod] = useState('BANK');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('BDT');
  const [reference, setReference] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentError, setPaymentError] = useState(null);

  // Refund Form State
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('bank');
  const [refundRemarks, setRefundRemarks] = useState('');

  // Refund Destination Form State
  const [destMethod, setDestMethod] = useState('BANK');
  const [destHolder, setDestHolder] = useState('');
  const [destBank, setDestBank] = useState('');
  const [destBranch, setDestBranch] = useState('');
  const [destAccount, setDestAccount] = useState('');
  const [destRouting, setDestRouting] = useState('');
  const [destMobile, setDestMobile] = useState('');

  // Fetch applicant details
  const { data: applicant, isLoading, isError } = useQuery({
    queryKey: ['applicant', id],
    queryFn: () => api.get(`/applicants/${id}/`).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (applicant?.refund_bank_detail && Object.keys(applicant.refund_bank_detail).length > 0) {
      const rbd = applicant.refund_bank_detail;
      setDestMethod(rbd.notes || 'BANK');
      setDestHolder(rbd.account_holder_name || '');
      setDestBank(rbd.bank_name || '');
      setDestBranch(rbd.branch_name || '');
      setDestAccount(rbd.account_number_or_iban || '');
      setDestRouting(rbd.routing_number || '');
      setDestMobile(rbd.mobile_number || '');
    } else {
      setDestMethod('BANK');
      setDestHolder('');
      setDestBank('');
      setDestBranch('');
      setDestAccount('');
      setDestRouting('');
      setDestMobile('');
    }
  }, [applicant]);


  // Fetch agreement templates for printing
  const { data: templates } = useQuery({
    queryKey: ['agreement-templates'],
    queryFn: () => api.get('/agreement-templates/').then((r) => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 30,
  });

  // Fetch company info for printing
  const { data: companyInfo } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then((r) => r.data.results?.[0] ?? r.data?.[0]),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Mutation for updating applicant profile (preferred refund method only)
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) =>
      api.patch(`/applicants/${id}/`, { profile: profileData }),
    onSuccess: () => {
      queryClient.invalidateQueries(['applicant', id]);
    },
    onError: (err) => {
      console.error('Profile update error:', err?.response?.data || err.message);
    },
  });

  const { data: countriesData } = useQuery({
    queryKey: ['countries-list'],
    queryFn: () => api.get('/countries/?limit=100').then(r => r.data.results ?? r.data),
  });
  const countryOptions = (countriesData || []).map(c => ({ label: c.name, value: c.id }));

  // Mutation for adding payment
  const addPaymentMutation = useMutation({
    mutationFn: (newPayment) => api.post(`/applicants/${id}/payments/`, newPayment),
    onSuccess: () => {
      queryClient.invalidateQueries(['applicant', id]);
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentRemarks('');
      setReference('');
      setReceiptNumber('');
      setPaymentError(null);
    },
    onError: (err) => {
      const data = err?.response?.data;
      const msg = data
        ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : err.message || 'Unknown error';
      setPaymentError(msg);
    },
  });

  // Mutation for adding/updating refund bank details
  const updateBankDetailsMutation = useMutation({
    mutationFn: (bankDetails) => api.post(`/applicants/${id}/refund-bank-detail/`, bankDetails),
    onSuccess: () => {
      queryClient.invalidateQueries(['applicant', id]);
      toast.success('Refund Destination Details saved successfully!');
    },
    onError: (err) => {
      toast.error('Failed to save refund destination details: ' + (err.response?.data?.detail || err.message));
    }
  });

  // Mutation for generating refund
  const generateRefundMutation = useMutation({
    mutationFn: (newRefund) => api.post(`/applicants/${id}/refunds/`, newRefund),
    onSuccess: () => {
      queryClient.invalidateQueries(['applicant', id]);
      setShowRefundModal(false);
      setRefundRemarks('');
      toast.success('Refund record generated successfully!');
    },
    onError: (err) => {
      toast.error('Failed to generate refund: ' + (err.response?.data?.detail || err.response?.data?.status || err.message));
    }
  });

  const markRefundPaidMutation = useMutation({
    mutationFn: (refundId) => api.post(`/applicants/${id}/refunds/${refundId}/mark_as_paid/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['applicant', id]);
      toast.success('Refund marked as paid!');
    },
    onError: (err) => {
      toast.error('Failed to mark refund as paid: ' + (err.response?.data?.detail || err.message));
    }
  });

  const deleteRefundMutation = useMutation({
    mutationFn: (refundId) => api.delete(`/applicants/${id}/refunds/${refundId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['applicant', id]);
      toast.success('Refund deleted successfully!');
    },
    onError: (err) => {
      toast.error('Failed to delete refund: ' + (err.response?.data?.detail || err.message));
    }
  });

  const deleteApplicantMutation = useMutation({
    mutationFn: () => api.delete(`/applicants/${id}/`),
    onSuccess: () => {
      navigate('/applicants');
    },
    onError: (err) => {
      toast.error('Failed to delete applicant: ' + (err.response?.data?.detail || err.message));
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm mt-3">Loading details...</p>
      </div>
    );
  }

  if (isError || !applicant) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        Failed to load applicant details.
      </div>
    );
  }

  const handlePrint = (type) => {
    setPrintType(type);
    setShowPrintView(true);
  };

  const handlePrintReceipt = (payment) => {
    setSelectedPaymentForReceipt(payment);
    setShowReceiptPrintView(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-600 ring-1 ring-red-200';
      case 'processing': return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
      default: return 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200';
    }
  };

  // Calculate next installment type globally for the payment modal
  const existingPayments = applicant.payments || [];
  const hasInitial = existingPayments.some(p => p.installment_type === 'INITIAL');
  const hasSecond = existingPayments.some(p => p.installment_type === 'SECOND');
  const hasThird = existingPayments.some(p => p.installment_type === 'THIRD');
  const paymentPlan = applicant.payment_plan_installments || 2;

  let nextInstallmentType = 'INITIAL';
  let nextInstallmentLabel = 'Initial Payment';
  let isPaymentComplete = false;

  if (!hasInitial) {
    nextInstallmentType = 'INITIAL'; nextInstallmentLabel = 'Initial Payment';
  } else if (!hasSecond) {
    nextInstallmentType = 'SECOND'; nextInstallmentLabel = 'Second Installment';
  } else if (paymentPlan >= 3 && !hasThird) {
    nextInstallmentType = 'THIRD'; nextInstallmentLabel = 'Third Installment';
  } else {
    isPaymentComplete = true;
  }

  const rbd = applicant.refund_bank_detail || {};
  // Simplified validation: as long as an account holder name is provided, we consider it valid enough to try. 
  // The backend will set status to BANK_INFO_MISSING if it needs more info.
  const isRefundDataValid = !!rbd.account_holder_name;

  const isRejected = applicant.status?.slug?.includes('reject') || applicant.status?.name?.toLowerCase().includes('reject') || applicant.status_name?.toLowerCase().includes('reject');

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* Screen preview overlay */}
      {showPrintView && (
        <div className="fixed inset-0 bg-white z-[999] overflow-y-auto">
          <div className="p-4 bg-slate-100 print:hidden flex items-center justify-between border-b sticky top-0 z-50">
            <span className="font-semibold text-slate-700">🖨️ Print Preview</span>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                Print / Save as PDF
              </button>
              <button
                onClick={() => setShowPrintView(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <AgreementPrintView applicant={applicant} templates={templates} type={printType} companyInfo={companyInfo} showBengali={showBengali} />
        </div>
      )}

      {/* Print portal: injected directly into document.body so CSS body>*:not(.print-portal) works correctly */}
      {showPrintView && createPortal(
        <div className="print-portal">
          <AgreementPrintView applicant={applicant} templates={templates} type={printType} companyInfo={companyInfo} showBengali={showBengali} />
        </div>,
        document.body
      )}

      {/* Receipt Screen preview overlay */}
      {showReceiptPrintView && selectedPaymentForReceipt && (
        <div className="fixed inset-0 bg-white z-[999] overflow-y-auto">
          <div className="p-4 bg-slate-100 print:hidden flex items-center justify-between border-b sticky top-0 z-50">
            <span className="font-semibold text-slate-700">🖨️ Receipt Print Preview</span>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                Print / Save as PDF
              </button>
              <button
                onClick={() => {
                  setShowReceiptPrintView(false);
                  setSelectedPaymentForReceipt(null);
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <ReceiptPrintView applicant={applicant} payment={selectedPaymentForReceipt} companyInfo={companyInfo} />
        </div>
      )}

      {/* Receipt Print portal */}
      {showReceiptPrintView && selectedPaymentForReceipt && createPortal(
        <div className="print-portal">
          <ReceiptPrintView applicant={applicant} payment={selectedPaymentForReceipt} companyInfo={companyInfo} />
        </div>,
        document.body
      )}

      {/* Refund Print Screen preview overlay */}
      {showRefundPrintView && selectedRefundForPrint && (
        <div className="fixed inset-0 bg-white z-[999] overflow-y-auto">
          <div className="p-4 bg-slate-100 print:hidden flex items-center justify-between border-b sticky top-0 z-50">
            <span className="font-semibold text-slate-700">🖨️ Refund Receipt Print Preview</span>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                Print / Save as PDF
              </button>
              <button
                onClick={() => {
                  setShowRefundPrintView(false);
                  setSelectedRefundForPrint(null);
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <RefundPrintView applicant={applicant} refund={selectedRefundForPrint} companyInfo={companyInfo} />
        </div>
      )}

      {/* Refund Print portal */}
      {showRefundPrintView && selectedRefundForPrint && createPortal(
        <div className="print-portal">
          <RefundPrintView applicant={applicant} refund={selectedRefundForPrint} companyInfo={companyInfo} />
        </div>,
        document.body
      )}


      {/* Header / Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/applicants')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to list
        </button>
        <div className="flex items-center gap-2">
          {applicant.tags?.map(tag => (
            <span key={tag.id} className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: tag.color ? `${tag.color}20` : '#f1f5f9', color: tag.color || '#475569' }}>
              {tag.name}
            </span>
          ))}
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(applicant.status?.slug)}`}>
            {applicant.status?.name || 'Unknown'}
          </span>
          <Link to={`/applicants/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors ml-2 text-sm">
            <PencilSquareIcon className="w-4 h-4" /> Edit Profile
          </Link>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this applicant? This action can be undone from the deleted applicants page.')) {
                deleteApplicantMutation.mutate();
              }
            }}
            disabled={deleteApplicantMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors ml-2 text-sm disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" /> {deleteApplicantMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-blue-100 shadow-sm">
            {applicant.photo ? (
              <img src={applicant.photo} alt={applicant.full_name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{applicant.full_name}</h1>
            <p className="text-slate-400 font-mono text-xs font-semibold mt-1">
              App ID: {applicant.application_id || 'N/A'} | Passport: {applicant.passport_number || 'N/A'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Visa: <span className="font-semibold text-slate-700">{applicant.visa_name || 'N/A'}</span>
              {applicant.assigned_staff_name && (
                <span className="ml-3">Agent: <span className="font-semibold text-slate-700">{applicant.assigned_staff_name}</span></span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap md:flex-col justify-end items-start md:items-end gap-2 text-sm">
          <div className="text-slate-500">
            Payment Plan: <span className="font-bold text-slate-800">{applicant.payment_plan_installments} Installments</span>
          </div>
          <div className="text-slate-500">
            Slot: <span className="font-semibold text-slate-700">{applicant.slot_month ? new Date(applicant.slot_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'Not Assigned'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { id: 'general', label: 'General Info', icon: UserIcon },
            { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
            { id: 'documents', label: 'Documents', icon: DocumentIcon },
            { id: 'payments', label: 'Payments & Receipts', icon: CreditCardIcon },
            { id: 'refunds', label: 'Refunds Info', icon: ArrowPathRoundedSquareIcon },
            { id: 'agreements', label: 'Legal Agreements', icon: DocumentTextIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 border-b-2 font-semibold text-sm transition-all
                ${activeTab === tab.id
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity & Passport */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2">Identity & Passport</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-400">Full Name</span>
                <span className="text-slate-700 font-semibold">{applicant.full_name || '—'}</span>
                <span className="text-slate-400">Passport Number</span>
                <span className="text-slate-700 font-semibold font-mono">{applicant.passport_number || '—'}</span>
                <span className="text-slate-400">Passport Issue</span>
                <span className="text-slate-700 font-semibold">{applicant.passport_issue_date || '—'}</span>
                <span className="text-slate-400">Passport Expiry</span>
                <span className="text-slate-700 font-semibold">{applicant.passport_expiry_date || '—'}</span>
                <span className="text-slate-400">NID Number</span>
                <span className="text-slate-700 font-semibold font-mono">{applicant.nid_number || '—'}</span>
                <span className="text-slate-400">Date of Birth</span>
                <span className="text-slate-700 font-semibold">{applicant.date_of_birth || '—'}</span>
                <span className="text-slate-400">Place of Birth</span>
                <span className="text-slate-700 font-semibold">{applicant.place_of_birth || '—'}</span>
                <span className="text-slate-400">Current Country</span>
                <span className="text-slate-700 font-semibold">{applicant.current_country || '—'}</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2">Profile & Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-400">Gender</span>
                <span className="text-slate-700 font-semibold capitalize">{applicant.profile?.gender?.toLowerCase() || '—'}</span>
                <span className="text-slate-400">Phone</span>
                <span className="text-slate-700 font-semibold">{applicant.profile?.phone || '—'}</span>
                <span className="text-slate-400">Email</span>
                <span className="text-slate-700 font-semibold">{applicant.profile?.email || '—'}</span>
                <span className="text-slate-400">Father's Name</span>
                <span className="text-slate-700 font-semibold">{applicant.profile?.father_name || '—'}</span>
                <span className="text-slate-400">Mother's Name</span>
                <span className="text-slate-700 font-semibold">{applicant.profile?.mother_name || '—'}</span>
                <span className="text-slate-400">Nationality</span>
                <span className="text-slate-700 font-semibold">{applicant.profile?.nationality || '—'}</span>
                <span className="text-slate-400">Marital Status</span>
                <span className="text-slate-700 font-semibold capitalize">{applicant.profile?.marital_status?.toLowerCase() || '—'}</span>
                <span className="text-slate-400">Occupation</span>
                <span className="text-slate-700 font-semibold">{applicant.profile?.occupation || '—'}</span>
              </div>
            </div>

            {/* Process Assignment */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2">Visa & Assignment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-400">Visa</span>
                <span className="text-slate-700 font-semibold">{applicant.visa_name || '—'}</span>
                <span className="text-slate-400">Target Job (Primary)</span>
                <span className="text-slate-700 font-semibold">{applicant.job?.title || applicant.job_name || applicant.job || '—'}</span>
                <span className="text-slate-400">Target Job (Secondary)</span>
                <span className="text-slate-700 font-semibold">{applicant.secondary_job_name || '—'}</span>
                <span className="text-slate-400">Status</span>
                <span className="text-slate-700 font-semibold">{applicant.status?.name || '—'}</span>
                <span className="text-slate-400">Assigned Staff</span>
                <span className="text-slate-700 font-semibold">{applicant.assigned_staff_name || '—'}</span>
                <span className="text-slate-400">Assigned Lawyer</span>
                <span className="text-slate-700 font-semibold">{applicant.lawyer?.name || applicant.lawyer_name || applicant.lawyer || '—'}</span>
                <span className="text-slate-400">Allocated Slot</span>
                <span className="text-slate-700 font-semibold">{applicant.slot_month ? new Date(applicant.slot_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : '—'}</span>
                <span className="text-slate-400">Payment Plan</span>
                <span className="text-slate-700 font-semibold">{applicant.payment_plan_installments} Installments</span>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-400">Contact Name</span>
                <span className="text-slate-700 font-semibold">{applicant.profile?.emergency_contact_name || '—'}</span>
                <span className="text-slate-400">Contact Phone</span>
                <span className="text-slate-700 font-semibold">{applicant.profile?.emergency_contact_phone || '—'}</span>
                <span className="text-slate-400">Relation</span>
                <span className="text-slate-700 font-semibold">{applicant.profile?.emergency_contact_relation || '—'}</span>
              </div>
            </div>

            {/* Tags */}
            {applicant.tags?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4 col-span-full">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {applicant.tags.map(tag => (
                    <span key={tag.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{tag.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <CrudTable
              isNested={true}
              title="Addresses"
              subtitle="Manage applicant's addresses."
              endpoint={`/applicants/${id}/addresses/`}
              queryKey={`applicant-addresses-${id}`}
              columns={[
                { header: 'Type', accessor: 'address_type' },
                { header: 'Village', accessor: 'village' },
                { header: 'Post Office', accessor: 'post_office' },
                { header: 'District', accessor: 'district' },
                { header: 'Country', accessor: 'country_name' },
              ]}
              formFields={[
                { name: 'address_type', label: 'Address Type (e.g. Present, Permanent)', type: 'text', required: true },
                { name: 'village', label: 'Village', type: 'text' },
                { name: 'post_office', label: 'Post Office', type: 'text' },
                { name: 'police_station', label: 'Police Station', type: 'text' },
                { name: 'district', label: 'District', type: 'text' },
                { name: 'country', label: 'Country', type: 'select', options: countryOptions, required: true },
              ]}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <CrudTable
              isNested={true}
              title="Documents"
              subtitle="Manage applicant's documents."
              endpoint={`/applicants/${id}/documents/`}
              queryKey={`applicant-documents-${id}`}
              columns={[
                { header: 'Type', accessor: 'document_type' },
                { header: 'File', render: (item) => item.file ? <a href={item.file} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View File</a> : 'N/A' },
                { header: 'Verified', render: (item) => item.verified ? 'Yes' : 'No' },
              ]}
              formFields={[
                {
                  name: 'document_type',
                  label: 'Document Type',
                  type: 'select',
                  required: true,
                  options: [
                    { value: 'PASSPORT', label: 'Passport' },
                    { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
                    { value: 'NID', label: 'National ID' },
                    { value: 'PHOTO', label: 'Photograph' },
                    { value: 'IELTS', label: 'IELTS Certificate' },
                    { value: 'BANK_STATEMENT', label: 'Bank Statement' },
                    { value: 'MEDICAL', label: 'Medical Report' },
                    { value: 'POLICE_CLEARANCE', label: 'Police Clearance' },
                    { value: 'EDUCATIONAL', label: 'Educational Certificate' },
                    { value: 'OTHER', label: 'Other' },
                  ]
                },
                { name: 'title', label: 'Title (if Other)', type: 'text', required: false },
                { name: 'file', label: 'File', type: 'file', required: true },
              ]}
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Header / Add Payment Button */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Payment Logs</h3>
              {!isPaymentComplete && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold shadow hover:bg-blue-800 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Payment Record
                </button>
              )}
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto w-full">
              <table className="w-full text-sm whitespace-nowrap min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Receipt No.', 'Amount', 'Date', 'Method', 'Remarks', 'Action'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {applicant.payments?.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-slate-500">{payment.receipt_number || `REC-${payment.id}`}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">৳{Number(payment.amount).toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-500">{payment.payment_date || '—'}</td>
                      <td className="px-5 py-4 capitalize text-slate-600">{payment.payment_method || '—'}</td>
                      <td className="px-5 py-4 text-slate-500">{payment.remarks || '—'}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handlePrintReceipt(payment)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                          title="Download Receipt"
                        >
                          <PrinterIcon className="w-4 h-4" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!applicant.payments || applicant.payments.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">No payment logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal for Payment Record Creation */}
            {showPaymentModal && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                  <h3 className="font-bold text-slate-800 text-lg">Record Payment</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="BDT">BDT - Bangladeshi Taka</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="AED">AED - UAE Dirham</option>
                        <option value="SAR">SAR - Saudi Riyal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="CASH">Hand Cash</option>
                        <option value="BANK">Bank Transfer</option>
                        <option value="MOBILE_BANKING">Mobile Banking</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="ONLINE">Online Payment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Installment Type</label>
                      {isPaymentComplete ? (
                        <div className="w-full px-3 py-2 border border-green-200 bg-green-50 rounded-xl text-sm text-green-700 font-semibold">
                          ✓ All installments recorded
                        </div>
                      ) : (
                        <>
                          <input
                            type="hidden"
                            name="installment_type"
                            value={nextInstallmentType}
                          />
                          <div className="w-full px-3 py-2 border border-blue-200 bg-blue-50 rounded-xl text-sm text-blue-700 font-semibold flex items-center justify-between">
                            <span>{nextInstallmentLabel}</span>
                            <span className="text-[10px] text-blue-400 font-normal">(Auto-determined)</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Payment Date</label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Receipt No (Optional)</label>
                      <input
                        type="text"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Reference (Bank/Bkash TxID)</label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="TxID or Check Number"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Remarks</label>
                      <textarea
                        value={paymentRemarks}
                        onChange={(e) => setPaymentRemarks(e.target.value)}
                        placeholder="Any additional notes..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-16"
                      />
                    </div>
                  </div>
                  {/* Separate section for Applicant Profile update (only on 2nd payment) */}
                  {nextInstallmentType === 'SECOND' && !isPaymentComplete && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Refund Method</label>
                      <select
                        value={preferredRefundMethod}
                        onChange={(e) => setPreferredRefundMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="BANK">Bank Transfer</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="CASH">Cash</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">* This updates the applicant's profile for future refund processing.</p>
                    </div>
                  )}
                  {/* Error display */}
                  {paymentError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      ⚠ {paymentError}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end text-sm font-semibold">
                    <button
                      onClick={() => { setShowPaymentModal(false); setPaymentError(null); }}
                      className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={addPaymentMutation.isPending}
                      onClick={() => {
                        if (!paymentAmount) return setPaymentError('Amount is required.');
                        setPaymentError(null);
                        if (nextInstallmentType === 'SECOND') {
                          updateProfileMutation.mutate({ preferred_refund_method: preferredRefundMethod });
                        }

                        addPaymentMutation.mutate({
                          applicant: id,
                          amount: Number(paymentAmount),
                          payment_method: paymentMethod,
                          currency: currency,
                          payment_date: paymentDate,
                          installment_type: nextInstallmentType,
                          reference: reference,
                          receipt_number: receiptNumber,
                          note: paymentRemarks,
                        });
                      }}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {addPaymentMutation.isPending ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'refunds' && (
          <div className="space-y-6">
            {/* Warning Banner if not rejected */}
            {!isRejected && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl text-sm mb-4 font-semibold">
                Notice: Refund records can only be auto-generated when an applicant's status indicates a rejection.
              </div>
            )}

            {/* Warning Banner if Refund Destination is missing */}
            {isRejected && !isRefundDataValid && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-4 font-semibold">
                ⚠️ Action Required: You must record the applicant's Refund Destination details before you can process this refund.
              </div>
            )}

            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Refund Logs</h3>
              <button
                onClick={() => setShowRefundModal(true)}
                disabled={applicant?.refunds && applicant.refunds.length > 0}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold shadow hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={applicant?.refunds && applicant.refunds.length > 0 ? "A refund receipt has already been generated" : "Approve & Disburse Refund"}
              >
                <PlusIcon className="w-4 h-4" />
                Approve & Disburse Refund
              </button>
            </div>

            {/* Refund Destination Form */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Refund Destination Details</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateBankDetailsMutation.mutate({
                    account_holder_name: destHolder,
                    bank_name: destMethod === 'MOBILE' ? destBank : (destMethod === 'BANK' ? destBank : ''),
                    branch_name: destMethod === 'BANK' ? destBranch : '',
                    district_name: 'Default',
                    account_number_or_iban: destMethod === 'BANK' ? destAccount : '',
                    routing_number: destMethod === 'BANK' ? destRouting : '',
                    mobile_number: destMethod === 'MOBILE' ? destMobile : '',
                    country: 'BD',
                    notes: destMethod
                  });
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Refund Method</label>
                  <select
                    value={destMethod}
                    onChange={e => setDestMethod(e.target.value)}
                    className="w-full md:w-1/3 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                  >
                    <option value="BANK">Bank Transfer</option>
                    <option value="MOBILE">Mobile Banking</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    {destMethod === 'BANK' ? 'Account Holder Name *' : 'Receiver Name *'}
                  </label>
                  <input
                    type="text"
                    value={destHolder}
                    onChange={e => setDestHolder(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                  />
                </div>

                {destMethod === 'MOBILE' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Provider *</label>
                      <select
                        value={destBank}
                        onChange={e => setDestBank(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                      >
                        <option value="">Select Provider</option>
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="Upay">Upay</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Number *</label>
                      <input
                        type="text"
                        value={destMobile}
                        onChange={e => setDestMobile(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                {destMethod === 'BANK' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Name *</label>
                      <input
                        type="text"
                        value={destBank}
                        onChange={e => setDestBank(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Branch Name *</label>
                      <input
                        type="text"
                        value={destBranch}
                        onChange={e => setDestBranch(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Number / IBAN *</label>
                      <input
                        type="text"
                        value={destAccount}
                        onChange={e => setDestAccount(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Routing Number</label>
                      <input
                        type="text"
                        value={destRouting}
                        onChange={e => setDestRouting(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={
                      (destMethod === 'BANK' && (!destHolder || !destBank || !destBranch || !destAccount)) ||
                      (destMethod === 'MOBILE' && (!destHolder || !destBank || !destMobile)) ||
                      (destMethod === 'CASH' && !destHolder) ||
                      updateBankDetailsMutation.isPending
                    }
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateBankDetailsMutation.isPending ? 'Saving...' : 'Save Destination Details'}
                  </button>
                </div>
              </form>
            </div>

            {/* Refunds Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto w-full">
              <table className="w-full text-sm whitespace-nowrap min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Refund Receipt No.', 'Amount', 'Status', 'Method', 'Remarks', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {applicant.refunds?.map((refund) => (
                    <tr key={refund.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-slate-500">{refund.receipt_number || `REF-${refund.id}`}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">৳{Number(refund.refund_amount).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 capitalize">
                          {refund.refund_status}
                        </span>
                      </td>
                      <td className="px-5 py-4 capitalize text-slate-600">{refund.refund_method || '—'}</td>
                      <td className="px-5 py-4 text-slate-500">{refund.refund_reason || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRefundForPrint(refund);
                              setShowRefundPrintView(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                            title="Print Refund Details"
                          >
                            <PrinterIcon className="w-4 h-4" /> Print
                          </button>
                          {refund.refund_status !== 'paid' && refund.refund_status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to mark this refund as Paid? This will send an email to the applicant.")) {
                                  markRefundPaidMutation.mutate(refund.id);
                                }
                              }}
                              disabled={markRefundPaidMutation.isPending}
                              className="px-3 py-1 bg-green-50 text-green-700 font-semibold rounded-lg text-xs hover:bg-green-100 disabled:opacity-50"
                            >
                              Mark as Paid
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this refund receipt? This action cannot be undone.")) {
                                deleteRefundMutation.mutate(refund.id);
                              }
                            }}
                            disabled={deleteRefundMutation.isPending}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Refund"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!applicant.refunds || applicant.refunds.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">No refunds processed yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>



            {/* Modal for Refund record creation */}
            {showRefundModal && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                  <h3 className="font-bold text-slate-800 text-lg">Generate Refund Record</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    This will automatically calculate the refundable balance based on the current payments list.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Reason / Notes</label>
                      <textarea
                        value={refundRemarks}
                        onChange={(e) => setRefundRemarks(e.target.value)}
                        placeholder="e.g. Visa rejection refund"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end text-sm font-semibold">
                    <button
                      onClick={() => setShowRefundModal(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => generateRefundMutation.mutate({
                        reason: refundRemarks,
                      })}
                      disabled={generateRefundMutation.isPending}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                    >
                      {generateRefundMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        'Generate Refund'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'agreements' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-6">
            {!isPaymentComplete ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <DocumentTextIcon className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-700 text-lg">Agreement Locked</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-md">
                  Agreement generation is locked until full payment is completed.
                  Please collect the remaining payments to unlock the agreement documents.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Agreement Document Printer</h3>
                  <p className="text-slate-400 text-sm mt-0.5">Generate printable PDF pages for the applicant agreements.</p>
                </div>

                {/* Bengali Language Toggle */}
                <label className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showBengali}
                      onChange={(e) => setShowBengali(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${showBengali ? 'bg-amber-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showBengali ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Include Bengali (বাংলা)</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {showBengali
                        ? 'ON — Agreement shows EN + AR + BN · Main agreement split into 3 pages'
                        : 'OFF — Agreement shows EN + AR only · Main agreement fits in 2 pages'}
                    </p>
                  </div>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Page 1: Client Bio & Cover Page', desc: 'Application info, payment amounts, and signatures.', type: 'form' },
                    { title: 'Page 2: Receipt & Agreement', desc: 'Payment receipt header with clauses 1-6 of Main Agreement.', type: 'tc' },
                    { title: 'Page 3: Agreement Clauses', desc: 'The dynamic legal clauses (7-15) of Main Agreement.', type: 'clauses' },
                    { title: 'Page 4: Terms & Conditions', desc: 'The 6 standard clauses of the General T&C Agreement.', type: 'tc2' },
                  ].map((printItem) => (
                    <div key={printItem.title} className="p-4 border border-slate-200/60 rounded-xl flex items-start justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{printItem.title}</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-snug">{printItem.desc}</p>
                      </div>
                      <button
                        onClick={() => handlePrint(printItem.type)}
                        className="p-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white shadow-sm transition-all shrink-0"
                        title="Print / PDF"
                      >
                        <PrinterIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    onClick={() => handlePrint('all')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-xl text-sm font-semibold shadow hover:bg-blue-800 transition-colors"
                  >
                    <PrinterIcon className="w-5 h-5" />
                    Print Full Agreement Package ({showBengali ? '5' : '4'} Pages)
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

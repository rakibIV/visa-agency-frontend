import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api/client';
import { toast } from 'react-hot-toast';
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  UserIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function SendEmailPage() {
  const [searchParams] = useSearchParams();
  const urlTemplateId = searchParams.get('template') || searchParams.get('templateId') || '';
  const urlApplicantId = searchParams.get('applicant') || searchParams.get('applicantId') || '';

  const [senderId, setSenderId] = useState(''); // empty string means System Default
  const [templateId, setTemplateId] = useState(urlTemplateId);
  const [applicantId, setApplicantId] = useState(urlApplicantId);

  // Search filters
  const [applicantSearch, setApplicantSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategoryTab, setTemplateCategoryTab] = useState('all'); // 'all' | 'general' | 'status' | 'generous'

  // Fetch Lawyers
  const { data: lawyers = [] } = useQuery({
    queryKey: ['lawyers-list'],
    queryFn: () => api.get('/lawyers/').then(res => res.data.results || res.data || []),
  });

  // Fetch ALL Templates (page_size: 500 to ensure every saved template is loaded)
  const { data: rawTemplates = [] } = useQuery({
    queryKey: ['email-templates-list-dispatch'],
    queryFn: () => api.get('/email-templates/', { params: { page_size: 500 } }).then(res => res.data.results || res.data || []),
  });

  const templates = Array.isArray(rawTemplates) ? rawTemplates : [];

  // Fetch Applicants (up to 1000)
  const { data: rawApplicants = [] } = useQuery({
    queryKey: ['applicants-list-all'],
    queryFn: () => api.get('/applicants/', { params: { page_size: 1000 } }).then(res => res.data.results || res.data || []),
  });

  const applicants = Array.isArray(rawApplicants) ? rawApplicants : [];

  // Update initial IDs if url parameters change
  useEffect(() => {
    if (urlTemplateId && !templateId) {
      setTemplateId(urlTemplateId);
    }
  }, [urlTemplateId, templateId]);

  useEffect(() => {
    if (urlApplicantId && !applicantId) {
      setApplicantId(urlApplicantId);
    }
  }, [urlApplicantId, applicantId]);

  // Selected entities
  const selectedApplicant = useMemo(() => {
    return applicants.find(a => String(a.id) === String(applicantId)) || null;
  }, [applicants, applicantId]);

  const selectedTemplate = useMemo(() => {
    return templates.find(t => String(t.id) === String(templateId)) || null;
  }, [templates, templateId]);

  const selectedSender = useMemo(() => {
    return lawyers.find(l => String(l.id) === String(senderId)) || null;
  }, [lawyers, senderId]);

  // Categorize templates
  const categorizedTemplates = useMemo(() => {
    const general = templates.filter(t => !t.is_generous && !t.status && !t.status_name);
    const status = templates.filter(t => !t.is_generous && (t.status || t.status_name));
    const generous = templates.filter(t => !!t.is_generous);
    return { general, status, generous };
  }, [templates]);

  // Filter templates by category and search query
  const filteredTemplates = useMemo(() => {
    let list = templates;
    if (templateCategoryTab === 'general') {
      list = categorizedTemplates.general;
    } else if (templateCategoryTab === 'status') {
      list = categorizedTemplates.status;
    } else if (templateCategoryTab === 'generous') {
      list = categorizedTemplates.generous;
    }

    if (templateSearch.trim()) {
      const q = templateSearch.toLowerCase();
      list = list.filter(t =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q) ||
        (t.status_name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [templates, categorizedTemplates, templateCategoryTab, templateSearch]);

  // Filter applicants by search query
  const filteredApplicants = useMemo(() => {
    if (!applicantSearch.trim()) return applicants;
    const q = applicantSearch.toLowerCase();
    return applicants.filter(a =>
      (a.full_name || '').toLowerCase().includes(q) ||
      (a.application_id || '').toLowerCase().includes(q) ||
      (a.passport_number || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q)
    );
  }, [applicants, applicantSearch]);

  // Send Mutation
  const sendMutation = useMutation({
    mutationFn: (data) => api.post(`/applicants/${data.applicantId}/send-email/`, {
      sender: data.senderId || null,
      template: data.templateId,
    }),
    onSuccess: () => {
      const recipient = selectedApplicant?.email ? ` to ${selectedApplicant.email}` : '';
      toast.success(`Email dispatched successfully${recipient}!`);
      setTemplateId('');
      setApplicantId('');
      setSenderId('');
      setApplicantSearch('');
      setTemplateSearch('');
    },
    onError: (err) => {
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.template?.[0] ||
        err.response?.data?.sender?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        err.message ||
        'Failed to dispatch email.';
      toast.error(errMsg);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!applicantId) {
      return toast.error('Please select an applicant.');
    }
    if (!selectedApplicant?.email) {
      return toast.error(`Applicant ${selectedApplicant?.full_name || ''} has no email address configured in their profile.`);
    }
    if (!templateId) {
      return toast.error('Please select an email template.');
    }
    sendMutation.mutate({ applicantId, templateId, senderId });
  };

  // Helper for dynamic preview substitution
  const renderedPreview = useMemo(() => {
    if (!selectedTemplate) return null;

    const applicantName = selectedApplicant?.full_name || 'MD RAKIB HASAN';
    const applicationId = selectedApplicant?.application_id || 'APP-84920';
    const passportNumber = selectedApplicant?.passport_number || 'A02938475';
    const currentStatus = selectedApplicant?.status_name || 'In Progress';
    const visaName = selectedApplicant?.visa_name || 'Employment Visa';

    const previewSubject = (selectedTemplate.subject || '')
      .replace(/\{\{\s*applicant_name\s*\}\}/g, applicantName)
      .replace(/\{\{\s*applicant_id\s*\}\}/g, applicationId)
      .replace(/\{\{\s*passport_number\s*\}\}/g, passportNumber)
      .replace(/\{\{\s*current_status\s*\}\}/g, currentStatus);

    const previewBody = (selectedTemplate.body || '')
      .replace(/\{\{\s*applicant_name\s*\}\}/g, applicantName)
      .replace(/\{\{\s*applicant_id\s*\}\}/g, applicationId)
      .replace(/\{\{\s*passport_number\s*\}\}/g, passportNumber)
      .replace(/\{\{\s*visa\s*\}\}/g, visaName)
      .replace(/\{\{\s*current_status\s*\}\}/g, currentStatus);

    return {
      subject: previewSubject,
      body: previewBody,
    };
  }, [selectedTemplate, selectedApplicant]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <EnvelopeIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dispatch Email</h1>
            <p className="text-slate-500 text-sm font-medium">
              Send manual template-based emails with dynamic applicant placeholders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/communication/templates"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            <DocumentTextIcon className="w-4 h-4 text-slate-500" />
            Manage Templates ({templates.length})
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* STEP 1: SELECT APPLICANT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <UserIcon className="w-4 h-4 text-blue-600" /> 1. Select Recipient Applicant
              </label>
              <span className="text-xs text-slate-400 font-semibold">
                {applicants.length} Total Applicants
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, ID, passport, or email..."
                value={applicantSearch}
                onChange={e => setApplicantSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <select
              value={applicantId}
              onChange={e => setApplicantId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-slate-800"
              required
            >
              <option value="">-- Choose an Applicant ({filteredApplicants.length}) --</option>
              {filteredApplicants.map(app => (
                <option key={app.id} value={app.id}>
                  {app.application_id || 'ID-TBD'} — {app.full_name} ({app.passport_number}) {app.email ? `• ${app.email}` : '• [No Email]'}
                </option>
              ))}
            </select>

            {/* Selected Applicant Card */}
            {selectedApplicant && (
              <div className={`p-4 rounded-xl border transition-all text-xs ${
                selectedApplicant.email
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-sm flex items-center gap-2">
                      {selectedApplicant.full_name}
                      {selectedApplicant.email && (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-600 inline" />
                      )}
                    </div>
                    <div className="text-slate-600 flex flex-wrap gap-2 items-center">
                      <span>ID: <strong className="text-slate-800">{selectedApplicant.application_id || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Passport: <strong className="text-slate-800">{selectedApplicant.passport_number}</strong></span>
                      {selectedApplicant.visa_name && (
                        <>
                          <span>•</span>
                          <span>Visa: <strong className="text-slate-800">{selectedApplicant.visa_name}</strong></span>
                        </>
                      )}
                    </div>
                    <div className="pt-1">
                      {selectedApplicant.email ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-emerald-200 text-emerald-700 font-mono font-bold">
                          <EnvelopeIcon className="w-3.5 h-3.5" />
                          {selectedApplicant.email}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-700 font-semibold">
                          <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>This applicant has no email address in their profile!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/applicants/${selectedApplicant.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 font-semibold text-[11px] transition shadow-xs shrink-0"
                    title="Open applicant profile in new tab"
                  >
                    View Profile <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: SELECT TEMPLATE */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" /> 2. Select Email Template
              </label>
              <span className="text-xs text-slate-400 font-semibold">
                {templates.length} Saved Templates
              </span>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {[
                { key: 'all', label: `All (${templates.length})` },
                { key: 'general', label: `General (${categorizedTemplates.general.length})` },
                { key: 'status', label: `Status (${categorizedTemplates.status.length})` },
                { key: 'generous', label: `Generous (${categorizedTemplates.generous.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTemplateCategoryTab(tab.key)}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    templateCategoryTab === tab.key
                      ? 'bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick search input */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search templates by name, subject, or status..."
                value={templateSearch}
                onChange={e => setTemplateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <select
              value={templateId}
              onChange={e => setTemplateId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-slate-800"
              required
            >
              <option value="">-- Choose an Email Template ({filteredTemplates.length}) --</option>
              {templateCategoryTab === 'all' && !templateSearch.trim() ? (
                <>
                  {categorizedTemplates.general.length > 0 && (
                    <optgroup label="📁 General Templates">
                      {categorizedTemplates.general.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name} — {tpl.subject}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {categorizedTemplates.status.length > 0 && (
                    <optgroup label="📋 Status Notification Templates">
                      {categorizedTemplates.status.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>
                          [{tpl.status_name || 'Status'}] {tpl.name} — {tpl.subject}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {categorizedTemplates.generous.length > 0 && (
                    <optgroup label="🌟 Generous Templates">
                      {categorizedTemplates.generous.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name} — {tpl.subject}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              ) : (
                filteredTemplates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.status_name ? `[${tpl.status_name}] ` : ''}{tpl.name} — {tpl.subject}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* STEP 3: SENDER */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <BuildingOfficeIcon className="w-4 h-4 text-blue-600" /> 3. Sender Identity
            </label>
            <select
              value={senderId}
              onChange={e => setSenderId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-slate-800"
            >
              <option value="">🏢 System Default (Admin / Company Fallback SMTP)</option>
              {lawyers?.map(l => (
                <option key={l.id} value={l.id}>
                  ⚖️ {l.name} {l.country_name ? `(${l.country_name})` : ''} • {l.email}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              {selectedSender
                ? `Will send from lawyer account: ${selectedSender.email}`
                : 'Will use the system SMTP credentials configured in Settings > Profile or Company info.'}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {selectedApplicant && !selectedApplicant.email ? (
                <span className="text-rose-500 font-bold">⚠️ Recipient email missing</span>
              ) : (
                <span>Ready to dispatch</span>
              )}
            </div>

            <button
              type="submit"
              disabled={sendMutation.isPending || (selectedApplicant && !selectedApplicant.email)}
              className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              {sendMutation.isPending ? 'Dispatching Email...' : 'Dispatch Email Now'}
            </button>
          </div>
        </motion.form>

        {/* Right Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-blue-600" /> Live Message Preview
              </h2>
              {selectedTemplate && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedTemplate.status_name ? 'Status Template' : selectedTemplate.is_generous ? 'Generous' : 'General'}
                </span>
              )}
            </div>

            {selectedTemplate ? (
              <div className="space-y-4 flex-1 flex flex-col text-xs">
                {/* Email Envelope Header */}
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/60 font-medium">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-16 font-bold uppercase text-[10px] text-slate-400">From:</span>
                    <span className="font-bold text-slate-800 truncate">
                      {selectedSender ? `${selectedSender.name} <${selectedSender.email}>` : 'System Administrator'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-16 font-bold uppercase text-[10px] text-slate-400">To:</span>
                    <span className={`font-bold truncate ${selectedApplicant?.email ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {selectedApplicant
                        ? (selectedApplicant.email ? `${selectedApplicant.full_name} <${selectedApplicant.email}>` : `${selectedApplicant.full_name} [NO EMAIL]`)
                        : 'Select an applicant'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 pt-1 border-t border-slate-200/60">
                    <span className="w-16 font-bold uppercase text-[10px] text-slate-400">Subject:</span>
                    <span className="font-bold text-slate-900 truncate">
                      {renderedPreview?.subject || selectedTemplate.subject}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex-1 overflow-y-auto max-h-[360px] text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
                  {renderedPreview?.body || selectedTemplate.body}
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-800 text-[11px] leading-relaxed">
                  💡 <strong>Placeholder Preview:</strong> Tags like <code className="bg-white px-1 py-0.5 rounded text-[10px] text-blue-700 font-mono">{'{{ applicant_name }}'}</code> are dynamically replaced with recipient applicant records upon dispatch.
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <DocumentTextIcon className="w-12 h-12 text-slate-200 mb-3" />
                <p className="font-medium text-sm text-slate-600">No Template Selected</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Choose an email template from the list to preview the subject, body placeholders, and styling.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

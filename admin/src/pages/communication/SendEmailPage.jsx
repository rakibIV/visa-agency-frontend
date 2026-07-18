import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api/client';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, PaperAirplaneIcon, UserIcon, DocumentTextIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function SendEmailPage() {
  const [senderId, setSenderId] = useState(''); // empty string means System Default
  const [templateId, setTemplateId] = useState('');
  const [applicantId, setApplicantId] = useState('');

  // Fetch Lawyers
  const { data: lawyers } = useQuery({
    queryKey: ['lawyers-list'],
    queryFn: () => api.get('/lawyers/').then(res => res.data.results || res.data),
  });

  // Fetch Templates
  const { data: templates } = useQuery({
    queryKey: ['email-templates-list'],
    queryFn: () => api.get('/email-templates/').then(res => res.data.results || res.data),
  });

  // Fetch Applicants
  const { data: applicants } = useQuery({
    queryKey: ['applicants-list-all'],
    // fetch large number or search, but for now just fetch a page or use all
    queryFn: () => api.get('/applicants/?page_size=1000').then(res => res.data.results || res.data),
  });

  const sendMutation = useMutation({
    mutationFn: (data) => api.post(`/applicants/${data.applicantId}/send-email/`, {
      sender: data.senderId || null,
      template: data.templateId,
    }),
    onSuccess: () => {
      toast.success('Email sent successfully!');
      setTemplateId('');
      setApplicantId('');
      setSenderId('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to send email.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!applicantId || !templateId) {
      return toast.error('Please select both an applicant and a template.');
    }
    sendMutation.mutate({ applicantId, templateId, senderId });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <EnvelopeIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dispatch Email</h1>
          <p className="text-slate-500 font-medium">Send manual template-based emails to applicants.</p>
        </div>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <UserIcon className="w-4 h-4 text-slate-400" /> Select Applicant
            </label>
            <select 
              value={applicantId}
              onChange={e => setApplicantId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            >
              <option value="">-- Choose an Applicant --</option>
              {applicants?.map(app => (
                <option key={app.id} value={app.id}>
                  {app.application_id} - {app.full_name} ({app.passport_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <DocumentTextIcon className="w-4 h-4 text-slate-400" /> Select Template
            </label>
            <select 
              value={templateId}
              onChange={e => setTemplateId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            >
              <option value="">-- Choose an Email Template --</option>
              {templates?.filter(t => t.is_active).map(tpl => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} - {tpl.subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <BuildingOfficeIcon className="w-4 h-4 text-slate-400" /> Sender (Optional)
            </label>
            <select 
              value={senderId}
              onChange={e => setSenderId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">System Default (Admin / Fallback)</option>
              {lawyers?.filter(l => l.is_active).map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} - {l.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={sendMutation.isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            {sendMutation.isLoading ? 'Sending...' : 'Dispatch Email'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

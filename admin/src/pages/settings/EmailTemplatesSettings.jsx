import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  CodeBracketIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  SparklesIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import { useEffect } from 'react';

const DYNAMIC_VARIABLES = [
  { group: 'Applicant Details', items: [
    { tag: '{{ applicant_name }}', label: 'Full Name' },
    { tag: '{{ applicant_id }}', label: 'Application ID' },
    { tag: '{{ passport_number }}', label: 'Passport No' },
    { tag: '{{ father_name }}', label: "Father's Name" },
    { tag: '{{ nid_number }}', label: 'NID Number' },
  ]},
  { group: 'Application & Visa', items: [
    { tag: '{{ visa }}', label: 'Visa Title' },
    { tag: '{{ country }}', label: 'Destination Country' },
    { tag: '{{ job }}', label: 'Target Job' },
    { tag: '{{ current_status }}', label: 'Status Name' },
  ]},
  { group: 'Organization & Legal', items: [
    { tag: '{{ company_name }}', label: 'Company / Agency Name' },
    { tag: '{{ lawyer_name }}', label: 'Lawyer / Legal Rep Name' },
    { tag: '{{ lawyer_address }}', label: 'Lawyer Chamber Address' },
    { tag: '{{ staff }}', label: 'Assigned Staff' },
  ]},
];

export default function EmailTemplatesSettings() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'

  // Form states
  const [name, setName] = useState('');
  const [statusId, setStatusId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isGenerous, setIsGenerous] = useState(false);
  const [topLeftLogo, setTopLeftLogo] = useState('');
  const [topCenterLogo, setTopCenterLogo] = useState('');
  const [formError, setFormError] = useState('');

  const bodyTextareaRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [categoryTab, setCategoryTab] = useState('general'); // 'general' | 'status' | 'generous'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setPage(1);
  }, [categoryTab, searchQuery, selectedStatusFilter, pageSize]);

  // Fetch email templates (request page_size: 200 to load all status templates)
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['settings-email-templates'],
    queryFn: () => api.get('/email-templates/', { params: { page_size: 200 } }).then(r => r.data.results ?? r.data),
  });
  const templates = templatesData ?? [];

  // Fetch application statuses
  const { data: statusesData } = useQuery({
    queryKey: ['application-statuses', 'v2'],
    queryFn: () => api.get('/application-statuses/').then(r => r.data.results ?? r.data),
  });
  const statuses = statusesData ?? [];

  // Fetch company logos / logo variations
  const { data: companyLogosData } = useQuery({
    queryKey: ['company-logos-options'],
    queryFn: () => api.get('/company-logos/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 5,
  });
  const { data: companiesData } = useQuery({
    queryKey: ['company-info-options'],
    queryFn: () => api.get('/companies/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 5,
  });

  const companyLogosList = companyLogosData ?? [];
  const primaryCompanyLogo = companiesData?.[0]?.company_logo || '';

  const allLogoOptions = [
    ...(primaryCompanyLogo ? [{ label: 'Primary Company Header Logo', url: primaryCompanyLogo }] : []),
    ...companyLogosList.map((l) => ({
      label: l.title || `Logo Variation #${l.serial_number || l.id}`,
      url: l.image,
    })),
  ];

  const generalTemplates = templates.filter(tmpl => !tmpl.is_generous && !(tmpl.status || tmpl.status_name));
  const statusTemplates = templates.filter(tmpl => !tmpl.is_generous && !!(tmpl.status || tmpl.status_name));
  const generousTemplates = templates.filter(tmpl => !!tmpl.is_generous);

  const targetTemplates = categoryTab === 'general'
    ? generalTemplates
    : categoryTab === 'status'
      ? statusTemplates
      : generousTemplates;

  const filteredTemplates = targetTemplates.filter(tmpl => {
    const statusName = (tmpl.status_name || statuses.find(s => String(s.id) === String(tmpl.status))?.name || '');
    if (categoryTab === 'status' && selectedStatusFilter && statusName.toLowerCase() !== selectedStatusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tmplName = (tmpl.name || '').toLowerCase();
      const tmplSubject = (tmpl.subject || '').toLowerCase();
      return statusName.toLowerCase().includes(q) || tmplName.includes(q) || tmplSubject.includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredTemplates.length / pageSize) || 1;
  const paginatedTemplates = filteredTemplates.slice((page - 1) * pageSize, page * pageSize);

  // Save (Create/Update) mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingTemplate) {
        return api.patch(`/email-templates/${editingTemplate.id}/`, data);
      }
      return api.post('/email-templates/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settings-email-templates']);
      toast.success(editingTemplate ? 'Template updated successfully!' : 'Template created successfully!');
      closeModal();
    },
    onError: (err) => {
      const errMsg = err.response?.data?.name?.[0] || err.response?.data?.detail || err.message;
      setFormError(errMsg);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/email-templates/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings-email-templates']);
      toast.success('Template deleted successfully!');
    },
    onError: (err) => toast.error('Failed to delete template: ' + (err.response?.data?.detail || err.message)),
  });

  const openCreateModal = () => {
    setEditingTemplate(null);
    setName('');
    if (categoryTab === 'generous') {
      setIsGenerous(true);
      setStatusId('');
      setTopLeftLogo('');
      setTopCenterLogo('');
      setName('Generous Email Template');
      setSubject('Notice: Special Update Regarding Your Visa Application');
      setBody(
        `Dear {{ applicant_name }},\n\nWe are writing to share an important update regarding your visa application (ID: {{ applicant_id }}).\n\nType your custom message here...\n\nBest regards,\nThe {{ company_name }} Team`
      );
    } else if (categoryTab === 'status') {
      setIsGenerous(false);
      setTopLeftLogo('');
      setTopCenterLogo('');
      const existingStatusIds = statusTemplates.map(t => String(t.status?.id || t.status));
      const firstUnused = statuses.find(s => !existingStatusIds.includes(String(s.id)));
      setStatusId(firstUnused ? firstUnused.id : (statuses[0]?.id || ''));
      setSubject('Application Status Update: {{ current_status }}');
      setBody(
        `<p>Dear <strong style="color: #0f172a;">{{ applicant_name }}</strong>,</p>\n<p>We are writing to inform you that there has been an update regarding your application (ID: <strong style="color: #0f172a;">{{ applicant_id }}</strong>).</p>\n<div class="status-box">\n  <span class="status-label">New Application Status</span>\n  <p class="status-value">{{ current_status }}</p>\n</div>\n<p>If you have any questions or require further assistance, please do not hesitate to contact our team.</p>\n<p>Best regards,<br>The {{ company_name }} Team</p>`
      );
    } else {
      setIsGenerous(false);
      setStatusId('');
      setTopLeftLogo('');
      setTopCenterLogo('');
      setSubject('Notice: Important Update Regarding Your Application');
      setBody(
        `<p>Dear <strong style="color: #0f172a;">{{ applicant_name }}</strong>,</p>\n<p>We would like to update you regarding your visa application (ID: <strong style="color: #0f172a;">{{ applicant_id }}</strong>).</p>\n<p>Type your custom message here...</p>\n<p>Best regards,<br>The {{ company_name }} Team</p>`
      );
    }
    setIsActive(true);
    setFormError('');
    setActiveTab('edit');
    setShowModal(true);
  };

  const openEditModal = (tmpl) => {
    setEditingTemplate(tmpl);
    setName(tmpl.name || '');
    setStatusId(tmpl.status?.id || tmpl.status || '');
    setSubject(tmpl.subject || '');
    setBody(tmpl.body || '');
    setIsActive(tmpl.is_active ?? true);
    setIsGenerous(tmpl.is_generous ?? (categoryTab === 'generous'));
    setTopLeftLogo(tmpl.top_left_logo || '');
    setTopCenterLogo(tmpl.top_center_logo || '');
    setFormError('');
    setActiveTab('edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormError('');
  };

  const handleInsertVariable = (tag) => {
    if (!bodyTextareaRef.current) {
      setBody(prev => prev + ' ' + tag);
      return;
    }
    const el = bodyTextareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newBody = body.substring(0, start) + tag + body.substring(end);
    setBody(newBody);
    
    // Restore focus and cursor position right after inserted tag
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setFormError('Please fill in Template Name, Subject, and Email Body.');
      return;
    }

    saveMutation.mutate({
      name: name.trim(),
      status: (categoryTab === 'generous' || isGenerous) ? null : (statusId || null),
      subject: subject.trim(),
      body: body.trim(),
      is_active: isActive,
      is_generous: categoryTab === 'generous' || isGenerous,
      top_left_logo: topLeftLogo,
      top_center_logo: topCenterLogo,
    });
  };

  // Helper for rendering live preview HTML in modal
  const renderPreviewHtml = () => {
    const selectedStatusObj = statuses.find(s => String(s.id) === String(statusId));
    const statusName = selectedStatusObj?.name || 'In Progress';
    const isRejected = statusName.toLowerCase().includes('reject');

    let textBody = body
      .replace(/\{\{\s*applicant_name\s*\}\}/g, 'John Doe')
      .replace(/\{\{\s*applicant_id\s*\}\}/g, 'APP-98241')
      .replace(/\{\{\s*passport_number\s*\}\}/g, 'A01928374')
      .replace(/\{\{\s*father_name\s*\}\}/g, 'Abdul Hasan')
      .replace(/\{\{\s*nid_number\s*\}\}/g, '1990123456789')
      .replace(/\{\{\s*visa\s*\}\}/g, 'General Employment Visa')
      .replace(/\{\{\s*country\s*\}\}/g, 'Italy')
      .replace(/\{\{\s*job\s*\}\}/g, 'Agricultural Specialist')
      .replace(/\{\{\s*current_status\s*\}\}/g, statusName)
      .replace(/\{\{\s*company_name\s*\}\}/g, 'Al Raiyan Group')
      .replace(/\{\{\s*lawyer_name\s*\}\}/g, 'Advocate Rakib Hasan')
      .replace(/\{\{\s*lawyer_address\s*\}\}/g, 'Chamber 402, High Court Annex, Dhaka')
      .replace(/\{\{\s*staff\s*\}\}/g, 'Mahmud Computers');

    // Strip raw HTML tags if typed
    // Strip raw HTML tags if typed
    textBody = textBody.replace(/<[^>]*>/g, '');

    // Format paragraphs & status box from plain text line breaks
    const lines = textBody.split('\n\n').filter(p => p.trim());
    const formattedChunks = [];

    lines.forEach(chunk => {
      const match = chunk.match(/^(?:Status|New Application Status)\s*:\s*(.*)$/i);
      if (match) {
        const customVal = match[1].trim() || statusName;
        const valRejected = isRejected || customVal.toLowerCase().includes('reject');
        
        if (valRejected) {
          formattedChunks.push(`
            <div class="status-box" style="background: linear-gradient(to right, #fef2f2, #ffffff); border-left: 4px solid #ef4444; border-right: 1px solid #fee2e2; border-top: 1px solid #fee2e2; border-bottom: 1px solid #fee2e2; padding: 18px 22px; margin: 22px 0; border-radius: 0 10px 10px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
              <span style="font-size: 11px; text-transform: uppercase; color: #991b1b; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 6px;">New Application Status</span>
              <span style="font-size: 16px; color: #b91c1c; font-weight: 800; margin: 0; display: inline-block; padding: 4px 14px; background-color: #fee2e2; border-radius: 20px;">${customVal}</span>
            </div>
          `);
        } else {
          formattedChunks.push(`
            <div class="status-box" style="background: linear-gradient(to right, #eff6ff, #ffffff); border-left: 4px solid #3b82f6; border-right: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 18px 22px; margin: 22px 0; border-radius: 0 10px 10px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
              <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 6px;">New Application Status</span>
              <span style="font-size: 16px; color: #1d4ed8; font-weight: 800; margin: 0; display: inline-block; padding: 4px 14px; background-color: #dbeafe; border-radius: 20px;">${customVal}</span>
            </div>
          `);
        }
      } else {
        formattedChunks.push(`<p style="margin: 0 0 16px 0; line-height: 1.7; color: #334155; font-size: 14.5px;">${chunk.replace(/\n/g, '<br>')}</p>`);
      }
    });

    const signatureHtml = `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: left;">
        <div style="color: #64748b; font-size: 14px; font-weight: 500; margin-bottom: 6px;">Best regards,</div>
        <div style="color: #0f172a; font-size: 16px; font-weight: 800;">Advocate Rakib Hasan</div>
        <div style="color: #64748b; font-size: 13px; font-weight: 600; margin-top: 2px;">Legal Representative</div>
        <div style="color: #64748b; font-size: 13px; font-weight: 400; margin-top: 3px;">Chamber 402, High Court Annex, Dhaka</div>
      </div>
    `;

    // Flag image sample (Italy flag URL)
    const sampleFlagUrl = "https://res.cloudinary.com/prfvuhln/image/upload/v1784399873/nltqujtitxsmmhv6x1vg.jpg";

    // Generous Template: Simple layout without header banner or footer
    if (categoryTab === 'generous' || isGenerous || editingTemplate?.is_generous) {
      const hasLogos = Boolean(topLeftLogo || topCenterLogo);
      return `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 24px; border-radius: 14px;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); padding: 30px 28px;">
            ${hasLogos ? `
              <div style="margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
                <div style="flex: 1; text-align: left;">
                  ${topLeftLogo ? `<img src="${topLeftLogo}" alt="Top Left Logo" style="max-height: 48px; max-width: 170px; object-fit: contain; display: inline-block;" />` : ''}
                </div>
                <div style="flex: 1; text-align: center;">
                  ${topCenterLogo ? `<img src="${topCenterLogo}" alt="Top Center Logo" style="max-height: 48px; max-width: 170px; object-fit: contain; display: inline-block;" />` : ''}
                </div>
                <div style="flex: 1;"></div>
              </div>
            ` : ''}
            <div style="font-size: 15px; line-height: 1.7; color: #334155;">
              ${formattedChunks.join('')}
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div style="font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.05);">
          
          <!-- CENTERED HEADER DESIGN: Applicant's Country Flag + Bold Country Name in Middle + Company Logo & Reference: Company Name -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 25px; color: #ffffff; text-align: center;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" valign="middle">
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 10px auto;">
                    <tr>
                      <td valign="middle" style="padding-right: 12px;">
                        <img src="${sampleFlagUrl}" alt="Italy Flag" style="width: 46px; height: 32px; object-fit: cover; border-radius: 6px; border: 2px solid rgba(255,255,255,0.4); display: block; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" />
                      </td>
                      <td valign="middle" align="left">
                        <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1.1;">ITALY</h1>
                      </td>
                    </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                    <tr>
                      <td valign="middle" align="center">
                        <p style="margin: 0; font-size: 13px; font-weight: 600; color: #e0f2fe; opacity: 0.95; letter-spacing: 0.3px;">Reference: Al Raiyan Group</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          <div style="padding: 30px 25px; font-size: 14.5px; line-height: 1.6; color: #334155;">
            ${formattedChunks.join('')}
            ${signatureHtml}
          </div>

          <div style="background-color: #f8fafc; padding: 18px 25px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            &copy; Al Raiyan Group. All rights reserved.
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            Email Templates & Automated Dispatch
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Customize notification templates sent to applicants on status updates or manual dispatch.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm shrink-0"
        >
          <PlusIcon className="w-4 h-4" /> Create Email Template
        </button>
      </div>

      {/* Category Tabs: General vs Status vs Generous Templates */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xs">
        <button
          onClick={() => { setCategoryTab('general'); setPage(1); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            categoryTab === 'general'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DocumentTextIcon className="w-4 h-4" />
          General / Manual Templates
          <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
            categoryTab === 'general' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {generalTemplates.length}
          </span>
        </button>

        <button
          onClick={() => { setCategoryTab('status'); setPage(1); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            categoryTab === 'status'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircleIcon className="w-4 h-4" />
          Status Email Templates
          <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
            categoryTab === 'status' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {statusTemplates.length}
          </span>
        </button>

        <button
          onClick={() => { setCategoryTab('generous'); setPage(1); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            categoryTab === 'generous'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          Generous Email Templates
          <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
            categoryTab === 'generous' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {generousTemplates.length}
          </span>
        </button>
      </div>

      {/* Templates List Header & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={categoryTab === 'status' ? "Search template name or status..." : "Search general template name or subject..."}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
              />
            </div>

            {/* Status Dropdown Filter - Only shown on Status Templates tab */}
            {categoryTab === 'status' && (
              <div className="w-full sm:w-52">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                >
                  <option value="">— All Application Statuses —</option>
                  {statuses.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page (Default)</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-semibold shrink-0">
              {filteredTemplates.length} Templates
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-400 text-xs mt-3">Loading email templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16 px-4">
            <DocumentTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No {categoryTab === 'general' ? 'General / Manual' : 'Status'} Templates Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {categoryTab === 'general'
                ? 'No general/manual email templates found. Click "Create Email Template" to add one.'
                : 'No status email templates matched your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">{categoryTab === 'general' ? 'Category' : 'Linked Status'}</th>
                  <th className="px-5 py-3.5">Template Name</th>
                  <th className="px-5 py-3.5">Email Subject</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {paginatedTemplates.map((tmpl) => {
                  const statusName = tmpl.status_name || (statuses.find(s => String(s.id) === String(tmpl.status))?.name);
                  const isRejected = statusName?.toLowerCase().includes('reject');

                  return (
                    <tr key={tmpl.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        {statusName ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isRejected
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {statusName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">General / Manual</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {tmpl.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                        {tmpl.subject}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          tmpl.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tmpl.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {tmpl.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(tmpl)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Template"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete template "${tmpl.name}"?`)) {
                                deleteMutation.mutate(tmpl.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Template"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingTemplate ? 'Edit Email Template' : 'Create New Email Template'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure subject, dynamic variable placeholders, and template body.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Mode Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'edit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <CodeBracketIcon className="w-3.5 h-3.5" /> Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <EyeIcon className="w-3.5 h-3.5" /> Designed Preview
                  </button>
                </div>

                <button
                  onClick={closeModal}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {formError}
                </div>
              )}

              {activeTab === 'edit' ? (
                <form id="template-form" onSubmit={handleSubmit} className="space-y-4">
                  {(categoryTab === 'generous' || isGenerous) && (
                    <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3 col-span-full">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <SparklesIcon className="w-4 h-4 text-amber-600" />
                        <span>Generous Template Header Logos (Optional):</span>
                      </div>
                      <p className="text-[11px] text-amber-700">
                        Select logo variations from company logos to place at top left or top center. This generous template uses a simple, clean layout without standard company headers or footers.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Top Left Logo (Optional)
                          </label>
                          <select
                            value={topLeftLogo}
                            onChange={e => setTopLeftLogo(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="">— No Top Left Logo —</option>
                            {allLogoOptions.map((opt, idx) => (
                              <option key={idx} value={opt.url}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {topLeftLogo && (
                            <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                              <img src={topLeftLogo} alt="Top Left Preview" className="h-8 max-w-[120px] object-contain" />
                              <span className="text-[10px] text-slate-500 font-medium">Top Left Logo Selected</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Top Center Logo (Optional)
                          </label>
                          <select
                            value={topCenterLogo}
                            onChange={e => setTopCenterLogo(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="">— No Top Center Logo —</option>
                            {allLogoOptions.map((opt, idx) => (
                              <option key={idx} value={opt.url}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {topCenterLogo && (
                            <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                              <img src={topCenterLogo} alt="Top Center Preview" className="h-8 max-w-[120px] object-contain" />
                              <span className="text-[10px] text-slate-500 font-medium">Top Center Logo Selected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Template Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Application Rejected Notification"
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    {categoryTab !== 'generous' && !isGenerous && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Linked Status (Automatic Trigger)
                        </label>
                        <select
                          value={statusId}
                          onChange={e => setStatusId(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">— None (Manual / General Template) —</option>
                          {statuses.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Email Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. Application Status Update: {{ current_status }}"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Dynamic Variables Helper Cheat Sheet */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <InformationCircleIcon className="w-4 h-4 text-blue-600" />
                      <span>Dynamic Variables Helper (Click to Insert into Body):</span>
                    </div>
                    
                    <div className="space-y-2">
                      {DYNAMIC_VARIABLES.map(grp => (
                        <div key={grp.group}>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            {grp.group}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {grp.items.map(v => (
                              <button
                                key={v.tag}
                                type="button"
                                onClick={() => handleInsertVariable(v.tag)}
                                className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-mono text-slate-700 hover:text-blue-700 transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                title={`Click to insert ${v.label}`}
                              >
                                <span className="font-bold text-blue-600">+</span>
                                <span>{v.tag}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Email Body (Plain Text) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-blue-600 font-bold">
                        ✨ Pure text — no HTML coding needed! Line breaks format as paragraphs automatically.
                      </span>
                    </div>
                    <textarea
                      ref={bodyTextareaRef}
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={8}
                      className="w-full p-4 border border-slate-200 rounded-xl text-sm font-sans leading-relaxed bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                      placeholder="Write your email body in normal plain text. Insert variables like {{ applicant_name }}, {{ visa }}, {{ passport_number }} as needed..."
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={e => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span>Active Template</span>
                    </label>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>This live preview demonstrates how the email will look when sent to applicants with real sample data.</span>
                  </div>

                  <div dangerouslySetInnerHTML={{ __html: renderPreviewHtml() }} />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {editingTemplate ? 'Editing existing template' : 'Creating new template'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                {activeTab === 'edit' && (
                  <button
                    type="submit"
                    form="template-form"
                    disabled={saveMutation.isPending}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {saveMutation.isPending ? 'Saving...' : 'Save Template'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

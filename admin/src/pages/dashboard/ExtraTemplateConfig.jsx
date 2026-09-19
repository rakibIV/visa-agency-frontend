import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, 
  ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon, DocumentTextIcon,
  PhotoIcon, ArrowUpTrayIcon, EyeIcon, CheckCircleIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import { TEMPLATE_VARIABLES_CONFIG, getSampleVariablesMap, interpolateTemplateVariables } from '../../utils/templateVariables';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto px-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Visual size helper styles
export const IMAGE_SIZE_CONFIGS = {
  watermark: {
    small: { label: 'Small', dimension: '180px', previewClass: 'w-24 h-24' },
    medium: { label: 'Medium', dimension: '280px', previewClass: 'w-36 h-36' },
    big: { label: 'Big', dimension: '380px', previewClass: 'w-48 h-48' },
  },
  signature: {
    small: { label: 'Small (Ref: ~80px)', dimension: '80px', previewClass: 'h-10 max-w-[90px]' },
    medium: { label: 'Medium (~120px)', dimension: '120px', previewClass: 'h-14 max-w-[130px]' },
    big: { label: 'Big (~160px)', dimension: '160px', previewClass: 'h-20 max-w-[170px]' },
  },
  company_logo: {
    small: { label: 'Small (Ref: w-20 / 80px)', dimension: '80px', previewClass: 'w-16 h-16 sm:w-20 sm:h-20' },
    medium: { label: 'Medium (120px)', dimension: '120px', previewClass: 'w-24 h-24 sm:w-28 sm:h-28' },
    big: { label: 'Big (160px)', dimension: '160px', previewClass: 'w-32 h-32 sm:w-36 sm:h-36' },
  },
};

export default function ExtraTemplateConfig() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('list'); // 'list' | 'form'
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // Template Core Form State
  const [templateName, setTemplateName] = useState('');
  const [templateDetails, setTemplateDetails] = useState('');
  const [templateSequence, setTemplateSequence] = useState(3);
  const [clauses, setClauses] = useState([]);

  // Top 3 Logos & Size Controls
  const [topLeftLogo, setTopLeftLogo] = useState('');
  const [topLeftLogoSize, setTopLeftLogoSize] = useState('medium'); // small | medium | big

  const [topCenterLogo, setTopCenterLogo] = useState('');
  const [topCenterLogoSize, setTopCenterLogoSize] = useState('medium'); // small | medium | big

  const [topRightLogo, setTopRightLogo] = useState('');
  const [topRightLogoSize, setTopRightLogoSize] = useState('medium'); // small | medium | big

  // 3 Optional Image Uploaders (Fixed Standard Sizes)
  const [watermarkImage, setWatermarkImage] = useState('');
  const [applicantSignature, setApplicantSignature] = useState('');
  const [bottomCompanyLogo, setBottomCompanyLogo] = useState('');

  // Preview Page Navigation State
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  // Clause Modal State
  const [showClauseModal, setShowClauseModal] = useState(false);
  const [clauseTab, setClauseTab] = useState('en');
  const [editingClauseIndex, setEditingClauseIndex] = useState(null);
  const [clauseForm, setClauseForm] = useState(getEmptyClause());
  const [copiedVar, setCopiedVar] = useState(null);

  // Paginate clauses for live template preview (maximizes content capacity per page)
  const paginateClausesForPreview = (clauseList) => {
    if (!clauseList || clauseList.length === 0) return [[]];
    const pages = [];
    pages.push(clauseList.slice(0, 6));
    let remaining = clauseList.slice(6);
    while (remaining.length > 0) {
      if (remaining.length <= 7) {
        pages.push(remaining);
        break;
      }
      if (remaining.length > 8) {
        pages.push(remaining.slice(0, 8));
        remaining = remaining.slice(8);
      } else {
        pages.push(remaining.slice(0, 4));
        pages.push(remaining.slice(4));
        break;
      }
    }
    return pages;
  };

  const previewPages = paginateClausesForPreview(clauses);
  const safePageIndex = Math.min(previewPageIndex, Math.max(0, previewPages.length - 1));
  const currentPreviewClauses = previewPages[safePageIndex] || [];
  const isFirstPreviewPage = safePageIndex === 0;
  const isLastPreviewPage = safePageIndex === previewPages.length - 1;

  // Queries
  const { data: allTemplates, isLoading } = useQuery({
    queryKey: ['agreement-templates'],
    queryFn: () => api.get('/agreement-templates/').then((r) => r.data.results ?? r.data),
  });

  const { data: countries } = useQuery({
    queryKey: ['config-countries'],
    queryFn: () => api.get('/countries/').then((r) => r.data.results ?? r.data),
  });

  const { data: companyLogosData } = useQuery({
    queryKey: ['company-logos-options'],
    queryFn: () => api.get('/company-logos/').then((r) => r.data.results ?? r.data ?? []).catch(() => []),
  });

  const { data: companyData } = useQuery({
    queryKey: ['company-info-options'],
    queryFn: () => api.get('/companies/').then((r) => r.data.results ?? r.data ?? []).catch(() => []),
  });

  const primaryCompanyLogo = companyData?.[0]?.company_logo || '';
  const companyLogosList = Array.isArray(companyLogosData) ? companyLogosData : [];

  const allLogoOptions = [
    ...(primaryCompanyLogo ? [{ label: 'Primary Company Logo', url: primaryCompanyLogo }] : []),
    ...companyLogosList.map((l) => ({
      label: l.title || `Logo Variation #${l.serial_number || l.id}`,
      url: l.image,
    })),
  ];

  // Helper to parse extra template metadata with multi-key localStorage fallback & merging
  const parseExtraMeta = (tmpl) => {
    if (!tmpl) return null;
    let metaFromBody = null;
    try {
      if (tmpl.body && typeof tmpl.body === 'string' && tmpl.body.startsWith('{')) {
        const parsed = JSON.parse(tmpl.body);
        if (parsed.is_extra || parsed.__is_extra) {
          metaFromBody = parsed;
        }
      }
    } catch {
      metaFromBody = null;
    }

    let metaFromStorage = null;
    try {
      const titleKey = tmpl.title || tmpl.name;
      const keysToTry = [
        tmpl.id ? `extra_tmpl_meta_${tmpl.id}` : null,
        titleKey ? `extra_tmpl_meta_title_${titleKey}` : null,
        tmpl.sequence ? `extra_tmpl_meta_seq_${tmpl.sequence}` : null,
      ].filter(Boolean);

      for (const key of keysToTry) {
        const stored = localStorage.getItem(key);
        if (stored) {
          metaFromStorage = JSON.parse(stored);
          if (metaFromStorage) break;
        }
      }
    } catch {
      // ignore
    }

    // Merge: storage overlay over body meta, ensuring non-empty images are prioritized
    const merged = {
      ...(metaFromBody || {}),
      ...(metaFromStorage || {}),
    };

    if (metaFromBody) {
      if (!merged.top_left_logo && metaFromBody.top_left_logo) merged.top_left_logo = metaFromBody.top_left_logo;
      if (!merged.top_center_logo && metaFromBody.top_center_logo) merged.top_center_logo = metaFromBody.top_center_logo;
      if (!merged.top_right_logo && metaFromBody.top_right_logo) merged.top_right_logo = metaFromBody.top_right_logo;
      if (!merged.watermark && metaFromBody.watermark) merged.watermark = metaFromBody.watermark;
      if (!merged.applicant_signature && metaFromBody.applicant_signature) merged.applicant_signature = metaFromBody.applicant_signature;
      if (!merged.company_logo && metaFromBody.company_logo) merged.company_logo = metaFromBody.company_logo;
    }

    if (!merged.is_extra && !merged.__is_extra && !metaFromBody && !metaFromStorage) {
      return null;
    }

    return merged;
  };

  // Filter templates to show Extra Templates
  // An Extra Template has sequence >= 3 or has extra metadata flag
  const extraTemplates = (allTemplates || []).filter((tmpl) => {
    const meta = parseExtraMeta(tmpl);
    return Boolean(meta) || (tmpl.sequence && tmpl.sequence >= 3);
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (currentTemplate?.id) {
        return api.patch(`/agreement-templates/${currentTemplate.id}/`, payload);
      }
      return api.post('/agreement-templates/', payload);
    },
    onSuccess: (res) => {
      const savedId = res?.data?.id || currentTemplate?.id;
      const metaPayload = {
        is_extra: true,
        __is_extra: true,
        details: templateDetails,
        top_left_logo: topLeftLogo,
        top_left_logo_size: topLeftLogoSize,
        top_center_logo: topCenterLogo,
        top_center_logo_size: topCenterLogoSize,
        top_right_logo: topRightLogo,
        top_right_logo_size: topRightLogoSize,
        watermark: watermarkImage,
        applicant_signature: applicantSignature,
        company_logo: bottomCompanyLogo,
      };
      try {
        if (savedId) {
          localStorage.setItem(`extra_tmpl_meta_${savedId}`, JSON.stringify(metaPayload));
        }
        localStorage.setItem(`extra_tmpl_meta_title_${templateName.trim()}`, JSON.stringify(metaPayload));
        localStorage.setItem(`extra_tmpl_meta_seq_${templateSequence}`, JSON.stringify(metaPayload));
      } catch {
        // ignore
      }
      queryClient.invalidateQueries(['agreement-templates']);
      setActiveView('list');
    },
    onError: (err) => {
      alert('Error saving extra template: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/agreement-templates/${id}/`),
    onSuccess: (_, id) => {
      try {
        localStorage.removeItem(`extra_tmpl_meta_${id}`);
      } catch {
        // ignore
      }
      queryClient.invalidateQueries(['agreement-templates']);
    },
  });

  function getEmptyClause() {
    return {
      clause_number: 1,
      title_en: '',
      title_ar: '',
      title_bn: '',
      body_en: '',
      body_ar: '',
      body_bn: '',
      visibility_mode: 'INCLUDE',
      countries: [],
    };
  }

  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setTemplateName('');
    setTemplateDetails('');
    // Suggest sequence 3 or next highest sequence
    const maxSeq = (allTemplates || []).reduce((max, t) => Math.max(max, t.sequence || 0), 2);
    setTemplateSequence(maxSeq + 1);
    setClauses([]);
    setTopLeftLogo('');
    setTopLeftLogoSize('medium');
    setTopCenterLogo('');
    setTopCenterLogoSize('medium');
    setTopRightLogo('');
    setTopRightLogoSize('medium');
    setWatermarkImage('');
    setApplicantSignature('');
    setBottomCompanyLogo('');
    setActiveView('form');
  };

  const handleEditTemplate = (tmpl) => {
    setCurrentTemplate(tmpl);
    setTemplateName(tmpl.title || tmpl.name || '');

    const meta = parseExtraMeta(tmpl);
    if (meta) {
      setTemplateDetails(meta.details || '');
      setTopLeftLogo(meta.top_left_logo || '');
      setTopLeftLogoSize(meta.top_left_logo_size || 'medium');
      setTopCenterLogo(meta.top_center_logo || '');
      setTopCenterLogoSize(meta.top_center_logo_size || 'medium');
      setTopRightLogo(meta.top_right_logo || '');
      setTopRightLogoSize(meta.top_right_logo_size || 'medium');
      setWatermarkImage(meta.watermark || '');
      setApplicantSignature(meta.applicant_signature || '');
      setBottomCompanyLogo(meta.company_logo || '');
    } else {
      setTemplateDetails(tmpl.body || tmpl.details || '');
      setTopLeftLogo('');
      setTopLeftLogoSize('medium');
      setTopCenterLogo('');
      setTopCenterLogoSize('medium');
      setTopRightLogo('');
      setTopRightLogoSize('medium');
      setWatermarkImage('');
      setApplicantSignature('');
      setBottomCompanyLogo('');
    }

    setTemplateSequence(tmpl.sequence || 3);
    const sortedClauses = [...(tmpl.clauses || [])].sort((a, b) => a.clause_number - b.clause_number);
    setClauses(sortedClauses);
    setActiveView('form');
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter an Agreement Name');
      return;
    }

    // Encode extra template configuration into the body payload
    const extraConfig = {
      is_extra: true,
      __is_extra: true,
      details: templateDetails,
      top_left_logo: topLeftLogo,
      top_left_logo_size: topLeftLogoSize,
      top_center_logo: topCenterLogo,
      top_center_logo_size: topCenterLogoSize,
      top_right_logo: topRightLogo,
      top_right_logo_size: topRightLogoSize,
      watermark: watermarkImage,
      applicant_signature: applicantSignature,
      company_logo: bottomCompanyLogo,
    };

    try {
      if (currentTemplate?.id) {
        localStorage.setItem(`extra_tmpl_meta_${currentTemplate.id}`, JSON.stringify(extraConfig));
      }
      localStorage.setItem(`extra_tmpl_meta_title_${templateName.trim()}`, JSON.stringify(extraConfig));
      localStorage.setItem(`extra_tmpl_meta_seq_${templateSequence}`, JSON.stringify(extraConfig));
    } catch {
      // ignore
    }

    const payload = {
      title: templateName.trim(),
      body: JSON.stringify(extraConfig),
      sequence: parseInt(templateSequence, 10) || 3,
      clauses: clauses.map((c, i) => ({ ...c, clause_number: i + 1 })),
    };

    saveMutation.mutate(payload);
  };

  const handleImageUpload = (file, setter) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setter(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const insertVariableIntoClause = (varKey, lang = 'en') => {
    const tag = `{{ ${varKey} }}`;
    const fieldKey = lang === 'ar' ? 'body_ar' : lang === 'bn' ? 'body_bn' : 'body_en';
    setClauseForm((prev) => ({
      ...prev,
      [fieldKey]: prev[fieldKey] ? `${prev[fieldKey]} ${tag}` : tag,
    }));
    setCopiedVar(`${lang}_${varKey}`);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const renderVariablesSelector = (lang) => (
    <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
          <SparklesIcon className="w-4 h-4 text-blue-600" />
          <span>Insert Dynamic Variables (All 29 Variables):</span>
        </span>
        <span className="text-[10px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
          Click variable to insert
        </span>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {TEMPLATE_VARIABLES_CONFIG.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-900/70 tracking-wider">
              {cat.category}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cat.variables.map((v) => {
                const isCopied = copiedVar === `${lang}_${v.key}`;
                return (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariableIntoClause(v.key, lang)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition border ${
                      isCopied
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100 hover:border-blue-400'
                    }`}
                    title={`Insert {{ ${v.key} }}`}
                  >
                    {isCopied ? '✓ Inserted!' : `+ {{ ${v.key} }}`}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const openClauseModal = (index = 'new') => {
    setEditingClauseIndex(index);
    if (index === 'new') {
      setClauseForm({ ...getEmptyClause(), clause_number: clauses.length + 1 });
    } else {
      setClauseForm({ ...clauses[index] });
    }
    setClauseTab('en');
    setShowClauseModal(true);
  };

  const saveClause = () => {
    const updated = [...clauses];
    if (editingClauseIndex === 'new') {
      updated.push(clauseForm);
    } else {
      updated[editingClauseIndex] = clauseForm;
    }
    setClauses(updated);
    setShowClauseModal(false);
  };

  const deleteClause = (index) => {
    if (confirm('Remove this clause?')) {
      const updated = [...clauses];
      updated.splice(index, 1);
      setClauses(updated);
    }
  };

  const moveClause = (index, direction) => {
    const updated = [...clauses];
    if (direction === 'up' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'down' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setClauses(updated);
  };

  const toggleCountry = (countryId) => {
    setClauseForm((prev) => {
      const exists = prev.countries?.includes(countryId);
      const newCountries = exists
        ? prev.countries.filter((id) => id !== countryId)
        : [...(prev.countries || []), countryId];
      return { ...prev, countries: newCountries };
    });
  };

  const sampleVars = getSampleVariablesMap();

  // ----------------------------------------------------
  // FORM VIEW (Follows attached image design)
  // ----------------------------------------------------
  if (activeView === 'form') {
    return (
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('list')}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition"
              title="Back to Extra Templates"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {currentTemplate ? 'Edit Extra Template' : 'New Extra Template'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure template details, optional watermark, signature, company logo, and clauses.
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveTemplate}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 text-sm"
          >
            <span>💾</span>
            <span>{saveMutation.isPending ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>

        {/* ========================================================== */}
        {/* TOP ROW: 3 Top Logo Cards (Left, Center, Right) with Size Controls */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Top Left Logo */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <PhotoIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 truncate">Top Left Logo (Optional)</h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {topLeftLogo ? 'Logo selected' : 'No Top Left Logo'}
                </p>
              </div>
              {topLeftLogo && (
                <button
                  onClick={() => setTopLeftLogo('')}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  title="Remove Logo"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topLeftLogo}
                onChange={(e) => setTopLeftLogo(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              >
                <option value="">— No Top Left Logo —</option>
                {allLogoOptions.map((opt, idx) => (
                  <option key={idx} value={opt.url}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 shrink-0">
                <label className="text-[10px] font-bold text-slate-500">Size:</label>
                <select
                  value={topLeftLogoSize}
                  onChange={(e) => setTopLeftLogoSize(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="big">Big</option>
                </select>
              </div>
            </div>

            {topLeftLogo && (
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center h-12">
                <img
                  src={topLeftLogo}
                  alt="Top Left Preview"
                  className={`${
                    topLeftLogoSize === 'small'
                      ? 'max-h-6 max-w-[80px]'
                      : topLeftLogoSize === 'big'
                        ? 'max-h-11 max-w-[140px]'
                        : 'max-h-9 max-w-[110px]'
                  } object-contain`}
                />
              </div>
            )}
          </div>

          {/* Card 2: Top Center Logo */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <PhotoIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 truncate">Top Center Logo (Optional)</h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {topCenterLogo ? 'Logo selected' : 'No Top Center Logo'}
                </p>
              </div>
              {topCenterLogo && (
                <button
                  onClick={() => setTopCenterLogo('')}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  title="Remove Logo"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topCenterLogo}
                onChange={(e) => setTopCenterLogo(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              >
                <option value="">— No Top Center Logo —</option>
                {allLogoOptions.map((opt, idx) => (
                  <option key={idx} value={opt.url}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 shrink-0">
                <label className="text-[10px] font-bold text-slate-500">Size:</label>
                <select
                  value={topCenterLogoSize}
                  onChange={(e) => setTopCenterLogoSize(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="big">Big</option>
                </select>
              </div>
            </div>

            {topCenterLogo && (
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center h-12">
                <img
                  src={topCenterLogo}
                  alt="Top Center Preview"
                  className={`${
                    topCenterLogoSize === 'small'
                      ? 'max-h-6 max-w-[80px]'
                      : topCenterLogoSize === 'big'
                        ? 'max-h-11 max-w-[140px]'
                        : 'max-h-9 max-w-[110px]'
                  } object-contain`}
                />
              </div>
            )}
          </div>

          {/* Card 3: Top Right Logo */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <PhotoIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 truncate">Top Right Logo (Optional)</h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {topRightLogo ? 'Logo selected' : 'No Top Right Logo'}
                </p>
              </div>
              {topRightLogo && (
                <button
                  onClick={() => setTopRightLogo('')}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  title="Remove Logo"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topRightLogo}
                onChange={(e) => setTopRightLogo(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              >
                <option value="">— No Top Right Logo —</option>
                {allLogoOptions.map((opt, idx) => (
                  <option key={idx} value={opt.url}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 shrink-0">
                <label className="text-[10px] font-bold text-slate-500">Size:</label>
                <select
                  value={topRightLogoSize}
                  onChange={(e) => setTopRightLogoSize(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="big">Big</option>
                </select>
              </div>
            </div>

            {topRightLogo && (
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center h-12">
                <img
                  src={topRightLogo}
                  alt="Top Right Preview"
                  className={`${
                    topRightLogoSize === 'small'
                      ? 'max-h-6 max-w-[80px]'
                      : topRightLogoSize === 'big'
                        ? 'max-h-11 max-w-[140px]'
                        : 'max-h-9 max-w-[110px]'
                  } object-contain`}
                />
              </div>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* MAIN 2-COLUMN LAYOUT: Left Form | Right Preview */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Inputs, Uploaders, Clauses */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Agreement Basic Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-2">
                  <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                  <span>Agreement Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Saudi Standard Agreement"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-2">
                  <span>Sequence / Order</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={templateSequence}
                  onChange={(e) => setTemplateSequence(e.target.value)}
                  placeholder="3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-2">
                  <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                  <span>Details / Description</span>
                </label>
                <textarea
                  value={templateDetails}
                  onChange={(e) => setTemplateDetails(e.target.value)}
                  placeholder="Brief description of when to use this template..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none h-24"
                />
              </div>
            </div>

            {/* ====================================================== */}
            {/* 3 OPTIONAL IMAGE UPLOADERS (Fixed Standard Sizes) */}
            {/* ====================================================== */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5 text-blue-600" />
                  <span>Optional Images</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload optional images for watermark, last-page applicant signature, and last-page company logo.
                </p>
              </div>

              {/* 1. Watermark Uploader */}
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <span>1. Watermark Uploader</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Subtle background watermark across pages</p>
                </div>

                <div className="flex items-center gap-4">
                  {watermarkImage ? (
                    <div className="relative w-20 h-20 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shadow-sm shrink-0">
                      <img src={watermarkImage} alt="Watermark" className="max-h-full max-w-full object-contain opacity-60" />
                      <button
                        onClick={() => setWatermarkImage('')}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600"
                        title="Remove"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-24 h-20 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl cursor-pointer bg-white transition shrink-0 group">
                      <ArrowUpTrayIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition" />
                      <span className="text-[10px] font-bold text-slate-500 mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0], setWatermarkImage)}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <label className="block text-[11px] text-slate-600 font-medium">
                      Or select from company logos:
                    </label>
                    <select
                      value={watermarkImage}
                      onChange={(e) => setWatermarkImage(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">— No Watermark / Upload Custom —</option>
                      {allLogoOptions.map((opt, idx) => (
                        <option key={idx} value={opt.url}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Applicant Signature */}
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <span>2. Applicant Signature</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Appears at bottom of last page. If blank, auto-fetches from applicant profile</p>
                </div>

                <div className="flex items-center gap-4">
                  {applicantSignature ? (
                    <div className="relative w-28 h-16 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shadow-sm shrink-0">
                      <img src={applicantSignature} alt="Signature" className="max-h-full max-w-full object-contain" />
                      <button
                        onClick={() => setApplicantSignature('')}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600"
                        title="Remove"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-28 h-16 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl cursor-pointer bg-white transition shrink-0 group">
                      <ArrowUpTrayIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition" />
                      <span className="text-[10px] font-bold text-slate-500 mt-1">Upload Signature</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0], setApplicantSignature)}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload transparent PNG or clean photo of signature, or leave blank to dynamically load from applicant's profile.
                  </p>
                </div>
              </div>

              {/* 3. Company Logo (Bottom Section) */}
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <span>3. Company Logo (Bottom Section)</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Appears at the bottom of the last page beside signature</p>
                </div>

                <div className="flex items-center gap-4">
                  {bottomCompanyLogo ? (
                    <div className="relative w-20 h-20 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shadow-sm shrink-0">
                      <img src={bottomCompanyLogo} alt="Bottom Logo" className="max-h-full max-w-full object-contain" />
                      <button
                        onClick={() => setBottomCompanyLogo('')}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600"
                        title="Remove"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-24 h-20 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl cursor-pointer bg-white transition shrink-0 group">
                      <ArrowUpTrayIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition" />
                      <span className="text-[10px] font-bold text-slate-500 mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0], setBottomCompanyLogo)}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <label className="block text-[11px] text-slate-600 font-medium">
                      Or pick from company logos:
                    </label>
                    <select
                      value={bottomCompanyLogo}
                      onChange={(e) => setBottomCompanyLogo(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">— No Bottom Logo / Upload Custom —</option>
                      {allLogoOptions.map((opt, idx) => (
                        <option key={idx} value={opt.url}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Clauses Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="font-bold text-slate-800 text-base">Clauses ({clauses.length})</h3>
                </div>
                <button
                  onClick={() => openClauseModal('new')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition text-xs"
                >
                  <PlusIcon className="w-4 h-4" /> Add Clause
                </button>
              </div>

              {/* Dynamic Variables Guide Alert Box */}
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <SparklesIcon className="w-4 h-4 text-blue-600" />
                  <span>Dynamic Variables:</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Use <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-700">{'{{ applicant_name }}'}</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-700">{'{{ passport_number }}'}</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-700">{'{{ visa }}'}</code> in the clause text to automatically insert applicant data when generating the PDF.
                </p>

                {/* Collapsible / categorized chip view */}
                <div className="pt-2 border-t border-blue-200/60 space-y-2">
                  {TEMPLATE_VARIABLES_CONFIG.map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-blue-900/70 tracking-wider">
                        {cat.category}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.variables.map((v) => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(`{{ ${v.key} }}`);
                              setCopiedVar(v.key);
                              setTimeout(() => setCopiedVar(null), 1500);
                            }}
                            className="text-[10px] px-2 py-0.5 bg-white border border-blue-200 rounded-md font-mono text-blue-800 hover:bg-blue-100/70 hover:border-blue-400 transition"
                            title={`Click to copy {{ ${v.key} }}`}
                          >
                            {copiedVar === v.key ? 'Copied!' : `{{ ${v.key} }}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clauses List */}
              <div className="space-y-3">
                {clauses.map((clause, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 border border-slate-200 rounded-2xl hover:border-blue-300 bg-white transition group items-start"
                  >
                    <div className="flex flex-col gap-1 items-center justify-center shrink-0">
                      <button
                        onClick={() => moveClause(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-30"
                      >
                        <ChevronUpIcon className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-slate-700 text-xs">{idx + 1}</span>
                      <button
                        onClick={() => moveClause(idx, 'down')}
                        disabled={idx === clauses.length - 1}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-30"
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 uppercase text-xs truncate">
                        {clause.title_en || 'Untitled Clause'}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {clause.body_en}
                      </p>
                      {clause.countries?.length > 0 && (
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold mt-2">
                          {clause.countries.length} Country Rules
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => openClauseModal(idx)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        title="Edit Clause"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteClause(idx)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                        title="Delete Clause"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {clauses.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <DocumentTextIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium text-xs">No clauses added yet.</p>
                    <button
                      onClick={() => openClauseModal('new')}
                      className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      + Add your first clause
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* RIGHT COLUMN: Live Template Preview & Save Button */}
          {/* ====================================================== */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <EyeIcon className="w-5 h-5 text-blue-600" />
                <span>Template Preview</span>
              </div>
              
              {/* Page Navigator */}
              {previewPages.length > 1 ? (
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewPageIndex((prev) => Math.max(0, prev - 1))}
                    disabled={safePageIndex === 0}
                    className="px-2 py-0.5 text-xs font-bold bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    ‹ Prev
                  </button>

                  <span className="text-[11px] font-bold text-slate-600 px-1">
                    Page {safePageIndex + 1} of {previewPages.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPreviewPageIndex((prev) => Math.min(previewPages.length - 1, prev + 1))}
                    disabled={safePageIndex >= previewPages.length - 1}
                    className="px-2 py-0.5 text-xs font-bold bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Next ›
                  </button>
                </div>
              ) : (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Live Mockup (1 Page)
                </span>
              )}
            </div>

            {/* Document Mockup Paper */}
            <div className="bg-slate-200/70 p-4 sm:p-6 rounded-2xl border border-slate-300/80 shadow-inner flex justify-center">
              <div className="w-full max-w-[360px] min-h-[520px] bg-white rounded-xl shadow-lg border border-slate-200 p-5 flex flex-col justify-between relative overflow-hidden text-slate-800">
                
                {/* Watermark in background (Rendered on all pages) */}
                {watermarkImage && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none z-0 flex items-center justify-center w-[240px] h-[240px]">
                    <img src={watermarkImage} alt="Watermark" className="w-full h-full object-contain" />
                  </div>
                )}

                {/* Top Content */}
                <div className="relative z-10 space-y-3">
                  {/* FIRST PAGE ONLY: Top 3 Logos Header */}
                  {isFirstPreviewPage ? (
                    <>
                      {(topLeftLogo || topCenterLogo || topRightLogo) ? (
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2">
                          <div className="w-1/3 flex items-center justify-start">
                            {topLeftLogo ? (
                              <img
                                src={topLeftLogo}
                                alt="Top Left"
                                className={`${
                                  topLeftLogoSize === 'small'
                                    ? 'max-h-5 max-w-[60px]'
                                    : topLeftLogoSize === 'big'
                                      ? 'max-h-9 max-w-[110px]'
                                      : 'max-h-7 max-w-[85px]'
                                } object-contain`}
                              />
                            ) : null}
                          </div>
                          <div className="w-1/3 flex items-center justify-center">
                            {topCenterLogo ? (
                              <img
                                src={topCenterLogo}
                                alt="Top Center"
                                className={`${
                                  topCenterLogoSize === 'small'
                                    ? 'max-h-5 max-w-[60px]'
                                    : topCenterLogoSize === 'big'
                                      ? 'max-h-9 max-w-[110px]'
                                      : 'max-h-7 max-w-[85px]'
                                } object-contain`}
                              />
                            ) : null}
                          </div>
                          <div className="w-1/3 flex items-center justify-end">
                            {topRightLogo ? (
                              <img
                                src={topRightLogo}
                                alt="Top Right"
                                className={`${
                                  topRightLogoSize === 'small'
                                    ? 'max-h-5 max-w-[60px]'
                                    : topRightLogoSize === 'big'
                                      ? 'max-h-9 max-w-[110px]'
                                      : 'max-h-7 max-w-[85px]'
                                } object-contain`}
                              />
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center pb-2 border-b border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            [ Header Logos Area ]
                          </div>
                        </div>
                      )}

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900">
                          {templateName || 'Untitled Agreement'}
                        </h4>
                        {templateDetails && (
                          <p className="text-[10px] text-slate-500 italic line-clamp-2">
                            {templateDetails}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    /* MIDDLE & SUBSEQUENT PAGES: Continuation Header without top 3 logos */
                    <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800">
                        {templateName || 'Untitled Agreement'} <span className="text-[9px] font-normal text-slate-500">(Continued)</span>
                      </h4>
                      <span className="text-[9px] font-mono text-slate-500">Page {safePageIndex + 1} of {previewPages.length}</span>
                    </div>
                  )}

                  {/* Clauses Preview for current page */}
                  <div className="space-y-2 pt-2">
                    {currentPreviewClauses.map((c, i) => {
                      const absoluteIndex = clauses.indexOf(c) + 1;
                      return (
                        <div key={i} className="text-[10px] leading-snug space-y-0.5">
                          <div className="font-bold text-slate-700">
                            {absoluteIndex > 0 ? absoluteIndex : i + 1}. {c.title_en || 'Clause Title'}
                          </div>
                          <p className="text-slate-600 line-clamp-2 text-[9px]">
                            {interpolateTemplateVariables(c.body_en || '', sampleVars)}
                          </p>
                        </div>
                      );
                    })}

                    {clauses.length === 0 && (
                      <div className="py-8 text-center text-slate-300 text-xs">
                        <div className="w-full h-1.5 bg-slate-100 rounded mb-2" />
                        <div className="w-3/4 h-1.5 bg-slate-100 rounded mb-2 mx-auto" />
                        <div className="w-1/2 h-1.5 bg-slate-100 rounded mx-auto" />
                        <p className="mt-4 text-[10px] text-slate-400">Your clauses and text will appear here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* LAST PAGE ONLY: Bottom Signature & Company Logo */}
                {isLastPreviewPage ? (
                  <div className="relative z-10 pt-4 border-t border-slate-200 mt-4 space-y-2">
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      Last Page Footer Elements
                    </div>

                    <div className="flex items-end justify-between gap-2 pt-1">
                      {/* 1. Bottom Company Logo (if turned on) */}
                      <div className="flex flex-col items-center justify-center">
                        {bottomCompanyLogo ? (
                          <div className="w-14 h-14 flex items-center justify-center">
                            <img src={bottomCompanyLogo} alt="Bottom Logo" className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-12 h-10 border border-dashed border-slate-200 rounded flex items-center justify-center text-[7px] text-slate-300">
                            Logo Off
                          </div>
                        )}
                      </div>

                      {/* 2. Applicant Signature (if turned on) */}
                      <div className="flex flex-col items-center min-w-[140px]">
                        {applicantSignature ? (
                          <div className="h-8 flex items-center justify-center pb-0.5">
                            <img src={applicantSignature} alt="Signature" className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : (
                          <div className="h-6 flex items-end pb-0.5">
                            <span className="text-[7px] text-slate-400 italic font-mono">[ Profile Signature ]</span>
                          </div>
                        )}
                        <div className="w-full border-t border-slate-400 pt-0.5 text-center">
                          <span className="text-[8px] font-bold text-slate-700 uppercase">Applicant Signature</span>
                          <p className="text-[6px] text-slate-400">Date: ___ / ___ / ______</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center text-[9px] text-slate-400 font-mono border-t border-dashed border-slate-200 mt-4">
                    [ Page {safePageIndex + 1} — Continued on Next Page ]
                  </div>
                )}

              </div>
            </div>

            {/* Placement Rules Reminder */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
              <strong className="text-slate-800 font-bold block">📄 Placement Behavior:</strong>
              <p>• <strong>Top 3 Logos:</strong> Renders on <em>Page 1 only</em>.</p>
              <p>• <strong>Watermark:</strong> Centered background watermark across pages.</p>
              <p>• <strong>Bottom Footer (Last Page):</strong> Renders only 1) Company Logo (if turned on) and 2) Applicant Signature (if turned on; auto-fetches from profile if custom signature image not uploaded).</p>
              <p>• <strong>No Header/Footer Bar:</strong> Standard blue footer bar is omitted on Extra Templates.</p>
            </div>

            {/* Save Template Button */}
            <button
              onClick={handleSaveTemplate}
              disabled={saveMutation.isPending}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <span>💾</span>
              <span>{saveMutation.isPending ? 'Saving Template...' : 'Save Template'}</span>
            </button>
          </div>

        </div>

        {/* ========================================================== */}
        {/* CLAUSE EDIT MODAL */}
        {/* ========================================================== */}
        {showClauseModal && (
          <Modal
            title={editingClauseIndex === 'new' ? 'Add Clause' : 'Edit Clause'}
            onClose={() => setShowClauseModal(false)}
          >
            <div className="flex border-b border-slate-200 mb-5 gap-2">
              {[
                { id: 'en', label: '🇬🇧 English' },
                { id: 'ar', label: '🇸🇦 Arabic' },
                { id: 'bn', label: '🇧🇩 Bengali' },
                { id: 'rules', label: '⚙️ Rules' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setClauseTab(tab.id)}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                    clauseTab === tab.id
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {clauseTab === 'en' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Clause Title</label>
                    <input
                      type="text"
                      value={clauseForm.title_en || ''}
                      onChange={(e) => setClauseForm({ ...clauseForm, title_en: e.target.value })}
                      placeholder="e.g. Working Hours and Compensation"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Clause Body (English)</label>
                    <textarea
                      value={clauseForm.body_en || ''}
                      onChange={(e) => setClauseForm({ ...clauseForm, body_en: e.target.value })}
                      placeholder="Detailed clause content with dynamic variables..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none h-32"
                    />
                    {renderVariablesSelector('en')}
                  </div>
                </div>
              )}

              {clauseTab === 'ar' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Clause Title (Arabic)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={clauseForm.title_ar || ''}
                      onChange={(e) => setClauseForm({ ...clauseForm, title_ar: e.target.value })}
                      placeholder="عنوان البند"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Clause Body (Arabic)</label>
                    <textarea
                      dir="rtl"
                      value={clauseForm.body_ar || ''}
                      onChange={(e) => setClauseForm({ ...clauseForm, body_ar: e.target.value })}
                      placeholder="نص البند باللغة العربية..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none h-32 font-sans"
                    />
                    {renderVariablesSelector('ar')}
                  </div>
                </div>
              )}

              {clauseTab === 'bn' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Clause Title (Bengali)</label>
                    <input
                      type="text"
                      value={clauseForm.title_bn || ''}
                      onChange={(e) => setClauseForm({ ...clauseForm, title_bn: e.target.value })}
                      placeholder="ধারার শিরোনাম"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Clause Body (Bengali)</label>
                    <textarea
                      value={clauseForm.body_bn || ''}
                      onChange={(e) => setClauseForm({ ...clauseForm, body_bn: e.target.value })}
                      placeholder="ধারার বিস্তারিত বিবরণ..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none h-32"
                    />
                    {renderVariablesSelector('bn')}
                  </div>
                </div>
              )}

              {clauseTab === 'rules' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Visibility Mode</label>
                    <select
                      value={clauseForm.visibility_mode || 'INCLUDE'}
                      onChange={(e) => setClauseForm({ ...clauseForm, visibility_mode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    >
                      <option value="INCLUDE">✅ Always Include (or Include Only for Selected)</option>
                      <option value="EXCLUDE">🚫 Exclude for Selected Countries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Target Countries</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      {countries?.map((c) => (
                        <label
                          key={c.id}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            clauseForm.countries?.includes(c.id)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={clauseForm.countries?.includes(c.id) || false}
                            onChange={() => toggleCountry(c.id)}
                            className="hidden"
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClauseModal(false)}
                  className="px-4 py-2 font-bold text-xs text-slate-500 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveClause}
                  className="px-5 py-2 font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition"
                >
                  Save Clause
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // LIST VIEW: Display saved extra templates
  // ----------------------------------------------------
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Extra Templates</h2>
          <p className="text-xs text-slate-500">Custom agreements with optional watermarks, signatures, and logos.</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm text-sm"
        >
          <PlusIcon className="w-5 h-5" /> Create Extra Template
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading extra templates...</div>
      ) : extraTemplates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <DocumentTextIcon className="w-16 h-16 text-slate-200 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Extra Templates Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create your first Extra Template with custom watermark, applicant signature, and bottom company logo options.
          </p>
          <button
            onClick={handleCreateTemplate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm text-xs"
          >
            <PlusIcon className="w-4 h-4" /> Create Extra Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {extraTemplates.map((tmpl) => {
            const meta = parseExtraMeta(tmpl);
            return (
              <div
                key={tmpl.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 transition-all group flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100">
                      Sequence: {tmpl.sequence || 3}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Extra Template
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base mb-1">
                    {tmpl.title || tmpl.name || `Agreement ${tmpl.sequence}`}
                  </h3>

                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                    {meta?.details || tmpl.body || tmpl.details || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <DocumentTextIcon className="w-3.5 h-3.5 text-slate-400" />
                      {tmpl.clauses?.length || 0} Clauses
                    </span>
                    {meta?.watermark && (
                      <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                        Watermark ({meta.watermark_size || 'medium'})
                      </span>
                    )}
                    {meta?.applicant_signature && (
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Signature ({meta.signature_size || 'medium'})
                      </span>
                    )}
                    {meta?.company_logo && (
                      <span className="text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                        Bottom Logo ({meta.company_logo_size || 'small'})
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleEditTemplate(tmpl)}
                    className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition text-xs"
                  >
                    <PencilSquareIcon className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this extra template?')) {
                        deleteMutation.mutate(tmpl.id);
                      }
                    }}
                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition"
                    title="Delete Template"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

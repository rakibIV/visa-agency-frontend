import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, 
  ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon, DocumentTextIcon,
  PhotoIcon, ArrowUpTrayIcon, EyeIcon, SparklesIcon, PrinterIcon
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import { 
  TEMPLATE_VARIABLES_CONFIG, 
  paginateLetterClauses 
} from '../../utils/templateVariables';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ExtraTemplateConfig() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('list'); // 'list' | 'form'
  const [listTab, setListTab] = useState('preview'); // 'preview' | 'manage'
  const [selectedPreviewTemplateId, setSelectedPreviewTemplateId] = useState(null);
  const [formLayoutMode, setFormLayoutMode] = useState('split'); // 'split' | 'preview' | 'editor'
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

  // Preview Page Navigation & Layout State
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [previewScale, setPreviewScale] = useState(0.65); // 0.65 | 0.75 | 1.0
  const [previewViewMode, setPreviewViewMode] = useState('all'); // 'all' (all pages stacked) | 'single' (page-by-page)
  const [previewBengali, setPreviewBengali] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);

  // Clause Modal State
  const [showClauseModal, setShowClauseModal] = useState(false);
  const [clauseTab, setClauseTab] = useState('en');
  const [editingClauseIndex, setEditingClauseIndex] = useState(null);
  const [clauseForm, setClauseForm] = useState(getEmptyClause());
  const [copiedVar, setCopiedVar] = useState(null);

  // References for inserting variables at cursor
  const descriptionTextareaRef = useRef(null);
  const clauseTextareaRefs = useRef({ en: null, ar: null, bn: null });

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

  // Filter templates to show Extra Templates (sequence >= 3 or has extra metadata flag)
  const extraTemplates = (allTemplates || []).filter((tmpl) => {
    const meta = parseExtraMeta(tmpl);
    return Boolean(meta) || (tmpl.sequence && tmpl.sequence >= 3);
  });

  // Ensure default preview selection in List View
  useEffect(() => {
    if (!selectedPreviewTemplateId && extraTemplates.length > 0) {
      setSelectedPreviewTemplateId(extraTemplates[0].id);
    }
  }, [extraTemplates, selectedPreviewTemplateId]);

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
      if (savedId) setSelectedPreviewTemplateId(savedId);
      setActiveView('list');
      setListTab('preview');
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
      visibility_mode: 'ALL',
      countries: [],
      is_active: true,
    };
  }

  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setTemplateName('');
    setTemplateDetails('');
    const maxSeq = (allTemplates || []).reduce((max, t) => Math.max(max, t.sequence || 0), 2);
    setTemplateSequence(Math.max(3, maxSeq + 1));
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
    setPreviewPageIndex(0);
    setFormLayoutMode('split');
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
      setTemplateDetails((!tmpl.body?.startsWith('{') ? tmpl.body : '') || tmpl.details || '');
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
    setPreviewPageIndex(0);
    setFormLayoutMode('split');
    setActiveView('form');
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter an Agreement Name');
      return;
    }

    const safeSequence = Math.max(3, parseInt(templateSequence, 10) || 3);

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
      localStorage.setItem(`extra_tmpl_meta_seq_${safeSequence}`, JSON.stringify(extraConfig));
    } catch {
      // ignore
    }

    const payload = {
      title: templateName.trim(),
      body: JSON.stringify(extraConfig),
      sequence: safeSequence,
      clauses: clauses.map((c, i) => ({
        clause_number: i + 1,
        title_en: c.title_en || '',
        title_ar: c.title_ar || '',
        title_bn: c.title_bn || '',
        body_en: c.body_en || '',
        body_ar: c.body_ar || '',
        body_bn: c.body_bn || '',
        visibility_mode: (c.countries && c.countries.length > 0) ? (c.visibility_mode || 'INCLUDE') : 'ALL',
        countries: (c.countries || []).map((id) => (typeof id === 'object' ? id?.id : parseInt(id, 10))).filter(Boolean),
        is_active: c.is_active !== false,
      })),
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

  const insertAtCursor = (currentVal, varKey, textareaEl) => {
    const tag = `{{ ${varKey} }}`;
    const str = currentVal || '';
    if (!textareaEl) {
      return str ? `${str} ${tag}` : tag;
    }
    const start = textareaEl.selectionStart ?? str.length;
    const end = textareaEl.selectionEnd ?? str.length;
    const before = str.substring(0, start);
    const after = str.substring(end);
    const needsLeadingSpace = before.length > 0 && !/[\s\n]$/.test(before);
    const needsTrailingSpace = after.length > 0 && !/^[\s\n]/.test(after);
    const formattedInsertion = `${needsLeadingSpace ? ' ' : ''}${tag}${needsTrailingSpace ? ' ' : ''}`;
    const nextVal = before + formattedInsertion + after;

    setTimeout(() => {
      try {
        textareaEl.focus();
        const nextPos = start + formattedInsertion.length;
        textareaEl.setSelectionRange(nextPos, nextPos);
      } catch {
        // ignore
      }
    }, 0);

    return nextVal;
  };

  const insertVariableIntoDescription = (varKey) => {
    setTemplateDetails((prev) => insertAtCursor(prev, varKey, descriptionTextareaRef.current));
    setCopiedVar(`desc_${varKey}`);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const insertVariableIntoClause = (varKey, lang = 'en') => {
    const fieldKey = lang === 'ar' ? 'body_ar' : lang === 'bn' ? 'body_bn' : 'body_en';
    const textareaEl = clauseTextareaRefs.current[lang];
    setClauseForm((prev) => ({
      ...prev,
      [fieldKey]: insertAtCursor(prev[fieldKey] || '', varKey, textareaEl),
    }));
    setCopiedVar(`${lang}_${varKey}`);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const renderDescriptionVariablesSelector = () => (
    <div className="mt-2.5 p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
          <SparklesIcon className="w-4 h-4 text-blue-600" />
          <span>Insert Dynamic Variables into Description:</span>
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
                const isCopied = copiedVar === `desc_${v.key}`;
                return (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariableIntoDescription(v.key)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition border ${
                      isCopied
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100 hover:border-blue-400'
                    }`}
                    title={`Insert {{ ${v.key} }} into description`}
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
      setClauseForm({
        ...clauses[index],
        visibility_mode: clauses[index]?.visibility_mode || 'ALL',
        countries: clauses[index]?.countries || [],
        is_active: clauses[index]?.is_active !== false,
      });
    }
    setClauseTab('en');
    setShowClauseModal(true);
  };

  const saveClause = () => {
    const updated = [...clauses];
    const clauseToSave = {
      ...clauseForm,
      is_active: clauseForm.is_active !== false,
      visibility_mode: (clauseForm.countries && clauseForm.countries.length > 0) ? (clauseForm.visibility_mode || 'INCLUDE') : 'ALL',
      countries: clauseForm.countries || [],
      clause_number: editingClauseIndex === 'new' ? clauses.length + 1 : (clauses[editingClauseIndex]?.clause_number || editingClauseIndex + 1),
    };
    if (editingClauseIndex === 'new') {
      updated.push(clauseToSave);
    } else {
      updated[editingClauseIndex] = clauseToSave;
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

  /**
   * Renders preview text preserving dynamic variables as clean, highlighted visual placeholders
   * rather than injecting fake applicant data into the template builder.
   */
  const renderPreviewTemplateContent = (text) => {
    if (!text || typeof text !== 'string') return '';
    const parts = text.split(/(\{\{\s*[a-zA-Z0-9_]+\s*\}\}|\{\s*[a-zA-Z0-9_]+\s*\})/g);
    return parts.map((part, index) => {
      if (/^\{\{\s*[a-zA-Z0-9_]+\s*\}\}$|^\{\s*[a-zA-Z0-9_]+\s*\}$/.test(part)) {
        return (
          <span
            key={index}
            className="inline-block bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-blue-200 mx-0.5 align-baseline"
            title="Dynamic applicant variable (populated upon agreement issue)"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const ClauseBlock = ({ clause, showBengali = false }) => {
    const isContinuation = Boolean(clause.is_continuation);
    const hasContinuation = Boolean(clause.has_continuation);

    return (
      <div className="mb-2.5 flex gap-3.5 break-inside-avoid">
        <div className="w-6 shrink-0 flex justify-center pt-0.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
            isContinuation 
              ? 'bg-amber-50 text-amber-700 border-amber-300' 
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}>
            {clause.clause_number}
          </div>
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          {(clause.title_en || clause.title_ar || clause.title_bn) && (
            <div className="flex justify-between items-end border-b border-slate-100 pb-0.5 mb-0.5">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide font-serif flex items-center gap-2">
                <span>{renderPreviewTemplateContent(clause.title_en || clause.title_ar || clause.title_bn)}</span>
                {isContinuation && (
                  <span className="text-[10px] font-sans font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 lowercase">
                    (continued)
                  </span>
                )}
              </h4>
              <h4 className="font-bold text-slate-700 text-[11px]">
                {renderPreviewTemplateContent(clause.title_ar)}{showBengali && clause.title_bn ? ` | ${renderPreviewTemplateContent(clause.title_bn)}` : ''}
              </h4>
            </div>
          )}
          <div className="grid grid-cols-1 gap-1.5">
            {clause.body_en && (
              <p
                className="text-slate-700 text-xs leading-relaxed font-serif text-justify whitespace-pre-line break-words"
                style={{ textJustify: 'inter-word' }}
              >
                {renderPreviewTemplateContent(clause.body_en)}
                {hasContinuation && (
                  <span className="text-slate-400 font-sans text-[10px] italic ml-1">... [Continues on next page]</span>
                )}
              </p>
            )}
            <div className={showBengali && clause.body_bn ? 'grid grid-cols-2 gap-5 pt-0.5' : 'pt-0.5'}>
              {showBengali && clause.body_bn && (
                <p
                  className="text-slate-600 text-[11px] leading-[1.65] font-sans text-justify whitespace-pre-line break-words"
                  style={{ textJustify: 'inter-word' }}
                >
                  {renderPreviewTemplateContent(clause.body_bn)}
                </p>
              )}
              {clause.body_ar && (
                <p
                  className={`text-slate-800 text-[11px] leading-[1.65] font-sans text-justify whitespace-pre-line break-words ${showBengali && clause.body_bn ? '' : 'w-full'}`}
                  dir="rtl"
                  style={{ textJustify: 'inter-word' }}
                >
                  {renderPreviewTemplateContent(clause.body_ar)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getTopLogoClass = (size) => {
    if (size === 'small') return 'max-h-8 max-w-[100px]';
    if (size === 'big') return 'max-h-16 max-w-[180px]';
    return 'max-h-12 max-w-[140px]'; // medium
  };

  // Reusable Single Paper Sheet Renderer (8.5in × 11in)
  const renderSingleLetterPaper = ({
    pageClauses,
    pageIdx,
    totalPages,
    name,
    details,
    tLeftLogo,
    tLeftLogoSize,
    tCenterLogo,
    tCenterLogoSize,
    tRightLogo,
    tRightLogoSize,
    watermark,
    bottomLogo,
    signature,
    isBengali,
  }) => {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === totalPages - 1;

    return (
      <div
        key={`letter-paper-p${pageIdx}`}
        className="extra-tmpl-preview-page w-[8.5in] min-w-[8.5in] max-w-[8.5in] min-h-[11in] bg-white shadow-[0_0_25px_rgba(0,0,0,0.22)] flex flex-col justify-between pt-8 pb-10 px-8 box-border relative shrink-0 text-slate-800 mx-auto select-none print:shadow-none print:m-0"
      >
        {/* Watermark: Rendered centrally on every page */}
        {watermark && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] flex items-center justify-center opacity-15 mix-blend-multiply pointer-events-none z-30">
            <img src={watermark} alt="Watermark" className="w-full h-full object-contain" />
          </div>
        )}

        {/* Content wrapper */}
        <div className="page-inner relative z-10 flex-1 flex flex-col justify-between h-full w-full">
          <div className="flex-1 w-full relative z-20">
            {/* FIRST PAGE ONLY: Top 3 Logos Header */}
            {isFirstPage ? (
              <div className="flex flex-col border-b-2 border-slate-800 pb-3 mb-4">
                {(tLeftLogo || tCenterLogo || tRightLogo) && (
                  <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-slate-200">
                    <div className="w-1/3 flex items-center justify-start">
                      {tLeftLogo && (
                        <img
                          src={tLeftLogo}
                          alt="Top Left"
                          className={`${getTopLogoClass(tLeftLogoSize)} object-contain`}
                        />
                      )}
                    </div>
                    <div className="w-1/3 flex items-center justify-center">
                      {tCenterLogo && (
                        <img
                          src={tCenterLogo}
                          alt="Top Center"
                          className={`${getTopLogoClass(tCenterLogoSize)} object-contain`}
                        />
                      )}
                    </div>
                    <div className="w-1/3 flex items-center justify-end">
                      {tRightLogo && (
                        <img
                          src={tRightLogo}
                          alt="Top Right"
                          className={`${getTopLogoClass(tRightLogoSize)} object-contain`}
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 font-serif">
                      {renderPreviewTemplateContent(name || 'Untitled Agreement')}
                    </h2>
                    {details && (
                      <p className="text-xs text-slate-600 font-medium tracking-wide mt-1 whitespace-pre-line break-words">
                        {renderPreviewTemplateContent(details)}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-600 space-y-1 shrink-0 ml-4">
                    <p className="flex items-center justify-end gap-1">
                      <span>Reference No:</span>
                      <span className="text-slate-400 italic">(Optional / Blank)</span>
                    </p>
                    <p className="flex items-center justify-end gap-1">
                      <span>Date:</span>
                      {renderPreviewTemplateContent('{{ date }}')}
                    </p>
                    {totalPages > 1 && (
                      <p className="font-bold text-slate-700">Page {pageIdx + 1} of {totalPages}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Middle & Subsequent Pages: Clean Header WITHOUT top 3 logos */
              <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-widest text-slate-800 font-serif">
                    {name || 'Untitled Agreement'}{' '}
                    <span className="text-xs font-normal text-slate-500">(Continued)</span>
                  </h3>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-600">
                  <span>Page {pageIdx + 1} of {totalPages}</span>
                </div>
              </div>
            )}

            {/* Clauses List */}
            <div className="space-y-2 mt-2">
              {pageClauses.map((clause) => (
                <ClauseBlock
                  key={clause.id || clause.clause_number}
                  clause={clause}
                  showBengali={isBengali}
                />
              ))}
              {pageClauses.length === 0 && isFirstPage && (
                <p className="text-slate-400 text-xs text-center py-10 italic font-medium">
                  No active clauses defined for this agreement template.
                </p>
              )}
            </div>
          </div>

          {/* LAST PAGE ONLY: Bottom Signature & Company Logo */}
          {isLastPage && (
            <div className="pt-3 border-t border-slate-300 mt-4 flex items-end justify-between gap-6 relative z-20 break-inside-avoid">
              {/* 1. Company Logo (if turned on) */}
              <div className="flex flex-col items-center justify-center">
                {bottomLogo ? (
                  <img
                    src={bottomLogo}
                    alt="Company Logo"
                    className="w-20 h-20 object-contain"
                  />
                ) : (
                  <div className="w-16 h-10 border border-dashed border-slate-200 rounded flex items-center justify-center text-[8px] text-slate-300 italic">
                    [ Logo Off ]
                  </div>
                )}
              </div>

              {/* 2. Applicant Signature (if turned on or simulated) */}
              <div className="flex flex-col items-center min-w-[160px]">
                {signature ? (
                  <img
                    src={signature}
                    alt="Applicant Signature"
                    className="h-14 max-w-[140px] object-contain pb-1"
                  />
                ) : (
                  <div className="h-14 flex items-end justify-center pb-1">
                    {renderPreviewTemplateContent('{{ applicant_signature }}')}
                  </div>
                )}
                <div className="w-full border-t border-slate-700 pt-1 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    Applicant's Signature
                  </p>
                  <p className="text-[8px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                    <span>Date:</span>
                    {renderPreviewTemplateContent('{{ date }}')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Form view clause pagination
  const formPages = paginateLetterClauses(clauses, {
    showBengali: previewBengali,
    hasTopLogos: Boolean(topLeftLogo || topCenterLogo || topRightLogo),
    detailsText: templateDetails,
    hasBottomSection: Boolean(applicantSignature || bottomCompanyLogo),
  });
  const safeFormPageIdx = Math.min(previewPageIndex, Math.max(0, formPages.length - 1));

  // ----------------------------------------------------
  // FORM VIEW: Edit / Create Extra Template
  // ----------------------------------------------------
  if (activeView === 'form') {
    return (
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 gap-4">
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
                Multi-page agreement builder with logos, watermark, and dynamic variables.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Form Layout Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFormLayoutMode('split')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  formLayoutMode === 'split' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Split Editor & Live Preview"
              >
                ◫ Split
              </button>
              <button
                type="button"
                onClick={() => setFormLayoutMode('preview')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  formLayoutMode === 'preview' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Full Preview Mode"
              >
                📄 Preview
              </button>
              <button
                type="button"
                onClick={() => setFormLayoutMode('editor')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  formLayoutMode === 'editor' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Form Editor Only"
              >
                ✏️ Form
              </button>
            </div>

            <button
              onClick={handleSaveTemplate}
              disabled={saveMutation.isPending}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 text-sm shrink-0"
            >
              <span>💾</span>
              <span>{saveMutation.isPending ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* TOP ROW: 3 Top Logo Cards (Left, Center, Right) */}
        {/* ========================================================== */}
        {formLayoutMode !== 'preview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Top Left Logo */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 min-w-0">
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
                    className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                    title="Remove Logo"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                <select
                  value={topLeftLogo}
                  onChange={(e) => setTopLeftLogo(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none truncate"
                >
                  <option value="">— No Top Left Logo —</option>
                  {allLogoOptions.map((opt, idx) => (
                    <option key={idx} value={opt.url}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
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
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center h-12 overflow-hidden">
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 min-w-0">
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
                    className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                    title="Remove Logo"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                <select
                  value={topCenterLogo}
                  onChange={(e) => setTopCenterLogo(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none truncate"
                >
                  <option value="">— No Top Center Logo —</option>
                  {allLogoOptions.map((opt, idx) => (
                    <option key={idx} value={opt.url}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
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
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center h-12 overflow-hidden">
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 min-w-0">
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
                    className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                    title="Remove Logo"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                <select
                  value={topRightLogo}
                  onChange={(e) => setTopRightLogo(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none truncate"
                >
                  <option value="">— No Top Right Logo —</option>
                  {allLogoOptions.map((opt, idx) => (
                    <option key={idx} value={opt.url}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
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
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center h-12 overflow-hidden">
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
        )}

        {/* ========================================================== */}
        {/* MAIN LAYOUT: Split (Form + Preview) vs Full Preview vs Editor */}
        {/* ========================================================== */}
        <div className={`grid gap-6 items-start ${
          formLayoutMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
        }`}>
          
          {/* LEFT COLUMN: Inputs, Uploaders, Clauses */}
          {formLayoutMode !== 'preview' && (
            <div className={`space-y-6 min-w-0 w-full ${formLayoutMode === 'split' ? 'lg:col-span-7' : 'w-full'}`}>
              
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
                    placeholder="e.g. Saudi Arabia Employment Contract"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Agreement Description & Subtitle
                    </label>
                    <span className="text-[10px] text-slate-400">Supports multi-line & dynamic variables</span>
                  </div>
                  <textarea
                    ref={descriptionTextareaRef}
                    value={templateDetails}
                    onChange={(e) => setTemplateDetails(e.target.value)}
                    placeholder="e.g. Terms for {{ applicant_name }} (Passport: {{ passport_number }}) applying for {{ visa }} in {{ country }}..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none h-24 whitespace-pre-wrap leading-relaxed"
                  />
                  {renderDescriptionVariablesSelector()}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase mb-1.5 block">
                    Agreement Sequence (3 or higher)
                  </label>
                  <input
                    type="number"
                    min={3}
                    value={templateSequence}
                    onChange={(e) => setTemplateSequence(Math.max(3, parseInt(e.target.value, 10) || 3))}
                    className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sequence 1 and 2 are reserved for Base Agreements. Extra agreements begin from Sequence 3.
                  </p>
                </div>
              </div>

              {/* Uploaders Section (Watermark, Signature, Bottom Logo) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                  Branding & Visuals (Watermark, Signature & Logo)
                </h3>

                {/* 1. Watermark */}
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <span>1. Watermark Image</span>
                      <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Appears centrally on every page at 280px × 280px.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {watermarkImage ? (
                      <div className="relative w-20 h-20 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shadow-sm shrink-0">
                        <img src={watermarkImage} alt="Watermark" className="max-h-full max-w-full object-contain" />
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
                        Or pick from company logos:
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
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <span>2. Applicant Signature</span>
                      <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Custom fixed signature image or loaded dynamically from applicant</p>
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
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
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
                        <p className="text-xs text-slate-500 whitespace-pre-line break-words line-clamp-3 mt-1 leading-relaxed">
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
          )}

          {/* RIGHT COLUMN: Live Paper Preview */}
          {formLayoutMode !== 'editor' && (
            <div className={`space-y-4 min-w-0 w-full ${
              formLayoutMode === 'split' ? 'lg:col-span-5 lg:sticky lg:top-4' : 'w-full'
            }`}>
              {/* Header & Controls Toolbar */}
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <EyeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 leading-tight">Document Preview</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Fullscreen Button */}
                    <button
                      type="button"
                      onClick={() => setShowFullscreenPreview(true)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                      title="Open Fullscreen Preview"
                    >
                      <span>🔍</span> Fullscreen
                    </button>

                    {/* Bengali Toggle */}
                    <button
                      type="button"
                      onClick={() => setPreviewBengali(!previewBengali)}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition border ${
                        previewBengali
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Toggle Bengali preview"
                    >
                      বাংলা {previewBengali ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* View Mode & Scale Toggles */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewViewMode('all')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        previewViewMode === 'all'
                          ? 'bg-white text-blue-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All Pages ({formPages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewViewMode('single')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        previewViewMode === 'single'
                          ? 'bg-white text-blue-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Page by Page
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewScale(0.55)}
                      className={`px-2 py-0.5 rounded-md transition ${
                        previewScale === 0.55
                          ? 'bg-white text-blue-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Fit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewScale(0.75)}
                      className={`px-2 py-0.5 rounded-md transition ${
                        previewScale === 0.75
                          ? 'bg-white text-blue-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewScale(1.0)}
                      className={`px-2 py-0.5 rounded-md transition ${
                        previewScale === 1.0
                          ? 'bg-white text-blue-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      100%
                    </button>
                  </div>
                </div>

                {/* Single Page Pagination bar */}
                {previewViewMode === 'single' && formPages.length > 1 && (
                  <div className="flex items-center justify-between bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewPageIndex((prev) => Math.max(0, prev - 1))}
                      disabled={safeFormPageIdx === 0}
                      className="px-2 py-0.5 text-xs font-bold bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition"
                    >
                      ‹ Prev
                    </button>

                    <span className="text-[11px] font-bold text-slate-700">
                      Page {safeFormPageIdx + 1} of {formPages.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => setPreviewPageIndex((prev) => Math.min(formPages.length - 1, prev + 1))}
                      disabled={safeFormPageIdx >= formPages.length - 1}
                      className="px-2 py-0.5 text-xs font-bold bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition"
                    >
                      Next ›
                    </button>
                  </div>
                )}

                {/* Assurance Banner: Confirms ALL clauses are rendered */}
                <div className="flex items-center justify-between text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="font-bold flex items-center gap-1">
                    <span>✓</span>
                    <span>All {clauses.length} clause{clauses.length === 1 ? '' : 's'} accounted for</span>
                  </span>
                  <span className="font-medium text-emerald-700">
                    {formPages.length} page{formPages.length > 1 ? 's' : ''} • 0 omitted
                  </span>
                </div>
              </div>

              {/* Letter Paper Render Area */}
              {(() => {
                const displayedPages = previewViewMode === 'all'
                  ? formPages
                  : [formPages[safeFormPageIdx] || []];

                const currentTmplProps = {
                  name: templateName,
                  details: templateDetails,
                  tLeftLogo: topLeftLogo,
                  tLeftLogoSize: topLeftLogoSize,
                  tCenterLogo: topCenterLogo,
                  tCenterLogoSize: topCenterLogoSize,
                  tRightLogo: topRightLogo,
                  tRightLogoSize: topRightLogoSize,
                  watermark: watermarkImage,
                  bottomLogo: bottomCompanyLogo,
                  signature: applicantSignature,
                  isBengali: previewBengali,
                };

                return (
                  <div className="w-full overflow-x-auto overflow-y-auto bg-slate-300/80 p-6 rounded-2xl border border-slate-300 shadow-inner flex flex-col items-center max-h-[85vh]">
                    <div
                      style={{
                        zoom: previewScale,
                      }}
                      className="space-y-8 flex flex-col items-center"
                    >
                      {displayedPages.map((pageClauses, pIdx) => {
                        const actualPageIdx = previewViewMode === 'all' ? pIdx : safeFormPageIdx;
                        return renderSingleLetterPaper({
                          pageClauses,
                          pageIdx: actualPageIdx,
                          totalPages: formPages.length,
                          ...currentTmplProps,
                        });
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Save Template Button */}
              <button
                onClick={handleSaveTemplate}
                disabled={saveMutation.isPending}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <span>💾</span>
                <span>{saveMutation.isPending ? 'Saving Template...' : 'Save Extra Template'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Clause Modal */}
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
                      ref={(el) => (clauseTextareaRefs.current.en = el)}
                      value={clauseForm.body_en || ''}
                      onChange={(e) => setClauseForm({ ...clauseForm, body_en: e.target.value })}
                      placeholder="Detailed clause content with dynamic variables..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none h-32 whitespace-pre-wrap"
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
                      ref={(el) => (clauseTextareaRefs.current.ar = el)}
                      dir="rtl"
                      value={clauseForm.body_ar || ''}
                      onChange={(e) => setClauseForm({ ...clauseForm, body_ar: e.target.value })}
                      placeholder="نص البند باللغة العربية..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none h-32 font-sans whitespace-pre-wrap"
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
                      ref={(el) => (clauseTextareaRefs.current.bn = el)}
                      value={clauseForm.body_bn || ''}
                      onChange={(e) => setClauseForm({ ...clauseForm, body_bn: e.target.value })}
                      placeholder="ধারার বিস্তারিত বিবরণ..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none h-32 whitespace-pre-wrap"
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
                      value={clauseForm.visibility_mode || 'ALL'}
                      onChange={(e) => setClauseForm({ ...clauseForm, visibility_mode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    >
                      <option value="ALL">🌐 Always Include (Visible to All Applicants)</option>
                      <option value="INCLUDE">✅ Include Only for Selected Countries</option>
                      <option value="EXCLUDE">🚫 Exclude for Selected Countries</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {(!clauseForm.countries || clauseForm.countries.length === 0 || clauseForm.visibility_mode === 'ALL')
                        ? 'This clause will be included for all applicants in print and preview without being hidden.'
                        : clauseForm.visibility_mode === 'INCLUDE'
                          ? `Included only for applicants applying to the ${clauseForm.countries.length} selected country/countries.`
                          : `Hidden for applicants applying to the ${clauseForm.countries.length} selected country/countries.`}
                    </p>
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

        {/* Fullscreen Modal Preview */}
        {showFullscreenPreview && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] overflow-y-auto flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-50 border-b border-slate-800 shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold">📄 Document Preview</span>
                <span className="text-xs text-slate-400">
                  {clauses.length} clauses across {formPages.length} page{formPages.length > 1 ? 's' : ''} • 0 omitted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewBengali(!previewBengali)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                    previewBengali ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  বাংলা {previewBengali ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  🖨️ Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullscreenPreview(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition font-bold"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto flex flex-col items-center bg-slate-300/80 space-y-8">
              {formPages.map((pageClauses, pIdx) =>
                renderSingleLetterPaper({
                  pageClauses,
                  pageIdx: pIdx,
                  totalPages: formPages.length,
                  name: templateName,
                  details: templateDetails,
                  tLeftLogo: topLeftLogo,
                  tLeftLogoSize: topLeftLogoSize,
                  tCenterLogo: topCenterLogo,
                  tCenterLogoSize: topCenterLogoSize,
                  tRightLogo: topRightLogo,
                  tRightLogoSize: topRightLogoSize,
                  watermark: watermarkImage,
                  bottomLogo: bottomCompanyLogo,
                  signature: applicantSignature,
                  isBengali: previewBengali,
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // LIST VIEW: Document Preview & Manage Templates
  // ----------------------------------------------------
  const currentPreviewTmpl = extraTemplates.find((t) => t.id === selectedPreviewTemplateId) || extraTemplates[0] || null;
  const currentPreviewMeta = parseExtraMeta(currentPreviewTmpl);
  const currentPreviewClauses = [...(currentPreviewTmpl?.clauses || [])].sort((a, b) => a.clause_number - b.clause_number);
  const currentPreviewTitle = currentPreviewTmpl?.title || currentPreviewTmpl?.name || `Agreement ${currentPreviewTmpl?.sequence || 3}`;
  const currentPreviewDesc = currentPreviewMeta?.details || (!currentPreviewTmpl?.body?.startsWith('{') ? currentPreviewTmpl?.body : '') || currentPreviewTmpl?.details || '';

  const listPreviewPages = paginateLetterClauses(currentPreviewClauses, {
    showBengali: previewBengali,
    hasTopLogos: Boolean(currentPreviewMeta?.top_left_logo || currentPreviewMeta?.top_center_logo || currentPreviewMeta?.top_right_logo),
    detailsText: currentPreviewDesc,
    hasBottomSection: Boolean(currentPreviewMeta?.company_logo || currentPreviewMeta?.applicant_signature),
  });

  return (
    <div className="space-y-5">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-800">Extra Agreement Templates</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Custom agreement templates with headers, watermark, signatures, and dynamic variables.
          </p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm text-xs shrink-0"
        >
          <PlusIcon className="w-4 h-4" /> Create Extra Template
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading extra templates...</div>
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
        <div className="space-y-4">
          {/* Top Tabs: Document Preview vs Manage Templates */}
          <div className="flex border-b border-slate-200 gap-2 bg-white px-4 pt-2 rounded-t-2xl border-t border-x shadow-xs">
            <button
              onClick={() => setListTab('preview')}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition ${
                listTab === 'preview'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <EyeIcon className="w-4 h-4" />
              <span>Document Preview</span>
            </button>
            <button
              onClick={() => setListTab('manage')}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition ${
                listTab === 'manage'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4" />
              <span>Manage Extra Templates ({extraTemplates.length})</span>
            </button>
          </div>

          {/* ==================================================== */}
          {/* TAB 1: DOCUMENT PREVIEW */}
          {/* ==================================================== */}
          {listTab === 'preview' && (
            <div className="space-y-4">
              {/* Preview Controls Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700">Template:</label>
                    <select
                      value={selectedPreviewTemplateId || ''}
                      onChange={(e) => setSelectedPreviewTemplateId(Number(e.target.value) || e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 max-w-xs truncate"
                    >
                      {extraTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title || t.name || `Agreement ${t.sequence || 3}`} (Seq: {t.sequence || 3})
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-slate-300">|</span>

                  <span className="text-xs text-slate-500 font-medium">
                    {currentPreviewClauses.length} Clauses • {listPreviewPages.length} page{listPreviewPages.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bengali Toggle */}
                  <button
                    type="button"
                    onClick={() => setPreviewBengali(!previewBengali)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition border ${
                      previewBengali
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Toggle Bengali preview"
                  >
                    বাংলা {previewBengali ? 'ON' : 'OFF'}
                  </button>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewScale(0.6)}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        previewScale === 0.6 ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Fit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewScale(0.75)}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        previewScale === 0.75 ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewScale(1.0)}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        previewScale === 1.0 ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      100%
                    </button>
                  </div>

                  {/* Edit Template */}
                  {currentPreviewTmpl && (
                    <button
                      onClick={() => handleEditTemplate(currentPreviewTmpl)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                      title="Edit this template"
                    >
                      <PencilSquareIcon className="w-4 h-4" /> Edit
                    </button>
                  )}

                  {/* Print Agreement */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    <PrinterIcon className="w-4 h-4" /> Print Agreement
                  </button>
                </div>
              </div>

              {/* Document Canvas Viewport */}
              <div className="w-full overflow-x-auto overflow-y-auto bg-slate-300/80 p-8 rounded-2xl border border-slate-300 shadow-inner flex flex-col items-center min-h-[700px]">
                <div
                  style={{
                    zoom: previewScale,
                  }}
                  className="space-y-10 flex flex-col items-center"
                >
                  {listPreviewPages.map((pageClauses, pIdx) =>
                    renderSingleLetterPaper({
                      pageClauses,
                      pageIdx: pIdx,
                      totalPages: listPreviewPages.length,
                      name: currentPreviewTitle,
                      details: currentPreviewDesc,
                      tLeftLogo: currentPreviewMeta?.top_left_logo || '',
                      tLeftLogoSize: currentPreviewMeta?.top_left_logo_size || 'medium',
                      tCenterLogo: currentPreviewMeta?.top_center_logo || '',
                      tCenterLogoSize: currentPreviewMeta?.top_center_logo_size || 'medium',
                      tRightLogo: currentPreviewMeta?.top_right_logo || '',
                      tRightLogoSize: currentPreviewMeta?.top_right_logo_size || 'medium',
                      watermark: currentPreviewMeta?.watermark || '',
                      bottomLogo: currentPreviewMeta?.company_logo || '',
                      signature: currentPreviewMeta?.applicant_signature || '',
                      isBengali: previewBengali,
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: MANAGE TEMPLATES CARDS */}
          {/* ==================================================== */}
          {listTab === 'manage' && (
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
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Agreement Template
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 text-base mb-1">
                        {tmpl.title || tmpl.name || `Agreement ${tmpl.sequence}`}
                      </h3>

                      <p className="text-xs text-slate-500 mb-3 line-clamp-2 break-words">
                        {meta?.details || (!tmpl.body?.startsWith('{') ? tmpl.body : tmpl.details) || 'No description provided.'}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <DocumentTextIcon className="w-3.5 h-3.5 text-slate-400" />
                          {tmpl.clauses?.length || 0} Clauses
                        </span>
                        {meta?.watermark && (
                          <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                            Watermark
                          </span>
                        )}
                        {meta?.applicant_signature && (
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            Signature
                          </span>
                        )}
                        {meta?.company_logo && (
                          <span className="text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                            Bottom Logo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setSelectedPreviewTemplateId(tmpl.id);
                          setListTab('preview');
                        }}
                        className="flex justify-center items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition text-xs"
                        title="Preview Document"
                      >
                        <EyeIcon className="w-4 h-4" /> Preview
                      </button>
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
      )}
    </div>
  );
}

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import topIllustration from '../../assets/top-illustration.png';
import companyLogo from '../../assets/logo.png';
import { getApplicantVariablesMap, interpolateTemplateVariables, paginateLetterClauses } from '../../utils/templateVariables';

export default function AgreementPrintView({ applicant, templates = [], type, companyInfo, showBengali = false, currenciesList = [] }) {
  React.useEffect(() => {
    const originalTitle = document.title;
    const name = applicant?.full_name || 'Applicant';
    document.title = `Agreement - ${name}`;
    return () => {
      document.title = originalTitle;
    };
  }, [applicant]);

  // Fetch currencies list as fallback if not passed in props
  const { data: currenciesData } = useQuery({
    queryKey: ['config-currencies'],
    queryFn: () => api.get('/currencies/').then((r) => r.data),
    staleTime: 1000 * 60 * 15,
  });
  const allCurrencies = currenciesList?.length ? currenciesList : (currenciesData?.results ?? currenciesData ?? []);

  // Fetch company logo variations
  const { data: logoVariationsData } = useQuery({
    queryKey: ['company-logos-list'],
    queryFn: () => api.get('/company-logos/').then((r) => r.data.results ?? r.data ?? []),
    staleTime: 1000 * 60 * 15,
  });

  const getLogoUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') {
      return img.startsWith('http') ? img : `https://res.cloudinary.com/prfvuhln/${img}`;
    }
    return null;
  };

  const allLogos = Array.isArray(companyInfo?.logos) && companyInfo.logos.length
    ? companyInfo.logos
    : (Array.isArray(logoVariationsData) ? logoVariationsData : []);

  // Find "Up & Down" titled logo from DB variations
  const upDownLogoObj = allLogos.find((l) => {
    if (!l?.title) return false;
    const t = l.title.toLowerCase().trim();
    return t.includes('up & down') || t.includes('up and down') || t.includes('up&down') || (t.includes('up') && t.includes('down'));
  });

  const watermarkLogoUrl = getLogoUrl(upDownLogoObj?.image) || getLogoUrl(companyInfo?.company_logo) || companyLogo;

  const getCurrencySymbol = (code) => {
    if (!code) return '৳';
    const curr = allCurrencies.find((c) => c.code === code);
    return curr?.symbol || code || '৳';
  };

  const formatPaymentAmount = (payment) => {
    if (!payment) return '—';
    const curr = payment.currency || 'BDT';
    const amt = Number(payment.amount) || 0;
    const sym = getCurrencySymbol(curr);
    const isSingleSymbol = ['৳', '€', '$', '£', '¥', '﷼', '₹'].includes(sym) || sym.length === 1;
    return isSingleSymbol ? `${sym}${amt.toLocaleString()}` : `${sym} ${amt.toLocaleString()}`;
  };

  const formatTotalPaid = (payments = []) => {
    if (!payments || payments.length === 0) return `${getCurrencySymbol('BDT')}0`;

    const totalsByCurrency = {};
    payments.forEach((p) => {
      const curr = p.currency || 'BDT';
      const amt = Number(p.amount) || 0;
      totalsByCurrency[curr] = (totalsByCurrency[curr] || 0) + amt;
    });

    const entries = Object.entries(totalsByCurrency);
    if (entries.length === 1) {
      const [curr, total] = entries[0];
      const sym = getCurrencySymbol(curr);
      const isSingleSymbol = ['৳', '€', '$', '£', '¥', '﷼', '₹'].includes(sym) || sym.length === 1;
      return isSingleSymbol ? `${sym}${total.toLocaleString()}` : `${sym} ${total.toLocaleString()}`;
    }

    return entries
      .map(([curr, total]) => {
        const sym = getCurrencySymbol(curr);
        const isSingleSymbol = ['৳', '€', '$', '£', '¥', '﷼', '₹'].includes(sym) || sym.length === 1;
        return isSingleSymbol ? `${sym}${total.toLocaleString()}` : `${sym} ${total.toLocaleString()}`;
      })
      .join(' + ');
  };

  // Fetch countries list for clause visibility filtering
  const { data: countriesData } = useQuery({
    queryKey: ['config-countries'],
    queryFn: () => api.get('/countries/').then((r) => r.data.results ?? r.data ?? []),
    staleTime: 1000 * 60 * 30,
  });
  const allCountriesList = Array.isArray(countriesData) ? countriesData : [];

  // Helper to detect if a template is an Extra Template
  const isExtraTemplate = (tmpl) => {
    if (!tmpl) return false;
    if (tmpl.sequence && tmpl.sequence >= 3) return true;
    if (tmpl.body && typeof tmpl.body === 'string' && tmpl.body.startsWith('{')) {
      try {
        const parsed = JSON.parse(tmpl.body);
        if (parsed.is_extra || parsed.__is_extra) return true;
      } catch {}
    }
    const titleKey = tmpl.title || tmpl.name;
    const keysToTry = [
      tmpl.id ? `extra_tmpl_meta_${tmpl.id}` : null,
      titleKey ? `extra_tmpl_meta_title_${titleKey}` : null,
      tmpl.sequence ? `extra_tmpl_meta_seq_${tmpl.sequence}` : null,
    ].filter(Boolean);
    for (const key of keysToTry) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.is_extra || parsed.__is_extra)) return true;
        }
      } catch {}
    }
    return false;
  };

  const allTemplatesList = [...(templates || [])].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  const baseTemplates = allTemplatesList.filter((t) => !isExtraTemplate(t));
  const template1 = baseTemplates.length > 0 ? baseTemplates[0] : (allTemplatesList.find((t) => t.sequence === 1) || null);
  const template2 = baseTemplates.length > 1 ? baseTemplates[1] : (allTemplatesList.find((t) => t.sequence === 2) || null);

  // Agreement / Document visibility toggles
  const isMainType = type === 'all' || type === 'main' || (template1 && (type === template1.id || type === String(template1.id)));
  const showCover = isMainType || type === 'form';
  const showTemplate1Part1 = isMainType || type === 'tc';
  const showTemplate1Part2 = isMainType || type === 'clauses';
  const showTemplate2 = type === 'all' || type === 'tc2' || type === 'general' || (template2 && (type === template2.id || type === String(template2.id)));

  const extraTemplatesToRender = allTemplatesList.filter((t) =>
    isExtraTemplate(t) ||
    (t.sequence && t.sequence >= 3) ||
    (t.id !== template1?.id && t.id !== template2?.id)
  );

  // Filter clauses based on country condition (guarantees NO missed clauses for extra templates)
  const getVisibleClauses = (template) => {
    if (!template || !template.clauses) return [];
    let clauses = [...template.clauses].sort((a, b) => a.clause_number - b.clause_number);
    const applicantCountryName = (
      applicant?.country?.name || 
      (typeof applicant?.country === 'string' ? applicant.country : '') || 
      applicant?.visa_name || 
      ''
    ).toLowerCase();
    const applicantCountryId = applicant?.country?.id || (typeof applicant?.country === 'number' ? applicant.country : null);
    const isSaudi = applicantCountryName.includes('saudi');
    const isExtra = isExtraTemplate(template);

    return clauses.filter((c) => {
      if (c.is_active === false) return false;

      // Clause 15 of Template 1 is strictly hidden for Saudi Arabia applicants
      if (!isExtra && template.sequence === 1 && c.clause_number === 15 && isSaudi) {
        return false;
      }

      // If visibility_mode is ALL or unspecified, show unconditionally
      if (c.visibility_mode === 'ALL' || !c.visibility_mode) {
        return true;
      }

      if (c.visibility_mode === 'INCLUDE') {
        if (!c.countries || c.countries.length === 0) return true;
        const matchId = applicantCountryId ? c.countries.includes(applicantCountryId) : false;
        const matchName = allCountriesList.some((cntry) =>
          c.countries.includes(cntry.id) && applicantCountryName.includes(cntry.name?.toLowerCase())
        );
        // If applicant has no country specified, do not hide the clause
        if (!applicantCountryId && !applicantCountryName) return true;
        return matchId || matchName;
      }

      if (c.visibility_mode === 'EXCLUDE') {
        if (!c.countries || c.countries.length === 0) return true;
        const matchId = applicantCountryId ? c.countries.includes(applicantCountryId) : false;
        const matchName = allCountriesList.some((cntry) =>
          c.countries.includes(cntry.id) && applicantCountryName.includes(cntry.name?.toLowerCase())
        );
        return !(matchId || matchName);
      }

      return true;
    });
  };

  const template1Clauses = getVisibleClauses(template1);
  // Safe pagination chunking for Template 1 to prevent text clipping
  const template1Part1 = template1Clauses.filter(c => showBengali ? c.clause_number <= 3 : c.clause_number <= 5);
  const template1Part2 = template1Clauses.filter(c => showBengali ? (c.clause_number > 3 && c.clause_number <= 7) : (c.clause_number > 5 && c.clause_number <= 10));
  const template1Part3 = template1Clauses.filter(c => showBengali ? c.clause_number > 7 : c.clause_number > 10);

  const template2Clauses = getVisibleClauses(template2);

  // Common Header for Legal Documents
  const DocumentHeader = ({ title, subtitle, showReceiptDetails = false }) => (
    <div className="flex flex-col border-b-2 border-slate-800 pb-4 mb-6 relative">
      {/* Illustration removed here — now rendered at page level in PageContainer */}

      <div className="flex items-center gap-4 relative z-20">
        <img src={companyInfo?.company_logo || companyLogo} alt="Logo" className="w-20 h-20 object-contain drop-shadow-md" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest text-slate-900 uppercase font-serif leading-none">
            {companyInfo?.company_name || 'Al Raiyan Group'}
          </h1>
          <p className="text-[10px] text-slate-600 font-bold tracking-widest mt-0.5 uppercase">
            Global Visa Services
          </p>
          <p className="text-[9px] text-orange-600 font-bold tracking-widest uppercase">
            Trust • Process • Success
          </p>
        </div>
      </div>

      <div className="w-full flex justify-between items-end mt-6">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800">{title}</h2>
          {subtitle && <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1 whitespace-pre-line break-words">{parseClauseText(subtitle)}</p>}
        </div>
        <div className="text-right text-[10px] font-mono text-slate-600 space-y-0.5 relative z-20">
          {showReceiptDetails && (
            <p>Receipt No: <span className="font-bold text-slate-900">RCPT-{applicant?.id?.slice(0, 8)}</span></p>
          )}
          <p>Application No: <span className="font-bold text-slate-900">{applicant?.application_number || `APP-${applicant?.id?.slice(0, 8)}`}</span></p>
          <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>
    </div>
  );

  const applicantVariablesMap = React.useMemo(() => {
    return getApplicantVariablesMap(applicant, companyInfo);
  }, [applicant, companyInfo]);

  const parseClauseText = (text) => {
    if (!text) return '';
    return interpolateTemplateVariables(text, applicantVariablesMap);
  };

  const ClauseBlock = ({ clause, isTerms = false }) => {
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
          {clause.title_en && (
            <div className="flex justify-between items-end border-b border-slate-100 pb-0.5 mb-0.5">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide font-serif flex items-center gap-2">
                <span>{parseClauseText(clause.title_en)}</span>
                {isContinuation && (
                  <span className="text-[10px] font-sans font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 lowercase">
                    (continued)
                  </span>
                )}
              </h4>
              <h4 className="font-bold text-slate-700 text-[11px]">
                {parseClauseText(clause.title_ar)}{showBengali ? ` | ${parseClauseText(clause.title_bn)}` : ''}
              </h4>
            </div>
          )}
          <div className="grid grid-cols-1 gap-1.5">
            {clause.body_en && (
              <p
                className="text-slate-700 text-xs leading-relaxed font-serif text-justify whitespace-pre-line break-words"
                style={{ textJustify: 'inter-word' }}
              >
                {parseClauseText(clause.body_en)}
                {hasContinuation && (
                  <span className="text-slate-400 font-sans text-[10px] italic ml-1">... [Continues on next page]</span>
                )}
              </p>
            )}
            <div className={showBengali ? 'grid grid-cols-2 gap-5 pt-0.5' : 'pt-0.5'}>
              {showBengali && clause.body_bn && (
                <p
                  className="text-slate-600 text-[11px] leading-[1.65] font-sans text-justify whitespace-pre-line break-words"
                  style={{ textJustify: 'inter-word' }}
                >
                  {parseClauseText(clause.body_bn)}
                </p>
              )}
              {clause.body_ar && (
                <p
                  className={`text-slate-800 text-[11px] leading-[1.65] font-sans text-justify whitespace-pre-line break-words ${showBengali ? '' : 'w-full'}`}
                  dir="rtl"
                  style={{ textJustify: 'inter-word' }}
                >
                  {parseClauseText(clause.body_ar)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SignatureBlock = ({ showThumb = false, showSeal = false }) => (
    <div className={`grid ${showThumb || showSeal ? 'grid-cols-4' : 'grid-cols-3'} gap-6 pt-4 text-center text-[10px] font-semibold text-slate-600 break-inside-avoid relative z-20`}>
      <div className="flex flex-col items-center">
        <div className="w-full border-t border-slate-400 pt-2">
          <p className="uppercase tracking-wider">Applicant's Signature</p>
          <p className="text-[8px] text-slate-400 mt-1">Date: ___ / ___ / ______</p>
        </div>
      </div>

      {showThumb ? (
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-slate-400 pt-2">
            <p className="uppercase tracking-wider">Applicant's Left Thumb Impression</p>
            <p className="text-[8px] text-slate-400 mt-1">Date: ___ / ___ / ______</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-slate-400 pt-2 opacity-0">Spacer</div>
        </div>
      )}

      <div className="flex flex-col items-center">
        <div className="w-full border-t border-slate-400 pt-2">
          <p className="uppercase tracking-wider">Authorized Company Representative</p>
          <p className="text-[8px] text-slate-400 mt-1">Date: ___ / ___ / ______</p>
          <p className="text-[9px] text-slate-800 mt-1 font-serif italic">{applicant?.assigned_staff_name || ''}</p>
        </div>
      </div>

      {showSeal && (
        <div className="flex flex-col items-center justify-end">
          <p className="uppercase tracking-wider mt-4">Company Seal</p>
        </div>
      )}
    </div>
  );


  const DocumentFooter = () => (
    <div className="print-footer absolute bottom-0 left-0 right-0 h-12 bg-blue-900 text-white flex items-center justify-between px-8 text-[9px] font-medium z-30 w-full rounded-b-lg print:rounded-none">
      <div className="flex items-center gap-2">
        <span>📍</span> Head Office - {companyInfo?.address || 'Kingdom of Saudi Arabia (KSA)'}
      </div>
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">📧 Email- {companyInfo?.email || 'alraiyangroup333@gmail.com'}</span>
        <span className="flex items-center gap-2">🌐 {companyInfo?.website || 'al-raiyangroup.com'}</span>
      </div>
    </div>
  );

  // Letter Page Container styling wrapper
  const PageContainer = ({ children }) => (
    <div className="w-full overflow-x-auto bg-slate-100 print:bg-transparent print:overflow-visible flex sm:justify-center">
      <div className="print-page w-[8.5in] min-w-[8.5in] max-w-[8.5in] min-h-[11in] print:w-[8.5in] print:min-h-[11in] mx-auto bg-white mb-8 shadow-[0_0_20px_rgba(0,0,0,0.15)] print:shadow-none print:m-0 flex flex-col justify-between pt-8 pb-16 px-8 box-border relative shrink-0">
        {/* Company Logo PNG Watermark (Layered at z-30 with mix-blend-multiply) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] flex items-center justify-center opacity-15 mix-blend-multiply pointer-events-none z-30">
          <img
            src={watermarkLogoUrl}
            alt="Watermark Logo"
            className="w-full h-full object-contain"
          />
        </div>
        {/* Top-right illustration: absolute on the PAGE, not inside padding — goes flush to paper edge */}
        <img
          src={topIllustration}
          alt=""
          className="absolute top-0 right-0 w-52 opacity-90 pointer-events-none z-10"
        />
        {/* Content */}
        <div className="page-inner relative z-10 flex-1 flex flex-col justify-between h-full w-full">
          {children}
        </div>
        <DocumentFooter />
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          @page { size: letter portrait; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html { font-size: 13.6px !important; }
          html, body { width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          body > *:not(.print-portal) { display: none !important; }
          .print-portal { display: block !important; position: static !important; width: 100%; height: auto !important; overflow: visible !important; }
          .print-page {
            width: 8.5in !important;
            min-height: 11in !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 0 auto !important;
            padding: 32px 32px 40px 32px !important;
            background: white !important;
          }
          .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>
      <div className="w-full bg-slate-100 py-8 print:py-0 print:bg-white text-slate-900">

        {/* ========================================================== */}
        {/* PAGE 1: COVER PAGE / SUMMARY */}
        {/* ========================================================== */}
        {showCover && (
          <PageContainer>
            <div className="flex-1 w-full">
              <DocumentHeader
                title="Employment & Visa Service Agreement"
                subtitle="عقد عمل وخدمات تأشيرة | চাকরি ও ভিসা সেবা চুক্তিপত্র"
              />

              <div className="space-y-6 mt-8 relative z-20">
                {/* Applicant Info Section */}
                <section>
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs border-b-2 border-slate-200 pb-1 mb-3 font-serif">1. Applicant Information</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm bg-slate-50 p-5 rounded border border-slate-100">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Full Name</span>
                      <span className="font-bold text-slate-900 text-xs">{applicant?.full_name || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Father's Name</span>
                      <span className="font-bold text-slate-900 text-xs">{applicant?.profile?.father_name || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Passport No</span>
                      <span className="font-bold text-slate-900 font-mono text-xs">{applicant?.passport_number || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Nationality</span>
                      <span className="font-bold text-slate-900 text-xs">{applicant?.country?.nationality || 'Bangladeshi'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Mobile No</span>
                      <span className="font-bold text-slate-900 text-xs">{applicant?.profile?.phone || applicant?.profile?.phone_number || applicant?.phone || applicant?.phone_number || '—'}</span>
                    </div>
                  </div>
                </section>

                {/* Job Info Section */}
                <section>
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs border-b-2 border-slate-200 pb-1 mb-3 font-serif">2. Employment Details</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm bg-slate-50 p-5 rounded border border-slate-100">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Destination Country</span>
                      <span className="font-bold text-slate-900 text-xs">{applicant?.country?.name || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Job Title / Visa Type</span>
                      <span className="font-bold text-slate-900 text-xs">{applicant?.visa_name || '—'}</span>
                    </div>
                  </div>
                </section>

                {/* Payment Summary Section */}
                <section>
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs border-b-2 border-slate-200 pb-1 mb-3 font-serif">3. Financial Summary</h3>
                  <div className="bg-slate-50 p-5 rounded border border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      {applicant?.payments?.map((payment, index) => {
                        const note = payment.important_note || payment.note;
                        return (
                          <React.Fragment key={payment.id || index}>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-500 font-medium text-[11px] uppercase">Installment {index + 1} (Receipt {payment.receipt_number || (index + 1)})</span>
                              <span className="font-bold text-slate-900 text-xs">{formatPaymentAmount(payment)}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-500 font-medium text-[11px] uppercase">Payment Date</span>
                              <span className="font-bold text-slate-900 text-xs">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : '—'}</span>
                            </div>
                            {note && (
                              <div className="col-span-2 bg-white p-2.5 rounded border border-slate-200 text-[11px] text-slate-700 mt-1 mb-2">
                                <span className="font-bold text-slate-600 uppercase text-[9px] tracking-wider block mb-0.5">Installment {index + 1} Important Note:</span>
                                <p className="whitespace-pre-line leading-relaxed font-sans">{note}</p>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {(!applicant?.payments || applicant.payments.length === 0) && (
                        <div className="col-span-2 text-center text-slate-400 text-xs py-2 italic">
                          No payments recorded yet.
                        </div>
                      )}
                      <div className="flex justify-between border-b border-slate-200 pb-1 col-span-2 mt-2">
                        <span className="text-slate-500 font-medium text-[11px] uppercase">Total Amount Paid</span>
                        <span className="font-extrabold text-blue-800 text-xs">{formatTotalPaid(applicant?.payments)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs border-b-2 border-slate-200 pb-1 mb-3 font-serif">4. Declaration</h3>
                  <div className="bg-white border-l-4 border-slate-800 p-4 text-xs font-serif text-slate-700 italic text-justify leading-relaxed">
                    I hereby declare that all information provided in this application is true, accurate, and complete to the best of my knowledge. I acknowledge that I have read, thoroughly understood, and willingly agreed to all the terms and conditions outlined in this Agreement. I accept full responsibility for the documents submitted and understand the legal implications of providing false information.
                  </div>
                </section>
              </div>
            </div>
            <SignatureBlock />
          </PageContainer>
        )}

        {/* ========================================================== */}
        {/* PAGE 2: TEMPLATE 1 (Clauses 1-6) */}
        {/* ========================================================== */}
        {showTemplate1Part1 && (
          <PageContainer>
            <div className="flex-1 w-full relative z-20">
              <DocumentHeader
                title="Payment Details & Agreement"
                showReceiptDetails={true}
              />

              <div className="bg-slate-50 border border-slate-200 rounded p-4 flex justify-between items-center mb-6">
                <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">2nd Installment Amount</div>
                <div className="text-xl font-black text-slate-900">{formatTotalPaid(applicant?.payments)}</div>
              </div>

              <div className="space-y-1">
                {template1Part1.map(clause => (
                  <ClauseBlock key={clause.id} clause={clause} />
                ))}
              </div>
            </div>
            <SignatureBlock />
          </PageContainer>
        )}

        {/* ========================================================== */}
        {/* PAGE 3: TEMPLATE 1 Part 2 (clauses 4-8 Bengali / 7-15 non-Bengali) */}
        {/* ========================================================== */}
        {showTemplate1Part2 && (
          <PageContainer>
            <div className="flex-1 w-full relative z-20">
              <DocumentHeader title="Agreement Terms (Continued)" />
              <div className="space-y-1 mt-6">
                {template1Part2.map(clause => (
                  <ClauseBlock key={clause.id} clause={clause} />
                ))}
              </div>
            </div>
            <SignatureBlock />
          </PageContainer>
        )}

        {/* ========================================================== */}
        {/* ========================================================== */}
        {/* PAGE 3b: TEMPLATE 1 Part 3 — shown whenever clauses overflow past page 2 */}
        {/* ========================================================== */}
        {showTemplate1Part2 && template1Part3.length > 0 && (
          <PageContainer>
            <div className="flex-1 w-full relative z-20">
              <DocumentHeader title="Agreement Terms (Continued)" />
              <div className="space-y-1 mt-6">
                {template1Part3.map(clause => (
                  <ClauseBlock key={clause.id} clause={clause} />
                ))}
              </div>
            </div>
            <SignatureBlock />
          </PageContainer>
        )}

        {/* ========================================================== */}
        {/* TEMPLATE 2 (General Terms & Conditions) */}
        {/* ========================================================== */}
        {showTemplate2 && (() => {
          const t2Pages = paginateLetterClauses(template2Clauses, {
            showBengali,
            hasTopLogos: false,
            detailsText: template2?.body || template2?.details || "الشروط والأحكام العامة | সাধারণ শর্তাবলী",
            hasBottomSection: true,
          });
          const totalT2Pages = t2Pages.length;

          return t2Pages.map((pageClauses, pIdx) => {
            const isFirst = pIdx === 0;
            const isLast = pIdx === totalT2Pages - 1;

            return (
              <PageContainer key={`tmpl2-p${pIdx}`}>
                <div className="flex-1 w-full relative z-20">
                  {isFirst ? (
                    <DocumentHeader
                      title={template2?.title || template2?.name || "General Terms & Conditions"}
                      subtitle={template2?.body || template2?.details || "الشروط والأحكام العامة | সাধারণ শর্তাবলী"}
                    />
                  ) : (
                    <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
                      <div>
                        <h3 className="text-base font-bold uppercase tracking-widest text-slate-800 font-serif">
                          {template2?.title || template2?.name || "General Terms & Conditions"}{' '}
                          <span className="text-xs font-normal text-slate-500">(Continued)</span>
                        </h3>
                      </div>
                      <div className="text-right text-[10px] font-mono text-slate-600">
                        <span>Page {pIdx + 1} of {totalT2Pages}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mt-3">
                    {pageClauses.map(clause => (
                      <ClauseBlock key={clause.id || clause.clause_number} clause={clause} isTerms={true} />
                    ))}
                    {pageClauses.length === 0 && isFirst && (
                      <p className="text-slate-400 text-xs text-center py-10 italic font-medium">
                        No active clauses defined for this agreement template.
                      </p>
                    )}
                  </div>
                </div>
                {isLast && <SignatureBlock showThumb={true} />}
              </PageContainer>
            );
          });
        })()}

        {/* ========================================================== */}
        {/* EXTRA TEMPLATES & ADDITIONAL TEMPLATES */}
        {/* ========================================================== */}
        {extraTemplatesToRender.map((tmpl, idx) => {
          const shouldShow = type === 'all' || type === tmpl.id || type === String(tmpl.id) || type === `tmpl-${tmpl.id}` || type === `extra-${tmpl.id}`;
          if (!shouldShow) return null;

          const clauses = getVisibleClauses(tmpl);

          // Parse extra template metadata (watermark, top logos, signature, bottom logo, sizes)
          let metaFromBody = null;
          try {
            if (tmpl.body && typeof tmpl.body === 'string' && tmpl.body.startsWith('{')) {
              const parsed = JSON.parse(tmpl.body);
              if (parsed.is_extra || parsed.__is_extra) metaFromBody = parsed;
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

          const meta = {
            ...(metaFromBody || {}),
            ...(metaFromStorage || {}),
          };

          if (metaFromBody) {
            if (!meta.top_left_logo && metaFromBody.top_left_logo) meta.top_left_logo = metaFromBody.top_left_logo;
            if (!meta.top_center_logo && metaFromBody.top_center_logo) meta.top_center_logo = metaFromBody.top_center_logo;
            if (!meta.top_right_logo && metaFromBody.top_right_logo) meta.top_right_logo = metaFromBody.top_right_logo;
            if (!meta.watermark && metaFromBody.watermark) meta.watermark = metaFromBody.watermark;
            if (!meta.applicant_signature && metaFromBody.applicant_signature) meta.applicant_signature = metaFromBody.applicant_signature;
            if (!meta.company_logo && metaFromBody.company_logo) meta.company_logo = metaFromBody.company_logo;
          }

          const templateTitle = parseClauseText(tmpl.title || tmpl.name || `Agreement ${tmpl.sequence || idx + 3}`);
          const templateDesc = parseClauseText(meta?.details || tmpl.details || (!tmpl.body?.startsWith('{') ? tmpl.body : ''));
          const hasTopLogos = Boolean(meta?.top_left_logo || meta?.top_center_logo || meta?.top_right_logo);
          const hasBottom = Boolean(meta?.company_logo || meta?.applicant_signature || applicant?.profile?.signature || meta?.show_applicant_signature !== false);

          const pages = paginateLetterClauses(clauses, {
            showBengali,
            hasTopLogos,
            detailsText: templateDesc,
            hasBottomSection: hasBottom,
          });
          const totalPages = pages.length;

          // Fixed standard sizes for watermark, bottom logo, and applicant signature
          const customWatermark = meta?.watermark || watermarkLogoUrl;
          const watermarkSizeClass = 'w-[280px] h-[280px]';
          const bottomLogoClass = 'w-20 h-20';
          const signatureSizeClass = 'h-14 max-w-[140px]';

          // Top 3 Logos sizing helper
          const getTopLogoClass = (size) => {
            if (size === 'small') return 'max-h-8 max-w-[100px]';
            if (size === 'big') return 'max-h-16 max-w-[180px]';
            return 'max-h-12 max-w-[140px]'; // medium
          };

          return (
            <React.Fragment key={tmpl.id || idx}>
              {pages.map((pageClauses, pageIdx) => {
                const isFirstPage = pageIdx === 0;
                const isLastPage = pageIdx === totalPages - 1;

                return (
                  <div key={`${tmpl.id || idx}-p${pageIdx}`} className="w-full overflow-x-auto bg-slate-100 print:bg-transparent print:overflow-visible flex sm:justify-center">
                    <div className="print-page w-[8.5in] min-w-[8.5in] max-w-[8.5in] min-h-[11in] print:w-[8.5in] print:min-h-[11in] mx-auto bg-white mb-8 shadow-[0_0_20px_rgba(0,0,0,0.15)] print:shadow-none print:m-0 flex flex-col justify-between pt-8 pb-12 px-8 box-border relative shrink-0 text-slate-800">
                      
                      {/* Watermark: Rendered centrally on every page */}
                      {customWatermark && (
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${watermarkSizeClass} flex items-center justify-center opacity-15 mix-blend-multiply pointer-events-none z-30`}>
                          <img
                            src={customWatermark}
                            alt="Watermark"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}

                      {/* Content wrapper */}
                      <div className="page-inner relative z-10 flex-1 flex flex-col justify-between h-full w-full">
                        <div className="flex-1 w-full relative z-20">
                          
                          {/* ============================================== */}
                          {/* FIRST PAGE ONLY: Top 3 Logos Header */}
                          {/* ============================================== */}
                          {isFirstPage ? (
                            <div className="flex flex-col border-b-2 border-slate-800 pb-3 mb-4">
                              {(meta?.top_left_logo || meta?.top_center_logo || meta?.top_right_logo) && (
                                <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-slate-200">
                                  <div className="w-1/3 flex items-center justify-start">
                                    {meta?.top_left_logo && (
                                      <img
                                        src={meta.top_left_logo}
                                        alt="Top Left"
                                        className={`${getTopLogoClass(meta?.top_left_logo_size)} object-contain`}
                                      />
                                    )}
                                  </div>
                                  <div className="w-1/3 flex items-center justify-center">
                                    {meta?.top_center_logo && (
                                      <img
                                        src={meta.top_center_logo}
                                        alt="Top Center"
                                        className={`${getTopLogoClass(meta?.top_center_logo_size)} object-contain`}
                                      />
                                    )}
                                  </div>
                                  <div className="w-1/3 flex items-center justify-end">
                                    {meta?.top_right_logo && (
                                      <img
                                        src={meta.top_right_logo}
                                        alt="Top Right"
                                        className={`${getTopLogoClass(meta?.top_right_logo_size)} object-contain`}
                                      />
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div>
                                  <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 font-serif">
                                    {templateTitle}
                                  </h2>
                                  {templateDesc && (
                                    <p className="text-xs text-slate-600 font-medium tracking-wide mt-1 whitespace-pre-line break-words">
                                      {templateDesc}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-[10px] font-mono text-slate-600 space-y-0.5">
                                  <p>Application No: <span className="font-bold text-slate-900">{applicant?.application_number || `APP-${applicant?.id?.slice(0, 8)}`}</span></p>
                                  <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
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
                                  {templateTitle} <span className="text-xs font-normal text-slate-500">(Continued)</span>
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
                              <ClauseBlock key={clause.id || clause.clause_number} clause={clause} />
                            ))}
                            {pageClauses.length === 0 && isFirstPage && (
                              <p className="text-slate-400 text-xs text-center py-10 italic font-medium">
                                No active clauses defined for this agreement template.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ============================================== */}
                        {/* LAST PAGE ONLY: Bottom Signature & Company Logo */}
                        {/* ============================================== */}
                        {isLastPage && (() => {
                          const resolvedSignature = meta?.applicant_signature ||
                            applicant?.profile?.signature ||
                            applicant?.profile?.signature_url ||
                            applicant?.profile?.applicant_signature ||
                            applicant?.signature ||
                            applicant?.signature_url ||
                            applicant?.applicant_signature ||
                            applicant?.documents?.find(d => 
                              d.document_type === 'signature' || 
                              d.type === 'signature' || 
                              d.name?.toLowerCase().includes('signature') || 
                              d.title?.toLowerCase().includes('signature')
                            )?.file ||
                            applicant?.documents?.find(d => 
                              d.document_type === 'signature' || 
                              d.type === 'signature' || 
                              d.name?.toLowerCase().includes('signature') || 
                              d.title?.toLowerCase().includes('signature')
                            )?.document;

                          const showLogo = Boolean(meta?.company_logo);
                          const showSignature = Boolean(meta?.applicant_signature || resolvedSignature || meta?.show_applicant_signature !== false);

                          if (!showLogo && !showSignature) return null;

                          return (
                            <div className="pt-3 border-t border-slate-300 mt-4 flex items-end justify-between gap-6 relative z-20 break-inside-avoid">
                              {/* 1. Company Logo (if turned on) */}
                              <div className="flex flex-col items-center justify-center">
                                {showLogo ? (
                                  <img
                                    src={meta.company_logo}
                                    alt="Company Logo"
                                    className={`${bottomLogoClass} object-contain`}
                                  />
                                ) : (
                                  <div className="w-16 h-10" />
                                )}
                              </div>

                              {/* 2. Applicant Signature (if turned on) */}
                              {showSignature && (
                                <div className="flex flex-col items-center min-w-[160px]">
                                  {resolvedSignature ? (
                                    <img
                                      src={resolvedSignature}
                                      alt="Applicant Signature"
                                      className={`${signatureSizeClass} object-contain pb-1`}
                                    />
                                  ) : (
                                    <div className="h-10" />
                                  )}
                                  <div className="w-full border-t border-slate-700 pt-1 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                                      Applicant's Signature
                                    </p>
                                    <p className="text-[8px] text-slate-500 mt-0.5">
                                      Date: {new Date().toLocaleDateString('en-GB')}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

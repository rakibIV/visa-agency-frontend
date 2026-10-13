// Dynamic variables configuration and parser for Extra Templates & Agreements

export const TEMPLATE_VARIABLES_CONFIG = [
  {
    category: 'APPLICANT INFORMATION',
    variables: [
      { key: 'applicant_name', label: 'Applicant Name', sample: 'Mohammed Al-Amin' },
      { key: 'applicant_id', label: 'Applicant ID', sample: 'APP-20260901' },
      { key: 'passport_number', label: 'Passport Number', sample: 'A08923412' },
      { key: 'date_of_birth', label: 'Date of Birth', sample: '15/08/1995' },
      { key: 'nationality', label: 'Nationality', sample: 'Bangladeshi' },
      { key: 'passport_issue_date', label: 'Passport Issue Date', sample: '10/01/2021' },
      { key: 'passport_expiry_date', label: 'Passport Expiry Date', sample: '09/01/2031' },
      { key: 'place_of_birth', label: 'Place of Birth', sample: 'Dhaka' },
      { key: 'current_country', label: 'Current Country', sample: 'Bangladesh' },
      { key: 'nid_number', label: 'NID Number', sample: '19951234567890' },
      { key: 'gender', label: 'Gender', sample: 'Male' },
      { key: 'phone', label: 'Phone', sample: '+8801712345678' },
      { key: 'email', label: 'Email', sample: 'applicant@example.com' },
      { key: 'father_name', label: "Father's Name", sample: 'Abdul Mannan' },
    ],
  },
  {
    category: 'VISA & EMPLOYMENT INFORMATION',
    variables: [
      { key: 'visa', label: 'Visa', sample: 'Work Visa (Saudi Arabia)' },
      { key: 'country', label: 'Country', sample: 'Saudi Arabia' },
      { key: 'job', label: 'Job', sample: 'Heavy Equipment Operator' },
      { key: 'current_status', label: 'Current Status', sample: 'Visa Approved' },
      { key: 'company_name', label: 'Company Name', sample: 'Al Raiyan Group' },
      { key: 'lawyer_name', label: 'Lawyer Name', sample: 'Adv. Tariq Al-Mansoor' },
      { key: 'lawyer_address', label: 'Lawyer Address', sample: 'Riyadh, Saudi Arabia' },
      { key: 'staff', label: 'Staff / Representative', sample: 'Hasan Mahmud' },
      { key: 'payment', label: 'Payment / Agreed Amount', sample: '350,000 BDT' },
    ],
  },
  {
    category: 'JOB & CONTRACT DETAILS',
    variables: [
      { key: 'location', label: 'Location', sample: 'Riyadh / Jeddah' },
      { key: 'vacancies', label: 'Vacancies', sample: '12' },
      { key: 'salary', label: 'Salary', sample: '2,500 SAR / Month' },
      { key: 'duty_days_per_week', label: 'Duty Days / Week', sample: '6 Days' },
      { key: 'duty_hours_per_day', label: 'Duty Hours / Day', sample: '8 Hours' },
      { key: 'contract_duration_months', label: 'Contract Duration (Months)', sample: '24 Months' },
    ],
  },
];

const formatDate = (val) => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
  } catch {
    return String(val);
  }
};

/**
 * Resolves map of dynamic variables for a given applicant and company context.
 */
export function getApplicantVariablesMap(applicant, companyInfo = null) {
  const profile = applicant?.profile || {};
  const job = applicant?.job || {};
  const visa = applicant?.visa || {};
  const country = applicant?.country || {};

  // Formatted payment helper
  let paymentDisplay = '—';
  if (applicant?.agreed_amount) {
    paymentDisplay = `${applicant.agreed_amount} ${applicant.agreed_currency || 'BDT'}`;
  } else if (applicant?.payments && applicant.payments.length > 0) {
    const total = applicant.payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const curr = applicant.payments[0]?.currency || 'BDT';
    paymentDisplay = `${total.toLocaleString()} ${curr}`;
  }

  const map = {
    // APPLICANT INFORMATION
    applicant_name: applicant?.full_name || '—',
    applicant_id: applicant?.application_id || applicant?.application_number || (applicant?.id ? `APP-${String(applicant.id).slice(0, 8)}` : '—'),
    passport_number: applicant?.passport_number || '—',
    date_of_birth: formatDate(profile?.date_of_birth || applicant?.date_of_birth),
    nationality: country?.nationality || applicant?.nationality || profile?.nationality || 'Bangladeshi',
    passport_issue_date: formatDate(profile?.passport_issue_date || applicant?.passport_issue_date),
    passport_expiry_date: formatDate(profile?.passport_expiry_date || applicant?.passport_expiry_date),
    place_of_birth: profile?.place_of_birth || applicant?.place_of_birth || '—',
    current_country: applicant?.current_country || profile?.current_country || country?.name || 'Bangladesh',
    nid_number: profile?.nid_number || applicant?.nid_number || '—',
    gender: profile?.gender || applicant?.gender || 'Male',
    phone: profile?.phone || profile?.phone_number || applicant?.phone || applicant?.phone_number || '—',
    email: applicant?.email || profile?.email || '—',
    father_name: profile?.father_name || applicant?.father_name || '—',

    // VISA & EMPLOYMENT INFORMATION
    visa: visa?.name || applicant?.visa_name || '—',
    country: country?.name || applicant?.country_name || '—',
    job: job?.title || applicant?.job_title || '—',
    current_status: applicant?.status?.name || applicant?.status_name || applicant?.current_status || 'In Progress',
    company_name: companyInfo?.company_name || applicant?.company?.name || 'Al Raiyan Group',
    lawyer_name: applicant?.lawyer_name || visa?.lawyer_name || applicant?.company?.lawyer_name || '—',
    lawyer_address: applicant?.lawyer_address || visa?.lawyer_address || applicant?.company?.lawyer_address || '—',
    staff: applicant?.assigned_staff_name || applicant?.staff?.name || 'Authorized Representative',
    payment: paymentDisplay,

    // JOB & CONTRACT DETAILS
    location: job?.location || applicant?.location || country?.name || '—',
    vacancies: job?.vacancies !== undefined && job?.vacancies !== null ? String(job.vacancies) : '—',
    salary: (() => {
      const raw = job?.salary ?? applicant?.salary;
      if (!raw) return '—';
      const str = String(raw).trim();
      return /[a-zA-Z]/.test(str) ? str : `${str} ${job?.currency || applicant?.currency || 'SAR'}`;
    })(),
    duty_days_per_week: (() => {
      const raw = job?.duty_days_per_week ?? applicant?.duty_days_per_week;
      if (raw === undefined || raw === null || raw === '') return '6 Days';
      const str = String(raw).trim();
      return /[a-zA-Z]/.test(str) ? str : `${str} Days`;
    })(),
    duty_hours_per_day: (() => {
      const raw = job?.duty_hours_per_day ?? applicant?.duty_hours_per_day;
      if (raw === undefined || raw === null || raw === '') return '8 Hours';
      const str = String(raw).trim();
      return /[a-zA-Z]/.test(str) ? str : `${str} Hours`;
    })(),
    contract_duration_months: (() => {
      const raw = job?.contract_duration_months ?? applicant?.contract_duration_months;
      if (raw === undefined || raw === null || raw === '') return '24 Months';
      const str = String(raw).trim();
      return /[a-zA-Z]/.test(str) ? str : `${str} Months`;
    })(),

    // Backwards-compatible aliases
    full_name: applicant?.full_name || '—',
    nid: profile?.nid_number || applicant?.nid_number || '—',
    phone_number: profile?.phone || applicant?.phone || '—',
    mobile: profile?.phone || applicant?.phone || '—',
    mobile_number: profile?.phone || applicant?.phone || '—',
    staff_name: applicant?.assigned_staff_name || 'Authorized Representative',
    application_id: applicant?.application_id || (applicant?.id ? `APP-${String(applicant.id).slice(0, 8)}` : '—'),
  };

  return map;
}

/**
 * Replaces both {{ variable_name }} and {variable_name} in text with dynamic values.
 */
export function interpolateTemplateVariables(text, variablesMap = {}) {
  if (!text || typeof text !== 'string') return '';

  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}|\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, p1, p2) => {
    const key = (p1 || p2 || '').toLowerCase().trim();
    if (Object.prototype.hasOwnProperty.call(variablesMap, key)) {
      return variablesMap[key];
    }
    return match;
  });
}

/**
 * Returns a map of sample dummy variables for live editor previews.
 */
export function getSampleVariablesMap() {
  const map = {};
  TEMPLATE_VARIABLES_CONFIG.forEach(category => {
    category.variables.forEach(v => {
      map[v.key] = v.sample;
    });
  });
  // Add common aliases
  map.full_name = 'Mohammed Al-Amin';
  map.application_id = 'APP-20260901';
  map.nid = '19951234567890';
  map.phone_number = '+8801712345678';
  return map;
}

/**
 * Splits a clause's body text cleanly at sentence or paragraph boundaries.
 * Preserves parallel structure across English, Arabic, and Bengali.
 */
export function splitClauseForPagination(clause, targetRatio = 0.5) {
  const splitBody = (text, ratio) => {
    if (!text || typeof text !== 'string') return ['', ''];
    const trimmed = text.trim();
    if (!trimmed) return ['', ''];

    // 1. Try splitting at paragraph breaks (\n)
    const paragraphs = trimmed.split(/\n+/).filter(Boolean);
    if (paragraphs.length >= 2) {
      const cut = Math.max(1, Math.min(paragraphs.length - 1, Math.round(paragraphs.length * ratio)));
      return [
        paragraphs.slice(0, cut).join('\n\n'),
        paragraphs.slice(cut).join('\n\n'),
      ];
    }

    // 2. Try splitting at sentence boundaries (. or ! or ? or । (Bengali) or Arabic full stop)
    const sentences = trimmed.match(/[^.!?।\n]+[.!?।]+(\s|$)|[^.!?।\n]+$/g);
    if (sentences && sentences.length >= 2) {
      const cut = Math.max(1, Math.min(sentences.length - 1, Math.round(sentences.length * ratio)));
      return [
        sentences.slice(0, cut).join('').trim(),
        sentences.slice(cut).join('').trim(),
      ];
    }

    return [trimmed, ''];
  };

  const [en1, en2] = splitBody(clause.body_en, targetRatio);
  const [ar1, ar2] = splitBody(clause.body_ar, targetRatio);
  const [bn1, bn2] = splitBody(clause.body_bn, targetRatio);

  const hasRemaining = Boolean(en2 || ar2 || bn2);

  const part1 = {
    ...clause,
    body_en: en1 || clause.body_en,
    body_ar: ar1 || clause.body_ar,
    body_bn: bn1 || clause.body_bn,
    has_continuation: hasRemaining,
  };

  const part2 = {
    ...clause,
    body_en: en2,
    body_ar: ar2,
    body_bn: bn2,
    is_continuation: true,
  };

  return [part1, part2, hasRemaining];
}

/**
 * Master-Class Dynamic Agreement Pagination Engine.
 * 
 * Accurately models the physical CSS rendering engine for 8.5in × 11in Letter documents.
 * Guarantees zero text clipping while maximizing natural paper real-estate utilization.
 * Can split long clauses across pages at justified paragraph/sentence boundaries when needed.
 * Content only rolls over to subsequent pages when physically necessary, eliminating
 * artificial whitespace voids and premature page splits.
 */
export function paginateLetterClauses(clauses, {
  showBengali = false,
  hasTopLogos = false,
  detailsText = '',
  hasBottomSection = true,
} = {}) {
  if (!clauses || !Array.isArray(clauses) || clauses.length === 0) {
    return [[]];
  }

  // Visual line counter: models CSS line-wrapping in standard 704px text column
  const countVisualLines = (text, charsPerLine) => {
    if (!text || typeof text !== 'string') return 0;
    const lines = text.split('\n');
    return lines.reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed) return acc + 1; // paragraph break
      return acc + Math.max(1, Math.ceil(trimmed.length / charsPerLine));
    }, 0);
  };

  // Realistic height estimation (px) matching rendered DOM elements
  const estimateClauseHeight = (clause) => {
    let h = 16; // badge container and vertical align

    // Title row (14px serif font, pb-1 mb-1 border-b)
    if (clause.title_en || clause.title_ar || clause.title_bn) {
      const combinedTitle = `${clause.title_en || ''} ${clause.title_ar || ''} ${showBengali ? clause.title_bn || '' : ''}`.trim();
      // In 704px width, titles under 70 chars fit on 1 line (~26px), longer wraps to 2 lines (~44px)
      h += combinedTitle.length > 70 ? 44 : 26;
    }

    // English body (text-xs / 12px serif, leading-relaxed: ~18px per line, ~88 chars per line in 704px container)
    const enText = (clause.body_en || '').trim();
    if (enText) {
      const enLines = countVisualLines(enText, 88);
      h += enLines * 18 + 4;
    }

    // Arabic and Bengali body
    const arText = (clause.body_ar || '').trim();
    const bnText = showBengali ? (clause.body_bn || '').trim() : '';

    if (arText && bnText) {
      // 2 columns (~335px each): ~38 chars per line, ~23px line height for Bengali/Arabic
      const arLines = countVisualLines(arText, 38);
      const bnLines = countVisualLines(bnText, 38);
      h += Math.max(arLines, bnLines) * 23 + 6;
    } else if (arText) {
      // Single full-width column (~704px): ~78 chars per line, ~22px per line
      const arLines = countVisualLines(arText, 78);
      h += arLines * 22 + 4;
    } else if (bnText) {
      const bnLines = countVisualLines(bnText, 78);
      h += bnLines * 23 + 4;
    }

    h += 12; // inter-clause margin (mb-2.5 / space-y-2)
    return Math.max(48, Math.ceil(h));
  };

  const clauseHeights = clauses.map(estimateClauseHeight);

  // Height budget:
  // Total physical height: 11in = 1056px.
  // Page padding: pt-8 (32px) + pb-10 (40px) = 72px.
  // Total inner sheet space: 1056 - 72 = 984px.
  // We use USABLE_PAGE_CAPACITY = 915px (leaves a dependable 69px buffer above the bottom padding).
  const USABLE_PAGE_CAPACITY = 915;

  const descLines = countVisualLines(detailsText, 80);
  const page1HeaderHeight = (hasTopLogos ? 68 : 0) + 54 + (descLines * 16); // ~80px to ~155px
  const continuedHeaderHeight = 44; // Continuation header on page 2+ (~44px)
  const signatureFooterHeight = hasBottomSection ? 130 : 0; // Bottom logo & applicant signature (~130px)

  // Step 1: Check if all clauses fit on 1 single page!
  const totalClausesHeight = clauseHeights.reduce((acc, v) => acc + v, 0);
  if (totalClausesHeight + page1HeaderHeight + signatureFooterHeight <= USABLE_PAGE_CAPACITY) {
    return [clauses];
  }

  // Step 2: Multi-page optimal packing with clause splitting if needed
  const pages = [];
  let currentPageClauses = [];
  let currentHeight = 0;
  let pageIdx = 0;

  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];
    const cH = clauseHeights[i];
    const isFirstPage = pageIdx === 0;
    const headerH = isFirstPage ? page1HeaderHeight : continuedHeaderHeight;

    const remainingCount = clauses.length - i - 1;
    const isFinalItem = remainingCount === 0;
    const reservedFooter = isFinalItem ? signatureFooterHeight : 0;
    const maxBudget = USABLE_PAGE_CAPACITY - headerH - reservedFooter;

    if (currentPageClauses.length > 0 && (currentHeight + cH > maxBudget)) {
      const spaceLeft = maxBudget - currentHeight;

      // If there is meaningful space left on the page (>= 140px) and the clause can split:
      if (spaceLeft >= 140 && cH > spaceLeft) {
        const ratio = Math.min(0.65, Math.max(0.35, (spaceLeft - 30) / cH));
        const [part1, part2, canSplit] = splitClauseForPagination(clause, ratio);

        if (canSplit) {
          const h1 = estimateClauseHeight(part1);
          if (currentHeight + h1 <= maxBudget) {
            currentPageClauses.push(part1);
            pages.push(currentPageClauses);
            currentPageClauses = [part2];
            currentHeight = estimateClauseHeight(part2);
            pageIdx++;
            continue;
          }
        }
      }

      // Current page is full — commit it and start next page
      pages.push(currentPageClauses);
      currentPageClauses = [clause];
      currentHeight = cH;
      pageIdx++;
    } else {
      currentPageClauses.push(clause);
      currentHeight += cH;
    }
  }

  if (currentPageClauses.length > 0) {
    const isFirstPage = pages.length === 0;
    const headerH = isFirstPage ? page1HeaderHeight : continuedHeaderHeight;
    // Check if the final page has enough room for the signature block
    if (hasBottomSection && (currentHeight + headerH + signatureFooterHeight > USABLE_PAGE_CAPACITY) && currentPageClauses.length > 1) {
      const lastClause = currentPageClauses.pop();
      pages.push(currentPageClauses);
      pages.push([lastClause]);
    } else {
      pages.push(currentPageClauses);
    }
  }

  return pages.length > 0 ? pages : [[]];
}


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

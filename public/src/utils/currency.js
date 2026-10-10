/**
 * Currency and Salary Formatting Utilities
 */

const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  SAR: 'SAR ',
  AED: 'AED ',
  BDT: '৳',
  QAR: 'QAR ',
  OMR: 'OMR ',
  KWD: 'KD ',
  BHD: 'BD ',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  INR: '₹',
  MYR: 'RM ',
  SGD: 'S$',
  TRY: '₺',
  CHF: 'CHF ',
  PLN: 'zł ',
  CNY: '¥',
  RMB: '¥',
};

/**
 * Returns the symbol for a given currency code (e.g. 'EUR' -> '€')
 */
export function getCurrencySymbol(currencyCode) {
  if (!currencyCode) return '€';
  const upper = String(currencyCode).trim().toUpperCase();
  return CURRENCY_SYMBOLS[upper] || `${upper} `;
}

/**
 * Formats a single number with commas (e.g. 1200 -> "1,200")
 */
export function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats salary range with respect to the selected currency
 * Examples:
 * - formatSalary(1200, 2500, 'EUR') => "€1,200 - €2,500 / mo"
 * - formatSalary(1500, null, 'SAR') => "SAR 1,500+ / mo"
 */
export function formatSalary(minSalary, maxSalary, currencyCode = 'EUR', suffix = '/ mo') {
  const sym = getCurrencySymbol(currencyCode);
  const min = minSalary !== null && minSalary !== undefined && minSalary !== '' ? Number(minSalary) : null;
  const max = maxSalary !== null && maxSalary !== undefined && maxSalary !== '' ? Number(maxSalary) : null;

  if (min !== null && !isNaN(min) && max !== null && !isNaN(max)) {
    if (min === max) {
      return `${sym}${formatNumber(min)}${suffix ? ` ${suffix}` : ''}`;
    }
    return `${sym}${formatNumber(min)} - ${sym}${formatNumber(max)}${suffix ? ` ${suffix}` : ''}`;
  }

  if (min !== null && !isNaN(min)) {
    return `${sym}${formatNumber(min)}+${suffix ? ` ${suffix}` : ''}`;
  }

  if (max !== null && !isNaN(max)) {
    return `Up to ${sym}${formatNumber(max)}${suffix ? ` ${suffix}` : ''}`;
  }

  return 'Competitive';
}

/**
 * Formats contract duration in months
 * Example: 24 => "24 Months (2 Years)"
 */
export function formatContractDuration(months) {
  if (!months || isNaN(Number(months))) return null;
  const m = Number(months);
  if (m === 12) return '12 Months (1 Year)';
  if (m === 24) return '24 Months (2 Years)';
  if (m === 36) return '36 Months (3 Years)';
  if (m === 48) return '48 Months (4 Years)';
  if (m >= 12 && m % 12 === 0) return `${m} Months (${m / 12} Years)`;
  return `${m} Months`;
}

/**
 * Formats processing time in days
 */
export function formatProcessingTime(minDays, maxDays) {
  const min = minDays ? Number(minDays) : null;
  const max = maxDays ? Number(maxDays) : null;

  if (min && max) {
    if (min === max) return `${min} Days`;
    return `${min} - ${max} Days`;
  }
  if (min) return `${min}+ Days`;
  if (max) return `Up to ${max} Days`;
  return null;
}

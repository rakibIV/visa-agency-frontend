import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import topIllustration from '../../assets/top-illustration.png';
import companyLogo from '../../assets/logo.png';
import { UserIcon, IdentificationIcon, PhoneIcon, EnvelopeIcon, CreditCardIcon, InformationCircleIcon, MapPinIcon, GlobeAltIcon, UserCircleIcon, QrCodeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// Helper to convert number to words (simple version)
function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() ? str.trim() : 'Zero';
}

export default function ReceiptPrintView({ applicant, payment, companyInfo, currenciesList = [] }) {
  if (!payment) return null;

  React.useEffect(() => {
    const originalTitle = document.title;
    const receiptNo = payment?.receipt_number || payment?.id || applicant?.application_number || applicant?.id || '';
    document.title = `Payment Receipt - ${receiptNo}`;
    return () => {
      document.title = originalTitle;
    };
  }, [payment, applicant]);

  const getOrdinal = (type) => {
    switch (type) {
      case 'INITIAL': return '1st';
      case 'SECOND': return '2nd';
      case 'THIRD': return '3rd';
      default: return '';
    }
  };

  const getCurrencySymbol = (code) => {
    const curr = currenciesList.find(c => c.code === code);
    return curr?.symbol || code || '৳';
  };

  const getCurrencyName = (code) => {
    const curr = currenciesList.find(c => c.code === code);
    return curr?.name || code;
  };

  const paidAmount = Number(payment.amount) || 0;
  const eurAmount = Number(payment.euro_amount) || 0;
  const dbExchangeRate = Number(payment.exchange_rate) || 0;

  const eurRatio = dbExchangeRate > 0
    ? (dbExchangeRate > 1 ? 1 / dbExchangeRate : dbExchangeRate)
    : (paidAmount > 0 && eurAmount > 0 ? eurAmount / paidAmount : 0.00714286);

  const displayExchangeRate = dbExchangeRate > 0
    ? (dbExchangeRate > 1 ? dbExchangeRate.toFixed(2) : (1 / dbExchangeRate).toFixed(2))
    : (eurRatio > 0 ? (1 / eurRatio).toFixed(2) : '140.00');
  const paidCurrency = payment.currency || 'BDT';
  const paidCurrencySymbol = getCurrencySymbol(paidCurrency);
  const paidCurrencyName = getCurrencyName(paidCurrency);

  const amountInWordsPaid = numberToWords(Math.floor(paidAmount)) + ` ${paidCurrencyName} Only`;
  const amountInWordsEUR = numberToWords(Math.floor(eurAmount)) + ' Euros Only';

  // Format Country, Visa, and Job
  const countryDisplayName = (typeof applicant?.country === 'object' ? applicant?.country?.name : applicant?.country) || applicant?.country_name || 'N/A';
  const visaDisplayName = applicant?.visa_name || (typeof applicant?.visa === 'object' ? applicant?.visa?.name : applicant?.visa) || 'N/A';
  const primaryJobDisplayName =
    applicant?.job_name ||
    (typeof applicant?.job === 'object' ? applicant?.job?.title || applicant?.job?.name : null) ||
    (typeof applicant?.job === 'string' && !applicant?.job.includes('-') ? applicant?.job : null) ||
    'N/A';

  const secondaryJobDisplayName =
    applicant?.secondary_job_name ||
    (typeof applicant?.secondary_job === 'object' ? applicant?.secondary_job?.title || applicant?.secondary_job?.name : null) ||
    (typeof applicant?.secondary_job === 'string' && !applicant?.secondary_job.includes('-') ? applicant?.secondary_job : null) ||
    '';

  const receiptNo = payment.receipt_number || payment.id || 'N/A';
  const paymentDate = payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A';
  
  // Fetch company logos directly if companyInfo.logos is not yet in cache
  const { data: companyLogosList } = useQuery({
    queryKey: ['company-logos-list'],
    queryFn: () => api.get('/company-logos/').then(r => r.data.results ?? r.data).catch(() => []),
    staleTime: 1000 * 60 * 5,
  });

  const allLogos = Array.isArray(companyInfo?.logos) && companyInfo.logos.length ? companyInfo.logos : (companyLogosList || []);
  const sideBySideLogoObj = allLogos.find(
    (l) => l.title?.toLowerCase().includes('side') || l.serial_number === 3
  );

  const getLogoUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') {
      return img.startsWith('http') ? img : `https://res.cloudinary.com/prfvuhln/${img}`;
    }
    return null;
  };

  const headerLogoUrl = getLogoUrl(sideBySideLogoObj?.image) || getLogoUrl(companyInfo?.company_logo) || companyLogo;

  // Construct Plain Text for QR Code Scanning
  const qrPlainText = [
    `=== OFFICIAL MONEY RECEIPT ===`,
    `Receipt No: ${receiptNo}`,
    `Date: ${paymentDate}`,
    `Agency: ${companyInfo?.company_name || 'Al Raiyan Group'}`,
    ``,
    `--- APPLICANT DETAILS ---`,
    `Name: ${applicant.full_name}`,
    `Application ID: ${applicant.application_id || 'N/A'}`,
    `Passport No: ${applicant.passport_number || 'N/A'}`,
    `Destination Country: ${countryDisplayName}`,
    `Visa Scheme: ${visaDisplayName}`,
    `Primary Job (1st Choice): ${primaryJobDisplayName}`,
    secondaryJobDisplayName ? `Secondary Job (2nd Choice): ${secondaryJobDisplayName}` : '',
    ``,
    `--- PAYMENT SUMMARY ---`,
    `Paid Amount: ${paidCurrencySymbol} ${paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${paidCurrency})`,
    `Equivalent Euros: € ${eurAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} EUR`,
    `Exchange Rate: 1 EUR = ${displayExchangeRate} BDT`,
    `Payment Method: ${payment.payment_method || 'CASH'}`,
    payment.transaction_id ? `Transaction / Ref ID: ${payment.transaction_id}` : '',
    `Payment Type: ${getOrdinal(payment.payment_type)} Installment (${payment.payment_type})`,
    `Issued By: ${payment.received_by_name || applicant.assigned_staff_name || 'System Admin'}`,
    ``,
    `=== VERIFIED BY AL RAIYAN GROUP ===`
  ].filter(Boolean).join('\n');

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPlainText)}`;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A5 landscape; margin: 0 !important; }
          html { font-size: 13px !important; }
          html, body { width: 210mm !important; height: 148mm !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
          body > *:not(.print-portal) { display: none !important; }
          .print-portal { display: block !important; position: static !important; width: 210mm !important; height: 148mm !important; overflow: hidden !important; }
        }
      `}</style>
      <div className="w-full overflow-x-auto bg-slate-100 print:bg-transparent print:overflow-visible flex sm:justify-center">
        <div className="receipt-print-card w-full min-w-[210mm] max-w-[210mm] print:max-w-full print:min-w-full print:w-full min-h-[148mm] max-h-[148mm] h-[148mm] print:min-h-[100vh] bg-white text-slate-900 shadow-xl print:shadow-none print:m-0 flex flex-col relative shrink-0 border border-slate-200 print:border-none"
          style={{ pageBreakAfter: 'always', margin: '0 auto' }}>

          {/* Top illustration image accent */}
          <img
            src={topIllustration}
            alt=""
            className="absolute top-0 right-0 w-48 opacity-30 pointer-events-none z-[1]"
          />

          {/* Center Company Logo PNG Watermark (Layered at z-30 with mix-blend-multiply so no box can obscure it) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 flex items-center justify-center opacity-20 mix-blend-multiply pointer-events-none z-30">
            <img
              src={companyInfo?.company_logo || companyLogo}
              alt="Watermark Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="relative z-10 flex-1 flex flex-col px-4 py-2.5 print:px-4 print:py-2 h-full justify-between box-border">

            {/* 1. Header Section */}
            <div className="flex justify-between items-center mb-2 relative z-20 pb-1.5 border-b border-slate-200/80">
              <div className="flex items-center w-[40%]">
                <img
                  src={headerLogoUrl}
                  alt={sideBySideLogoObj?.title || companyInfo?.company_name || "Side by Side Logo"}
                  className="h-12 sm:h-14 max-w-[260px] sm:max-w-[300px] object-contain object-left drop-shadow-xs"
                />
              </div>

              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider whitespace-nowrap leading-tight uppercase font-serif">
                  MONEY <span className="text-blue-900">RECEIPT</span>
                </h1>
                <p className="text-[9.5px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">
                  ★ OFFICIAL FINANCIAL DOCUMENT ★
                </p>
              </div>

              {/* Clean Simple Receipt Metadata */}
              <div className="flex flex-col items-end justify-center text-right w-[35%] z-20">
                <div className="text-xs text-slate-600 font-bold">
                  Receipt No: <strong className="font-mono font-black text-sm text-slate-900">{receiptNo}</strong>
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">
                  Date: <strong className="font-mono text-slate-800 font-bold">{paymentDate}</strong>
                </div>
              </div>
            </div>

            {/* 2. Hero Section: Applicant & Destination Summary */}
            <div className="bg-slate-50/50 border border-slate-200/90 rounded-xl p-2.5 mb-2 grid grid-cols-12 gap-3 items-center shadow-2xs">
              {/* Applicant Info Column */}
              <div className="col-span-6 border-r border-slate-200/80 pr-2">
                <p className="text-[9.5px] text-slate-500 font-black tracking-wider uppercase mb-0.5">RECEIVED WITH THANKS FROM</p>
                <h2 className="text-base font-black text-slate-900 uppercase font-serif tracking-wide leading-tight truncate">
                  {applicant.full_name}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-700 mt-1 font-semibold">
                  <span>Passport: <strong className="text-slate-900 font-mono font-bold">{applicant.passport_number || 'N/A'}</strong></span>
                  <span>Nationality: <strong className="text-slate-900 font-bold">{applicant.profile?.nationality || 'Bangladesh'}</strong></span>
                </div>
              </div>

              {/* Destination & Application Column */}
              <div className="col-span-6 pl-1">
                <p className="text-[9.5px] text-slate-500 font-black tracking-wider uppercase mb-0.5">DESTINATION COUNTRY &amp; VISA SCHEME</p>
                <h2 className="text-base font-black text-blue-900 uppercase tracking-wide leading-tight truncate">
                  {countryDisplayName}
                </h2>
                <div className="space-y-0.5 text-xs text-slate-700 mt-1 font-semibold leading-tight">
                  <div className="truncate">Visa: <strong className="text-slate-900 font-bold">{visaDisplayName}</strong></div>
                  <div className="truncate">
                    1st Job: <strong className="text-slate-900 font-bold">{primaryJobDisplayName}</strong>
                    {secondaryJobDisplayName && secondaryJobDisplayName !== 'N/A' && (
                      <span className="ml-2 text-slate-500 font-semibold">
                        2nd Job: <strong className="text-slate-900 font-bold">{secondaryJobDisplayName}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Middle Section: Financial Details (Left) + Digital Verification QR (Right) */}
            <div className="grid grid-cols-12 gap-2.5 mb-2 items-stretch">

              {/* Left: Financial Breakdown (col-span-8) */}
              <div className="col-span-8 border border-slate-200/90 rounded-xl p-2.5 bg-white/40 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 mb-1.5">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <CreditCardIcon className="w-4 h-4 text-blue-900" /> PAYMENT BREAKDOWN
                    </span>
                    <span className="bg-blue-50/90 text-blue-900 border border-blue-200 text-xs font-black px-2.5 py-0.5 rounded-full capitalize">
                      {payment.payment_method?.replace('_', ' ') || 'Cash'} • {getOrdinal(payment.installment_type)} Installment
                    </span>
                  </div>

                  {/* Main Amount Display */}
                  <div className="flex items-baseline justify-between bg-slate-50/60 border border-slate-200/80 rounded-lg px-3 py-1.5 mb-1.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Paid Amount</span>
                      <span className="text-xl font-black text-slate-900 font-mono tracking-tight">
                        {paidCurrencySymbol} {paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-slate-500 font-bold ml-1">({paidCurrency})</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Euro Equivalent</span>
                      <span className="bg-emerald-50/90 text-emerald-900 border border-emerald-200 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded font-mono inline-block">
                        € {eurAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                      </span>
                    </div>
                  </div>

                  {/* Words & Details */}
                  <div className="space-y-1 text-xs text-slate-800">
                    <div className="flex items-baseline">
                      <span className="w-24 text-slate-500 font-bold shrink-0">In Words (Paid):</span>
                      <span className="font-semibold text-slate-900 italic">{amountInWordsPaid}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="w-24 text-slate-500 font-bold shrink-0">In Words (EUR):</span>
                      <span className="font-semibold text-slate-900 italic">{amountInWordsEUR}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-200/60 pt-1 mt-1 font-semibold">
                      <span>Purpose: <strong className="text-slate-900 font-bold">{payment.remarks || 'Visa Processing Fee'}</strong></span>
                      <span>Rate: <strong className="text-slate-900 font-mono font-bold">1 EUR = {paidCurrency} {displayExchangeRate}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Digital Verification Card (col-span-4) */}
              <div className="col-span-4 border border-slate-200/90 rounded-xl bg-slate-50/50 p-2 flex flex-col items-center justify-center text-center shadow-2xs relative">
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-800 uppercase tracking-wider mb-1">
                  <ShieldCheckIcon className="w-4 h-4 text-blue-900" /> DIGITAL VERIFICATION
                </div>
                <div className="w-[82px] h-[82px] bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center mb-1 relative z-40">
                  <img
                    src={qrCodeUrl}
                    alt="Scan Receipt QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="bg-slate-900 text-white text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs mt-0.5">
                  SCAN TO VERIFY
                </span>
                <p className="text-[8px] text-slate-500 font-semibold mt-1 leading-tight px-1">
                  Scan QR code for instant plain text official receipt details.
                </p>
              </div>
            </div>

            {/* 4. Lower Section: Paid By Details, Note & Signature Fields */}
            <div className="grid grid-cols-12 gap-2.5 items-stretch mb-1">
              {/* Paid By & Terms (col-span-4) */}
              <div className="col-span-4 border border-slate-200/90 rounded-xl p-2.5 bg-slate-50/50 flex flex-col justify-between shadow-2xs">
                <div>
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-blue-900" /> PAID BY DETAILS
                  </h4>
                  <div className="space-y-0.5 text-xs text-slate-800 font-medium">
                    <div><span className="text-slate-500 font-semibold">Name:</span> <strong className="text-slate-900 font-bold">{applicant.full_name}</strong></div>
                    <div><span className="text-slate-500 font-semibold">Father:</span> <strong className="text-slate-900 font-bold">{applicant.profile?.father_name || 'N/A'}</strong></div>
                    <div><span className="text-slate-500 font-semibold">NID:</span> <strong className="text-slate-900 font-mono font-bold">{applicant.nid_number || 'N/A'}</strong></div>
                  </div>
                </div>
              </div>

              {/* Important Note (col-span-3) */}
              <div className="col-span-3 border border-amber-200/80 bg-amber-50/40 rounded-xl p-2.5 flex flex-col justify-between shadow-2xs">
                <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <InformationCircleIcon className="w-3.5 h-3.5 text-amber-700" /> IMPORTANT NOTE
                </h4>
                <p className="text-[9px] text-slate-800 font-semibold leading-tight text-justify flex-1">
                  {payment.important_note || companyInfo?.money_receipt_important_note || `Refunds for unapproved visa applications shall be processed strictly as per signed agreement clauses upon official written request.`}
                </p>
              </div>

              {/* Official Signature Fields (col-span-5: 2 spacious side-by-side signature areas) */}
              <div className="col-span-5 border border-slate-200/90 rounded-xl p-2.5 bg-white/40 flex items-stretch gap-4 justify-between shadow-2xs">
                {/* Applicant Signature */}
                <div className="flex-1 flex flex-col justify-between text-center min-h-[55px]">
                  <div className="flex-1" />
                  <div className="w-full border-t-2 border-slate-700 pt-1">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider leading-tight">Applicant Signature</p>
                    <p className="text-[8px] text-slate-400 mt-0.5 font-medium">Date: ___ / ___ / ______</p>
                  </div>
                </div>

                {/* Authorized Representative & Seal */}
                <div className="flex-1 flex flex-col justify-between text-center min-h-[55px]">
                  <div className="flex-1" />
                  <div className="w-full border-t-2 border-slate-700 pt-1">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider leading-tight">Authorized Signature &amp; Seal</p>
                    <p className="text-[8px] text-slate-400 mt-0.5 font-medium">Date: ___ / ___ / ______</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Separate Declaration Strip Outside the Boxes */}
            <div className="flex items-center gap-2.5 px-1 py-1 my-0.5 z-20">
              <span
                style={{ width: '15px', height: '15px', border: '2px solid #0f172a' }}
                className="bg-white shrink-0 inline-block rounded-xs"
              />
              <p className="text-[9px] text-slate-900 font-black leading-tight">
                I agree to the terms and conditions of the signed agreement including the refund policy.
              </p>
            </div>

            {/* 5. Footer Banner */}
            <div className="bg-slate-900 text-white py-1.5 px-4 text-[9.5px] font-bold flex items-center justify-between z-20 shrink-0 rounded-b-lg print:rounded-none">
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Head Office: {companyInfo?.address || 'Kingdom of Saudi Arabia (KSA)'}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="flex items-center gap-1">
                  <EnvelopeIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {companyInfo?.email || 'alraiyangroup333@gmail.com'}
                </span>
                <span className="flex items-center gap-1">
                  <GlobeAltIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {companyInfo?.website || 'al-raiyangroup.com'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

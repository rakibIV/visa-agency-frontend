import React from 'react';
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
    ? dbExchangeRate 
    : (paidAmount > 0 ? eurAmount / paidAmount : 0.00711);

  const displayExchangeRate = eurRatio > 0 ? (1 / eurRatio).toFixed(2) : '140.69';
  const paidCurrency = payment.currency || 'BDT';
  const paidCurrencySymbol = getCurrencySymbol(paidCurrency);
  const paidCurrencyName = getCurrencyName(paidCurrency);

  const amountInWordsPaid = numberToWords(Math.floor(paidAmount)) + ` ${paidCurrencyName} Only`;
  const amountInWordsEUR = numberToWords(Math.floor(eurAmount)) + ' Euros Only';

  // Format Country, Visa, and Job
  const countryDisplayName = (typeof applicant?.country === 'object' ? applicant?.country?.name : applicant?.country) || applicant?.country_name || 'N/A';
  const visaDisplayName = applicant?.visa_name || (typeof applicant?.visa === 'object' ? applicant?.visa?.name : applicant?.visa) || 'N/A';
  const jobDisplayName = 
    applicant?.job_name || 
    (typeof applicant?.job === 'object' ? applicant?.job?.title || applicant?.job?.name : null) || 
    (typeof applicant?.job === 'string' && !applicant?.job.includes('-') ? applicant?.job : null) || 
    'N/A';

  const receiptNo = payment.receipt_number || payment.id || 'N/A';
  const paymentDate = payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A';

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
    `Job Title / Position: ${jobDisplayName}`,
    ``,
    `--- PAYMENT DETAILS ---`,
    `Installment: ${getOrdinal(payment.installment_type)} Installment`,
    `Amount Paid: ${paidCurrencySymbol} ${paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${paidCurrencyName})`,
    `Euro Equivalent: € ${eurAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} EUR`,
    `Exchange Rate: 1 EUR = ${paidCurrency} ${displayExchangeRate}`,
    `Payment Method: ${payment.payment_method?.replace('_', ' ').toUpperCase() || 'CASH'}`,
    `Purpose: ${payment.remarks || 'Visa Processing Fee'}`,
    ``,
    `--- VERIFICATION ---`,
    `Status: VERIFIED OFFICIAL RECEIPT`
  ].join('\n');

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPlainText)}`;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A5 landscape; margin: 0 !important; }
          html { font-size: 11px !important; }
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

          <div className="relative z-10 flex-1 flex flex-col px-4 py-2 print:px-4 print:py-1.5 h-full justify-between box-border">

            {/* 1. Header Section */}
            <div className="flex justify-between items-center mb-2 relative z-20 pb-1.5 border-b border-slate-200/80">
              <div className="flex items-center gap-3 w-[40%]">
                <img src={companyInfo?.company_logo || companyLogo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-xs shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-sm font-black tracking-wider text-slate-900 uppercase font-serif leading-tight">
                    {companyInfo?.company_name || 'Al Raiyan Group'}
                  </h1>
                  <p className="text-[8.5px] text-slate-500 font-bold tracking-widest uppercase mt-0.5 leading-tight">
                    مجموعة الريان • Official Agency
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-wider whitespace-nowrap leading-tight uppercase font-serif">
                  MONEY <span className="text-blue-900">RECEIPT</span>
                </h1>
                <p className="text-[7.5px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">
                  ★ OFFICIAL FINANCIAL DOCUMENT ★
                </p>
              </div>

              {/* Clean Simple Receipt Metadata */}
              <div className="flex flex-col items-end justify-center text-right w-[35%] z-20">
                <div className="text-[9px] text-slate-600 font-medium">
                  Receipt No: <strong className="font-mono font-bold text-xs text-slate-900">{receiptNo}</strong>
                </div>
                <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                  Date: <strong className="font-mono text-slate-800 font-semibold">{paymentDate}</strong>
                </div>
              </div>
            </div>

            {/* 2. Hero Section: Applicant & Destination Summary */}
            <div className="bg-slate-50/50 border border-slate-200/90 rounded-xl p-2.5 mb-2 grid grid-cols-12 gap-3 items-center shadow-2xs">
              {/* Applicant Info Column */}
              <div className="col-span-6 border-r border-slate-200/80 pr-2">
                <p className="text-[8px] text-slate-500 font-bold tracking-wider uppercase mb-0.5">RECEIVED WITH THANKS FROM</p>
                <h2 className="text-sm font-black text-slate-900 uppercase font-serif tracking-wide leading-tight truncate">
                  {applicant.full_name}
                </h2>
                <div className="flex items-center gap-3 text-[9px] text-slate-600 mt-1 font-medium">
                  <span>Passport: <strong className="text-slate-900 font-mono">{applicant.passport_number || 'N/A'}</strong></span>
                  <span>Nationality: <strong className="text-slate-900">{applicant.profile?.nationality || 'Bangladesh'}</strong></span>
                </div>
              </div>

              {/* Destination & Application Column */}
              <div className="col-span-6 pl-1">
                <p className="text-[8px] text-slate-500 font-bold tracking-wider uppercase mb-0.5">DESTINATION COUNTRY &amp; VISA SCHEME</p>
                <h2 className="text-sm font-black text-blue-900 uppercase tracking-wide leading-tight truncate">
                  {countryDisplayName}
                </h2>
                <div className="flex items-center gap-3 text-[9px] text-slate-600 mt-1 font-medium truncate">
                  <span className="truncate">Visa: <strong className="text-slate-900">{visaDisplayName}</strong></span>
                  <span className="truncate">Job: <strong className="text-slate-900">{jobDisplayName}</strong></span>
                </div>
              </div>
            </div>

            {/* 3. Middle Section: Financial Details (Left) + Digital Verification QR (Right) */}
            <div className="grid grid-cols-12 gap-2.5 mb-2 items-stretch">
              
              {/* Left: Financial Breakdown (col-span-8) */}
              <div className="col-span-8 border border-slate-200/90 rounded-xl p-2.5 bg-white/40 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 mb-1.5">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <CreditCardIcon className="w-3.5 h-3.5 text-blue-900" /> PAYMENT BREAKDOWN
                    </span>
                    <span className="bg-blue-50/90 text-blue-900 border border-blue-200 text-[8.5px] font-bold px-2 py-0.5 rounded-full capitalize">
                      {payment.payment_method?.replace('_', ' ') || 'Cash'} • {getOrdinal(payment.installment_type)} Installment
                    </span>
                  </div>

                  {/* Main Amount Display */}
                  <div className="flex items-baseline justify-between bg-slate-50/60 border border-slate-200/80 rounded-lg px-3 py-1.5 mb-1.5">
                    <div>
                      <span className="text-[9px] text-slate-500 font-semibold block">Paid Amount</span>
                      <span className="text-base font-black text-slate-900 font-mono tracking-tight">
                        {paidCurrencySymbol} {paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-slate-500 ml-1">({paidCurrency})</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[8.5px] text-slate-500 font-semibold block">Euro Equivalent</span>
                      <span className="bg-emerald-50/90 text-emerald-900 border border-emerald-200 text-xs font-black px-2 py-0.5 rounded font-mono inline-block">
                        € {eurAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                      </span>
                    </div>
                  </div>

                  {/* Words & Details */}
                  <div className="space-y-1 text-[9px] text-slate-700">
                    <div className="flex items-baseline">
                      <span className="w-24 text-slate-500 font-semibold shrink-0">In Words (Paid):</span>
                      <span className="font-medium text-slate-900 italic">{amountInWordsPaid}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="w-24 text-slate-500 font-semibold shrink-0">In Words (EUR):</span>
                      <span className="font-medium text-slate-900 italic">{amountInWordsEUR}</span>
                    </div>
                    <div className="flex items-center justify-between text-[8.5px] text-slate-500 border-t border-slate-200/60 pt-1 mt-1">
                      <span>Purpose: <strong className="text-slate-800 font-semibold">{payment.remarks || 'Visa Processing Fee'}</strong></span>
                      <span>Rate: <strong className="text-slate-800 font-mono">1 EUR = {paidCurrency} {displayExchangeRate}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Digital Verification Card (col-span-4) */}
              <div className="col-span-4 border border-slate-200/90 rounded-xl bg-slate-50/50 p-2 flex flex-col items-center justify-center text-center shadow-2xs relative">
                <div className="flex items-center gap-1 text-[8.5px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-900" /> DIGITAL VERIFICATION
                </div>
                <div className="w-[72px] h-[72px] bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center mb-1 relative z-40">
                  <img
                    src={qrCodeUrl}
                    alt="Scan Receipt QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="bg-slate-900 text-white text-[7.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs mt-0.5">
                  SCAN TO VERIFY
                </span>
                <p className="text-[7px] text-slate-500 mt-1 leading-tight px-1">
                  Scan QR code for instant plain text official receipt details.
                </p>
              </div>
            </div>

            {/* 4. Lower Section: Paid By Details, Note & Signature Fields */}
            <div className="grid grid-cols-12 gap-2.5 items-stretch mb-1">
              {/* Paid By & Terms (col-span-4) */}
              <div className="col-span-4 border border-slate-200/90 rounded-xl p-2 bg-slate-50/50 flex flex-col justify-between shadow-2xs">
                <div>
                  <h4 className="text-[8.5px] font-extrabold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <UserIcon className="w-3 h-3 text-blue-900" /> PAID BY DETAILS
                  </h4>
                  <div className="space-y-0.5 text-[8.5px] text-slate-700">
                    <div><span className="text-slate-500">Name:</span> <strong className="text-slate-900">{applicant.full_name}</strong></div>
                    <div><span className="text-slate-500">Father:</span> <strong className="text-slate-900">{applicant.profile?.father_name || 'N/A'}</strong></div>
                    <div><span className="text-slate-500">NID:</span> <strong className="text-slate-900 font-mono">{applicant.nid_number || 'N/A'}</strong></div>
                  </div>
                </div>
                <p className="text-[7px] text-slate-500 leading-tight italic mt-1 border-t border-slate-200/60 pt-1">
                  I agree to the terms and conditions of the signed agreement including refund policy.
                </p>
              </div>

              {/* Important Note (col-span-3) */}
              <div className="col-span-3 border border-amber-200/80 bg-amber-50/40 rounded-xl p-2 flex flex-col justify-between shadow-2xs">
                <h4 className="text-[8px] font-extrabold text-amber-900 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <InformationCircleIcon className="w-3 h-3 text-amber-700" /> IMPORTANT NOTE
                </h4>
                <p className="text-[7.5px] text-slate-700 leading-tight text-justify flex-1">
                  {payment.important_note || companyInfo?.money_receipt_important_note || `Refunds for unapproved visa applications shall be processed strictly as per signed agreement clauses upon official written request.`}
                </p>
              </div>

              {/* Official Signature Fields (col-span-5: 2 spacious side-by-side signature areas) */}
              <div className="col-span-5 border border-slate-200/90 rounded-xl p-2 bg-white/40 flex items-end gap-3 justify-between shadow-2xs">
                {/* Applicant Signature */}
                <div className="flex-1 flex flex-col justify-end text-center h-full min-h-[50px]">
                  <div className="flex-1" />
                  <div className="w-full border-t border-slate-400 pt-1">
                    <p className="text-[8px] font-bold text-slate-800 leading-tight">Applicant Signature</p>
                  </div>
                </div>

                {/* Authorized Representative & Seal */}
                <div className="flex-1 flex flex-col justify-end text-center h-full min-h-[50px]">
                  <div className="flex-1" />
                  <div className="w-full border-t border-slate-400 pt-1">
                    <p className="text-[8px] font-bold text-slate-800 leading-tight">Authorized Signature &amp; Seal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Footer Banner */}
            <div className="bg-slate-900 text-white py-1.5 px-4 text-[8px] font-medium flex items-center justify-between z-20 shrink-0 rounded-b-lg print:rounded-none">
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-3 h-3 text-amber-400 shrink-0" /> Head Office: {companyInfo?.address || 'Kingdom of Saudi Arabia (KSA)'}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1">
                  <EnvelopeIcon className="w-3 h-3 text-amber-400 shrink-0" /> {companyInfo?.email || 'alraiyangroup333@gmail.com'}
                </span>
                <span className="flex items-center gap-1">
                  <GlobeAltIcon className="w-3 h-3 text-amber-400 shrink-0" /> {companyInfo?.website || 'al-raiyangroup.com'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

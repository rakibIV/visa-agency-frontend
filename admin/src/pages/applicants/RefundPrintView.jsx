import React from 'react';
import topIllustration from '../../assets/top-illustration.png';
import companyLogo from '../../assets/logo.png';
import { UserIcon, IdentificationIcon, DocumentTextIcon, BanknotesIcon, ShieldCheckIcon, MapPinIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

// Helper to convert number to words
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

export default function RefundPrintView({ applicant, refund, companyInfo, currenciesList = [] }) {
  if (!refund) return null;

  React.useEffect(() => {
    const originalTitle = document.title;
    const receiptNo = refund?.receipt_number || refund?.id || applicant?.application_number || applicant?.id || '';
    document.title = `Refund Receipt - ${receiptNo}`;
    return () => {
      document.title = originalTitle;
    };
  }, [refund, applicant]);

  const refundMethodDisplay = refund.refund_method ? refund.refund_method.replace('_', ' ').toUpperCase() : 'BANK TRANSFER';
  const isCash = refundMethodDisplay.includes('CASH');

  const samplePayment = applicant?.payments?.[0];
  const paidCurrency = samplePayment?.currency || 'BDT';
  
  const getCurrencySymbol = (code) => {
    const curr = currenciesList.find(c => c.code === code);
    return curr?.symbol || code || '৳';
  };
  
  const getCurrencyName = (code) => {
    const curr = currenciesList.find(c => c.code === code);
    return curr?.name || code;
  };

  const sampleAmount = Number(samplePayment?.amount) || 0;
  const sampleEur = Number(samplePayment?.euro_amount) || 0;
  const dbExchangeRate = Number(samplePayment?.exchange_rate) || 0;

  const eurRatio = dbExchangeRate > 0 
    ? (dbExchangeRate > 1 ? 1 / dbExchangeRate : dbExchangeRate)
    : (sampleAmount > 0 && sampleEur > 0 ? sampleEur / sampleAmount : 0.00714286);

  const exchangeRate = dbExchangeRate > 0 
    ? (dbExchangeRate > 1 ? dbExchangeRate.toFixed(2) : (1 / dbExchangeRate).toFixed(2))
    : (eurRatio > 0 ? (1 / eurRatio).toFixed(2) : '140.00');

  const paidAmount = Number(refund.refund_amount) || 0;
  const eurAmount = paidAmount * eurRatio;
  
  const paidCurrencyName = getCurrencyName(paidCurrency);
  const amountInWordsPaid = numberToWords(Math.floor(paidAmount)) + ` ${paidCurrencyName} Only`;

  const totalPaid = Number(refund.refundable_payment_total) || 0;
  const nonRefundable = Number(refund.non_refundable_amount) || 0;
  
  const refundPercentage = refund.refund_percentage ? Number(refund.refund_percentage) : 80;
  const nonRefundPercentage = 100 - refundPercentage;

  const refundBank = refund?.bank_detail_snapshot || applicant?.refund_bank_detail || {};

  const receiptNo = refund.receipt_number || `REF-${refund.id}`;
  const refundIssueDate = new Date(refund.created_at).toLocaleDateString('en-GB');

  const DocumentFooter = () => (
    <div className="print-footer absolute bottom-0 left-0 right-0 h-11 bg-slate-900 text-white flex items-center justify-between px-8 text-[8.5px] font-medium z-30 w-full rounded-b-xl print:rounded-none">
      <div className="flex items-center gap-1.5">
        <MapPinIcon className="w-3 h-3 text-amber-400 shrink-0" /> Head Office: {companyInfo?.address || 'Kingdom of Saudi Arabia (KSA)'}
      </div>
      <div className="flex items-center gap-5 shrink-0">
        <span className="flex items-center gap-1">
          <EnvelopeIcon className="w-3 h-3 text-amber-400 shrink-0" /> {companyInfo?.email || 'alraiyangroup333@gmail.com'}
        </span>
        <span className="flex items-center gap-1">
          <GlobeAltIcon className="w-3 h-3 text-amber-400 shrink-0" /> {companyInfo?.website || 'al-raiyangroup.com'}
        </span>
      </div>
    </div>
  );

  const PageContainer = ({ children }) => (
    <div className="w-full overflow-x-auto bg-slate-100 print:bg-transparent print:overflow-visible flex sm:justify-center">
      <div className="print-page w-full min-w-[8.5in] max-w-[8.5in] print:max-w-full print:min-w-full print:w-full min-h-[11in] print:min-h-[100vh] mx-auto bg-white mb-8 shadow-xl print:shadow-none print:m-0 flex flex-col pt-6 pb-14 px-8 box-border relative shrink-0">
        {/* Center Company Logo PNG Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] flex items-center justify-center opacity-15 mix-blend-multiply pointer-events-none z-30">
          <img
            src={companyInfo?.company_logo || companyLogo}
            alt="Watermark Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <img
          src={topIllustration}
          alt=""
          className="absolute top-0 right-0 w-44 opacity-30 pointer-events-none z-10"
        />
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
          html { font-size: 11.5px !important; }
          html, body { width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          body > *:not(.print-portal) { display: none !important; }
          .print-portal { display: block !important; position: static !important; width: 100%; height: auto !important; overflow: visible !important; }
        }
      `}</style>
      <div className="w-full bg-slate-100 py-6 print:py-0 print:bg-white text-slate-900 font-sans">
        <PageContainer>
          <div className="flex-1 w-full relative z-20 flex flex-col justify-between">
            
            {/* 1. Header Section */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-3.5 w-1/3">
                <img src={companyInfo?.company_logo || companyLogo} alt="Logo" className="w-12 h-12 object-contain drop-shadow-xs shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-base font-black tracking-wider text-slate-900 uppercase font-serif leading-tight truncate">
                    {companyInfo?.company_name || 'Al Raiyan Group'}
                  </h1>
                  <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-0.5 leading-tight truncate">
                    مجموعة الريان • Official Agency
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center w-1/3">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-wider whitespace-nowrap leading-tight uppercase font-serif">
                  REFUND <span className="text-blue-900">RECEIPT</span>
                </h1>
                <p className="text-[8px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">
                  ★ OFFICIAL FINANCIAL ACKNOWLEDGEMENT ★
                </p>
              </div>

              <div className="w-1/3 text-right">
                <div className="text-[11px] text-slate-600 font-medium">
                  Receipt No: <strong className="font-mono font-bold text-slate-900">{receiptNo}</strong>
                </div>
              </div>
            </div>

            {/* 2. Hero Applicant & Refund Method Summary Card */}
            <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 mb-4 grid grid-cols-12 gap-4 items-center shadow-2xs">
              {/* Applicant Info */}
              <div className="col-span-7 border-r border-slate-200/80 pr-4 space-y-1.5 text-xs">
                <p className="text-[8.5px] text-slate-500 font-bold tracking-wider uppercase">REFUND RECIPIENT DETAILS</p>
                <h2 className="text-sm font-black text-slate-900 uppercase font-serif tracking-wide truncate">
                  {applicant.full_name}
                </h2>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600 text-[11px] pt-0.5">
                  <div>Receipt Date: <strong className="text-slate-900 font-mono font-semibold">{refundIssueDate}</strong></div>
                  <div>Application ID: <strong className="text-slate-900 font-mono font-semibold">{applicant.application_number || `APP-${applicant.id?.slice(0,8)}`}</strong></div>
                  <div>Passport: <strong className="text-slate-900 font-mono font-semibold">{applicant.passport_number || 'N/A'}</strong></div>
                  <div>Father: <strong className="text-slate-900 font-semibold">{applicant.profile?.father_name || 'N/A'}</strong></div>
                  <div>Nationality: <strong className="text-slate-900 font-semibold">{applicant.country?.nationality || 'Bangladeshi'}</strong></div>
                </div>
              </div>

              {/* Refund Method & Net Payable Summary */}
              <div className="col-span-5 pl-1 flex flex-col justify-between text-right space-y-1">
                <p className="text-[8.5px] text-slate-500 font-bold tracking-wider uppercase">REFUND METHOD &amp; NET PAID</p>
                <div>
                  <span className="bg-slate-900 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block mb-1">
                    {refundMethodDisplay}
                  </span>
                  <div className="text-xl font-black text-blue-900 font-mono tracking-tight">
                    {paidCurrency} {paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                    EUR Equivalent: € {eurAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Official Acknowledgment Confirmation Statement */}
            <div className="bg-white/80 border border-slate-200/90 rounded-xl p-3.5 mb-4 shadow-2xs">
              <p className="text-xs text-slate-800 leading-relaxed text-justify">
                I hereby confirm that I have received the net refund amount of{' '}
                <strong className="text-slate-900 font-bold font-mono">{paidCurrency} {paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>{' '}
                (<span className="italic">{amountInWordsPaid}</span>), which represents{' '}
                <strong className="text-blue-900 font-bold">{refundPercentage}% refund of the 2nd Installment total ({paidCurrency} {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })})</strong>{' '}
                paid via <strong className="text-slate-900 font-bold uppercase">{refundMethodDisplay}</strong>. I accept this payment in full satisfaction of the refundable total under company agreement terms.
              </p>
            </div>

            {/* 4. Unified Financial & Method Details Breakdown Table */}
            <div className="border border-slate-200/90 rounded-xl mb-4 shadow-2xs overflow-hidden bg-white/80">
              <div className="bg-slate-900 text-white font-bold text-xs uppercase px-4 py-2.5 tracking-wider flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <DocumentTextIcon className="w-4 h-4 text-amber-400" /> REFUND BREAKDOWN &amp; ACCOUNT DETAILS
                </span>
                <span className="bg-slate-800 px-2.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">
                  Exchange Rate: 1 EUR = {paidCurrency} {exchangeRate}
                </span>
              </div>

              <div className="p-4 text-xs text-slate-800 space-y-2.5">
                {/* Breakdown Rows */}
                <div className="grid grid-cols-12 items-center py-1 border-b border-slate-100">
                  <span className="col-span-6 text-slate-600 font-medium">Total 2nd Installment Paid (Refundable Base)</span>
                  <span className="col-span-6 text-right font-extrabold text-slate-900 font-mono">{paidCurrency} {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-12 items-center py-1 border-b border-slate-100">
                  <span className="col-span-6 text-slate-600 font-medium">Refund Calculation Basis</span>
                  <span className="col-span-6 text-right font-bold text-blue-900">{refundPercentage}% Refund of 2nd Installment Amount</span>
                </div>
                <div className="grid grid-cols-12 items-center py-1 border-b border-slate-100">
                  <span className="col-span-6 text-slate-600 font-medium">Non-Refundable Processing Deductions ({nonRefundPercentage}%)</span>
                  <span className="col-span-6 text-right font-extrabold text-rose-700 font-mono">- {paidCurrency} {nonRefundable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-12 items-center py-2 bg-emerald-50/70 px-3 rounded-lg border border-emerald-200/80">
                  <span className="col-span-6 text-emerald-900 font-black">Net Refund Amount Received ({refundPercentage}%)</span>
                  <span className="col-span-6 text-right font-black text-emerald-900 font-mono text-sm">{paidCurrency} {paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Refund Method Account Details Sub-Block */}
                <div className="pt-2 border-t border-slate-200/80 mt-2">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                    ACCOUNT &amp; DISBURSEMENT DETAILS ({refundMethodDisplay})
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-200/80">
                    <div><span className="text-slate-500 font-medium">Refund Method:</span> <strong className="text-slate-900 font-bold uppercase">{refundMethodDisplay}</strong></div>
                    {refundBank.bank_name && <div><span className="text-slate-500 font-medium">Bank / Provider:</span> <strong className="text-slate-900 font-bold">{refundBank.bank_name}</strong></div>}
                    {refundBank.account_holder_name && <div><span className="text-slate-500 font-medium">Account Holder:</span> <strong className="text-slate-900 font-bold">{refundBank.account_holder_name}</strong></div>}
                    {refundBank.account_number_or_iban && <div><span className="text-slate-500 font-medium">Account / IBAN:</span> <strong className="text-slate-900 font-mono font-bold">{refundBank.account_number_or_iban}</strong></div>}
                    {refundBank.branch_name && <div><span className="text-slate-500 font-medium">Branch Name:</span> <strong className="text-slate-900 font-bold">{refundBank.branch_name}</strong></div>}
                    {refundBank.routing_number && <div><span className="text-slate-500 font-medium">Routing No:</span> <strong className="text-slate-900 font-mono font-bold">{refundBank.routing_number}</strong></div>}
                    {refundBank.mobile_number && <div><span className="text-slate-500 font-medium">Mobile Number:</span> <strong className="text-slate-900 font-mono font-bold">{refundBank.mobile_number}</strong></div>}
                    {refund.cheque_number && <div><span className="text-slate-500 font-medium">Cheque Number:</span> <strong className="text-slate-900 font-mono font-bold">{refund.cheque_number}</strong></div>}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Legal Terms & Declaration */}
            <div className="space-y-1.5 mb-4 text-xs text-slate-700 leading-relaxed">
              <p className="text-justify">
                I acknowledge that the non-refundable deduction of <strong className="text-slate-900 font-mono">{paidCurrency} {nonRefundable.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({nonRefundPercentage}%)</strong> covers administrative processing, embassy documentation, and official agency service fees.
              </p>
              <div className="flex items-start gap-2 pt-1">
                <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs mt-0.5 shrink-0" />
                <p className="text-justify text-[11px] text-slate-600 italic">
                  I declare that I have read, understood, and voluntarily accepted these terms without objection, and hold no further financial claim regarding this application.
                </p>
              </div>
            </div>

            {/* 6. Spacious Physical Signature Block (50px+ Open Height) */}
            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs font-semibold text-slate-800 break-inside-avoid relative z-20 mt-auto pb-4">
              <div className="flex flex-col items-center justify-end h-full min-h-[55px]">
                <div className="flex-1" />
                <div className="w-full border-t border-slate-400 pt-1.5">
                  <p className="uppercase tracking-wider text-[10px]">Applicant's Signature</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Date: ___ / ___ / ______</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-end h-full min-h-[55px]">
                <div className="flex-1" />
                <div className="w-full border-t border-slate-400 pt-1.5">
                  <p className="uppercase tracking-wider text-[10px]">Left Thumb Impression</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Date: ___ / ___ / ______</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-end h-full min-h-[55px]">
                <div className="flex-1" />
                <div className="w-full border-t border-slate-400 pt-1.5">
                  <p className="uppercase tracking-wider text-[10px]">Authorized Representative</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Date: ___ / ___ / ______</p>
                  <p className="text-[9px] text-slate-800 mt-0.5 font-serif italic">{applicant?.assigned_staff_name || ''}</p>
                </div>
              </div>
            </div>

          </div>
        </PageContainer>
      </div>
    </>
  );
}

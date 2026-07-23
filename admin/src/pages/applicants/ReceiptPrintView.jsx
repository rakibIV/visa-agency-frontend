import React from 'react';
import topIllustration from '../../assets/top-illustration.png';
import companyLogo from '../../assets/logo.png';
import { UserIcon, IdentificationIcon, PhoneIcon, EnvelopeIcon, CreditCardIcon, InformationCircleIcon, MapPinIcon, GlobeAltIcon, UserCircleIcon } from '@heroicons/react/24/outline';

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

          {/* Top illustration image & decorative background accent */}
          <img
            src={topIllustration}
            alt=""
            className="absolute top-0 right-0 w-44 opacity-40 pointer-events-none z-[1]"
          />

          <div className="relative z-10 flex-1 flex flex-col px-5 py-3 print:px-5 print:py-2.5 h-full justify-between box-border">

            {/* Header Section */}
            <div className="flex justify-between items-center mb-2 relative z-20">
              <div className="flex items-center gap-2.5 w-[38%]">
                <img src={companyInfo?.company_logo || companyLogo} alt="Logo" className="w-11 h-11 object-contain drop-shadow-md shrink-0" />
                <div className="mt-0.5 min-w-0">
                  <h1 className="text-xs sm:text-sm font-black tracking-wider text-slate-900 uppercase font-serif leading-tight">
                    {companyInfo?.company_name || 'Al Raiyan Group'}
                  </h1>
                  <p className="text-[8px] text-slate-600 font-bold tracking-widest uppercase mt-0.5 leading-tight">
                    Global Visa Services
                  </p>
                  <p className="text-[8px] text-orange-600 font-bold tracking-widest uppercase mt-0.5 leading-tight">
                    Trust • Process • Success
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center w-[28%] text-center">
                <h2 className="text-xs font-bold font-serif mb-0.5 leading-tight text-slate-800" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</h2>
                <h1 className="text-lg sm:text-xl font-black text-blue-900 tracking-wider whitespace-nowrap leading-tight mt-0.5">
                  MONEY <span className="text-orange-500">RECEIPT</span>
                </h1>
                <div className="flex gap-1 text-orange-500 text-[9px] leading-tight mt-1">
                  ★ ★ ★
                </div>
                <div className="w-[120px] h-0.5 bg-blue-200 mt-1"></div>
              </div>

              {/* Clean Receipt Badge & QR Code Box */}
              <div className="flex items-center justify-end gap-2.5 w-[34%] z-20">
                <div className="bg-white/95 border border-slate-200 rounded-xl p-1.5 shadow-2xs flex items-center gap-2.5">
                  <div className="w-10 h-10 border border-slate-100 rounded-lg p-1 bg-white shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm1 1h2v2H5V5zm9-3h8v8h-8V2zm2 2v4h4V4h-4zm1 1h2v2h-2V5zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm1 1h2v2H5v-2zm12-3h3v3h-3v-3zm-3 3h3v3h-3v-3zm3 3h3v3h-3v-3zm-6-3h3v3h-3v-3zm3-3h3v3h-3v-3zm0 6h3v3h-3v-3z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-500 leading-tight">Receipt No.</p>
                    <div className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 rounded shadow-2xs inline-block leading-tight mt-0.5 font-mono">
                      {payment.receipt_number || payment.id || 'N/A'}
                    </div>
                    <p className="text-[8px] font-bold text-slate-500 mt-1 leading-tight">Payment Date</p>
                    <p className="text-[9.5px] font-bold text-slate-900 leading-tight mt-0.5 font-mono">
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Info Boxes */}
            <div className="grid grid-cols-2 gap-2.5 mb-2">
              <div className="border border-blue-100 rounded-xl bg-blue-50/50 p-2 flex items-center gap-2.5 relative">
                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-slate-500 font-semibold leading-tight mb-0.5">Received with thanks from M/S:</p>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase leading-tight">{applicant.full_name}</h3>
                </div>
              </div>
              <div className="border border-blue-100 rounded-xl bg-slate-50 p-2 flex items-center gap-2.5 relative">
                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-slate-500 font-semibold leading-tight mb-0.5">Which country will you go to:</p>
                  <h3 className="text-xs sm:text-sm font-bold text-blue-900 leading-tight">{applicant.visa_name || 'Schengen Countries / Europe'}</h3>
                </div>
              </div>
            </div>

            {/* Middle Content Blocks */}
            <div className="grid grid-cols-12 gap-2.5 flex-1 mb-2">
              {/* Personal Info */}
              <div className="col-span-5 border border-blue-200 rounded-xl relative pt-6 pb-2 px-3 flex flex-col justify-start bg-white/95 shadow-2xs">
                <div className="absolute top-0 left-0 bg-blue-900 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-br-lg flex items-center gap-1 shadow-2xs">
                  <UserCircleIcon className="w-3.5 h-3.5" /> PERSONAL INFORMATION
                </div>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center text-[10px] leading-normal py-0.5">
                    <div className="w-5 flex items-center justify-center text-blue-900"><GlobeAltIcon className="w-3.5 h-3.5" /></div>
                    <div className="w-22 text-slate-600 font-semibold shrink-0">Nationality</div>
                    <div className="text-slate-900 font-bold">: {applicant.profile?.nationality || 'Bangladesh'}</div>
                  </div>
                  <div className="flex items-center text-[10px] leading-normal py-0.5">
                    <div className="w-5 flex items-center justify-center text-blue-900"><IdentificationIcon className="w-3.5 h-3.5" /></div>
                    <div className="w-22 text-slate-600 font-semibold shrink-0">Passport No.</div>
                    <div className="text-slate-900 font-bold font-mono">: {applicant.passport_number || 'N/A'}</div>
                  </div>
                  <div className="flex items-center text-[10px] leading-normal py-0.5">
                    <div className="w-5 flex items-center justify-center text-blue-900"><PhoneIcon className="w-3.5 h-3.5" /></div>
                    <div className="w-22 text-slate-600 font-semibold shrink-0">Phone Number</div>
                    <div className="text-slate-900 font-bold">: {applicant.profile?.phone || 'N/A'}</div>
                  </div>
                  <div className="flex items-center text-[10px] leading-normal py-0.5">
                    <div className="w-5 flex items-center justify-center text-blue-900"><EnvelopeIcon className="w-3.5 h-3.5" /></div>
                    <div className="w-22 text-slate-600 font-semibold shrink-0">Email</div>
                    <div className="text-slate-900 font-bold pr-1">: {applicant.profile?.email || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="col-span-7 border border-blue-200 rounded-xl relative pt-6 pb-2 px-3 flex flex-col justify-start bg-white/95 shadow-2xs">
                <div className="absolute top-0 left-0 bg-blue-900 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-br-lg flex items-center gap-1 shadow-2xs">
                  <CreditCardIcon className="w-3.5 h-3.5" /> PAYMENT DETAILS
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0">
                  <h1 className="text-[55px] font-serif font-black uppercase tracking-[0.5rem] rotate-[-45deg] whitespace-nowrap text-center leading-tight">{companyInfo?.company_name || 'Al Raiyan Group'}</h1>
                </div>

                <div className="space-y-1 relative z-10 mt-0.5">
                  <div className="flex items-center text-[10px] leading-normal py-0.5">
                    <div className="w-[120px] text-slate-600 font-semibold shrink-0">Payment Method</div>
                    <div className="text-slate-900 font-bold">: <span className="capitalize">{payment.payment_method?.replace('_', ' ') || 'Cash'}</span></div>
                  </div>
                  <div className="flex items-center gap-1.5 my-0.5">
                    <div className="w-[120px] text-slate-900 font-bold text-[9.5px] shrink-0 leading-tight">
                      {getOrdinal(payment.installment_type)} Installment Amount
                    </div>
                    <div className="flex-1 flex gap-1.5">
                      <div className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[9.5px] text-blue-900 shadow-2xs flex items-center justify-between flex-1">
                        <span className="font-bold">{paidCurrencySymbol} ({paidCurrency})</span>
                        <span className="font-black text-[11px]">{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="bg-green-50 border border-green-200 px-2 py-0.5 rounded-md text-[9.5px] text-green-900 shadow-2xs flex items-center justify-between w-28 shrink-0">
                        <span className="font-bold">€ (EUR)</span>
                        <span className="font-black text-[11px]">{eurAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-[9.5px] leading-normal py-0.5">
                    <div className="w-[120px] text-slate-600 font-semibold shrink-0">In Words (Paid)</div>
                    <div className="text-slate-900 font-semibold">: {amountInWordsPaid}</div>
                  </div>
                  <div className="flex items-center text-[9.5px] leading-normal py-0.5">
                    <div className="w-[120px] text-slate-600 font-semibold shrink-0">In Words (EUR)</div>
                    <div className="text-slate-900 font-semibold">: {amountInWordsEUR}</div>
                  </div>
                  <div className="flex items-center text-[9.5px] leading-normal py-0.5">
                    <div className="w-[120px] text-slate-600 font-semibold shrink-0">Exchange Rate (Approx.)</div>
                    <div className="text-slate-900 font-semibold">: 1 EUR = {paidCurrency} {displayExchangeRate}</div>
                  </div>
                  <div className="flex items-center text-[9.5px] leading-normal py-0.5">
                    <div className="w-[120px] text-slate-600 font-semibold shrink-0">Purpose of Payment</div>
                    <div className="text-slate-900 font-semibold">: {payment.remarks || 'Visa Processing Fee'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Signatures Area */}
            <div className="grid grid-cols-12 gap-2 mb-1.5">
              {/* Important Note */}
              <div className="col-span-3 border border-orange-200 bg-orange-50/50 rounded-xl p-2 flex flex-col justify-between">
                <h4 className="flex items-center gap-1 text-[8.5px] font-bold text-orange-900 mb-0.5 leading-tight">
                  <InformationCircleIcon className="w-3.5 h-3.5 shrink-0" /> IMPORTANT NOTE
                </h4>
                <p className="text-[7.5px] text-slate-700 text-justify leading-snug">
                  If the Visa Application has been officially submitted but the visa is not approved, and the candidate&apos;s overseas assignment is not completed through {companyInfo?.company_name || 'Al-Raiyan Group'} within timeframe, refund shall be processed as per signed agreement clauses upon written request.
                </p>
              </div>

              {/* Paid By */}
              <div className="col-span-4 border border-blue-100 rounded-xl p-2 flex flex-col justify-between">
                <h4 className="flex items-center gap-1 text-[8.5px] font-bold text-slate-900 mb-0.5 leading-tight">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" /> PAID BY
                </h4>
                <div className="space-y-1 text-[9px]">
                  <div className="flex items-center leading-normal py-0.5"><span className="w-[65px] text-slate-500">Name</span><span className="font-bold">: {applicant.full_name}</span></div>
                  <div className="flex items-center leading-normal py-0.5"><span className="w-[65px] text-slate-500">Father&apos;s Name</span><span className="font-bold">: {applicant.profile?.father_name || 'N/A'}</span></div>
                  <div className="flex items-center leading-normal py-0.5"><span className="w-[65px] text-slate-500">NID No.</span><span className="font-bold">: {applicant.nid_number || 'N/A'}</span></div>
                </div>
                <p className="text-[7.5px] text-slate-500 mt-0.5 leading-tight italic">
                  I have read, understood, and agree to the terms and conditions of the Agreement, including refund policy.
                </p>
              </div>

              {/* Authorized By Seal */}
              <div className="col-span-2 border border-blue-100 rounded-xl p-1.5 flex flex-col items-center justify-center text-center">
                <h4 className="text-[8px] font-bold text-slate-800 mb-1 uppercase leading-tight">AUTHORIZED BY</h4>
                <div className="w-9 h-9 border border-dashed border-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-[7px] text-blue-500 font-bold rotate-[-15deg] leading-tight">Company<br />Seal</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="col-span-3 border border-blue-100 rounded-xl p-2 flex flex-col justify-end text-center text-[8px] font-semibold text-slate-700 space-y-1.5">
                <div className="w-full border-t border-slate-400 pt-0.5">
                  <p>Applicant Signature</p>
                </div>
                <div className="w-full border-t border-slate-400 pt-0.5">
                  <p>Relationship with Applicant</p>
                </div>
                <div className="w-full border-t border-slate-400 pt-0.5">
                  <p>(Authorized Signature &amp; Official Seal)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-blue-900 text-white py-1.5 px-5 text-[8.5px] font-medium flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" /> Head Office - {companyInfo?.address || 'Kingdom of Saudi Arabia (KSA)'}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1">
                <EnvelopeIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" /> Email- {companyInfo?.email || 'alraiyangroup333@gmail.com'}
              </div>
              <div className="flex items-center gap-1">
                <GlobeAltIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" /> {companyInfo?.website || 'al-raiyangroup.com'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

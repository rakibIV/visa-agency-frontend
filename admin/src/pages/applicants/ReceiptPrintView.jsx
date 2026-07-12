import React from 'react';
import topIllustration from '../../assets/top-illustration.png';
import companyLogo from '../../assets/logo.png';
import { UserIcon, IdentificationIcon, PhoneIcon, EnvelopeIcon, CreditCardIcon, InformationCircleIcon, MapPinIcon, GlobeAltIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Helper to convert number to words (simple version)
function numberToWords(num) {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
  
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

export default function ReceiptPrintView({ applicant, payment, companyInfo }) {
  if (!payment) return null;

  const getOrdinal = (type) => {
    switch (type) {
      case 'INITIAL': return '1st';
      case 'SECOND': return '2nd';
      case 'THIRD': return '3rd';
      default: return '';
    }
  };

  const exchangeRate = 140.69;
  const bdtAmount = Number(payment.amount) || 0;
  const eurAmount = (bdtAmount / exchangeRate);
  
  const amountInWordsBDT = numberToWords(Math.floor(bdtAmount)) + ' Bangladeshi Taka Only';
  const amountInWordsEUR = numberToWords(Math.floor(eurAmount)) + ' Euros Only';

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape !important; margin: 0; }
          body { width: 297mm !important; height: 210mm !important; }
        }
      `}</style>
      <div className="print-page-landscape w-full max-w-[297mm] min-h-[210mm] mx-auto bg-white mb-8 shadow-[0_0_15px_rgba(0,0,0,0.1)] print:shadow-none print:mb-0 flex flex-col box-border relative overflow-hidden font-sans border-8 border-slate-50 rounded-3xl"
           style={{ pageBreakAfter: 'always', margin: '0 auto', zoom: 0.85 }}>
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-900 rounded-br-[100px] z-0"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-100 rounded-tl-[100px] z-0 opacity-50"></div>

      <div className="relative z-10 flex-1 flex flex-col p-8 h-full">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4 w-1/3">
             <img src={companyLogo} alt="Logo" className="w-28 h-28 object-contain drop-shadow-md" />
              <div className="mt-2">
                <h1 className="text-2xl font-extrabold tracking-widest text-slate-900 uppercase font-serif leading-none">
                  {companyInfo?.company_name || 'Al-Rayyan Group'}
                </h1>
                <p className="text-[10px] text-slate-600 font-bold tracking-widest uppercase mt-1">
                  Global Visa Services
                </p>
                <p className="text-[10px] text-orange-600 font-bold tracking-widest uppercase">
                  Trust • Process • Success
                </p>
              </div>
          </div>

          <div className="flex flex-col items-center justify-center w-1/3">
            <h2 className="text-2xl font-bold font-serif mb-1" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</h2>
            <h1 className="text-5xl font-black text-blue-900 tracking-wider whitespace-nowrap">
              MONEY <span className="text-orange-500">RECEIPT</span>
            </h1>
            <div className="flex gap-4 text-orange-500 mt-1 text-2xl">
              ★ ★ ★
            </div>
            <div className="w-64 h-0.5 bg-blue-200 mt-2"></div>
          </div>

          <div className="flex flex-col items-end w-1/3 text-right pt-2">
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 border-2 border-slate-200 rounded p-1 bg-white">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Receipt" alt="QR" className="w-full h-full opacity-80" />
               </div>
               <div className="text-right">
                 <p className="text-xs font-bold text-slate-500">Receipt No.</p>
                 <div className="bg-red-600 text-white font-bold text-xl px-4 py-0.5 rounded shadow-sm inline-block">
                    {payment.receipt_number || payment.id || 'N/A'}
                 </div>
                 <p className="text-xs font-bold text-slate-500 mt-2">Payment Date</p>
                 <p className="text-sm font-bold text-slate-800">
                   {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A'}
                 </p>
               </div>
             </div>
          </div>
        </div>

        {/* Top Info Boxes */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-blue-100 rounded-xl bg-blue-50/50 p-4 flex items-center gap-4 relative overflow-hidden">
             <div className="w-14 h-14 bg-blue-900 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
                <UserIcon className="w-8 h-8" />
             </div>
             <div>
               <p className="text-xs text-slate-500 font-semibold mb-0.5">Received with thanks from M/S:</p>
               <h3 className="text-xl font-bold text-slate-800 uppercase">{applicant.full_name}</h3>
             </div>
          </div>
          <div className="border border-blue-100 rounded-xl bg-slate-50 p-4 flex items-center gap-4 relative overflow-hidden">
             <div className="w-14 h-14 bg-blue-900 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
               </svg>
             </div>
             <div>
               <p className="text-xs text-slate-500 font-semibold mb-0.5">Which country will you go to:</p>
               <h3 className="text-sm font-bold text-blue-900">{applicant.visa_name || 'Schengen Countries / Europe'}</h3>
             </div>
          </div>
        </div>

        {/* Middle Content Blocks */}
        <div className="grid grid-cols-12 gap-4 flex-1">
          {/* Personal Info */}
          <div className="col-span-5 border border-blue-200 rounded-xl relative pt-6 overflow-hidden">
             <div className="absolute top-0 left-0 bg-blue-900 text-white text-xs font-bold px-4 py-1.5 rounded-br-xl flex items-center gap-2 shadow-sm">
                <UserCircleIcon className="w-4 h-4" /> PERSONAL INFORMATION
             </div>
             <div className="p-5 space-y-4">
                <div className="flex items-center text-sm">
                   <div className="w-8 flex items-center justify-center text-blue-900"><GlobeAltIcon className="w-5 h-5"/></div>
                   <div className="w-28 text-slate-600 font-semibold">Nationality</div>
                   <div className="text-slate-800 font-bold">: {applicant.profile?.nationality || 'Bangladesh'}</div>
                </div>
                <div className="flex items-center text-sm">
                   <div className="w-8 flex items-center justify-center text-blue-900"><IdentificationIcon className="w-5 h-5"/></div>
                   <div className="w-28 text-slate-600 font-semibold">Passport No.</div>
                   <div className="text-slate-800 font-bold">: {applicant.passport_number || 'N/A'}</div>
                </div>
                <div className="flex items-center text-sm">
                   <div className="w-8 flex items-center justify-center text-blue-900"><PhoneIcon className="w-5 h-5"/></div>
                   <div className="w-28 text-slate-600 font-semibold">Phone Number</div>
                   <div className="text-slate-800 font-bold">: {applicant.profile?.phone || 'N/A'}</div>
                </div>
                <div className="flex items-center text-sm">
                   <div className="w-8 flex items-center justify-center text-blue-900"><EnvelopeIcon className="w-5 h-5"/></div>
                   <div className="w-28 text-slate-600 font-semibold">Email</div>
                   <div className="text-slate-800 font-bold truncate pr-2">: {applicant.profile?.email || 'N/A'}</div>
                </div>
             </div>
          </div>

          {/* Payment Details */}
          <div className="col-span-7 border border-blue-200 rounded-xl relative pt-6 overflow-hidden">
             <div className="absolute top-0 left-0 bg-blue-900 text-white text-xs font-bold px-4 py-1.5 rounded-br-xl flex items-center gap-2 shadow-sm">
                <CreditCardIcon className="w-4 h-4" /> PAYMENT DETAILS
             </div>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                <img src={companyLogo} alt="" className="w-40 h-40 grayscale" />
             </div>
             


             <div className="p-5 space-y-4 relative z-10">
                <div className="flex text-sm">
                   <div className="w-36 text-slate-600 font-semibold shrink-0">Payment Method</div>
                   <div className="text-slate-800 font-bold">: <span className="capitalize">{payment.payment_method?.replace('_', ' ') || 'Cash'}</span></div>
                </div>
                <div className="flex items-center gap-4 my-2">
                   <div className="w-36 text-slate-800 font-bold shrink-0">
                     {getOrdinal(payment.installment_type)} Installment Amount
                   </div>
                   <div className="flex-1 flex gap-2">
                      <div className="bg-blue-50 border border-blue-200 px-4 py-2 text-lg text-blue-900 shadow-sm flex items-center justify-between flex-1">
                        <span className="font-bold">BDT</span>
                        <span className="font-bold text-xl">{bdtAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="bg-green-50 border border-green-200 px-4 py-2 text-lg text-green-900 shadow-sm flex items-center justify-between w-40 shrink-0">
                        <span className="font-bold">€</span>
                        <span className="font-bold text-xl">{eurAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                   </div>
                </div>
                <div className="flex text-sm">
                   <div className="w-36 text-slate-600 font-semibold shrink-0">In Words (BDT)</div>
                   <div className="text-slate-800 font-semibold text-xs pt-0.5">: {amountInWordsBDT}</div>
                </div>
                <div className="flex text-sm">
                   <div className="w-36 text-slate-600 font-semibold shrink-0">In Words (EUR)</div>
                   <div className="text-slate-800 font-semibold text-xs pt-0.5">: {amountInWordsEUR}</div>
                </div>
                <div className="flex text-sm">
                   <div className="w-36 text-slate-600 font-semibold shrink-0">Exchange Rate (Approx.)</div>
                   <div className="text-slate-800 font-semibold text-xs pt-0.5">: BDT {exchangeRate} = 1 EUR</div>
                </div>
                <div className="flex text-sm">
                   <div className="w-36 text-slate-600 font-semibold shrink-0">Purpose of Payment</div>
                   <div className="text-slate-800 font-semibold text-xs pt-0.5">: {payment.remarks || 'Visa Processing Fee'}</div>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Signatures Area */}
        <div className="grid grid-cols-12 gap-4 mt-6">
          {/* Important Note */}
          <div className="col-span-3 border border-orange-200 bg-orange-50/50 rounded-xl p-4">
             <h4 className="flex items-center gap-2 text-xs font-bold text-orange-800 mb-2">
               <InformationCircleIcon className="w-4 h-4" /> IMPORTANT NOTE
             </h4>
             <p className="text-[9px] text-slate-600 text-justify leading-tight">
               If the Visa Application has been officially submitted but the visa is not approved, and the candidate's overseas assignment is not completed through {companyInfo?.company_name || 'Al-Raiyan Group'} within the timeframe, the company shall process refund as per the signed agreement clauses upon written request.
             </p>
          </div>

          {/* Paid By */}
          <div className="col-span-4 border border-blue-100 rounded-xl p-4">
             <h4 className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
               <UserIcon className="w-4 h-4 text-blue-600"/> PAID BY
             </h4>
             <div className="space-y-1 text-xs">
               <div className="flex"><span className="w-24 text-slate-500">Name</span><span className="font-bold">: {applicant.full_name}</span></div>
               <div className="flex"><span className="w-24 text-slate-500">Father's Name</span><span className="font-bold">: {applicant.profile?.father_name || 'N/A'}</span></div>
               <div className="flex"><span className="w-24 text-slate-500">NID No.</span><span className="font-bold">: {applicant.nid_number || 'N/A'}</span></div>
             </div>
             <p className="text-[8px] text-slate-400 mt-3 leading-tight italic">
               I have read, understood, and agree to the terms and conditions of the Agreement, including the refund policy.
             </p>
          </div>

          {/* Authorized By Seal */}
          <div className="col-span-2 border border-blue-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
             <h4 className="text-[10px] font-bold text-slate-800 mb-2 uppercase">AUTHORIZED BY</h4>
             <div className="w-16 h-16 border-2 border-dashed border-blue-400 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-blue-300 font-bold rotate-[-15deg]">Company<br/>Seal</span>
             </div>
          </div>

          {/* Signatures */}
          <div className="col-span-3 border border-blue-100 rounded-xl p-4 flex flex-col justify-end text-center text-[10px] font-semibold text-slate-600 space-y-6">
             <div className="w-full border-t border-slate-400 pt-1">
               <p>Applicant Signature</p>
             </div>
             <div className="w-full border-t border-slate-400 pt-1">
               <p>Relationship with Applicant</p>
             </div>
             <div className="w-full border-t border-slate-400 pt-1">
               <p>(Authorized Signature & Official Company Seal)</p>
             </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-blue-900 text-white py-3 px-8 text-xs font-medium flex items-center justify-between z-20">
         <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-orange-400" /> Head Office - {companyInfo?.address || 'Kingdom of Saudi Arabia (KSA)'}
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-orange-400" /> Email- {companyInfo?.email || 'alraiyangroup333@gmail.com'}
            </div>
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-orange-400" /> {companyInfo?.website || 'al-raiyangroup.com'}
            </div>
         </div>
      </div>
    </div>
    </>
  );
}

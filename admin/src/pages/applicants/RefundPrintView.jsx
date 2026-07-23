import React from 'react';
import topIllustration from '../../assets/top-illustration.png';
import companyLogo from '../../assets/logo.png';

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

export default function RefundPrintView({ applicant, refund, companyInfo, currenciesList = [] }) {
  if (!refund) return null;

  const refundMethodDisplay = refund.refund_method ? refund.refund_method.replace('_', ' ').toUpperCase() : 'BANK TRANSFER';
  const isCash = refundMethodDisplay.includes('CASH');

  const samplePayment = applicant?.payments?.[0];
  const paidCurrency = samplePayment?.currency || 'BDT';
  
  const getCurrencySymbol = (code) => {
    const curr = currenciesList.find(c => c.code === code);
    return curr?.symbol || code || '৳';
  };
  const paidCurrencySymbol = getCurrencySymbol(paidCurrency);
  
  const getCurrencyName = (code) => {
    const curr = currenciesList.find(c => c.code === code);
    return curr?.name || code;
  };
  const paidCurrencyName = getCurrencyName(paidCurrency);

  const sampleAmount = Number(samplePayment?.amount) || 0;
  const sampleEur = Number(samplePayment?.euro_amount) || 0;
  const dbExchangeRate = Number(samplePayment?.exchange_rate) || 0;

  // Ratio of 1 PaidCurrency in EUR
  const eurRatio = dbExchangeRate > 0 
    ? dbExchangeRate 
    : (sampleAmount > 0 ? sampleEur / sampleAmount : 0.00711);

  // User-friendly exchange rate (e.g., 1 EUR = 140.69 BDT)
  const exchangeRate = eurRatio > 0 ? (1 / eurRatio).toFixed(2) : '140.69';

  const paidAmount = Number(refund.refund_amount) || 0;
  const eurAmount = paidAmount * eurRatio;
  
  const amountInWordsPaid = numberToWords(Math.floor(paidAmount)) + ` ${paidCurrencyName} Only`;
  const amountInWordsEUR = numberToWords(Math.floor(eurAmount)) + ' Euros Only';

  const totalPaid = Number(refund.refundable_payment_total) || 0;
  const nonRefundable = Number(refund.non_refundable_amount) || 0;

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

  const PageContainer = ({ children }) => (
    <div className="w-full overflow-x-auto bg-slate-100 print:bg-transparent print:overflow-visible flex sm:justify-center">
      <div className="print-page w-full min-w-[8.5in] max-w-[8.5in] print:max-w-full print:min-w-full print:w-full min-h-[11in] print:min-h-[100vh] mx-auto bg-white mb-8 shadow-[0_0_15px_rgba(0,0,0,0.1)] print:shadow-none print:m-0 flex flex-col pt-8 pb-16 px-8 box-border relative shrink-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0">
           <h1 className="text-[100px] font-serif font-black uppercase tracking-[1rem] rotate-[-45deg] whitespace-nowrap text-center leading-tight">{companyInfo?.company_name || 'Al Raiyan Group'}</h1>
        </div>
        <img
          src={topIllustration}
          alt=""
          className="absolute top-0 right-0 w-52 opacity-90 pointer-events-none z-10"
        />
        <div className="page-inner relative z-10 flex-1 flex flex-col justify-between h-full w-full">
          {children}
        </div>
        <DocumentFooter />
      </div>
    </div>
  );

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

  return (
    <>
      <style>{`
        @media print {
          @page { size: letter portrait; margin: 0 !important; }
          html { font-size: 13.6px !important; }
          html, body { width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          body > *:not(.print-portal) { display: none !important; }
          .print-portal { display: block !important; position: static !important; width: 100%; height: auto !important; overflow: visible !important; }
        }
      `}</style>
      <div className="w-full bg-slate-100 py-8 print:py-0 print:bg-white text-slate-900 font-sans">
        <PageContainer>
          <div className="flex-1 w-full relative z-20 flex flex-col">
            {/* Custom Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4 w-1/3">
                <img src={companyInfo?.company_logo || companyLogo} alt="Logo" className="w-20 h-20 object-contain drop-shadow-md" />
                <div>
                  <h1 className="text-xl font-black tracking-wider text-blue-900 font-serif uppercase leading-tight">
                    {companyInfo?.company_name || 'Al Raiyan Group'}
                  </h1>
                  <p className="text-[10px] text-blue-900 font-bold tracking-widest mt-1">Global Visa Services</p>
                  <p className="text-[9px] text-orange-600 font-bold tracking-widest mt-0.5">Trust • Process • Success</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-1/3 pt-2 text-center relative z-20">
                 <h2 className="text-xl font-bold font-serif text-slate-800" dir="rtl">مجموعة الريان</h2>
                 <p className="text-sm font-serif italic text-slate-700 mt-1" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
              </div>
              <div className="w-1/3"></div>
            </div>

            {/* ACKNOWLEDGEMENT TITLE */}
            <div className="text-center mt-2 mb-5">
              <h2 className="text-2xl sm:text-[28px] font-black uppercase tracking-tight">
                <span className="text-blue-900">ACKNOWLEDGEMENT OF </span>
                <span className={isCash ? 'text-green-600' : 'text-red-600'}>
                  {isCash ? 'CASH ' : 'BANK '}REFUND RECEIPT
                </span>
              </h2>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="h-px bg-slate-300 flex-1 max-w-[120px]"></div>
                <p className="text-xs sm:text-sm font-bold italic text-slate-800">(Refund Receipt)</p>
                <div className="h-px bg-slate-300 flex-1 max-w-[120px]"></div>
              </div>
              <div className="text-yellow-500 text-lg tracking-widest mt-1">★ ★ ★</div>
              <p className="text-xs text-slate-800 font-medium mt-2">
                This is to acknowledge that I have received the refund amount as per the terms and conditions of the agreement.
              </p>
            </div>

            {/* Data Columns */}
            <div className="flex flex-row gap-6 mb-5">
              {/* Left Column */}
              <div className="flex-1 space-y-3.5 text-xs font-semibold text-slate-800 pt-2">
                <div className="flex"><span className="w-6 text-blue-900">👤</span><span className="w-[120px] text-slate-600 font-bold">Name</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5 font-bold text-slate-900">{applicant?.full_name}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">👤</span><span className="w-[120px] text-slate-600 font-bold">Father's Name</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5">{applicant?.profile?.father_name || '—'}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">🌐</span><span className="w-[120px] text-slate-600 font-bold">Nationality</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5">{applicant?.country?.nationality || 'Bangladeshi'}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">🛂</span><span className="w-[120px] text-slate-600 font-bold">Passport Number</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5 font-mono font-bold">{applicant?.passport_number}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">📄</span><span className="w-[120px] text-slate-600 font-bold">Application No.</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5 font-mono">{applicant?.application_number || `APP-${applicant?.id?.slice(0,8)}`}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">✈️</span><span className="w-[120px] text-slate-600 font-bold">Receipt No.</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5 font-mono">{refund.receipt_number || `REF-${refund.id}`}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">🗓️</span><span className="w-[120px] text-slate-600 font-bold">Refund Issue Date</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5">{new Date(refund.created_at).toLocaleDateString('en-GB')}</span></div>
              </div>

              <div className="w-px bg-slate-300"></div>

              {/* Right Column */}
              <div className="w-[300px] flex flex-col gap-4">
                <div className={`border-2 rounded-xl p-4 flex items-center gap-4 ${isCash ? 'border-green-600' : 'border-blue-700'}`}>
                   <div className={`text-4xl ${isCash ? 'text-green-700' : 'text-blue-800'}`}>
                     {isCash ? '💵' : '🏦'}
                   </div>
                   <div className="text-xs font-semibold text-slate-700">
                     You have selected <br/>
                     <span className={`text-base font-black tracking-wider uppercase ${isCash ? 'text-green-600' : 'text-blue-700'}`}>
                       {refundMethodDisplay}
                     </span><br/>
                     as your refund method.
                   </div>
                </div>

                <div className="border border-slate-300 rounded-xl flex flex-col text-center shadow-2xs">
                  <div className="p-2 bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-b border-slate-300 tracking-wider">
                    Net Refund Amount Received
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center items-center bg-white">
                    <span className="font-black text-blue-900 text-xl tracking-wider">{paidCurrency} {paidAmount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-600 mt-1 italic font-serif leading-tight">({amountInWordsPaid})</span>
                  </div>
                  <div className="p-2 bg-orange-50 border-t border-orange-200">
                     <span className="text-[11px] font-bold text-orange-800">EUR Equivalent: €{eurAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acknowledgment Text */}
            <p className="text-xs text-slate-800 font-medium leading-relaxed text-justify mb-4">
              I hereby confirm that I have received the refund amount of 
              <span className="font-bold text-slate-900"> {paidCurrency} {paidAmount.toLocaleString()} </span> 
              ({amountInWordsPaid}) in <span className={`font-bold ${isCash ? 'text-green-600' : 'text-blue-700'}`}>{isCash ? 'CASH' : 'BANK TRANSFER'}</span> on __________________________. This amount is calculated based on my total refundable payments.
            </p>

            {/* PAYMENT DETAILS TABLE */}
            <div className="border border-blue-900 rounded-xl mb-4 shadow-2xs">
               <div className="bg-blue-900 text-white font-bold text-xs uppercase px-4 py-2.5 tracking-wider flex justify-between">
                 <span>REFUND BREAKDOWN & DETAILS</span>
                 <span>Rate: 1 EUR = {paidCurrency} {exchangeRate}</span>
               </div>
               <div className="p-5 bg-white space-y-4 text-xs font-semibold text-slate-800">
                 <div className="flex"><span className="w-8 text-blue-900">💵</span><span className="w-44">Total Amount Paid</span><span className="mx-2">:</span><span className="font-bold text-slate-900">{paidCurrency} {totalPaid.toLocaleString()}</span></div>
                 <div className="flex"><span className="w-8 text-red-600">📉</span><span className="w-44 text-red-600">Non-Refundable Deductions</span><span className="mx-2">:</span><span className="font-bold text-red-600">- {paidCurrency} {nonRefundable.toLocaleString()}</span></div>
                 <div className="flex border-t border-slate-200 pt-3"><span className="w-8 text-green-600">💰</span><span className="w-44 text-green-700">Net Refund Amount</span><span className="mx-2">:</span><span className="font-bold text-green-700">{paidCurrency} {paidAmount.toLocaleString()}</span></div>
                 <div className="flex mt-2"><span className="w-8 text-blue-900">🏦</span><span className="w-44">Refund Method</span><span className="mx-2">:</span><span className="uppercase">{refundMethodDisplay}</span></div>
                 {refund.bank_detail_snapshot && refund.bank_detail_snapshot.account_number_or_iban && (
                   <div className="flex"><span className="w-8 text-blue-900">🔢</span><span className="w-44">Account No.</span><span className="mx-2">:</span><span className="font-mono">{refund.bank_detail_snapshot.account_number_or_iban}</span></div>
                 )}
               </div>
            </div>

            <p className="text-xs text-slate-800 font-medium leading-relaxed text-justify mb-3">
              I hereby acknowledge that I have received the {isCash ? 'cash' : 'transfer'} amount of <span className="font-bold">{paidCurrency} {paidAmount.toLocaleString()}</span> ({amountInWordsPaid}) which represents <span className="font-bold">€{eurAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Euros</span> equivalent as a refund of my payment. I confirm that I have accepted this amount in full satisfaction of the refundable amount.
            </p>

            <div className="flex items-center justify-center mb-3 text-slate-400">
              <span className="flex-1 h-px bg-slate-200"></span>
              <span className="mx-4 text-lg">❦</span>
              <span className="flex-1 h-px bg-slate-200"></span>
            </div>

            {/* Bullet Points */}
            <ul className="list-disc pl-5 space-y-2 text-[11px] text-slate-800 font-medium leading-relaxed text-justify mb-3">
              <li>I further acknowledge and confirm that the non-refundable amount of <span className="text-red-600 font-bold">{paidCurrency} {nonRefundable.toLocaleString()}</span> is strictly <span className="text-red-600 font-bold">NON-REFUNDABLE</span>, as it has already been utilized for visa processing charges, government fees, administrative expenses, documentation, embassy-related costs, and other applicable service charges.</li>
            </ul>

            <div className="flex items-start gap-3 mt-1">
              <div className="w-4 h-4 border border-slate-400 rounded-sm mt-0.5 shrink-0"></div>
              <p className="text-[10px] text-slate-800 font-medium leading-relaxed text-justify">
                I declare that I have read, fully understood, and voluntarily accepted these terms and conditions without any force, pressure, or objection, and I shall have no further claim or demand regarding the above-mentioned non-refundable amounts.
              </p>
            </div>
            
            <div className="mt-auto pb-4">
              <SignatureBlock showThumb={true} showSeal={true} />
            </div>
          </div>
        </PageContainer>
      </div>
    </>
  );
}

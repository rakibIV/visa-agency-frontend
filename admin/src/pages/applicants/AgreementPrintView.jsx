import React from 'react';
import topIllustration from '../../assets/top-illustration.png';

export default function AgreementPrintView({ applicant, templates = [], type, companyInfo, showBengali = false }) {
  // Page visibility toggles
  const showCover = type === 'all' || type === 'form';
  const showTemplate1Part1 = type === 'all' || type === 'tc';
  const showTemplate1Part2 = type === 'all' || type === 'clauses';
  const showTemplate2 = type === 'all' || type === 'tc2';
  const showRefund = type === 'all' || type === 'refund';

  const refundMethodDisplay = applicant?.profile?.preferred_refund_method 
    ? applicant.profile.preferred_refund_method.replace('_', ' ').toUpperCase()
    : 'BANK TRANSFER';
    
  const isCash = refundMethodDisplay.includes('CASH');

  const template1 = templates?.find(t => t.agreement_type === 'MAIN');
  const template2 = templates?.find(t => t.agreement_type === 'SECOND');

  // Filter clauses based on country condition
  const getVisibleClauses = (template) => {
    if (!template || !template.clauses) return [];
    let clauses = [...template.clauses].sort((a, b) => a.clause_number - b.clause_number);
    return clauses.filter(c => {
      if (c.visibility_mode === 'INCLUDE') {
        return c.countries?.includes(applicant?.country?.id);
      }
      if (c.visibility_mode === 'EXCLUDE') {
        return !c.countries?.includes(applicant?.country?.id);
      }
      return true;
    });
  };

  const template1Clauses = getVisibleClauses(template1);
  // Without Bengali: 2 pages for Template 1 (clauses 1-6 / 7+)
  // With Bengali: 3 pages for Template 1 (clauses 1-3 / 4-8 / 9+)
  const template1Part1 = template1Clauses.filter(c => showBengali ? c.clause_number <= 3 : c.clause_number <= 6);
  const template1Part2 = template1Clauses.filter(c => showBengali ? (c.clause_number > 3 && c.clause_number <= 8) : c.clause_number > 6);
  const template1Part3 = showBengali ? template1Clauses.filter(c => c.clause_number > 8) : [];
  
  const template2Clauses = getVisibleClauses(template2);

  // Common Header for Legal Documents
  const DocumentHeader = ({ title, subtitle, showReceiptDetails = false }) => (
    <div className="flex flex-col border-b-2 border-slate-800 pb-4 mb-6 relative">
      {/* Illustration removed here — now rendered at page level in PageContainer */}
      
      <div className="flex items-center gap-4 relative z-20">
        {companyInfo?.company_logo ? (
          <img src={companyInfo.company_logo} alt="Logo" className="w-16 h-16 object-contain" />
        ) : (
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs text-center">AL-RAYYAN</span>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest text-slate-900 uppercase font-serif">
            {companyInfo?.company_name || 'Al-Rayyan Group'}
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
          {subtitle && <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">{subtitle}</p>}
        </div>
        <div className="text-right text-[10px] font-mono text-slate-600 space-y-0.5 relative z-20">
          {showReceiptDetails && (
            <p>Receipt No: <span className="font-bold text-slate-900">RCPT-{applicant?.id?.slice(0,8)}</span></p>
          )}
          <p>Application No: <span className="font-bold text-slate-900">{applicant?.application_number || `APP-${applicant?.id?.slice(0,8)}`}</span></p>
          <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>
    </div>
  );

  const ClauseBlock = ({ clause, isTerms = false }) => (
    <div className="mb-4 flex gap-4 break-inside-avoid">
      <div className="w-8 shrink-0 flex justify-center">
        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-300">
          {clause.clause_number}
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {clause.title_en && (
          <div className="flex justify-between items-end border-b border-slate-100 pb-1 mb-1">
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide font-serif">{clause.title_en}</h4>
            <h4 className="font-bold text-slate-700 text-[11px]">
              {clause.title_ar}{showBengali ? ` | ${clause.title_bn}` : ''}
            </h4>
          </div>
        )}
        <div className="grid grid-cols-1 gap-2">
          {clause.body_en && (
            <p className="text-slate-700 text-xs leading-relaxed font-serif text-justify">
              {clause.body_en.replace(/\{staff_name\}/g, applicant?.assigned_staff_name || 'Authorized Representative')}
            </p>
          )}
          <div className={showBengali ? 'grid grid-cols-2 gap-6 pt-1' : 'pt-1'}>
            {showBengali && clause.body_bn && (
              <p className="text-slate-600 text-[11px] leading-relaxed font-sans text-justify">
                {clause.body_bn.replace(/\{staff_name\}/g, applicant?.assigned_staff_name || 'Authorized Representative')}
              </p>
            )}
            {clause.body_ar && (
              <p className={`text-slate-800 text-[11px] leading-relaxed font-sans text-justify ${showBengali ? '' : 'w-full'}`} dir="rtl">
                {clause.body_ar.replace(/\{staff_name\}/g, applicant?.assigned_staff_name || 'Authorized Representative')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const SignatureBlock = ({ showThumb = false, showSeal = false }) => (
    <div className={`grid ${showThumb || showSeal ? 'grid-cols-4' : 'grid-cols-3'} gap-6 pt-8 text-center text-[10px] font-semibold text-slate-600 break-inside-avoid relative z-20`}>
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
        <span>📍</span> Head Office - {companyInfo?.company_address || 'Kingdom of Saudi Arabia (KSA)'}
      </div>
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">📧 Email- {companyInfo?.email_address || 'alraiyangroup333@gmail.com'}</span>
        <span className="flex items-center gap-2">🌐 {companyInfo?.website_url || 'al-raiyangroup.com'}</span>
      </div>
    </div>
  );

  // A4 Page Container styling wrapper
  const PageContainer = ({ children }) => (
    <div className="print-page w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white mb-8 shadow-[0_0_15px_rgba(0,0,0,0.1)] print:shadow-none print:mb-0 flex flex-col pt-12 pb-20 px-12 box-border relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0">
         <h1 className="text-[120px] font-serif font-black uppercase tracking-[1.5rem] rotate-[-45deg] whitespace-nowrap">AL-RAYYAN</h1>
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
  );


  // Compute Second Payment refund value (80%)
  const secondPayment = applicant?.payments?.[1]?.amount ? Number(applicant.payments[1].amount) : 0;
  const refundAmount = secondPayment * 0.8;

  return (
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
                    <span className="font-bold text-slate-900 text-xs">{applicant?.profile?.phone_number || '—'}</span>
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
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">1st Installment (Receipt 1)</span>
                      <span className="font-bold text-slate-900 text-xs">৳{applicant?.payments?.[0] ? Number(applicant.payments[0].amount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">2nd Installment (Receipt 2)</span>
                      <span className="font-bold text-slate-900 text-xs">৳{applicant?.payments?.[1] ? Number(applicant.payments[1].amount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Payment Date</span>
                      <span className="font-bold text-slate-900 text-xs">{applicant?.payments?.[0] ? new Date(applicant.payments[0].payment_date).toLocaleDateString('en-GB') : '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Total Amount Paid</span>
                      <span className="font-extrabold text-blue-800 text-xs">৳{Number(applicant?.total_paid || 0).toLocaleString()}</span>
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
               <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">Total Amount Received</div>
               <div className="text-xl font-black text-slate-900">৳{Number(applicant?.total_paid || 0).toLocaleString()}</div>
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
      {/* PAGE 3b: TEMPLATE 1 Part 3 — only shown when Bengali is ON (clauses 9-15) */}
      {/* ========================================================== */}
      {showBengali && showTemplate1Part2 && template1Part3.length > 0 && (
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
      {/* PAGE 4: TEMPLATE 2 (Terms & Conditions) */}
      {/* ========================================================== */}
      {showTemplate2 && (
        <PageContainer>
          <div className="flex-1 w-full relative z-20">
            <DocumentHeader 
              title="General Terms & Conditions" 
              subtitle="الشروط والأحكام العامة | সাধারণ শর্তাবলী" 
            />
            <div className="space-y-1 mt-6">
              {template2Clauses.map(clause => (
                <ClauseBlock key={clause.id} clause={clause} isTerms={true} />
              ))}
            </div>
          </div>
          <SignatureBlock showThumb={true} />
        </PageContainer>
      )}

      {/* ========================================================== */}
      {/* PAGE 5: REFUND RECEIPT (EXACT MATCH) */}
      {/* ========================================================== */}
      {showRefund && (
        <PageContainer>
          <div className="flex-1 w-full relative z-20 flex flex-col">
            {/* Custom Header for Page 5 (Matches the image) */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                {companyInfo?.company_logo ? (
                  <img src={companyInfo.company_logo} alt="Logo" className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-[10px] text-center">AL-RAYYAN</span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-black tracking-wider text-blue-900 font-serif">
                    {companyInfo?.company_name || 'AL-RAIYAN GROUP'}
                  </h1>
                  <p className="text-[10px] text-blue-900 font-bold tracking-widest mt-0.5">Global Visa Services</p>
                  <p className="text-[9px] text-orange-600 font-bold tracking-widest mt-0.5">Trust • Process • Success</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end pt-2">
                 <h2 className="text-xl font-bold font-serif text-slate-800" dir="rtl">مجموعة الريان</h2>
                 <p className="text-sm font-serif italic text-slate-700 mt-1" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
              </div>
              {/* Illustration is now handled by PageContainer at the page level */}
            </div>

            {/* ACKNOWLEDGEMENT TITLE */}
            <div className="text-center mt-4 mb-6">
              <h2 className="text-[26px] font-black uppercase tracking-tighter">
                <span className="text-blue-900">ACKNOWLEDGEMENT OF </span>
                <span className={isCash ? 'text-green-600' : 'text-red-600'}>
                  {isCash ? 'CASH ' : 'BANK '}REFUND RECEIPT
                </span>
              </h2>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="h-px bg-slate-400 flex-1 max-w-[100px]"></div>
                <p className="text-xs font-semibold italic text-slate-800">(80% Refundable – Second Payment)</p>
                <div className="h-px bg-slate-400 flex-1 max-w-[100px]"></div>
              </div>
              <div className="text-yellow-500 text-lg tracking-widest mt-1">★ ★ ★</div>
              <p className="text-[11px] text-slate-800 font-medium mt-2">
                This is to acknowledge that I have received the refund amount as per the terms and conditions of the agreement.
              </p>
            </div>

            {/* Data Columns */}
            <div className="flex flex-row gap-6 mb-8">
              {/* Left Column */}
              <div className="flex-1 space-y-3 text-[11px] font-semibold text-slate-800 pt-2">
                <div className="flex"><span className="w-6 text-blue-900">👤</span><span className="w-28 text-slate-600">Name</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5">{applicant?.full_name}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">👤</span><span className="w-28 text-slate-600">Father's Name</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5">{applicant?.profile?.father_name || '—'}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">🌐</span><span className="w-28 text-slate-600">Nationality</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5">{applicant?.country?.nationality || 'Bangladeshi'}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">🛂</span><span className="w-28 text-slate-600">Passport Number</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5 font-mono">{applicant?.passport_number}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">📄</span><span className="w-28 text-slate-600">Application No.</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5 font-mono">{applicant?.application_number || `APP-${applicant?.id?.slice(0,8)}`}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">✈️</span><span className="w-28 text-slate-600">Receipt No.</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5 font-mono">RCPT-{applicant?.id?.slice(0,8)}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">📝</span><span className="w-28 text-slate-600">Payment Date</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5">{applicant?.payments?.[1] ? new Date(applicant.payments[1].payment_date).toLocaleDateString('en-GB') : '—'}</span></div>
                <div className="flex"><span className="w-6 text-blue-900">🗓️</span><span className="w-28 text-slate-600">Refund Received Date</span><span className="mx-2">:</span><span className="uppercase flex-1 border-b border-slate-300 pb-0.5">_________________</span></div>
              </div>

              <div className="w-px bg-slate-300"></div>

              {/* Right Column */}
              <div className="w-[280px] flex flex-col gap-4">
                <div className={`border-2 rounded-xl p-4 flex items-center gap-4 ${isCash ? 'border-green-600' : 'border-blue-700'}`}>
                   <div className={`text-4xl ${isCash ? 'text-green-700' : 'text-blue-800'}`}>
                     {isCash ? '💵' : '🏦'}
                   </div>
                   <div className="text-[11px] font-semibold text-slate-700">
                     You have selected <br/>
                     <span className={`text-sm font-black tracking-wider uppercase ${isCash ? 'text-green-600' : 'text-blue-700'}`}>
                       {refundMethodDisplay}
                     </span><br/>
                     as your refund method.
                   </div>
                </div>

                <div className="border border-slate-300 rounded-xl flex items-center justify-between text-center overflow-hidden">
                  <div className="p-3 bg-slate-50 text-[10px] font-bold text-slate-600 uppercase flex-1 h-full flex items-center justify-center border-r border-slate-300">
                    80% Refund Amount Received
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-center items-center">
                    <span className="font-bold text-blue-900 text-sm">BDT {refundAmount.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-600 mt-1 italic font-serif leading-tight">({refundAmount} Taka only)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acknowledgment Text */}
            <p className="text-[11px] text-slate-800 font-medium leading-relaxed text-justify mb-6">
              I hereby confirm that I have received the refund amount of 80% (Eighty Percent) of the Second Payment, which is 
              <span className="font-bold text-slate-900"> BDT {refundAmount.toLocaleString()} </span> 
              ({refundAmount} Taka only) in <span className={`font-bold ${isCash ? 'text-green-600' : 'text-blue-700'}`}>{isCash ? 'CASH' : 'BANK TRANSFER'}</span> on __________________________.
            </p>

            {/* PAYMENT DETAILS TABLE */}
            <div className="border border-blue-900 rounded-xl overflow-hidden mb-6">
               <div className="bg-blue-900 text-white font-bold text-xs uppercase px-4 py-2 tracking-wider">
                 {isCash ? 'CASH' : 'BANK'} PAYMENT DETAILS
               </div>
               <div className="p-5 bg-white space-y-4 text-[11px] font-semibold text-slate-800">
                 <div className="flex"><span className="w-8 text-blue-900">💵</span><span className="w-32">Payment Method</span><span className="mx-2">:</span><span>{isCash ? 'Cash (In Hand)' : 'Bank Transfer'}</span></div>
                 <div className="flex"><span className="w-8 text-blue-900">💰</span><span className="w-32">Refund Amount</span><span className="mx-2">:</span><span className="font-bold">BDT {refundAmount.toLocaleString()} <span className="font-normal italic">({refundAmount} Taka only)</span></span></div>
                 <div className="flex"><span className="w-8 text-blue-900">👤</span><span className="w-32">Received By</span><span className="mx-2">:</span><span className="uppercase">{applicant?.full_name}</span></div>
                 <div className="flex"><span className="w-8 text-blue-900">📅</span><span className="w-32">Refund Received Date</span><span className="mx-2">:</span><span className="flex-1 border-b border-slate-300 pb-0.5 max-w-[200px]"></span></div>
                 <div className="flex"><span className="w-8 text-blue-900">📝</span><span className="w-32">Notes</span><span className="mx-2">:</span><span>Full refund amount received in {isCash ? 'cash' : 'bank'}.</span></div>
               </div>
            </div>

            <p className="text-[11px] text-slate-800 font-medium leading-relaxed text-justify mb-4">
              I hereby acknowledge that I have received the {isCash ? 'cash' : 'transfer'} amount of <span className="font-bold">BDT {refundAmount.toLocaleString()}</span> ({refundAmount} Taka only) as an 80% refundable amount of my second payment. I confirm that I have accepted this amount in full satisfaction of the refundable amount.
            </p>

            <div className="flex items-center justify-center mb-4 text-slate-400">
              <span className="flex-1 h-px bg-slate-200"></span>
              <span className="mx-4 text-lg">❦</span>
              <span className="flex-1 h-px bg-slate-200"></span>
            </div>

            {/* Bullet Points */}
            <ul className="list-disc pl-5 space-y-2 text-[10px] text-slate-800 font-medium leading-relaxed text-justify mb-4">
              <li>I further acknowledge and confirm that the First Installment is fully paid and is strictly <span className="text-red-600 font-bold">NON-REFUNDABLE</span> under the terms and conditions of the agreement.</li>
              <li>I further acknowledge and confirm that the remaining twenty percent (20%) of the Second Installment is also <span className="text-red-600 font-bold">NON-REFUNDABLE</span>, as it has already been utilized for visa processing charges, government fees, administrative expenses, documentation, embassy-related costs, and other applicable service charges.</li>
            </ul>

            <div className="flex items-start gap-3 mt-2">
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
      )}

    </div>
  );
}

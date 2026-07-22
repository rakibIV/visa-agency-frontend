import React from 'react';
import topIllustration from '../../assets/top-illustration.png';
import companyLogo from '../../assets/logo.png';

export default function AgreementPrintView({ applicant, templates = [], type, companyInfo, showBengali = false }) {
  // Page visibility toggles
  const showCover = type === 'all' || type === 'form';
  const showTemplate1Part1 = type === 'all' || type === 'tc';
  const showTemplate1Part2 = type === 'all' || type === 'clauses';
  const showTemplate2 = type === 'all' || type === 'tc2';

  const sortedTemplates = [...(templates || [])].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  const template1 = sortedTemplates.length > 0 ? sortedTemplates[0] : null;
  const template2 = sortedTemplates.length > 1 ? sortedTemplates[1] : null;

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
        <img src={companyInfo?.company_logo || companyLogo} alt="Logo" className="w-20 h-20 object-contain drop-shadow-md" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest text-slate-900 uppercase font-serif leading-none">
            {companyInfo?.company_name || 'Al Raiyan Group'}
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

  const parseClauseText = (text) => {
    if (!text) return '';
    return text
      .replace(/\{staff_name\}/g, applicant?.assigned_staff_name || 'Authorized Representative')
      .replace(/\{staff\}/g, applicant?.assigned_staff_name || 'Authorized Representative')
      .replace(/\{application_id\}/g, applicant?.application_id || '—')
      .replace(/\{full_name\}/g, applicant?.full_name || '—')
      .replace(/\{passport_number\}/g, applicant?.passport_number || '—')
      .replace(/\{visa\}/g, applicant?.visa?.name || '—')
      .replace(/\{job\}/g, applicant?.job?.title || '—')
      .replace(/\{country\}/g, applicant?.country?.name || '—')
      .replace(/\{payment\}/g, applicant?.agreed_amount || '—');
  };

  const ClauseBlock = ({ clause, isTerms = false }) => (
    <div className="mb-3 flex gap-4 break-inside-avoid">
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
              {parseClauseText(clause.body_en)}
            </p>
          )}
          <div className={showBengali ? 'grid grid-cols-2 gap-6 pt-1' : 'pt-1'}>
            {showBengali && clause.body_bn && (
              <p className="text-slate-600 text-[11px] leading-relaxed font-sans text-justify">
                {parseClauseText(clause.body_bn)}
              </p>
            )}
            {clause.body_ar && (
              <p className={`text-slate-800 text-[11px] leading-relaxed font-sans text-justify ${showBengali ? '' : 'w-full'}`} dir="rtl">
                {parseClauseText(clause.body_ar)}
              </p>
            )}
          </div>
        </div>
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

  // Letter Page Container styling wrapper
  const PageContainer = ({ children }) => (
    <div className="w-full overflow-x-auto bg-slate-100 print:bg-transparent print:overflow-visible flex sm:justify-center">
      <div className="print-page w-full min-w-[8.5in] max-w-[8.5in] print:max-w-full print:min-w-full print:w-full min-h-[11in] print:min-h-[100vh] mx-auto bg-white mb-8 shadow-[0_0_15px_rgba(0,0,0,0.1)] print:shadow-none print:m-0 flex flex-col pt-8 pb-16 px-8 box-border relative overflow-hidden shrink-0">
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0">
           <h1 className="text-[100px] font-serif font-black uppercase tracking-[1rem] rotate-[-45deg] whitespace-nowrap text-center leading-none">{companyInfo?.company_name || 'Al Raiyan Group'}</h1>
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
    </div>
  );


  // Remove old secondPayment logic

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
                    {applicant?.payments?.map((payment, index) => (
                      <React.Fragment key={payment.id || index}>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                          <span className="text-slate-500 font-medium text-[11px] uppercase">Installment {index + 1} (Receipt {payment.receipt_number || (index + 1)})</span>
                          <span className="font-bold text-slate-900 text-xs">৳{Number(payment.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                          <span className="text-slate-500 font-medium text-[11px] uppercase">Payment Date</span>
                          <span className="font-bold text-slate-900 text-xs">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : '—'}</span>
                        </div>
                      </React.Fragment>
                    ))}
                    {(!applicant?.payments || applicant.payments.length === 0) && (
                      <div className="col-span-2 text-center text-slate-400 text-xs py-2 italic">
                        No payments recorded yet.
                      </div>
                    )}
                    <div className="flex justify-between border-b border-slate-200 pb-1 col-span-2 mt-2">
                      <span className="text-slate-500 font-medium text-[11px] uppercase">Total Amount Paid</span>
                      <span className="font-extrabold text-blue-800 text-xs">৳{Number(applicant?.payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0).toLocaleString()}</span>
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
               <div className="text-xl font-black text-slate-900">৳{Number(applicant?.payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0).toLocaleString()}</div>
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



    </div>
    </>
  );
}

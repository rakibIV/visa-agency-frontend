import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { parseApiError } from '../../utils/errorParser';

export default function ApplicantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // ── Step 1: Basic Info ──
  const [applicationId, setApplicationId] = useState('');
  const [fullName, setFullName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportIssueDate, setPassportIssueDate] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // ── Step 2: Profile & Contact ──
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [currentCountry, setCurrentCountry] = useState('');
  const [gender, setGender] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [occupation, setOccupation] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  // ── Step 3: Visa & Processing ──
  const [selectedVisaId, setSelectedVisaId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedSecondaryJobId, setSelectedSecondaryJobId] = useState('');
  const [paymentPlan, setPaymentPlan] = useState(2);
  const [remarks, setRemarks] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedLawyerId, setSelectedLawyerId] = useState('');
  const [defaultStatusId, setDefaultStatusId] = useState('');
  const [selectedStatusId, setSelectedStatusId] = useState('');

  const [error, setError] = useState('');

  // ────────────────────────────────────────
  // Data fetching
  // ────────────────────────────────────────
  const { data: applicant } = useQuery({
    queryKey: ['applicant', id],
    queryFn: () => api.get(`/applicants/${id}/`).then(r => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (applicant && isEdit) {
      setApplicationId(applicant.application_id || '');
      setFullName(applicant.full_name || '');
      setPassportNumber(applicant.passport_number || '');
      setPassportIssueDate(applicant.passport_issue_date || '');
      setPassportExpiryDate(applicant.passport_expiry_date || '');
      setNidNumber(applicant.nid_number || '');
      setDateOfBirth(applicant.date_of_birth || '');

      setPlaceOfBirth(applicant.place_of_birth || '');
      setCurrentCountry(applicant.current_country || '');
      
      if (applicant.profile) {
        const p = applicant.profile;
        setGender(p.gender || '');
        setFatherName(p.father_name || '');
        setMotherName(p.mother_name || '');
        setPhone(p.phone || '');
        setEmail(p.email || '');
        setNationality(p.nationality || '');
        setMaritalStatus(p.marital_status || '');
        setOccupation(p.occupation || '');
        setEmergencyContactName(p.emergency_contact_name || '');
        setEmergencyContactPhone(p.emergency_contact_phone || '');
        setEmergencyContactRelation(p.emergency_contact_relation || '');
      }

      if (applicant.visa) setSelectedVisaId(applicant.visa?.id || applicant.visa);
      if (applicant.job) setSelectedJobId(applicant.job?.id || applicant.job);
      if (applicant.secondary_job) setSelectedSecondaryJobId(applicant.secondary_job?.id || applicant.secondary_job);
      setPaymentPlan(applicant.payment_plan_installments || 2);
      
      const staffId = applicant.slot?.staff?.id || applicant.slot?.staff || applicant.assigned_staff?.id || applicant.assigned_staff;
      if (staffId) setSelectedStaffId(staffId);
      if (applicant.slot) setSelectedSlotId(applicant.slot?.id || applicant.slot);
      
      if (applicant.status) {
        setDefaultStatusId(applicant.status?.id || applicant.status);
        setSelectedStatusId(applicant.status?.id || applicant.status);
      }
      if (applicant.lawyer) setSelectedLawyerId(applicant.lawyer?.id || applicant.lawyer);
      

    }
  }, [applicant, isEdit]);

  const { data: statuses } = useQuery({
    queryKey: ['application-statuses', 'v2'],
    queryFn: () => api.get('/application-statuses/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (statuses?.length && !defaultStatusId) {
      const def = statuses.find(s => s.is_default);
      if (def) setDefaultStatusId(def.id);
      else setDefaultStatusId(statuses[0].id);
    }
  }, [statuses, defaultStatusId]);

  const { data: visas } = useQuery({
    queryKey: ['form-visas'],
    queryFn: () => api.get('/visas/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: jobs } = useQuery({
    queryKey: ['form-jobs', selectedVisaId],
    queryFn: () => api.get(`/visas/${selectedVisaId}/jobs/`).then(r => r.data.results ?? r.data),
    enabled: !!selectedVisaId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isEdit) {
      setSelectedJobId('');
      setSelectedSecondaryJobId('');
    } else {
      const origVisaId = applicant?.visa?.id || applicant?.visa;
      if (origVisaId && selectedVisaId && String(selectedVisaId) !== String(origVisaId)) {
        setSelectedJobId('');
        setSelectedSecondaryJobId('');
      }
    }
  }, [selectedVisaId, isEdit, applicant]);

  const { data: staffs } = useQuery({
    queryKey: ['form-staffs'],
    queryFn: () => api.get('/staffs/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: slots } = useQuery({
    queryKey: ['form-slots', selectedStaffId],
    queryFn: () => api.get(`/staffs/${selectedStaffId}/monthly-slots/`).then(r => r.data.results ?? r.data),
    enabled: !!selectedStaffId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isEdit) {
      setSelectedSlotId('');
    } else {
      const origStaffId = applicant?.slot?.staff?.id || applicant?.slot?.staff || applicant?.assigned_staff?.id || applicant?.assigned_staff;
      if (origStaffId && selectedStaffId && String(selectedStaffId) !== String(origStaffId)) {
        setSelectedSlotId('');
      }
    }
  }, [selectedStaffId, isEdit, applicant]);

  const { data: lawyers } = useQuery({
    queryKey: ['form-lawyers'],
    queryFn: () => api.get('/lawyers/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  // ────────────────────────────────────────
  // Navigation & Submission
  // ────────────────────────────────────────

  const existingPayments = applicant?.payments || [];
  const hasInitial = existingPayments.some(p => p.installment_type === 'INITIAL');
  const hasSecond = existingPayments.some(p => p.installment_type === 'SECOND');
  const hasThird = existingPayments.some(p => p.installment_type === 'THIRD');
  const isPaymentComplete = hasInitial && hasSecond && (applicant?.payment_plan_installments === 2 || hasThird);

  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!fullName || !passportNumber || !dateOfBirth || !nidNumber) {
        return 'Please fill in all required fields (Full Name, Passport Number, NID, Date of Birth).';
      }
    } else if (step === 2) {
      if (!placeOfBirth || !currentCountry || !gender || !nationality || !email || !fatherName || !motherName || !emergencyContactName || !emergencyContactPhone || (!isEdit && !photoFile)) {
        return 'Please fill in all required Profile fields (including Email) and upload a photo.';
      }
    } else if (step === 3) {
      if (!selectedVisaId || !selectedJobId || !paymentPlan || !selectedStaffId || !selectedSlotId) {
        return 'Please select a Target Visa, Target Job, Installment Plan, Staff, and Staff Slot.';
      }
    }
    return null;
  };

  const nextStep = () => {
    const errorMsg = validateStep(currentStep);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const saveMutation = useMutation({
    mutationFn: (formData) => {
      const headers = { 'Content-Type': 'multipart/form-data' };
      return isEdit 
        ? api.patch(`/applicants/${id}/`, formData, { headers }) 
        : api.post('/applicants/', formData, { headers });
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Applicant updated successfully!' : 'Applicant created successfully!');
      queryClient.invalidateQueries(['applicants']);
      navigate('/applicants');
    },
    onError: (err) => {
      const errMsg = parseApiError(err);
      setError(errMsg);
      toast.error(errMsg);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const errorMsg = validateStep(1) || validateStep(2) || validateStep(3);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    const fd = new FormData();
    if (applicationId) fd.append('application_id', applicationId);
    fd.append('full_name', fullName);
    fd.append('passport_number', passportNumber);
    fd.append('date_of_birth', dateOfBirth);
    fd.append('visa', selectedVisaId);
    fd.append('job', selectedJobId);
    
    if (selectedSecondaryJobId) fd.append('secondary_job', selectedSecondaryJobId);
    
    const hasPayments = applicant?.payments?.length > 0;
    if (!isEdit) {
      fd.append('status', defaultStatusId);
    } else if (hasPayments && selectedStatusId) {
      fd.append('status', selectedStatusId);
    }
    
    fd.append('payment_plan_installments', paymentPlan);

    if (passportIssueDate) fd.append('passport_issue_date', passportIssueDate);
    if (passportExpiryDate) fd.append('passport_expiry_date', passportExpiryDate);
    if (nidNumber) fd.append('nid_number', nidNumber);
    if (placeOfBirth) fd.append('place_of_birth', placeOfBirth);
    if (currentCountry) fd.append('current_country', currentCountry);
    if (remarks) fd.append('remarks', remarks);
    if (selectedSlotId) fd.append('slot', selectedSlotId);
    if (selectedLawyerId) fd.append('lawyer', selectedLawyerId);

    const profileData = {
      gender,
      father_name: fatherName,
      mother_name: motherName,
      phone,
      email,
      nationality,
      marital_status: maritalStatus,
      occupation,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      emergency_contact_relation: emergencyContactRelation,
    };
    fd.append('profile', JSON.stringify(profileData));
    


    if (photoFile) fd.append('photo', photoFile);

    saveMutation.mutate(fd);
  };

  // ────────────────────────────────────────
  // UI Helpers
  // ────────────────────────────────────────

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const labelCls = 'block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1';
  const sectionCls = 'space-y-4';
  const defaultStatusName = statuses?.find(s => s.id === defaultStatusId)?.name || '—';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/applicants')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to list
      </button>

      <div>
        <h2 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Applicant' : 'Register New Applicant'}</h2>
        <p className="text-slate-400 text-sm mt-0.5 font-medium">{isEdit ? 'Update applicant details' : 'Create a new visa applicant file'}</p>
      </div>
      
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Basic Info' },
          { num: 2, label: 'Profile' },
          { num: 3, label: 'Processing' },
        ].map((step, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {step.num}
            </div>
            <span className={`text-xs font-semibold ${currentStep >= step.num ? 'text-blue-700' : 'text-slate-400'}`}>{step.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium whitespace-pre-line">
          {error}
        </div>
      )}

      <form className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-6">
        
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className={sectionCls}>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Application ID <span className="text-slate-400 font-normal text-[10px] lowercase">(optional)</span></label>
                <input type="text" value={applicationId} onChange={e => setApplicationId(e.target.value)} placeholder="e.g. ARG-001 (Leave blank if none)" className={`${inputCls} font-mono uppercase`} />
              </div>
              <div>
                <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Mohammad Ali Khan" className={inputCls} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Passport Number <span className="text-red-500">*</span></label>
                <input type="text" value={passportNumber} onChange={e => setPassportNumber(e.target.value)} placeholder="e.g. AB1234567" className={`${inputCls} font-mono uppercase`} required />
              </div>
              <div>
                <label className={labelCls}>Passport Issue Date</label>
                <input type="date" value={passportIssueDate} onChange={e => setPassportIssueDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Passport Expiry Date</label>
                <input type="date" value={passportExpiryDate} onChange={e => setPassportExpiryDate(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>NID Number <span className="text-red-500">*</span></label>
                <input type="text" value={nidNumber} onChange={e => setNidNumber(e.target.value)} placeholder="10 or 17 digit NID" className={`${inputCls} font-mono`} required />
              </div>
              <div>
                <label className={labelCls}>Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputCls} required />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className={sectionCls}>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              Profile & Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Place of Birth <span className="text-red-500">*</span></label>
                <input type="text" value={placeOfBirth} onChange={e => setPlaceOfBirth(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Current Country <span className="text-red-500">*</span></label>
                <input type="text" value={currentCountry} onChange={e => setCurrentCountry(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Gender <span className="text-red-500">*</span></label>
                <select value={gender} onChange={e => setGender(e.target.value)} className={inputCls} required>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Nationality <span className="text-red-500">*</span></label>
                <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. applicant@email.com" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Father's Name <span className="text-red-500">*</span></label>
                <input type="text" value={fatherName} onChange={e => setFatherName(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Mother's Name <span className="text-red-500">*</span></label>
                <input type="text" value={motherName} onChange={e => setMotherName(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Marital Status</label>
                <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className={inputCls}>
                  <option value="">Select Status</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Occupation</label>
                <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)} className={inputCls} />
              </div>
            </div>
            
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mt-6 mb-2 border-t border-slate-50 pt-4">Emergency Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Name <span className="text-red-500">*</span></label>
                <input type="text" value={emergencyContactName} onChange={e => setEmergencyContactName(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Phone <span className="text-red-500">*</span></label>
                <input type="text" value={emergencyContactPhone} onChange={e => setEmergencyContactPhone(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Relation</label>
                <input type="text" value={emergencyContactRelation} onChange={e => setEmergencyContactRelation(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="mt-4">
              <label className={labelCls}>Applicant Photo {(!isEdit || !applicant?.photo) && <span className="text-red-500">*</span>}</label>
              <input type="file" onChange={e => setPhotoFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required={!isEdit && !applicant?.photo} />
              {isEdit && applicant?.photo && (
                <div className="mt-2 text-sm">
                  <span className="text-slate-500">Current photo: </span>
                  <a href={applicant.photo} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Image</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className={sectionCls}>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              Visa & Processing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Target Visa <span className="text-red-500">*</span></label>
                <select value={selectedVisaId} onChange={e => setSelectedVisaId(e.target.value)} className={`${inputCls} bg-white`} required>
                  <option value="">— Select Visa —</option>
                  {visas?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Target Job (Primary) <span className="text-red-500">*</span></label>
                <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} disabled={!selectedVisaId} className={`${inputCls} bg-white disabled:opacity-50`} required>
                  <option value="">— Select Job —</option>
                  {jobs?.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Target Job (Secondary)</label>
                <select value={selectedSecondaryJobId} onChange={e => setSelectedSecondaryJobId(e.target.value)} disabled={!selectedVisaId} className={`${inputCls} bg-white disabled:opacity-50`}>
                  <option value="">— Optional —</option>
                  {jobs?.filter(j => String(j.id) !== String(selectedJobId)).map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Payment Plan <span className="text-red-500">*</span></label>
                <select 
                  value={paymentPlan} 
                  onChange={e => setPaymentPlan(Number(e.target.value))} 
                  className={`${inputCls} ${isPaymentComplete ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                  disabled={isPaymentComplete}
                  required
                >
                  <option value={2}>Two Installments</option>
                  <option value={3}>Three Installments</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>{isEdit ? 'Current Status' : 'Initial Status'}</label>
                {isEdit && applicant?.payments?.length > 0 ? (
                  <select value={selectedStatusId} onChange={e => setSelectedStatusId(e.target.value)} className={`${inputCls} bg-white`}>
                    <option value="">— Select Status —</option>
                    {statuses?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ) : (
                  <div className="px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-600 font-semibold">
                    {isEdit ? (applicant?.status?.name || defaultStatusName) : defaultStatusName}
                    <span className="text-xs text-slate-400 ml-2">({isEdit ? 'system managed' : 'auto-assigned'})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Assign Staff <span className="text-red-500">*</span></label>
                <select value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} className={`${inputCls} bg-white`} required>
                  <option value="">— Select Staff —</option>
                  {staffs?.map(s => <option key={s.id} value={s.id}>{s.full_name || s.username || s.employee_id}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Assign Slot <span className="text-red-500">*</span></label>
                <select value={selectedSlotId} onChange={e => setSelectedSlotId(e.target.value)} disabled={!selectedStaffId} className={`${inputCls} bg-white disabled:opacity-50`} required>
                  <option value="">— Select Slot —</option>
                  {slots?.map(sl => <option key={sl.id} value={sl.id}>{sl.allocation_month}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Assign Lawyer</label>
                <select value={selectedLawyerId} onChange={e => setSelectedLawyerId(e.target.value)} className={`${inputCls} bg-white`}>
                  <option value="">— Default System Email —</option>
                  {lawyers?.map(l => <option key={l.id} value={l.id}>{l.name} ({l.env_key})</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Remarks</label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} placeholder="Internal notes about this applicant..." className={inputCls} />
            </div>
          </div>
        )}



        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-slate-100 mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-blue-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="px-6 py-2.5 bg-green-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : (isEdit ? 'Update Applicant' : 'Create Applicant')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

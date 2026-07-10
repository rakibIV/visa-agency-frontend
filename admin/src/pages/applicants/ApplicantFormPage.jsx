import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';

export default function ApplicantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // If id exists, we are in edit mode
  const queryClient = useQueryClient();

  const isEdit = Boolean(id);

  // ── Applicant core fields ──
  const [fullName, setFullName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportIssueDate, setPassportIssueDate] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [currentCountry, setCurrentCountry] = useState('');

  // ── Profile Fields ──
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

  // ── Visa & Job ──
  const [selectedVisaId, setSelectedVisaId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedSecondaryJobId, setSelectedSecondaryJobId] = useState('');
  const [paymentPlan, setPaymentPlan] = useState(2);
  const [remarks, setRemarks] = useState('');

  // ── Staff & Slot (optional) ──
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');

  // ── Default status (auto-selected) ──
  const [defaultStatusId, setDefaultStatusId] = useState('');

  // ── Error state ──
  const [error, setError] = useState('');

  // ────────────────────────────────────────
  // Data fetching
  // ────────────────────────────────────────

  // Fetch applicant for editing
  const { data: applicant } = useQuery({
    queryKey: ['applicant', id],
    queryFn: () => api.get(`/applicants/${id}/`).then(r => r.data),
    enabled: isEdit,
  });

  // Pre-fill form when applicant data loads
  useEffect(() => {
    if (applicant && isEdit) {
      setFullName(applicant.full_name || '');
      setPassportNumber(applicant.passport_number || '');
      setPassportIssueDate(applicant.passport_issue_date || '');
      setPassportExpiryDate(applicant.passport_expiry_date || '');
      setNidNumber(applicant.nid_number || '');
      setDateOfBirth(applicant.date_of_birth || '');
      setPlaceOfBirth(applicant.place_of_birth || '');
      setCurrentCountry(applicant.current_country || '');

      // Visa & Job
      if (applicant.visa) setSelectedVisaId(applicant.visa);
      // Wait to set job until after jobs are fetched (handled automatically if job list populates, but we can just set it)
      if (applicant.job) setSelectedJobId(applicant.job);
      if (applicant.secondary_job) setSelectedSecondaryJobId(applicant.secondary_job);
      setPaymentPlan(applicant.payment_plan_installments || 2);
      
      // Staff & Slot
      const staffId = applicant.slot?.staff || applicant.assigned_staff;
      if (staffId) setSelectedStaffId(staffId);
      if (applicant.slot) setSelectedSlotId(applicant.slot);
      
      if (applicant.status?.id) setDefaultStatusId(applicant.status.id);

      // Profile
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
    }
  }, [applicant, isEdit]);

  // Fetch default status
  const { data: statuses } = useQuery({
    queryKey: ['application-statuses'],
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

  // Fetch visas
  const { data: visas } = useQuery({
    queryKey: ['form-visas'],
    queryFn: () => api.get('/visas/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  // Fetch jobs for selected visa
  const { data: jobs } = useQuery({
    queryKey: ['form-jobs', selectedVisaId],
    queryFn: () => api.get(`/visas/${selectedVisaId}/jobs/`).then(r => r.data.results ?? r.data),
    enabled: !!selectedVisaId,
    staleTime: 1000 * 60 * 5,
  });

  // Reset jobs when visa changes
  useEffect(() => {
    if (!isEdit || (isEdit && selectedVisaId !== applicant?.visa)) {
      setSelectedJobId('');
      setSelectedSecondaryJobId('');
    }
  }, [selectedVisaId, isEdit, applicant]);

  // Fetch staffs
  const { data: staffs } = useQuery({
    queryKey: ['form-staffs'],
    queryFn: () => api.get('/staffs/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  // Fetch slots for selected staff
  const { data: slots } = useQuery({
    queryKey: ['form-slots', selectedStaffId],
    queryFn: () => api.get(`/staffs/${selectedStaffId}/monthly-slots/`).then(r => r.data.results ?? r.data),
    enabled: !!selectedStaffId,
    staleTime: 1000 * 60 * 5,
  });

  // Reset slot when staff changes
  useEffect(() => {
    if (!isEdit || (isEdit && selectedStaffId !== (applicant?.slot?.staff || applicant?.assigned_staff))) {
      setSelectedSlotId('');
    }
  }, [selectedStaffId, isEdit, applicant]);



  // ────────────────────────────────────────
  // Submit
  // ────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: (payload) => isEdit ? api.put(`/applicants/${id}/`, payload) : api.post('/applicants/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['applicants']);
      navigate('/applicants');
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data) {
        // Build readable error from DRF validation
        const messages = Object.entries(data).map(([k, v]) => {
          const val = Array.isArray(v) ? v.join(', ') : v;
          return `${k}: ${val}`;
        });
        setError(messages.join('\n'));
      } else {
        setError(`Failed to ${isEdit ? 'update' : 'create'} applicant. Please check your inputs.`);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !passportNumber || !dateOfBirth || !selectedVisaId || !selectedJobId) {
      setError('Please fill in all required fields: Full Name, Passport, Date of Birth, Visa, and Job.');
      return;
    }

    const payload = {
      full_name: fullName,
      passport_number: passportNumber,
      date_of_birth: dateOfBirth,
      visa: selectedVisaId,
      job: selectedJobId,
      secondary_job: selectedSecondaryJobId || null,
      status: defaultStatusId,
      payment_plan_installments: paymentPlan,
    };

    // Optional fields — only send if filled
    if (passportIssueDate) payload.passport_issue_date = passportIssueDate;
    if (passportExpiryDate) payload.passport_expiry_date = passportExpiryDate;
    if (nidNumber) payload.nid_number = nidNumber;
    if (placeOfBirth) payload.place_of_birth = placeOfBirth;
    if (currentCountry) payload.current_country = currentCountry;
    if (remarks) payload.remarks = remarks;
    if (selectedSlotId) payload.slot = selectedSlotId;

    // Profile Data
    payload.profile = {
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

    saveMutation.mutate(payload);
  };

  // ────────────────────────────────────────
  // Render helpers
  // ────────────────────────────────────────

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const labelCls = 'block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1';
  const sectionCls = 'space-y-4';

  const defaultStatusName = statuses?.find(s => s.id === defaultStatusId)?.name || '—';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium whitespace-pre-line">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">

        {/* ─── Section 1: Personal Information ─── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
            Personal Information
          </h3>

          <div>
            <label className={labelCls}>Full Name *</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Mohammad Ali Khan" className={inputCls} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Passport Number *</label>
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
              <label className={labelCls}>NID Number</label>
              <input type="text" value={nidNumber} onChange={e => setNidNumber(e.target.value)} placeholder="10 or 17 digit NID" className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className={labelCls}>Date of Birth *</label>
              <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputCls} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Place of Birth</label>
              <input type="text" value={placeOfBirth} onChange={e => setPlaceOfBirth(e.target.value)} placeholder="e.g. Dhaka, Bangladesh" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Current Country</label>
              <input type="text" value={currentCountry} onChange={e => setCurrentCountry(e.target.value)} placeholder="e.g. Bangladesh" className={inputCls} />
            </div>
          </div>
        </div>

        {/* ─── Profile & Contact (New Fields) ─── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
            Profile & Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className={inputCls}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +8801700000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. applicant@example.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Father's Name</label>
              <input type="text" value={fatherName} onChange={e => setFatherName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mother's Name</label>
              <input type="text" value={motherName} onChange={e => setMotherName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nationality</label>
              <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className={inputCls} />
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
        </div>

        {/* ─── Emergency Contact ─── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Contact Name</label>
              <input type="text" value={emergencyContactName} onChange={e => setEmergencyContactName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Contact Phone</label>
              <input type="text" value={emergencyContactPhone} onChange={e => setEmergencyContactPhone(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Relation</label>
              <input type="text" value={emergencyContactRelation} onChange={e => setEmergencyContactRelation(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* ─── Section 2: Visa & Processing ─── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
            Visa & Job Assignment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Target Visa *</label>
              <select value={selectedVisaId} onChange={e => setSelectedVisaId(e.target.value)} className={`${inputCls} bg-white`} required>
                <option value="">— Select Visa —</option>
                {visas?.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Target Job (Primary) *</label>
              <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                disabled={!selectedVisaId}
                className={`${inputCls} bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                required
              >
                <option value="">— Select Job —</option>
                {jobs?.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
              {selectedVisaId && jobs?.length === 0 && (
                <p className="text-xs text-amber-600 font-medium mt-1">No jobs configured for this visa</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Target Job (Secondary)</label>
              <select
                value={selectedSecondaryJobId}
                onChange={e => setSelectedSecondaryJobId(e.target.value)}
                disabled={!selectedVisaId}
                className={`${inputCls} bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">— Optional —</option>
                {jobs?.filter(j => String(j.id) !== String(selectedJobId)).map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Payment Plan</label>
              <select value={paymentPlan} onChange={e => setPaymentPlan(Number(e.target.value))} className={`${inputCls} bg-white`}>
                <option value={2}>Two Installments</option>
                <option value={3}>Three Installments</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Initial Status</label>
              <div className="px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-600 font-semibold">
                {defaultStatusName}
                <span className="text-xs text-slate-400 ml-2">(auto-assigned)</span>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Remarks</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={2}
              placeholder="Internal notes about this applicant..."
              className={inputCls}
            />
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium leading-relaxed">
            <strong>Note:</strong> Agreements are auto-generated when the first payment installment is received.
          </div>
        </div>

        {/* ─── Section 3: Staff & Slot Assignment ─── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
            Staff & Slot Assignment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Assign Staff</label>
              <select value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} className={`${inputCls} bg-white`}>
                <option value="">— Select Staff (Optional) —</option>
                {staffs?.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.username || s.employee_id} {s.employee_id && `(${s.employee_id})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Assign Slot</label>
              <select
                value={selectedSlotId}
                onChange={e => setSelectedSlotId(e.target.value)}
                disabled={!selectedStaffId}
                className={`${inputCls} bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">— Select Slot —</option>
                {slots?.map(sl => {
                  const rem = sl.remaining_slot ?? 0;
                  return (
                    <option key={sl.id} value={sl.id} disabled={rem <= 0 && sl.id !== applicant?.slot?.id}>
                      {sl.allocation_month} (Remaining: {rem} / {sl.total_slot} slots)
                    </option>
                  );
                })}
              </select>
              {selectedStaffId && slots?.length === 0 && (
                <p className="text-xs text-red-500 font-medium mt-1">This staff member has no monthly slots assigned.</p>
              )}
              {selectedStaffId && slots?.length > 0 && slots.every(sl => (sl.remaining_slot ?? 0) <= 0) && (
                <p className="text-xs text-red-500 font-medium mt-1">This staff member has no remaining slots available.</p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Submit ─── */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-6 py-2.5 bg-blue-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : (isEdit ? 'Update Applicant' : 'Create Applicant')}
          </button>
        </div>
      </form>
    </div>
  );
}

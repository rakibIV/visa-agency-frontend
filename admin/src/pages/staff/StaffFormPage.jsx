import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';

export default function StaffFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [userId, setUserId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [officeId, setOfficeId] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [referenceStaffId, setReferenceStaffId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [photoFile, setPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [error, setError] = useState('');

  const { data: staff } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => api.get(`/staffs/${id}/`).then(r => r.data),
    enabled: isEdit,
  });

  const { data: designations } = useQuery({
    queryKey: ['config-designations'],
    queryFn: () => api.get('/designations/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: offices } = useQuery({
    queryKey: ['config-offices'],
    queryFn: () => api.get('/branches/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: users } = useQuery({
    // Fetch users if available, or admin has to type user ID (assuming user list endpoint exists or users are managed elsewhere)
    queryKey: ['users'],
    queryFn: () => api.get('/users/').then(r => r.data.results ?? r.data).catch(() => []),
    staleTime: 1000 * 60 * 10,
  });

  const { data: allStaffs } = useQuery({
    queryKey: ['all-staffs'],
    queryFn: () => api.get('/staffs/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (staff && isEdit) {
      setUserId(staff.user?.id || staff.user || '');
      
      let dId = staff.designation?.id || staff.designation;
      if (typeof dId === 'string' && designations?.length) {
        const found = designations.find(d => d.name === dId || String(d.id) === dId);
        if (found) dId = found.id;
      }
      setDesignationId(dId || '');
      
      let oId = staff.office?.id || staff.office;
      if (typeof oId === 'string' && offices?.length) {
        const found = offices.find(o => o.name === oId || String(o.id) === oId);
        if (found) oId = found.id;
      }
      setOfficeId(oId || '');
      setPhone(staff.phone || '');
      setWhatsapp(staff.whatsapp || '');
      setFatherName(staff.father_name || '');
      setMotherName(staff.mother_name || '');
      setGender(staff.gender || 'Male');
      setDateOfBirth(staff.date_of_birth || '');
      setNationality(staff.nationality || '');
      setNidNumber(staff.nid_number || '');
      setPassportNumber(staff.passport_number || '');
      setJoiningDate(staff.joining_date || '');
      setReferenceStaffId(staff.reference_staff?.id || staff.reference_staff || '');
      setIsActive(staff.is_active ?? true);
    }
  }, [staff, isEdit, designations, offices]);

  const saveMutation = useMutation({
    mutationFn: (formData) => {
      const headers = { 'Content-Type': 'multipart/form-data' };
      return isEdit 
        ? api.patch(`/staffs/${staff.id}/`, formData, { headers }) 
        : api.post('/staffs/', formData, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staffs']);
      navigate('/staff');
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (typeof data === 'object') {
         setError(Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(' | '));
      } else {
         setError(err?.response?.data?.detail || 'An error occurred while saving.');
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check required fields
    if (!userId || !designationId || !officeId || !phone || !dateOfBirth || !joiningDate || !gender || !fatherName || !motherName || !nationality) {
      return setError('Please fill all required fields.');
    }

    const fd = new FormData();
    fd.append('user', userId);
    fd.append('designation', designationId);
    fd.append('office', officeId);
    fd.append('phone', phone);
    fd.append('whatsapp', whatsapp);
    fd.append('father_name', fatherName);
    fd.append('mother_name', motherName);
    fd.append('gender', gender);
    fd.append('date_of_birth', dateOfBirth);
    fd.append('nationality', nationality);
    fd.append('nid_number', nidNumber);
    fd.append('passport_number', passportNumber);
    fd.append('joining_date', joiningDate);
    if (referenceStaffId) fd.append('reference_staff', referenceStaffId);
    fd.append('is_active', isActive);

    if (photoFile) fd.append('photo', photoFile);
    if (signatureFile) fd.append('signature', signatureFile);

    saveMutation.mutate(fd);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Team Member' : 'Add Team Member'}</h2>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="col-span-1 md:col-span-2 text-sm font-bold text-slate-800 border-b pb-2 mb-2">Account & Organization</div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User Account ID <span className="text-red-500">*</span></label>
            <input type="number" value={userId} onChange={e => setUserId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" placeholder="e.g. 1" required />
            <p className="text-xs text-slate-400 mt-1">Must map to an existing User record in the system.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation <span className="text-red-500">*</span></label>
            <select value={designationId} onChange={e => setDesignationId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white" required>
              <option value="">Select Designation</option>
              {designations?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Office / Branch <span className="text-red-500">*</span></label>
            <select value={officeId} onChange={e => setOfficeId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white" required>
              <option value="">Select Office</option>
              {offices?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Joining Date <span className="text-red-500">*</span></label>
            <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reference Staff</label>
            <select value={referenceStaffId} onChange={e => setReferenceStaffId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white">
              <option value="">— Select Reference Staff (Optional) —</option>
              {allStaffs?.filter(s => String(s.id) !== String(staff?.id)).map(s => (
                <option key={s.id} value={s.id}>{s.full_name || s.employee_id}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 text-sm font-bold text-slate-800 border-b pb-2 mb-2 mt-4">Personal Details</div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone <span className="text-red-500">*</span></label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp</label>
            <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's Name <span className="text-red-500">*</span></label>
            <input type="text" value={fatherName} onChange={e => setFatherName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mother's Name <span className="text-red-500">*</span></label>
            <input type="text" value={motherName} onChange={e => setMotherName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender <span className="text-red-500">*</span></label>
            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white" required>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth <span className="text-red-500">*</span></label>
            <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nationality <span className="text-red-500">*</span></label>
            <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NID Number</label>
            <input type="text" value={nidNumber} onChange={e => setNidNumber(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Passport Number</label>
            <input type="text" value={passportNumber} onChange={e => setPassportNumber(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          
          <div className="col-span-1 md:col-span-2 text-sm font-bold text-slate-800 border-b pb-2 mb-2 mt-4">Media</div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Photo</label>
            <input type="file" onChange={e => setPhotoFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <p className="text-xs text-slate-400 mt-1">Required size: exactly 300x300 pixels.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Signature</label>
            <input type="file" onChange={e => setSignatureFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <p className="text-xs text-slate-400 mt-1">Required size: exactly 300x80 pixels.</p>
          </div>

          <div className="flex items-center gap-6 col-span-1 md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Is Active</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={saveMutation.isPending} className="px-6 py-2.5 rounded-xl font-bold bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50">
            {saveMutation.isPending ? 'Saving...' : 'Save Staff'}
          </button>
        </div>
      </form>
    </div>
  );
}

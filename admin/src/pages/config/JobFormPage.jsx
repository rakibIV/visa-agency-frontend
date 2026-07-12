import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';

export default function JobFormPage() {
  const { visaId, jobId } = useParams();
  const isEdit = Boolean(jobId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minimumSalary, setMinimumSalary] = useState('');
  const [maximumSalary, setMaximumSalary] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [vacancies, setVacancies] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [dutyDaysPerWeek, setDutyDaysPerWeek] = useState('');
  const [dutyHoursPerDay, setDutyHoursPerDay] = useState('');
  const [overtimeAvailable, setOvertimeAvailable] = useState(false);
  const [overtimeRate, setOvertimeRate] = useState('');
  const [contractDurationMonths, setContractDurationMonths] = useState('');
  const [location, setLocation] = useState('');
  const [languageRequirement, setLanguageRequirement] = useState('');
  const [educationRequirement, setEducationRequirement] = useState('');
  const [genderPreference, setGenderPreference] = useState('');
  const [ageRequirement, setAgeRequirement] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [error, setError] = useState('');

  const { data: job } = useQuery({
    queryKey: ['visa-job', visaId, jobId],
    queryFn: () => api.get(`/visas/${visaId}/jobs/${jobId}/`).then(r => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (job && isEdit) {
      setTitle(job.title || '');
      setDescription(job.description || '');
      setMinimumSalary(job.minimum_salary || '');
      setMaximumSalary(job.maximum_salary || '');
      setCurrency(job.currency || 'EUR');
      setVacancies(job.vacancies || '');
      setExperienceRequired(job.experience_required || '');
      setDutyDaysPerWeek(job.duty_days_per_week || '');
      setDutyHoursPerDay(job.duty_hours_per_day || '');
      setOvertimeAvailable(job.overtime_available || false);
      setOvertimeRate(job.overtime_rate || '');
      setContractDurationMonths(job.contract_duration_months || '');
      setLocation(job.location || '');
      setLanguageRequirement(job.language_requirement || '');
      setEducationRequirement(job.education_requirement || '');
      setGenderPreference(job.gender_preference || '');
      setAgeRequirement(job.age_requirement || '');
      setIsActive(job.is_active ?? true);
      setDisplayOrder(job.display_order || 0);
    }
  }, [job, isEdit]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      return isEdit 
        ? api.patch(`/visas/${visaId}/jobs/${jobId}/`, data) 
        : api.post(`/visas/${visaId}/jobs/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['config-visa-jobs', visaId]);
      navigate('/config/jobs');
    },
    onError: (err) => {
      setError(err?.response?.data?.detail || 'An error occurred while saving.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!title) return setError('Title is required.');

    const data = {
      title,
      description,
      minimum_salary: minimumSalary || null,
      maximum_salary: maximumSalary || null,
      currency,
      vacancies: vacancies || null,
      experience_required: experienceRequired,
      duty_days_per_week: dutyDaysPerWeek || null,
      duty_hours_per_day: dutyHoursPerDay || null,
      overtime_available: overtimeAvailable,
      overtime_rate: overtimeRate,
      contract_duration_months: contractDurationMonths || null,
      location,
      language_requirement: languageRequirement,
      education_requirement: educationRequirement,
      gender_preference: genderPreference,
      age_requirement: ageRequirement,
      is_active: isActive,
      display_order: displayOrder,
    };

    saveMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Job Profile' : 'Add Job Profile'}</h2>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Title <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" required />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl h-24" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vacancies</label>
            <input type="number" value={vacancies} onChange={e => setVacancies(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Salary</label>
            <input type="number" step="0.01" value={minimumSalary} onChange={e => setMinimumSalary(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Salary</label>
            <div className="flex gap-2">
              <input type="number" step="0.01" value={maximumSalary} onChange={e => setMaximumSalary(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl" />
              <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} className="w-20 px-3 py-2 border border-slate-200 rounded-xl text-center" placeholder="EUR" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duty Days/Week</label>
            <input type="number" value={dutyDaysPerWeek} onChange={e => setDutyDaysPerWeek(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duty Hours/Day</label>
            <input type="number" step="0.1" value={dutyHoursPerDay} onChange={e => setDutyHoursPerDay(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contract Duration (Months)</label>
            <input type="number" value={contractDurationMonths} onChange={e => setContractDurationMonths(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Order</label>
            <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>

          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Experience Required</label>
              <input type="text" value={experienceRequired} onChange={e => setExperienceRequired(e.target.value)} placeholder="e.g. 2 Years" className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Language Requirement</label>
              <input type="text" value={languageRequirement} onChange={e => setLanguageRequirement(e.target.value)} placeholder="e.g. Basic English" className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Education Requirement</label>
              <input type="text" value={educationRequirement} onChange={e => setEducationRequirement(e.target.value)} placeholder="e.g. High School" className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender / Age Preference</label>
              <div className="flex gap-2">
                <input type="text" value={genderPreference} onChange={e => setGenderPreference(e.target.value)} placeholder="Any" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl" />
                <input type="text" value={ageRequirement} onChange={e => setAgeRequirement(e.target.value)} placeholder="e.g. 20-35" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 col-span-1 md:col-span-2 sm:flex-row mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={overtimeAvailable} onChange={e => setOvertimeAvailable(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Overtime Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Is Active</span>
            </label>
          </div>
          
          {overtimeAvailable && (
            <input type="text" value={overtimeRate} onChange={e => setOvertimeRate(e.target.value)} placeholder="Overtime Rate (e.g. 1.5x)" className="flex-1 max-w-[200px] px-3 py-1.5 border border-slate-200 rounded-xl text-sm" />
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={saveMutation.isPending} className="px-6 py-2.5 rounded-xl font-bold bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50">
            {saveMutation.isPending ? 'Saving...' : 'Save Job Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

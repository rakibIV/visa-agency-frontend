import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { parseApiError } from '../../utils/errorParser';

export default function VisaFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [overtime, setOvertime] = useState(false);
  const [minProcessingDays, setMinProcessingDays] = useState('');
  const [maxProcessingDays, setMaxProcessingDays] = useState('');
  const [durationInMonths, setDurationInMonths] = useState('');
  const [fromAnyCountry, setFromAnyCountry] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);

  const [error, setError] = useState('');

  const { data: visa } = useQuery({
    queryKey: ['visa', id],
    queryFn: () => api.get(`/visas/${id}/`).then(r => r.data),
    enabled: isEdit,
  });

  const { data: countries } = useQuery({
    queryKey: ['config-countries'],
    queryFn: () => api.get('/countries/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: categories } = useQuery({
    queryKey: ['config-visa-categories'],
    queryFn: () => api.get('/visa-categories/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: agencyServices } = useQuery({
    queryKey: ['config-services'],
    queryFn: () => api.get('/agency-services/').then(r => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (visa && isEdit) {
      setName(visa.name || '');
      setCountryId(visa.country?.id || '');
      setCategoryId(visa.category?.id || '');
      setDescription(visa.description || '');
      setMinSalary(visa.minimum_salary || '');
      setMaxSalary(visa.maximum_salary || '');
      setWorkingHours(visa.working_hours_per_week || '');
      setOvertime(visa.overtime_available || false);
      setMinProcessingDays(visa.minimum_processing_days || '');
      setMaxProcessingDays(visa.maximum_processing_days || '');
      setDurationInMonths(visa.duration_in_months || '');
      setFromAnyCountry(visa.from_any_country ?? true);
      setIsFeatured(visa.is_featured || false);
      setIsActive(visa.is_active ?? true);
      setSelectedServices(visa.services?.map(s => s.id) || []);
    }
  }, [visa, isEdit]);

  const saveMutation = useMutation({
    mutationFn: (payload) => isEdit 
      ? api.patch(`/visas/${id}/`, payload) 
      : api.post('/visas/', payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Visa updated successfully!' : 'Visa created successfully!');
      queryClient.invalidateQueries(['config-visas']);
      navigate('/config/visas');
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
    
    if (!name || !countryId || !categoryId) {
      const msg = 'Name, Country, and Category are required.';
      toast.error(msg);
      return setError(msg);
    }

    const payload = {
      name,
      slug: name.toLowerCase().replace(/ /g, '-'),
      country: countryId,
      category: categoryId,
      description,
      minimum_salary: minSalary || null,
      maximum_salary: maxSalary || null,
      working_hours_per_week: workingHours || null,
      overtime_available: overtime,
      minimum_processing_days: minProcessingDays || null,
      maximum_processing_days: maxProcessingDays || null,
      duration_in_months: durationInMonths || null,
      from_any_country: fromAnyCountry,
      is_featured: isFeatured,
      is_active: isActive,
      services: selectedServices,
    };

    saveMutation.mutate(payload);
  };

  const handleServiceToggle = (id) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Visa Scheme' : 'Add Visa Scheme'}</h2>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Visa Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country <span className="text-red-500">*</span></label>
            <select value={countryId} onChange={e => setCountryId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white" required>
              <option value="">Select Country</option>
              {countries?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category <span className="text-red-500">*</span></label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white" required>
              <option value="">Select Category</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} id="featured" className="w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="featured" className="text-sm font-semibold text-slate-700">Featured Visa Scheme</label>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl h-24" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Salary ($)</label>
            <input type="number" value={minSalary} onChange={e => setMinSalary(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Salary ($)</label>
            <input type="number" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Working Hours/Week</label>
            <input type="number" value={workingHours} onChange={e => setWorkingHours(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Months)</label>
            <input type="number" value={durationInMonths} onChange={e => setDurationInMonths(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Processing Days</label>
            <input type="number" value={minProcessingDays} onChange={e => setMinProcessingDays(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Processing Days</label>
            <input type="number" value={maxProcessingDays} onChange={e => setMaxProcessingDays(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>

          <div className="col-span-1 md:col-span-2 text-sm font-bold text-slate-800 border-b pb-2 mb-2 mt-4">Linked Agency Services</div>
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {agencyServices?.map(service => (
              <label key={service.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedServices.includes(service.id)} 
                  onChange={() => handleServiceToggle(service.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm font-semibold text-slate-700">{service.title}</span>
              </label>
            ))}
            {(!agencyServices || agencyServices.length === 0) && (
              <div className="text-sm text-slate-500 col-span-full">No agency services configured. Add them in Settings.</div>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 text-sm font-bold text-slate-800 border-b pb-2 mb-2 mt-4">Flags & Visibility</div>
          <div className="flex flex-col gap-4 col-span-1 md:col-span-2 sm:flex-row mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={overtime} onChange={e => setOvertime(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Overtime Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={fromAnyCountry} onChange={e => setFromAnyCountry(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              <span className="text-sm font-semibold text-slate-700">From Any Country</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Is Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Is Active</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={saveMutation.isPending} className="px-6 py-2.5 rounded-xl font-bold bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50">
            {saveMutation.isPending ? 'Saving...' : 'Save Visa Scheme'}
          </button>
        </div>
      </form>
    </div>
  );
}

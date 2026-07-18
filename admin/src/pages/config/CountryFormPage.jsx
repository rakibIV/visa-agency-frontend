import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { parseApiError } from '../../utils/errorParser';

export default function CountryFormPage() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [nationality, setNationality] = useState('');
  const [capital, setCapital] = useState('');
  const [timeZone, setTimeZone] = useState('UTC');
  const [processingTime, setProcessingTime] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [flagFile, setFlagFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');

  const { data: country } = useQuery({
    queryKey: ['country', slug],
    queryFn: () => api.get(`/countries/${slug}/`).then(r => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (country && isEdit) {
      setName(country.name || '');
      setCurrency(country.currency || 'USD');
      setLanguage(country.language || 'English');
      setNationality(country.nationality || '');
      setCapital(country.capital || '');
      setTimeZone(country.time_zone || 'UTC');
      setProcessingTime(country.processing_time || '');
      setShortDescription(country.short_description || '');
      setDescription(country.description || '');
      setDisplayOrder(country.display_order ?? 0);
      setIsFeatured(country.is_featured || false);
      setIsActive(country.is_active ?? true);
    }
  }, [country, isEdit]);

  const saveMutation = useMutation({
    mutationFn: (formData) => {
      const headers = { 'Content-Type': 'multipart/form-data' };
      return isEdit 
        ? api.patch(`/countries/${slug}/`, formData, { headers }) 
        : api.post('/countries/', formData, { headers });
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Country updated successfully!' : 'Country added successfully!');
      queryClient.invalidateQueries(['config-countries']);
      navigate('/config/countries');
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
    if (!name) {
      toast.error('Name is required.');
      return setError('Name is required.');
    }

    const fd = new FormData();
    fd.append('name', name);
    fd.append('slug', name.toLowerCase().replace(/ /g, '-'));
    fd.append('currency', currency);
    fd.append('language', language);
    fd.append('nationality', nationality);
    fd.append('capital', capital);
    fd.append('time_zone', timeZone);
    fd.append('processing_time', processingTime);
    fd.append('short_description', shortDescription);
    fd.append('description', description);
    fd.append('display_order', displayOrder);
    fd.append('is_featured', isFeatured);
    fd.append('is_active', isActive);

    if (flagFile) fd.append('flag', flagFile);
    if (imageFile) fd.append('image', imageFile);

    saveMutation.mutate(fd);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Country' : 'Add Country'}</h2>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Currency</label>
            <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Language</label>
            <input type="text" value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nationality</label>
            <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capital</label>
            <input type="text" value={capital} onChange={e => setCapital(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Zone</label>
            <input type="text" value={timeZone} onChange={e => setTimeZone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Processing Time</label>
            <input type="text" value={processingTime} onChange={e => setProcessingTime(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Order</label>
            <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Short Description</label>
            <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl h-20" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl h-32" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Flag Image</label>
            <input type="file" accept="image/*" onChange={e => setFlagFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {flagFile ? (
              <div className="mt-3">
                <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">New Flag Preview:</span>
                <img src={URL.createObjectURL(flagFile)} alt="New Flag" className="w-32 h-20 object-cover rounded-xl border border-slate-200 shadow-sm" />
              </div>
            ) : isEdit && country?.flag ? (
              <div className="mt-3">
                <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">Current Flag:</span>
                <img src={country.flag} alt="Current Flag" className="w-32 h-20 object-cover rounded-xl border border-slate-200 shadow-sm" />
              </div>
            ) : null}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cover Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {imageFile ? (
              <div className="mt-3">
                <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">New Cover Preview:</span>
                <img src={URL.createObjectURL(imageFile)} alt="New Cover" className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm" />
              </div>
            ) : isEdit && country?.image ? (
              <div className="mt-3">
                <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">Current Cover:</span>
                <img src={country.image} alt="Current Cover" className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm" />
              </div>
            ) : null}
          </div>
          
          <div className="flex items-center gap-6 col-span-1 md:col-span-2">
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
            {saveMutation.isPending ? 'Saving...' : 'Save Country'}
          </button>
        </div>
      </form>
    </div>
  );
}

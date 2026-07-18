import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, GlobeAltIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function CountriesConfigPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  const { data: countries, isLoading } = useQuery({
    queryKey: ['config-countries', search],
    queryFn: () => api.get('/countries/', { params: search ? { search } : {} }).then((r) => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (slug) => api.delete(`/countries/${slug}/`),
    onSuccess: () => queryClient.invalidateQueries(['config-countries']),
  });

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Countries</h2>
          <p className="text-slate-400 text-sm mt-0.5">Configure operational countries &amp; details</p>
        </div>
        <button
          onClick={() => navigate('/config/countries/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Country
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search countries..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries?.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                  {c.flag
                    ? <img src={c.flag} alt={c.name} className="w-full h-full object-cover" />
                    : <GlobeAltIcon className="w-6 h-6 text-blue-600" />
                  }
                </div>
                <div>
                  <button onClick={() => navigate(`/config/countries/${c.slug}`)} className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-base text-left transition-colors">
                    {c.name}
                  </button>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Currency: {c.currency} | Lang: {c.language}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { if (window.confirm('Delete this country?')) deleteMutation.mutate(c.slug); }}
                  className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {(!countries || countries.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400 text-sm font-semibold">No countries configured yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

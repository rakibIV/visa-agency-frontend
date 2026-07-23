import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, BanknotesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Pagination from '../../components/common/Pagination';

export default function CurrenciesConfigPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newCurrency, setNewCurrency] = useState({ name: '', code: '', symbol: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['config-currencies', search, page],
    queryFn: () => api.get('/currencies/', { params: { page, ...(search ? { search } : {}) } }).then((r) => r.data),
    staleTime: 1000 * 60 * 10,
    keepPreviousData: true,
  });

  const currencies = data?.results ?? data ?? [];
  const totalPages = data?.count ? Math.ceil(data.count / 20) : 1;

  const createMutation = useMutation({
    mutationFn: (newCurr) => api.post('/currencies/', newCurr),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-currencies']);
      setIsAdding(false);
      setNewCurrency({ name: '', code: '', symbol: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/currencies/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['config-currencies']),
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(newCurrency);
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Currencies</h2>
          <p className="text-slate-400 text-sm mt-0.5">Configure system currencies &amp; symbols</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Currency
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currencies..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name (e.g. Euro)</label>
            <input required type="text" value={newCurrency.name} onChange={e => setNewCurrency({...newCurrency, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Code (e.g. EUR)</label>
            <input required type="text" maxLength={3} value={newCurrency.code} onChange={e => setNewCurrency({...newCurrency, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-slate-200 rounded-xl uppercase" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Symbol (e.g. €)</label>
            <input type="text" value={newCurrency.symbol} onChange={e => setNewCurrency({...newCurrency, symbol: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-200">Cancel</button>
            <button type="submit" disabled={createMutation.isLoading} className="px-4 py-2 bg-blue-700 text-white font-semibold text-sm rounded-xl hover:bg-blue-800 disabled:opacity-50">Save</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currencies?.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                  <BanknotesIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{c.name}</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Code: {c.code} | Symbol: {c.symbol || 'N/A'}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { if (window.confirm(`Delete ${c.name}?`)) deleteMutation.mutate(c.id); }}
                  className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {(!currencies || currencies.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400 text-sm font-semibold">No currencies configured yet.</div>
          )}
        </div>
      )}
      
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
}

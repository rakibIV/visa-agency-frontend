import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, BanknotesIcon, MagnifyingGlassIcon, PencilSquareIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Pagination from '../../components/common/Pagination';
import { parseApiError } from '../../utils/errorParser';

export default function CurrenciesConfigPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', symbol: '', is_active: true });

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
      toast.success('Currency added successfully!');
      queryClient.invalidateQueries(['config-currencies']);
      queryClient.invalidateQueries(['currencies']);
      closeModal();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updatedData }) => api.patch(`/currencies/${id}/`, updatedData),
    onSuccess: () => {
      toast.success('Currency updated successfully!');
      queryClient.invalidateQueries(['config-currencies']);
      queryClient.invalidateQueries(['currencies']);
      closeModal();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/currencies/${id}/`),
    onSuccess: () => {
      toast.success('Currency deleted successfully!');
      queryClient.invalidateQueries(['config-currencies']);
      queryClient.invalidateQueries(['currencies']);
    },
    onError: (err) => toast.error(parseApiError(err)),
  });

  const openAddModal = () => {
    setEditingCurrency(null);
    setFormData({ name: '', code: '', symbol: '', is_active: true });
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingCurrency(c);
    setFormData({ name: c.name, code: c.code, symbol: c.symbol || '', is_active: c.is_active ?? true });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCurrency(null);
    setFormData({ name: '', code: '', symbol: '', is_active: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Currency Name and Code are required!');
      return;
    }
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      symbol: formData.symbol.trim(),
      is_active: formData.is_active,
    };

    if (editingCurrency) {
      updateMutation.mutate({ id: editingCurrency.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System Currencies</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage transaction currencies, ISO codes, and symbols</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold shadow hover:bg-blue-800 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Currency
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currencies by name, code, or symbol..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Currencies Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm mt-3 font-medium">Loading currencies...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {currencies?.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start justify-between hover:border-slate-200 transition-all">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="font-mono font-black text-blue-700 text-base">{c.symbol || c.code}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-base truncate">{c.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs font-semibold mt-1 font-mono">
                    Code: <span className="text-slate-700 font-bold">{c.code}</span> | Symbol: <span className="text-slate-700 font-bold">{c.symbol || 'N/A'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => openEditModal(c)}
                  className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  title="Edit Currency"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${c.name} (${c.code})?`)) {
                      deleteMutation.mutate(c.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                  title="Delete Currency"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {(!currencies || currencies.length === 0) && (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm font-semibold bg-white rounded-2xl border border-slate-100">
              <BanknotesIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              No currencies found. Click "Add Currency" to create one.
            </div>
          )}
        </div>
      )}

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />

      {/* Add / Edit Currency Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <BanknotesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Configure ISO currency details & symbol</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Currency Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US Dollar, Euro, Bangladeshi Taka"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ISO Code * (3 Letters)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. USD"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $, €, ৳"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="currency_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="currency_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Is Active (Available for payments & transactions)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow transition-all disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingCurrency ? 'Update Currency' : 'Save Currency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


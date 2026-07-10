import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function VisasConfigPage() {
  const queryClient = useQueryClient();

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [countryId, setCountryId] = useState('');

  // Edit modal state
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMinSalary, setEditMinSalary] = useState('');
  const [editMaxSalary, setEditMaxSalary] = useState('');
  const [editCountryId, setEditCountryId] = useState('');

  const { data: visas, isLoading } = useQuery({
    queryKey: ['config-visas'],
    queryFn: () => api.get('/visas/').then((r) => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: countries } = useQuery({
    queryKey: ['config-countries'],
    queryFn: () => api.get('/countries/').then((r) => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  const addMutation = useMutation({
    mutationFn: (newVisa) => api.post('/visas/', newVisa),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-visas']);
      setShowAddModal(false);
      setName(''); setMinSalary(''); setMaxSalary(''); setCountryId('');
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/visas/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-visas']);
      setEditItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/visas/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['config-visas']),
  });

  const openEdit = (v) => {
    setEditItem(v);
    setEditName(v.name);
    setEditMinSalary(v.minimum_salary || '');
    setEditMaxSalary(v.maximum_salary || '');
    setEditCountryId(v.country?.id || '');
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Visas Schemes</h2>
          <p className="text-slate-400 text-sm mt-0.5">Configure operational visas &amp; details</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Visa Scheme
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visas?.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                  <PaperAirplaneIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <button onClick={() => openEdit(v)} className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-base text-left transition-colors">
                    {v.name}
                  </button>
                  <p className="text-slate-400 text-xs font-semibold mt-1">
                    Country: {v.country?.name || 'N/A'} | Salary: ${v.minimum_salary} - ${v.maximum_salary}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { if (window.confirm('Delete this visa scheme?')) deleteMutation.mutate(v.id); }}
                  className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {(!visas || visas.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400 text-sm font-semibold">No visas configured yet.</div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Visa Scheme" onClose={() => setShowAddModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Visa Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Canada PR"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Country</label>
              <select value={countryId} onChange={(e) => setCountryId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                <option value="">Select Country</option>
                {countries?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Min Salary ($)</label>
                <input type="number" value={minSalary} onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Max Salary ($)</label>
                <input type="number" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={addMutation.isPending || !name}
              onClick={() => addMutation.mutate({ name, slug: name.toLowerCase().replace(/ /g, '-'), minimum_salary: minSalary, maximum_salary: maxSalary, country: countryId || null })}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {addMutation.isPending ? 'Saving…' : 'Add'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal title={`Edit — ${editItem.name}`} onClose={() => setEditItem(null)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Visa Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Country</label>
              <select value={editCountryId} onChange={(e) => setEditCountryId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                <option value="">Select Country</option>
                {countries?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Min Salary ($)</label>
                <input type="number" value={editMinSalary} onChange={(e) => setEditMinSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Max Salary ($)</label>
                <input type="number" value={editMaxSalary} onChange={(e) => setEditMaxSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold">
            <button onClick={() => setEditItem(null)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={editMutation.isPending}
              onClick={() => editMutation.mutate({ id: editItem.id, data: { name: editName, minimum_salary: editMinSalary, maximum_salary: editMaxSalary, country: editCountryId || null } })}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {editMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

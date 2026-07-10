import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, PencilSquareIcon, GlobeAltIcon, XMarkIcon } from '@heroicons/react/24/outline';
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

export default function CountriesConfigPage() {
  const queryClient = useQueryClient();

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState('SAR');
  const [newLanguage, setNewLanguage] = useState('Arabic');

  // Edit modal state
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editLanguage, setEditLanguage] = useState('');

  const { data: countries, isLoading } = useQuery({
    queryKey: ['config-countries'],
    queryFn: () => api.get('/countries/').then((r) => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/countries/', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-countries']);
      setShowAddModal(false);
      setNewName(''); setNewCurrency('SAR'); setNewLanguage('Arabic');
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/countries/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-countries']);
      setEditItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/countries/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['config-countries']),
  });

  const openEdit = (c) => {
    setEditItem(c);
    setEditName(c.name);
    setEditCurrency(c.currency);
    setEditLanguage(c.language);
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Countries</h2>
          <p className="text-slate-400 text-sm mt-0.5">Configure operational countries &amp; details</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Country
        </button>
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
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                  {c.flag
                    ? <img src={c.flag} alt={c.name} className="w-full h-full object-cover rounded-2xl" />
                    : <GlobeAltIcon className="w-6 h-6 text-blue-600" />
                  }
                </div>
                <div>
                  <button onClick={() => openEdit(c)} className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-base text-left transition-colors">
                    {c.name}
                  </button>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Currency: {c.currency} | Lang: {c.language}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { if (window.confirm('Delete this country?')) deleteMutation.mutate(c.id); }}
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

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Operational Country" onClose={() => setShowAddModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Country Name *</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Saudi Arabia"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Currency Code</label>
                <input type="text" value={newCurrency} onChange={(e) => setNewCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Primary Language</label>
                <input type="text" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={addMutation.isPending || !newName}
              onClick={() => addMutation.mutate({ name: newName, slug: newName.toLowerCase().replace(/ /g, '-'), currency: newCurrency, language: newLanguage })}
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
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Country Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Currency Code</label>
                <input type="text" value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Primary Language</label>
                <input type="text" value={editLanguage} onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold">
            <button onClick={() => setEditItem(null)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={editMutation.isPending}
              onClick={() => editMutation.mutate({ id: editItem.id, data: { name: editName, currency: editCurrency, language: editLanguage } })}
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

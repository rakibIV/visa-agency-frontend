import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, BriefcaseIcon, XMarkIcon } from '@heroicons/react/24/outline';
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

export default function JobsConfigPage() {
  const queryClient = useQueryClient();
  const [selectedVisaId, setSelectedVisaId] = useState('');

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [vacancies, setVacancies] = useState('');
  const [location, setLocation] = useState('');

  // Edit modal state
  const [editItem, setEditItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editVacancies, setEditVacancies] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Fetch all visas to populate selector
  const { data: visas } = useQuery({
    queryKey: ['config-visas-dropdown'],
    queryFn: () => api.get('/visas/').then((r) => {
      const results = r.data.results ?? r.data;
      if (results?.length > 0 && !selectedVisaId) setSelectedVisaId(results[0].id);
      return results;
    }),
    staleTime: 1000 * 60 * 10,
  });

  // Fetch jobs for the selected visa
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['config-visa-jobs', selectedVisaId],
    queryFn: () => {
      if (!selectedVisaId) return [];
      return api.get(`/visas/${selectedVisaId}/jobs/`).then((r) => r.data.results ?? r.data);
    },
    enabled: !!selectedVisaId,
    staleTime: 1000 * 60 * 5,
  });

  const addMutation = useMutation({
    mutationFn: (newJob) => api.post(`/visas/${selectedVisaId}/jobs/`, newJob),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-visa-jobs', selectedVisaId]);
      setShowAddModal(false);
      setTitle(''); setVacancies(''); setLocation('');
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/visas/${selectedVisaId}/jobs/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-visa-jobs', selectedVisaId]);
      setEditItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/visas/${selectedVisaId}/jobs/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['config-visa-jobs', selectedVisaId]),
  });

  const openEdit = (job) => {
    setEditItem(job);
    setEditTitle(job.title);
    setEditVacancies(job.vacancies || '');
    setEditLocation(job.location || '');
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Visa Jobs</h2>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">Configure job profiles under each visa scheme</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Visa Selector */}
          <select
            value={selectedVisaId}
            onChange={(e) => setSelectedVisaId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            {visas?.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedVisaId}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            <PlusIcon className="w-4 h-4" />
            Add Job
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                  <BriefcaseIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <button onClick={() => openEdit(job)} className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-base text-left transition-colors">
                    {job.title}
                  </button>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Vacancies: {job.vacancies || 'N/A'} | Location: {job.location || 'N/A'}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { if (window.confirm('Delete this job?')) deleteMutation.mutate(job.id); }}
                  className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {(!jobs || jobs.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400 text-sm font-semibold">No jobs found under this visa scheme.</div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Visa Job" onClose={() => setShowAddModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Job Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mason / Carpenter"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Vacancies</label>
                <input type="number" value={vacancies} onChange={(e) => setVacancies(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={addMutation.isPending || !title}
              onClick={() => addMutation.mutate({ title, vacancies, location })}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {addMutation.isPending ? 'Saving…' : 'Add'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal title={`Edit — ${editItem.title}`} onClose={() => setEditItem(null)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Job Title *</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Vacancies</label>
                <input type="number" value={editVacancies} onChange={(e) => setEditVacancies(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold">
            <button onClick={() => setEditItem(null)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={editMutation.isPending || !editTitle}
              onClick={() => editMutation.mutate({ id: editItem.id, data: { title: editTitle, vacancies: editVacancies, location: editLocation } })}
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

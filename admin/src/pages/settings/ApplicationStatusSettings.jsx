import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/client';

export default function ApplicationStatusSettings() {
  const queryClient = useQueryClient();
  const [statuses, setStatuses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    is_default: false,
    is_final: false,
  });

  const { data: fetchedStatuses, isLoading } = useQuery({
    queryKey: ['settings-application-statuses'],
    queryFn: () => api.get('/application-statuses/').then(r => r.data.results ?? r.data),
  });

  useEffect(() => {
    if (fetchedStatuses) {
      const sorted = [...fetchedStatuses].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      setStatuses(sorted);
    }
  }, [fetchedStatuses]);

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: (orderedIds) => api.post('/application-statuses/reorder/', { order: orderedIds }),
    onSuccess: () => {
      toast.success('Status sequence updated!');
      queryClient.invalidateQueries(['settings-application-statuses']);
      queryClient.invalidateQueries(['application-statuses']);
    },
    onError: () => toast.error('Failed to update status sequence'),
  });

  // Save (Create/Update) mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingStatus) {
        return api.put(`/application-statuses/${editingStatus.id}/`, data);
      }
      return api.post('/application-statuses/', { ...data, display_order: statuses.length + 1 });
    },
    onSuccess: () => {
      toast.success(editingStatus ? 'Status updated' : 'Status created');
      queryClient.invalidateQueries(['settings-application-statuses']);
      queryClient.invalidateQueries(['application-statuses']);
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.name?.[0] || 'Failed to save status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/application-statuses/${id}/`),
    onSuccess: () => {
      toast.success('Status deleted');
      queryClient.invalidateQueries(['settings-application-statuses']);
      queryClient.invalidateQueries(['application-statuses']);
    },
    onError: () => toast.error('Failed to delete status'),
  });

  const moveStatus = (index, direction) => {
    const newStatuses = [...statuses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStatuses.length) return;

    // Swap elements
    const temp = newStatuses[index];
    newStatuses[index] = newStatuses[targetIndex];
    newStatuses[targetIndex] = temp;

    setStatuses(newStatuses);
    const orderedIds = newStatuses.map(s => s.id);
    reorderMutation.mutate(orderedIds);
  };

  const openCreateModal = () => {
    setEditingStatus(null);
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      is_default: false,
      is_final: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (status) => {
    setEditingStatus(status);
    setFormData({
      name: status.name || '',
      description: status.description || '',
      color: status.color || '#3b82f6',
      is_default: status.is_default || false,
      is_final: status.is_final || false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStatus(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <SparklesIcon className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Application Status Workflow</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Define and reorder status stages. Updating an applicant's status will strictly follow this serial sequence step-by-step.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
        >
          <PlusIcon className="w-5 h-5" /> Add New Status
        </button>
      </div>

      {/* Sequential Flow Visual Preview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
        <div className="flex items-center gap-2 mb-3">
          <LockClosedIcon className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">Enforced Sequential Flow</h3>
        </div>
        <p className="text-xs text-slate-300 mb-4 max-w-2xl">
          Applicants advance sequentially through these ordered stages (Serial #1 → #2 → #3...). Skipped steps are restricted.
        </p>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statuses.map((st, idx) => (
            <div key={st.id} className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold whitespace-nowrap text-white">{st.name}</span>
                {st.is_default && <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/40 text-blue-200 rounded font-bold">Initial</span>}
                {st.is_final && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/40 text-emerald-200 rounded font-bold">Final</span>}
              </div>
              {idx < statuses.length - 1 && (
                <span className="text-slate-500 font-bold text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Statuses Serial Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Status Serial Sequence ({statuses.length})</h3>
          <span className="text-xs text-slate-400 font-medium">Use Up/Down arrows to reorder serial sequence</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-500">Loading status list...</p>
          </div>
        ) : statuses.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-sm font-bold text-slate-500">No application statuses created yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {statuses.map((st, idx) => (
              <motion.div
                key={st.id}
                layout
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Reorder Buttons & Serial Number */}
                  <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <button
                      onClick={() => moveStatus(idx, 'up')}
                      disabled={idx === 0 || reorderMutation.isPending}
                      className="p-1 hover:bg-white rounded-lg text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Move Up in Serial"
                    >
                      <ChevronUpIcon className="w-4 h-4 stroke-[3]" />
                    </button>
                    <span className="font-black text-sm text-slate-800 px-2 min-w-[24px] text-center">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => moveStatus(idx, 'down')}
                      disabled={idx === statuses.length - 1 || reorderMutation.isPending}
                      className="p-1 hover:bg-white rounded-lg text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Move Down in Serial"
                    >
                      <ChevronDownIcon className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                  {/* Status Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-800 truncate">{st.name}</h4>
                      {st.is_default && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-700 rounded-md">
                          Initial Status
                        </span>
                      )}
                      {st.is_final && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-md">
                          Final Stage
                        </span>
                      )}
                    </div>
                    {st.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{st.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(st)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit Status"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete status "${st.name}"?`)) {
                        deleteMutation.mutate(st.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Status"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT STATUS MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingStatus ? 'Edit Application Status' : 'Add New Application Status'}
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="e.g., Documents Pending"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                    placeholder="Short description of this stage..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Is Initial Default?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.is_final}
                      onChange={(e) => setFormData({ ...formData, is_final: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Is Final Stage?</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    {saveMutation.isPending ? 'Saving...' : 'Save Status'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

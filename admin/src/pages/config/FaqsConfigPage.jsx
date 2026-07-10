import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
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

export default function FaqsConfigPage() {
  const queryClient = useQueryClient();
  const [selectedVisaId, setSelectedVisaId] = useState('');

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Edit modal state
  const [editItem, setEditItem] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // Fetch all visas
  const { data: visas } = useQuery({
    queryKey: ['config-visas-dropdown-faqs'],
    queryFn: () => api.get('/visas/').then((r) => {
      const results = r.data.results ?? r.data;
      if (results?.length > 0 && !selectedVisaId) setSelectedVisaId(results[0].id);
      return results;
    }),
    staleTime: 1000 * 60 * 10,
  });

  // Fetch FAQs for the selected visa
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['config-visa-faqs', selectedVisaId],
    queryFn: () => {
      if (!selectedVisaId) return [];
      return api.get(`/visas/${selectedVisaId}/faqs/`).then((r) => r.data.results ?? r.data);
    },
    enabled: !!selectedVisaId,
    staleTime: 1000 * 60 * 5,
  });

  const addMutation = useMutation({
    mutationFn: (newFaq) => api.post(`/visas/${selectedVisaId}/faqs/`, newFaq),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-visa-faqs', selectedVisaId]);
      setShowAddModal(false);
      setQuestion(''); setAnswer('');
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/visas/${selectedVisaId}/faqs/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-visa-faqs', selectedVisaId]);
      setEditItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/visas/${selectedVisaId}/faqs/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['config-visa-faqs', selectedVisaId]),
  });

  const openEdit = (faq) => {
    setEditItem(faq);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Visa FAQs</h2>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">Configure frequently asked questions for visas</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
            Add FAQ
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs?.map((faq) => (
            <div key={faq.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <button onClick={() => openEdit(faq)} className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-sm text-left transition-colors">
                    {faq.question}
                  </button>
                  <p className="text-slate-500 text-xs leading-relaxed">{faq.answer}</p>
                </div>
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => { if (window.confirm('Delete this FAQ?')) deleteMutation.mutate(faq.id); }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-semibold"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Delete FAQ
                </button>
              </div>
            </div>
          ))}
          {(!faqs || faqs.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400 text-sm font-semibold">No FAQs configured under this visa scheme.</div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Visa FAQ" onClose={() => setShowAddModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Question *</label>
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What documents are required?"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Answer *</label>
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide detailed answer..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-28" />
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={addMutation.isPending || !question || !answer}
              onClick={() => addMutation.mutate({ question, answer })}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {addMutation.isPending ? 'Saving…' : 'Add'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal title="Edit Visa FAQ" onClose={() => setEditItem(null)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Question *</label>
              <input type="text" value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Answer *</label>
              <textarea value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-28" />
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold">
            <button onClick={() => setEditItem(null)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={editMutation.isPending || !editQuestion || !editAnswer}
              onClick={() => editMutation.mutate({ id: editItem.id, data: { question: editQuestion, answer: editAnswer } })}
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

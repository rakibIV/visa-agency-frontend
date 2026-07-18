import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, 
  ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon, DocumentTextIcon 
} from '@heroicons/react/24/outline';
import api from '../../api/client';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AgreementTemplatesConfig() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('list'); // 'list' | 'form'
  const [currentTemplate, setCurrentTemplate] = useState(null);
  
  // Template Form State
  const [templateName, setTemplateName] = useState('');
  const [templateDetails, setTemplateDetails] = useState('');
  const [templateSequence, setTemplateSequence] = useState(1);
  const [clauses, setClauses] = useState([]);
  
  // Clause Modal State
  const [showClauseModal, setShowClauseModal] = useState(false);
  const [clauseTab, setClauseTab] = useState('en'); // 'en', 'ar', 'bn', 'rules'
  const [editingClauseIndex, setEditingClauseIndex] = useState(null); // index or 'new'
  const [clauseForm, setClauseForm] = useState(getEmptyClause());

  const { data: templates, isLoading } = useQuery({
    queryKey: ['agreement-templates'],
    queryFn: () => api.get('/agreement-templates/').then((r) => r.data.results ?? r.data),
  });

  const { data: countries } = useQuery({
    queryKey: ['config-countries'],
    queryFn: () => api.get('/countries/').then((r) => r.data.results ?? r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (currentTemplate?.id) {
        return api.patch(`/agreement-templates/${currentTemplate.id}/`, data);
      }
      return api.post('/agreement-templates/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agreement-templates']);
      setActiveView('list');
    },
    onError: (err) => {
      alert("Error saving template: " + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/agreement-templates/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['agreement-templates'])
  });

  function getEmptyClause() {
    return {
      clause_number: 1,
      title_en: '', title_ar: '', title_bn: '',
      body_en: '', body_ar: '', body_bn: '',
      visibility_mode: 'INCLUDE',
      countries: []
    };
  }

  const handleEditTemplate = (tmpl) => {
    setCurrentTemplate(tmpl);
    setTemplateName(tmpl.name || '');
    setTemplateDetails(tmpl.details || '');
    setTemplateSequence(tmpl.sequence || 1);
    // Sort clauses by number
    const sortedClauses = [...(tmpl.clauses || [])].sort((a, b) => a.clause_number - b.clause_number);
    setClauses(sortedClauses);
    setActiveView('form');
  };

  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setTemplateName('');
    setTemplateDetails('');
    setTemplateSequence(1);
    setClauses([]);
    setActiveView('form');
  };

  const handleSaveTemplate = () => {
    saveMutation.mutate({
      name: templateName,
      details: templateDetails,
      sequence: parseInt(templateSequence, 10) || 1,
      clauses: clauses.map((c, i) => ({ ...c, clause_number: i + 1 })) // Auto-number based on order
    });
  };

  const openClauseModal = (index = 'new') => {
    setEditingClauseIndex(index);
    if (index === 'new') {
      setClauseForm({ ...getEmptyClause(), clause_number: clauses.length + 1 });
    } else {
      setClauseForm({ ...clauses[index] });
    }
    setShowClauseModal(true);
  };

  const saveClause = () => {
    const updatedClauses = [...clauses];
    if (editingClauseIndex === 'new') {
      updatedClauses.push(clauseForm);
    } else {
      updatedClauses[editingClauseIndex] = clauseForm;
    }
    setClauses(updatedClauses);
    setShowClauseModal(false);
  };

  const deleteClause = (index) => {
    if (confirm('Remove this clause?')) {
      const updated = [...clauses];
      updated.splice(index, 1);
      setClauses(updated);
    }
  };

  const moveClause = (index, direction) => {
    const updated = [...clauses];
    if (direction === 'up' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'down' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setClauses(updated);
  };

  const toggleCountry = (countryId) => {
    setClauseForm(prev => {
      const exists = prev.countries?.includes(countryId);
      const newCountries = exists 
        ? prev.countries.filter(id => id !== countryId)
        : [...(prev.countries || []), countryId];
      return { ...prev, countries: newCountries };
    });
  };

  if (activeView === 'form') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveView('list')}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">
              {currentTemplate ? 'Edit Template' : 'New Template'}
            </h2>
          </div>
          <button 
            onClick={handleSaveTemplate}
            disabled={saveMutation.isPending}
            className="px-6 py-2 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition shadow-sm disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Template'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Agreement Name</label>
            <input 
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Saudi Standard Agreement"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sequence / Order</label>
            <input 
              type="number"
              min="1"
              value={templateSequence}
              onChange={(e) => setTemplateSequence(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Details / Description</label>
            <textarea 
              value={templateDetails}
              onChange={(e) => setTemplateDetails(e.target.value)}
              placeholder="Brief description of when to use this template..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-20"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-800">Clauses ({clauses.length})</h3>
            <button 
              onClick={() => openClauseModal('new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition"
            >
              <PlusIcon className="w-4 h-4" /> Add Clause
            </button>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-relaxed">
            <strong className="font-bold">💡 Dynamic Variables:</strong> Use <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{application_id}'}</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{full_name}'}</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{passport_number}'}</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{visa}'}</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{job}'}</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{country}'}</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{staff}'}</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{payment}'}</code> in the clause text to automatically insert applicant data when generating the PDF.
          </div>
        </div>

        <div className="space-y-3">
          {clauses.map((clause, idx) => (
            <div key={idx} className="flex gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 bg-white transition group items-start">
              <div className="flex flex-col gap-1 items-center justify-center shrink-0">
                <button onClick={() => moveClause(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-30"><ChevronUpIcon className="w-5 h-5"/></button>
                <span className="font-bold text-slate-700">{idx + 1}</span>
                <button onClick={() => moveClause(idx, 'down')} disabled={idx === clauses.length - 1} className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-30"><ChevronDownIcon className="w-5 h-5"/></button>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 uppercase">{clause.title_en || 'Untitled Clause'}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 mt-1">{clause.body_en}</p>
                <div className="flex gap-2 mt-3">
                   {clause.visibility_mode === 'INCLUDE' && clause.countries?.length > 0 && (
                     <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">Includes specific countries</span>
                   )}
                   {clause.visibility_mode === 'EXCLUDE' && clause.countries?.length > 0 && (
                     <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">Excludes specific countries</span>
                   )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openClauseModal(idx)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button onClick={() => deleteClause(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {clauses.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-500 font-medium">No clauses added yet.</p>
            </div>
          )}
        </div>

        {/* Clause Edit Modal */}
        {showClauseModal && (
          <Modal title={editingClauseIndex === 'new' ? 'Add Clause' : 'Edit Clause'} onClose={() => setShowClauseModal(false)}>
            
            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 mb-6 gap-2">
              {[
                { id: 'en', label: '🇬🇧 English' },
                { id: 'ar', label: '🇸🇦 Arabic' },
                { id: 'bn', label: '🇧🇩 Bengali' },
                { id: 'rules', label: '⚙️ Rules' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setClauseTab(tab.id)}
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${
                    clauseTab === tab.id 
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              
              {/* English Section */}
              {clauseTab === 'en' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Clause Title</label>
                    <input type="text" value={clauseForm.title_en || ''} onChange={e => setClauseForm({...clauseForm, title_en: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="e.g. Working Hours" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Clause Body</label>
                    <textarea value={clauseForm.body_en || ''} onChange={e => setClauseForm({...clauseForm, body_en: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="Detailed clause content..." />
                    <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">💡 You can use <code className="bg-white px-1 border border-slate-200 rounded text-blue-600 font-bold">{"{application_id}"}</code>, <code className="bg-white px-1 border border-slate-200 rounded text-blue-600 font-bold">{"{full_name}"}</code>, <code className="bg-white px-1 border border-slate-200 rounded text-blue-600 font-bold">{"{passport_number}"}</code>, <code className="bg-white px-1 border border-slate-200 rounded text-blue-600 font-bold">{"{visa}"}</code>, <code className="bg-white px-1 border border-slate-200 rounded text-blue-600 font-bold">{"{job}"}</code>, <code className="bg-white px-1 border border-slate-200 rounded text-blue-600 font-bold">{"{country}"}</code>, <code className="bg-white px-1 border border-slate-200 rounded text-blue-600 font-bold">{"{staff}"}</code>, <code className="bg-white px-1 border border-slate-200 rounded text-blue-600 font-bold">{"{payment}"}</code> to dynamically insert applicant data.</p>
                  </div>
                </div>
              )}

              {/* Arabic Section */}
              {clauseTab === 'ar' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Clause Title (Arabic)</label>
                    <input type="text" dir="rtl" value={clauseForm.title_ar || ''} onChange={e => setClauseForm({...clauseForm, title_ar: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-sans" placeholder="عنوان البند" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Clause Body (Arabic)</label>
                    <textarea dir="rtl" value={clauseForm.body_ar || ''} onChange={e => setClauseForm({...clauseForm, body_ar: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans" placeholder="نص البند هنا..." />
                  </div>
                </div>
              )}

              {/* Bengali Section */}
              {clauseTab === 'bn' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Clause Title (Bengali)</label>
                    <input type="text" value={clauseForm.title_bn || ''} onChange={e => setClauseForm({...clauseForm, title_bn: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="ধারার শিরোনাম" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Clause Body (Bengali)</label>
                    <textarea value={clauseForm.body_bn || ''} onChange={e => setClauseForm({...clauseForm, body_bn: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="ধারার বিস্তারিত..." />
                  </div>
                </div>
              )}

              {/* Visibility & Logic */}
              {clauseTab === 'rules' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Visibility Mode</label>
                    <select 
                      value={clauseForm.visibility_mode || 'INCLUDE'} 
                      onChange={e => setClauseForm({...clauseForm, visibility_mode: e.target.value})}
                      className="w-full px-4 py-2.5 border border-blue-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 bg-white"
                    >
                      <option value="INCLUDE">✅ Always Include (or Include Only for Selected)</option>
                      <option value="EXCLUDE">🚫 Exclude for Selected Countries</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Target Countries</label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      {countries?.map(c => (
                        <label key={c.id} className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                          clauseForm.countries?.includes(c.id) 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}>
                          <input 
                            type="checkbox" 
                            checked={clauseForm.countries?.includes(c.id) || false}
                            onChange={() => toggleCountry(c.id)}
                            className="hidden"
                          />
                          {c.name}
                        </label>
                      ))}
                      {(!countries || countries.length === 0) && (
                        <span className="text-sm text-slate-400 p-2">No countries configured in the system.</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong>How it works:</strong> If you select <em>Always Include</em> and choose no countries, this clause shows for everyone. If you choose countries, it will <strong>only</strong> show for applicants going to those countries.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button onClick={() => setShowClauseModal(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                <button onClick={saveClause} className="px-6 py-2.5 font-bold bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 rounded-xl transition-all">Save Clause</button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    );
  }

  // List View
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={handleCreateTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition shadow-sm"
        >
          <PlusIcon className="w-5 h-5" /> Create Template
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading templates...</div>
      ) : templates?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
           <DocumentTextIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-slate-700">No Templates Found</h3>
           <p className="text-sm text-slate-500 mt-1">Create your first agreement template to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((tmpl) => (
            <div key={tmpl.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 transition-colors group relative flex flex-col">
              <div className="flex-1">
                <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-3 border border-blue-100">
                  Sequence: {tmpl.sequence || 1}
                </span>
                <h3 className="font-bold text-slate-800 text-lg mb-1">
                  {tmpl.name || `Agreement ${tmpl.sequence || 1}`}
                </h3>
                <p className="text-sm text-slate-500 mb-2">{tmpl.details}</p>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" /> {tmpl.clauses?.length || 0} Clauses
                </p>
              </div>
              
              <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleEditTemplate(tmpl)}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this template?')) {
                      deleteMutation.mutate(tmpl.id);
                    }
                  }}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  title="Delete Template"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

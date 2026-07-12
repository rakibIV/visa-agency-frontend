import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, BriefcaseIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function JobsConfigPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedVisaId, setSelectedVisaId] = useState('');

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

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/visas/${selectedVisaId}/jobs/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['config-visa-jobs', selectedVisaId]),
  });

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Visa Jobs</h2>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">Configure job profiles under each visa scheme</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedVisaId}
            onChange={(e) => setSelectedVisaId(e.target.value)}
            className="flex-1 sm:w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {visas?.map(v => (
              <option key={v.id} value={v.id}>{v.country?.name} - {v.name}</option>
            ))}
          </select>
          <button
            onClick={() => navigate(`/config/visas/${selectedVisaId}/jobs/new`)}
            disabled={!selectedVisaId}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 hover:shadow-md transition-all">
              <div>
                <div className="flex items-start justify-between gap-4, mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <BriefcaseIcon className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/config/visas/${selectedVisaId}/jobs/${job.id}/edit`)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { if (window.confirm('Delete this job?')) deleteMutation.mutate(job.id); }}
                      className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button onClick={() => navigate(`/config/visas/${selectedVisaId}/jobs/${job.id}`)} className="text-lg font-bold text-slate-800 text-left hover:text-blue-700 hover:underline mb-1 block">
                  {job.title}
                </button>

                {job.location && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium mb-3">
                    <MapPinIcon className="w-4 h-4" />
                    {job.location}
                  </div>
                )}
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-medium">Salary</span>
                    <span className="font-semibold text-slate-700">
                      {job.minimum_salary ? `${job.minimum_salary} ${job.currency}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-medium">Vacancies</span>
                    <span className="font-semibold text-slate-700">{job.vacancies || 'Open'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Experience</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[120px]">{job.experience_required || 'Any'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!jobs || jobs.length === 0) && (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-slate-400">
              <BriefcaseIcon className="w-12 h-12 mb-3 text-slate-200" />
              <p className="text-sm font-semibold">No jobs found for this visa.</p>
              <p className="text-xs mt-1">Click "Add Job" to create one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

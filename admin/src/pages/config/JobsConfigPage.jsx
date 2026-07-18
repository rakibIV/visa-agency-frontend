import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  TrashIcon, 
  BriefcaseIcon, 
  MapPinIcon, 
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function JobsConfigPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedVisaId, setSelectedVisaId] = useState('');
  const [search, setSearch] = useState('');

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
    queryKey: ['config-visa-jobs', selectedVisaId, search],
    queryFn: () => {
      if (!selectedVisaId) return [];
      return api.get(`/visas/${selectedVisaId}/jobs/`, { params: search ? { search } : {} }).then((r) => r.data.results ?? r.data);
    },
    enabled: !!selectedVisaId,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/visas/${selectedVisaId}/jobs/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['config-visa-jobs', selectedVisaId]),
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header & Controls Section */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <BriefcaseIcon className="w-48 h-48 text-blue-900" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Visa Jobs</h2>
          <p className="text-slate-500 font-medium mt-1">Manage and configure job profiles for visa schemes</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto relative z-10">
          <div className="relative group flex-1 sm:w-64">
            <select
              value={selectedVisaId}
              onChange={(e) => setSelectedVisaId(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors appearance-none cursor-pointer"
            >
              <option value="" disabled>Select a Visa Scheme</option>
              {visas?.map(v => (
                <option key={v.id} value={v.id}>{v.country?.name} - {v.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          
          <button
            onClick={() => navigate(`/config/visas/${selectedVisaId}/jobs/new`)}
            disabled={!selectedVisaId}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Job
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-2 max-w-2xl">
        <div className="relative flex items-center">
          <div className="absolute left-4 p-2 bg-blue-50 text-blue-600 rounded-lg">
            <MagnifyingGlassIcon className="w-4 h-4 font-bold" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job titles, locations..."
            className="w-full pl-14 pr-6 py-4 bg-transparent text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading jobs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jobs?.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden"
            >
              {/* Card Header Pattern */}
              <div className="h-24 bg-slate-50 w-full absolute top-0 left-0 border-b border-slate-100/50"></div>
              
              <div className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <BriefcaseIcon className="w-6 h-6" />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-slate-100 shadow-sm">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/config/visas/${selectedVisaId}/jobs/${job.id}/edit`); }}
                      className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                      title="Edit Job"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (window.confirm(`Are you sure you want to delete ${job.title}?`)) deleteMutation.mutate(job.id); 
                      }}
                      className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                      title="Delete Job"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex-grow">
                  <button 
                    onClick={() => navigate(`/config/visas/${selectedVisaId}/jobs/${job.id}`)} 
                    className="text-lg font-bold text-slate-800 text-left hover:text-blue-600 transition-colors line-clamp-2 leading-tight"
                  >
                    {job.title}
                  </button>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{job.location || 'Location not specified'}</span>
                  </div>
                </div>
                
                {/* Stats Section */}
                <div className="pt-4 mt-auto border-t border-slate-100/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CurrencyDollarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Salary</p>
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {job.minimum_salary ? `${job.minimum_salary} ${job.currency}` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                      <UserGroupIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vacancies</p>
                      <p className="text-xs font-semibold text-slate-700">
                        {job.vacancies ? `${job.vacancies} Openings` : 'Open'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* View Details Button (appears on hover) */}
                <button 
                  onClick={() => navigate(`/config/visas/${selectedVisaId}/jobs/${job.id}`)}
                  className="mt-4 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors opacity-0 group-hover:opacity-100 hidden sm:block"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}

          {(!jobs || jobs.length === 0) && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-100 border-dashed">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <BriefcaseIcon className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">No Jobs Found</h3>
              <p className="text-slate-500 font-medium text-center max-w-sm">
                {search ? "No jobs match your search criteria." : "There are currently no job profiles configured for this visa scheme."}
              </p>
              {!search && selectedVisaId && (
                <button
                  onClick={() => navigate(`/config/visas/${selectedVisaId}/jobs/new`)}
                  className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" /> Create First Job
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/client';
import CrudTable from '../../components/common/CrudTable';

function ManualStatsSettings() {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState({
    approved_count: 0,
    rejected_count: 0,
    processing_count: 0
  });

  const { data, isLoading } = useQuery({
    queryKey: ['manual-fake-stats'],
    queryFn: () => api.get('/fake-stats/').then(r => r.data).catch(() => ({
      approved_count: 0,
      rejected_count: 0,
      processing_count: 0
    }))
  });

  useEffect(() => {
    if (data) {
      setStats({
        approved_count: data.approved_count || 0,
        rejected_count: data.rejected_count || 0,
        processing_count: data.processing_count || 0
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (newStats) => api.post('/fake-stats/', newStats).catch(() => api.put('/fake-stats/', newStats)),
    onSuccess: () => {
      toast.success('Manual stats updated successfully');
      queryClient.invalidateQueries(['manual-fake-stats']);
    },
    onError: () => toast.error('Failed to update manual stats. The API endpoint might not exist yet.')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(stats);
  };

  const handleChange = (e) => {
    setStats({
      ...stats,
      [e.target.name]: parseInt(e.target.value) || 0
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">Manual Stat Inflation</h3>
        <p className="text-sm text-slate-500">
          Enter numbers below to artificially inflate the total lifetime counts shown on the dashboard and public results page. 
          These numbers will be added to the actual application counts and the fake entries below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Manual Approved
          </label>
          <input 
            type="number" 
            name="approved_count" 
            value={stats.approved_count} 
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Manual Rejected
          </label>
          <input 
            type="number" 
            name="rejected_count" 
            value={stats.rejected_count} 
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Manual Processing
          </label>
          <input 
            type="number" 
            name="processing_count" 
            value={stats.processing_count} 
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading || mutation.isPending}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save Counts'}
        </button>
      </form>
    </div>
  );
}

export default function FakeLiveResultsPage() {
  const [selectedVisaId, setSelectedVisaId] = useState('');

  const { data: visas } = useQuery({
    queryKey: ['visas-list'],
    queryFn: () => api.get('/visas/').then(r => r.data.results ?? r.data)
  });

  const { data: jobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ['jobs-for-visa', selectedVisaId],
    queryFn: () => api.get(`/visas/${selectedVisaId}/jobs/`).then(r => r.data.results ?? r.data),
    enabled: !!selectedVisaId,
  });

  const { data: countries } = useQuery({
    queryKey: ['countries-list'],
    queryFn: () => api.get('/countries/').then(r => r.data.results ?? r.data)
  });

  const { data: statuses } = useQuery({
    queryKey: ['statuses-list'],
    queryFn: () => api.get('/application-statuses/').then(r => r.data.results ?? r.data)
  });

  const visaOptions = visas?.map(v => ({ value: v.id, label: v.name })) || [];
  const countryOptions = countries?.map(c => ({ value: c.id, label: c.name })) || [];
  const statusOptions = statuses?.map(s => ({ value: s.id, label: s.name })) || [];

  const handleFormChange = (formData) => {
    const currentVisaId = formData?.visa || '';
    if (currentVisaId !== selectedVisaId) {
      setSelectedVisaId(currentVisaId);
    }
  };

  return (
    <>
      <ManualStatsSettings />
      <CrudTable
        title="Fake Live Results"
      subtitle="Manage fake entries for the public live visa results feed."
      endpoint="/fake-live-results/"
      queryKey="fake-live-results"
      onFormChange={handleFormChange}
      columns={[
        { header: 'Applicant Name', accessor: 'applicant_name' },
        { header: 'Application ID', accessor: 'application_id' },
        { header: 'Visa', accessor: 'visa_name' },
        { header: 'Job', accessor: 'job_name' },
        { header: 'Country', accessor: 'country_name' },
        { header: 'Status', accessor: 'status_name' },
        { 
          header: 'Result Date', 
          accessor: 'result_date',
          render: (item) => item.result_date ? String(item.result_date).split('T')[0] : 'N/A'
        },
      ]}
      formFields={[
        { name: 'application_id', label: 'Application ID', type: 'text', required: true },
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'passport_number', label: 'Passport Number', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'visa', label: 'Visa', type: 'select', options: visaOptions, required: true },
        { 
          name: 'job', 
          label: 'Job', 
          type: 'select', 
          required: true,
          disabled: (formData) => !formData?.visa,
          placeholder: !selectedVisaId ? 'Select Visa First' : isJobsLoading ? 'Loading jobs...' : 'Select Job',
          options: () => jobs?.map(j => ({ value: j.id, label: j.title })) || []
        },
        { name: 'country', label: 'Country', type: 'select', options: countryOptions, required: true },
        { name: 'status', label: 'Status', type: 'select', options: statusOptions, required: true },
        { name: 'photo', label: 'Applicant Photo', type: 'file', accept: 'image/*' },
        { name: 'result_date', label: 'Result Date', type: 'date', required: true },
      ]}
    />
    </>
  );
}


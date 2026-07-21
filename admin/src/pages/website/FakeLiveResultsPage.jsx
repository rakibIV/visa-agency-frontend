import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import CrudTable from '../../components/common/CrudTable';

export default function FakeLiveResultsPage() {
  const { data: visas } = useQuery({
    queryKey: ['visas-list'],
    queryFn: () => api.get('/visas/').then(r => r.data.results ?? r.data)
  });
  const { data: jobs } = useQuery({
    queryKey: ['jobs-list'],
    queryFn: () => api.get('/jobs/').then(r => r.data.results ?? r.data)
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
  const jobOptions = jobs?.map(j => ({ value: j.id, label: j.title })) || [];
  const countryOptions = countries?.map(c => ({ value: c.id, label: c.name })) || [];
  const statusOptions = statuses?.map(s => ({ value: s.id, label: s.name })) || [];

  return (
    <CrudTable
      title="Fake Live Results"
      subtitle="Manage fake entries for the public live visa results feed."
      endpoint="/fake-live-results/"
      queryKey="fake-live-results"
      columns={[
        { header: 'Applicant Name', accessor: 'applicant_name' },
        { header: 'Application ID', accessor: 'application_id' },
        { header: 'Visa', accessor: 'visa_name' },
        { header: 'Status', accessor: 'status_name' },
      ]}
      formFields={[
        { name: 'application_id', label: 'Application ID', type: 'text', required: true },
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'passport_number', label: 'Passport Number', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'visa', label: 'Visa', type: 'select', options: visaOptions, required: true },
        { name: 'job', label: 'Job', type: 'select', options: jobOptions, required: true },
        { name: 'country', label: 'Country', type: 'select', options: countryOptions, required: true },
        { name: 'status', label: 'Status', type: 'select', options: statusOptions, required: true },
        { name: 'photo', label: 'Applicant Photo', type: 'file', accept: 'image/*' },
        { name: 'result_date', label: 'Result Date', type: 'date', required: true },
      ]}
    />
  );
}

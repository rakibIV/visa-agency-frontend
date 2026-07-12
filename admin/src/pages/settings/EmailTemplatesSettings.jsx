import { useQuery } from '@tanstack/react-query';
import CrudTable from '../../components/common/CrudTable';
import api from '../../api/client';

export default function EmailTemplatesSettings() {
  const { data: statuses, isLoading } = useQuery({
    queryKey: ['settings-statuses-list'],
    queryFn: () => api.get('/application-statuses/').then(r => r.data.results ?? r.data),
  });

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading configurations...</div>;
  }

  const statusOptions = (statuses || []).map((s) => ({
    label: s.name,
    value: s.id,
  }));

  return (
    <CrudTable
      title="Email Templates"
      subtitle="Manage automated email templates linked to application statuses."
      endpoint="/email-templates/"
      queryKey="settings-email-templates"
      columns={[
        { header: 'Template Name', accessor: 'name' },
        { header: 'Linked Status', accessor: 'status_name' },
        { header: 'Subject', accessor: 'subject' },
        { 
          header: 'Active', 
          accessor: 'is_active',
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          )
        }
      ]}
      formFields={[
        { name: 'name', label: 'Template Name', type: 'text', required: true },
        { name: 'status', label: 'Linked Status (Triggers Email)', type: 'select', required: false, options: statusOptions },
        { name: 'subject', label: 'Email Subject', type: 'text', required: true },
        { name: 'body', label: 'Email Body (Text)', type: 'textarea', required: true, rows: 6 },
        { name: 'is_active', label: 'Active Template', type: 'checkbox' },
      ]}
    />
  );
}

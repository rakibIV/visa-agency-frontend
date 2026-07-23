import { useQuery } from '@tanstack/react-query';
import CrudTable from '../../components/common/CrudTable';
import api from '../../api/client';

export default function LawyersSettings() {
  const { data: countries, isLoading } = useQuery({
    queryKey: ['settings-countries-list'],
    queryFn: () => api.get('/countries/').then(r => r.data.results ?? r.data),
  });

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading configurations...</div>;
  }

  const countryOptions = (countries || []).map((c) => ({
    label: c.name,
    value: c.id,
  }));

  return (
    <CrudTable
      title="Lawyers"
      subtitle="Manage internal lawyers and their API environments."
      endpoint="/lawyers/"
      queryKey="settings-lawyers"
      columns={[
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Address', accessor: 'address' },
        { header: 'Country', accessor: 'country_name' },
        { 
          header: 'Status', 
          accessor: 'is_active',
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          )
        }
      ]}
      formFields={[
        { name: 'name', label: 'Lawyer Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'address', label: 'Office Address', type: 'textarea', required: false, rows: 2 },
        { name: 'country', label: 'Country', type: 'select', required: false, options: countryOptions },
        { name: 'smtp_password', label: 'SMTP App Password', type: 'password', required: false },
        { name: 'is_default', label: 'Is Default Lawyer', type: 'checkbox' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}

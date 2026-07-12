import CrudTable from '../../components/common/CrudTable';

export default function AgencyServicesPage() {
  return (
    <CrudTable
      title="Agency Services"
      subtitle="Manage the services displayed on the public website."
      endpoint="/agency-services/"
      queryKey="website-agency-services"
      columns={[
        { header: 'Title', accessor: 'title' },
        { header: 'Order', accessor: 'display_order' },
        { 
          header: 'Featured', 
          accessor: 'is_featured', 
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_featured ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {item.is_featured ? 'Yes' : 'No'}
            </span>
          )
        },
      ]}
      formFields={[
        { name: 'title', label: 'Service Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'icon', label: 'Icon (URL or Class)', type: 'text' },
        { name: 'is_featured', label: 'Featured', type: 'checkbox' },
        { name: 'display_order', label: 'Display Order', type: 'number', step: "1" },
      ]}
    />
  );
}

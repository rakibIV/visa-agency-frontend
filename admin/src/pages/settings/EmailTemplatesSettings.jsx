import CrudTable from '../../components/common/CrudTable';

export default function EmailTemplatesSettings() {
  return (
    <CrudTable
      title="Email Templates"
      subtitle="Manage manual and automated email templates."
      endpoint="/email-templates/"
      queryKey="settings-email-templates"
      columns={[
        { header: 'Template Name', accessor: 'name' },
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
        { name: 'subject', label: 'Email Subject', type: 'text', required: true },
        { 
          name: 'body', 
          label: 'Email Body (Text)', 
          type: 'textarea', 
          required: true, 
          rows: 6,
          helpText: 'Available Variables:\n{{ applicant_name }}, {{ applicant_id }}, {{ passport_number }}, {{ visa }}, {{ country }}, {{ staff }}, {{ current_status }}'
        },
        { name: 'is_active', label: 'Active Template', type: 'checkbox' },
      ]}
    />
  );
}

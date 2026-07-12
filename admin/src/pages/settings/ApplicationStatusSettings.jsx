import CrudTable from '../../components/common/CrudTable';

export default function ApplicationStatusSettings() {
  return (
    <CrudTable
      title="Application Statuses"
      subtitle="Manage the workflow stages for visa applications."
      endpoint="/application-statuses/"
      queryKey="settings-application-statuses"
      columns={[
        { header: 'Name', accessor: 'name' },
        { header: 'Default', render: (item) => item.is_default ? 'Yes' : 'No' },
        { header: 'Final', render: (item) => item.is_final ? 'Yes' : 'No' },
        { header: 'Order', accessor: 'display_order' },
      ]}
      formFields={[
        { name: 'name', label: 'Status Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'color', label: 'Badge Color (Hex/Tailwind)', type: 'text' },
        { name: 'is_default', label: 'Is Default Status?', type: 'checkbox' },
        { name: 'is_final', label: 'Is Final Status?', type: 'checkbox' },
        { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
      ]}
    />
  );
}

import CrudTable from '../../components/common/CrudTable';

export default function OfficesSettings() {
  return (
    <CrudTable
      title="Offices & Branches"
      subtitle="Manage all physical branch locations of the agency."
      endpoint="/branches/"
      queryKey="settings-branches"
      columns={[
        { header: 'Branch Name', accessor: 'branch_name' },
        { header: 'Head Office', render: (item) => item.is_head_office ? 'Yes' : 'No' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Email', accessor: 'email' },
        { header: 'Order', accessor: 'display_order' },
      ]}
      formFields={[
        { name: 'branch_name', label: 'Branch Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email' },
        { name: 'phone', label: 'Phone Number', type: 'text' },
        { name: 'address', label: 'Physical Address', type: 'textarea', required: true },
        { name: 'office_hours', label: 'Office Hours', type: 'text' },
        { name: 'is_head_office', label: 'Is Head Office?', type: 'checkbox' },
        { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
        // Ideally we would fetch companies for a dropdown, but assuming there's only 1 company for now, 
        // we can either hardcode it or the backend handles it via default. We'll add company ID if needed, 
        // but backend might require it if it's not a NestedRouter.
        { name: 'company', label: 'Company ID', type: 'number', required: true },
      ]}
    />
  );
}

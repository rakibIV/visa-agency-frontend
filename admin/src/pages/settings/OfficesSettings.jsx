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
      ]}
      formFields={[
        { name: 'branch_name', label: 'Branch Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email' },
        { name: 'phone', label: 'Phone Number', type: 'text' },
        { name: 'address', label: 'Physical Address', type: 'textarea', required: true },
        { name: 'office_hours', label: 'Office Hours', type: 'text' },
        { name: 'is_head_office', label: 'Is Head Office?', type: 'checkbox' },
      ]}
    />
  );
}

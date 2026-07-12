import CrudTable from '../../components/common/CrudTable';

export default function DesignationsSettings() {
  return (
    <CrudTable
      title="Staff Designations"
      subtitle="Manage job titles and designations for staff members."
      endpoint="/designations/"
      queryKey="settings-designations"
      columns={[
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
      ]}
      formFields={[
        { name: 'name', label: 'Designation Name', type: 'text', required: true },
      ]}
    />
  );
}

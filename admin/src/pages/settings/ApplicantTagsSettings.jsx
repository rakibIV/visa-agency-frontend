import CrudTable from '../../components/common/CrudTable';

export default function ApplicantTagsSettings() {
  return (
    <CrudTable
      title="Applicant Tags"
      subtitle="Manage tags and labels that can be assigned to applicants."
      endpoint="/applicant-tags/"
      queryKey="settings-applicant-tags"
      columns={[
        { header: 'Name', accessor: 'name' },
        { header: 'Color', accessor: 'color' },
      ]}
      formFields={[
        { name: 'name', label: 'Tag Name', type: 'text', required: true },
        { name: 'color', label: 'Color (Hex)', type: 'text' },
      ]}
    />
  );
}

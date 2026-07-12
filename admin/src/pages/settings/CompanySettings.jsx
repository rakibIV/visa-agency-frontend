import CrudTable from '../../components/common/CrudTable';

export default function CompanySettings() {
  // We use CrudTable because it handles the API endpoints. 
  // Typically, there is only one company, but we list them all just in case.
  return (
    <CrudTable
      title="Company Information"
      subtitle="Manage global company information and branding."
      endpoint="/companies/"
      queryKey="settings-companies"
      columns={[
        { header: 'Company Name', accessor: 'company_name' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Email', accessor: 'email' },
      ]}
      formFields={[
        { name: 'company_name', label: 'Company Name', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'website', label: 'Website URL', type: 'text' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'about', label: 'About Us', type: 'textarea' },
        { name: 'mission', label: 'Mission', type: 'textarea' },
        { name: 'vision', label: 'Vision', type: 'textarea' },
      ]}
    />
  );
}

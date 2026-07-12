import CrudTable from '../../components/common/CrudTable';

export default function ContactMessagesPage() {
  return (
    <CrudTable
      title="Contact Messages"
      subtitle="View messages submitted via the website contact form."
      endpoint="/contact-us/"
      queryKey="website-contact-us"
      disableAdd={true}
      disableEdit={true}
      columns={[
        { header: 'Name', accessor: 'name' },
        { header: 'Subject', accessor: 'subject' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
      ]}
      formFields={[]}
    />
  );
}

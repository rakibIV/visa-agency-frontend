import CrudTable from '../../components/common/CrudTable';

export default function NoticesPage() {
  return (
    <CrudTable
      title="Notices & Announcements"
      subtitle="Manage public notices displayed to visitors."
      endpoint="/notices/"
      queryKey="website-notices"
      columns={[
        { header: 'Title', accessor: 'title' },
        { 
          header: 'Pinned', 
          accessor: 'is_pinned', 
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_pinned ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
              {item.is_pinned ? 'Yes' : 'No'}
            </span>
          )
        },
        { 
          header: 'Active', 
          accessor: 'is_active', 
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          )
        },
        {
          header: 'Attachment',
          accessor: 'attachment',
          render: (item) => item.attachment ? (
            <a href={item.attachment} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              View
            </a>
          ) : <span className="text-slate-400">None</span>
        }
      ]}
      formFields={[
        { name: 'title', label: 'Notice Title', type: 'text', required: true },
        { name: 'content', label: 'Content', type: 'textarea', required: true, rows: 5 },
        { name: 'attachment', label: 'Attachment (PDF/Image)', type: 'file' },
        { name: 'is_pinned', label: 'Pin to Top', type: 'checkbox' },
        { name: 'is_active', label: 'Active (Visible)', type: 'checkbox' },
      ]}
    />
  );
}

import CrudTable from '../../components/common/CrudTable';

export default function VisaCategoriesConfigPage() {
  return (
    <CrudTable
      title="Visa Categories"
      subtitle="Manage global visa categories (e.g. Work Visa, Student Visa)."
      endpoint="/visa-categories/"
      queryKey="config-visa-categories"
      columns={[
        { header: 'Name', accessor: 'name' },
        { header: 'Slug', accessor: 'slug' },
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
        { name: 'name', label: 'Category Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'is_featured', label: 'Featured Category', type: 'checkbox' },
      ]}
    />
  );
}

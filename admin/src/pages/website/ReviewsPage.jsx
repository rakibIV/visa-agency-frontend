import CrudTable from '../../components/common/CrudTable';

export default function ReviewsPage() {
  return (
    <CrudTable
      title="Customer Reviews"
      subtitle="Manage reviews from your clients."
      endpoint="/reviews/"
      queryKey="website-reviews"
      columns={[
        { header: 'Client Name', accessor: 'name' },
        { 
          header: 'Rating', 
          accessor: 'rating',
          render: (item) => (
            <span className="font-semibold text-orange-500">
              {item.rating} / 5
            </span>
          )
        },
        { 
          header: 'Active', 
          accessor: 'is_active', 
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {item.is_active ? 'Active' : 'Hidden'}
            </span>
          )
        },
      ]}
      formFields={[
        { name: 'name', label: 'Client Name', type: 'text', required: true },
        { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true, min: "1", max: "5", step: "1" },
        { name: 'comment', label: 'Review Comment', type: 'textarea', required: true, rows: 4 },
        { name: 'is_active', label: 'Visible on Website', type: 'checkbox' },
      ]}
    />
  );
}

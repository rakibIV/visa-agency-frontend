import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import CrudTable from '../../components/common/CrudTable';

export default function ImportantNotesSettings() {
  const { data: companies } = useQuery({
    queryKey: ['settings-company-info'],
    queryFn: () => api.get('/companies/').then(r => r.data.results ?? r.data),
  });

  const company = Array.isArray(companies) ? companies[0] : companies;

  return (
    <CrudTable
      title="Money Receipt Important Notes"
      subtitle="Create and manage preset important note templates for money receipts."
      endpoint="/important-notes/"
      queryKey="important-notes-list"
      columns={[
        { 
          header: 'Preset Title', 
          accessor: 'title',
          render: (item) => (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">{item.title}</span>
              {item.is_default && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">
                  Default
                </span>
              )}
            </div>
          )
        },
        { 
          header: 'Note Content Preview', 
          accessor: 'content',
          render: (item) => (
            <p className="text-xs text-slate-600 max-w-md truncate font-medium">
              {item.content}
            </p>
          )
        },
        {
          header: 'Status',
          accessor: 'is_active',
          render: (item) => (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              item.is_active 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          )
        },
      ]}
      formFields={[
        { name: 'company', label: 'Company', type: 'select', options: company ? [{ value: company.id, label: company.company_name }] : [], required: false },
        { name: 'title', label: 'Preset Note Title (e.g. Standard Refund Policy, Work Visa Terms)', type: 'text', required: true },
        { name: 'content', label: 'Important Note Content (Printed on Receipt)', type: 'textarea', rows: 4, required: true },
        { name: 'is_default', label: 'Set as Default Note for New Payments', type: 'checkbox' },
        { name: 'is_active', label: 'Is Active', type: 'checkbox' },
      ]}
    />
  );
}

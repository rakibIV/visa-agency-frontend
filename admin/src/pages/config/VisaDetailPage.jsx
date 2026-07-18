import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeftIcon, PencilSquareIcon, CheckBadgeIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';
import CrudTable from '../../components/common/CrudTable';
import SeoSection from '../../components/common/SeoSection';

export default function VisaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: visa, isLoading, error } = useQuery({
    queryKey: ['visa', id],
    queryFn: () => api.get(`/visas/${id}/`).then(r => r.data),
  });

  const deleteVisaMutation = useMutation({
    mutationFn: () => api.delete(`/visas/${id}/`),
    onSuccess: () => {
      navigate('/config/visas');
    },
    onError: (err) => {
      alert('Failed to delete visa: ' + (err.response?.data?.detail || err.message));
    }
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading...</div>;
  if (error || !visa) return <div className="p-20 text-center text-red-500">Failed to load visa details.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/config/visas')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {visa.name}
            {visa.is_active && <CheckBadgeIcon className="w-6 h-6 text-green-500" title="Active" />}
          </h2>
        </div>
        <div className="flex gap-2">
          <Link to={`/config/visas/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors">
            <PencilSquareIcon className="w-4 h-4" /> Edit Visa
          </Link>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this visa?')) {
                deleteVisaMutation.mutate();
              }
            }}
            disabled={deleteVisaMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" /> {deleteVisaMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex items-start gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">{visa.name}</h3>
            <p className="text-slate-500 text-sm font-medium">
              Country: <span className="text-slate-800 font-bold">{visa.country?.name || 'N/A'}</span> &nbsp;|&nbsp; 
              Category: <span className="text-slate-800 font-bold">{visa.category?.name || 'N/A'}</span>
            </p>
            <div className="flex gap-2 mt-2">
              {visa.is_featured && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-lg">Featured</span>}
              {visa.from_any_country && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg">Global Applicants Allowed</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Salary Range</p>
            <p className="text-sm font-semibold text-slate-800">
              {visa.minimum_salary ? `$${visa.minimum_salary}` : 'N/A'} - {visa.maximum_salary ? `$${visa.maximum_salary}` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Working Hours/Week</p>
            <p className="text-sm font-semibold text-slate-800">{visa.working_hours_per_week || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</p>
            <p className="text-sm font-semibold text-slate-800">{visa.duration_in_months ? `${visa.duration_in_months} Months` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Processing Time</p>
            <p className="text-sm font-semibold text-slate-800">
              {visa.minimum_processing_days || 0} - {visa.maximum_processing_days || 0} Days
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Overtime</p>
            <p className="text-sm font-semibold text-slate-800">{visa.overtime_available ? 'Available' : 'No'}</p>
          </div>
        </div>

        {visa.services?.length > 0 && (
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Linked Agency Services</p>
            <div className="flex flex-wrap gap-2">
              {visa.services.map(service => (
                <span key={service.id} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                  {service.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {visa.jobs?.length > 0 && (
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Linked Jobs</p>
            <div className="flex flex-wrap gap-2">
              {visa.jobs.map(job => (
                <span key={job.id} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                  {job.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {visa.description && (
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</p>
            <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{visa.description}</div>
          </div>
        )}
      </div>

      <SeoSection
        title="Visa SEO"
        endpoint={`/visas/${id}/seo/`}
        initialData={visa.seo}
        queryKey={['visa', id]}
      />

      <div className="space-y-12 pt-8">
        <CrudTable
          isNested={true}
          title="Visa Requirements"
          subtitle="Manage document and eligibility requirements."
          endpoint={`/visas/${id}/requirements/`}
          queryKey={`visa-requirements-${id}`}
          columns={[
            { header: 'Type', accessor: 'requirement_type' },
            { header: 'Title', accessor: 'title' },
            { header: 'Required', render: (item) => item.is_required ? 'Yes' : 'No' },
            { header: 'Order', accessor: 'display_order' },
          ]}
          formFields={[
            { 
              name: 'requirement_type', 
              label: 'Requirement Type', 
              type: 'select', 
              required: true,
              options: [
                { value: 'DOCUMENT', label: 'Document' },
                { value: 'ELIGIBILITY', label: 'Eligibility' },
                { value: 'BENEFIT', label: 'Benefit' },
                { value: 'RESTRICTION', label: 'Restriction' },
                { value: 'LANGUAGE_SKILL', label: 'Language Skills' },
                { value: 'NOTE', label: 'Important Note' },
              ]
            },
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'is_required', label: 'Is Required?', type: 'checkbox' },
            { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
          ]}
        />

        <CrudTable
          isNested={true}
          title="Visa Processing Steps"
          subtitle="Step-by-step processing workflow for this visa."
          endpoint={`/visas/${id}/steps/`}
          queryKey={`visa-steps-${id}`}
          columns={[
            { header: 'Title', accessor: 'title' },
            { header: 'Order', accessor: 'display_order' },
          ]}
          formFields={[
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
          ]}
        />

        <CrudTable
          isNested={true}
          title="Visa FAQs"
          subtitle="Frequently asked questions for this specific visa."
          endpoint={`/visas/${id}/faqs/`}
          queryKey={`visa-faqs-${id}`}
          columns={[
            { header: 'Question', accessor: 'question' },
            { header: 'Order', accessor: 'display_order' },
            { header: 'Active', render: (item) => item.is_active ? 'Yes' : 'No' },
          ]}
          formFields={[
            { name: 'question', label: 'Question', type: 'text', required: true },
            { name: 'answer', label: 'Answer', type: 'textarea', required: true },
            { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
            { name: 'is_active', label: 'Is Active?', type: 'checkbox' },
          ]}
        />
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import CrudTable from '../../components/common/CrudTable';

export default function AgencyImagesPage() {
  const { data: companies } = useQuery({
    queryKey: ['companies-list'],
    queryFn: () => api.get('/companies/').then(r => r.data.results ?? r.data)
  });
  
  const companyOptions = companies?.map(c => ({ value: c.id, label: c.company_name })) || [];

  return (
    <CrudTable
      title="Agency Images"
      subtitle="Manage gallery images for the agency."
      endpoint="/agency-images/"
      queryKey="agency-images"
      columns={[
        { header: 'Caption', accessor: 'caption' },
        { 
          header: 'Image', 
          accessor: 'image', 
          render: (val) => val ? <img src={val} alt="Agency Image" className="h-10 w-10 rounded object-cover" /> : 'N/A'
        },
      ]}
      formFields={[
        { name: 'company', label: 'Company', type: 'select', options: companyOptions, required: true },
        { name: 'image', label: 'Image', type: 'file', accept: 'image/*', required: true },
        { name: 'caption', label: 'Caption', type: 'text' },
      ]}
    />
  );
}

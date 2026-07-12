import { useQuery } from '@tanstack/react-query';
import CrudTable from '../../components/common/CrudTable';
import api from '../../api/client';

export default function SocialLinksPage() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ['settings-companies-list'],
    queryFn: () => api.get('/companies/').then(r => r.data.results ?? r.data),
  });

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading companies...</div>;
  }

  const companyOptions = (companies || []).map((c) => ({
    label: c.company_name,
    value: c.id,
  }));

  const platformOptions = [
    { label: 'Facebook', value: 'FACEBOOK' },
    { label: 'Twitter / X', value: 'TWITTER' },
    { label: 'Instagram', value: 'INSTAGRAM' },
    { label: 'LinkedIn', value: 'LINKEDIN' },
    { label: 'YouTube', value: 'YOUTUBE' },
    { label: 'TikTok', value: 'TIKTOK' },
    { label: 'WhatsApp', value: 'WHATSAPP' },
    { label: 'Telegram', value: 'TELEGRAM' },
    { label: 'Other', value: 'OTHER' },
  ];

  return (
    <CrudTable
      title="Social Links"
      subtitle="Manage agency social media links."
      endpoint="/social-links/"
      queryKey="website-social-links"
      columns={[
        { header: 'Platform', accessor: 'platform_name' },
        { 
          header: 'URL', 
          accessor: 'url',
          render: (item) => (
            <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              {item.url}
            </a>
          )
        },
        { header: 'Order', accessor: 'display_order' },
      ]}
      formFields={[
        { name: 'company', label: 'Company', type: 'select', required: true, options: companyOptions },
        { name: 'platform', label: 'Platform', type: 'select', required: true, options: platformOptions },
        { name: 'url', label: 'URL Link', type: 'text', required: true },
        { name: 'display_order', label: 'Display Order', type: 'number', step: "1" },
      ]}
    />
  );
}

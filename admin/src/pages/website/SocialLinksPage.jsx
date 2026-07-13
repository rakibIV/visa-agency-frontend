import CrudTable from '../../components/common/CrudTable';

export default function SocialLinksPage() {
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
      ]}
      formFields={[
        { name: 'platform', label: 'Platform', type: 'select', required: true, options: platformOptions },
        { name: 'url', label: 'URL Link', type: 'text', required: true },
      ]}
    />
  );
}

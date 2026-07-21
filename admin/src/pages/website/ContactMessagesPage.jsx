import React from 'react';
import CrudTable from '../../components/common/CrudTable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function ContactMessagesPage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, is_read }) => api.patch(`/contact-us/${id}/`, { is_read }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries(['website-contact-us']);
      queryClient.invalidateQueries(['admin-notifications']);
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const handleStatusChange = (id, value) => {
    mutation.mutate({ id, is_read: value === 'true' });
  };

  return (
    <CrudTable
      title="Contact Messages"
      subtitle="View messages submitted via the website contact form."
      endpoint="/contact-us/"
      queryKey="website-contact-us"
      disableAdd={true}
      disableEdit={true}
      enableView={true}
      columns={[
        { header: 'Name', accessor: 'name' },
        { header: 'Subject', accessor: 'subject' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { 
          header: 'Status', 
          render: (item) => (
            <select
              value={item.is_read ? 'true' : 'false'}
              onChange={(e) => handleStatusChange(item.id, e.target.value)}
              className={`text-xs font-bold rounded-md px-2 py-1 border border-slate-200 outline-none cursor-pointer transition-colors ${
                item.is_read ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              <option value="false" className="text-slate-800">Unread</option>
              <option value="true" className="text-slate-800">Read</option>
            </select>
          )
        },
      ]}
      formFields={[
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'subject', label: 'Subject', type: 'text' },
        { name: 'message', label: 'Message', type: 'textarea' },
      ]}
    />
  );
}

import React from 'react';
import CrudTable from '../../components/common/CrudTable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function ApplicationRequestsPage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/application-requests/${id}/`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries(['application-requests']);
      queryClient.invalidateQueries(['admin-notifications']);
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const handleStatusChange = (id, status) => {
    mutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Requests (Leads)</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage soft application requests submitted from the public frontend.
        </p>
      </div>

      <CrudTable
        endpoint="/application-requests/"
        queryKey="application-requests"
        disableAdd={true}
        disableEdit={true}
        enableView={true}
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Phone', accessor: 'phone' },
          { header: 'Email', accessor: 'email' },
          { 
            header: 'Requested Visa', 
            render: (item) => item.target_visa_name 
              ? <span className="text-xs font-semibold px-2 py-1 bg-navy-50 text-navy-700 rounded-md border border-navy-200">{item.target_country_name} - {item.target_visa_name}</span> 
              : <span className="text-xs text-gray-400 italic">General Inquiry</span>
          },
          { 
            header: 'Status', 
            render: (item) => {
              const statusColors = {
                PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                REVIEWED: 'bg-blue-50 text-blue-800 border-blue-200',
                CONTACTED: 'bg-green-50 text-green-800 border-green-200',
              };
              const color = statusColors[item.status] || 'bg-gray-50 text-gray-800 border-gray-200';
              return (
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className={`text-xs font-bold rounded-md px-2 py-1 border outline-none cursor-pointer transition-colors ${color}`}
                >
                  <option value="PENDING" className="text-slate-800">Pending</option>
                  <option value="REVIEWED" className="text-slate-800">Reviewed</option>
                  <option value="CONTACTED" className="text-slate-800">Contacted</option>
                </select>
              );
            }
          },
          { 
            header: 'Submitted', 
            render: (item) => new Date(item.created_at).toLocaleDateString()
          },
        ]}
        formFields={[
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'phone', label: 'Phone', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'message', label: 'Message', type: 'textarea' },
        ]}
      />
    </div>
  );
}

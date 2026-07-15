import React from 'react';
import CrudTable from '../../components/common/CrudTable';

export default function ApplicationRequestsPage() {
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
                PENDING: 'bg-yellow-100 text-yellow-800',
                REVIEWED: 'bg-blue-100 text-blue-800',
                CONTACTED: 'bg-green-100 text-green-800',
              };
              const color = statusColors[item.status] || 'bg-gray-100 text-gray-800';
              return (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                  {item.status}
                </span>
              );
            }
          },
          { 
            header: 'Submitted', 
            render: (item) => new Date(item.created_at).toLocaleDateString()
          },
        ]}
        formFields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'phone', label: 'Phone', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: false },
          { name: 'message', label: 'Message', type: 'textarea', required: false },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
              { value: 'PENDING', label: 'Pending' },
              { value: 'REVIEWED', label: 'Reviewed' },
              { value: 'CONTACTED', label: 'Contacted' },
            ],
          },
        ]}
      />
    </div>
  );
}

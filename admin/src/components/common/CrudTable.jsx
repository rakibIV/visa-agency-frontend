import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';
import FormModal from './FormModal';

export default function CrudTable({
  title,
  subtitle,
  endpoint,
  queryKey,
  columns,
  formFields,
  isNested = false, // If true, disables the max-w layout for easier embedding
  disableAdd = false,
  disableEdit = false,
  disableDelete = false,
}) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn: () => api.get(endpoint).then(r => r.data.results ?? r.data),
  });

  const mutationCreate = useMutation({
    mutationFn: ({ data, config }) => api.post(endpoint, data, config),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      setIsModalOpen(false);
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: ({ id, data, config }) => api.patch(`${endpoint}${id}/`, data, config),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      setIsModalOpen(false);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: (id) => api.delete(`${endpoint}${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
    },
  });

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      mutationDelete.mutate(id);
    }
  };

  const handleSubmit = (formData) => {
    const hasFile = Object.values(formData).some((v) => v instanceof File);
    let payload = formData;
    let config = {};

    if (hasFile) {
      payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          payload.append(key, val);
        }
      });
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
    }

    if (editingItem) {
      mutationUpdate.mutate({ id: editingItem.id || editingItem.slug, data: payload, config });
    } else {
      mutationCreate.mutate({ data: payload, config });
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {!disableAdd && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add New
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
                {(!disableEdit || !disableDelete) && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-red-500 text-sm">
                    Error loading data.
                  </td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No items found.
                  </td>
                </tr>
              ) : (
                data?.map((item, idx) => (
                  <tr key={item.id || item.slug || idx} className="hover:bg-slate-50 transition-colors">
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-6 py-4 text-sm text-slate-700">
                        {col.render ? col.render(item) : item[col.accessor]}
                      </td>
                    ))}
                    {(!disableEdit || !disableDelete) && (
                      <td className="px-6 py-4 text-right space-x-2">
                        {!disableEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                        )}
                        {!disableDelete && (
                          <button
                            onClick={() => handleDelete(item.id || item.slug)}
                            className="inline-flex items-center p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit ${title}` : `Add ${title}`}
        fields={formFields}
        initialData={editingItem}
        onSubmit={handleSubmit}
        isLoading={mutationCreate.isPending || mutationUpdate.isPending}
      />
    </div>
  );

  if (isNested) return content;

  return <div className="max-w-5xl mx-auto">{content}</div>;
}

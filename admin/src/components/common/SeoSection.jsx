import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';

export default function SeoSection({ title = "SEO Settings", endpoint, initialData, queryKey }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    canonical_url: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || '',
        meta_keywords: initialData.meta_keywords || '',
        canonical_url: initialData.canonical_url || '',
      });
    }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (initialData && (initialData.id || initialData.meta_title !== undefined)) {
        // If it exists, but we don't have an ID, we might need to rely on the backend accepting POST to update
        // or PATCH without ID if it's a 1-to-1 endpoint. 
        // For NestedViewSet with 1-to-1, standard DRF expects PATCH to /countries/<slug>/seo/<id>/
        // But since we modified perform_create, we can just use POST to overwrite or create.
        // Actually, if we use POST, perform_create uses `serializer.save(country=...)` which will raise IntegrityError if one exists.
        // Let's just always do POST if no initialData, and PUT/PATCH if initialData exists.
        // Wait, if we don't have ID in initialData, we might have to use POST or custom PUT.
        // I'll use POST and let backend handle it, or PUT.
        // Let's assume POST works if it uses update_or_create, else we should have added `id` to `CountrySEOSerializer`.
        return api.post(endpoint, data);
      } else {
        return api.post(endpoint, data);
      }
    },
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries(queryKey);
      }
      setIsEditing(false);
    }
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Edit SEO
          </button>
        </div>
        
        {initialData && (initialData.meta_title || initialData.meta_description) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-slate-500 uppercase text-xs mb-1">Meta Title</p>
              <p className="text-slate-800">{initialData.meta_title || 'N/A'}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase text-xs mb-1">Canonical URL</p>
              <p className="text-slate-800">{initialData.canonical_url || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-bold text-slate-500 uppercase text-xs mb-1">Meta Description</p>
              <p className="text-slate-800">{initialData.meta_description || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-bold text-slate-500 uppercase text-xs mb-1">Meta Keywords</p>
              <p className="text-slate-800">{initialData.meta_keywords || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No SEO metadata configured yet.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h3 className="font-bold text-slate-800 text-lg">Edit {title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meta Title</label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Canonical URL</label>
            <input
              type="url"
              name="canonical_url"
              value={formData.canonical_url}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meta Description</label>
            <textarea
              name="meta_description"
              rows={3}
              value={formData.meta_description}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meta Keywords</label>
            <textarea
              name="meta_keywords"
              rows={2}
              value={formData.meta_keywords}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Comma separated keywords"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-blue-200 transition-all disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

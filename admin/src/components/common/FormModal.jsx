import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function FormModal({
  isOpen,
  onClose,
  title,
  fields = [],
  initialData = {},
  onSubmit,
  isLoading = false,
  isViewOnly = false,
}) {
  const [formData, setFormData] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setImagePreviews({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files?.[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImagePreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? (files?.[0] || null) : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              {field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name] || false}
                    onChange={handleChange}
                    disabled={isViewOnly || field.disabled}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                </label>
              ) : (
                <>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      required={field.required}
                      disabled={isViewOnly || field.disabled}
                      rows={field.rows || 3}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-slate-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      required={field.required}
                      disabled={isViewOnly || field.disabled}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-slate-800 font-medium text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={field.type === 'file' ? undefined : formData[field.name] || ''}
                        onChange={handleChange}
                        required={field.required}
                        disabled={isViewOnly || field.disabled}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        className={
                          field.type === 'file'
                            ? "w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            : "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-slate-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        }
                        accept={field.accept}
                      />
                      {field.type === 'file' && field.accept?.includes('image') && (imagePreviews[field.name] || (initialData && typeof initialData[field.name] === 'string')) ? (
                        <div className="mt-3">
                          <span className="text-slate-500 text-xs font-bold uppercase mb-2 block">Image Preview:</span>
                          <img 
                            src={imagePreviews[field.name] || initialData[field.name]} 
                            alt="Preview" 
                            className="w-32 h-20 object-cover rounded-xl border border-slate-200 shadow-sm" 
                          />
                        </div>
                      ) : field.type === 'file' && initialData && initialData[field.name] && typeof initialData[field.name] === 'string' && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-semibold text-blue-900 truncate">
                              {initialData[field.name].split('/').pop()}
                            </span>
                          </div>
                          <a 
                            href={initialData[field.name]} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-colors border border-blue-200 hover:border-blue-600 shadow-sm"
                          >
                            View File
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {field.helpText && (
                    <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">
                      {field.helpText}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>
            {!isViewOnly && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

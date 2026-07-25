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
  onFormChange,
}) {
  const [formData, setFormData] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});

  useEffect(() => {
    if (isOpen) {
      const data = initialData ? { ...initialData } : {};
      fields.forEach((field) => {
        if (field.type === 'select' && data[field.name] && typeof data[field.name] === 'object') {
          data[field.name] = data[field.name].id || data[field.name];
        }
      });
      setFormData(data);
      setImagePreviews({});
      if (onFormChange) onFormChange(data);
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
      const targetField = fields.find(f => f.name === name);
      if (file.type.startsWith('image/')) {
        if (targetField?.requiredWidth || targetField?.requiredHeight) {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          img.onload = () => {
            if (
              (targetField.requiredWidth && img.width !== targetField.requiredWidth) ||
              (targetField.requiredHeight && img.height !== targetField.requiredHeight)
            ) {
              alert(`Image dimensions must be exactly ${targetField.requiredWidth}x${targetField.requiredHeight} pixels. Uploaded image is ${img.width}x${img.height} pixels.`);
              e.target.value = '';
              setImagePreviews(prev => ({ ...prev, [name]: null }));
              setFormData(prev => ({ ...prev, [name]: null }));
              return;
            }
            setImagePreviews(prev => ({ ...prev, [name]: objectUrl }));
            setFormData(prev => ({ ...prev, [name]: file }));
          };
          img.src = objectUrl;
          return;
        }
        setImagePreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
      }
    }

    const val = type === 'checkbox' ? checked : type === 'file' ? (files?.[0] || null) : value;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: val,
      };
      if (name === 'visa' && prev.visa !== val) {
        updated.job = '';
      }
      if (onFormChange) onFormChange(updated);
      return updated;
    });

    const targetField = fields.find(f => f.name === name);
    if (targetField?.onChange) {
      targetField.onChange(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              {field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name] || false}
                    onChange={handleChange}
                    disabled={isViewOnly || (typeof field.disabled === 'function' ? field.disabled(formData) : field.disabled)}
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
                      disabled={isViewOnly || (typeof field.disabled === 'function' ? field.disabled(formData) : field.disabled)}
                      rows={field.rows || 3}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-slate-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      required={field.required}
                      disabled={isViewOnly || (typeof field.disabled === 'function' ? field.disabled(formData) : field.disabled)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-slate-800 font-medium text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{field.placeholder || `Select ${field.label}`}</option>
                      {(typeof field.options === 'function' ? field.options(formData) : field.options)?.map((opt) => (
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
                        required={field.type === 'file' && (initialData?.[field.name] || typeof formData[field.name] === 'string') ? false : field.required}
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
                      {field.type === 'file' && (imagePreviews[field.name] || (initialData && typeof initialData[field.name] === 'string' && initialData[field.name]) || (typeof formData[field.name] === 'string' && formData[field.name])) && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                          <div className="w-16 h-14 bg-slate-900 rounded-lg flex items-center justify-center p-1 border border-slate-200 overflow-hidden shrink-0">
                            <img 
                              src={imagePreviews[field.name] || (typeof formData[field.name] === 'string' ? formData[field.name] : initialData?.[field.name])} 
                              alt="Preview" 
                              className="max-h-full max-w-full object-contain" 
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-800 block">
                              {imagePreviews[field.name] ? 'New File Selected' : 'Current Saved Image'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5 leading-snug">
                              {imagePreviews[field.name] 
                                ? 'This new image will replace the current logo upon saving.' 
                                : 'Leave file field empty if you want to keep this current logo.'}
                            </span>
                          </div>
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

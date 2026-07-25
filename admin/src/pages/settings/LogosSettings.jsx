import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { parseApiError } from '../../utils/errorParser';
import CrudTable from '../../components/common/CrudTable';

export default function LogosSettings() {
  const queryClient = useQueryClient();
  
  // Fetch primary company information
  const { data: companies, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['settings-company-logos'],
    queryFn: () => api.get('/companies/').then(r => r.data.results ?? r.data),
  });

  const company = Array.isArray(companies) ? companies[0] : companies;

  // Local state for main logo uploads
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previews, setPreviews] = useState({});

  const mutationUpdateCompany = useMutation({
    mutationFn: (formData) => api.patch(`/companies/${company.id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      toast.success('Company branding updated successfully!');
      queryClient.invalidateQueries(['settings-company-logos']);
      queryClient.invalidateQueries(['company-info']);
      setSelectedFiles({});
      setPreviews({});
    },
    onError: (err) => {
      toast.error(parseApiError(err));
    }
  });

  const handleFileChange = (fieldName, file) => {
    if (!file) return;
    if (fieldName === 'company_signature' && file.type.startsWith('image/')) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width !== 300 || img.height !== 80) {
          toast.error(`Company signature image must be exactly 300x80 pixels. Uploaded image is ${img.width}x${img.height} pixels.`);
          return;
        }
        setSelectedFiles(prev => ({ ...prev, [fieldName]: file }));
        setPreviews(prev => ({ ...prev, [fieldName]: objectUrl }));
      };
      img.src = objectUrl;
      return;
    }
    setSelectedFiles(prev => ({ ...prev, [fieldName]: file }));
    if (file.type.startsWith('image/')) {
      setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  const handleSavePrimaryLogos = (e) => {
    e.preventDefault();
    if (!company?.id) {
      toast.error('Company information not found');
      return;
    }

    if (Object.keys(selectedFiles).length === 0) {
      toast.error('Please select at least one logo or image file to update.');
      return;
    }

    const fd = new FormData();
    Object.entries(selectedFiles).forEach(([key, file]) => {
      if (file) fd.append(key, file);
    });

    mutationUpdateCompany.mutate(fd);
  };

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-800">Company Logos & Brand Variations</h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage core company logos (Primary Logo, Signature Seal, Favicon) and custom company logo variations with serial numbers.
        </p>
      </div>

      {/* SECTION 1: PRIMARY CORE LOGOS */}
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/80 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <PhotoIcon className="w-5 h-5 text-blue-600" />
              Primary Core Branding
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Used across website headers, footers, money receipts, and generated PDF agreements.
            </p>
          </div>
          {Object.keys(selectedFiles).length > 0 && (
            <button
              onClick={handleSavePrimaryLogos}
              disabled={mutationUpdateCompany.isPending}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircleIcon className="w-4 h-4" />
              {mutationUpdateCompany.isPending ? 'Saving...' : 'Save Core Logos'}
            </button>
          )}
        </div>

        {isCompanyLoading ? (
          <div className="text-sm text-slate-500 py-6 text-center">Loading core logo settings...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Logo Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Primary Header Logo
                </span>
                <p className="text-xs text-slate-500 mb-3">
                  Appears in website headers & light background sections.
                </p>
                <div className="h-32 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-3 overflow-hidden relative group">
                  {previews.company_logo || company?.company_logo ? (
                    <img
                      src={previews.company_logo || company?.company_logo}
                      alt="Primary Company Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No logo uploaded</span>
                  )}
                </div>
              </div>
              <label className="cursor-pointer block text-center px-4 py-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-xl transition-colors border border-slate-200 hover:border-blue-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('company_logo', e.target.files[0])}
                  className="hidden"
                />
                Change Primary Logo
              </label>
            </div>

            {/* Company Signature Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Official Signature / Seal
                </span>
                <p className="text-xs text-slate-500 mb-3">
                  Printed automatically on money receipts, agreement slips & PDFs.
                </p>
                <div className="h-32 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-3 overflow-hidden">
                  {previews.company_signature || company?.company_signature ? (
                    <img
                      src={previews.company_signature || company?.company_signature}
                      alt="Company Signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No signature uploaded</span>
                  )}
                </div>
              </div>
              <label className="cursor-pointer block text-center px-4 py-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-xl transition-colors border border-slate-200 hover:border-blue-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('company_signature', e.target.files[0])}
                  className="hidden"
                />
                Change Signature
              </label>
            </div>

            {/* Favicon Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Favicon / Tab Icon
                </span>
                <p className="text-xs text-slate-500 mb-3">
                  Browser tab icon & app shortcut icon (Square format).
                </p>
                <div className="h-32 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-3 overflow-hidden">
                  {previews.favicon || company?.favicon ? (
                    <img
                      src={previews.favicon || company?.favicon}
                      alt="Favicon Icon"
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No favicon uploaded</span>
                  )}
                </div>
              </div>
              <label className="cursor-pointer block text-center px-4 py-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-xl transition-colors border border-slate-200 hover:border-blue-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('favicon', e.target.files[0])}
                  className="hidden"
                />
                Change Favicon
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: DEDICATED COMPANY LOGO VARIATIONS (WITH SERIAL NUMBER) */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Company Logo Variations</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add custom logo variations (e.g. Reverse Dark Logo, White Logo, Monochrome Logo, Badge Icon) ordered by serial number.
            </p>
          </div>
        </div>

        <CrudTable
          title="Company Logo Variations"
          subtitle="Manage logo variations with serial numbers."
          endpoint="/company-logos/"
          queryKey="company-logos-list"
          isNested={true}
          columns={[
            {
              header: 'SL NO',
              accessor: 'serial_number',
              render: (item) => (
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-black text-xs border border-slate-200">
                  SL #{item.serial_number ?? 1}
                </span>
              )
            },
            {
              header: 'Preview',
              accessor: 'image',
              render: (item) => (
                item.image ? (
                  <div className="w-16 h-12 bg-slate-900/90 rounded-xl border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
                    <img src={item.image} alt={item.title || 'Company Logo'} className="max-h-full max-w-full object-contain" />
                  </div>
                ) : 'No image'
              )
            },
            { 
              header: 'Logo Title', 
              accessor: 'title',
              render: (item) => (
                <div>
                  <span className="font-bold text-slate-800 text-sm block">{item.title}</span>
                </div>
              )
            },
            {
              header: 'Status',
              accessor: 'is_active',
              render: (item) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  item.is_active 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              )
            },
            { 
              header: 'Direct Link', 
              accessor: 'image', 
              render: (item) => (
                item.image ? (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.image);
                      toast.success('Logo URL copied to clipboard!');
                    }} 
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors"
                  >
                    Copy URL
                  </button>
                ) : 'N/A'
              ) 
            },
          ]}
          formFields={[
            { name: 'company', label: 'Company', type: 'select', options: company ? [{ value: company.id, label: company.company_name }] : [], required: true },
            { name: 'serial_number', label: 'Serial Number (SL NO)', type: 'number', min: 1, required: true },
            { name: 'title', label: 'Logo Variation Name (e.g. Reverse Dark Logo, White Logo, Badge Icon)', type: 'text', required: true },
            { name: 'image', label: 'Logo Image File', type: 'file', accept: 'image/*', required: true },
            { name: 'is_active', label: 'Is Active', type: 'checkbox' },
          ]}
        />
      </div>
    </div>
  );
}

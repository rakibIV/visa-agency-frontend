import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, PencilSquareIcon, CheckBadgeIcon, TrashIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import CrudTable from '../../components/common/CrudTable';
import SeoSection from '../../components/common/SeoSection';
import { parseApiError } from '../../utils/errorParser';

export default function CountryDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryFile, setGalleryFile] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const { data: country, isLoading, error } = useQuery({
    queryKey: ['country', slug],
    queryFn: () => api.get(`/countries/${slug}/`).then(r => r.data),
  });

  const { data: gallery } = useQuery({
    queryKey: ['country-gallery', slug],
    queryFn: () => api.get(`/countries/${slug}/gallery/`).then(r => r.data.results ?? r.data),
  });

  const addGalleryMutation = useMutation({
    mutationFn: (formData) => api.post(`/countries/${slug}/gallery/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      toast.success('Gallery image added successfully!');
      queryClient.invalidateQueries(['country-gallery', slug]);
      setShowGalleryModal(false);
      setGalleryFile(null);
      setUploadError('');
    },
    onError: (err) => {
      const errMsg = parseApiError(err);
      setUploadError(errMsg);
      toast.error(errMsg);
    }
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: (id) => api.delete(`/countries/${slug}/gallery/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['country-gallery', slug]);
    }
  });

  const handleUploadGallery = (e) => {
    e.preventDefault();
    if (!galleryFile) return setUploadError('Please select an image.');
    const fd = new FormData();
    fd.append('image', galleryFile);
    addGalleryMutation.mutate(fd);
  };

  const deleteCountryMutation = useMutation({
    mutationFn: () => api.delete(`/countries/${slug}/`),
    onSuccess: () => {
      navigate('/config/countries');
    },
    onError: (err) => {
      alert('Failed to delete country: ' + (err.response?.data?.detail || err.message));
    }
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading...</div>;
  if (error || !country) return <div className="p-20 text-center text-red-500">Failed to load country details.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cover Image Header */}
      {country.image && (
        <div className="w-full h-64 sm:h-80 bg-slate-100 rounded-2xl overflow-hidden shadow-inner relative">
          <img src={country.image} alt={`${country.name} Cover`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <h2 className="text-3xl sm:text-4xl font-black text-white">{country.name}</h2>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/config/countries')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {country.name}
            {country.is_active && <CheckBadgeIcon className="w-6 h-6 text-green-500" title="Active" />}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/config/countries/${slug}/edit`} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors text-sm">
            <PencilSquareIcon className="w-4 h-4" /> Edit Country
          </Link>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this country?')) {
                deleteCountryMutation.mutate();
              }
            }}
            disabled={deleteCountryMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" /> {deleteCountryMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b border-slate-100 pb-6 text-center sm:text-left">
          <div className="w-24 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-inner">
            {country.flag ? (
              <img src={country.flag} alt={`${country.name} Flag`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-wider">No Flag</div>
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 break-words">{country.name}</h3>
            <p className="text-slate-500 text-sm font-medium break-words">{country.short_description || 'No short description provided.'}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              {country.is_featured && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-lg">Featured Country</span>}
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider">{country.iso3 || country.iso2}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Capital</p>
            <p className="text-sm font-semibold text-slate-800">{country.capital || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Currency</p>
            <p className="text-sm font-semibold text-slate-800">{country.currency || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Language</p>
            <p className="text-sm font-semibold text-slate-800">{country.language || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Nationality</p>
            <p className="text-sm font-semibold text-slate-800">{country.nationality || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Time Zone</p>
            <p className="text-sm font-semibold text-slate-800">{country.time_zone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Processing Time</p>
            <p className="text-sm font-semibold text-slate-800">{country.processing_time || 'N/A'}</p>
          </div>
        </div>

        {country.description && (
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detailed Description</p>
            <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{country.description}</div>
          </div>
        )}
      </div>


      {/* Country Gallery Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-blue-600" />
            Country Gallery
          </h3>
          <button
            onClick={() => setShowGalleryModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
          >
            <PlusIcon className="w-4 h-4" /> Add Image
          </button>
        </div>
        
        {gallery?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gallery.map(img => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square">
                <img src={img.image} alt="Gallery item" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => {
                      if(window.confirm('Are you sure you want to delete this image?')) {
                        deleteGalleryMutation.mutate(img.id);
                      }
                    }}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    title="Delete Image"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No gallery images found for this country.
          </p>
        )}
      </div>

      {/* Upload Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Upload Gallery Image</h3>
            <form onSubmit={handleUploadGallery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setGalleryFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {uploadError && <p className="text-xs text-red-600 font-semibold">{uploadError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addGalleryMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {addGalleryMutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SeoSection
        title="Country SEO"
        endpoint={`/countries/${slug}/seo/`}
        initialData={country.seo}
        queryKey={['country', slug]}
      />

      <div className="space-y-12 pt-8 border-t border-slate-100">
        <CrudTable
          isNested={true}
          title="Country Requirements"
          subtitle="Manage document and eligibility requirements."
          endpoint={`/countries/${slug}/requirements/`}
          queryKey={`country-requirements-${slug}`}
          columns={[
            { header: 'Type', accessor: 'requirement_type' },
            { header: 'Title', accessor: 'title' },
            { header: 'Order', accessor: 'display_order' },
          ]}
          formFields={[
            { 
              name: 'requirement_type', 
              label: 'Requirement Type', 
              type: 'select', 
              required: true,
              options: [
                { value: 'VISA', label: 'Visa Requirement' },
                { value: 'DOCUMENT', label: 'Document Requirement' },
                { value: 'LANGUAGE_SKILL', label: 'Language Skills' },
              ]
            },
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
          ]}
        />

        <CrudTable
          isNested={true}
          title="Country FAQs"
          subtitle="Frequently asked questions for this specific country."
          endpoint={`/countries/${slug}/faqs/`}
          queryKey={`country-faqs-${slug}`}
          columns={[
            { header: 'Question', accessor: 'question' },
            { header: 'Order', accessor: 'display_order' },
          ]}
          formFields={[
            { name: 'question', label: 'Question', type: 'text', required: true },
            { name: 'answer', label: 'Answer', type: 'textarea', required: true },
            { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
          ]}
        />
      </div>

    </div>
  );
}

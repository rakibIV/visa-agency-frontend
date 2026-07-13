import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, PencilSquareIcon, CheckBadgeIcon, UserIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';
import CrudTable from '../../components/common/CrudTable';

export default function StaffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: staff, isLoading, error } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => api.get(`/staffs/${id}/`).then(r => r.data),
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading...</div>;
  if (error || !staff) return <div className="p-20 text-center text-red-500">Failed to load staff details.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Staff Profile
            {staff.is_active && <CheckBadgeIcon className="w-6 h-6 text-green-500" title="Active" />}
          </h2>
        </div>
        <Link to={`/staff/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors">
          <PencilSquareIcon className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-start gap-6 border-b border-slate-100 pb-6">
              <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                {staff.photo ? (
                  <img src={staff.photo} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">
                  {staff.employee_id}
                </span>
                <h3 className="text-lg font-bold text-slate-800">{staff.user?.full_name || staff.full_name || 'No Name'}</h3>
                <p className="text-slate-500 text-sm font-medium">
                  {staff.designation?.name || staff.designation || 'Representative'} &nbsp;|&nbsp; {staff.office?.name || staff.office || 'Main Branch'}
                </p>
                <p className="text-slate-500 text-sm mt-1">Joined: {staff.joining_date}</p>
              </div>
            </div>

            <h4 className="font-bold text-slate-800">Personal Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                <p className="text-sm font-semibold text-slate-800">{staff.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">WhatsApp</p>
                <p className="text-sm font-semibold text-slate-800">{staff.whatsapp || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email</p>
                <p className="text-sm font-semibold text-slate-800">{staff.email || staff.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Date of Birth</p>
                <p className="text-sm font-semibold text-slate-800">{staff.date_of_birth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Gender</p>
                <p className="text-sm font-semibold text-slate-800">{staff.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Nationality</p>
                <p className="text-sm font-semibold text-slate-800">{staff.nationality || 'N/A'}</p>
              </div>
            </div>

            <h4 className="font-bold text-slate-800 border-t border-slate-100 pt-6 mt-6">Family & Identification</h4>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Father's Name</p>
                <p className="text-sm font-semibold text-slate-800">{staff.father_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mother's Name</p>
                <p className="text-sm font-semibold text-slate-800">{staff.mother_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">NID Number</p>
                <p className="text-sm font-semibold text-slate-800">{staff.nid_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Passport Number</p>
                <p className="text-sm font-semibold text-slate-800">{staff.passport_number || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Signature</h3>
            {staff.signature ? (
              <img src={staff.signature} alt="Signature" className="w-full h-auto object-contain bg-slate-50 rounded-xl border border-slate-200 p-2 max-h-48" />
            ) : (
              <div className="w-full h-32 bg-slate-50 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm font-medium">
                No signature provided
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-12 pt-8 border-t border-slate-100">
        <CrudTable
          isNested={true}
          title="Emergency Contacts"
          subtitle="Manage emergency contact information for this staff member."
          endpoint={`/staffs/${id}/emergency-contacts/`}
          queryKey={`staff-emergency-contacts-${id}`}
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Relationship', accessor: 'relationship' },
            { header: 'Phone', accessor: 'phone' },
          ]}
          formFields={[
            { name: 'name', label: 'Contact Name', type: 'text', required: true },
            { name: 'relationship', label: 'Relationship', type: 'text', required: true },
            { name: 'phone', label: 'Phone Number', type: 'text', required: true },
            { name: 'address', label: 'Address', type: 'textarea' },
          ]}
        />

        <CrudTable
          isNested={true}
          title="Staff Documents"
          subtitle="Manage documents for this staff member."
          endpoint={`/staffs/${id}/documents/`}
          queryKey={`staff-documents-${id}`}
          columns={[
            { header: 'Type', accessor: 'document_type' },
            { header: 'File', render: (item) => item.file ? <a href={item.file} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View File</a> : 'N/A' },
            { header: 'Verified', render: (item) => item.verified ? 'Yes' : 'No' },
          ]}
          formFields={[
            { name: 'document_type', label: 'Document Type', type: 'text', required: true },
            { name: 'file', label: 'File', type: 'file', required: true },
          ]}
        />

        <CrudTable
          isNested={true}
          disableDelete={true}
          title="Public Profile Configuration"
          subtitle="Configure the public profile access for this staff member."
          endpoint={`/staffs/${id}/public-profile/`}
          queryKey={`staff-public-profile-${id}`}
          columns={[
            { header: 'Slug', accessor: 'slug' },
            { header: 'Is Public', render: (item) => item.is_public ? 'Yes' : 'No' },
          ]}
          formFields={[
            { name: 'slug', label: 'Public Slug (URL)', type: 'text' },
            { name: 'public_password', label: 'Public Password (Optional, leave blank if unchanged)', type: 'text' },
            { name: 'is_public', label: 'Is Public?', type: 'checkbox' },
          ]}
        />
      </div>

    </div>
  );
}

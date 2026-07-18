import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeftIcon, PencilSquareIcon, CheckBadgeIcon, UserIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';
import CrudTable from '../../components/common/CrudTable';

export default function StaffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: staff, isLoading, error } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => api.get(`/staffs/${id}/`).then(r => r.data),
  });

  const deleteStaffMutation = useMutation({
    mutationFn: () => api.delete(`/staffs/${id}/`),
    onSuccess: () => {
      navigate('/staff');
    },
    onError: (err) => {
      alert('Failed to delete staff: ' + (err.response?.data?.detail || err.message));
    }
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
        <div className="flex gap-2">
          <Link to={`/staff/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors">
            <PencilSquareIcon className="w-4 h-4" /> Edit Profile
          </Link>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this staff?')) {
                deleteStaffMutation.mutate();
              }
            }}
            disabled={deleteStaffMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" /> {deleteStaffMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
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
                  {staff.designation?.name || staff.designation || 'Representative'} &nbsp;|&nbsp; {staff.office?.branch_name || staff.office?.name || staff.office || 'Main Branch'}
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
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Referred By</p>
                <p className="text-sm font-semibold text-slate-800">
                  {staff.reference_staff ? (
                    <Link to={`/staff/${staff.reference_staff.id}`} className="text-blue-600 hover:underline">
                      {`${staff.reference_staff.name} (${staff.reference_staff.employee_id})`}
                    </Link>
                  ) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Public Profile</p>
                <p className="text-sm font-semibold text-slate-800">
                  {staff.is_public ? `Active (${staff.public_slug})` : 'Disabled'}
                </p>
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
          title="Assigned Applicants"
          subtitle="Applicants assigned to this staff member."
          endpoint={`/applicants/?assigned_staff=${id}`}
          queryKey={`staff-applicants-${id}`}
          disableAdd={true}
          disableEdit={true}
          disableDelete={true}
          columns={[
            { header: 'App ID', accessor: 'application_id' },
            { header: 'Name', accessor: 'full_name' },
            { header: 'Passport', accessor: 'passport_number' },
            { header: 'Visa', accessor: 'visa_name' },
            { header: 'Status', accessor: 'status_name' },
            { 
              header: 'Action', 
              render: (item) => <Link to={`/applicants/${item.id}`} className="text-blue-600 hover:underline font-semibold">View Profile</Link>
            }
          ]}
          formFields={[]}
        />

        <CrudTable
          isNested={true}
          title="Monthly Slots"
          subtitle="Manage monthly slot allocations for this staff."
          endpoint={`/staffs/${id}/monthly-slots/`}
          queryKey={`staff-monthly-slots-${id}`}
          columns={[
            { header: 'Month', render: (item) => new Date(item.allocation_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) },
            { header: 'Total Slots', accessor: 'total_slot' },
            { header: 'Remaining', accessor: 'remaining_slot' },
          ]}
          formFields={[
            { name: 'allocation_month', label: 'Month (YYYY-MM-01)', type: 'date', required: true },
            { name: 'total_slot', label: 'Total Slots', type: 'number', required: true },
          ]}
        />

        <CrudTable
          isNested={true}
          title="Sub-Staffs"
          subtitle="Manage sub-staff members under this staff."
          endpoint={`/staffs/${id}/sub-staffs/`}
          queryKey={`staff-sub-staffs-${id}`}
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Designation', accessor: 'designation' },
            { header: 'Phone', accessor: 'phone' },
          ]}
          formFields={[
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'designation', label: 'Designation', type: 'text', required: true },
            { name: 'phone', label: 'Phone', type: 'text', required: true },
          ]}
        />

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
            { header: 'Title', accessor: 'title' },
            { header: 'File', render: (item) => item.file ? <a href={item.file} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View File</a> : 'N/A' },
            { header: 'Verified', render: (item) => item.verified ? 'Yes' : 'No' },
          ]}
          formFields={[
            { name: 'title', label: 'Document Title', type: 'text', required: true },
            { name: 'file', label: 'File', type: 'file', required: true },
          ]}
        />


      </div>

    </div>
  );
}

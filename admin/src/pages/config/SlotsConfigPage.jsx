import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  TrashIcon, 
  CalendarIcon, 
  XMarkIcon, 
  PencilSquareIcon, 
  UserGroupIcon, 
  ShieldExclamationIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Pagination from '../../components/common/Pagination';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function SlotsConfigPage() {
  const queryClient = useQueryClient();

  // Automatic Month Filter (Defaults to Current Month YYYY-MM)
  const currentDate = new Date();
  const autoMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [filterMonth, setFilterMonth] = useState(autoMonthString);
  const [page, setPage] = useState(1);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignStaffId, setAssignStaffId] = useState('');
  const [assignTotalSlot, setAssignTotalSlot] = useState(10);
  const [assignError, setAssignError] = useState('');

  const [editingSlotData, setEditingSlotData] = useState(null); // { staff, slot }
  const [editTotalSlot, setEditTotalSlot] = useState(0);
  const [editError, setEditError] = useState('');

  // Selected slot for viewing assigned applicants
  const [selectedSlotForApplicants, setSelectedSlotForApplicants] = useState(null); // { staff, slot }

  // Fetch applicants using the selected slot
  const { data: slotApplicants, isLoading: isLoadingSlotApplicants } = useQuery({
    queryKey: ['slot-applicants', selectedSlotForApplicants?.slot?.id],
    queryFn: () => api.get('/applicants/', { params: { slot: selectedSlotForApplicants?.slot?.id } }).then(r => r.data.results ?? r.data),
    enabled: !!selectedSlotForApplicants?.slot?.id,
  });

  // Fetch staff members
  const { data: staffsData, isLoading: isStaffsLoading } = useQuery({
    queryKey: ['config-staffs-with-slots'],
    queryFn: () => api.get('/staffs/', { params: { page_size: 1000 } }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const staffs = staffsData?.results ?? (Array.isArray(staffsData) ? staffsData : []);

  // Process staff with slot details for the currently selected month
  const staffSlotList = useMemo(() => {
    if (!staffs) return [];
    return staffs.map(staff => {
      const slotForMonth = staff.monthly_slots?.find(slot => 
        slot.allocation_month && slot.allocation_month.startsWith(filterMonth)
      );
      const usedSlots = slotForMonth 
        ? (slotForMonth.used_slots !== undefined && slotForMonth.used_slots !== null
            ? Number(slotForMonth.used_slots)
            : Math.max(0, Number(slotForMonth.total_slot || 0) - Number(slotForMonth.remaining_slot || 0)))
        : 0;

      const remainingSlots = slotForMonth
        ? (slotForMonth.remaining_slot !== undefined && slotForMonth.remaining_slot !== null
            ? Number(slotForMonth.remaining_slot)
            : Math.max(0, Number(slotForMonth.total_slot || 0) - usedSlots))
        : 0;

      return {
        ...staff,
        slotForMonth: slotForMonth ? { ...slotForMonth, remaining_slot: remainingSlots, used_slots: usedSlots } : null,
        usedSlots,
        hasSlotForMonth: !!slotForMonth,
      };
    });
  }, [staffs, filterMonth]);

  // Filter staff members who have allocated slots in the selected month
  const allocatedStaffs = useMemo(() => {
    return staffSlotList.filter(s => s.hasSlotForMonth);
  }, [staffSlotList]);

  const pageSize = 10;
  const totalPages = Math.ceil(allocatedStaffs.length / pageSize) || 1;
  const paginatedAllocatedStaffs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allocatedStaffs.slice(start, start + pageSize);
  }, [allocatedStaffs, page, pageSize]);

  // Staffs without slot for the selected month (for the Assign dropdown)
  const unassignedStaffs = useMemo(() => {
    return staffSlotList.filter(s => !s.hasSlotForMonth);
  }, [staffSlotList]);

  // Mutation: Assign / Create slot
  const assignSlotMutation = useMutation({
    mutationFn: ({ staffId, allocationMonth, totalSlot }) => 
      api.post(`/staffs/${staffId}/monthly-slots/`, {
        allocation_month: allocationMonth,
        total_slot: totalSlot,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-staffs-with-slots']);
      queryClient.invalidateQueries(['staffs']);
      toast.success('Slot allocated successfully!');
      setShowAssignModal(false);
      setAssignStaffId('');
      setAssignTotalSlot(10);
      setAssignError('');
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.allocation_month) {
        setAssignError(data.allocation_month.join(' '));
      } else if (data?.detail) {
        setAssignError(data.detail);
      } else {
        setAssignError('Failed to assign slot. Please check inputs.');
      }
    }
  });

  // Mutation: Edit / Update slot
  const editSlotMutation = useMutation({
    mutationFn: ({ staffId, slotId, totalSlot }) => 
      api.patch(`/staffs/${staffId}/monthly-slots/${slotId}/`, {
        total_slot: totalSlot,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-staffs-with-slots']);
      queryClient.invalidateQueries(['staffs']);
      toast.success('Slot allocation updated!');
      setEditingSlotData(null);
      setEditError('');
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.detail) {
        setEditError(data.detail);
      } else if (data?.total_slot) {
        setEditError(data.total_slot.join(' '));
      } else {
        setEditError('Failed to update slot.');
      }
    }
  });

  // Mutation: Delete slot
  const deleteSlotMutation = useMutation({
    mutationFn: ({ staffId, slotId }) => 
      api.delete(`/staffs/${staffId}/monthly-slots/${slotId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-staffs-with-slots']);
      queryClient.invalidateQueries(['staffs']);
      toast.success('Slot entry deleted successfully!');
    },
    onError: (err) => {
      const msg = err?.response?.data?.detail || 'Failed to delete slot entry.';
      toast.error(msg);
    }
  });

  const handleOpenAssignModal = () => {
    setAssignError('');
    if (unassignedStaffs.length > 0) {
      setAssignStaffId(String(unassignedStaffs[0].id));
    } else if (staffSlotList.length > 0) {
      setAssignStaffId(String(staffSlotList[0].id));
    } else {
      setAssignStaffId('');
    }
    setShowAssignModal(true);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignStaffId) {
      setAssignError('Please select a staff member.');
      return;
    }
    if (!assignTotalSlot || Number(assignTotalSlot) <= 0) {
      setAssignError('Total slot must be greater than 0.');
      return;
    }

    const formattedMonth = `${filterMonth}-01`;
    assignSlotMutation.mutate({
      staffId: assignStaffId,
      allocationMonth: formattedMonth,
      totalSlot: Number(assignTotalSlot),
    });
  };

  const handleOpenEdit = (staff, slot) => {
    setEditingSlotData({ staff, slot });
    setEditTotalSlot(slot.total_slot);
    setEditError('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingSlotData) return;
    const { staff, slot } = editingSlotData;

    if (Number(editTotalSlot) < staff.usedSlots) {
      setEditError(`Cannot set total slot lower than used slots (${staff.usedSlots}).`);
      return;
    }

    editSlotMutation.mutate({
      staffId: staff.id,
      slotId: slot.id,
      totalSlot: Number(editTotalSlot),
    });
  };

  const handleDeleteSlot = (staff, slot) => {
    if (staff.usedSlots > 0) {
      toast.error(`⚠️ Cannot delete slot: ${staff.usedSlots} applicant slot(s) are already used for ${filterMonth}.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${staff.full_name}'s slot entry for ${filterMonth}?`)) {
      deleteSlotMutation.mutate({ staffId: staff.id, slotId: slot.id });
    }
  };

  // Format month heading for display (e.g. "July 2026")
  const formattedMonthDisplay = useMemo(() => {
    try {
      const [y, m] = filterMonth.split('-');
      const d = new Date(Number(y), Number(m) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return filterMonth;
    }
  }, [filterMonth]);

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Monthly Slots Allocation</h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-extrabold uppercase">
              {formattedMonthDisplay}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            Manage staff slots for the selected month. Used slots cannot be deleted.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Automatic Month Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Month:</span>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Assign Slot Button */}
          <button
            onClick={handleOpenAssignModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            Assign Slot
          </button>
        </div>
      </div>

      {/* Staff Slots Table */}
      {isStaffsLoading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs font-semibold mt-3">Loading monthly slots for {formattedMonthDisplay}...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Staff Member</th>
                  <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Month</th>
                  <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Total</th>
                  <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Used / Remaining</th>
                  <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedAllocatedStaffs.map(staff => {
                  const slot = staff.slotForMonth;
                  const isUsed = staff.usedSlots > 0;

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Staff Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                            {staff.full_name?.charAt(0) || 'S'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate">{staff.full_name || staff.username || `Staff #${staff.id}`}</p>
                            <p className="text-[11px] text-slate-400 font-medium truncate">{staff.designation || staff.role || 'Agent'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Month */}
                      <td className="px-4 py-3 font-semibold text-slate-600 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px]">
                          {slot.allocation_month}
                        </span>
                      </td>

                      {/* Total Slots */}
                      <td className="px-4 py-3 font-bold text-slate-800 text-xs">
                        {slot.total_slot}
                      </td>

                      {/* Used / Remaining */}
                      <td className="px-4 py-3 text-xs font-semibold">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedSlotForApplicants({ staff, slot })}
                            className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Click to view applicants using this slot"
                          >
                            <EyeIcon className="w-3 h-3" />
                            Used: {staff.usedSlots}
                          </button>
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded text-[11px] font-bold">
                            Rem: {slot.remaining_slot}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        {isUsed ? (
                          <button
                            type="button"
                            onClick={() => setSelectedSlotForApplicants({ staff, slot })}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 hover:bg-amber-200/80 text-amber-800 rounded-full font-bold text-[11px] transition-colors cursor-pointer"
                            title="Click to view assigned applicants"
                          >
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            In Use ({staff.usedSlots})
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Unused (0 used)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(staff, slot)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-blue-200/60"
                            title="Edit Allocated Slot"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                            Edit
                          </button>

                          {/* Delete Button */}
                          {isUsed ? (
                            <button
                              onClick={() => handleDeleteSlot(staff, slot)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed border border-slate-200/60 opacity-70"
                              title={`Cannot delete: ${staff.usedSlots} applicant slot(s) already used for ${filterMonth}`}
                            >
                              <ShieldExclamationIcon className="w-3.5 h-3.5 text-amber-500" />
                              Locked
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteSlot(staff, slot)}
                              disabled={deleteSlotMutation.isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-red-200/60"
                              title="Delete Unused Slot Entry"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {allocatedStaffs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                          <UserGroupIcon className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-700 text-sm">No slots assigned for {formattedMonthDisplay}</p>
                        <p className="text-slate-400 text-xs">
                          Click the "Assign Slot" button above to allocate applicant slots to a staff member for this month.
                        </p>
                        <button
                          onClick={handleOpenAssignModal}
                          className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors"
                        >
                          Assign Slot Now
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />

      {/* Assign Slot Modal */}
      {showAssignModal && (
        <Modal title={`Assign Slot for ${formattedMonthDisplay}`} onClose={() => setShowAssignModal(false)}>
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            {assignError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <ShieldExclamationIcon className="w-4 h-4 shrink-0" />
                {assignError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Staff Member <span className="text-red-500">*</span>
              </label>
              <select
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                {unassignedStaffs.length > 0 ? (
                  unassignedStaffs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.username || `Staff #${s.id}`} ({s.designation || 'Agent'})
                    </option>
                  ))
                ) : (
                  staffSlotList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.username || `Staff #${s.id}`} ({s.hasSlotForMonth ? 'Already has slot' : 'No slot'})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Target Month
              </label>
              <input
                type="text"
                readOnly
                value={`${formattedMonthDisplay} (${filterMonth}-01)`}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Total Allocated Slot Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={assignTotalSlot}
                onChange={(e) => setAssignTotalSlot(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assignSlotMutation.isPending || !assignStaffId || !assignTotalSlot}
                className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5"
              >
                {assignSlotMutation.isPending ? 'Assigning...' : 'Assign Slot'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Slot Modal */}
      {editingSlotData && (
        <Modal title={`Edit Slot for ${editingSlotData.staff.full_name}`} onClose={() => setEditingSlotData(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <ShieldExclamationIcon className="w-4 h-4 shrink-0" />
                {editError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Staff Member
              </label>
              <input
                type="text"
                readOnly
                value={editingSlotData.staff.full_name}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Target Month
              </label>
              <input
                type="text"
                readOnly
                value={`${formattedMonthDisplay} (${editingSlotData.slot.allocation_month})`}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50"
              />
            </div>

            {/* Clickable Used Slots Banner */}
            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center text-xs font-semibold text-blue-900">
              <span>Current Used Slots:</span>
              <button
                type="button"
                onClick={() => setSelectedSlotForApplicants(editingSlotData)}
                className="font-extrabold text-blue-700 text-xs underline hover:text-blue-900 cursor-pointer flex items-center gap-1.5 bg-blue-100/70 px-2.5 py-1 rounded-lg transition-colors"
                title="Click to view all applicants using this slot"
              >
                <EyeIcon className="w-4 h-4" />
                {editingSlotData.staff.usedSlots} used (View Applicants)
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                New Total Allocated Slot Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={editingSlotData.staff.usedSlots || 1}
                value={editTotalSlot}
                onChange={(e) => setEditTotalSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                * Total slot count cannot be less than current used slots ({editingSlotData.staff.usedSlots}).
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingSlotData(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editSlotMutation.isPending || !editTotalSlot}
                className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5"
              >
                {editSlotMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Applicants Using Slot */}
      {selectedSlotForApplicants && (
        <Modal
          title={`Applicants Using Slot (${selectedSlotForApplicants.staff.full_name})`}
          onClose={() => setSelectedSlotForApplicants(null)}
        >
          <div className="space-y-4">
            <div className="text-xs text-slate-500 font-medium border-b pb-2 flex flex-wrap gap-x-3 gap-y-1">
              <span>Month: <strong className="text-slate-800">{selectedSlotForApplicants.slot.allocation_month}</strong></span>
              <span>Total: <strong className="text-slate-800">{selectedSlotForApplicants.slot.total_slot}</strong></span>
              <span>Used: <strong className="text-amber-700">{selectedSlotForApplicants.staff.usedSlots}</strong></span>
              <span>Remaining: <strong className="text-emerald-700">{selectedSlotForApplicants.slot.remaining_slot}</strong></span>
            </div>

            {isLoadingSlotApplicants ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-xs mt-2 font-medium">Loading applicants using this slot...</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {slotApplicants?.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">{applicant.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ID: {applicant.application_id} | Passport: {applicant.passport_number || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold">
                        {applicant.status_name || applicant.status?.name || (typeof applicant.status === 'string' ? applicant.status : 'Active')}
                      </span>
                      <Link
                        to={`/applicants/${applicant.id}`}
                        target="_blank"
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
                        title="View Applicant Profile (Opens in new tab)"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}

                {(!slotApplicants || slotApplicants.length === 0) && (
                  <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                    No applicants assigned to this slot yet.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedSlotForApplicants(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

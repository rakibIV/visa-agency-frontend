import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, CalendarIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
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

  // Overview state
  const currentDate = new Date();
  const currentMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [filterMonth, setFilterMonth] = useState(currentMonthString);
  const [selectedStaff, setSelectedStaff] = useState(null); // When not null, we are in "Detail View"

  // Fetch ALL staffs (now includes monthly_slots due to backend update)
  const { data: staffs, isLoading: isStaffsLoading } = useQuery({
    queryKey: ['config-staffs-with-slots'],
    queryFn: () => api.get('/staffs/').then((r) => r.data.results ?? r.data),
    staleTime: 1000 * 60 * 5,
  });

  // Calculate stats for the selected month across all staffs
  const staffsWithCurrentMonthSlot = useMemo(() => {
    if (!staffs) return [];
    return staffs.map(staff => {
      // Find slot for the selected month
      // The API returns allocation_month like '2026-07-01'. We only care about YYYY-MM
      const slotForMonth = staff.monthly_slots?.find(slot => slot.allocation_month.startsWith(filterMonth));
      return {
        ...staff,
        slotForMonth
      };
    });
  }, [staffs, filterMonth]);

  // Detail View State (managing specific staff)
  const [showAddModal, setShowAddModal] = useState(false);
  const [allocationMonth, setAllocationMonth] = useState('');
  const [totalSlot, setTotalSlot] = useState(0);

  const [editItem, setEditItem] = useState(null);
  const [editAllocationMonth, setEditAllocationMonth] = useState('');
  const [editTotalSlot, setEditTotalSlot] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const addMutation = useMutation({
    mutationFn: (newSlot) => api.post(`/staffs/${selectedStaff?.id}/monthly-slots/`, newSlot),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-staffs-with-slots']);
      setShowAddModal(false);
      setAllocationMonth(''); 
      setTotalSlot(0);
      setErrorMsg('');
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.allocation_month) {
        setErrorMsg(data.allocation_month.join(' '));
      } else {
        setErrorMsg('Failed to add slot.');
      }
    }
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/staffs/${selectedStaff?.id}/monthly-slots/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['config-staffs-with-slots']);
      setEditItem(null);
      setErrorMsg('');
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.allocation_month) {
        setErrorMsg(data.allocation_month.join(' '));
      } else {
        setErrorMsg('Failed to update slot.');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/staffs/${selectedStaff?.id}/monthly-slots/${id}/`),
    onSuccess: () => queryClient.invalidateQueries(['config-staffs-with-slots']),
  });

  const openEdit = (slot) => {
    setEditItem(slot);
    setEditAllocationMonth(slot.allocation_month);
    setEditTotalSlot(slot.total_slot);
    setErrorMsg('');
  };

  // -------------------------
  // RENDER OVERVIEW (List of Staffs)
  // -------------------------
  if (!selectedStaff) {
    return (
      <div className="space-y-6 max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Monthly Slots</h2>
            <p className="text-slate-400 text-sm mt-0.5 font-medium">Filter by month to see staff allocations</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>
        </div>

        {isStaffsLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Staff Member</th>
                  <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Slot Details for {filterMonth}</th>
                  <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffsWithCurrentMonthSlot.map(staff => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedStaff(staff)} className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                          {staff.full_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 hover:text-blue-600 transition-colors">{staff.full_name || staff.username || staff.employee_id}</p>
                          <p className="text-xs text-slate-400">{staff.designation || 'Agent'}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {staff.slotForMonth ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-xs">Assigned</span>
                          <span className="text-slate-500 font-medium">Total: {staff.slotForMonth.total_slot} | Remaining: {staff.slotForMonth.remaining_slot}</span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg font-bold text-xs">No slot assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedStaff(staff)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                      >
                        Manage Slots
                      </button>
                    </td>
                  </tr>
                ))}
                {staffsWithCurrentMonthSlot.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-semibold">No staffs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // -------------------------
  // RENDER DETAIL (Specific Staff)
  // -------------------------
  // Refetch the staff from the query cache to ensure we have the latest slots after mutation
  const activeStaff = staffs?.find(s => s.id === selectedStaff.id) || selectedStaff;
  
  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => setSelectedStaff(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold mb-2">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Staff List
          </button>
          <h2 className="text-xl font-bold text-slate-800">{activeStaff.full_name}'s Slots</h2>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">Manage all monthly slots for this staff member</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => { setShowAddModal(true); setErrorMsg(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Slot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeStaff.monthly_slots?.map((slot) => (
          <div key={slot.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-1.5 flex-1">
                <button onClick={() => openEdit(slot)} className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-sm text-left transition-colors">
                  {slot.allocation_month}
                </button>
                <p className="text-slate-500 text-xs font-semibold">Total: {slot.total_slot} | Remaining: {slot.remaining_slot}</p>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => { if (window.confirm('Delete this slot?')) deleteMutation.mutate(slot.id); }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-semibold"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Delete Slot
              </button>
            </div>
          </div>
        ))}
        {(!activeStaff.monthly_slots || activeStaff.monthly_slots.length === 0) && (
          <div className="col-span-full py-20 text-center text-slate-400 text-sm font-semibold">No slots configured for this staff.</div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Monthly Slot" onClose={() => setShowAddModal(false)}>
          <div className="space-y-3">
            {errorMsg && <div className="text-red-600 text-xs font-bold bg-red-50 p-2 rounded">{errorMsg}</div>}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Allocation Month (Date) <span className="text-red-500">*</span></label>
              <input type="date" value={allocationMonth} onChange={(e) => setAllocationMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <p className="text-[10px] text-slate-400 mt-1">Tip: Select any day in the target month (e.g., the 1st).</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Slot <span className="text-red-500">*</span></label>
              <input type="number" value={totalSlot} onChange={(e) => setTotalSlot(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold mt-4">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={addMutation.isPending || !allocationMonth || totalSlot <= 0}
              onClick={() => addMutation.mutate({ allocation_month: allocationMonth, total_slot: totalSlot })}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {addMutation.isPending ? 'Saving…' : 'Add'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal title="Edit Monthly Slot" onClose={() => setEditItem(null)}>
          <div className="space-y-3">
            {errorMsg && <div className="text-red-600 text-xs font-bold bg-red-50 p-2 rounded">{errorMsg}</div>}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Allocation Month (Date) <span className="text-red-500">*</span></label>
              <input type="date" value={editAllocationMonth} onChange={(e) => setEditAllocationMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Slot <span className="text-red-500">*</span></label>
              <input type="number" value={editTotalSlot} onChange={(e) => setEditTotalSlot(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="flex gap-2 justify-end text-sm font-semibold mt-4">
            <button onClick={() => setEditItem(null)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              disabled={editMutation.isPending || !editAllocationMonth || editTotalSlot <= 0}
              onClick={() => editMutation.mutate({ id: editItem.id, data: { allocation_month: editAllocationMonth, total_slot: editTotalSlot } })}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {editMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, CalendarDaysIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';

export default function SlotsPage() {
  const queryClient = useQueryClient();
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [allocationMonth, setAllocationMonth] = useState('');
  const [totalSlot, setTotalSlot] = useState('');

  // Fetch all staff members for selection
  const { data: staffs } = useQuery({
    queryKey: ['config-staffs-dropdown'],
    queryFn: () => api.get('/staffs/').then((r) => {
      const results = r.data.results ?? r.data;
      if (results?.length > 0 && !selectedStaffId) {
        setSelectedStaffId(results[0].id);
      }
      return results;
    }),
    staleTime: 1000 * 60 * 10,
  });

  // Fetch monthly slots for the selected staff member
  const { data: slots, isLoading } = useQuery({
    queryKey: ['staff-monthly-slots', selectedStaffId],
    queryFn: () => {
      if (!selectedStaffId) return [];
      return api.get(`/staffs/${selectedStaffId}/monthly-slots/`).then((r) => r.data.results ?? r.data);
    },
    enabled: !!selectedStaffId,
    staleTime: 1000 * 60 * 5,
  });

  const addSlotMutation = useMutation({
    mutationFn: (newSlot) => api.post(`/staffs/${selectedStaffId}/monthly-slots/`, newSlot),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-monthly-slots', selectedStaffId]);
      setShowAddModal(false);
      setAllocationMonth('');
      setTotalSlot('');
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (id) => api.delete(`/staffs/${selectedStaffId}/monthly-slots/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-monthly-slots', selectedStaffId]);
    },
  });

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Monthly Slots</h2>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">Allocate applicant slots to staff members</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Staff Selector */}
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            {staffs?.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name || `Employee #${s.employee_id || s.id}`}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedStaffId}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            <PlusIcon className="w-4 h-4" />
            Allocate Slots
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots?.map((slot) => (
            <div key={slot.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                  <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">
                    {slot.allocation_month ? new Date(slot.allocation_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'N/A'}
                  </h4>
                  <p className="text-slate-400 text-xs font-semibold mt-1">
                    Total Slots: <span className="text-slate-700 font-bold">{slot.total_slot}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Delete this slot allocation?')) {
                    deleteSlotMutation.mutate(slot.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!slots || slots.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400">
              <p className="text-sm font-semibold">No slot allocations found for this team member</p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Allocate Monthly Slots</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Allocation Month (YYYY-MM)</label>
                <input
                  type="text"
                  value={allocationMonth}
                  onChange={(e) => setAllocationMonth(e.target.value)}
                  placeholder="e.g. 2026-08"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Slots</label>
                <input
                  type="number"
                  value={totalSlot}
                  onChange={(e) => setTotalSlot(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end text-sm font-semibold">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => addSlotMutation.mutate({
                  allocation_month: allocationMonth ? `${allocationMonth}-01` : '',
                  total_slot: Number(totalSlot),
                })}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
              >
                Allocate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

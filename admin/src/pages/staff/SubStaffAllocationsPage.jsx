import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/client';

export default function SubStaffAllocationsPage() {
  const queryClient = useQueryClient();

  const [selectedStaffId, setSelectedStaffId] = useState('');
  
  // Format current month to YYYY-MM-01
  const today = new Date();
  const currentMonthValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);

  // 1. Fetch all staffs to populate dropdown
  const { data: staffsResponse, isLoading: loadingStaffs } = useQuery({
    queryKey: ['staffs'],
    queryFn: () => api.get('/staffs/').then(res => res.data),
  });
  const staffs = staffsResponse?.results || staffsResponse || [];

  // Set initial selected staff once loaded if not set
  useMemo(() => {
    if (!selectedStaffId && staffs.length > 0) {
      setSelectedStaffId(staffs[0].id);
    }
  }, [staffs, selectedStaffId]);

  // 2. Fetch selected staff's sub-staffs
  const { data: subStaffsResponse, isLoading: loadingSubStaffs } = useQuery({
    queryKey: ['sub-staffs', selectedStaffId],
    queryFn: () => api.get(`/staffs/${selectedStaffId}/sub-staffs/`).then(res => res.data),
    enabled: !!selectedStaffId,
  });
  const subStaffs = subStaffsResponse?.results || subStaffsResponse || [];

  // 3. Fetch selected staff's available slot for the selected month
  const { data: parentSlotsResponse, isLoading: loadingParentSlots } = useQuery({
    queryKey: ['staff-monthly-slots', selectedStaffId],
    queryFn: () => api.get(`/staffs/${selectedStaffId}/monthly-slots/`).then(res => res.data),
    enabled: !!selectedStaffId,
  });
  const parentSlots = parentSlotsResponse?.results || parentSlotsResponse || [];
  const activeParentSlot = parentSlots.find(s => s.allocation_month === selectedMonth);

  // 4. Fetch selected staff's sub-staff allocations for the selected month
  const { data: allocations, isLoading: loadingAllocations } = useQuery({
    queryKey: ['sub-staff-allocations', selectedStaffId, selectedMonth],
    queryFn: () => api.get(`/staffs/${selectedStaffId}/sub-staff-allocations/?allocation_month=${selectedMonth}`).then(res => res.data),
    enabled: !!selectedStaffId && !!selectedMonth,
  });

  const allocateSlotMutation = useMutation({
    mutationFn: ({ subStaffId, slotId, allocation_month, allocated_slot }) => {
      if (slotId) {
        return api.patch(`/staffs/${selectedStaffId}/sub-staffs/${subStaffId}/monthly-slots/${slotId}/`, { allocated_slot });
      } else {
        return api.post(`/staffs/${selectedStaffId}/sub-staffs/${subStaffId}/monthly-slots/`, { allocation_month, allocated_slot });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-staff-allocations', selectedStaffId, selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['staff-monthly-slots', selectedStaffId] });
      toast.success("Slot allocation updated!");
    },
    onError: (err) => {
      const data = err?.response?.data;
      const msg = data?.allocated_slot?.[0] || data?.non_field_errors?.[0] || data?.detail || 'Failed to update slot allocation.';
      toast.error(msg);
    }
  });

  const isLoading = loadingStaffs || (selectedStaffId && (loadingSubStaffs || loadingParentSlots || loadingAllocations));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header and Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sub-Staff Allocations</h2>
          <p className="text-sm text-slate-500 mt-1">Manage monthly slot allocations for all sub-staff members under a main staff.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Staff Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Main Staff</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
              disabled={loadingStaffs}
            >
              <option value="" disabled>Select a staff member</option>
              {staffs.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.full_name} ({staff.employee_id})</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Month</label>
            <input
              type="date"
              value={selectedMonth}
              onChange={(e) => {
                const date = new Date(e.target.value);
                const firstDay = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
                setSelectedMonth(firstDay);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            />
            <p className="text-xs text-slate-500 mt-1">Note: Only the month and year are considered (defaults to 1st of month).</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedStaffId ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">Please select a main staff member to view allocations.</p>
        </div>
      ) : isLoading ? (
        <div className="p-20 text-center animate-pulse text-slate-500 font-medium">Loading allocation data...</div>
      ) : !activeParentSlot ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Slots Allocated</h3>
          <p className="text-slate-500 font-medium">This main staff member does not have any slots assigned to them for the selected month.</p>
          <p className="text-sm text-slate-400 mt-1">Please allocate slots to the main staff first before assigning to sub-staffs.</p>
        </div>
      ) : subStaffs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">This main staff member has no sub-staff assigned to them.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-blue-900 text-lg">Main Staff Quota Overview</h3>
              <p className="text-blue-700 text-sm">For the month of {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
            </div>
            <div className="flex gap-6 text-sm font-semibold">
              <div className="flex flex-col">
                <span className="text-blue-600 uppercase text-xs tracking-wider">Total Slots</span>
                <span className="text-2xl text-blue-900">{activeParentSlot.total_slot}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-blue-600 uppercase text-xs tracking-wider">Remaining</span>
                <span className={`text-2xl ${activeParentSlot.remaining_slot > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {activeParentSlot.remaining_slot}
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Sub-Staff Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center w-64">Allocate Slots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subStaffs.map(subStaff => {
                    const allocation = allocations?.find(a => a.sub_staff === subStaff.id);
                    return (
                      <SubStaffRow 
                        key={subStaff.id}
                        subStaff={subStaff}
                        allocation={allocation}
                        parentSlot={activeParentSlot}
                        selectedMonth={selectedMonth}
                        allocateSlotMutation={allocateSlotMutation}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubStaffRow({ subStaff, allocation, parentSlot, selectedMonth, allocateSlotMutation }) {
  const initialAmount = allocation ? allocation.allocated_slot : 0;
  const [amount, setAmount] = useState(initialAmount);

  useMemo(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const maxCanAllocate = parentSlot.remaining_slot + initialAmount;
  const isDirty = amount !== initialAmount;

  const handleSave = () => {
    if (amount > maxCanAllocate) {
      toast.error(`Cannot allocate more than ${maxCanAllocate} slots.`);
      return;
    }
    allocateSlotMutation.mutate({
      subStaffId: subStaff.id,
      slotId: allocation?.id,
      allocation_month: selectedMonth,
      allocated_slot: Number(amount)
    });
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="p-4 pl-6">
        <div className="font-bold text-slate-800">{subStaff.name}</div>
        <div className="text-sm text-slate-500 mt-0.5">{subStaff.phone || 'No phone'}</div>
      </td>
      <td className="p-4">
        {subStaff.is_active ? (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
        ) : (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Inactive</span>
        )}
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            min="0"
            max={maxCanAllocate}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-20 text-center font-bold text-blue-700 bg-white border border-slate-200 rounded-lg py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button
            onClick={handleSave}
            disabled={!isDirty || allocateSlotMutation.isPending || amount > maxCanAllocate || amount < 0}
            className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap shadow-sm text-sm ${
              isDirty && amount <= maxCanAllocate && amount >= 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {allocateSlotMutation.isPending && isDirty && allocateSlotMutation.variables?.subStaffId === subStaff.id ? '...' : 'Save'}
          </button>
        </div>
        {amount > maxCanAllocate && (
          <div className="text-[10px] text-red-500 font-bold mt-1 text-right">Exceeds remaining!</div>
        )}
      </td>
    </tr>
  );
}

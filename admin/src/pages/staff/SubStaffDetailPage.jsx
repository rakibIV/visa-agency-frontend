import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/client';

export default function SubStaffDetailPage() {
  const { staffId, subStaffId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch sub-staff details
  const { data: subStaff, isLoading: loadingSubStaff } = useQuery({
    queryKey: ['sub-staff', staffId, subStaffId],
    queryFn: () => api.get(`/staffs/${staffId}/sub-staffs/${subStaffId}/`).then(r => r.data),
  });

  // Fetch parent staff monthly slots (to see what is available)
  const { data: parentSlots, isLoading: loadingParentSlots } = useQuery({
    queryKey: ['staff-monthly-slots', staffId],
    queryFn: () => api.get(`/staffs/${staffId}/monthly-slots/`).then(r => r.data.results ?? r.data),
  });

  // Fetch sub-staff allocated slots
  const { data: subStaffSlots, isLoading: loadingSubStaffSlots } = useQuery({
    queryKey: ['sub-staff-monthly-slots', subStaffId],
    queryFn: () => api.get(`/staffs/${staffId}/sub-staffs/${subStaffId}/monthly-slots/`).then(r => r.data.results ?? r.data),
  });

  const allocateSlotMutation = useMutation({
    mutationFn: ({ slotId, allocation_month, allocated_slot }) => {
      if (slotId) {
        // Update existing allocation
        return api.patch(`/staffs/${staffId}/sub-staffs/${subStaffId}/monthly-slots/${slotId}/`, { allocated_slot });
      } else {
        // Create new allocation
        return api.post(`/staffs/${staffId}/sub-staffs/${subStaffId}/monthly-slots/`, { allocation_month, allocated_slot });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-staff-monthly-slots', subStaffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-monthly-slots', staffId] });
    },
    onError: (err) => {
      const data = err?.response?.data;
      const msg = data?.allocated_slot?.[0] || data?.non_field_errors?.[0] || data?.detail || 'Failed to update slot allocation.';
      toast.error(msg);
    }
  });

  if (loadingSubStaff || loadingParentSlots || loadingSubStaffSlots) {
    return <div className="p-20 text-center animate-pulse text-slate-500">Loading slot data...</div>;
  }

  if (!subStaff) return <div className="p-20 text-center text-red-500">Failed to load sub-staff details.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <button onClick={() => navigate(`/staff/${staffId}`)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {subStaff.name} <span className="text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Sub-Staff</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Phone: {subStaff.phone || 'N/A'}</p>
        </div>
      </div>

      {/* Slots Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Monthly Slot Allocations</h3>
          <p className="text-sm text-slate-500">Allocate slots to {subStaff.name} from the main staff's available quota.</p>
        </div>

        {(!parentSlots || parentSlots.length === 0) ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">The main staff does not have any monthly slots allocated yet.</p>
            <p className="text-sm text-slate-400 mt-1">Please allocate slots to the main staff first.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parentSlots.map((parentSlot) => (
              <SlotCard
                key={parentSlot.id}
                parentSlot={parentSlot}
                subStaffSlots={subStaffSlots}
                allocateSlotMutation={allocateSlotMutation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SlotCard({ parentSlot, subStaffSlots, allocateSlotMutation }) {
  const allocation = subStaffSlots?.find(s => s.allocation_month === parentSlot.allocation_month);
  const initialAmount = allocation ? allocation.allocated_slot : 0;
  
  const [amount, setAmount] = useState(initialAmount);

  // Sync amount if it changes from backend
  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const monthLabel = new Date(parentSlot.allocation_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  
  const givenToOthers = parentSlot.total_slot - parentSlot.remaining_slot - initialAmount;
  const maxCanAllocate = parentSlot.remaining_slot + initialAmount;

  const handleSave = () => {
    if (amount > maxCanAllocate) {
      toast.error(`Cannot allocate more than ${maxCanAllocate} slots.`);
      return;
    }
    allocateSlotMutation.mutate({
      slotId: allocation?.id,
      allocation_month: parentSlot.allocation_month,
      allocated_slot: Number(amount)
    });
  };

  const isDirty = amount !== initialAmount;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className="mb-4 border-b border-slate-100 pb-4">
        <h4 className="font-bold text-slate-800 text-lg mb-3">{monthLabel}</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span>Total Month Capacity:</span>
            <span className="font-semibold text-slate-700">{parentSlot.total_slot}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Allocated to THIS sub-staff:</span>
            <span className="font-semibold text-blue-600">{initialAmount}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Allocated to OTHER sub-staffs:</span>
            <span className="font-semibold text-orange-600">{givenToOthers}</span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span className="text-slate-700">Unallocated (Left in Pool):</span>
            <span className={`font-bold ${parentSlot.remaining_slot > 0 ? 'text-green-600' : 'text-slate-500'}`}>
              {parentSlot.remaining_slot}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Allocate Slots</label>
        
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            max={maxCanAllocate}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full text-center text-xl font-bold text-blue-700 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSave}
            disabled={!isDirty || allocateSlotMutation.isPending || amount > maxCanAllocate || amount < 0}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              isDirty && amount <= maxCanAllocate && amount >= 0
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {allocateSlotMutation.isPending && isDirty ? 'Saving...' : 'Save'}
          </button>
        </div>
        {amount > maxCanAllocate && (
          <span className="text-xs text-red-500 text-center font-medium">Exceeds available slots!</span>
        )}
      </div>
    </div>
  );
}

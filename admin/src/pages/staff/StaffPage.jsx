import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import Pagination from '../../components/common/Pagination';

export default function StaffPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Fetch staff list
  const { data, isLoading, isError } = useQuery({
    queryKey: ['staffs', search, page],
    queryFn: () => api.get('/staffs/', { params: { page, ...(search ? { search } : {}) } }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const staffs = data?.results ?? data ?? [];
  const totalPages = data?.count ? Math.ceil(data.count / 20) : 1;

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Staff & Team</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage office representatives and agents</p>
        </div>
        <motion.button
          onClick={() => navigate('/staff/new')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold shadow hover:bg-blue-800 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Team Member
        </motion.button>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email, phone or employee ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Staff Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm mt-3">Loading staff...</p>
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-red-500 font-medium">
          Failed to load team members.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffs?.map((staff) => (
            <div
              key={staff.id}
              onClick={() => navigate(`/staff/${staff.id}`)}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative"
            >
              {/* Photo & Basic Details */}
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                  {staff.photo ? (
                    <img src={staff.photo} alt={staff.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">
                    {staff.employee_id || `ID: #${staff.id}`}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm truncate mt-0.5 group-hover:text-blue-700">{staff.full_name || 'No Name'}</h4>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">{staff.designation || 'Representative'}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase
                  ${staff.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {staff.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Contacts */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{staff.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-slate-400" />
                  <span>{staff.phone || 'No phone'}</span>
                </div>
              </div>
            </div>
          ))}

          {(!staffs || staffs.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400">
              <UserIcon className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No team members found</p>
            </div>
          )}
        </div>
      )}

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
}

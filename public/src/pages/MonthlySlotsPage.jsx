import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import StaffProfileModal from '../components/ui/StaffProfileModal';
import logoImg from '../assets/logo.png';

const getCountryFlag = (country) => {
  if (!country) return '🌍';
  const c = country.toLowerCase();
  if (c.includes('saudi') || c.includes('ksa')) return '🇸🇦';
  if (c.includes('arab emirates') || c.includes('uae') || c.includes('dubai')) return '🇦🇪';
  if (c.includes('egypt')) return '🇪🇬';
  if (c.includes('qatar')) return '🇶🇦';
  if (c.includes('bangladesh')) return '🇧🇩';
  if (c.includes('pakistan')) return '🇵🇰';
  if (c.includes('india')) return '🇮🇳';
  if (c.includes('kuwait')) return '🇰🇼';
  if (c.includes('oman')) return '🇴🇲';
  if (c.includes('bahrain')) return '🇧🇭';
  return '🌍';
};

export default function MonthlySlotsPage() {
  const { data: slots, isLoading } = useQuery({
    queryKey: ['monthly-slots'],
    queryFn: () => api.get('/public/staff-slots/current-month/').then(r => r.data),
  });

  const { data: companyInfo } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then((r) => r.data.results?.[0] ?? r.data?.[0]),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Calculate zoom level to fit 800px table into mobile screens
  useEffect(() => {
    const updateZoom = () => {
      const width = window.innerWidth;
      // Subtracting approx 32px for padding on mobile
      if (width < 800) {
        setZoomLevel((width - 32) / 800);
      } else {
        setZoomLevel(1);
      }
    };
    
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  const currentMonthFormatted = new Date().toLocaleString('default', { month: 'short', year: '2-digit' }).replace(' ', '-');
  const totalSlots = slots?.reduce((acc, curr) => acc + (curr.total_slot || 0), 0) || 0;

  return (
    <div className="bg-[#f8fafd] min-h-screen pb-24 font-sans">
      <section 
        className="container max-w-7xl mx-auto pt-32 pb-16 lg:pt-40 lg:pb-24 px-4 sm:px-6 relative z-10 origin-top"
        style={{ 
          zoom: zoomLevel < 1 ? zoomLevel : 1,
          paddingTop: zoomLevel < 1 
            ? `${(typeof window !== 'undefined' && window.innerWidth >= 1024 ? 160 : 128) / zoomLevel}px` 
            : undefined
        }}
      >
        
        {/* Premium Top Dashboard Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] shadow-soft border border-white/80 relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-accent-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none" />
          
          {/* Logo and Company Details (left) */}
          <div className="relative z-10 shrink-0 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 group cursor-default w-full md:w-auto">
            {companyInfo?.company_logo ? (
              <img src={companyInfo.company_logo.startsWith('http') ? companyInfo.company_logo : `https://res.cloudinary.com/prfvuhln/${companyInfo.company_logo}`} alt={companyInfo.company_name} className="h-16 md:h-24 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <img src={logoImg} alt="Default Logo" className="h-16 md:h-24 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-500" />
            )}
            <div className="flex flex-col text-center md:text-left justify-center">
              <h2 className="text-xl md:text-2xl font-black text-navy-900 uppercase tracking-wide">
                {companyInfo?.company_name || 'Global Visa Services'}
              </h2>
              {(companyInfo?.email || companyInfo?.phone) && (
                <div className="text-xs font-semibold text-navy-500 mt-1 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {companyInfo?.phone && <span>📞 {companyInfo.phone}</span>}
                  {companyInfo?.email && <span>✉️ {companyInfo.email}</span>}
                </div>
              )}
              {companyInfo?.address && (
                <div className="text-xs font-medium text-navy-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                  <span>📍</span> {companyInfo.address}
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Month Card */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-3xl p-5 flex items-center gap-5 min-w-[200px] shadow-card border border-navy-700/50 hover:shadow-hover transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner">
                <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <div className="text-[10px] font-bold text-blue-200/80 uppercase tracking-widest mb-1">Timeline</div>
                <div className="text-xl sm:text-2xl font-black tracking-tight">{currentMonthFormatted}</div>
              </div>
            </div>

            {/* Total Slot Card */}
            <div className="bg-gradient-to-br from-[#c69a5a] to-[#a87b40] text-white rounded-3xl p-5 flex items-center gap-5 min-w-[200px] shadow-card border border-white/20 hover:shadow-hover transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner">
                <GroupIcon fontSize="medium" className="text-[#ffeac9]" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#ffeac9]/80 uppercase tracking-widest mb-1">Target Capacity</div>
                <div className="text-xl sm:text-2xl font-black tracking-tight">{totalSlots}</div>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full h-64 bg-white rounded-[2rem] shadow-soft animate-pulse flex items-center justify-center">
            <span className="text-navy-300 font-bold uppercase tracking-widest text-sm">Loading Roster...</span>
          </div>
        ) : slots?.length === 0 ? (
          <div className="w-full bg-white rounded-[2rem] shadow-soft p-16 text-center border border-navy-50">
            <GroupIcon sx={{ fontSize: 64 }} className="text-navy-200 mb-4 mx-auto" />
            <h3 className="text-2xl font-black text-navy-900 mb-2">No Active Roster</h3>
            <p className="text-navy-500 font-medium">The staff slots for this month are currently empty.</p>
          </div>
        ) : (
          <>


            {/* FULL TABLE VIEW (For all screens) */}
            <div className="bg-white rounded-[2rem] shadow-card border border-navy-50 overflow-hidden">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-navy-900 text-white border-b border-navy-800">
                    <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em] w-24 text-center">
                      No
                    </th>
                    <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em]">
                      Consultant
                    </th>
                    <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em]">
                      Region
                    </th>
                    <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em] text-center w-32">
                      Gender
                    </th>
                    <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em] text-center w-32">
                      Capacity
                    </th>
                    <th className="py-5 px-6 font-bold text-[11px] uppercase tracking-[0.2em] text-center w-40">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50/50">
                  {slots?.map((slot, index) => {
                    const rowBg = index % 2 === 0 ? "bg-white" : "bg-[#fbfcfd]";
                    return (
                      <tr key={slot.id} className={`${rowBg} hover:bg-navy-50/40 transition-colors duration-200 group`}>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex w-8 h-8 rounded-xl bg-navy-50 text-navy-900 items-center justify-center font-bold text-sm group-hover:bg-accent-50 group-hover:text-accent-700 transition-colors">
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-navy-900 text-[15px]">{slot.staff_name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-navy-50 flex items-center justify-center text-lg leading-none">
                              {getCountryFlag(slot.nationality)}
                            </div>
                            <span className="font-semibold text-navy-700 text-sm">{slot.nationality || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase w-full ${
                            slot.gender?.toLowerCase() === 'female' 
                              ? 'bg-pink-50 text-pink-600 border border-pink-100' 
                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {slot.gender ? slot.gender : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="font-black text-navy-900 text-lg">
                            {slot.total_slot}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {slot.staff_slug ? (
                            <button
                              onClick={() => setSelectedStaff({ slug: slot.staff_slug, name: slot.staff_name })}
                              className="inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-accent-600 transition-all duration-300 text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl w-full shadow-sm hover:shadow-md"
                            >
                              PROFILE
                            </button>
                          ) : (
                            <span className="text-[10px] text-navy-300 font-bold uppercase tracking-widest">N/A</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Staff Profile Modal */}
      <StaffProfileModal
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        staffSlug={selectedStaff?.slug}
        staffName={selectedStaff?.name}
      />
    </div>
  );
}

import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  TagIcon, 
  QueueListIcon,
  IdentificationIcon,
  ScaleIcon,
  Cog6ToothIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const SETTINGS_NAV = [
  { label: 'Company Info', to: '/settings/company', icon: BuildingOfficeIcon, desc: 'Branding, contact info & details' },
  { label: 'Offices / Branches', to: '/settings/offices', icon: MapPinIcon, desc: 'Manage agency branch locations' },
  { label: 'Staff Designations', to: '/settings/designations', icon: IdentificationIcon, desc: 'Job titles and roles' },
  { label: 'Application Statuses', to: '/settings/statuses', icon: QueueListIcon, desc: 'Workflow status definitions' },
  { label: 'Applicant Tags', to: '/settings/tags', icon: TagIcon, desc: 'Color tags for organization' },
  { label: 'Lawyers', to: '/settings/lawyers', icon: ScaleIcon, desc: 'Legal representatives & partners' },
];

export default function SettingsLayout() {
  const location = useLocation();

  if (location.pathname === '/settings' || location.pathname === '/settings/') {
    return <Navigate to="/settings/company" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 text-blue-300 shadow-inner">
              <Cog6ToothIcon className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">System Settings</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5 font-medium">Manage global company branding, branches, designations, and workflow configurations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE HORIZONTAL TABS (screens < md) */}
      <div className="block md:hidden bg-white rounded-2xl p-2 shadow-sm border border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex gap-2">
          {SETTINGS_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* DESKTOP SIDEBAR + CONTENT LAYOUT (screens >= md) */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Settings Desktop Navigation */}
        <div className="hidden md:block w-72 shrink-0 bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-1">
          <div className="px-4 py-3 border-b border-slate-100 mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuration Categories</h3>
          </div>
          <nav className="space-y-1.5">
            {SETTINGS_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <item.icon className="w-4 h-4 text-slate-600 group-hover:text-blue-700 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate leading-tight font-bold">{item.label}</span>
                    <span className="block truncate text-[11px] text-slate-400 font-normal mt-0.5">{item.desc}</span>
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Settings Main Body Outlet Container */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-slate-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  TagIcon, 
  QueueListIcon,
  IdentificationIcon,
  ScaleIcon,
  EnvelopeIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const SETTINGS_NAV = [
  { label: 'Company Info', to: '/settings/company', icon: BuildingOfficeIcon },
  { label: 'Offices / Branches', to: '/settings/offices', icon: MapPinIcon },
  { label: 'Staff Designations', to: '/settings/designations', icon: IdentificationIcon },
  { label: 'Application Statuses', to: '/settings/statuses', icon: QueueListIcon },
  { label: 'Applicant Tags', to: '/settings/tags', icon: TagIcon },
  { label: 'Lawyers', to: '/settings/lawyers', icon: ScaleIcon },
];

export default function SettingsLayout() {
  const location = useLocation();

  if (location.pathname === '/settings' || location.pathname === '/settings/') {
    return <Navigate to="/settings/company" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Settings</h2>
        <nav className="space-y-1">
          {SETTINGS_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

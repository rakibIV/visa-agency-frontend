import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  UsersIcon,
  IdentificationIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  ArrowUturnLeftIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Squares2X2Icon, to: '/dashboard' },
  { label: 'Applicants', icon: UsersIcon, to: '/applicants' },
  { label: 'Refunds', icon: ArrowUturnLeftIcon, to: '/refunds' },
  { label: 'Agreements', icon: DocumentCheckIcon, to: '/agreements' },
  { label: 'Staff', icon: IdentificationIcon, to: '/staff' },
  {
    label: 'Configuration',
    icon: ClipboardDocumentListIcon,
    children: [
      { label: 'Countries', icon: GlobeAltIcon, to: '/config/countries' },
      { label: 'Visas', icon: PaperAirplaneIcon, to: '/config/visas' },
      { label: 'Jobs', icon: BriefcaseIcon, to: '/config/jobs' },
      { label: 'FAQs', icon: QuestionMarkCircleIcon, to: '/config/faqs' },
    ],
  },
];

function NavItem({ item, collapsed }) {
  const location = useLocation();
  const isChildActive = item.children?.some((c) => location.pathname.startsWith(c.to));
  const [open, setOpen] = useState(isChildActive || false);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
            ${isChildActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
        >
          <item.icon className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>
        <AnimatePresence initial={false}>
          {open && !collapsed && (
            <motion.div
              key="submenu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-3 mt-1 border-l border-white/10 pl-3 space-y-0.5 pb-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                      ${isActive ? 'bg-white/20 text-white font-semibold' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`
                    }
                  >
                    <child.icon className="w-4 h-4 shrink-0" />
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
        ${isActive
          ? 'bg-white/15 text-white shadow-inner ring-1 ring-white/10'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'}`
      }
    >
      <item.icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitle = (() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/applicants')) return 'Applicants';
    if (path.startsWith('/staff')) return 'Staff';
    if (path.startsWith('/config/countries')) return 'Countries';
    if (path.startsWith('/config/visas')) return 'Visas';
    if (path.startsWith('/config/jobs')) return 'Jobs';
    if (path.startsWith('/config/faqs')) return 'FAQs';
    return 'Admin';
  })();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* ===== SIDEBAR ===== */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex flex-col h-full bg-gradient-to-b from-[#0d1f4e] via-[#152f6e] to-[#1e3a8a] shadow-2xl z-20 shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <span className="text-blue-800 font-black text-sm tracking-tight">VA</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">Visa Agency</p>
              <p className="text-blue-300/80 text-xs whitespace-nowrap">Management System</p>
            </div>
          )}
        </div>

        {/* Nav — scrollable middle section */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Bottom user section — fixed, never gets pushed off screen */}
        <div className="shrink-0 border-t border-white/10 px-3 py-3 space-y-1">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <UserCircleIcon className="w-7 h-7 text-blue-300 shrink-0" />
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
                <p className="text-blue-300/70 text-xs">Administrator</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <UserCircleIcon className="w-7 h-7 text-blue-300" />
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors
              ${collapsed ? 'justify-center' : ''}`}
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shadow-sm shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-slate-800 font-semibold text-sm leading-tight">{pageTitle}</h1>
              <p className="text-slate-400 text-xs">Visa Agency Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{user?.username}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
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
  Cog8ToothIcon,
  MegaphoneIcon,
  StarIcon,
  ChatBubbleLeftEllipsisIcon,
  LinkIcon,
  RectangleStackIcon,
  TagIcon,
  CalendarIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Squares2X2Icon, to: '/dashboard' },
  {
    label: 'Applicants',
    icon: UsersIcon,
    children: [
      { label: 'All Applicants', icon: UsersIcon, to: '/applicants' },
      { label: 'Status Updates', icon: ArrowPathIcon, to: '/applicants/statuses' },
      { label: 'Deleted Applicants', icon: TrashIcon, to: '/applicants/deleted' },
    ],
  },
  { label: 'Refunds', icon: ArrowUturnLeftIcon, to: '/refunds' },
  { label: 'Agreements', icon: DocumentCheckIcon, to: '/agreements' },
  {
    label: 'Staff',
    icon: IdentificationIcon,
    children: [
      { label: 'Staff List', icon: UsersIcon, to: '/staff' },
      { label: 'Sub-Staff Allocations', icon: BriefcaseIcon, to: '/staff/allocations' },
    ],
  },
  {
    label: 'Website Content',
    icon: GlobeAltIcon,
    children: [
      { label: 'Services', icon: RectangleStackIcon, to: '/website/services' },
      { label: 'Notices', icon: MegaphoneIcon, to: '/website/notices' },
      { label: 'Reviews', icon: StarIcon, to: '/website/reviews' },
      { label: 'Messages', icon: ChatBubbleLeftEllipsisIcon, to: '/website/messages' },
      { label: 'App Requests', icon: ClipboardDocumentListIcon, to: '/website/application-requests' },
      { label: 'Social Links', icon: LinkIcon, to: '/website/social-links' },
      { label: 'Fake Live Results', icon: ClipboardDocumentListIcon, to: '/website/fake-live-results' },
      { label: 'Agency Images', icon: RectangleStackIcon, to: '/website/agency-images' },
    ],
  },
  {
    label: 'Communication',
    icon: EnvelopeIcon,
    children: [
      { label: 'Send Email', icon: PaperAirplaneIcon, to: '/communication/send-email' },
      { label: 'Templates', icon: DocumentTextIcon, to: '/communication/templates' },
    ],
  },
  {
    label: 'Configuration',
    icon: ClipboardDocumentListIcon,
    children: [
      { label: 'Countries', icon: GlobeAltIcon, to: '/config/countries' },
      { label: 'Currencies', icon: BriefcaseIcon, to: '/config/currencies' },
      { label: 'Visa Categories', icon: TagIcon, to: '/config/visa-categories' },
      { label: 'Visas', icon: PaperAirplaneIcon, to: '/config/visas' },
      { label: 'Jobs', icon: BriefcaseIcon, to: '/config/jobs' },
      { label: 'Slots Config', icon: CalendarIcon, to: '/config/slots' },
      { label: 'Allocate Slots', icon: CalendarIcon, to: '/slots' },
    ],
  },
  { label: 'Settings', icon: Cog8ToothIcon, to: '/settings' },
];

function NavItem({ item, collapsed, onNavClick, notificationCounts }) {
  const location = useLocation();
  const isChildActive = item.children?.some((c) => location.pathname.startsWith(c.to));
  const [open, setOpen] = useState(isChildActive || false);

  const getBadgeCount = (label) => {
    if (!notificationCounts) return 0;
    if (label === 'Messages') return notificationCounts.unread_messages;
    if (label === 'App Requests') return notificationCounts.pending_requests;
    return 0;
  };

  const parentBadgeCount = item.children 
    ? item.children.reduce((acc, child) => acc + getBadgeCount(child.label), 0)
    : getBadgeCount(item.label);

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
              {parentBadgeCount > 0 && !open && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-2">
                  {parentBadgeCount}
                </span>
              )}
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
                    onClick={onNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                      ${isActive ? 'bg-white/20 text-white font-semibold' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`
                    }
                  >
                    <child.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{child.label}</span>
                    {getBadgeCount(child.label) > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {getBadgeCount(child.label)}
                      </span>
                    )}
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
      onClick={onNavClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
        ${isActive
          ? 'bg-white/15 text-white shadow-inner ring-1 ring-white/10'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'}`
      }
    >
      <item.icon className="w-5 h-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {parentBadgeCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {parentBadgeCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function AdminLayout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: notificationCounts } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => api.get('/admin-notifications/').then(r => r.data),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const { data: companyInfo } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then(r => r.data.results?.[0] || r.data?.[0] || {}).catch(() => ({})),
    staleTime: 1000 * 60 * 60,
  });

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
    if (path.startsWith('/config/slots')) return 'Slots';
    return 'Admin';
  })();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">

      {/* ===== MOBILE BACKDROP ===== */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <motion.aside
        animate={{ 
          width: isMobile ? 260 : (collapsed ? 68 : 260),
          x: isMobile ? (collapsed ? -260 : 0) : 0 
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`fixed lg:relative flex flex-col h-full bg-gradient-to-b from-[#0d1f4e] via-[#152f6e] to-[#1e3a8a] shadow-2xl z-40 shrink-0 overflow-hidden top-0 left-0`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden p-1">
            {companyInfo?.company_logo ? (
              <img src={companyInfo.company_logo.startsWith('http') ? companyInfo.company_logo : `https://res.cloudinary.com/prfvuhln/${companyInfo.company_logo}`} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-blue-800 font-black text-sm tracking-tight">AR</span>
            )}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">{companyInfo?.company_name || 'Al Raiyan Group'}</p>
              <p className="text-blue-300/80 text-xs whitespace-nowrap">Management System</p>
            </div>
          )}
        </div>

        {/* Nav — scrollable middle section */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} item={item} collapsed={collapsed && !isMobile} onNavClick={handleNavClick} notificationCounts={notificationCounts} />
          ))}
        </nav>

        {/* Bottom user section — fixed, never gets pushed off screen */}
        <div className="shrink-0 border-t border-white/10 px-3 py-3 space-y-1">
          {(!collapsed || isMobile) ? (
            <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <UserCircleIcon className="w-7 h-7 text-blue-300 shrink-0" />
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
                <p className="text-blue-300/70 text-xs">Administrator</p>
              </div>
            </NavLink>
          ) : (
            <NavLink to="/profile" className="flex justify-center py-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
              <UserCircleIcon className="w-7 h-7 text-blue-300" />
            </NavLink>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors
              ${collapsed ? 'justify-center' : ''}`}
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5 shrink-0" />
            {(!collapsed || isMobile) && <span>Sign Out</span>}
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
              <p className="hidden sm:block text-slate-400 text-xs">Visa Agency Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/profile" className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer">
              <UserCircleIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{user?.username}</span>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

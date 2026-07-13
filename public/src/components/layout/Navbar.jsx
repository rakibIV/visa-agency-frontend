import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import logo from '../../assets/logo.png';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/countries', label: 'Destinations' },
  { to: '/visas', label: 'Visas' },
  { to: '/visa-updates', label: 'Latest Results' },
  { to: '/monthly-slots', label: 'Slots' },
  { to: '/notices', label: 'Notices' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const { data: company } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then(r => {
      const results = r.data.results ?? r.data;
      return Array.isArray(results) ? results[0] : results;
    }),
  });

  const { data: socialLinks } = useQuery({
    queryKey: ['social-links'],
    queryFn: () => api.get('/social-links/').then(r => r.data.results ?? r.data),
  });

  const { data: notices } = useQuery({
    queryKey: ['notices'],
    queryFn: () => api.get('/notices/').then(r => r.data.results ?? r.data),
  });

  const activeNotices = notices?.filter(n => n.is_active) || [];

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const showSolid = scrolled || !isHome;

  return (
    <>
      {/* Top Bar - Hidden on mobile, shows contact info */}
      <div className={`hidden lg:block w-full transition-all duration-300 ${scrolled ? 'h-0 overflow-hidden opacity-0' : 'h-10 bg-navy-900 border-b border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between text-xs text-navy-200 font-medium">
          <div className="flex items-center gap-6 overflow-hidden w-full lg:w-3/4">
            {company?.phone && (
              <a href={`tel:${company.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                {company.phone}
              </a>
            )}
            {company?.email && (
              <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                {company.email}
              </a>
            )}
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              Mon - Sat: 9:00 AM - 6:00 PM
            </span>
          </div>
          <div className="flex items-center gap-4">
             {socialLinks?.filter(s => s.is_active).map(s => (
               <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="hover:text-white transition-colors capitalize">
                 {s.platform}
               </a>
             ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'top-0' : 'top-0 lg:top-10'} ${
          showSolid
            ? 'bg-white/95 backdrop-blur-xl shadow-soft border-b border-navy-100/50'
            : 'bg-transparent border-b border-navy-100/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${showSolid ? 'h-20' : 'h-24'}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logo} alt="Logo" className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="hidden sm:block">
                <span className="text-xl font-black tracking-tight transition-colors font-heading text-navy-900">
                  {company?.company_name || 'ARG Visa'}
                </span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.25em] -mt-1 transition-colors text-accent-600">
                  Agency
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 ${
                      isActive
                        ? 'text-accent-600 bg-accent-50'
                        : 'text-navy-700 hover:text-accent-600 hover:bg-navy-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-4">
              <Link
                to="/status-check"
                className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 hover:-translate-y-0.5 bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-600/30"
              >
                Track Status
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-full transition-colors text-navy-900 bg-navy-50 hover:bg-navy-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-6 pt-8">
                <div className="flex items-center justify-between mb-8">
                  <img src={logo} alt="Logo" className="h-10 w-auto" />
                  <button onClick={() => setMobileOpen(false)} className="p-2 text-navy-400 hover:text-accent-600 bg-navy-50 rounded-full">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `block px-5 py-4 text-lg font-bold rounded-2xl transition-all ${
                          isActive
                            ? 'text-accent-600 bg-accent-50'
                            : 'text-navy-900 hover:bg-navy-50'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-navy-100 space-y-4">
                  <Link
                    to="/status-check"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-accent-600 hover:bg-accent-700 text-white text-base font-bold rounded-2xl shadow-lg shadow-accent-600/30 transition-all"
                  >
                    Track Application
                  </Link>
                  {company?.phone && (
                    <a href={`tel:${company.phone}`} className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-navy-50 text-navy-900 text-base font-bold rounded-2xl transition-all">
                       <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                       Call Us Now
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

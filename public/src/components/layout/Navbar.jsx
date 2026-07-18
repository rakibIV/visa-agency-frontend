import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import logo from '../../assets/logo.png';

const primaryLinks = [
  { to: '/', label: 'Home' },
  { to: '/countries', label: 'Destinations' },
  { to: '/visas', label: 'Visas' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const secondaryLinks = [
  { to: '/visa-updates', label: 'Latest Results' },
  { to: '/monthly-slots', label: 'Staff Slots' },
  { to: '/notices', label: 'Notices' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  const { data: company } = useQuery({
    queryKey: ['company-info'],
    queryFn: () => api.get('/companies/').then(r => {
      const results = r.data.results ?? r.data;
      return Array.isArray(results) ? results[0] : results;
    }),
  });

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setMoreOpen(false);
    if (moreOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [moreOpen]);

  const isDarkHero = location.pathname === '/' || location.pathname.startsWith('/countries') || location.pathname.startsWith('/visas');
  const showSolid = !isDarkHero || scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 pt-[env(safe-area-inset-top)] ${
          showSolid
            ? 'bg-white/90 backdrop-blur-xl shadow-soft border-b border-navy-100/50'
            : 'bg-transparent'
        }`}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src={logo} alt="Logo" className="h-9 lg:h-10 w-auto" />
              <div className="leading-none">
                <span className={`text-base font-extrabold tracking-tight font-heading block transition-colors ${showSolid ? 'text-navy-900' : 'text-white'}`}>
                  ARG Visa
                </span>
                <span className="block text-[10px] font-bold text-accent-500 uppercase tracking-[0.15em]">
                  Agency
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {primaryLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? showSolid
                          ? 'text-accent-600 bg-accent-50'
                          : 'text-white bg-white/15'
                        : showSolid
                          ? 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${
                    showSolid
                      ? 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  More
                  <svg className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-elevated border border-navy-100/60 py-2 overflow-hidden"
                    >
                      {secondaryLinks.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          className={({ isActive }) =>
                            `block px-5 py-2.5 text-sm font-medium transition-colors ${
                              isActive
                                ? 'text-accent-600 bg-accent-50'
                                : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
                            }`
                          }
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Desktop CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <Link
                to="/status-check"
                className={`hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  showSolid
                    ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-lg shadow-navy-900/10'
                    : 'bg-white text-navy-900 hover:bg-white/90 shadow-lg shadow-black/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                Track Status
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden p-2 rounded-xl transition-colors ${
                  showSolid ? 'text-navy-900 hover:bg-navy-50' : 'text-white hover:bg-white/10'
                }`}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-navy-950/95 backdrop-blur-2xl lg:hidden"
          >
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col items-center justify-center gap-2 px-8 pb-12">
              {[...primaryLinks, ...secondaryLinks].map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  className="w-full max-w-sm"
                >
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `block text-center py-3.5 px-6 rounded-2xl text-lg font-semibold transition-colors ${
                        isActive
                          ? 'text-accent-400 bg-white/10'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-sm mt-6"
              >
                <Link
                  to="/status-check"
                  className="block text-center py-4 px-6 rounded-2xl bg-accent-600 text-white text-lg font-bold hover:bg-accent-700 transition-colors shadow-lg shadow-accent-600/30"
                >
                  Track Your Application
                </Link>
              </motion.div>

              {/* Contact info */}
              {company?.phone && (
                <motion.a
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  href={`tel:${company.phone}`}
                  className="mt-6 text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  {company.phone}
                </motion.a>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

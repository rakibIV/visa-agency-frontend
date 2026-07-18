import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import logo from '../../assets/logo.png';

export default function Footer() {
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

  const currentYear = new Date().getFullYear();

  const [openSections, setOpenSections] = useState({
    explore: false,
    services: false,
    contact: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const exploreLinks = [
    { to: '/', label: 'Home' },
    { to: '/countries', label: 'Destinations' },
    { to: '/visas', label: 'Visa Programs' },
    { to: '/visa-updates', label: 'Latest Results' },
    { to: '/about', label: 'About Us' },
  ];

  const serviceLinks = [
    { to: '/status-check', label: 'Track Application' },
    { to: '/monthly-slots', label: 'Staff Slots' },
    { to: '/notices', label: 'Notices' },
    { to: '/contact', label: 'Contact Us' },
  ];

  const socialIcons = {
    facebook: (
      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    ),
    instagram: (
      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
    ),
    twitter: (
      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    ),
    youtube: (
      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="#fff" points="9.545,15.568 15.818,12 9.545,8.432"/></svg>
    ),
    linkedin: (
      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    ),
    whatsapp: (
      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    ),
  };

  const ChevronIcon = ({ isOpen }) => (
    <svg className={`w-5 h-5 lg:hidden transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );

  return (
    <footer className="relative bg-navy-950 text-white overflow-hidden">
      {/* ── CTA Banner ── */}
      <div className="relative section-py-sm grain">
        <div className="container-wide text-center relative z-10">
          <h2 className="display-md font-heading text-white mb-4">
            Ready to start your <span className="text-accent-400">journey</span>?
          </h2>
          <p className="body-lg text-navy-300 max-w-xl mx-auto mb-8">
            Get expert guidance for your visa application. Our team is here to make the process seamless.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3.5 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-accent-600/20 hover:-translate-y-0.5"
            >
              Get Free Consultation
            </Link>
            <Link
              to="/status-check"
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              Track Application
            </Link>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="container-wide">
        <div className="h-px bg-white/10" />
      </div>

      {/* ── Footer Grid ── */}
      <div className="container-wide section-py-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              <div>
                <span className="text-lg font-extrabold tracking-tight font-heading">ARG Visa</span>
                <span className="block text-[10px] font-bold text-accent-500 uppercase tracking-[0.15em]">Agency</span>
              </div>
            </Link>
            <p className="text-navy-400 text-sm leading-relaxed mb-6 pr-4 max-w-sm">
              {company?.about?.slice(0, 140) || 'Your trusted partner for visa processing and immigration services worldwide.'}
              {company?.about?.length > 140 && '...'}
            </p>

            {/* Social Icons */}
            {socialLinks?.length > 0 && (
              <div className="flex items-center gap-2">
                {socialLinks.filter(s => s.is_active).map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-accent-600 text-navy-400 hover:text-white transition-all duration-300"
                  >
                    {socialIcons[link.platform?.toLowerCase()] || (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore Links */}
          <div className="lg:col-span-2 border-b border-white/10 lg:border-none pb-4 lg:pb-0">
            <button
              onClick={() => toggleSection('explore')}
              className="w-full flex items-center justify-between eyebrow text-white mb-2 lg:mb-5 lg:cursor-default lg:pointer-events-none"
            >
              Explore
              <ChevronIcon isOpen={openSections.explore} />
            </button>
            <ul className={`space-y-3 pt-3 lg:pt-0 ${openSections.explore ? 'block' : 'hidden lg:block'}`}>
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-navy-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className="lg:col-span-3 border-b border-white/10 lg:border-none pb-4 lg:pb-0">
            <button
              onClick={() => toggleSection('services')}
              className="w-full flex items-center justify-between eyebrow text-white mb-2 lg:mb-5 lg:cursor-default lg:pointer-events-none"
            >
              Quick Access
              <ChevronIcon isOpen={openSections.services} />
            </button>
            <ul className={`space-y-3 pt-3 lg:pt-0 ${openSections.services ? 'block' : 'hidden lg:block'}`}>
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-navy-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3 border-b border-white/10 lg:border-none pb-4 lg:pb-0">
            <button
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between eyebrow text-white mb-2 lg:mb-5 lg:cursor-default lg:pointer-events-none"
            >
              Get In Touch
              <ChevronIcon isOpen={openSections.contact} />
            </button>
            <div className={`space-y-4 pt-3 lg:pt-0 ${openSections.contact ? 'block' : 'hidden lg:block'}`}>
              {company?.phone && (
                <a href={`tel:${company.phone}`} className="flex items-center gap-3 text-sm text-navy-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-accent-600/20 flex items-center justify-center shrink-0 transition-colors">
                    <svg className="w-3.5 h-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                  </div>
                  {company.phone}
                </a>
              )}
              {company?.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-3 text-sm text-navy-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-accent-600/20 flex items-center justify-center shrink-0 transition-colors">
                    <svg className="w-3.5 h-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                  </div>
                  {company.email}
                </a>
              )}
              {company?.address && (
                <div className="flex items-start gap-3 text-sm text-navy-400">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                  </div>
                  <span>{company.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="h-px bg-white/10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-navy-500">
            © {currentYear} {company?.company_name || 'ARG Visa Agency'}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/about" className="text-xs text-navy-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/about" className="text-xs text-navy-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

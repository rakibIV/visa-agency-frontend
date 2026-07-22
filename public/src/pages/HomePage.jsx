import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import CountryCard from '../components/ui/CountryCard';
import StaffProfileModal from '../components/ui/StaffProfileModal';
import WaterDropMenu from '../components/ui/WaterDropMenu';

// MUI Icons
import PublicIcon from '@mui/icons-material/Public';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TimelineIcon from '@mui/icons-material/Timeline';
import DomainVerificationIcon from '@mui/icons-material/DomainVerification';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Local Assets
import heroImg from '../assets/hero.jpg';
import aboutImg from '../assets/Majorel draaidag idee.jpg';
import workServiceImg from '../assets/job man.jpg';
import studyServiceImg from '../assets/master yourself.jpg';
import designServiceImg from '../assets/residency.jpg';
import handshakeImg from '../assets/Handshake.jpg';

export default function HomePage() {
  const USE_NEW_WATERDROP_HERO = true; // Toggle to true to use the new waterdrop hero section

  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api.get('/countries/').then(r => r.data.results ?? r.data),
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.get('/reviews/').then(r => r.data.results ?? r.data),
  });

  const { data: updates, isLoading: isLoadingUpdates } = useQuery({
    queryKey: ['visa-updates-home'],
    queryFn: () => api.get('/public/applicant-results/current-month/').then(r => r.data),
  });

  const { data: visaCategories, isLoading: isLoadingVisaCategories } = useQuery({
    queryKey: ['visa-categories'],
    queryFn: () => api.get('/visa-categories/').then(r => r.data.results ?? r.data),
  });

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeReview, setActiveReview] = useState(0);

  const [requestData, setRequestData] = useState({ name: '', email: '', phone: '', message: '' });
  const [requestStatus, setRequestStatus] = useState('idle');

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestStatus('loading');
    try {
      await api.post('/public/application-requests/', requestData);
      setRequestStatus('success');
      setRequestData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setRequestStatus('idle'), 5000);
    } catch (error) {
      setRequestStatus('error');
      setTimeout(() => setRequestStatus('idle'), 5000);
    }
  };

  const featuredCountries = countries?.filter(c => c.is_active)?.slice(0, 6) || [];
  const activeReviews = reviews?.filter(r => r.is_active)?.slice(0, 5) || [];
  const recentUpdates = updates?.slice(0, 8) || [];

  const services = [
    { title: 'Work Visa Programs', description: 'Secure your global career with comprehensive work permit assistance for top destinations.', image: workServiceImg, icon: <WorkIcon /> },
    { title: 'Study Abroad Visas', description: 'Achieve your academic dreams with placement in top-tier universities worldwide.', image: studyServiceImg, icon: <SchoolIcon /> },
    { title: 'Permanent Residency', description: 'Start a new life with our expert PR and immigration pathway services.', image: designServiceImg, icon: <FlightTakeoffIcon /> },
  ];

  const steps = [
    { num: '01', title: 'Consultation', desc: 'Free initial assessment of your profile and goals.' },
    { num: '02', title: 'Documentation', desc: 'We help gather and perfect all required paperwork.' },
    { num: '03', title: 'Submission', desc: 'Flawless application filing by our certified experts.' },
    { num: '04', title: 'Approval', desc: 'Track your status live until you get the green light.' },
  ];

  return (
    <div className="bg-white selection:bg-accent-600 selection:text-white overflow-x-hidden w-full relative">

      {/* ═══════════════════════════════════════════
          HERO — Full-bleed cinematic
      ═══════════════════════════════════════════ */}
      {USE_NEW_WATERDROP_HERO ? (
        <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-navy-900 to-navy-950" />

          {/* Content */}
          <div className="relative z-10 container-wide flex flex-col lg:flex-row items-center justify-between gap-12 pt-24 pb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex-1 lg:text-left text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                World Class Immigration
              </div>

              <h1 className="display-hero font-heading text-white mb-6 max-w-4xl lg:mx-0 mx-auto">
                Your Future Beyond{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">Borders</span>{' '}
                Starts Here
              </h1>

              <p className="body-lg text-white/70 max-w-2xl lg:mx-0 mx-auto mb-10">
                Expert guidance and seamless processing for work, study, and immigration visas to the world's most desired destinations.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-8 py-4 bg-accent-600 hover:bg-accent-700 text-white text-base font-bold rounded-full shadow-lg shadow-accent-600/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Start Your Journey <ArrowForwardIcon fontSize="small" />
                </Link>
                <Link
                  to="/status-check"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-base font-semibold rounded-full transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  <AssignmentTurnedInIcon fontSize="small" /> Track Application
                </Link>
              </div>

              {/* Trust Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-16 flex flex-wrap items-center lg:justify-start justify-center gap-6 sm:gap-10"
              >
                {[
                  { value: '15k+', label: 'Applicants Served' },
                  { value: '98%', label: 'Success Rate' },
                  { value: '50+', label: 'Countries' },
                  { value: '10+', label: 'Years Experience' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-white font-heading">{stat.value}</span>
                    <span className="text-xs text-white/50 uppercase tracking-wide font-semibold leading-tight">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side Menu */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="w-full lg:w-[450px] shrink-0"
            >
              <WaterDropMenu />
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
              <div className="w-1 h-2.5 rounded-full bg-white/50" />
            </div>
          </motion.div>
        </section>
      ) : (
        <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src={heroImg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/50 to-navy-950/80" />
          </div>

          {/* Content */}
          <div className="relative z-10 container-wide text-center pt-24 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                World Class Immigration
              </div>

              <h1 className="display-hero font-heading text-white mb-6 max-w-4xl mx-auto">
                Your Future Beyond{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">Borders</span>{' '}
                Starts Here
              </h1>

              <p className="body-lg text-white/70 max-w-2xl mx-auto mb-10">
                Expert guidance and seamless processing for work, study, and immigration visas to the world's most desired destinations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-8 py-4 bg-accent-600 hover:bg-accent-700 text-white text-base font-bold rounded-full shadow-lg shadow-accent-600/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Start Your Journey <ArrowForwardIcon fontSize="small" />
                </Link>
                <Link
                  to="/status-check"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-base font-semibold rounded-full transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  <AssignmentTurnedInIcon fontSize="small" /> Track Application
                </Link>
              </div>
            </motion.div>

            {/* Trust Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
            >
              {[
                { value: '15k+', label: 'Applicants Served' },
                { value: '98%', label: 'Success Rate' },
                { value: '50+', label: 'Countries' },
                { value: '10+', label: 'Years Experience' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-white font-heading">{stat.value}</span>
                  <span className="text-xs text-white/50 uppercase tracking-wide font-semibold leading-tight">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
              <div className="w-1 h-2.5 rounded-full bg-white/50" />
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SERVICES — Fully Responsive Editorial Grid
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-white">
        <div className="container-wide px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="eyebrow text-accent-600 mb-2 sm:mb-3 block">What We Do</span>
              <h2 className="display-lg font-heading text-navy-900">Immigration Solutions</h2>
            </div>
            <Link to="/visas" className="inline-flex items-center gap-2 text-navy-900 font-bold hover:text-accent-600 transition-colors text-sm shrink-0">
              All Services <ArrowForwardIcon fontSize="small" />
            </Link>
          </div>

          {/* Fully Responsive Grid: 1 col mobile, 2 col tablet, 5 col desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Featured large card */}
            <Link to="/visas" className="md:col-span-2 lg:col-span-3 block group">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[380px] lg:h-full flex flex-col justify-end p-6 sm:p-8 lg:p-10 bg-navy-950"
              >
                <img 
                  src={services[0].image} 
                  alt={services[0].title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-4 border border-white/20 shadow-sm">
                    {services[0].icon}
                  </div>
                  <h3 className="heading-lg text-white mb-2 font-heading text-xl sm:text-2xl lg:text-3xl">{services[0].title}</h3>
                  <p className="text-white/80 text-sm max-w-md mb-4 leading-relaxed">{services[0].description}</p>
                  <span className="inline-flex items-center gap-2 text-accent-300 sm:text-white text-sm font-bold group-hover:text-accent-300 transition-colors">
                    Learn More <ArrowForwardIcon fontSize="small" className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* 2 sub-cards */}
            <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {services.slice(1).map((service, i) => (
                <Link to="/visas" key={i} className="block group flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i + 1) * 0.1 }}
                    className="relative rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[280px] lg:h-full flex flex-col justify-end p-6 bg-navy-950"
                  >
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent" />
                    
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-lg flex items-center justify-center text-white mb-3 border border-white/20 shadow-sm">
                        {service.icon}
                      </div>
                      <h3 className="heading-md text-white font-heading text-lg sm:text-xl mb-1.5">{service.title}</h3>
                      <p className="text-white/70 text-xs sm:text-sm line-clamp-2 mb-3 leading-relaxed">{service.description}</p>
                      <span className="inline-flex items-center gap-2 text-accent-300 sm:text-white/90 text-xs sm:text-sm font-bold group-hover:text-accent-300 transition-colors">
                        Learn More <ArrowForwardIcon fontSize="small" className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          VISA CATEGORIES — Horizontal pills
      ═══════════════════════════════════════════ */}
      {!isLoadingVisaCategories && visaCategories?.filter(vc => vc.is_active).length > 0 && (
        <section className="section-py-sm bg-surface-dim border-y border-navy-50">
          <div className="container-wide">
            <div className="text-center mb-10">
              <span className="eyebrow text-accent-600 mb-3 block">Explore Pathways</span>
              <h2 className="display-md font-heading text-navy-900">Visa Categories</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {visaCategories?.filter(vc => vc.is_active).map((category, i) => (
                <Link
                  key={category.id || i}
                  to={`/countries?category=${category.slug}`}
                  className="group px-6 py-3.5 rounded-full bg-white border border-navy-100 hover:border-accent-200 hover:bg-accent-50 transition-all duration-300 shadow-soft hover:shadow-card hover:-translate-y-0.5"
                >
                  <span className="font-semibold text-navy-900 group-hover:text-accent-600 transition-colors text-sm">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          FEATURED DESTINATIONS
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="eyebrow text-accent-600 mb-3 block">Destinations</span>
              <h2 className="display-lg font-heading text-navy-900">Popular Countries</h2>
            </div>
            <Link to="/countries" className="inline-flex items-center gap-2 text-navy-900 font-bold hover:text-accent-600 transition-colors text-sm">
              Explore All <ArrowForwardIcon fontSize="small" />
            </Link>
          </div>

          {isLoadingCountries ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-navy-50 rounded-2xl h-72" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCountries.map((country, i) => (
                <CountryCard key={country.slug || i} country={country} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LIVE TICKER
      ═══════════════════════════════════════════ */}
      {(isLoadingUpdates || recentUpdates.length > 0) && (
        <section className="py-5 bg-navy-950 overflow-hidden relative">
          <div className="flex items-center absolute left-0 z-10 h-full px-6 bg-gradient-to-r from-navy-950 via-navy-950 to-transparent w-40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" /> Live
            </span>
          </div>

          {isLoadingUpdates ? (
            <div className="flex gap-6 pl-40 opacity-50">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse bg-white/10 h-8 w-40 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-hidden relative pl-40 w-full">
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                className="flex gap-6 min-w-max"
              >
                {[...recentUpdates, ...recentUpdates].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.status?.toLowerCase() === 'approved' ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-xs font-semibold text-white">{item.applicant_name}</span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/50">{item.country}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Timeline
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-surface-dim relative grain">
        <div className="container-wide relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow text-accent-600 mb-3 block">How It Works</span>
            <h2 className="display-lg font-heading text-navy-900 mb-4">Your Path to Global Access</h2>
            <p className="body-lg text-navy-500">Four simple steps to secure your visa with expert guidance.</p>
          </div>

          {/* Desktop: Horizontal timeline */}
          <div className="hidden md:grid md:grid-cols-4 gap-0 relative">
            {/* Connecting line */}
            <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-navy-200 z-0" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center text-center relative z-10 px-4"
              >
                <div className="w-16 h-16 rounded-full bg-white border-2 border-navy-200 flex items-center justify-center mb-6 shadow-soft group-hover:border-accent-500 transition-colors">
                  <span className="text-lg font-black text-accent-600 font-heading">{step.num}</span>
                </div>
                <h3 className="heading-md text-navy-900 font-heading mb-2">{step.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed max-w-[200px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Mobile: Vertical timeline */}
          <div className="md:hidden relative pl-10">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-navy-200" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative mb-10 last:mb-0"
              >
                <div className="absolute -left-10 top-0 w-9 h-9 rounded-full bg-white border-2 border-navy-200 flex items-center justify-center shadow-soft">
                  <span className="text-xs font-black text-accent-600 font-heading">{step.num}</span>
                </div>
                <div className="pl-4">
                  <h3 className="heading-md text-navy-900 font-heading mb-1">{step.title}</h3>
                  <p className="text-sm text-navy-500">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY CHOOSE US — Clean split with checklist
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="eyebrow text-accent-600 mb-3 block">Why Us</span>
              <h2 className="display-lg font-heading text-navy-900 mb-6">
                Clarity in Complexity.
              </h2>
              <p className="body-lg text-navy-600 mb-10">
                Immigration is complicated. We keep it simple. Our world-class team provides transparent, streamlined pathways tailored to your unique goals.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  'Licensed & certified immigration professionals',
                  'Transparent pricing with no hidden fees',
                  'Dedicated case manager from start to finish',
                  'Digital tracking with real-time status updates',
                  '100+ partner universities & 500+ employer network',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircleIcon className="text-accent-600 shrink-0 mt-0.5" fontSize="small" />
                    <span className="text-navy-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-bold rounded-full hover:bg-navy-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-navy-900/10 text-sm"
              >
                Learn More About Us <ArrowForwardIcon fontSize="small" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                <img src={aboutImg} alt="Our Team" className="w-full h-[350px] sm:h-[450px] lg:h-[550px] object-cover" />
              </div>
              {/* Floating stat */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-4 sm:-left-8 bg-white p-5 rounded-2xl shadow-elevated border border-navy-50 flex items-center gap-4 z-10"
              >
                <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center text-accent-600">
                  <VerifiedUserIcon />
                </div>
                <div>
                  <div className="text-2xl font-black text-navy-900 font-heading">98%</div>
                  <div className="text-[11px] font-bold text-navy-500 uppercase tracking-wide">Success Rate</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS — Single large quote
      ═══════════════════════════════════════════ */}
      {activeReviews.length > 0 && (
        <section className="section-py bg-navy-950 relative grain overflow-hidden">
          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="eyebrow text-accent-400 mb-3 block">Testimonials</span>
              <h2 className="display-md font-heading text-white mb-12">What Our Clients Say</h2>

              {/* Large quote */}
              <div className="relative min-h-[200px]">
                <FormatQuoteIcon className="text-white/5 absolute -top-6 left-1/2 -translate-x-1/2" style={{ fontSize: 120 }} />

                <div className="relative z-10">
                  <div className="flex justify-center text-gold-400 mb-6 gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} fontSize="small" />)}
                  </div>

                  <p className="text-xl sm:text-2xl text-white/90 leading-relaxed font-medium mb-8 max-w-2xl mx-auto">
                    "{activeReviews[activeReview]?.comment}"
                  </p>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-accent-600 text-white flex items-center justify-center font-bold text-lg font-heading">
                      {activeReviews[activeReview]?.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{activeReviews[activeReview]?.name}</div>
                      <div className="text-xs text-white/40 uppercase tracking-wide">Verified Client</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Dots */}
              {activeReviews.length > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {activeReviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveReview(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === activeReview ? 'bg-accent-500 w-8' : 'bg-white/20 hover:bg-white/40'
                        }`}
                      aria-label={`View review ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          CONTACT / CTA FORM
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-white relative overflow-hidden">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <div>
              <span className="eyebrow text-accent-600 mb-3 block">Get Started</span>
              <h2 className="display-lg font-heading text-navy-900 mb-6">
                Free Consultation
              </h2>
              <p className="body-lg text-navy-600 mb-8">
                Drop your details and our experts will get back to you within 2 hours. No obligation, no hidden fees.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <SupportAgentIcon className="text-accent-600" />, text: 'Expert immigration consultants' },
                  { icon: <TimelineIcon className="text-accent-600" />, text: 'Response within 2 hours' },
                  { icon: <DomainVerificationIcon className="text-accent-600" />, text: 'Free initial assessment' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-navy-700">
                    <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-navy-950 rounded-3xl p-6 sm:p-10 shadow-elevated relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

              <form className="space-y-4 relative z-10" onSubmit={handleRequestSubmit}>
                <div>
                  <input type="text" required value={requestData.name} onChange={e => setRequestData({ ...requestData, name: e.target.value })} placeholder="Your Full Name" className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-navy-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all text-sm font-medium" />
                </div>
                <div>
                  <input type="email" value={requestData.email} onChange={e => setRequestData({ ...requestData, email: e.target.value })} placeholder="Email Address (Optional)" className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-navy-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all text-sm font-medium" />
                </div>
                <div>
                  <input type="tel" required value={requestData.phone} onChange={e => setRequestData({ ...requestData, phone: e.target.value })} placeholder="Phone Number" className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-navy-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all text-sm font-medium" />
                </div>
                <div>
                  <textarea rows={3} value={requestData.message} onChange={e => setRequestData({ ...requestData, message: e.target.value })} placeholder="How can we help you?" className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-navy-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all text-sm font-medium resize-none" />
                </div>

                {requestStatus === 'success' && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium text-center">
                    ✓ Request submitted! We'll contact you soon.
                  </div>
                )}
                {requestStatus === 'error' && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium text-center">
                    Something went wrong. Please try again.
                  </div>
                )}

                <button type="submit" disabled={requestStatus === 'loading'} className="w-full py-4 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                  {requestStatus === 'loading' ? 'Submitting...' : 'Request Free Callback'} <ArrowForwardIcon fontSize="small" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <StaffProfileModal
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        staffSlug={selectedStaff?.slug}
        staffName={selectedStaff?.name}
      />
    </div>
  );
}

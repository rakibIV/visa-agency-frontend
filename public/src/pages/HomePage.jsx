import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import SectionHeading from '../components/ui/SectionHeading';
import CountryCard from '../components/ui/CountryCard';
import StaffProfileModal from '../components/ui/StaffProfileModal';
import StatusCheckModal from '../components/ui/StatusCheckModal';

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
import HandshakeIcon from '@mui/icons-material/Handshake';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';

// Local Assets
import heroImg from '../assets/hero.jpg';
import aboutImg from '../assets/Majorel draaidag idee.jpg';
import workServiceImg from '../assets/job man.jpg';
import studyServiceImg from '../assets/master yourself.jpg';
import designServiceImg from '../assets/residency.jpg';
import handshakeImg from '../assets/Handshake.jpg';
import testBg from '../assets/Advice to New Grads.jpg';

export default function HomePage() {
  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api.get('/countries/').then(r => r.data.results ?? r.data),
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.get('/agency-services/').then(r => r.data.results ?? r.data),
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.get('/reviews/').then(r => r.data.results ?? r.data),
  });

  const { data: updates, isLoading: isLoadingUpdates } = useQuery({
    queryKey: ['visa-updates-home'],
    queryFn: () => api.get('/public/applicant-results/current-month/').then(r => r.data),
  });

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const { data: visaCategories, isLoading: isLoadingVisaCategories } = useQuery({
    queryKey: ['visa-categories'],
    queryFn: () => api.get('/visa-categories/').then(r => r.data.results ?? r.data),
  });

  const { data: notices } = useQuery({
    queryKey: ['public-notices'],
    queryFn: () => api.get('/notices/').then(r => r.data.results ?? r.data),
  });

  const { data: staffSlots } = useQuery({
    queryKey: ['public-staff-slots'],
    queryFn: () => api.get('/public/staff-slots/current-month/').then(r => r.data),
  });

  const featuredCountries = countries?.filter(c => c.is_active)?.slice(0, 6) || [];

  const defaultServices = [
    { id: 1, title: 'Work Visa Programs', description: 'Secure your global career with our comprehensive work permit assistance.', is_active: true },
    { id: 2, title: 'Study Abroad Visas', description: 'Achieve your academic dreams with placement in top-tier universities.', is_active: true },
    { id: 3, title: 'Permanent Residency', description: 'Start a new life with our expert PR and immigration pathway services.', is_active: true }
  ];
  const activeServices = defaultServices.filter(s => s.is_active).slice(0, 3);

  const activeReviews = reviews?.filter(r => r.is_active)?.slice(0, 3) || [];
  const recentUpdates = updates?.slice(0, 6) || [];

  const serviceImages = [workServiceImg, studyServiceImg, designServiceImg];
  const serviceIcons = [<WorkIcon fontSize="large" />, <SchoolIcon fontSize="large" />, <FlightTakeoffIcon fontSize="large" />];

  return (
    <div className="bg-white selection:bg-accent-600 selection:text-white">
      {/* ─── HERO SECTION (Minimal Split) ─── */}
      <section className="relative min-h-[90vh] pt-28 pb-16 flex items-center bg-[#FDFDFD] overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-50 rounded-full text-xs font-bold text-navy-600 mb-6 uppercase tracking-widest border border-navy-100">
                <PublicIcon fontSize="small" className="text-accent-600" />
                World Class Immigration
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-navy-900 leading-[1.05] mb-6 font-heading tracking-tight">
                Secure Your <br />
                Future <span className="text-accent-600">Beyond</span><br />
                <span className="text-accent-600">Borders.</span>
              </h1>
              <p className="text-lg text-navy-600 leading-relaxed mb-10 max-w-lg font-medium">
                Expert guidance and seamless processing for work, study, and immigration visas to the world's most desired destinations. Minimal stress, maximum success.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-8 py-4 bg-navy-900 hover:bg-navy-800 text-white text-base font-bold rounded-2xl shadow-xl shadow-navy-900/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Start Your Journey <ArrowForwardIcon fontSize="small" />
                </Link>
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-navy-50 text-navy-900 border border-navy-100 text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <AssignmentTurnedInIcon fontSize="small" className="text-accent-600" /> Track Application
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative hidden lg:block"
            >
              {/* Minimal geometric background for image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-navy-50 rounded-full blur-3xl opacity-50 -z-10"></div>

              <img src={heroImg} alt="Visa Consultancy" className="w-full h-auto object-contain drop-shadow-2xl relative z-10 max-h-[700px]" />

              {/* Floating Stat Widget */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 -left-10 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-card border border-navy-50 z-20 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-accent-50 rounded-full flex items-center justify-center text-accent-600">
                  <VerifiedUserIcon />
                </div>
                <div>
                  <div className="text-2xl font-black text-navy-900">98%</div>
                  <div className="text-xs font-bold text-navy-500 uppercase tracking-wide">Success Rate</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── MINIMAL STATS GRID ─── */}
      <section className="py-12 border-y border-navy-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-navy-50">
            {[
              { icon: <PublicIcon />, label: 'Countries', value: '50+' },
              { icon: <DomainVerificationIcon />, label: 'Visas Approved', value: '15k+' },
              { icon: <TimelineIcon />, label: 'Years Exp.', value: '10+' },
              { icon: <SupportAgentIcon />, label: 'Expert Staff', value: '24/7' },
            ].map((stat, i) => (
              <div key={i} className={`px-4 sm:px-8 text-center ${i === 0 ? 'pl-0' : ''} ${i === 3 ? 'pr-0 border-r-0' : ''} group`}>
                <div className="text-navy-300 flex justify-center mb-3 group-hover:text-accent-600 transition-colors transform group-hover:scale-110 duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-black text-navy-900 mb-1 font-heading">{stat.value}</div>
                <div className="text-xs font-bold text-navy-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT / WHY CHOOSE US (Icon Grid) ─── */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-0.5 bg-accent-600" />
                <span className="text-accent-600 font-bold uppercase tracking-widest text-sm">Why Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-navy-900 mb-6 leading-tight font-heading">
                Clarity in Complexity.
              </h2>
              <p className="text-navy-600 text-lg leading-relaxed mb-10">
                Immigration is complicated. We keep it simple. Our world-class team provides transparent, streamlined pathways tailored to your unique goals.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mb-10">
                {[
                  { title: 'Certified Experts', desc: 'Licensed professionals handling your case.', icon: <VerifiedUserIcon className="text-accent-600" fontSize="large" /> },
                  { title: 'Transparent Pricing', desc: 'No hidden fees or surprise charges.', icon: <PriceCheckIcon className="text-accent-600" fontSize="large" /> },
                  { title: 'Dedicated Support', desc: 'A dedicated manager from start to finish.', icon: <SupportAgentIcon className="text-accent-600" fontSize="large" /> },
                  { title: 'Streamlined Process', desc: 'Digital tracking and quick turnarounds.', icon: <TimelineIcon className="text-accent-600" fontSize="large" /> },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 p-3 bg-accent-50 rounded-2xl h-fit">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-navy-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/about" className="inline-flex items-center gap-2 text-navy-900 font-bold hover:text-accent-600 transition-colors group border-b-2 border-navy-900 hover:border-accent-600 pb-1">
                More About Us <ArrowForwardIcon fontSize="small" className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img src={aboutImg} alt="Our Team" className="w-full h-[600px] object-cover" />
                <div className="absolute inset-0 bg-navy-900/10" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── OUR PROCESS (4 Steps Minimal) ─── */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-accent-600 font-bold uppercase tracking-widest text-sm">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-navy-900 font-heading mb-4">Your Path to Global Access</h2>
            <p className="text-navy-600 text-lg">Four simple steps to secure your visa with our expert guidance.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Consultation', desc: 'Free initial assessment of your profile and goals.', icon: <SupportAgentIcon fontSize="large" /> },
              { num: '02', title: 'Documentation', desc: 'We help gather and perfect all required paperwork.', icon: <DescriptionIcon fontSize="large" /> },
              { num: '03', title: 'Submission', desc: 'Flawless application filing by our certified experts.', icon: <AssignmentTurnedInIcon fontSize="large" /> },
              { num: '04', title: 'Approval', desc: 'Track your status live until you get the green light.', icon: <CheckCircleIcon fontSize="large" /> },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-navy-50 hover:shadow-card hover:border-accent-100 transition-all group relative overflow-hidden"
              >
                <div className="text-8xl font-black text-navy-50/50 absolute -top-4 -right-4 font-heading group-hover:text-accent-50/50 transition-colors z-0">
                  {step.num}
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-navy-50 text-navy-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-600 group-hover:text-white transition-colors duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-3">{step.title}</h3>
                  <p className="text-navy-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PREMIUM SERVICES ─── */}
      {activeServices.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-0.5 bg-accent-600" />
                  <span className="text-accent-600 font-bold uppercase tracking-widest text-sm">Services</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-navy-900 font-heading">Immigration Solutions</h2>
              </div>
              <Link to="/services" className="inline-flex items-center gap-2 text-navy-900 font-bold hover:text-accent-600 transition-colors">
                View All Services <ArrowForwardIcon fontSize="small" />
              </Link>
            </div>

            {isLoadingServices ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse bg-navy-50 rounded-[2rem] aspect-[3/4] w-full"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {activeServices.map((service, i) => (
                  <motion.div
                    key={service.id || i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative rounded-[2rem] overflow-hidden shadow-soft"
                  >
                    <div className="aspect-[3/4] w-full relative">
                      <img src={serviceImages[i % 3]} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/40 to-transparent" />
                    </div>
                    <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 self-end">
                        {serviceIcons[i % 3]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2 font-heading">{service.title}</h3>
                        <p className="text-navy-100 text-sm line-clamp-2 mb-4 opacity-90">
                          {service.description || 'Comprehensive support for your visa application process tailored to your needs.'}
                        </p>
                        <div className="inline-flex items-center gap-2 text-white text-sm font-bold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-auto cursor-pointer">
                          Learn More <ArrowForwardIcon fontSize="small" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── GLOBAL PARTNERSHIPS ─── */}
      <section className="py-24 bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={handshakeImg} alt="Partnerships" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-navy-900/80" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <HandshakeIcon className="text-accent-500" fontSize="large" />
                <span className="text-accent-400 font-bold uppercase tracking-widest text-sm">Trusted Network</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 font-heading text-white">Global Partnerships, <br />Local Expertise.</h2>
              <p className="text-navy-200 text-lg mb-8 leading-relaxed">
                We work directly with authorized immigration bodies, top-tier universities, and global employers to ensure your application gets priority treatment.
              </p>
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-black text-white font-heading mb-1">100+</div>
                  <div className="text-xs text-navy-300 uppercase tracking-wide font-bold">Partner Universities</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white font-heading mb-1">500+</div>
                  <div className="text-xs text-navy-300 uppercase tracking-wide font-bold">Employer Network</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED DESTINATIONS ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-0.5 bg-accent-600" />
                <span className="text-accent-600 font-bold uppercase tracking-widest text-sm">Destinations</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-navy-900 font-heading">Popular Destinations</h2>
            </div>
            <Link to="/countries" className="inline-flex items-center gap-2 text-navy-900 font-bold hover:text-accent-600 transition-colors">
              Explore All <ArrowForwardIcon fontSize="small" />
            </Link>
          </div>

          {isLoadingCountries ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-navy-50 rounded-3xl h-[400px] w-full"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCountries.map((country, i) => (
                <CountryCard key={country.slug || i} country={country} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── VISA CATEGORIES (New Section) ─── */}
      <section className="py-20 bg-white border-b border-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-navy-900 font-heading mb-4">Visa Categories</h2>
            <p className="text-navy-500 font-medium max-w-2xl mx-auto">Explore our specialized visa pathways tailored for your unique global aspirations.</p>
          </div>

          {isLoadingVisaCategories ? (
            <div className="flex flex-wrap justify-center gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-navy-50 rounded-full h-14 w-40"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {visaCategories?.filter(vc => vc.is_active).map((category, i) => (
                <Link
                  key={category.id || i}
                  to={`/countries?category=${category.slug}`}
                  className="px-8 py-4 bg-navy-50 hover:bg-accent-600 text-navy-900 hover:text-white rounded-full font-bold transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 group"
                >
                  {category.name} <ArrowForwardIcon fontSize="small" className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-1" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── LIVE UPDATES TICKER (Minimal) ─── */}
      {(isLoadingUpdates || recentUpdates.length > 0) && (
        <section className="py-8 bg-[#F8FAFC] border-y border-navy-100/50 overflow-hidden relative">
          <div className="flex items-center absolute left-0 z-10 h-full px-6 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC] to-transparent w-48">
            <span className="text-xs font-bold uppercase tracking-widest text-navy-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-600 animate-pulse" /> Live Feed
            </span>
          </div>

          {isLoadingUpdates ? (
            <div className="flex gap-8 whitespace-nowrap overflow-hidden relative pl-48 opacity-50">
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-navy-100 h-10 w-48 rounded-full"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-8 whitespace-nowrap overflow-x-hidden relative pl-48">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-8 min-w-max"
              >
                {[...recentUpdates, ...recentUpdates].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm border border-navy-50">
                    <div className={`w-2 h-2 rounded-full ${item.status?.toLowerCase() === 'approved' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-bold text-navy-900">{item.applicant_name}</span>
                    <span className="text-sm text-navy-400 border-l border-navy-100 pl-3">{item.country}</span>
                    <span className="text-xs text-navy-500 bg-navy-50 px-2 py-0.5 rounded-md">{item.visa}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          )}
        </section>
      )}

      {/* ─── TESTIMONIALS & CONTACT ─── */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block z-0">
          <img src={testBg} alt="Graduates" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-0.5 bg-accent-600" />
                <span className="text-accent-600 font-bold uppercase tracking-widest text-sm">Success Stories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-navy-900 mb-12 font-heading">Voices of Success</h2>

              {isLoadingReviews ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-navy-50 p-8 rounded-3xl h-56 w-full border border-navy-100/50"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {activeReviews.map((review, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-8 rounded-3xl shadow-soft border border-navy-50 relative"
                    >
                      <FormatQuoteIcon className="absolute top-6 right-6 text-navy-50 transform rotate-180" style={{ fontSize: 60 }} />
                      <div className="flex text-gold-500 mb-4">
                        {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} fontSize="small" />)}
                      </div>
                      <p className="text-navy-700 leading-relaxed mb-6 relative z-10 font-medium">
                        "{review.comment}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-navy-50 text-navy-900 flex items-center justify-center font-bold text-lg font-heading">
                          {review.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-navy-900">{review.name}</div>
                          <div className="text-xs text-navy-400 uppercase tracking-wide">Verified Client</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:pt-12"
            >
              <div className="bg-navy-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <SupportAgentIcon style={{ fontSize: 120 }} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black text-white mb-3 font-heading">Free Consultation</h3>
                  <p className="text-navy-200 text-sm mb-10">Drop your details below. Our experts typically respond within 2 hours.</p>

                  <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                    <div>
                      <input type="text" placeholder="Your Full Name" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-navy-300 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all font-medium" />
                    </div>
                    <div>
                      <input type="email" placeholder="Email Address" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-navy-300 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all font-medium" />
                    </div>
                    <div>
                      <input type="tel" placeholder="Phone Number" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-navy-300 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all font-medium" />
                    </div>
                    <button type="submit" className="w-full py-4 mt-4 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-accent-600/20 flex items-center justify-center gap-2">
                      Request Callback <ArrowForwardIcon fontSize="small" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── MODALS ─── */}
      <StaffProfileModal
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        staffSlug={selectedStaff?.slug}
        staffName={selectedStaff?.name}
      />
      <StatusCheckModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </div>
  );
}

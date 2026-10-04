import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/client';
import conferenceImg from '../assets/Company images/AL-raiyanGroup Conference.jpeg';
import officeImg from '../assets/Company images/Al-raiyanGroup Office.jpeg';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PublicIcon from '@mui/icons-material/Public';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ImageLightbox from '../components/ui/ImageLightbox';

const services = [
  "Europe Work Permit Visa Processing",
  "Portugal D2 Visa Processing",
  "Student Visa Processing",
  "Business Visa Processing",
  "Recruitment & Employer Placement Services",
  "International Job Placement Assistance",
  "Documentation & Application Support",
  "Client Consultation Services"
];

export default function AboutPage() {
  const [lightbox, setLightbox] = useState({ isOpen: false, index: 0 });

  const { data: offices, isLoading: officesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches/').then(r => r.data.results ?? r.data),
  });

  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: () => api.get('/companies/').then(r => r.data.results?.[0] ?? r.data?.[0]),
  });

  return (
    <div className="bg-white selection:bg-accent-600 selection:text-white">
      {/* ═══════════════════════════════════════════
          HERO — Editorial Full-bleed
      ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-navy-950 min-h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={conferenceImg} alt="AL-RAIYAN GROUP Conference" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-900/40" />
        </div>
        
        <div className="container-wide relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest mb-6">
              Established 26 February 2025
            </div>
            
            <h1 className="display-hero font-heading text-white mb-6 tracking-tight">
              AL-RAIYAN GROUP
            </h1>
            
            <p className="display-md font-heading text-navy-300 font-bold mb-10 max-w-2xl mx-auto">
              مجموعة الريان
            </p>

            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-8 py-3 text-white font-semibold text-sm sm:text-base tracking-wide shadow-2xl">
              Trust <span className="text-accent-400">•</span> Process <span className="text-accent-400">•</span> Success (KSA)
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHO WE ARE — Text-focused Typography
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="eyebrow text-accent-600 mb-4 block">Who We Are</span>
              
              <h2 className="heading-lg text-navy-900 mb-8 leading-relaxed font-light">
                <strong className="font-bold text-navy-900">AL-RAIYAN GROUP</strong> is an international visa consultancy and recruitment service provider based in the Kingdom of Saudi Arabia (KSA).
              </h2>
              
              <p className="body-lg text-navy-600 leading-relaxed max-w-3xl mx-auto">
                We specialize in visa processing, recruitment support, employer placement services, and professional documentation assistance for individuals seeking overseas opportunities.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FULL BLEED IMAGE BREAK
      ═══════════════════════════════════════════ */}
      <section className="w-full">
        <div className="w-full h-[40vh] sm:h-[60vh] relative">
          <img src={officeImg} alt="AL-RAIYAN Office" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy-900/10" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MISSION & VISION — Side-by-Side Premium Cards
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-gradient-to-b from-navy-950/5 via-slate-50 to-white relative border-y border-navy-100/60 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-navy-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-wide relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="eyebrow text-accent-600 mb-3 block tracking-widest font-bold">Our Purpose & Direction</span>
            <h2 className="display-lg font-heading text-navy-900 font-bold">Mission & Vision</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-full bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/80 shadow-xl shadow-navy-950/5 hover:shadow-2xl hover:border-accent-300 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-500 via-accent-600 to-navy-900" />
              
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent-50/80 border border-accent-100 flex items-center justify-center text-accent-600 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <FlightTakeoffIcon style={{ fontSize: 32 }} />
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-accent-100/70 text-accent-800 border border-accent-200/50">
                    OUR MISSION
                  </span>
                </div>

                <h3 className="display-md font-heading text-navy-900 font-bold mb-6">
                  Our Mission
                </h3>

                {/* Lead Paragraph */}
                <div className="p-4 sm:p-5 rounded-2xl bg-navy-50/80 border-l-4 border-accent-600 text-navy-900 text-base sm:text-lg font-semibold leading-relaxed mb-6 shadow-xs">
                  At AL-RAIYAN GROUP, our mission is to provide transparent, professional, and responsible global visa and mobility services that help individuals and families navigate international opportunities with greater clarity and confidence.
                </div>

                {/* Paragraphs 2, 3, 4 */}
                <div className="space-y-4 text-navy-700 text-sm sm:text-base leading-relaxed">
                  <div className="flex gap-3.5 items-start p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-accent-600 mt-2 shrink-0" />
                    <p>
                      We are committed to delivering structured guidance throughout the journey—from documentation and application preparation to process coordination and ongoing client support—while maintaining clear communication, responsible practices, and respect for applicable laws and requirements.
                    </p>
                  </div>

                  <div className="flex gap-3.5 items-start p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-accent-600 mt-2 shrink-0" />
                    <p>
                      By combining professional expertise, organized processes, digital communication, and client-focused service, we strive to make every stage of the international mobility journey more understandable, efficient, and accessible.
                    </p>
                  </div>

                  <div className="flex gap-3.5 items-start p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-accent-600 mt-2 shrink-0" />
                    <p>
                      Our commitment is to build long-term relationships through integrity, transparency, accountability, and genuine care, enabling our clients to make informed decisions about their international plans.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="h-full bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/80 shadow-xl shadow-navy-950/5 hover:shadow-2xl hover:border-accent-300 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-900 via-accent-600 to-accent-500" />
              
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-navy-50/80 border border-navy-100 flex items-center justify-center text-accent-600 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <PublicIcon style={{ fontSize: 32 }} />
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-navy-100/70 text-navy-800 border border-navy-200/50">
                    OUR VISION
                  </span>
                </div>

                <h3 className="display-md font-heading text-navy-900 font-bold mb-6">
                  Our Vision
                </h3>

                {/* Lead Paragraph */}
                <div className="p-4 sm:p-5 rounded-2xl bg-navy-50/80 border-l-4 border-navy-800 text-navy-900 text-base sm:text-lg font-semibold leading-relaxed mb-6 shadow-xs">
                  Our vision is to establish AL-RAIYAN GROUP as a trusted and internationally recognized visa and global mobility service partner, distinguished by integrity, professionalism, responsible practices, and client-focused excellence.
                </div>

                {/* Paragraphs 2, 3, 4 */}
                <div className="space-y-4 text-navy-700 text-sm sm:text-base leading-relaxed">
                  <div className="flex gap-3.5 items-start p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-navy-800 mt-2 shrink-0" />
                    <p>
                      We aspire to build a modern and digitally connected service platform where clients receive clear information, structured guidance, timely communication, and consistent support throughout their international journey.
                    </p>
                  </div>

                  <div className="flex gap-3.5 items-start p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-navy-800 mt-2 shrink-0" />
                    <p>
                      Through continuous innovation, technology-driven service delivery, professional development, and strong ethical standards, we aim to expand our global reach while maintaining the trust and confidence of every client we serve.
                    </p>
                  </div>

                  <div className="flex gap-3.5 items-start p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-navy-800 mt-2 shrink-0" />
                    <p>
                      Our long-term vision is to create a reliable, transparent, and people-centered global mobility experience that connects individuals and families with international opportunities responsibly and professionally.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SERVICES — Minimal List / Tags
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <span className="eyebrow text-accent-600 mb-3 block">Expertise</span>
            <h2 className="display-lg font-heading text-navy-900">Core Services</h2>
          </div>

          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-6 py-3.5 bg-navy-50 text-navy-900 font-semibold rounded-full border border-navy-100 hover:border-accent-200 hover:bg-accent-50 transition-colors shadow-soft"
              >
                {service}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY CHOOSE AL-RAIYAN — Minimal Icons
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-navy-950 text-white relative grain overflow-hidden">
        <div className="container-wide relative z-10 text-center">
          <span className="eyebrow text-accent-400 mb-3 block">The Advantage</span>
          <h2 className="display-lg font-heading text-white mb-16">Why Choose Al-Raiyan Group</h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Legal & Registered", desc: "A fully licensed company ensuring compliance with local and international laws.", icon: <AssuredWorkloadIcon fontSize="large" /> },
              { title: "Dedicated Experts", desc: "A highly experienced team offering tailored guidance and support.", icon: <HandshakeIcon fontSize="large" /> },
              { title: "High Success Rate", desc: "Proven track record in secure processing and successful visa approvals.", icon: <FlightTakeoffIcon fontSize="large" /> }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent-400 mb-6 border border-white/20">
                  {feature.icon}
                </div>
                <h3 className="heading-md font-heading text-white mb-3">{feature.title}</h3>
                <p className="body-sm text-navy-300 max-w-xs mx-auto leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          OFFICES — Clean Cards
      ═══════════════════════════════════════════ */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="eyebrow text-accent-600 mb-3 block">Global Presence</span>
            <h2 className="display-lg font-heading text-navy-900">Our Offices</h2>
          </div>

          {officesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-navy-50 h-64 rounded-3xl" />
              ))}
            </div>
          ) : offices?.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {offices.map((office, i) => (
                <motion.div
                  key={office.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-navy-100 shadow-soft hover:shadow-card transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center text-accent-600 shrink-0">
                      <PublicIcon />
                    </div>
                    <div>
                      <h3 className="heading-md text-navy-900 font-heading">{office.name}</h3>
                      <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">{office.country}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {office.address && (
                      <div className="flex items-start gap-3 text-sm text-navy-600">
                        <svg className="w-5 h-5 text-navy-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span>{office.address}</span>
                      </div>
                    )}
                    {office.phone && (
                      <div className="flex items-start gap-3 text-sm text-navy-600">
                        <svg className="w-5 h-5 text-navy-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                        </svg>
                        <a href={`tel:${office.phone}`} className="hover:text-accent-600 transition-colors">{office.phone}</a>
                      </div>
                    )}
                    {office.email && (
                      <div className="flex items-start gap-3 text-sm text-navy-600">
                        <svg className="w-5 h-5 text-navy-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        <a href={`mailto:${office.email}`} className="hover:text-accent-600 transition-colors">{office.email}</a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-navy-400 py-12 bg-navy-50 rounded-3xl border border-navy-100">
              No offices found.
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GALLERY
      ═══════════════════════════════════════════ */}
      {company?.images?.length > 0 && (
        <section id="gallery" className="section-py bg-surface-dim grain relative border-t border-navy-50">
          <div className="container-wide relative z-10">
            <div className="text-center mb-16">
              <span className="eyebrow text-accent-600 mb-3 block">Gallery</span>
              <h2 className="display-lg font-heading text-navy-900">Agency Images</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {company.images.map((img, i) => (
                <motion.div
                  key={img.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square rounded-2xl overflow-hidden border border-navy-100 shadow-soft cursor-pointer group"
                  onClick={() => setLightbox({ isOpen: true, index: i })}
                >
                  <img src={img.image} alt={img.caption || `Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Image Lightbox */}
      <ImageLightbox 
        isOpen={lightbox.isOpen} 
        images={company?.images || []} 
        currentIndex={lightbox.index} 
        onClose={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
        onNext={() => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % (company?.images?.length || 1) }))}
        onPrev={() => setLightbox(prev => ({ ...prev, index: (prev.index - 1 + (company?.images?.length || 1)) % (company?.images?.length || 1) }))}
      />

    </div>
  );
}

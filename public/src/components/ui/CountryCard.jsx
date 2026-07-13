import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CountryCard({ country, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        to={`/countries/${country.slug}`}
        className="group block relative overflow-hidden rounded-2xl bg-white shadow-navy hover:shadow-navy-lg transition-all duration-500 hover:-translate-y-1"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {country.image ? (
            <img
              src={country.image}
              alt={country.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
              <svg className="w-16 h-16 text-navy-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />

          {/* Flag Badge */}
          {country.flag && (
            <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-lg overflow-hidden ring-2 ring-white/50">
              <img src={country.flag} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Featured Badge */}
          {country.is_featured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-accent-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              Featured
            </div>
          )}

          {/* Country Name */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white font-heading">{country.name}</h3>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-sm text-navy-600 line-clamp-2 mb-3">
            {country.short_description || 'Explore visa opportunities and start your journey today.'}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {country.capital && (
                <span className="text-xs text-navy-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5Z" /></svg>
                  {country.capital}
                </span>
              )}
              {country.currency && (
                <span className="text-xs text-navy-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  {country.currency}
                </span>
              )}
            </div>
            <span className="text-accent-600 text-sm font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Explore
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

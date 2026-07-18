import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleIcon from '@mui/icons-material/Article';
import ApartmentIcon from '@mui/icons-material/Apartment';

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
        className="group block relative h-[400px] rounded-3xl overflow-hidden bg-navy-950 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-1"
      >
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          {country.image ? (
            <img
              src={country.image}
              alt={country.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy-800 to-navy-950 opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col p-6 sm:p-8">
          
          {/* Top: Flag & Tag */}
          <div className="flex justify-between items-start mb-auto">
            {country.flag ? (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                <img src={country.flag} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold font-heading">
                {country.name.charAt(0)}
              </div>
            )}

            <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Active
            </div>
          </div>

          {/* Bottom: Info */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-4 group-hover:text-accent-400 transition-colors">
              {country.name}
            </h3>

            <div className="flex flex-col gap-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
              
              {/* Stats row */}
              <div className="flex items-center gap-4 text-sm font-medium text-white/90">
                <div className="flex items-center gap-1.5">
                  <ArticleIcon fontSize="small" className="text-accent-400" />
                  <span>{country.visas_count || 0} Programs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ApartmentIcon fontSize="small" className="text-accent-400" />
                  <span>{country.companies_count || 0} Companies</span>
                </div>
              </div>
              
              {/* Divider & CTA */}
              <div className="h-px w-full bg-white/10 mt-2 mb-1" />
              <div className="flex items-center justify-between text-white font-bold text-sm">
                Explore Programs
                <ArrowForwardIcon fontSize="small" className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}

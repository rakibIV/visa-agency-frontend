import { motion } from 'framer-motion';

export default function SectionHeading({ title, subtitle, light = false, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`${center ? 'text-center' : ''} mb-12`}
    >
      <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy-900'}`}>
        {title}
      </h2>
      <div className="flex items-center gap-2 mt-3 mb-4 justify-center">
        <div className="w-8 h-1 rounded-full bg-accent-600" />
        <div className="w-3 h-1 rounded-full bg-accent-400" />
        <div className="w-1.5 h-1 rounded-full bg-accent-300" />
      </div>
      {subtitle && (
        <p className={`text-base sm:text-lg max-w-2xl ${center ? 'mx-auto' : ''} ${light ? 'text-navy-200' : 'text-navy-600'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

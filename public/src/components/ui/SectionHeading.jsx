import { motion } from 'framer-motion';

export default function SectionHeading({ title, subtitle, light = false, center = true, eyebrow = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`${center ? 'text-center' : ''} mb-12`}
    >
      {eyebrow && (
        <span className={`eyebrow mb-3 block ${light ? 'text-accent-400' : 'text-accent-600'}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`display-lg font-heading ${light ? 'text-white' : 'text-navy-900'} mb-4`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`body-lg max-w-2xl ${center ? 'mx-auto' : ''} ${light ? 'text-navy-200' : 'text-navy-600'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

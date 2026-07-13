import { motion } from 'framer-motion';

export default function TestimonialCard({ review, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-navy hover:shadow-navy-lg transition-all duration-300 border border-navy-100/50"
    >
      {/* Stars */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= review.rating ? 'text-gold-500' : 'text-navy-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-navy-700 text-sm leading-relaxed mb-5 italic">
        "{review.comment}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 border-t border-navy-100 pt-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white font-bold text-sm">
          {review.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        <div>
          <p className="text-sm font-bold text-navy-900">{review.name}</p>
          <p className="text-xs text-navy-500">Verified Client</p>
        </div>
      </div>
    </motion.div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function StatCard({ icon, value, label, suffix = '', index = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value) || 0;

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const stepTime = Math.max(Math.floor(duration / numericValue), 10);
    const timer = setInterval(() => {
      start += Math.ceil(numericValue / (duration / stepTime));
      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
        {icon}
      </div>
      <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-semibold text-navy-300 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

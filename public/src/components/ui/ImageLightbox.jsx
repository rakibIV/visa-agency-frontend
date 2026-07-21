import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export default function ImageLightbox({ 
  isOpen, 
  images = [], 
  currentIndex = 0, 
  onClose, 
  onNext, 
  onPrev 
}) {
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight' && onNext) onNext();
    if (e.key === 'ArrowLeft' && onPrev) onPrev();
  }, [isOpen, onClose, onNext, onPrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown, isOpen]);

  if (!isOpen || !images || images.length === 0) return null;

  // Handle both array of strings and array of objects
  const currentImage = images[currentIndex];
  const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage?.image || currentImage?.src;
  const imageCaption = typeof currentImage === 'object' ? currentImage?.caption : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <CloseIcon />
          </button>

          {/* Previous Button */}
          {images.length > 1 && onPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-4 md:left-8 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <ArrowBackIosNewIcon />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && onNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 md:right-8 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <ArrowForwardIosIcon />
            </button>
          )}

          {/* Image Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={imageCaption || `Fullscreen image ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            
            {imageCaption && (
              <div className="mt-4 text-white/90 text-center text-lg font-medium tracking-wide">
                {imageCaption}
              </div>
            )}
            
            {images.length > 1 && (
              <div className="mt-2 text-white/50 text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

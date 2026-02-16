import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoGalleryModal = ({ images, onClose }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <button className="gallery-close-btn" onClick={onClose}>
        <X size={24} />
      </button>

      <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
        <div className="gallery-modal-header">
          <h3>Tüm Fotoğraflar</h3>
        </div>

        <div className="gallery-modal-grid">
          {images.map((img, idx) => (
            <div key={idx} className="gallery-modal-item" onClick={() => openLightbox(idx)}>
              <img src={img} alt={`Gallery image ${idx + 1}`} loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close-btn" onClick={closeLightbox}>
            <X size={32} />
          </button>

          <button className="lightbox-nav-btn prev" onClick={handlePrev}>
            <ChevronLeft size={48} />
          </button>

          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={images[lightboxIndex]} alt={`Full screen ${lightboxIndex + 1}`} />
            <div className="lightbox-counter">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>

          <button className="lightbox-nav-btn next" onClick={handleNext}>
            <ChevronRight size={48} />
          </button>
        </div>
      )}

      <style>{`
        .gallery-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          z-index: 3000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          animation: overlayFadeIn 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }

        .gallery-modal-content {
          background: white;
          width: 100%;
          max-width: 1200px;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalScaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center center;
          opacity: 0;
        }

        .gallery-modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          z-index: 10;
        }

        .gallery-modal-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #1a1a1a;
        }

        .gallery-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: rgba(255, 255, 255, 0.9);
          color: #1a1a1a;
          border: 1px solid #e5e5e5;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          z-index: 3001;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .gallery-close-btn:hover {
          transform: scale(1.1) rotate(90deg);
          box-shadow: 0 8px 16px rgba(0,0,0,0.12);
        }

        .gallery-modal-grid {
          flex: 1;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          padding: 32px;
          background: #fafafa;
        }

        .gallery-modal-item {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
          aspect-ratio: 3/2;
          background: #f0f0f0;
          cursor: pointer;
          position: relative;
        }
        
        .gallery-modal-item::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .gallery-modal-item:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
          z-index: 2;
        }
        
        .gallery-modal-item:hover::after {
          opacity: 1;
        }

        .gallery-modal-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        
        .gallery-modal-item:hover img {
           transform: scale(1.05);
        }

        /* Lightbox Styles */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.98);
          z-index: 4000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-out;
        }

        .lightbox-content {
          max-width: 90vw;
          max-height: 90vh;
          position: relative;
        }

        .lightbox-content img {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }

        .lightbox-counter {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 16px;
          font-weight: 500;
          opacity: 0.8;
        }

        .lightbox-close-btn {
          position: absolute;
          top: 30px;
          right: 30px;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          z-index: 4002;
        }

        .lightbox-close-btn:hover {
          opacity: 1;
        }

        .lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 4002;
          backdrop-filter: blur(5px);
        }

        .lightbox-nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-50%) scale(1.1);
        }

        .lightbox-nav-btn.prev {
          left: 40px;
        }

        .lightbox-nav-btn.next {
          right: 40px;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(10px); }
        }

        @keyframes modalScaleUp {
          from { 
            opacity: 0; 
            transform: scale(0.92) translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .gallery-modal-overlay {
            padding: 0;
          }
          .gallery-modal-content {
            border-radius: 0;
            animation: modalSlideUpMobile 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .gallery-modal-grid {
            grid-template-columns: 1fr;
            padding: 16px;
            gap: 16px;
          }
          .gallery-close-btn {
             top: 16px;
             right: 16px;
             background: white;
          }
          
          .lightbox-nav-btn {
              width: 44px;
              height: 44px;
              background: rgba(0,0,0,0.3);
          }
          .lightbox-nav-btn.prev { left: 10px; }
          .lightbox-nav-btn.next { right: 10px; }
          
          @keyframes modalSlideUpMobile {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>

    </div>
  );
};

export default PhotoGalleryModal;

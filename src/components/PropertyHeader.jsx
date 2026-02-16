import React, { useState } from 'react';
import { MapPin, Star, Share2, Heart, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const PropertyHeader = ({
  title,
  location,
  city = 'Muğla',
  rating = 5.0,
  reviewCount = 0,
  type = 'VILLA',
  onSave
}) => {
  const { t, i18n } = useTranslation();
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (onSave) onSave();
  };

  return (
    <div className="detail-header">
      {/* Breadcrumb / Navigation */}
      <div className="header-nav">
        <Link to="/" className="nav-link">{t('booking.back_home')}</Link>
        <ChevronRight size={16} className="nav-arrow" />
        <Link to={type === 'VILLA' ? '/villas' : '/yachts'} className="nav-link">
          {type === 'VILLA' ? t('nav.villas') : t('nav.yachts')}
        </Link>
        <ChevronRight size={16} className="nav-arrow" />
        <span className="current-page">{title}</span>
      </div>

      <div className="header-content">
        <h1 className="property-title">{title}</h1>

        <div className="location-row">
          <div className="location-tag">
            <MapPin size={18} /> {location}, {city}
          </div>
          <div className="rating-tag">
            <Star size={18} fill="currentColor" />
            <span className="score">{rating}</span>
            <span className="reviews">({reviewCount} {t('details.reviews')})</span>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="icon-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
          <Share2 size={18} /> {t('details.share')}
        </button>
        <button className={`icon-btn ${isSaved ? 'active' : ''}`} onClick={handleSave}>
          <Heart size={18} fill={isSaved ? "currentColor" : "none"} /> {t('details.save')}
        </button>
      </div>

      <style>{`
        .detail-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #86868b;
          margin-bottom: 8px;
        }

        .nav-link {
          text-decoration: none;
          color: inherit;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #000; }

        .current-page {
          color: #1d1d1f;
          font-weight: 500;
        }

        .property-title {
          font-size: 3.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 12px;
          color: #1d1d1f;
        }

        .location-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          font-size: 1.1rem;
          color: #1d1d1f;
        }

        .location-tag, .rating-tag {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .score { font-weight: 600; }
        .reviews { 
          color: #86868b; 
          text-decoration: underline;
          cursor: pointer;
        }

        .action-buttons {
          display: flex;
          gap: 16px;
          margin-top: 8px;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #f5f5f7;
          border: none;
          border-radius: 100px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #1d1d1f;
        }

        .icon-btn:hover {
          background: #e8e8ed;
          transform: translateY(-1px);
        }

        .icon-btn.active {
          background: #ffe0e0;
          color: #e00000;
        }

        @media(max-width: 768px) {
          .property-title { font-size: 2rem; }
          .location-row { flex-direction: column; gap: 8px; font-size: 1rem; }
          .header-nav { display: none; }
        }
      `}</style>
    </div>
  );
};

export default PropertyHeader;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import villaImg from '../assets/luxury-villa.png';
import yachtImg from '../assets/modern-yacht.png';
import { useTranslation } from 'react-i18next';
import PremiumServices from './PremiumServices';
import FeaturedProperties from './FeaturedProperties';
import Testimonials from './Testimonials';

const LandingPage = () => {
  const [hoveredSide, setHoveredSide] = useState(null);
  const [serviceType, setServiceType] = useState('VILLA');
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <div className="landing-container">
        {/* Left Side - Villas */}
        <div
          className={`split-side left ${hoveredSide === 'left' ? 'expanded' : ''} ${hoveredSide === 'right' ? 'condensed' : ''}`}
          onMouseEnter={() => setHoveredSide('left')}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <div className="bg-image" style={{ backgroundImage: `url(${villaImg})` }} />
          <div className="overlay" />
          <div className="content">
            <h2 className="title-lg">{t('hero.discover_villas')}</h2>
            <p className="subtitle">{t('footer.desc')}</p>
            <button className="btn-primary" onClick={() => navigate('/villas')}>
              {t('hero.discover_villas')} <ArrowRight size={20} style={{ marginLeft: 8, verticalAlign: 'middle' }} />
            </button>
          </div>
        </div>

        {/* Right Side - Yachts */}
        <div
          className={`split-side right ${hoveredSide === 'right' ? 'expanded' : ''} ${hoveredSide === 'left' ? 'condensed' : ''}`}
          onMouseEnter={() => setHoveredSide('right')}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <div className="bg-image" style={{ backgroundImage: `url(${yachtImg})` }} />
          <div className="overlay" />
          <div className="content">
            <h2 className="title-lg">{t('hero.discover_yachts')}</h2>
            <p className="subtitle">{t('footer.desc')}</p>
            <button className="btn-primary" onClick={() => navigate('/yachts')}>
              {t('hero.discover_yachts')} <ArrowRight size={20} style={{ marginLeft: 8, verticalAlign: 'middle' }} />
            </button>
          </div>
        </div>

        <style>{`
        .landing-container {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          overflow: hidden;
        }

        .split-side {
          position: relative;
          width: 50%;
          height: 100%;
          transition: width var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .split-side.expanded {
          width: 75%;
        }

        .split-side.condensed {
          width: 25%;
        }

        .bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform var(--transition-smooth);
        }

        .split-side:hover .bg-image {
          transform: scale(1.05);
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5));
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
          opacity: 0.9;
          transform: translateY(20px);
          transition: transform var(--transition-smooth), opacity var(--transition-smooth);
        }

        .split-side:hover .content {
          transform: translateY(0);
          opacity: 1;
        }

        .subtitle {
          font-size: 1.25rem;
          margin-bottom: 24px;
          margin-top: 8px;
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .landing-container {
            flex-direction: column;
            height: 100vh;
          }
          .split-side {
            width: 100% !important;
            height: 50%;
          }
        }
      `}</style>
      </div>

      <FeaturedProperties />

      <div style={{ background: '#ffffff' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ display: 'inline-flex', background: '#f5f5f7', padding: '4px', borderRadius: '100px', marginBottom: 20 }}>
            <button
              onClick={() => setServiceType('VILLA')}
              style={{
                padding: '10px 24px',
                borderRadius: '100px',
                background: serviceType === 'VILLA' ? 'black' : 'transparent',
                color: serviceType === 'VILLA' ? 'white' : 'black',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              Villa Services
            </button>
            <button
              onClick={() => setServiceType('YACHT')}
              style={{
                padding: '10px 24px',
                borderRadius: '100px',
                background: serviceType === 'YACHT' ? 'black' : 'transparent',
                color: serviceType === 'YACHT' ? 'white' : 'black',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              Yacht Services
            </button>
          </div>
        </div>
        <PremiumServices type={serviceType} />
      </div>

      <Testimonials />

      <section className="cta-section section-padding" style={{ background: '#1d1d1f', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 className="title-md" style={{ color: 'white', marginBottom: 20 }}>Ready for your dream vacation?</h2>
          <p className="text-secondary" style={{ color: '#a1a1a6', maxWidth: 600, margin: '0 auto 40px', fontSize: '1.2rem' }}>
            Contact us today to book your luxury villa or private yacht charter.
          </p>
          <button className="btn-primary" onClick={() => navigate('/hakkimizda')}>
            Contact Us
          </button>
        </div>
      </section>
    </>
  );
};

export default LandingPage;

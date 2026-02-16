import React from 'react';
import { Shield, Star, Lock, Layout, Users, Ship, Home } from 'lucide-react';
import heroImg from '../assets/luxury-villa.png'; // Corrected asset path

import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

const AboutPage = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title fade-in-up" dangerouslySetInnerHTML={{ __html: t('about.hero_title') }}></h1>
          <p className="hero-subtitle fade-in-up delay-1">{t('about.hero_subtitle')}</p>
        </div>
      </div>

      <div className="container">
        {/* Story Section */}
        <div className="story-section">
          <div className="section-header text-center">
            <h2 className="title-lg">{t('about.story_title')}</h2>
            <div className="subtitle-divider"></div>
          </div>
          <div className="story-content">
            <p>{t('about.story_text1')}</p>
            <p>{t('about.story_text2')}</p>
          </div>
        </div>

        {/* Why Us Grid */}
        <div className="why-us-section">
          <div className="section-header text-center">
            <h2 className="title-md">{t('about.why_us_title')}</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Star size={32} />
              </div>
              <h3>{t('about.reason1_title')}</h3>
              <p>{t('about.reason1_desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Layout size={32} />
              </div>
              <h3>{t('about.reason2_title')}</h3>
              <p>{t('about.reason2_desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Shield size={32} />
              </div>
              <h3>{t('about.reason3_title')}</h3>
              <p>{t('about.reason3_desc')}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">50+</div>
              <div className="stat-label">
                <Home size={18} /> {t('about.stats_properties')}
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">20+</div>
              <div className="stat-label">
                <Ship size={18} /> {t('about.stats_years')}
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">%98</div>
              <div className="stat-label">
                <Users size={18} /> {t('about.stats_guests')}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Contact Section */}
        <div className="contact-section" style={{ marginTop: '80px', textAlign: 'center' }}>
          <h2 className="title-md">{t('nav.contact') || "İletişim"}</h2>
          <div className="subtitle-divider"></div>
          <div className="contact-grid" style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '50px', height: '50px', background: '#f5f5f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={20} color="#1d1d1f" />
              </div>
              <p style={{ maxWidth: '200px', color: '#86868b' }}>{settings?.address}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '50px', height: '50px', background: '#f5f5f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#1d1d1f" />
              </div>
              <p style={{ color: '#86868b' }}>{settings?.contactPhone}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '50px', height: '50px', background: '#f5f5f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} color="#1d1d1f" />
              </div>
              <p style={{ color: '#86868b' }}>{settings?.contactEmail}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-page {
          padding-bottom: 80px;
        }

        /* Hero Styles */
        .about-hero {
          position: relative;
          height: 60vh;
          min-height: 400px;
          background-image: url(${heroImg});
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 80px;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 20px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          font-weight: 400;
          opacity: 0.9;
        }

        /* Story Section */
        .story-section {
          margin-bottom: 100px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .subtitle-divider {
          width: 60px;
          height: 4px;
          background: #1d1d1f;
          margin: 20px auto 40px;
          border-radius: 2px;
        }

        .story-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .story-content p {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #424245;
          text-align: center;
        }

        /* Why Us Grid */
        .why-us-section {
          margin-bottom: 100px;
        }
        
        .why-us-section .title-md {
            margin-bottom: 40px;
            font-size: 2rem;
            color: #1d1d1f;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .feature-card {
          background: white;
          padding: 40px 30px;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(0,0,0,0.03);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        .feature-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: #f5f5f7;
          border-radius: 50%;
          margin-bottom: 24px;
          color: #1d1d1f;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1d1d1f;
        }

        .feature-card p {
          font-size: 1rem;
          color: #86868b;
          line-height: 1.6;
        }

        /* Stats Section */
        .stats-section {
          background: #1d1d1f;
          border-radius: 24px;
          padding: 60px 40px;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .stats-grid {
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 40px;
        }

        .stat-item {
          text-align: center;
          flex: 1;
          min-width: 150px;
        }

        .stat-value {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #fff 0%, #a1a1a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1.1rem;
          color: #a1a1a6;
          font-weight: 500;
        }
        
        .stat-divider {
            width: 1px;
            height: 80px;
            background: rgba(255,255,255,0.1);
            display: none;
        }

        /* Animations */
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        .delay-1 {
          animation-delay: 0.2s;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (min-width: 768px) {
            .stat-divider {
                display: block;
            }
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .about-hero {
            height: 50vh;
          }
          .stats-grid {
             flex-direction: column;
             gap: 40px;
          }
          .stat-divider {
             display: none;
          }
        }
      `}</style>
    </div >
  );
};

export default AboutPage;

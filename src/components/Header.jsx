import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import logo from '../assets/logo.png';
import ContactModal from './ContactModal';
import propTypes from 'prop-types'; // unused but keeping imports clean
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

const Header = () => {
    const { t, i18n } = useTranslation();
    const { settings } = useSettings();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
    };

    const headerClass = isHome && !scrolled ? 'site-header transparent' : 'site-header solid';

    return (
        <header className={headerClass}>


            {/* Main Navigation */}
            <div className="main-nav">
                <div className="container nav-inner">
                    {/* Logo */}
                    <Link to="/" className="nav-logo">
                        <img src={settings?.siteLogo ? `http://localhost:5001${settings.siteLogo}` : logo} alt={settings?.siteName || "Şenay Villa Yat"} />
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="desktop-menu">
                        <Link to="/villas" className="nav-link">{t('nav.villas')}</Link>
                        <Link to="/yachts" className="nav-link">{t('nav.yachts')}</Link>
                        <Link to="/hakkimizda" className="nav-link">{t('nav.about')}</Link>
                        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setContactModalOpen(true); }}>{t('nav.contact')}</a>

                        <button className="lang-btn" onClick={toggleLanguage}>
                            <Globe size={18} /> {i18n.language.toUpperCase()}
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav-links">
                    <Link to="/villas" onClick={() => setMobileMenuOpen(false)}>{t('nav.villas')}</Link>
                    <Link to="/yachts" onClick={() => setMobileMenuOpen(false)}>{t('nav.yachts')}</Link>
                    <a href="#" onClick={() => setMobileMenuOpen(false)}>{t('nav.about')}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setContactModalOpen(true); setMobileMenuOpen(false); }}>{t('nav.contact')}</a>
                    <button className="mobile-lang-btn" onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}>
                        <Globe size={20} style={{ marginRight: 8 }} /> {i18n.language === 'tr' ? 'English' : 'Türkçe'}
                    </button>
                </nav>
            </div>

            <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />

            <style>{`
                .site-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    z-index: 1000;
                    transition: background 0.3s ease, padding 0.3s ease, box-shadow 0.3s ease;
                }

                .site-header.solid {
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }
                
                .site-header.transparent {
                    background: transparent;
                }



                /* Main Nav */
                .main-nav {
                    padding: 20px 0;
                    transition: padding 0.3s ease;
                }

                .site-header.solid .main-nav {
                    padding: 12px 0;
                }

                .nav-inner {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-logo img {
                    height: 60px;
                    width: auto;
                    transition: height 0.3s ease;
                }

                .site-header.solid .nav-logo img {
                    height: 50px;
                    mix-blend-mode: multiply;
                }

                .desktop-menu {
                    display: flex;
                    gap: 32px;
                    align-items: center;
                }

                .nav-link {
                    font-size: 0.95rem;
                    font-weight: 600;
                    position: relative;
                    letter-spacing: 0.5px;
                    transition: color 0.3s;
                }
                
                /* Text Colors */
                .site-header.transparent .nav-link,
                .site-header.transparent .lang-btn {
                    color: white;
                }
                
                .site-header.solid .nav-link,
                .site-header.solid .lang-btn {
                    color: #1d1d1f;
                }

                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: currentColor;
                    transition: width 0.3s ease;
                }

                .nav-link:hover::after {
                    width: 100%;
                }

                .lang-btn {
                    background: none;
                    border: 1px solid currentColor;
                    padding: 6px 12px;
                    border-radius: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 600;
                    font-size: 0.8rem;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                
                .lang-btn:hover {
                    opacity: 1;
                }

                .mobile-toggle {
                    display: none;
                    background: none;
                }
                
                .site-header.transparent .mobile-toggle { color: white; }
                .site-header.solid .mobile-toggle { color: #1d1d1f; }


                /* Mobile Menu */
                .mobile-menu {
                    position: fixed;
                    top: 0;
                    right: -100%;
                    width: 80%;
                    height: 100vh;
                    background: white;
                    box-shadow: -10px 0 30px rgba(0,0,0,0.1);
                    z-index: 999;
                    transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    padding: 100px 40px;
                }

                .mobile-menu.open {
                    right: 0;
                }

                .mobile-nav-links {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .mobile-nav-links a {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1d1d1f;
                }

                .mobile-lang-btn {
                    margin-top: 20px;
                    background: #f5f5f7;
                    border: none;
                    padding: 15px;
                    border-radius: 12px;
                    font-size: 1.2rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    color: #1d1d1f;
                }

                @media (max-width: 900px) {
                    .desktop-menu { display: none; }
                    .mobile-toggle { display: block; }

                }
            `}</style>
        </header>
    );
};

export default React.memo(Header);

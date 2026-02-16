import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail, Linkedin, MessageCircle } from 'lucide-react';
import logo from '../assets/logo.png';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
    const { settings } = useSettings();
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-col brand-col">
                        <img src={settings?.siteLogo ? `http://localhost:5001${settings.siteLogo}` : logo} alt={settings?.siteName} className="footer-logo" />
                        <p className="brand-desc">
                            {settings?.footerAboutText || "Lüksün ve konforun adresi. Ege'nin en özel villa ve yatlarıyla unutulmaz bir tatil deneyimi sunuyoruz."}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4>Hızlı Linkler</h4>
                        <nav className="footer-nav">
                            <Link to="/villas">Kiralık Villalar</Link>
                            <Link to="/yachts">Yatlar</Link>
                            <a href="#">Bölgeler</a>
                            <Link to="/hakkimizda">Hakkımızda</Link>
                        </nav>
                    </div>

                    {/* Social Media */}
                    <div className="footer-col">
                        <h4>Bizi Takip Edin</h4>
                        <div className="social-links">
                            {settings?.instagramUrl && (
                                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                    <Instagram size={20} />
                                    <span>Instagram</span>
                                </a>
                            )}
                            {settings?.facebookUrl && (
                                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                    <Facebook size={20} />
                                    <span>Facebook</span>
                                </a>
                            )}
                            {settings?.youtubeUrl && (
                                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                    <Youtube size={20} />
                                    <span>Youtube</span>
                                </a>
                            )}
                            {settings?.linkedinUrl && (
                                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                    <Linkedin size={20} />
                                    <span>LinkedIn</span>
                                </a>
                            )}
                            {settings?.whatsappNumber && (
                                <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="social-link">
                                    <MessageCircle size={20} />
                                    <span>WhatsApp</span>
                                </a>
                            )}
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <ul className="contact-list">
                                <li>
                                    <Phone size={18} />
                                    <span>{settings?.contactPhone || "+90 532 000 00 00"}</span>
                                </li>
                                <li>
                                    <Mail size={18} />
                                    <span>{settings?.notificationEmail || settings?.contactEmail || "info@senayvillayat.com"}</span>
                                </li>
                                <li>
                                    <MapPin size={18} />
                                    <span>{settings?.address || "Göltürkbükü, Bodrum / Muğla"}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>{settings?.copyrightText || `© ${new Date().getFullYear()} Şenay Villa & Yat. Tüm hakları saklıdır.`}</p>
                </div>
            </div>

            <style>{`
                .site-footer {
                    background-color: #f5f5f7;
                    border-top: 1px solid #d2d2d7;
                    padding: 80px 0 30px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    color: #1d1d1f;
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 60px;
                    margin-bottom: 60px;
                }

                .footer-col h4 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 24px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.8;
                }

                /* Brand Col */
                .footer-logo {
                    height: 50px;
                    width: auto;
                    margin-bottom: 20px;
                    mix-blend-mode: multiply; /* Helps logo blend with light bg */
                }

                .brand-desc {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    opacity: 0.7;
                    max-width: 300px;
                }

                /* Links */
                .footer-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .footer-nav a {
                    color: #1d1d1f;
                    text-decoration: none;
                    font-size: 0.95rem;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }

                .footer-nav a:hover {
                    opacity: 1;
                }

                /* Social */
                .social-links {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .social-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #1d1d1f;
                    text-decoration: none;
                    font-size: 0.95rem;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }

                .social-link:hover {
                    opacity: 1;
                }

                /* Contact */
                .contact-list {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .contact-list li {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.95rem;
                    opacity: 0.7;
                }

                /* Bottom */
                .footer-bottom {
                    border-top: 1px solid #e1e1e6;
                    padding-top: 30px;
                    text-align: center;
                }

                .footer-bottom p {
                    font-size: 0.85rem;
                    opacity: 0.5;
                }

                /* Responsive */
                @media (max-width: 960px) {
                    .footer-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                    }
                }

                @media (max-width: 600px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }

                    .site-footer {
                        padding: 60px 0 30px;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;

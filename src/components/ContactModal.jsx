import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Instagram, Linkedin, MessageCircle } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const ContactModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const socialLinks = [
        {
            name: 'Instagram',
            icon: <Instagram size={24} />,
            url: 'https://instagram.com/mehmetsenay48',
            color: '#E1306C',
            handle: '@mehmetsenay48'
        },
        {
            name: 'WhatsApp',
            icon: <MessageCircle size={24} />,
            url: 'https://wa.me/905301462131',
            color: '#25D366',
            handle: '+90 530 146 21 31'
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin size={24} />,
            url: 'https://www.linkedin.com/in/mehmet-şenay-8923a4258',
            color: '#0077B5',
            handle: 'Mehmet Şenay'
        }
    ];

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content contact-modal"
                onClick={e => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <h2 className="title-md" style={{ marginBottom: 32, textAlign: 'center' }}>{t('nav.contact')}</h2>

                <div className="contact-links-grid">
                    {socialLinks.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-card"
                            style={{ '--hover-color': link.color }}
                        >
                            <div className="icon-wrapper" style={{ color: link.color }}>
                                {link.icon}
                            </div>
                            <div className="link-info">
                                <span className="link-name">{link.name}</span>
                                <span className="link-handle text-secondary">{link.handle}</span>
                            </div>
                        </a>
                    ))}
                </div>


            </div>
        </div>,
        document.body
    );
};

export default ContactModal;

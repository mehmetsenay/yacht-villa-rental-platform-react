
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Utensils, CalendarDays, Sparkles, Waves, Sailboat, ShoppingBag, ShieldCheck } from 'lucide-react';

const PremiumServices = ({ type = 'VILLA' }) => {
    const { t } = useTranslation();

    const services = type === 'VILLA' ? [
        {
            icon: <Car size={32} strokeWidth={1} />,
            title: t('services.villa.transfer_title'),
            desc: t('services.villa.transfer_desc')
        },
        {
            icon: <Utensils size={32} strokeWidth={1} />,
            title: t('services.villa.chef_title'),
            desc: t('services.villa.chef_desc')
        },
        {
            icon: <CalendarDays size={32} strokeWidth={1} />,
            title: t('services.villa.events_title'),
            desc: t('services.villa.events_desc')
        },
        {
            icon: <Sparkles size={32} strokeWidth={1} />,
            title: t('services.villa.cleaning_title'),
            desc: t('services.villa.cleaning_desc')
        }
    ] : [
        // Yacht Services
        {
            icon: <Waves size={32} strokeWidth={1} />,
            title: t('services.yacht.watersports_title'),
            desc: t('services.yacht.watersports_desc')
        },
        {
            icon: <Sailboat size={32} strokeWidth={1} />,
            title: t('services.yacht.tour_title'),
            desc: t('services.yacht.tour_desc')
        },
        {
            icon: <ShoppingBag size={32} strokeWidth={1} />,
            title: t('services.yacht.provisions_title'),
            desc: t('services.yacht.provisions_desc')
        },
        {
            icon: <Car size={32} strokeWidth={1} />,
            title: t('services.yacht.transfer_title'),
            desc: t('services.yacht.transfer_desc')
        }
    ];

    return (
        <section className="premium-services-section">
            <div className="container">
                <h2 className="section-title text-center">{t('services.title')}</h2>
                <div className="services-grid">
                    {services.map((service, index) => (
                        <div key={index} className="service-card">
                            <div className="service-icon">
                                {service.icon}
                            </div>
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-desc">{service.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PremiumServices;

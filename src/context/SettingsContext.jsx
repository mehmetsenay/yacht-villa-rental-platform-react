
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        siteName: 'Şenay Villa & Yat',
        siteLogo: null,
        contactPhone: '+90 555 555 55 55',
        contactPhone: '+90 555 555 55 55',
        contactEmail: 'info@senayvillayat.com',
        notificationEmail: '',
        address: 'Fethiye, Muğla',
        youtubeUrl: '',
        instagramUrl: '',
        facebookUrl: '',
        whatsappNumber: '',
        linkedinUrl: '',
        footerAboutText: 'En iyi tatil deneyimi için buradayız.',
        copyrightText: '© 2024 Şenay Villa & Yat. Tüm hakları saklıdır.'
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettingsGlobally = (newSettings) => {
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettingsGlobally }}>
            {children}
        </SettingsContext.Provider>
    );
};

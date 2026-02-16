import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl, getImageUrl as getFullImageUrl } from '../utils/urlHelper';
import { LayoutDashboard, List, Settings, LogOut, Trash2, Edit2, Plus, Save, Upload } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('reservations');
    const [bookings, setBookings] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'VILLA',
        dailyPrice: '',
        location: '',
        latitude: 36.20,
        longitude: 29.63,
        description: '',
        amenities: [],
        images: [],
        capacity: '',
        cabins: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Settings State
    const [settingsData, setSettingsData] = useState({
        siteName: '',
        contactPhone: '',
        contactEmail: '',
        notificationEmail: '',
        address: '',
        youtubeUrl: '',
        instagramUrl: '',
        facebookUrl: '',
        whatsappNumber: '',
        linkedinUrl: '',
        footerAboutText: '',
        copyrightText: ''
    });
    const [settingsLogo, setSettingsLogo] = useState(null);
    const [existingLogoUrl, setExistingLogoUrl] = useState(null);

    // Leaflet Icon Fix
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    const availableAmenities = [
        "Havuz", "Wifi", "Klima", "Otopark",
        "Deniz Manzarası", "Özel Şef", "Mürettebat", "Jakuzi"
    ];

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchData(token);
    }, [navigate, activeTab]);

    const fetchData = async (token) => {
        setLoading(true);
        try {
            if (activeTab === 'reservations') {
                const res = await fetch(`${getBackendUrl()}/api/bookings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setBookings(await res.json());
            } else if (activeTab === 'listings') {
                const res = await fetch(`${getBackendUrl()}/api/properties`);
                if (res.ok) setProperties(await res.json());
            } else if (activeTab === 'settings') {
                const res = await fetch(`${getBackendUrl()}/api/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setSettingsData({
                        siteName: data.siteName || '',
                        contactPhone: data.contactPhone || '',
                        contactEmail: data.contactEmail || '',
                        notificationEmail: data.notificationEmail || '',
                        address: data.address || '',
                        youtubeUrl: data.youtubeUrl || '',
                        instagramUrl: data.instagramUrl || '',
                        facebookUrl: data.facebookUrl || '',
                        whatsappNumber: data.whatsappNumber || '',
                        linkedinUrl: data.linkedinUrl || '',
                        footerAboutText: data.footerAboutText || '',
                        copyrightText: data.copyrightText || ''
                    });
                    setExistingLogoUrl(data.siteLogo);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleDeleteProperty = async (id) => {
        if (!window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
        const token = localStorage.getItem('adminToken');
        try {
            await fetch(`${getBackendUrl()}/api/properties/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(token); // Refresh
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenModal = (property = null) => {
        setSelectedFiles([]);
        if (property) {
            setEditingProperty(property);
            let parsedAmenities = [];
            try {
                parsedAmenities = JSON.parse(property.amenities) || [];
            } catch (e) {
                parsedAmenities = [];
            }
            setFormData({
                name: property.name,
                type: property.type,
                dailyPrice: property.dailyPrice,
                location: property.location,
                latitude: property.latitude || 36.20,
                longitude: property.longitude || 29.63,
                description: property.description,
                amenities: parsedAmenities,
                images: property.images || [],
                capacity: property.capacity || '',
                cabins: property.cabins || ''
            });
        } else {
            setEditingProperty(null);
            setFormData({
                name: '',
                type: 'VILLA',
                dailyPrice: '',
                location: '',
                latitude: 36.20,
                longitude: 29.63,
                description: '',
                amenities: [],
                images: [],
                capacity: '',
                cabins: ''
            });
        }
        setShowModal(true);
    };

    const handleAmenityChange = (amenity) => {
        setFormData(prev => {
            if (prev.amenities.includes(amenity)) {
                return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...prev.amenities, amenity] };
            }
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingImage = async (imageId) => {
        if (!window.confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${getBackendUrl()}/api/properties/${editingProperty.id}/images/${imageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Update local state to remove the image immediately from view
                setFormData(prev => ({
                    ...prev,
                    images: prev.images.filter(img => img.id !== imageId)
                }));
                // Also update the properties list in background if needed, or just let local state handle it until refresh
            } else {
                alert("Fotoğraf silinemedi.");
            }
        } catch (error) {
            console.error(error);
            alert("Hata oluştu.");
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://placehold.co/600x400';
        return getFullImageUrl(path);
    };


    // Location Picker Component for Map
    const LocationPicker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                // Auto fetch address
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.display_name) {
                            setFormData(prev => ({ ...prev, location: data.display_name }));
                        }
                    })
                    .catch(console.error);
            },
        });
        return formData.latitude && formData.longitude ? (
            <Marker position={[formData.latitude, formData.longitude]} />
        ) : null;
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        const data = new FormData();

        Object.keys(settingsData).forEach(key => {
            if (settingsData[key] !== null && settingsData[key] !== undefined) {
                data.append(key, settingsData[key]);
            }
        });

        if (settingsLogo) {
            data.append('siteLogo', settingsLogo);
        }

        try {
            const res = await fetch(`${getBackendUrl()}/api/settings`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                const updated = await res.json();
                setExistingLogoUrl(updated.siteLogo);
                alert("Ayarlar güncellendi!");
            } else {
                alert("Güncelleme başarısız.");
            }
        } catch (error) {
            console.error(error);
            alert("Hata oluştu.");
        }
    };

    const handleSaveProperty = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');

        if (!formData.name || !formData.dailyPrice) {
            alert("Lütfen zorunlu alanları doldurun.");
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('dailyPrice', formData.dailyPrice);
        data.append('location', formData.location);
        if (formData.latitude) data.append('latitude', formData.latitude);
        if (formData.longitude) data.append('longitude', formData.longitude);
        data.append('description', formData.description);
        data.append('amenities', JSON.stringify(formData.amenities || []));
        if (formData.capacity) data.append('capacity', formData.capacity);
        if (formData.cabins) data.append('cabins', formData.cabins);

        // Append new images
        if (selectedFiles.length > 0) {
            for (let i = 0; i < selectedFiles.length; i++) {
                data.append('images', selectedFiles[i]);
            }
        }

        try {
            const url = editingProperty
                ? `${getBackendUrl()}/api/properties/${editingProperty.id}`
                : `${getBackendUrl()}/api/properties`;

            const method = editingProperty ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (res.ok) {
                setShowModal(false);
                fetchData(token);
            } else {
                const errorData = await res.json();
                alert(`Kaydetme başarısız: ${errorData.error || 'Bilinmeyen hata'} \n ${errorData.details || ''}`);
            }
        } catch (error) {
            console.error(error);
            alert("Hata oluştu.");
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.logo}>Admin Panel</div>
                <nav style={styles.nav}>
                    <button
                        style={{ ...styles.navItem, ...(activeTab === 'reservations' ? styles.activeNavItem : {}) }}
                        onClick={() => setActiveTab('reservations')}
                    >
                        <LayoutDashboard size={20} /> Rezervasyonlar
                    </button>
                    <button
                        style={{ ...styles.navItem, ...(activeTab === 'listings' ? styles.activeNavItem : {}) }}
                        onClick={() => setActiveTab('listings')}
                    >
                        <List size={20} /> İlanlar
                    </button>
                    <button
                        style={{ ...styles.navItem, ...(activeTab === 'settings' ? styles.activeNavItem : {}) }}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> Ayarlar
                    </button>
                </nav>
                <div style={styles.logoutWrapper}>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={20} /> Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.main}>
                <header style={styles.header}>
                    <h1 style={styles.pageTitle}>
                        {activeTab === 'reservations' && 'Rezervasyonlar'}
                        {activeTab === 'listings' && 'İlan Yönetimi'}
                        {activeTab === 'settings' && 'Ayarlar'}
                    </h1>
                </header>

                <div style={styles.content}>
                    {loading ? (
                        <div>Yükleniyor...</div>
                    ) : (
                        <>
                            {activeTab === 'reservations' && (
                                <div style={styles.tableCard}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Müşteri</th>
                                                <th style={styles.th}>Mülk</th>
                                                <th style={styles.th}>Tarihler</th>
                                                <th style={styles.th}>Misafir</th>
                                                <th style={styles.th}>Tutar</th>
                                                <th style={styles.th}>Durum</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((booking) => (
                                                <tr key={booking.id} style={styles.tr}>
                                                    <td style={styles.td}>
                                                        <div style={{ fontWeight: 600 }}>{booking.customerName}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#86868b' }}>{booking.customerEmail}</div>
                                                    </td>
                                                    <td style={styles.td}>{booking.property?.name || 'Silinmiş Mülk'}</td>
                                                    <td style={styles.td}>
                                                        {new Date(booking.startDate).toLocaleDateString('tr-TR')} - <br />
                                                        {new Date(booking.endDate).toLocaleDateString('tr-TR')}
                                                    </td>
                                                    <td style={styles.td}>{booking.guests}</td>
                                                    <td style={styles.td}>{booking.totalPrice.toLocaleString('tr-TR')} ₺</td>
                                                    <td style={styles.td}>
                                                        <span style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '100px',
                                                            background: booking.status === 'CONFIRMED' ? '#e4f7e6' : '#fff4ce',
                                                            color: booking.status === 'CONFIRMED' ? '#34c759' : '#ff9f0a',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600
                                                        }}>
                                                            {booking.status === 'PENDING' ? 'Beklemede' : booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {bookings.length === 0 && <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center' }}>Henüz rezervasyon yok.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'listings' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                                        <button style={styles.primaryBtn} onClick={() => handleOpenModal()}>
                                            <Plus size={18} /> Yeni İlan Ekle
                                        </button>
                                    </div>
                                    <div style={styles.grid}>
                                        {properties.map(item => (
                                            <div key={item.id} style={styles.listingCard}>
                                                <div style={{ ...styles.listingImage, backgroundImage: `url(${item.images && item.images.length > 0 ? getImageUrl(item.images[0].url) : 'https://placehold.co/600x400'})` }}></div>
                                                <div style={styles.listingInfo}>
                                                    <h3 style={styles.listingTitle}>{item.name}</h3>
                                                    <p style={{ color: '#86868b', fontSize: '0.9rem' }}>{item.location}</p>
                                                    <div style={styles.listingActions}>
                                                        <button style={styles.iconBtn} onClick={() => handleOpenModal(item)}><Edit2 size={18} /></button>
                                                        <button style={{ ...styles.iconBtn, color: '#ff3b30' }} onClick={() => handleDeleteProperty(item.id)}><Trash2 size={18} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div style={{ maxWidth: '800px', background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <form onSubmit={handleSaveSettings}>
                                        <div style={{ marginBottom: '30px' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>Genel Ayarlar</h3>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Site Adı</label>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    value={settingsData.siteName}
                                                    onChange={(e) => setSettingsData({ ...settingsData, siteName: e.target.value })}
                                                />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Logo</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    {existingLogoUrl && (
                                                        <div style={{ padding: '10px', border: '1px solid #e5e5e5', borderRadius: '12px', background: '#f5f5f7' }}>
                                                            <img src={getFullImageUrl(existingLogoUrl)} alt="Logo" style={{ height: '40px' }} />
                                                        </div>
                                                    )}
                                                    <label style={{ ...styles.primaryBtn, background: '#f5f5f7', color: '#1d1d1f', cursor: 'pointer' }}>
                                                        <Upload size={18} /> Logo Yükle
                                                        <input type="file" hidden accept="image/*" onChange={(e) => setSettingsLogo(e.target.files[0])} />
                                                    </label>
                                                    {settingsLogo && <span style={{ fontSize: '0.9rem', color: '#34c759' }}>{settingsLogo.name} seçildi</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '30px' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>İletişim Bilgileri</h3>
                                            <div style={styles.formRow}>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Telefon</label>
                                                    <input
                                                        type="text"
                                                        style={styles.input}
                                                        value={settingsData.contactPhone}
                                                        onChange={(e) => setSettingsData({ ...settingsData, contactPhone: e.target.value })}
                                                    />
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Email</label>
                                                    <input
                                                        type="text"
                                                        style={styles.input}
                                                        value={settingsData.contactEmail}
                                                        onChange={(e) => setSettingsData({ ...settingsData, contactEmail: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Adres</label>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    value={settingsData.address}
                                                    onChange={(e) => setSettingsData({ ...settingsData, address: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '30px' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>Sosyal Medya</h3>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Instagram URL</label>
                                                <input type="text" style={styles.input} value={settingsData.instagramUrl} onChange={(e) => setSettingsData({ ...settingsData, instagramUrl: e.target.value })} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Facebook URL</label>
                                                <input type="text" style={styles.input} value={settingsData.facebookUrl} onChange={(e) => setSettingsData({ ...settingsData, facebookUrl: e.target.value })} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>WhatsApp Numarası (Örn: +90555...)</label>
                                                <input type="text" style={styles.input} value={settingsData.whatsappNumber} onChange={(e) => setSettingsData({ ...settingsData, whatsappNumber: e.target.value })} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>LinkedIn URL</label>
                                                <input type="text" style={styles.input} value={settingsData.linkedinUrl} onChange={(e) => setSettingsData({ ...settingsData, linkedinUrl: e.target.value })} />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '30px' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>Footer İçeriği</h3>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Hakkında Metni</label>
                                                <textarea style={styles.textarea} value={settingsData.footerAboutText} onChange={(e) => setSettingsData({ ...settingsData, footerAboutText: e.target.value })} rows={3}></textarea>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Copyright Metni</label>
                                                <input type="text" style={styles.input} value={settingsData.copyrightText} onChange={(e) => setSettingsData({ ...settingsData, copyrightText: e.target.value })} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button type="submit" style={styles.primaryBtn}>
                                                <Save size={18} /> Ayarları Güncelle
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>{editingProperty ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}</h2>
                        <form onSubmit={handleSaveProperty} style={styles.form}>
                            <div style={styles.scrollableContent}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>İlan Adı</label>
                                    <input type="text" style={styles.input} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Tip</label>
                                        <select style={styles.select} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="VILLA">Villa</option>
                                            <option value="YACHT">Yat</option>
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Günlük Fiyat (₺)</label>
                                        <input type="number" style={styles.input} value={formData.dailyPrice} onChange={(e) => setFormData({ ...formData, dailyPrice: e.target.value })} required />
                                    </div>
                                </div>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Kapasite (Kişi)</label>
                                        <input type="number" style={styles.input} value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Kabin Sayısı (Yat için)</label>
                                        <input type="number" style={styles.input} value={formData.cabins} onChange={(e) => setFormData({ ...formData, cabins: e.target.value })} />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Konum</label>
                                    <input type="text" style={styles.input} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />

                                    <div style={{ height: '300px', width: '100%', marginTop: '10px', borderRadius: '12px', overflow: 'hidden' }}>
                                        <MapContainer
                                            center={[formData.latitude || 36.20, formData.longitude || 29.63]}
                                            zoom={13}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; OpenStreetMap contributors'
                                            />
                                            <LocationPicker />
                                        </MapContainer>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#86868b', marginTop: '4px' }}>
                                        Haritada konumu işaretleyin (Otomatik adres doldurulur).
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Fotoğraflar</label>
                                    <input type="file" multiple onChange={handleFileChange} style={styles.input} accept="image/*" />

                                    {/* Image Preview Grid */}
                                    <div style={styles.imageGrid}>
                                        {/* Existing Images */}
                                        {formData.images.map(img => (
                                            <div key={img.id} style={styles.previewContainer}>
                                                <div style={{ ...styles.previewImage, backgroundImage: `url(${getImageUrl(img.url)})` }}></div>
                                                <button type="button" style={styles.removeBtn} onClick={() => handleDeleteExistingImage(img.id)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Selected Files */}
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} style={styles.previewContainer}>
                                                <div style={{ ...styles.previewImage, backgroundImage: `url(${URL.createObjectURL(file)})` }}></div>
                                                <button type="button" style={styles.removeBtn} onClick={() => handleRemoveSelectedFile(index)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Özellikler (Amenities)</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {availableAmenities.map(amenity => (
                                            <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer', background: '#f5f5f7', padding: '6px 12px', borderRadius: '100px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.amenities.includes(amenity)}
                                                    onChange={() => handleAmenityChange(amenity)}
                                                />
                                                {amenity}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Açıklama</label>
                                    <textarea style={styles.textarea} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4"></textarea>
                                </div>
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" style={styles.primaryBtn}>Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Import X icon for remove buttons
import { X } from 'lucide-react';

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        background: '#f5f5f7',
        fontFamily: "'SF Pro Display', sans-serif"
    },
    sidebar: {
        width: '280px',
        background: 'white',
        borderRight: '1px solid #e5e5e5',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 20px'
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '60px',
        paddingLeft: '12px'
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: 1
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        border: 'none',
        background: 'transparent',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: '500',
        color: '#86868b',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left'
    },
    activeNavItem: {
        background: '#f5f5f7',
        color: '#1d1d1f',
        fontWeight: '600'
    },
    logoutWrapper: {
        marginTop: 'auto'
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        border: 'none',
        background: 'transparent',
        fontSize: '1rem',
        color: '#ff3b30',
        cursor: 'pointer'
    },
    main: {
        flex: 1,
        overflowY: 'auto',
        padding: '40px 60px'
    },
    header: {
        marginBottom: '40px'
    },
    pageTitle: {
        fontSize: '2rem',
        fontWeight: '700'
    },
    tableCard: {
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        overflow: 'hidden',
        padding: '10px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left'
    },
    th: {
        padding: '24px',
        borderBottom: '1px solid #f0f0f0',
        color: '#86868b',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        fontWeight: '600'
    },
    tr: {
        borderBottom: '1px solid #f9f9f9'
    },
    td: {
        padding: '24px',
        color: '#1d1d1f',
        fontWeight: '500'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
    },
    listingCard: {
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s'
    },
    listingImage: {
        height: '180px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f0f0f0'
    },
    listingInfo: {
        padding: '20px'
    },
    listingTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '4px'
    },
    listingActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '16px'
    },
    iconBtn: {
        padding: '8px',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#86868b'
    },
    primaryBtn: {
        padding: '12px 24px',
        borderRadius: '100px',
        background: '#0071e3',
        color: 'white',
        border: 'none',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    modal: {
        background: 'white',
        borderRadius: '24px',
        padding: '0', // Removed padding to handle scrolling better internally
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '80vh',
        overflow: 'hidden'
    },
    modalTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        padding: '30px 40px 20px 40px',
        borderBottom: '1px solid #f5f5f7'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden' // Contain scroll
    },
    scrollableContent: {
        padding: '30px 40px',
        overflowY: 'auto',
        maxHeight: '60vh'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '20px'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#1d1d1f'
    },
    input: {
        padding: '14px',
        borderRadius: '12px',
        border: '1px solid #d2d2d7',
        fontSize: '1rem',
        outline: 'none',
        background: '#fbfbfd'
    },
    select: {
        padding: '14px',
        borderRadius: '12px',
        border: '1px solid #d2d2d7',
        fontSize: '1rem',
        outline: 'none',
        background: '#fbfbfd',
        appearance: 'none'
    },
    textarea: {
        padding: '14px',
        borderRadius: '12px',
        border: '1px solid #d2d2d7',
        fontSize: '1rem',
        outline: 'none',
        background: '#fbfbfd',
        resize: 'vertical'
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '10px',
        marginTop: '10px'
    },
    previewContainer: {
        position: 'relative',
        width: '80px',
        height: '80px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
    },
    previewImage: {
        width: '100%',
        height: '100%',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    },
    removeBtn: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.6)',
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0
    },
    modalActions: {
        padding: '20px 40px',
        borderTop: '1px solid #f5f5f7',
        background: 'white',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        position: 'sticky',
        bottom: 0
    },
    cancelBtn: {
        padding: '12px 24px',
        borderRadius: '100px',
        border: 'none',
        background: '#f5f5f7',
        color: '#1d1d1f',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export default AdminDashboard;

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wifi, Monitor, Wind, Users, Check, Calendar, Plane, Umbrella, ShoppingCart, Utensils, Stethoscope, Car, Armchair, UtensilsCrossed, Waves, Shirt, Tv, X, ChevronRight, Star } from 'lucide-react';
import villaImg from '../assets/luxury-villa.png';
import PropertyHeader from './PropertyHeader';
import AvailabilityCalendar from './AvailabilityCalendar';
import PhotoGalleryModal from './PhotoGalleryModal';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { getBackendUrl, getImageUrl as getFullImageUrl } from '../utils/urlHelper';
import LoadingSpinner from './ui/LoadingSpinner';

const VillaDetailPage = () => {
  const { t, i18n } = useTranslation();

  const allAmenities = [
    { icon: <Wifi size={20} />, label: t('filters.amenity_wifi') }, // Using filters keys for common ones
    { icon: <Monitor size={20} />, label: t('filters.amenity_ac') }, // Placeholder mapping if needed, or creating new keys
    { icon: <Wind size={20} />, label: t('filters.amenity_ac') },
    { icon: <Car size={20} />, label: 'Ücretsiz Otopark' }, // Missing key, maybe add to tr.json later or leave hardcoded if trivial
    { icon: <Waves size={20} />, label: t('filters.amenity_pool') },
    { icon: <Utensils size={20} />, label: 'Mutfak' },
    { icon: <Tv size={20} />, label: 'TV' },
    { icon: <Shirt size={20} />, label: 'Çamaşır Makinesi' },
    { icon: <Armchair size={20} />, label: 'Dış Mekan Mobilyaları' },
    { icon: <UtensilsCrossed size={20} />, label: 'Barbekü Izgara' },
  ];
  const { id } = useParams();
  const navigate = useNavigate();
  const [villa, setVilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [similarVillas, setSimilarVillas] = useState([]);

  // Leaflet Icon Fix
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Booking State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [isBooked, setIsBooked] = useState(false);
  const [extras, setExtras] = useState({
    vipTransfer: false,
    privateChef: false
  });

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  const mapContent = React.useMemo(() => {
    if (!villa || !villa.latitude || !villa.longitude) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f5f5f7', color: '#86868b' }}>
          {t('details.map_error')}
        </div>
      );
    }

    return (
      <MapContainer
        center={[villa.latitude, villa.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={[villa.latitude, villa.longitude]} />
      </MapContainer>
    );
  }, [villa?.latitude, villa?.longitude, t]);


  useEffect(() => {
    const getImageUrl = (path) => {
      if (!path) return villaImg;
      return getFullImageUrl(path);
    };

    const fetchVilla = async () => {
      try {
        const response = await fetch(`${getBackendUrl()}/properties/${id}`);
        if (!response.ok) throw new Error('Villa bilgileri yüklenemedi');
        const data = await response.json();

        const getDatesInRange = (startDate, endDate) => {
          const date = new Date(startDate);
          const end = new Date(endDate);
          const dates = [];
          while (date <= end) {
            dates.push(date.toISOString().split('T')[0]);
            date.setDate(date.getDate() + 1);
          }
          return dates;
        };

        let allBookedDates = [];
        if (data.bookings) {
          data.bookings.forEach(booking => {
            const dates = getDatesInRange(booking.startDate, booking.endDate);
            allBookedDates = [...allBookedDates, ...dates];
          });
        }

        // Transform API data to match component structure
        const transformedData = {
          ...data,
          bookedDates: allBookedDates,
          amenities: allAmenities.slice(0, 6), // Should ideally come from API, fallback to mock amenities for now
          // Map API images array to array of URL strings
          gallery: data.images && data.images.length > 0
            ? data.images.map(img => getImageUrl(img.url))
            : [villaImg, villaImg, villaImg, villaImg, villaImg], // Fallback if no images
          // Ensure numeric values
          rating: 5.0, // Mock rating as it's not in DB yet
          reviews: 0,
          guests: 8, // Fixed capacity for now or add to DB
          bedrooms: 4,
          bathrooms: 5,
        };

        setVilla(transformedData);
      } catch (err) {
        console.error(err);
        setError('Villa detayları şu anda görüntülenemiyor.');
      } finally {
        setLoading(false);
      }
    };

    const fetchSimilarVillas = async () => {
      try {
        const response = await fetch(`${getBackendUrl()}/properties`);
        if (!response.ok) return;
        const data = await response.json();
        // Filter out current villa AND ensure type is VILLA
        const otherVillas = data.filter(p => String(p.id) !== String(id) && p.type === 'VILLA');
        setSimilarVillas(otherVillas);
      } catch (err) {
        console.error("Error fetching similar villas:", err);
      }
    };

    fetchVilla();
    fetchSimilarVillas();
  }, [id]);

  if (isBooked) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h1 className="title-md" style={{ marginBottom: '20px' }}>{t('booking.success_title')}</h1>
        <p className="text-secondary" style={{ fontSize: '1.5rem', maxWidth: '600px' }}>
          {t('booking.success_message')}
        </p>
        <a href="/" style={{ marginTop: '40px', textDecoration: 'none', color: 'white', background: 'black', padding: '15px 30px', borderRadius: '100px' }}>
          {t('booking.back_home')}
        </a>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>{error}</div>;
  if (!villa) return <LoadingSpinner />;

  // Calculation Logic
  const calculateTotal = () => {
    if (!checkIn || !checkOut) return null;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights <= 0) return null;

    const basePrice = nights * villa.dailyPrice; // Changed from villa.price to villa.dailyPrice
    let extrasPrice = 0;

    if (extras.vipTransfer) extrasPrice += 4500;
    if (extras.privateChef) extrasPrice += (9000 * nights);

    return {
      nights,
      basePrice, // This now reflects dailyPrice * nights
      extrasPrice,
      total: basePrice + extrasPrice
    };
  };

  const totals = calculateTotal();

  /* Open Calendar Modal for Date Selection */
  const handleDateClick = () => {
    setIsCalendarOpen(true);
  };



  return (
    <div className="villa-detail-page">
      {villa && (
        <Helmet>
          <title>{villa.name} - Senay Villa & Yacht</title>
          <meta name="description" content={`Bodrum'da lüks tatil: ${villa.name}. ${villa.location} konumunda, ${villa.guests} kişilik kapasite, özel havuz ve ayrıcalıklı olanaklar.`} />
        </Helmet>
      )}
      {/* Header Spacer for Fixed Header */}
      <div style={{ height: 160 }} />

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <PhotoGalleryModal
          images={villa.gallery}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      <div className="container" style={{ paddingTop: 0, paddingBottom: 80 }}>
        {/* Title Section */}
        <PropertyHeader
          title={villa.name}
          location={villa.location}
          city="Muğla" // Dynamic if available, static for now as per req
          rating={villa.rating}
          reviewCount={villa.reviews}
          type="VILLA"
          onSave={() => { }} // Hook up if logic exists
        />

        {/* Gallery */}
        <div className="gallery-section">
          <div className="gallery-grid">
            {villa.gallery.slice(0, 5).map((img, idx) => (
              <div
                key={idx}
                className={`gallery-item item-${idx}`}
                style={{ backgroundImage: `url(${img})` }}
                onClick={() => setIsGalleryOpen(true)}
              >
                {idx === 4 && (
                  <button className="show-all-photos-btn" onClick={(e) => { e.stopPropagation(); setIsGalleryOpen(true); }}>
                    {t('details.show_all_photos')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="content-grid">
          {/* Main Content */}
          <div className="main-info">
            <div className="info-bar">
              <span>{villa.guests} {t('details.guest')}</span> • <span>{villa.bedrooms} {t('details.bedroom')}</span> • <span>{villa.bathrooms} {t('details.bathroom')}</span>
            </div>

            <div className="divider"></div>

            <div className="description-section">
              <h3>{t('details.about_title')}</h3>
              <p className="text-secondary">{villa.description}</p>
            </div>

            <div className="divider"></div>

            <div className="amenities-section">
              <h3>{t('details.amenities_title')}</h3>
              <div className="amenities-grid">
                {villa.amenities.map((item, idx) => (
                  <div key={idx} className="amenity-item">
                    {item.icon} <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <button className="btn-secondary" style={{ marginTop: 24, width: '100%' }} onClick={() => setShowAllAmenities(true)}>
                {t('details.show_all_amenities', { count: allAmenities.length })}
              </button>
            </div>

            <div className="divider"></div>

            {/* Availability Calendar Modal */}
            {isCalendarOpen && (
              <div className="modal-overlay" onClick={() => setIsCalendarOpen(false)}>
                <div className="modal-content calendar-modal" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setIsCalendarOpen(false)}>
                    <X size={24} />
                  </button>
                  <AvailabilityCalendar
                    basePrice={villa.dailyPrice}
                    bookedDates={villa.bookedDates || []}
                    onClose={() => setIsCalendarOpen(false)}
                    onApply={(range) => {
                      if (range.start) setCheckIn(range.start.toISOString().split('T')[0]);
                      if (range.end) setCheckOut(range.end.toISOString().split('T')[0]);
                      setIsCalendarOpen(false);
                    }}
                  />
                </div>
              </div>
            )}

            <div className="divider"></div>

            <div className="location-section">
              <h3>{t('details.location_title')}</h3>
              <div className="location-grid">
                <div className="map-container" style={{ position: 'relative', zIndex: 0 }}>
                  {mapContent}
                </div>

                <div className="distances-list">
                  <div className="distance-item">
                    <div className="dist-icon"><Plane size={20} /></div>
                    <div className="dist-info">
                      <span className="dist-label">{t('details.dist_airport')}</span>
                      <span className="dist-value">45 km</span>
                    </div>
                  </div>
                  <div className="distance-item">
                    <div className="dist-icon"><Umbrella size={20} /></div>
                    <div className="dist-info">
                      <span className="dist-label">{t('details.dist_beach')}</span>
                      <span className="dist-value">1 km</span>
                    </div>
                  </div>
                  <div className="distance-item">
                    <div className="dist-icon"><ShoppingCart size={20} /></div>
                    <div className="dist-info">
                      <span className="dist-label">{t('details.dist_market')}</span>
                      <span className="dist-value">500 m</span>
                    </div>
                  </div>
                  <div className="distance-item">
                    <div className="dist-icon"><Utensils size={20} /></div>
                    <div className="dist-info">
                      <span className="dist-label">{t('details.dist_restaurant')}</span>
                      <span className="dist-value">800 m</span>
                    </div>
                  </div>
                  <div className="distance-item">
                    <div className="dist-icon"><Stethoscope size={20} /></div>
                    <div className="dist-info">
                      <span className="dist-label">{t('details.dist_hospital')}</span>
                      <span className="dist-value">12 km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="sidebar-wrapper">
            <div className="booking-card card">
              <div className="booking-header">
                <span className="price">{villa.dailyPrice.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')} ₺</span> <span className="period">/ {t('booking.per_night')}</span>
              </div>

              <div className="booking-form">
                <div className="date-inputs">
                  <div className="input-group clickable" onClick={handleDateClick}>
                    <label>{t('booking.checkin')}</label>
                    <div className="date-display">{checkIn ? new Date(checkIn).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US') : t('booking.select_date')}</div>
                    <input
                      type="date"
                      className="hidden-date-input"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                    <Calendar size={16} className="input-icon" />
                  </div>
                  <div className="vertical-divider"></div>
                  <div className="input-group clickable" onClick={handleDateClick}>
                    <label>{t('booking.checkout')}</label>
                    <div className="date-display">{checkOut ? new Date(checkOut).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US') : t('booking.select_date')}</div>
                    <input
                      type="date"
                      className="hidden-date-input"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                    <Calendar size={16} className="input-icon" />
                  </div>
                </div>

                <div className="guests-input">
                  <label>{t('booking.guests_label')}</label>
                  <select
                    className="clean-input"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                  >
                    {[...Array(villa.guests || 4)].map((_, i) => (
                      <option key={i} value={i + 1}>{t('booking.guest_option', { count: i + 1 })}</option>
                    ))}
                  </select>
                </div>

                <div className="extras-checklist">
                  <h4>{t('booking.extras_title')}</h4>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={extras.vipTransfer}
                      onChange={(e) => setExtras({ ...extras, vipTransfer: e.target.checked })}
                    />
                    <span>{t('booking.extra_transfer')}</span>
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={extras.privateChef}
                      onChange={(e) => setExtras({ ...extras, privateChef: e.target.checked })}
                    />
                    <span>{t('booking.extra_chef')}</span>
                  </label>
                </div>

                {totals && (
                  <div className="price-breakdown">
                    <div className="breakdown-row">
                      <span>{villa.dailyPrice.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')} ₺ x {totals.nights} {t('booking.per_night')}</span>
                      <span>{totals.basePrice.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    {totals.extrasPrice > 0 && (
                      <div className="breakdown-row">
                        <span>{t('booking.breakdown_extras')}</span>
                        <span>{totals.extrasPrice.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    )}
                    <div className="breakdown-divider"></div>
                    <div className="breakdown-row total">
                      <span>{t('booking.total')}</span>
                      <span>{totals.total.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>
                )}

                {/* Customer Info Form */}
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ marginBottom: 10 }}>{t('booking.contact_info_title')}</h4>
                  <input type="text" placeholder={t('booking.placeholder_name')} style={{ width: '100%', padding: '10px', marginBottom: 10, borderRadius: 8, border: '1px solid #ddd' }} id="customerName" />
                  <input type="email" placeholder={t('booking.placeholder_email')} style={{ width: '100%', padding: '10px', marginBottom: 10, borderRadius: 8, border: '1px solid #ddd' }} id="customerEmail" />
                  <input type="tel" placeholder={t('booking.placeholder_phone')} style={{ width: '100%', padding: '10px', marginBottom: 10, borderRadius: 8, border: '1px solid #ddd' }} id="customerPhone" />
                </div>

                {error && (
                  <div style={{ background: '#ffe5e5', color: '#d32f2f', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginTop: '10px' }}>
                    {error}
                  </div>
                )}

                <button
                  className="btn-primary"
                  style={{ width: '100%', background: '#1d1d1f', color: 'white', marginTop: 10 }}
                  onClick={async () => {
                    const name = document.getElementById('customerName').value;
                    const email = document.getElementById('customerEmail').value;
                    const phone = document.getElementById('customerPhone').value;

                    if (!name || !email || !phone || !totals) {
                      setError(t('booking.error_missing_fields'));
                      setTimeout(() => setError(null), 5000);
                      return;
                    }

                    try {
                      // Note: extraServices logic can be added here if backend supports it
                      const payload = {
                        propertyId: villa.id,
                        startDate: checkIn,
                        endDate: checkOut,
                        customerName: name,
                        customerEmail: email,
                        customerPhone: phone,
                        guests: guests
                      };

                      const res = await fetch(`${getBackendUrl()}/bookings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                      });

                      if (res.ok) {
                        setIsBooked(true);
                        window.scrollTo(0, 0);
                      } else {
                        const err = await res.json();
                        setError(err.error || t('booking.error_generic'));
                        setTimeout(() => setError(null), 5000);
                      }
                    } catch (e) {
                      console.error(e);
                      setError(t('booking.error_connection'));
                      setTimeout(() => setError(null), 5000);
                    }
                  }}
                >
                  Rezervasyon Yap
                </button>

                <p className="micro-text text-secondary" style={{ textAlign: 'center', marginTop: 12 }}>
                  Henüz ücret alınmayacak
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings Section */}
        <div className="similar-section">
          <h2 className="title-md" style={{ marginBottom: 30 }}>{t('details.similar_villas')}</h2>
          <div className="similar-grid">
            {similarVillas.map(item => {
              // Ensure we have a valid image
              const itemImg = item.images && item.images.length > 0
                ? getFullImageUrl(item.images[0].url)
                : villaImg;

              return (
                <div
                  key={item.id}
                  className="card listing-card"
                  onClick={() => {
                    navigate(`/villa/${item.id}`);
                    window.scrollTo(0, 0);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-image" style={{ backgroundImage: `url(${itemImg})` }}>
                    <div className="listing-badge">
                      <Star size={14} fill="currentColor" /> {5.0}
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="card-meta">
                      {item.name}
                    </div>
                    <div className="card-sub text-secondary">
                      {item.location}
                    </div>
                    <div className="tags-row">
                      <span className="tag-badge">{item.type === 'VILLA' ? 'Villa' : item.type === 'YACHT' ? 'Yat' : item.type}</span>
                    </div>
                    <div className="card-price">
                      {item.dailyPrice?.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')} ₺ <span className="text-secondary" style={{ fontSize: '0.8em', fontWeight: 400 }}>/{t('listing.per_day')}</span>
                    </div>
                    <button className="btn-secondary small" style={{ marginTop: 12, width: '100%' }}>{t('listing.details_btn')}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Amenities Modal */}
      {showAllAmenities && (
        <div className="modal-overlay" onClick={() => setShowAllAmenities(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAllAmenities(false)}>
              <X size={24} />
            </button>
            <h2 className="title-md" style={{ marginBottom: 24 }}>{t('details.amenities_title')}</h2>
            <div className="modal-amenities-list">
              {allAmenities.map((item, idx) => (
                <div key={idx} className="modal-amenity-item">
                  {item.icon} <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .detail-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 40px;
          gap: 20px;
        }
        
        .header-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .location-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          font-size: 1.1rem;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f5f5f7;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        .icon-btn:hover { background: #e8e8ed; }

        .gallery-section {
          margin-bottom: 40px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 240px 240px;
          gap: 12px;
          height: 492px;
          border-radius: 20px;
          overflow: hidden;
        }

        .gallery-item {
          background-size: cover;
          background-position: center;
          cursor: pointer;
          position: relative;
          transition: filter 0.2s;
        }

        .gallery-item:hover {
          filter: brightness(0.9);
        }

        .item-0 {
          grid-column: 1 / 2;
          grid-row: 1 / 3;
        }

        .show-all-photos-btn {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: white;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }

        .show-all-photos-btn:hover {
          transform: scale(1.05);
        }

        /* Mobile Gallery - Horizontal Slider */
        @media (max-width: 768px) {
          .gallery-section {
             margin-left: -20px; /* Full width bleed */
             margin-right: -20px;
             margin-bottom: 24px;
          }

          .gallery-grid {
            display: flex;
            height: auto;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 12px;
            padding: 0 20px; /* Padding for start/end items */
            border-radius: 0;
            scrollbar-width: none; /* Firefox */
          }
          
          .gallery-grid::-webkit-scrollbar {
            display: none; /* Chrome/Safari */
          }

          .gallery-item {
            min-width: 85vw; /* Show mostly the current image, peek next */
            height: 300px;
            border-radius: 12px;
            scroll-snap-align: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          }
          
          .item-0 {
             /* Reset grid props for flex item */
             grid-column: auto;
             grid-row: auto;
          }

          /* Ensure all items are visible for the slider */
          .gallery-item:not(.item-0) {
            display: block;
          }
          
          .show-all-photos-btn {
             bottom: 12px;
             right: 12px;
             font-size: 0.8rem;
             padding: 6px 12px;
             background: rgba(255, 255, 255, 0.9);
             backdrop-filter: blur(4px);
          }
        }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 60px;
        }

        .info-bar {
          font-size: 1.1rem;
          font-weight: 500;
          display: flex;
          gap: 12px;
        }

        .divider {
          height: 1px;
          background: #e5e5e5;
          margin: 32px 0;
        }

        .description-section h3, .amenities-section h3 {
          font-size: 1.5rem;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .description-section p {
          font-size: 1.125rem;
          line-height: 1.7;
        }

        .amenities-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .amenity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.1rem;
        }

        .sidebar-wrapper {
          position: relative;
        }

        .booking-card {
          position: sticky;
          top: 100px;
          padding: 24px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
          border-radius: 12px;
          background: white;
        }

        .booking-header {
          margin-bottom: 24px;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .price {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .date-inputs {
          display: flex;
          border: 1px solid #b0b0b0;
          border-radius: 8px;
          overflow: hidden;
        }

        .input-group {
          padding: 10px;
          flex: 1;
          position: relative;
          cursor: pointer;
        }
        
        .input-group:hover {
            background: #f9f9f9;
        }

        .input-group label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 4px;
          pointer-events: none;
        }
        
        .date-display {
            font-size: 0.9rem;
            color: #333;
        }
        
        .hidden-date-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0; /* Hide default input but keep it clickable/focusable */
            cursor: pointer;
        }
        
        .input-icon {
            position: absolute;
            right: 10px;
            bottom: 10px;
            pointer-events: none;
            opacity: 0.5;
        }

        .guests-input {
          border: 1px solid #b0b0b0;
          border-radius: 8px;
          padding: 10px;
        }
        
        .guests-input label {
            display: block;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        .clean-input {
          width: 100%;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 0.9rem;
          background: transparent;
        }

        .vertical-divider {
          width: 1px;
          background: #b0b0b0;
        }

        .extras-checklist {
          margin: 10px 0;
        }
        
        .extras-checklist h4 {
            font-size: 0.9rem;
            margin-bottom: 8px;
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .price-breakdown {
            margin-top: 10px;
            font-size: 0.95rem;
        }
        
        .breakdown-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            color: #555;
        }
        
        .breakdown-divider {
            height: 1px;
            background: #e5e5e5;
            margin: 12px 0;
        }
        
        .breakdown-row.total {
            font-weight: 700;
            color: #000;
            font-size: 1.1rem;
        }
        
        .map-placeholder {
            /* Legacy placeholder style removal or keep for safety */
            display: none;
        }

        .location-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          margin-top: 20px;
        }

        .map-container {
          position: relative;
          height: 300px;
          border-radius: 16px;
          overflow: hidden;
          background: #f0f0f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .map-overlay-btn {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          color: #1d1d1f;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          text-decoration: none;
          transition: transform 0.2s;
        }
        
        .map-overlay-btn:hover {
          transform: translateX(-50%) scale(1.05);
        }

        .distances-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: center;
        }

        .distance-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 12px;
          transition: background 0.2s;
        }
        
        .distance-item:hover {
          background: #f0f0f0;
        }

        .dist-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1d1d1f;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .dist-info {
          display: flex;
          flex-direction: column;
        }

        .dist-label {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        .dist-value {
          font-size: 1rem;
          font-weight: 700;
          color: #1d1d1f;
        }

        @media (max-width: 900px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          .main-image {
            height: 400px;
          }
          .location-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
            padding: 20px;
        }

        @media (max-width: 768px) {
            .modal-overlay {
                padding: 0;
                align-items: flex-end; /* Bottom sheet feeling on mobile */
            }
        }

        
        .modal-content {
            background: white;
            width: 100%;
            max-width: 800px;
            max-height: 85vh;
            border-radius: 20px;
            padding: 40px;
            position: relative;
            overflow-y: auto;
            animation: slideUp 0.3s ease-out;
        }

        @media (max-width: 768px) {
             .modal-content {
                 max-height: 90vh;
                 border-bottom-left-radius: 0;
                 border-bottom-right-radius: 0;
                 padding: 24px 16px; /* Reduced padding */
             }
        }


        .calendar-modal {
            max-width: 950px;
        }
        
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-close {
            position: absolute;
            top: 24px;
            left: 24px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: background 0.2s;
            z-index: 100; /* Ensure clickable */
        }
        .modal-close:hover { background: #f5f5f7; }

        @media(max-width: 768px) {
            .modal-close {
                top: 16px;
                left: 16px;
            }
        }

        
        .modal-amenities-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 24px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .modal-amenity-item {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 1.1rem;
            padding: 8px 0;
        }
        
        /* Similar Listings Section */
        .similar-section {
            padding-top: 80px;
            border-top: 1px solid #e5e5e5;
            margin-top: 80px;
        }

        .similar-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 30px;
        }

        .listing-card {
            border: 1px solid #e0e0e0;
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            background: white;
        }

        .listing-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        .card-image {
            height: 240px;
            background-size: cover;
            background-position: center;
            position: relative;
        }

        .listing-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(255, 255, 255, 0.95);
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .card-details {
            padding: 20px;
        }

        .card-meta {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 4px;
            color: #1d1d1f;
        }

        .card-sub {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 12px;
        }

        .tags-row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 16px;
        }

        .tag-badge {
            background: #f5f5f7;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            color: #424245;
            font-weight: 500;
        }

        .card-price {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1d1d1f;
            display: flex;
            align-items: baseline;
            gap: 4px;
        }

        .btn-secondary {
            background: white;
            border: 1px solid #d2d2d7; 
            color: #1d1d1f;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-secondary:hover {
            background: #f5f5f7;
            border-color: #86868b;
        }

        .btn-secondary.small {
            padding: 10px 16px;
            font-size: 0.9rem;
            border-color: #e5e5e5;
        }
        
        .btn-secondary.small:hover {
            border-color: #1d1d1f;
            background: white;
        }
      `}</style>
    </div>
  );
};

export default VillaDetailPage;

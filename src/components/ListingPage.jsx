import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, MapPin, Users, Star, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import tr from 'date-fns/locale/tr';
import en from 'date-fns/locale/en-US';
import PremiumServices from './PremiumServices';

registerLocale('tr', tr);
registerLocale('en', en);

const ListingPage = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const typeKey = location.pathname.includes('villas') ? 'villas' : 'yachts';
    const typeLabel = typeKey === 'villas' ? t('filters.title_villas') : t('filters.title_yachts');

    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterLocation, setFilterLocation] = useState('');
    const [filterGuests, setFilterGuests] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Advanced Filters
    const [sortOrder, setSortOrder] = useState('none'); // 'asc', 'desc'
    const [amenityFilters, setAmenityFilters] = useState([]);

    const amenitiesList = [
        { id: 'havuz', label: t('filters.amenity_pool') },
        { id: 'klima', label: t('filters.amenity_ac') },
        { id: 'wifi', label: t('filters.amenity_wifi') }
    ];

    const linkBase = typeKey === 'villas' ? '/villa' : '/yacht';

    // Guest Counter Logic
    const handleGuestChange = (increment) => {
        const currentVal = parseInt(filterGuests) || 1;
        const newVal = increment ? currentVal + 1 : currentVal - 1;
        if (newVal < 1) return;
        setFilterGuests(newVal.toString());
    };

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const targetType = typeKey === 'villas' ? 'VILLA' : 'YACHT';

            // Build Query Params
            const params = new URLSearchParams();
            params.append('type', targetType);
            if (filterLocation) params.append('location', filterLocation);
            if (filterGuests) params.append('guests', filterGuests);
            if (startDate) params.append('startDate', startDate.toLocaleDateString('en-CA'));
            if (endDate) params.append('endDate', endDate.toLocaleDateString('en-CA'));

            const response = await fetch(`http://localhost:5001/api/properties?${params.toString()}`);
            if (!response.ok) throw new Error('Veriler yüklenirken hata oluştu');
            const data = await response.json();

            setProperties(data);
            setFilteredProperties(data); // Initial set
        } catch (err) {
            console.error(err);
            setError(t('listing.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [typeKey]);

    useEffect(() => {
        let result = [...properties];

        // 1. Amenity Filter
        if (amenityFilters.length > 0) {
            result = result.filter(item => {
                // Assuming amenities is stored as JSON string or string in DB matching lowercase for now
                // Actually in schema it's String default "[]".
                // Let's assume description or amenities string contains the word for now as placeholder
                // Or better, check if item.amenities contains the label (case insensitive)
                const itemAmenities = item.amenities ? item.amenities.toLowerCase() : "";
                const itemDesc = item.description ? item.description.toLowerCase() : "";
                return amenityFilters.every(filter => (itemAmenities.includes(filter) || itemDesc.includes(filter)));
            });
        }

        // 2. Sort
        if (sortOrder === 'asc') {
            result.sort((a, b) => a.dailyPrice - b.dailyPrice);
        } else if (sortOrder === 'desc') {
            result.sort((a, b) => b.dailyPrice - a.dailyPrice);
        }

        setFilteredProperties(result);
    }, [properties, sortOrder, amenityFilters]);


    const handleSearch = () => {
        fetchProperties();
    };

    const handleAmenityChange = (amenityId) => {
        if (amenityFilters.includes(amenityId)) {
            setAmenityFilters(amenityFilters.filter(id => id !== amenityId));
        } else {
            setAmenityFilters([...amenityFilters, amenityId]);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://placehold.co/600x400?text=No+Image';
        return path.startsWith('http') ? path : 'http://localhost:5001' + path;
    };

    return (
        <div className="listing-page">
            <div style={{ height: 160 }} />

            <div className="container section-padding" style={{ paddingTop: 0 }}>
                <h1 className="title-md" style={{ marginBottom: 40, textTransform: 'capitalize', textAlign: 'center' }}>
                    {typeLabel}
                </h1>


                {loading && <div style={{ textAlign: 'center', padding: 40 }}>{t('listing.loading')}</div>}
                {error && <div style={{ textAlign: 'center', padding: 40, color: 'red' }}>{error}</div>}


                {/* Filters */}
                <div className="filter-bar" style={{ margin: '0 auto 20px', flexWrap: 'wrap', gap: 10, borderRadius: 24 }}>
                    <div className="filter-item">
                        <MapPin size={18} className="text-secondary" />
                        <input
                            type="text"
                            placeholder={t('filters.location')}
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                        />
                    </div>
                    <div className="filter-divider"></div>

                    <div className="filter-item">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText={t('filters.checkin')}
                            className="date-input"
                            locale={i18n.language}
                        />
                    </div>
                    <div className="filter-divider"></div>
                    <div className="filter-item">
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText={t('filters.checkout')}
                            className="date-input"
                            locale={i18n.language}
                        />
                    </div>

                    <div className="filter-divider"></div>

                    <div className="filter-item">
                        <Users size={18} className="text-secondary" />
                        <div className="guest-counter">
                            <button
                                className="counter-btn"
                                onClick={() => handleGuestChange(false)}
                                disabled={!filterGuests || parseInt(filterGuests) <= 1}
                            >
                                <Minus size={14} />
                            </button>
                            <span className="guest-value">{filterGuests || '1'}</span>
                            <button
                                className="counter-btn"
                                onClick={() => handleGuestChange(true)}
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="filter-divider"></div>

                    <button className="search-btn" onClick={handleSearch}>
                        {t('filters.search')}
                    </button>
                </div>

                {/* Advanced Filters Row */}
                <div className="advanced-filters">
                    <div className="sort-group">
                        <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="none">{t('filters.sort_label')}: {t('filters.sort_recommended')}</option>
                            <option value="asc">{t('filters.sort_price_asc')}</option>
                            <option value="desc">{t('filters.sort_price_desc')}</option>
                        </select>
                    </div>

                    <div className="amenity-filters">
                        {amenitiesList.map(a => (
                            <label key={a.id} className={`amenity-chip ${amenityFilters.includes(a.id) ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={amenityFilters.includes(a.id)}
                                    onChange={() => handleAmenityChange(a.id)}
                                    style={{ display: 'none' }}
                                />
                                {a.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {!loading && !error && (
                    <div className="listings-grid" style={{ marginTop: 40 }}>
                        {filteredProperties.map(item => (
                            <Link to={`${linkBase}/${item.id}`} key={item.id} style={{ display: 'block' }}>
                                <div className="card listing-card">
                                    <div className="card-image" style={{ backgroundImage: `url(${item.images && item.images.length > 0 ? getImageUrl(item.images[0].url) : 'https://placehold.co/600x400?text=No+Image'})` }}>
                                        <div className="listing-badge">
                                            <Star size={14} fill="currentColor" /> 5.0
                                        </div>
                                    </div>
                                    <div className="card-details">
                                        <div className="card-meta">
                                            {item.name}
                                        </div>
                                        <div className="card-sub text-secondary">
                                            {item.location}
                                        </div>

                                        <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: '0.9rem', color: '#555' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Users size={16} /> {item.capacity || 0} {t('listing.person')}
                                            </div>
                                            {item.type === 'YACHT' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span>⚓</span> {item.cabins || 0} {t('listing.cabin')}
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-price">
                                            {item.dailyPrice.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')} ₺/{t('listing.per_day')}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <PremiumServices type={typeKey === 'villas' ? 'VILLA' : 'YACHT'} />
            </div>

            <style>{`

        .filter-bar {
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 20px;
            padding: 10px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            max-width: 800px;
            margin: 0 auto 60px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            z-index: 100;
        }

        .filter-bar:hover {
            transform: translateY(-2px);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
        }

        .filter-item {
            display: flex;
            align-items: center;
            padding: 0 20px;
            gap: 12px;
            flex: 1;
            position: relative;
        }

        .filter-item input {
            border: none;
            outline: none;
            font-size: 15px;
            font-weight: 500;
            width: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1d1d1f;
            background: transparent;
        }

        .filter-item input::placeholder {
            color: #86868b;
        }

        .filter-divider {
            width: 1px;
            height: 32px;
            background: rgba(0, 0, 0, 0.1);
        }

        .search-btn {
            background: #000000;
            color: white;
            padding: 16px 32px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 15px;
            border: none;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .search-btn:hover {
            transform: scale(1.02);
            background: #333;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .listings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 40px;
        }

        .listing-card {
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 24px;
            background: white;
            overflow: hidden;
            border: 1px solid rgba(0,0,0,0.04);
        }

        .listing-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .card-image {
            height: 300px;
            background-size: cover;
            background-position: center;
            position: relative;
        }

        .listing-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            padding: 8px 14px;
            border-radius: 100px;
            font-weight: 600;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .card-details {
            padding: 24px;
        }

        .card-meta {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 6px;
            letter-spacing: -0.01em;
        }

        .card-sub {
            font-size: 1rem;
            margin-bottom: 16px;
            color: #86868b;
        }

        .card-price {
            font-weight: 600;
            font-size: 1.2rem;
            color: #1d1d1f;
        }

        /* DatePicker Overrides */
        .react-datepicker-wrapper {
            width: 100%;
        }
        .react-datepicker__input-container input {
            width: 100%;
            border: none;
            background: transparent;
            font-size: 15px;
            font-weight: 500;
            color: #1d1d1f;
            outline: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .react-datepicker__input-container input::placeholder {
            color: #86868b;
        }

        /* Calendar Container */
        .react-datepicker {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            border: none !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
            padding: 16px !important;
            background-color: rgba(255, 255, 255, 0.98) !important;
            backdrop-filter: blur(20px);
        }

        /* Header */
        .react-datepicker__header {
            background-color: transparent !important;
            border-bottom: none !important;
            padding-top: 8px !important;
        }

        .react-datepicker__current-month {
            font-weight: 600 !important;
            font-size: 1rem !important;
            margin-bottom: 12px !important;
        }

        .react-datepicker__day-name {
            color: #86868b !important;
            font-weight: 500 !important;
            width: 2rem !important;
        }

        /* Days */
        .react-datepicker__day {
            width: 2rem !important;
            line-height: 2rem !important;
            border-radius: 50% !important;
            margin: 0.166rem !important;
            font-weight: 500 !important;
        }

        .react-datepicker__day:hover {
            background-color: #f5f5f7 !important;
            color: #000 !important;
        }

        .react-datepicker__day--selected, 
        .react-datepicker__day--keyboard-selected {
            background-color: #000 !important;
            color: #fff !important;
        }

        .react-datepicker__day--today {
            font-weight: 700 !important;
            color: #000 !important;
            background-color: transparent !important;
            border: 1px solid #e5e5e5;
        }
        .react-datepicker__day--today.react-datepicker__day--selected {
            background-color: #000 !important;
            border: none;
        }

        .react-datepicker__triangle {
            display: none !important;
        }

        .react-datepicker__navigation-icon::before {
            border-color: #1d1d1f !important;
            border-width: 2px 2px 0 0 !important;
        }

        .react-datepicker-popper {
            z-index: 9999 !important;
        }

        /* Guest Counter */
        .guest-counter {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .counter-btn {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 1px solid #e5e5e5;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #1d1d1f;
            transition: all 0.2s;
        }

        .counter-btn:hover:not(:disabled) {
            border-color: #000;
            background: #f5f5f7;
        }

        .counter-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            border-color: #f5f5f7;
        }

        .guest-value {
            font-weight: 600;
            font-size: 15px;
            min-width: 20px;
            text-align: center;
            font-variant-numeric: tabular-nums;
        }

        .advanced-filters {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 800px;
            margin: 0 auto;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }

        .sort-select {
            padding: 10px 16px;
            border-radius: 12px;
            border: 1px solid #ddd;
            background: white;
            font-family: inherit;
            font-weight: 500;
            cursor: pointer;
        }

        .amenity-filters {
            display: flex;
            gap: 10px;
        }

        .amenity-chip {
            padding: 8px 16px;
            border-radius: 20px;
            border: 1px solid #ddd;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
            user-select: none;
        }

        .amenity-chip.active {
            background: #000;
            color: white;
            border-color: #000;
        }
      `}</style>
        </div >
    );
};

export default ListingPage;

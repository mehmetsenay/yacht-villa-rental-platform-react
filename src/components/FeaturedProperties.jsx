import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBackendUrl, getImageUrl as getFullImageUrl } from '../utils/urlHelper';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Users, ArrowRight } from 'lucide-react';

const FeaturedProperties = () => {
    const { t, i18n } = useTranslation();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                // Fetch all properties - in a real app create a specific endpoint for featured
                const response = await fetch(`${getBackendUrl()}/api/properties`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();

                // Take first 3 for now
                setProperties(data.slice(0, 3));
            } catch (err) {
                console.error("Error loading featured properties:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const getImageUrl = (path) => {
        if (!path) return 'https://placehold.co/600x400?text=No+Image';
        return getFullImageUrl(path);
    };

    if (loading || error || properties.length === 0) return null;

    return (
        <section className="section-padding" style={{ background: '#fff' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 40 }}>
                    <div>
                        <h2 className="title-md">{t('featured.title', 'Featured Collections')}</h2>
                        <p className="text-secondary" style={{ marginTop: 8, fontSize: '1.1rem' }}>
                            {t('featured.subtitle', 'Explore our most exclusive villas and yachts')}
                        </p>
                    </div>
                    <Link to="/villas" className="view-all-link">
                        {t('featured.view_all', 'View All')} <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="featured-grid">
                    {properties.map(item => (
                        <Link to={`/${item.type === 'VILLA' ? 'villa' : 'yacht'}/${item.id}`} key={item.id} className="featured-card-link">
                            <div className="card featured-card">
                                <div className="card-image" style={{ backgroundImage: `url(${item.images && item.images.length > 0 ? getImageUrl(item.images[0].url) : 'https://placehold.co/600x400'})` }}>
                                    <div className="listing-badge">
                                        <Star size={14} fill="currentColor" /> 5.0
                                    </div>

                                </div>
                                <div className="card-details">
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                            <h3 className="card-title">{item.name}</h3>
                                            <div className="rating-badge">
                                                <Star size={14} fill="#FFD700" color="#FFD700" /> 5.0
                                            </div>
                                        </div>
                                        <div className="card-location text-secondary">
                                            <MapPin size={14} style={{ minWidth: 14 }} />
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.location}</span>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <div className="card-features">
                                            <div className="feature-item">
                                                <Users size={16} /> {item.capacity} {t('details.guest')}
                                            </div>
                                            {item.type === 'YACHT' && (
                                                <div className="feature-item">
                                                    <span>⚓</span> {item.cabins} {t('details.cabin')}
                                                </div>
                                            )}
                                        </div>

                                        <div className="price-tag">
                                            {item.dailyPrice.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')} ₺
                                            <span className="price-period">/{t('listing.per_day')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style>{`
                .view-all-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: #0071e3;
                    transition: gap 0.2s ease;
                }
                .view-all-link:hover {
                    gap: 12px;
                    text-decoration: underline;
                }

                .featured-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 32px;
                }

                .featured-card-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }

                .featured-card {
                    height: 100%;
                    background: #fff;
                    border: 1px solid rgba(0,0,0,0.04);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .featured-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 16px 32px rgba(0,0,0,0.08);
                }

                .card-image {
                    height: 260px;
                    width: 100%;
                    background-size: cover;
                    background-position: center;
                    position: relative;
                }
                
                .listing-badge {
                    display: none; /* Moved to title line for cleaner look */
                }

                .card-details {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: calc(100% - 260px);
                }

                .card-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin: 0;
                    color: #1d1d1f;
                    line-height: 1.3;
                    flex: 1;
                    padding-right: 8px;
                }
                
                .rating-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #1d1d1f;
                }

                .card-location {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.9rem;
                    color: #86868b;
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    border-top: 1px solid #f5f5f7;
                    padding-top: 16px;
                    margin-top: auto;
                }

                .card-features {
                    display: flex;
                    gap: 16px;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.9rem;
                    color: #424245;
                    font-weight: 500;
                }

                .price-tag {
                    font-weight: 700;
                    font-size: 1.15rem;
                    color: #1d1d1f;
                    text-align: right;
                }
                
                .price-period {
                   font-size: 0.8em;
                   font-weight: 400;
                   color: #86868b;
                   margin-left: 2px;
                }
                
                .property-type-badge {
                   /* Removed as per previous request */
                }

                @media (max-width: 1024px) {
                    .featured-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .featured-card-link:nth-child(3) {
                        display: none; 
                    }
                }

                @media (max-width: 768px) {
                    .featured-grid {
                        grid-template-columns: 1fr;
                    }
                    .featured-card-link:nth-child(3) {
                        display: block;
                    }
                }
            `}</style>
        </section>
    );
};

export default FeaturedProperties;

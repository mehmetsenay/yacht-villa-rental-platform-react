import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
    const { t } = useTranslation();

    const testimonials = [
        {
            id: 1,
            name: "Sarah Jenkins",
            role: "Villa Guest",
            text: "The villa was absolutely stunning. Every detail was perfect, from the infinity pool to the private chef service. Highly recommended!",
            rating: 5,
            image: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "Yacht Charter",
            text: "An unforgettable experience on the Mediterranean. The crew was professional and the yacht was in pristine condition.",
            rating: 5,
            image: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            id: 3,
            name: "Elena Rodriguez",
            role: "Villa Guest",
            text: "Service beyond expectations. The concierge team handled everything for us. We will definitely be back next summer.",
            rating: 5,
            image: "https://randomuser.me/api/portraits/women/68.jpg"
        }
    ];

    return (
        <section className="section-padding" style={{ background: '#f5f5f7' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <h2 className="title-md">{t('testimonials.title', 'Client Experiences')}</h2>
                    <p className="text-secondary" style={{ marginTop: 16, fontSize: '1.1rem', maxWidth: 600, margin: '16px auto 0' }}>
                        {t('testimonials.subtitle', 'What our distinguished guests have to say about their stay with us.')}
                    </p>
                </div>

                <div className="testimonials-grid">
                    {testimonials.map(item => (
                        <div key={item.id} className="testimonial-card">
                            <Quote size={40} className="quote-icon" />
                            <p className="testimonial-text">"{item.text}"</p>

                            <div className="testimonial-meta">
                                <img src={item.image} alt={item.name} className="user-avatar" />
                                <div>
                                    <div className="user-name">{item.name}</div>
                                    <div className="user-role">{item.role}</div>
                                </div>
                                <div className="rating ml-auto">
                                    {[...Array(item.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .testimonials-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 30px;
                }

                .testimonial-card {
                    background: white;
                    padding: 40px;
                    border-radius: 24px;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    transition: transform 0.3s ease;
                }
                
                .testimonial-card:hover {
                    transform: translateY(-5px);
                }

                .quote-icon {
                    color: #e5e5e5;
                    margin-bottom: 24px;
                }

                .testimonial-text {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #1d1d1f;
                    margin-bottom: 32px;
                    font-style: italic;
                }

                .testimonial-meta {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .user-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .user-name {
                    font-weight: 600;
                    color: #1d1d1f;
                }

                .user-role {
                    font-size: 0.9rem;
                    color: #86868b;
                }

                .ml-auto {
                    margin-left: auto;
                    display: flex;
                }

                @media (max-width: 900px) {
                    .testimonials-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </section>
    );
};

export default Testimonials;

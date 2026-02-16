import React from 'react';
import { Car, ChefHat, GlassWater } from 'lucide-react';

const extras = [
    {
        icon: <Car size={32} />,
        title: "VIP Transfer",
        description: "Luxury transportation from airport to your door."
    },
    {
        icon: <ChefHat size={32} />,
        title: "Private Chef",
        description: "World-class culinary experiences in your private villa."
    },
    {
        icon: <GlassWater size={32} />,
        title: "Special Events",
        description: "Tailored organizations for weddings and parties."
    }
];

const ExtrasSection = () => {
    return (
        <div className="extras-section section-padding">
            <div className="container">
                <h2 className="title-md" style={{ marginBottom: 60, textAlign: 'center' }}>
                    Premium Services
                </h2>

                <div className="extras-grid">
                    {extras.map((item, index) => (
                        <div key={index} className="extra-card">
                            <div className="icon-wrapper">
                                {item.icon}
                            </div>
                            <h3>{item.title}</h3>
                            <p className="text-secondary">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .extras-section {
          background: #f9f9fb;
        }

        .extras-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
        }

        .extra-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .extra-card:hover {
          transform: translateY(-8px);
        }

        .icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f5f5f7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #1d1d1f;
        }

        .extra-card h3 {
          font-size: 1.5rem;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .extra-card p {
          font-size: 1.125rem;
          line-height: 1.6;
        }
      `}</style>
        </div>
    );
};

export default ExtrasSection;

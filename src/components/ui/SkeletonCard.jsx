import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="card listing-card" style={{ pointerEvents: 'none' }}>
            {/* Image Placeholder */}
            <div className="card-image skeleton-pulse" style={{ backgroundColor: '#e0e0e0', backgroundImage: 'none' }}></div>

            {/* Content Placeholder */}
            <div className="card-details">
                {/* Title */}
                <div className="skeleton-pulse" style={{ height: '24px', width: '70%', background: '#e0e0e0', marginBottom: '10px', borderRadius: '4px' }}></div>

                {/* Location */}
                <div className="skeleton-pulse" style={{ height: '16px', width: '40%', background: '#f0f0f0', marginBottom: '16px', borderRadius: '4px' }}></div>

                {/* Meta (Icons) */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div className="skeleton-pulse" style={{ height: '16px', width: '60px', background: '#f0f0f0', borderRadius: '4px' }}></div>
                    <div className="skeleton-pulse" style={{ height: '16px', width: '60px', background: '#f0f0f0', borderRadius: '4px' }}></div>
                </div>

                {/* Price */}
                <div className="skeleton-pulse" style={{ height: '20px', width: '30%', background: '#e0e0e0', borderRadius: '4px' }}></div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
                .skeleton-pulse {
                    animation: pulse 1.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default SkeletonCard;

import React from 'react';
import logo from '../../assets/logo.png';

const LoadingSpinner = ({ fullScreen = true }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: fullScreen ? '100vh' : '100%',
            width: '100%',
            background: 'transparent',
            position: 'relative'
        }}>
            {/* Pulsing Logo */}
            <div className="luxury-loader-logo">
                <img src={logo} alt="Loading..." />
            </div>

            {/* Spinning Gold Ring */}
            <div className="luxury-loader-ring"></div>

            <style>{`
                .luxury-loader-logo {
                    position: absolute;
                    z-index: 2;
                    animation: pulse-logo 2s ease-in-out infinite;
                }
                
                .luxury-loader-logo img {
                    height: 60px; /* Adjust based on logo aspect ratio */
                    width: auto;
                    display: block;
                }

                .luxury-loader-ring {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 2px solid rgba(191, 155, 48, 0.1); /* Gold with low opacity */
                    border-top-color: #bf9b30; /* Solid Gold */
                    animation: spin-slow 1.5s linear infinite;
                    z-index: 1;
                }

                @keyframes spin-slow {
                    to { transform: rotate(360deg); }
                }

                @keyframes pulse-logo {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;

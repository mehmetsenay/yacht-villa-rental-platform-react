import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const GlobalLogo = () => {
    return (
        <Link to="/" className="global-logo-container">
            <img src={logo} alt="Senay Villa Yat" className="global-logo-img" />
            <style>{`
        .global-logo-container {
          position: absolute;
          top: 30px;
          left: 40px;
          z-index: 1000;
          display: block;
          transition: transform 0.3s ease;
        }

        .global-logo-container:hover {
          transform: scale(1.05);
        }

        .global-logo-img {
          width: 180px; /* Significantly increased size */
          height: auto;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }

        @media (max-width: 768px) {
          .global-logo-container {
            top: 20px;
            left: 20px;
          }
          .global-logo-img {
            width: 120px;
          }
        }
      `}</style>
        </Link>
    );
};

export default GlobalLogo;

import NProgress from 'nprogress';
import '../utils/nprogress.css';
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
    const location = useLocation();

    useEffect(() => {
        NProgress.start();
        // Slight delay to let the bar show up even on fast transitions
        const timer = setTimeout(() => {
            NProgress.done();
        }, 300);

        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [location]);


    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 80px)' }}> {/* Ensure footer pushes down */}
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default React.memo(MainLayout);

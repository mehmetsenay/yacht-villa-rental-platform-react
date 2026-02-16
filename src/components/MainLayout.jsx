import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
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

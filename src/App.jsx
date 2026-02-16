import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LandingPage from './components/LandingPage';
import ListingPage from './components/ListingPage';
import VillaDetailPage from './components/VillaDetailPage';
import YachtDetailPage from './components/YachtDetailPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AboutPage from './pages/AboutPage';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes - Wrapped in MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/villas" element={<ListingPage />} />
            <Route path="/yachts" element={<ListingPage />} />
            <Route path="/villa/:id" element={<VillaDetailPage />} />
            <Route path="/yacht/:id" element={<YachtDetailPage />} />
            <Route path="/hakkimizda" element={<AboutPage />} />
          </Route>

          {/* Admin Routes - Standalone */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import Forbidden403Page from './pages/admin/Forbidden403Page';

function SessionGuard() {
  const location = useLocation();

  useEffect(() => {
    // If the admin comes out of the admin section, end the session immediately
    if (!location.pathname.startsWith('/admin')) {
      sessionStorage.removeItem('admin_token');
      localStorage.removeItem('admin_token');
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionGuard />
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <div className="flex-1">
          <Routes>
            {/* Public User Catalog (Module 1 & 2) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            {/* Admin Portal (Module 3, 4, 5) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/forbidden" element={<Forbidden403Page />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

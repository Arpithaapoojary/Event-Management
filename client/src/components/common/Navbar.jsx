import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [hasAdminToken, setHasAdminToken] = useState(false);

  useEffect(() => {
    // Check if an admin is logged in
    setHasAdminToken(Boolean(localStorage.getItem('admin_token')));
  }, [location]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-600 transition-colors">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              EventFlow
            </span>
            <span className="text-xs block text-slate-500 font-medium -mt-1">
              Events Platform
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              !isAdmin
                ? 'text-slate-900 bg-slate-100/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Explore Events
          </Link>

          {/* Admin link shown only if logged in or currently inside admin section */}
          {(isAdmin || hasAdminToken) && (
            <Link
              to="/admin"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isAdmin
                  ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [hasAdminToken, setHasAdminToken] = useState(false);

  useEffect(() => {
    // Check if an admin is logged in
    setHasAdminToken(Boolean(localStorage.getItem('admin_token')));
  }, [location]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#EDF5FB]/90 border-b border-sky-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Name - Pure Typography, Logo Icon Completely Removed */}
        <Link to="/" className="flex items-center group cursor-pointer">
          <span className="font-black text-2xl font-display tracking-tight text-slate-950 group-hover:text-black transition-colors">
            EventFlow
          </span>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all bg-slate-950 text-white hover:bg-black shadow-sm cursor-pointer active:scale-95"
          >
            Explore Events
          </Link>

          {/* Admin link shown only if logged in or currently inside admin section */}
          {(isAdmin || hasAdminToken) && (
            <Link
              to="/admin"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                isAdmin
                  ? 'text-slate-900 bg-white border border-slate-300 shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/80 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Parrophins
            </span>
            <span className="text-xs block text-slate-500 font-medium -mt-1">
              Events Portal
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-3">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              !isAdmin
                ? 'text-indigo-600 bg-indigo-50/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Explore Events
          </Link>

          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 border border-slate-200 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Admin Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  if (location.pathname === '/admin') return null;

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <span className="font-bold text-slate-900 text-sm">EventFlow</span>
          <p className="mt-1 text-slate-500">
            © {new Date().getFullYear()} Campus Event Operations & Student Pass Management.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold">
          <Link
            to="/"
            className="text-slate-600 hover:text-slate-950 transition-colors"
          >
            Explore Events
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-950 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Coordinator Portal</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

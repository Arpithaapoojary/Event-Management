import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white py-5 text-center text-[13px] text-slate-500 font-medium font-sans">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-center gap-1.5">
        <span>Campus Event Management 2026</span>
        <Link
          to="/admin/login"
          title="Coordinator Portal"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Coordinator Portal"
        >
          <Lock className="w-3 h-3 opacity-40 hover:opacity-100" />
        </Link>
      </div>
    </footer>
  );
}

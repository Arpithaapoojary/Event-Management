import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Menu,
  X,
  Compass,
  Music,
  Cpu,
  Trophy,
  Lock,
  ChevronRight,
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [hasAdminToken, setHasAdminToken] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if an admin is logged in
    setHasAdminToken(Boolean(localStorage.getItem('admin_token')));
    // Automatically close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // The enterprise admin console renders its own dedicated top bar
  if (location.pathname === '/admin') {
    return null;
  }

  const navigateToCategory = (arena) => {
    setMobileMenuOpen(false);
    // If not on homepage, navigate to homepage first with hash/state
    if (location.pathname !== '/') {
      window.location.href = `/#events-directory`;
      return;
    }
    const el = document.getElementById('events-directory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#EDF5FB]/95 border-b border-sky-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Name */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center group cursor-pointer"
        >
          <span className="font-black text-2xl font-display tracking-tight text-slate-950 group-hover:text-black transition-colors">
            EventFlow
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all"
          >
            Explore Events
          </Link>
          <button
            type="button"
            onClick={() => navigateToCategory('cultural')}
            className="px-3 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all cursor-pointer"
          >
            Cultural
          </button>
          <button
            type="button"
            onClick={() => navigateToCategory('technical')}
            className="px-3 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all cursor-pointer"
          >
            Technical
          </button>
          <button
            type="button"
            onClick={() => navigateToCategory('sports')}
            className="px-3 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all cursor-pointer"
          >
            Sports
          </button>
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {hasAdminToken ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-900 bg-white border border-slate-300 shadow-xs hover:bg-slate-50 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>Admin Console</span>
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white/80 border border-slate-200 transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Coordinator Access</span>
            </Link>
          )}

          <Link
            to="/"
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all bg-slate-950 text-white hover:bg-black shadow-sm cursor-pointer active:scale-95"
          >
            Book Passes
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-950 text-white hover:bg-black transition-all"
          >
            Explore
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl text-slate-800 hover:bg-white/80 border border-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[2]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[2]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-950/40 backdrop-blur-xs md:hidden animate-hero-fade-in">
          <div
            className="bg-white border-b border-slate-200 shadow-2xl p-5 max-h-[calc(100vh-4rem)] overflow-y-auto animate-hero-fade-up"
            role="menu"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
              Campus Navigation
            </div>

            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-slate-900 font-bold text-sm transition-colors"
                role="menuitem"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span>All Campus Events</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <button
                type="button"
                onClick={() => navigateToCategory('cultural')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-slate-900 font-bold text-sm transition-colors text-left cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Music className="w-4 h-4" />
                  </div>
                  <span>Cultural Arenas</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Dance · Music</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToCategory('technical')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-slate-900 font-bold text-sm transition-colors text-left cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span>Technical Arenas</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Hackathons</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToCategory('sports')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-slate-900 font-bold text-sm transition-colors text-left cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span>Sports Arenas</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Tournaments</span>
              </button>
            </div>

            <div className="border-t border-slate-100 my-4 pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Institutional Management
              </div>

              {hasAdminToken ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors"
                  role="menuitem"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Open Admin Console</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                  role="menuitem"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Coordinator Sign-In</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Compass,
  Music,
  Cpu,
  Trophy,
  ChevronRight,
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
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

  const scrollToEvents = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = '/#events-directory';
      return;
    }
    const el = document.getElementById('events-directory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Name (20-22px) */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center group cursor-pointer"
        >
          <span className="font-extrabold text-[21px] tracking-tight text-slate-950 font-display group-hover:text-black transition-colors">
            EventFlow
          </span>
        </Link>

        {/* Desktop Navigation Links (14px font-medium, 24px gap) */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={scrollToEvents}
            className="text-[14px] font-medium text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
          >
            All Events
          </button>
          <button
            type="button"
            onClick={() => navigateToCategory('cultural')}
            className="text-[14px] font-medium text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
          >
            Cultural
          </button>
          <button
            type="button"
            onClick={() => navigateToCategory('technical')}
            className="text-[14px] font-medium text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
          >
            Technical
          </button>
          <button
            type="button"
            onClick={() => navigateToCategory('sports')}
            className="text-[14px] font-medium text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
          >
            Sports
          </button>
        </nav>

        {/* Right Desktop Actions (Explore Events button) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={scrollToEvents}
            className="h-10 px-4 rounded-[8px] text-[14px] font-medium transition-colors bg-slate-950 text-white hover:bg-black shadow-xs cursor-pointer active:scale-98"
          >
            Explore Events
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={scrollToEvents}
            className="h-9 px-3 rounded-[8px] text-[13px] font-medium bg-slate-950 text-white hover:bg-black transition-colors cursor-pointer"
          >
            Explore Events
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="w-9 h-9 rounded-[8px] text-slate-800 hover:bg-white/80 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
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
              <button
                type="button"
                onClick={scrollToEvents}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-slate-900 font-bold text-sm transition-colors text-left cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span>Explore Events</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

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
          </div>
        </div>
      )}
    </header>
  );
}

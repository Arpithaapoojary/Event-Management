import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, ExternalLink } from 'lucide-react';

/**
 * Enterprise Admin Top Bar Header
 * - Simple top bar, logo left, nav right
 * - Subtle user menu: avatar initials + name + role
 * - Dropdown containing Sign Out & quick navigation
 * - No colorful badges, no green pills, no gradients
 */
export default function AdminHeader({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand & Admin Console Identifier */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-80"
            title="Go to Public Events Catalog"
          >
            <span className="font-semibold text-[16px] tracking-[-0.01em] text-[#111827]">
              EventFlow
            </span>
          </Link>
          <span className="text-[#D1D5DB] text-sm select-none">/</span>
          <span className="text-[13px] font-medium text-[#6B7280] select-none">
            Admin Console
          </span>
        </div>

        {/* Right: Quick actions & Subtle User Menu */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
          >
            <span>Live Catalog</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[1.5] text-[#9CA3AF]" />
          </Link>

          <div className="h-4 w-[1px] bg-[#E5E7EB] hidden sm:block" />

          {/* User Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2.5 p-1.5 rounded-[8px] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]"
            >
              {/* Avatar Initials */}
              <div className="w-7 h-7 rounded-[6px] bg-[#0F172A] text-white text-[11px] font-medium flex items-center justify-center shrink-0 tracking-wide select-none">
                EC
              </div>

              {/* Name & Role */}
              <div className="text-left hidden md:block">
                <div className="text-[13px] font-medium text-[#111827] leading-tight">
                  Coordinator
                </div>
                <div className="text-[11px] text-[#6B7280] leading-tight font-normal">
                  Administrator
                </div>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 stroke-[1.5] text-[#6B7280] transition-transform duration-150 ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-56 rounded-[8px] bg-white border border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1 z-50 text-[13px]"
                role="menu"
              >
                {/* User info banner */}
                <div className="px-3 py-2 border-b border-[#E5E7EB]">
                  <div className="font-medium text-[#111827]">Campus Coordinator</div>
                  <div className="text-[11px] text-[#6B7280] truncate font-normal mt-0.5">
                    coordinator@campus.edu
                  </div>
                </div>

                {/* Mobile live catalog link */}
                <div className="sm:hidden border-b border-[#E5E7EB] py-1">
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-1.5 text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors"
                    role="menuitem"
                  >
                    <span>Live Events Catalog</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[1.5] text-[#9CA3AF]" />
                  </Link>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[#374151] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors cursor-pointer text-left"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 stroke-[1.5] text-[#6B7280] group-hover:text-[#DC2626]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

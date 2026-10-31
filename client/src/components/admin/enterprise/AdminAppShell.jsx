import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, ExternalLink, LogOut } from 'lucide-react';

/**
 * Clean, Calm, Professional App Shell (Linear / Stripe / Vercel design)
 * - 240px Left sidebar with text-only nav items (Overview, Events, Registrations)
 * - Slim 56px top bar with breadcrumb on left & user menu on right
 * - 1280px max-width main workspace with 24px padding and 24px gap
 */
export default function AdminAppShell({
  activeTab,
  onTabChange,
  onLogout,
  children,
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Events' },
    { id: 'registrations', label: 'Registrations' },
  ];

  const currentTabLabel =
    navItems.find((n) => n.id === activeTab)?.label || 'Overview';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex antialiased selection:bg-slate-200">
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (240px, Text-only items, Calm & Minimal)  */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col w-[240px] border-r border-[#E2E8F0] bg-white h-screen sticky top-0 shrink-0 select-none z-30">
        {/* Top Product Logo */}
        <div className="h-14 px-5 flex items-center gap-2 border-b border-[#E2E8F0]">
          <span className="font-semibold text-[15px] text-[#0F172A] tracking-[-0.01em]">
            EventFlow
          </span>
          <span className="text-[11px] font-medium text-[#64748B] px-1.5 py-0.5 rounded-[4px] bg-[#F1F5F9]">
            Admin
          </span>
        </div>

        {/* Text-only Navigation List */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full text-left px-3 py-2 rounded-[6px] text-[14px] leading-[20px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#F1F5F9] text-[#0F172A] font-medium'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-normal'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-[#E2E8F0] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#0F172A] text-white text-[12px] font-medium flex items-center justify-center shrink-0">
            EC
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-[#0F172A] truncate">
              Coordinator
            </div>
            <div className="text-[12px] text-[#64748B] truncate">
              coordinator@campus.edu
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE DRAWER OVERLAY & SIDEBAR (md:hidden)                */}
      {/* ========================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-[240px] max-w-[80%] bg-white h-full border-r border-[#E2E8F0] flex flex-col z-10 shadow-lg">
            <div className="h-14 px-5 flex items-center justify-between border-b border-[#E2E8F0]">
              <span className="font-semibold text-[15px] text-[#0F172A]">
                EventFlow Admin
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-[6px] text-[#64748B] hover:text-[#0F172A]"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="p-3 space-y-1 flex-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-[6px] text-[14px] leading-[20px] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#F1F5F9] text-[#0F172A] font-medium'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-normal'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-[#E2E8F0] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#0F172A] text-white text-[12px] font-medium flex items-center justify-center shrink-0">
                EC
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-[#0F172A] truncate">
                  Coordinator
                </div>
                <div className="text-[12px] text-[#64748B] truncate">
                  coordinator@campus.edu
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTAINER (Top bar + Max 1280px Workspace)           */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Slim Top Bar (56px) - aligned to max-w-[1280px] workspace */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] sticky top-0 z-20">
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
            {/* Left: Mobile Toggle & Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="md:hidden p-1.5 rounded-[6px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-[14px]">
                <span className="text-[#64748B] hidden sm:inline">EventFlow</span>
                <span className="text-[#CBD5E1] hidden sm:inline">/</span>
                <span className="text-[#0F172A] font-medium">
                  {currentTabLabel}
                </span>
              </div>
            </div>

            {/* Right: User Menu (Initials, Name, Role, Dropdown) */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-2.5 p-1.5 rounded-[6px] hover:bg-[#F1F5F9] transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
              <div className="w-7 h-7 rounded-[6px] bg-[#0F172A] text-white text-[11px] font-medium flex items-center justify-center shrink-0">
                EC
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[13px] font-medium text-[#0F172A] leading-tight">
                  Coordinator
                </div>
                <div className="text-[11px] text-[#64748B] leading-tight">
                  Administrator
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-150 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-52 rounded-[8px] bg-white border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)] py-1 z-50 text-[13px]"
                role="menu"
              >
                <div className="px-3 py-2 border-b border-[#E2E8F0]">
                  <div className="font-medium text-[#0F172A]">Coordinator</div>
                  <div className="text-[12px] text-[#64748B] truncate mt-0.5">
                    coordinator@campus.edu
                  </div>
                </div>

                <div className="py-1 border-b border-[#E2E8F0]">
                  <Link
                    to="/"
                    onClick={() => {
                      sessionStorage.removeItem('admin_token');
                      localStorage.removeItem('admin_token');
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                    role="menuitem"
                  >
                    <span>View public site (exit)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
                  </Link>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left font-medium"
                    role="menuitem"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </header>

        {/* Main Workspace (Max-width 1280px, 24px padding, 24px gap between sections) */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto p-4 sm:p-6 flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}

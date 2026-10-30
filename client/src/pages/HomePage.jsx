import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Calendar,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Music,
  Cpu,
  Trophy,
  CheckCircle2,
  Users
} from 'lucide-react';
import api from '../api/client';
import EventCard from '../components/events/EventCard';
import EventCategoryShowcase from '../components/home/EventCategoryShowcase';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'open' | 'past'

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/events');
      setEvents(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load events. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Smooth scroll helper
  const scrollToSection = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handler when user selects a category card from EventCategoryShowcase
  const handleSelectCategory = (keyword, filterKeywords = []) => {
    setSelectedCategoryFilter({ keyword, filterKeywords });
    setSearchQuery(keyword);
    setActiveTab('all');
    scrollToSection('events-directory');
  };

  const handleClearFilter = () => {
    setSelectedCategoryFilter(null);
    setSearchQuery('');
  };

  // Filter and search logic
  const filteredEvents = events.filter((event) => {
    // 1. Tab filter
    if (activeTab === 'upcoming' && event.status === 'PAST') return false;
    if (activeTab === 'open' && event.status !== 'UPCOMING') return false;
    if (activeTab === 'past' && event.status !== 'PAST') return false;

    // 2. Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const title = (event.title || '').toLowerCase();
      const venue = (event.venue || '').toLowerCase();
      const desc = (event.description || '').toLowerCase();

      // Check direct match
      if (title.includes(q) || venue.includes(q) || desc.includes(q)) {
        return true;
      }

      // Check category keywords if selected via card
      if (selectedCategoryFilter && selectedCategoryFilter.keyword === searchQuery) {
        const keywords = selectedCategoryFilter.filterKeywords || [];
        const matchesCategory = keywords.some(
          (k) => title.includes(k) || venue.includes(k) || desc.includes(k)
        );
        if (matchesCategory) return true;
      }

      return false;
    }

    return true;
  });

  const upcomingCount = events.filter((e) => e.status === 'UPCOMING').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* 1. IMMERSIVE EDITORIAL HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[580px] lg:min-h-[640px] flex items-center border-b border-slate-800">
        {/* Background Realistic College Festival Photograph */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80"
            alt="College Festival Stage and Students Celebrating"
            className="w-full h-full object-cover object-center filter brightness-90 transform scale-105 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
          />

          {/* Sophisticated Multi-Stop Dark Editorial Overlay for 100% Readability */}
          {/* Base darkening layer */}
          <div className="absolute inset-0 bg-slate-950/75" />
          {/* Asymmetric horizontal gradient: darker on left for editorial typography, softer on right for crowd ambiance */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/45" />
          {/* Vertical gradient to ground top navigation and bottom border seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
          {/* Subtle warm amber and indigo atmospheric lighting accents */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Hero Editorial Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Editorial Headline, Description, CTAs, and Quick Search */}
            <div className="lg:col-span-7 text-left">
              {/* Eyebrow Kicker with subtle entrance animation */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm animate-hero-fade-up">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/90 uppercase tracking-wider text-[11px] sm:text-xs font-bold">
                  Annual Campus Confluence • 2026
                </span>
                <span className="text-white/40">•</span>
                <span className="text-amber-200 text-xs font-medium">Cultural • Technical • Sports</span>
              </div>

              {/* Editorial Headline with subtle entrance animation */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-5 font-sans animate-hero-fade-up animation-delay-100">
                Where Talent <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-white">
                  Meets Tradition
                </span>
              </h1>

              {/* Short, Meaningful Description with subtle entrance animation */}
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl mb-8 animate-hero-fade-up animation-delay-200">
                Celebrate the vibrant spirit of collegiate excellence. Discover spellbinding cultural arts and music performances, compete in high-stakes technical hackathons, and rally behind athletic champions across competitive sports arenas.
              </p>

              {/* Two CTA Buttons: Explore Events & Register Now with subtle entrance animation */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8 animate-hero-fade-up animation-delay-300">
                <button
                  onClick={() => scrollToSection('events-directory')}
                  className="px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-white hover:bg-amber-100 shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2.5 group cursor-pointer"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('open');
                    scrollToSection('events-directory');
                  }}
                  className="px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md shadow-sm hover:border-white/40 transition-all duration-200 inline-flex items-center gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Register Now</span>
                </button>
              </div>

              {/* Integrated Editorial Search Bar with subtle entrance animation */}
              <div className="max-w-xl animate-hero-fade-up animation-delay-400">
                <div className="relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 shadow-xl focus-within:bg-white/15 focus-within:border-white/40 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedCategoryFilter(null);
                    }}
                    placeholder="Search cultural fests, hackathons, robotics, sports tournaments..."
                    className="w-full pl-11 pr-20 py-3 bg-transparent rounded-xl text-white placeholder-slate-300 text-sm sm:text-base focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearFilter}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick filter pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs">
                  <span className="text-slate-300/80 font-medium">Quick search:</span>
                  {[
                    { label: 'Cultural Events', q: 'cultural' },
                    { label: 'Technical Events', q: 'technical' },
                    { label: 'Sports Events', q: 'sports' },
                    { label: 'Hackathons', q: 'hackathon' },
                    { label: 'Dance', q: 'dance' },
                  ].map((pill) => (
                    <button
                      key={pill.label}
                      onClick={() => handleSelectCategory(pill.q)}
                      className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 transition-colors cursor-pointer"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Showcase Card highlighting the 3 Event Pillars */}
            <div className="lg:col-span-5 animate-hero-fade-up animation-delay-300">
              <div className="rounded-2xl bg-slate-900/75 backdrop-blur-md border border-white/15 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                {/* Accent glow corner */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Campus Event Arenas</h3>
                    <p className="text-xs text-slate-300">Three distinct festival domains</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    2026 Edition
                  </span>
                </div>

                {/* The 3 Core Categories */}
                <div className="space-y-3.5">
                  {/* 1. Cultural Events */}
                  <div
                    onClick={() => handleSelectCategory('cultural')}
                    className="group flex items-start gap-3.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-300/40 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30 group-hover:scale-105 transition-transform">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                          Cultural Events
                        </h4>
                        <span className="text-[11px] text-amber-300/90 font-medium">Dance • Music • Arts</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                        Classical dance, ethnic fashion walks, live musical bands & drama.
                      </p>
                    </div>
                  </div>

                  {/* 2. Technical Events */}
                  <div
                    onClick={() => handleSelectCategory('technical')}
                    className="group flex items-start gap-3.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-300/40 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30 group-hover:scale-105 transition-transform">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                          Technical Events
                        </h4>
                        <span className="text-[11px] text-indigo-300/90 font-medium">Coding • Robotics</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                        24h hackathons, competitive algorithm sprints & robotics expos.
                      </p>
                    </div>
                  </div>

                  {/* 3. Sports Events */}
                  <div
                    onClick={() => handleSelectCategory('sports')}
                    className="group flex items-start gap-3.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-300/40 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white group-hover:text-emerald-200 transition-colors">
                          Sports Events
                        </h4>
                        <span className="text-[11px] text-emerald-300/90 font-medium">Athletics &amp; Leagues</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                        Cricket tournaments, football leagues, volleyball & track events.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Highlights */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Instant Digital Passes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Open to All Colleges</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EVENT CATEGORY SHOWCASE (CULTURAL & TECHNICAL ARENAS) */}
      <EventCategoryShowcase onSelectCategory={handleSelectCategory} />

      {/* 3. MAIN EVENTS DIRECTORY */}
      <main id="events-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Live &amp; Upcoming Events
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse official schedules, technical contests, and reserve your seat instantly.
            </p>
          </div>

          <div className="text-xs sm:text-sm font-medium text-slate-500">
            Showing <strong className="text-slate-800">{filteredEvents.length}</strong> of{' '}
            <strong className="text-slate-800">{events.length}</strong> registered events
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Events', count: events.length },
              { id: 'upcoming', label: 'Upcoming', count: events.filter((e) => e.status !== 'PAST').length },
              { id: 'open', label: 'Open for Registration', count: upcomingCount },
              { id: 'past', label: 'Past Events', count: events.filter((e) => e.status === 'PAST').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {searchQuery && (
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-indigo-50/70 border border-indigo-100 px-3 py-1.5 rounded-lg">
              <span>Filtered by: <strong>"{searchQuery}"</strong></span>
              <button
                onClick={handleClearFilter}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-4"
              >
                <div className="aspect-[16/9] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-md mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-xs">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-rose-900 mb-1">Failed to Connect to Server</h3>
            <p className="text-xs text-rose-700 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="max-w-md mx-auto my-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Events Found</h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery
                ? `No events matched your search "${searchQuery}". Try different keywords.`
                : 'There are no events listed under this category right now.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Event Cards Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

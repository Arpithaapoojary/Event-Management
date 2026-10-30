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

const CATEGORY_CARDS = [
  {
    id: 'cultural',
    title: 'Cultural Events',
    badgeText: 'Indian Heritage & Arts',
    icon: Music,
    badgeColor: 'bg-amber-500/25 text-amber-200 border-amber-400/40',
    hoverBorder: 'hover:border-amber-400/80 hover:shadow-amber-500/15',
    buttonColor: 'bg-amber-400/20 hover:bg-amber-400 text-amber-200 hover:text-slate-950 border-amber-400/40 group-hover:border-amber-300',
    glowColor: 'group-hover:bg-amber-500/10',
    accentText: 'text-amber-300',
    tagline: 'Dance • Music • Fashion • Drama',
    description:
      'Immerse in India’s vibrant performing arts, classical Bharatanatyam rhythms, live musical fusions, ethnic couture fashion walks, and grand college fest celebrations.',
    tags: ['Traditional Dance', 'Music & Vocals', 'Fashion Walk', 'Fest'],
    image:
      'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&w=1200&q=80',
    searchKeyword: 'cultural',
    filterKeywords: ['dance', 'music', 'singing', 'fashion', 'theatre', 'drama', 'cultural', 'fest'],
    delayClass: 'animation-delay-300',
  },
  {
    id: 'technical',
    title: 'Technical Events',
    badgeText: 'Innovation & Engineering',
    icon: Cpu,
    badgeColor: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40',
    hoverBorder: 'hover:border-indigo-400/80 hover:shadow-indigo-500/15',
    buttonColor: 'bg-indigo-400/20 hover:bg-indigo-500 text-indigo-200 hover:text-white border-indigo-400/40 group-hover:border-indigo-300',
    glowColor: 'group-hover:bg-indigo-500/10',
    accentText: 'text-indigo-300',
    tagline: 'Hackathons • Coding • Robotics • Expos',
    description:
      'Push the frontiers of engineering across 24-hour collaborative hackathons, competitive algorithm sprints, autonomous robotics arenas, and tech workshops.',
    tags: ['24h Hackathons', 'Coding Sprints', 'Robotics Arena', 'Tech Expos'],
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    searchKeyword: 'technical',
    filterKeywords: ['hackathon', 'coding', 'robotics', 'workshop', 'project', 'technical', 'tech', 'engineering'],
    delayClass: 'animation-delay-400',
  },
  {
    id: 'sports',
    title: 'Sports Events',
    badgeText: 'Athletics & Championships',
    icon: Trophy,
    badgeColor: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
    hoverBorder: 'hover:border-emerald-400/80 hover:shadow-emerald-500/15',
    buttonColor: 'bg-emerald-400/20 hover:bg-emerald-500 text-emerald-200 hover:text-slate-950 border-emerald-400/40 group-hover:border-emerald-300',
    glowColor: 'group-hover:bg-emerald-500/10',
    accentText: 'text-emerald-300',
    tagline: 'Cricket • Football • Volleyball • Athletics',
    description:
      'Compete with passion and teamwork in campus cricket tournaments, football leagues, volleyball championships, and high-energy track & field athletics.',
    tags: ['Cricket League', 'Football League', 'Volleyball', 'Athletics'],
    image:
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    searchKeyword: 'sports',
    filterKeywords: ['cricket', 'football', 'volleyball', 'athletics', 'sports', 'game', 'tournament', 'indoor'],
    delayClass: 'animation-delay-500',
  },
];

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

  // Handler when user selects a category card
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
      {/* 1. CREATIVE, PREMIUM & PROFESSIONAL COLLEGE EVENT LANDING HERO */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-12 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Ambient atmospheric lighting accents */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[550px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-10 w-[500px] h-[400px] bg-amber-500/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 left-1/3 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px]" />
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Hero Header & Editorial Intro */}
          <div className="text-center max-w-4xl mx-auto mb-14 sm:mb-16">
            {/* Eyebrow Kicker with subtle entrance animation */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm animate-hero-fade-up">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/95 uppercase tracking-wider text-[11px] sm:text-xs font-bold">
                Annual Campus Fest &amp; Event Confluence • 2026
              </span>
              <span className="text-white/30">•</span>
              <span className="text-amber-200 text-xs font-medium">Cultural • Technical • Sports</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-6 font-sans animate-hero-fade-up animation-delay-100">
              Where Talent Meets{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-white">
                Tradition
              </span>
              <span className="text-indigo-400">.</span>
            </h1>

            {/* Meaningful Description about Cultural, Technical and Sports Events */}
            <p className="text-slate-200 text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto mb-8 animate-hero-fade-up animation-delay-200 font-normal">
              Celebrate the vibrant spirit of collegiate excellence. Discover spellbinding cultural arts and traditional performances, compete in 24-hour technical hackathons, and rally behind champions across competitive sports arenas.
            </p>

            {/* Two Action CTA Buttons with subtle entrance animation */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10 animate-hero-fade-up animation-delay-300">
              <button
                onClick={() => scrollToSection('events-directory')}
                className="px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-white hover:bg-amber-100 shadow-lg shadow-black/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-2.5 group cursor-pointer"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('open');
                  scrollToSection('events-directory');
                }}
                className="px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md shadow-sm hover:border-white/40 hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Register Now</span>
              </button>
            </div>

            {/* Integrated Sleek Search Bar */}
            <div className="max-w-2xl mx-auto animate-hero-fade-up animation-delay-400">
              <div className="relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 shadow-2xl focus-within:bg-white/15 focus-within:border-white/45 transition-all">
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

              {/* Quick Filter Pills matching the 3 main categories */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                <span className="text-slate-400 font-medium">Quick search:</span>
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
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 transition-all cursor-pointer hover:border-white/30"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* THE 3-CARD VISUAL COMPOSITION (Cultural, Technical, Sports) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {CATEGORY_CARDS.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.searchKeyword, cat.filterKeywords)}
                  className={`group relative rounded-2xl lg:rounded-3xl overflow-hidden border border-white/15 bg-slate-900 shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col justify-between p-6 sm:p-7 min-h-[480px] sm:min-h-[500px] lg:min-h-[520px] animate-hero-fade-up ${cat.delayClass} ${cat.hoverBorder}`}
                >
                  {/* Large High-Quality Realistic Photograph */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transform scale-100 group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-90 group-hover:brightness-95"
                    referrerPolicy="no-referrer"
                  />

                  {/* Sophisticated Dark Vignette Overlay for Readability */}
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition-colors duration-500 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 via-50% to-transparent pointer-events-none" />
                  <div className={`absolute inset-0 transition-colors duration-500 pointer-events-none ${cat.glowColor}`} />

                  {/* Card Top: Category Badge & Live Arena Indicator */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-sm ${cat.badgeColor}`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      <span>{cat.badgeText}</span>
                    </div>
                    <span className="text-[11px] font-bold text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      Flagship Arena
                    </span>
                  </div>

                  {/* Card Bottom: Content & CTA Button */}
                  <div className="relative z-10 mt-auto pt-16">
                    <div className={`text-[11px] font-bold tracking-wider uppercase mb-1.5 ${cat.accentText}`}>
                      {cat.tagline}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2.5 group-hover:text-white transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4 line-clamp-3">
                      {cat.description}
                    </p>

                    {/* Quick Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {cat.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-white/90 border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Interactive Button */}
                    <div
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between border backdrop-blur-md transition-all duration-300 ${cat.buttonColor}`}
                    >
                      <span>Explore {cat.title}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Institutional Highlights Strip below the 3 Cards */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-slate-300">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Digital Registration &amp; QR Passes</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Inter-College Competitions &amp; Open Participation</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Certified Awards &amp; Cash Prizes</span>
            </div>
          </div>
        </div>
      </section>

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

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
  MapPin,
  CheckCircle2,
  Users
} from 'lucide-react';
import api from '../api/client';
import EventCard from '../components/events/EventCard';

const CATEGORY_CARDS = [
  {
    id: 'cultural',
    title: 'Cultural Events',
    categoryName: 'Classical Dance • Music • Drama',
    badgeText: 'Open to All',
    icon: Music,
    tagline: 'Dance • Music • Fashion',
    description:
      'Immerse in classical Bharatanatyam rhythms, live musical band fusions, theatrical plays, and ethnic couture fashion walks on the grand campus stage.',
    plateColor: 'bg-[#FBA58F]', // Coral/Peach plate matching pattern
    gradientClass: 'from-[#FDE047]/60 via-[#FEF08A]/25 to-transparent', // Yellow gradient matching screenshot
    venue: 'Grand Campus Auditorium',
    image: '/images/cultural_events.jpg',
    searchKeyword: 'cultural',
    filterKeywords: ['dance', 'music', 'singing', 'fashion', 'theatre', 'drama', 'cultural', 'fest'],
    delayClass: 'animation-delay-100',
  },
  {
    id: 'technical',
    title: 'Technical Events',
    categoryName: 'Hackathons • Coding • Robotics',
    badgeText: 'Open to All',
    icon: Cpu,
    tagline: 'Hackathons • Coding • Robotics',
    description:
      'Push your engineering boundaries in 24-hour collaborative hackathons, competitive algorithm sprints, autonomous robotics arenas, and hands-on workshops.',
    plateColor: 'bg-[#00E5FF]', // Vivid cyan plate matching screenshot
    gradientClass: 'from-[#FDA4AF]/60 via-[#FFE4E6]/25 to-transparent', // Pink gradient matching screenshot
    venue: 'Tech Park Innovation Labs',
    image: '/images/technical_events.jpg',
    searchKeyword: 'technical',
    filterKeywords: ['hackathon', 'coding', 'robotics', 'workshop', 'project', 'technical', 'tech', 'engineering'],
    delayClass: 'animation-delay-200',
  },
  {
    id: 'sports',
    title: 'Sports Events',
    categoryName: 'Football • Cricket • Athletics',
    badgeText: 'Open to All',
    icon: Trophy,
    tagline: 'Cricket • Football • Athletics',
    description:
      'Compete with teamwork, stamina, and passion across inter-college cricket leagues, football tournaments, volleyball matches, and outdoor track athletics.',
    plateColor: 'bg-[#F5B800]', // Golden amber plate matching screenshot
    gradientClass: 'from-[#FDBA74]/60 via-[#FFEDD5]/25 to-transparent', // Warm apricot gradient matching screenshot
    venue: 'University Sports Complex',
    image: '/images/sports_events.jpg',
    searchKeyword: 'sports',
    filterKeywords: ['cricket', 'football', 'volleyball', 'athletics', 'sports', 'game', 'tournament', 'indoor'],
    delayClass: 'animation-delay-300',
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

  return (
    <div className="min-h-screen bg-[#EDF5FB] text-slate-900 pb-20 selection:bg-slate-200 selection:text-slate-900">
      {/* ======================================================== */}
      {/* 1. HERO SECTION WITH EVENT LINEUP & SIGNATURE 3 CARDS */}
      {/* ======================================================== */}
      <section className="relative pt-10 sm:pt-14 pb-14 sm:pb-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header - Exact matching layout from user's reference */}
          <div className="mb-10 sm:mb-12">
            {/* Super-Kicker */}
            <div className="mb-3">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-slate-500 font-display">
                EXPLORE • ANNUAL CAMPUS EVENT 2026
              </span>
            </div>

            {/* Bold Display Headline: Event Lineup */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-display text-slate-950 tracking-tight leading-none mb-4">
              Event Lineup
            </h1>

            {/* Authentic Human Description */}
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
              Step into the arena of creativity, skill, and performance as the campus comes alive with unforgettable events across cultural, technical, and sports arenas.
            </p>
          </div>

          {/* ======================================================== */}
          {/* THE 3-CARD COMPOSITION (Exact Card Design from reference) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {CATEGORY_CARDS.map((cat) => (
              <div
                key={cat.id}
                className="relative bg-white rounded-[32px] p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/70 flex flex-col justify-between overflow-hidden group"
              >
                {/* Smooth Bottom Gradient matching reference */}
                <div
                  className={`absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t ${cat.gradientClass} pointer-events-none rounded-b-[32px]`}
                />

                {/* Upper Visual Container with Rounded Colored Plate */}
                <div className="relative w-full h-64 sm:h-72 flex items-center justify-center overflow-visible mb-4">
                  {/* Colored Backdrop Block (Peach / Cyan / Amber) - inset so character pops out */}
                  <div
                    className={`absolute inset-x-4 top-3 bottom-4 rounded-3xl ${cat.plateColor} shadow-inner transition-transform duration-500 group-hover:scale-95`}
                  />

                  {/* Character / Subject Illustration popping over the colored plate */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="relative z-10 max-h-64 sm:max-h-72 w-auto object-contain transform group-hover:scale-105 transition-transform duration-500 mix-blend-multiply drop-shadow-sm"
                    loading="lazy"
                  />
                </div>

                {/* Card Content & Action Bar */}
                <div className="relative z-10 text-center flex flex-col items-center">
                  {/* Bright Golden-Yellow Pill Badge */}
                  <span className="bg-[#FFC700] text-slate-950 font-black text-xs px-4 py-1.5 rounded-full inline-block mb-2.5 shadow-xs uppercase tracking-wider">
                    {cat.badgeText}
                  </span>

                  {/* Bold Display Card Title */}
                  <h3 className="text-2xl sm:text-[26px] font-black font-display text-slate-950 tracking-tight mb-1 group-hover:text-black transition-colors">
                    {cat.title}
                  </h3>

                  {/* Subtitle / Category info */}
                  <p className="text-xs font-bold text-slate-600 mb-5 tracking-wide">
                    {cat.categoryName}
                  </p>

                  {/* Bottom Action Bar: Black Pill + Black Circle Pin */}
                  <div className="w-full flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(cat.searchKeyword, cat.filterKeywords)}
                      className="flex-1 py-3.5 px-6 rounded-full bg-slate-950 hover:bg-black text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-center"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectCategory(cat.searchKeyword, cat.filterKeywords)}
                      title={`Venue: ${cat.venue}`}
                      className="w-12 h-12 rounded-full bg-slate-950 hover:bg-black text-white flex items-center justify-center shrink-0 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <MapPin className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. MAIN EVENTS DIRECTORY (SUB-EVENTS) */}
      {/* ======================================================== */}
      <main id="events-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        {/* Section Header matching main event section typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            {/* Super-Kicker */}
            <div className="mb-3">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-slate-500 font-display">
                ALL SUB-EVENTS • 2026 CAMPUS SCHEDULE
              </span>
            </div>

            {/* Display Headline */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black font-display text-slate-950 tracking-tight leading-none mb-4">
              Live &amp; Upcoming Events
            </h2>

            {/* Description */}
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
              Browse individual schedules, competitions, and reserve your registration pass.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            <span className="px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-2xs text-xs sm:text-sm font-bold text-slate-700">
              Showing <strong className="text-slate-950">{filteredEvents.length}</strong> of{' '}
              <strong className="text-slate-950">{events.length}</strong> total events
            </span>
          </div>
        </div>

        {/* Selected Category Filter Banner (if user filtered via category card) */}
        {selectedCategoryFilter && (
          <div className="mb-8 p-4 rounded-3xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs animate-hero-fade-in">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-900">
                Filtered by category:{' '}
                <span className="font-extrabold capitalize text-slate-950">
                  {selectedCategoryFilter.keyword} Events
                </span>
              </span>
            </div>
            <button
              onClick={handleClearFilter}
              className="text-xs font-extrabold text-slate-700 hover:text-slate-950 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Clear Filter ✕
            </button>
          </div>
        )}

        {/* Tabs and Quick Search Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-10">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200/80 rounded-full shadow-2xs overflow-x-auto shrink-0 max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'open'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Registration Open
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'past'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Past
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event, title, venue..."
              className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-slate-900 shadow-2xs placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* EVENT CARDS GRID */}
        {/* ======================================================== */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-slate-600 animate-spin mb-4" />
            <p className="text-slate-700 font-semibold text-sm">Loading campus events...</p>
          </div>
        ) : error ? (
          <div className="py-16 px-6 max-w-md mx-auto text-center bg-white rounded-3xl border border-rose-200 shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to Load Events</h3>
            <p className="text-xs text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-xs"
            >
              Try Again
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Events Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
              {searchQuery
                ? `No events matching "${searchQuery}". Try clearing search filters.`
                : 'No events currently registered in this tab.'}
            </p>
            {(searchQuery || selectedCategoryFilter) && (
              <button
                onClick={handleClearFilter}
                className="px-5 py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

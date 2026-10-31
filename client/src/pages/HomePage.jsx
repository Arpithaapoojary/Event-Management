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
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'cultural' | 'technical' | 'sports'
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

  // Category counts
  const culturalCount = events.filter((e) => (e.category || '').toLowerCase() === 'cultural').length;
  const technicalCount = events.filter((e) => (e.category || '').toLowerCase() === 'technical').length;
  const sportsCount = events.filter((e) => (e.category || '').toLowerCase() === 'sports').length;

  // Smooth scroll helper
  const scrollToSection = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handler when user selects a category card
  const handleSelectCategory = (keyword, filterKeywords = []) => {
    const catLower = keyword.toLowerCase();
    setSelectedCategory(catLower);
    setSelectedCategoryFilter({ keyword: catLower, filterKeywords });
    setSearchQuery('');
    setActiveTab('all');
    scrollToSection('events-directory');
  };

  const handleClearFilter = () => {
    setSelectedCategory('all');
    setSelectedCategoryFilter(null);
    setSearchQuery('');
  };

  // Filter and search logic
  const filteredEvents = events.filter((event) => {
    // 1. Tab filter (status)
    if (activeTab === 'upcoming' && event.status === 'PAST') return false;
    if (activeTab === 'open' && event.status !== 'UPCOMING') return false;
    if (activeTab === 'past' && event.status !== 'PAST') return false;

    const eventCategory = (event.category || 'Cultural').toLowerCase();

    // 2. Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const isDirectMatch = eventCategory === selectedCategory.toLowerCase();
      const keywords = selectedCategoryFilter?.filterKeywords || [];
      const isKeywordMatch = keywords.some(
        (k) =>
          (event.title || '').toLowerCase().includes(k) ||
          (event.venue || '').toLowerCase().includes(k) ||
          (event.description || '').toLowerCase().includes(k)
      );
      if (!isDirectMatch && !isKeywordMatch) {
        return false;
      }
    }

    // 3. Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const title = (event.title || '').toLowerCase();
      const venue = (event.venue || '').toLowerCase();
      const desc = (event.description || '').toLowerCase();

      // Check title, venue, description, OR category!
      const matchDirect =
        title.includes(q) ||
        venue.includes(q) ||
        desc.includes(q) ||
        eventCategory.includes(q);

      if (matchDirect) return true;

      // Check category keywords if selected via card
      if (selectedCategoryFilter && selectedCategoryFilter.keyword === q) {
        if (eventCategory === q) return true;
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
    <div className="min-h-screen bg-[#EDF5FB] text-slate-900 pb-16 selection:bg-slate-200 selection:text-slate-900">
      {/* ======================================================== */}
      {/* 1. HERO SECTION WITH EVENT LINEUP & SIGNATURE 3 CARDS */}
      {/* ======================================================== */}
      <section className="relative pt-10 pb-8 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            {/* Eyebrow Label (12px, letter-spacing 0.08em) */}
            <div className="mb-1.5">
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-slate-500 font-sans">
                EXPLORE • ANNUAL CAMPUS EVENT 2026
              </span>
            </div>

            {/* Page Title: clamp(28px, 3vw, 40px), weight 700, line-height 1.15 */}
            <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-slate-950 leading-[1.15] mb-2 sm:mb-3 tracking-tight">
              Event Lineup
            </h1>

            {/* Hero Paragraph: 16px, line-height 1.6, max-width 560px */}
            <p className="text-[16px] leading-[1.6] max-w-[560px] text-slate-600 font-normal">
              Step into the arena of creativity, skill, and performance as the campus comes alive with unforgettable events across cultural, technical, and sports arenas.
            </p>
          </div>

          {/* ======================================================== */}
          {/* 3-CARD COMPOSITION (Compact, 16px radius, 180px visual) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {CATEGORY_CARDS.map((cat) => (
              <div
                key={cat.id}
                className="relative bg-white rounded-[16px] p-4 shadow-2xs hover:shadow-md transition-all duration-200 border border-slate-200/90 flex flex-col justify-between overflow-hidden group"
              >
                {/* 180px Visual Container with 12px radius plate */}
                <div className="relative w-full h-[180px] rounded-[12px] overflow-hidden bg-slate-50 flex items-center justify-center mb-3 shrink-0">
                  <div
                    className={`absolute inset-2 rounded-[10px] ${cat.plateColor} opacity-90 transition-transform duration-300 group-hover:scale-95`}
                  />
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="relative z-10 max-h-[165px] w-auto object-contain transform group-hover:scale-105 transition-transform duration-300 mix-blend-multiply drop-shadow-2xs"
                    loading="lazy"
                  />
                </div>

                {/* Card Content & Action Bar */}
                <div className="relative z-10 text-center flex flex-col items-center">
                  {/* Badge: 11-12px, weight 600, padding 4px 10px */}
                  <span className="bg-[#FFC700] text-slate-950 font-semibold text-[11px] sm:text-[12px] px-2.5 py-1 rounded-[6px] inline-block mb-2 uppercase tracking-wider">
                    {cat.badgeText}
                  </span>

                  {/* Card Title: 20px, weight 600 */}
                  <h3 className="text-[20px] font-semibold text-slate-950 tracking-tight mb-1 group-hover:text-black transition-colors">
                    {cat.title}
                  </h3>

                  {/* Card Subtitle: 14px */}
                  <p className="text-[14px] font-normal text-slate-600 mb-3 tracking-normal">
                    {cat.categoryName}
                  </p>

                  {/* Bottom Action Bar: 40px height, 8px radius, 14px font */}
                  <div className="w-full flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(cat.searchKeyword, cat.filterKeywords)}
                      className="flex-1 h-10 px-4 rounded-[8px] bg-slate-950 hover:bg-black text-white font-medium text-[14px] transition-colors flex items-center justify-center text-center cursor-pointer active:scale-98"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectCategory(cat.searchKeyword, cat.filterKeywords)}
                      title={`Venue: ${cat.venue}`}
                      className="w-10 h-10 rounded-[8px] bg-slate-950 hover:bg-black text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-98"
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. MAIN EVENTS DIRECTORY (SUB-EVENTS) - 48px Gap          */}
      {/* ======================================================== */}
      <main id="events-directory" className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="mb-1.5">
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-slate-500 font-sans">
                ALL SUB-EVENTS • 2026 CAMPUS SCHEDULE
              </span>
            </div>

            <h2 className="text-[clamp(22px,2.5vw,28px)] font-bold text-slate-950 tracking-tight leading-[1.2] mb-1.5">
              Live &amp; Upcoming Events
            </h2>

            <p className="text-[14px] sm:text-[15px] text-slate-600 max-w-[560px] leading-relaxed font-normal">
              Browse individual schedules, competitions, and reserve your registration pass.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            <span className="px-3 py-1 rounded-[6px] bg-white border border-slate-200 text-[12px] font-medium text-slate-700">
              Showing <strong className="text-slate-950 font-semibold">{filteredEvents.length}</strong> of{' '}
              <strong className="text-slate-950 font-semibold">{events.length}</strong> total events
            </span>
          </div>
        </div>

        {/* Selected Category Filter Banner */}
        {selectedCategory !== 'all' && (
          <div className="mb-6 p-3 sm:p-4 rounded-[12px] bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[13px] sm:text-[14px] font-medium text-slate-900">
                Filtered by category arena:{' '}
                <span className="font-semibold capitalize text-slate-950">
                  {selectedCategory} Events
                </span>
                <span className="ml-2 text-[12px] font-medium px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-600">
                  {filteredEvents.length} events
                </span>
              </span>
            </div>
            <button
              onClick={handleClearFilter}
              className="text-[12px] font-medium text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-[6px] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Show All Arenas ✕
            </button>
          </div>
        )}

        {/* Tabs and Quick Search Filter Bar */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Arena Category Tabs (40px height, 8px radius) */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-[8px] shadow-2xs overflow-x-auto no-scrollbar shrink-0 max-w-full">
              {[
                { id: 'all', label: 'All Arenas', count: events.length },
                { id: 'cultural', label: 'Cultural', count: culturalCount },
                { id: 'technical', label: 'Technical', count: technicalCount },
                { id: 'sports', label: 'Sports', count: sportsCount },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      if (cat.id === 'all') {
                        setSelectedCategoryFilter(null);
                      } else {
                        const card = CATEGORY_CARDS.find((c) => c.id === cat.id);
                        setSelectedCategoryFilter(
                          card ? { keyword: card.searchKeyword, filterKeywords: card.filterKeywords } : null
                        );
                      }
                    }}
                    className={`h-8 px-3 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded-[4px] ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input Box (40px height, 8px radius) */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full h-10 pl-9 pr-8 rounded-[8px] bg-white border border-slate-200 text-[14px] font-normal focus:outline-hidden focus:ring-1 focus:ring-slate-950 text-slate-900 shadow-2xs placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Secondary Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Status:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-[6px] border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
              {[
                { id: 'all', label: 'All Status' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'open', label: 'Registration Open' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveTab(st.id)}
                  className={`h-7 px-2.5 rounded-[4px] text-[12px] font-medium transition-all cursor-pointer ${
                    activeTab === st.id
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EVENT CARDS GRID (3 cols desktop, 2 cols tablet, 1 col mobile) */}
        {/* ======================================================== */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 text-slate-600 animate-spin mb-3" />
            <p className="text-slate-700 font-medium text-[14px]">Loading campus events...</p>
          </div>
        ) : error ? (
          <div className="py-12 px-6 max-w-md mx-auto text-center bg-white rounded-[16px] border border-rose-200 shadow-xs">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2.5" />
            <h3 className="text-[16px] font-semibold text-slate-900 mb-1">Failed to Load Events</h3>
            <p className="text-[13px] text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="h-9 px-4 rounded-[8px] bg-slate-900 text-white text-[13px] font-medium hover:bg-black transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-[16px] border border-slate-200 p-8 shadow-2xs">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2.5" />
            <h3 className="text-[16px] font-semibold text-slate-900 mb-1">No Events Found</h3>
            <p className="text-[13px] text-slate-500 max-w-md mx-auto mb-4">
              {searchQuery
                ? `No events matching "${searchQuery}". Try clearing search filters.`
                : 'No events currently registered in this tab.'}
            </p>
            {(searchQuery || selectedCategoryFilter) && (
              <button
                onClick={handleClearFilter}
                className="h-9 px-4 rounded-[8px] bg-slate-950 text-white text-[13px] font-medium hover:bg-black transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
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

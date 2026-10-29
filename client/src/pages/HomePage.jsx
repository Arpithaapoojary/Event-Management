import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Calendar, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/client';
import EventCard from '../components/events/EventCard';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'open' | 'past'

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

  // Filter and search logic
  const filteredEvents = events.filter((event) => {
    // 1. Tab filter
    if (activeTab === 'upcoming' && event.status === 'PAST') return false;
    if (activeTab === 'open' && event.status !== 'UPCOMING') return false;
    if (activeTab === 'past' && event.status !== 'PAST') return false;

    // 2. Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = event.title?.toLowerCase().includes(q);
      const matchVenue = event.venue?.toLowerCase().includes(q);
      const matchDesc = event.description?.toLowerCase().includes(q);
      return matchTitle || matchVenue || matchDesc;
    }

    return true;
  });

  const upcomingCount = events.filter((e) => e.status === 'UPCOMING').length;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/20 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Discover Campus Opportunities &amp; Workshops</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Institution Event Management <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Campus Portal
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed mb-8">
            Explore upcoming hackathons, tech workshops, guest lectures, and placement sessions.
            Reserve your seat with verified registration.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative shadow-lg shadow-indigo-100/50 rounded-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, topic, or venue..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Events', count: events.length },
              { id: 'upcoming', label: 'Upcoming', count: events.filter((e) => e.status !== 'PAST').length },
              { id: 'open', label: 'Open for Registration', count: upcomingCount },
              { id: 'past', label: 'Past Events', count: events.filter((e) => e.status === 'PAST').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700 font-bold'
                      : 'bg-slate-300/50 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs sm:text-sm font-medium text-slate-500">
            Showing <strong className="text-slate-800">{filteredEvents.length}</strong> of{' '}
            <strong className="text-slate-800">{events.length}</strong> events
          </div>
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
          <div className="max-w-md mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-rose-900 mb-1">Failed to Connect to Server</h3>
            <p className="text-xs text-rose-700 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="max-w-md mx-auto my-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
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
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
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

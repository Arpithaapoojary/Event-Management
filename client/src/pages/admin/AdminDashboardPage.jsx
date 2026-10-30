import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  RefreshCw,
  LogOut,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Filter,
  Eye,
  Download,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Layers,
  TrendingUp,
  Cpu,
  Trophy,
  Palette,
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import EventFormModal from '../../components/admin/EventFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import EventRegistrationsModal from '../../components/admin/EventRegistrationsModal';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  // Active Dashboard Tab: 'events' | 'registrations'
  const [activeTab, setActiveTab] = useState('events');

  // Stats
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    fullEvents: 0,
    categories: {
      cultural: 0,
      technical: 0,
      sports: 0,
    },
  });

  // Events list & filters
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');

  // All Registrations list & filters
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regSearch, setRegSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [rosterEvent, setRosterEvent] = useState(null);

  // Success Notification banner
  const [bannerNotice, setBannerNotice] = useState(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    fetchStats();
    fetchEvents();
    if (activeTab === 'registrations') {
      fetchRegistrations();
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data) setStats(res.data);
    } catch (err) {
      if (err.message?.includes('Access denied') || err.message?.includes('401')) {
        handleLogout();
      }
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const res = await api.get('/events');
      setEvents(res.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setRegLoading(true);
      let url = '/admin/registrations';
      const params = [];
      if (selectedEventId) params.push(`eventId=${selectedEventId}`);
      if (regSearch.trim()) params.push(`search=${encodeURIComponent(regSearch.trim())}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setRegistrations(res.data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setRegLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'registrations') {
      fetchRegistrations();
    }
  }, [activeTab, selectedEventId]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const showNotification = (msg) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 5000);
  };

  // Create & Edit Handlers
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setFormModalOpen(true);
  };

  const handleEventSaved = (savedEvent) => {
    showNotification(
      editingEvent
        ? `Successfully updated "${savedEvent?.title || 'event'}".`
        : `Successfully created "${savedEvent?.title || 'new event'}".`
    );
    fetchEvents();
    fetchStats();
  };

  // Delete Handler
  const handleOpenDelete = (event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/admin/events/${eventToDelete._id}`);
      showNotification(`Event "${eventToDelete.title}" has been deactivated.`);
      setDeleteModalOpen(false);
      setEventToDelete(null);
      fetchEvents();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to delete event.');
    } finally {
      setIsDeleting(false);
    }
  };

  // View Roster Handler
  const handleOpenRoster = (event) => {
    setRosterEvent(event);
    setRosterModalOpen(true);
  };

  // Category counts
  const culturalCount = events.filter((e) => (e.category || '').toLowerCase() === 'cultural').length;
  const technicalCount = events.filter((e) => (e.category || '').toLowerCase() === 'technical').length;
  const sportsCount = events.filter((e) => (e.category || '').toLowerCase() === 'sports').length;

  // Filtered Events with Category & Status filters
  const filteredEvents = events.filter((ev) => {
    // Category filter
    if (eventCategoryFilter !== 'all') {
      const cat = (ev.category || 'Cultural').toLowerCase();
      if (cat !== eventCategoryFilter.toLowerCase()) return false;
    }

    // Status filter
    if (eventStatusFilter === 'upcoming' && ev.status === 'PAST') return false;
    if (eventStatusFilter === 'open' && ev.status !== 'UPCOMING') return false;
    if (eventStatusFilter === 'full' && ev.status !== 'FULL') return false;
    if (eventStatusFilter === 'past' && ev.status !== 'PAST') return false;

    // Search query
    if (eventSearch.trim() !== '') {
      const q = eventSearch.toLowerCase();
      const matchTitle = ev.title?.toLowerCase().includes(q);
      const matchVenue = ev.venue?.toLowerCase().includes(q);
      const matchCat = ev.category?.toLowerCase().includes(q);
      return matchTitle || matchVenue || matchCat;
    }
    return true;
  });

  // Export Master Roster to CSV with Category Column
  const exportMasterCSV = () => {
    const listToExport = registrations.length > 0 ? registrations : [];
    if (!listToExport.length) {
      alert('No registration records available to export.');
      return;
    }

    const headers = [
      '#',
      'Attendee Name',
      'Email Address',
      'Mobile Number (India)',
      'Event Name',
      'Arena Section / Category',
      'Campus Venue',
      'Registration Date',
      'Ticket Code',
    ];

    const rows = listToExport.map((r, i) => [
      i + 1,
      `"${r.fullName || ''}"`,
      `"${r.email || ''}"`,
      `"+91 ${r.contactNumber || ''}"`,
      `"${r.event?.title || 'Event'}"`,
      `"${r.event?.category || 'Cultural'}"`,
      `"${r.event?.venue || ''}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`,
      `"#REG-${r._id ? r._id.slice(-6).toUpperCase() : 'PASS'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Master_Campus_Event_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate total capacity across all events
  const totalCapacity = events.reduce((sum, ev) => sum + (ev.capacity || 0), 0);
  const overallUtilization = totalCapacity > 0
    ? Math.round((stats.totalRegistrations / totalCapacity) * 100)
    : 0;

  // Helper for Category badge rendering (No emojis, clean SVG icons)
  const renderCategoryBadge = (category) => {
    const cat = category || 'Cultural';
    if (cat === 'Technical') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
          <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Technical</span>
        </span>
      );
    }
    if (cat === 'Sports') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <Trophy className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Sports</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
        <Palette className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Cultural</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans selection:bg-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Banner Notice Alert */}
        {bannerNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm text-slate-900 text-sm font-medium flex items-center justify-between animate-hero-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="font-semibold">{bannerNotice}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. UNCONGESTED OPEN PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-hero-fade-up">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
              <Link
                to="/"
                className="hover:text-slate-900 transition flex items-center gap-1.5 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Events Catalog</span>
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">Admin Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Operations Console
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Oversee campus event schedules, seating capacity, and student registrations.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
              <span>Coordinator Session Active</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campus Event</span>
            </button>
          </div>
        </div>

        {/* 2. STANDALONE SPACIOUS KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Total Published Events */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Published Events
              </span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalEvents}
            </div>
            <span className="text-xs text-slate-500 font-medium mt-1.5 block">
              {stats.upcomingEvents} Upcoming • {stats.pastEvents} Concluded
            </span>
          </div>

          {/* Card 2: Campus Arenas */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Campus Arenas
              </span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setActiveTab('events');
                  setEventCategoryFilter('Cultural');
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200/80 transition cursor-pointer"
                title="Filter Cultural Events"
              >
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>{culturalCount} Cultural</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('events');
                  setEventCategoryFilter('Technical');
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200/80 transition cursor-pointer"
                title="Filter Technical Events"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>{technicalCount} Tech</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('events');
                  setEventCategoryFilter('Sports');
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/80 transition cursor-pointer"
                title="Filter Sports Events"
              >
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                <span>{sportsCount} Sports</span>
              </button>
            </div>
            <span className="text-xs text-slate-400 mt-2 block font-medium">
              Click any arena to filter
            </span>
          </div>

          {/* Card 3: Student Passes */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Student Passes
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalRegistrations}
            </div>
            <span className="text-xs text-emerald-700 font-semibold mt-1.5 block">
              Active Verified Attendee Records
            </span>
          </div>

          {/* Card 4: Seating Utilization */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Capacity Filled
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {overallUtilization}%
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${overallUtilization}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. CLEAN SEGMENTED NAVIGATION TABS */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Event Management</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'events' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('registrations')}
              className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'registrations'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Attendee Rosters</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'registrations' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {stats.totalRegistrations}
              </span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: EVENT MANAGEMENT (CRUD) */}
        {/* ======================================================== */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Streamlined Filter & Search Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              {/* Category Arena Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'all', label: 'All Arenas', Icon: Layers, count: events.length },
                  { key: 'Cultural', label: 'Cultural', Icon: Palette, iconColor: 'text-amber-600', count: culturalCount },
                  { key: 'Technical', label: 'Technical', Icon: Cpu, iconColor: 'text-blue-600', count: technicalCount },
                  { key: 'Sports', label: 'Sports', Icon: Trophy, iconColor: 'text-emerald-600', count: sportsCount },
                ].map(({ key, label, Icon, iconColor, count }) => {
                  const isSelected = eventCategoryFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setEventCategoryFilter(key)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : iconColor || 'text-slate-500'}`} />
                      <span>{label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Status row */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search events..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition font-medium"
                  />
                </div>

                <select
                  value={eventStatusFilter}
                  onChange={(e) => setEventStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-slate-900 text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="open">Registration Open</option>
                  <option value="full">Sold Out</option>
                  <option value="past">Concluded</option>
                </select>

                <button
                  onClick={() => {
                    fetchStats();
                    fetchEvents();
                  }}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition shadow-2xs cursor-pointer active:scale-95"
                  title="Refresh Events"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Events Management Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              {eventsLoading ? (
                <div className="py-24 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-900 mb-2" />
                  <span className="text-sm font-medium">Loading campus event listings...</span>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-base font-bold text-slate-700">No Events Found</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Try adjusting your search criteria or arena category filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-6">Event Details</th>
                        <th className="py-3.5 px-4">Arena Section</th>
                        <th className="py-3.5 px-4">Date &amp; Time</th>
                        <th className="py-3.5 px-4">Campus Venue</th>
                        <th className="py-3.5 px-4">Attendance</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEvents.map((ev) => {
                        const eventDateObj = new Date(ev.dateTime);
                        const dateFormatted = eventDateObj.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                        const timeFormatted = eventDateObj.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        });

                        const capacityPercent = Math.min(
                          100,
                          Math.round(((ev.registeredCount || 0) / (ev.capacity || 1)) * 100)
                        );

                        return (
                          <tr key={ev._id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Thumbnail & Title */}
                            <td className="py-3.5 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={ev.imageUrl}
                                  alt=""
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                                  }}
                                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                                />
                                <div className="min-w-0 max-w-[280px]">
                                  <Link
                                    to={`/events/${ev._id}`}
                                    target="_blank"
                                    className="font-bold text-slate-900 hover:text-blue-600 truncate block text-sm transition flex items-center gap-1 group"
                                  >
                                    <span className="truncate">{ev.title}</span>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0" />
                                  </Link>
                                  <span className="text-xs text-slate-500 font-medium truncate block mt-0.5">
                                    {ev.description}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Arena Category */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {renderCategoryBadge(ev.category)}
                            </td>

                            {/* Date & Time */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                              <span className="font-semibold text-slate-900 block">{dateFormatted}</span>
                              <span className="text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                {timeFormatted}
                              </span>
                            </td>

                            {/* Venue */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                              <span className="flex items-center gap-1.5 font-semibold text-slate-700 max-w-[190px]">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{ev.venue}</span>
                              </span>
                            </td>

                            {/* Attendance / Capacity */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="w-32">
                                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                                  <span>{ev.registeredCount || 0} / {ev.capacity}</span>
                                  <span className="text-slate-500 font-semibold text-[11px]">{capacityPercent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      ev.status === 'FULL'
                                        ? 'bg-rose-500'
                                        : ev.status === 'PAST'
                                        ? 'bg-slate-400'
                                        : 'bg-slate-900'
                                    }`}
                                    style={{ width: `${capacityPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <StatusBadge status={ev.status} seatsLeft={ev.seatsLeft} />
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenRoster(ev)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                                  title="View Attendee Roster"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(ev)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                                  title="Edit Event"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(ev)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Deactivate Event"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: STUDENT ATTENDEE ROSTERS */}
        {/* ======================================================== */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {/* Registrations Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchRegistrations()}
                    placeholder="Search by student, email, or phone..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition font-medium"
                  />
                </div>

                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-slate-900 text-slate-700 font-medium"
                >
                  <option value="">All Campus Events ({events.length})</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      [{ev.category || 'Event'}] {ev.title} ({ev.registeredCount || 0} registered)
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchRegistrations}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
                >
                  Search
                </button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  Listed: <strong className="text-slate-900 font-bold">{registrations.length}</strong>
                </span>

                {registrations.length > 0 && (
                  <button
                    onClick={exportMasterCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>

            {/* Registrations Master Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              {regLoading ? (
                <div className="py-24 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-900 mb-2" />
                  <span className="text-sm font-medium">Loading student registration records...</span>
                </div>
              ) : registrations.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-base font-bold text-slate-700">No Registrations Found</p>
                  <p className="text-sm text-slate-500 mt-1">
                    No student registrations match the selected event or search filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-6">Student Attendee</th>
                        <th className="py-3.5 px-4">Contact Details</th>
                        <th className="py-3.5 px-4">Associated Event</th>
                        <th className="py-3.5 px-4">Section</th>
                        <th className="py-3.5 px-4">Registration Date</th>
                        <th className="py-3.5 px-4">Ticket ID</th>
                        <th className="py-3.5 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registrations.map((reg) => {
                        const regDate = new Date(reg.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        });

                        return (
                          <tr key={reg._id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Name */}
                            <td className="py-3.5 px-6 font-bold text-slate-900">
                              {reg.fullName}
                            </td>

                            {/* Contact info */}
                            <td className="py-3.5 px-4 text-sm">
                              <span className="block font-medium text-slate-800">{reg.email}</span>
                              <span className="text-slate-500 font-medium text-xs block mt-0.5">
                                +91 {reg.contactNumber}
                              </span>
                            </td>

                            {/* Event details */}
                            <td className="py-3.5 px-4 text-sm">
                              {reg.event ? (
                                <div className="max-w-xs">
                                  <span className="font-bold text-slate-900 block truncate">
                                    {reg.event.title}
                                  </span>
                                  <span className="text-slate-500 text-xs font-medium block truncate">
                                    {reg.event.venue}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Archived Event</span>
                              )}
                            </td>

                            {/* Section Category */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {renderCategoryBadge(reg.event?.category)}
                            </td>

                            {/* Date */}
                            <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap font-medium">
                              {regDate}
                            </td>

                            {/* Ticket ID */}
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-md font-semibold">
                                #REG-{reg._id ? reg._id.slice(-6).toUpperCase() : 'PASS'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-6 text-right whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Verified</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Create / Edit Event */}
      <EventFormModal
        isOpen={formModalOpen}
        event={editingEvent}
        onClose={() => {
          setFormModalOpen(false);
          setEditingEvent(null);
        }}
        onSaved={handleEventSaved}
      />

      {/* MODAL 2: Delete Confirmation with data integrity warning */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        event={eventToDelete}
        isDeleting={isDeleting}
        onClose={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* MODAL 3: Event Attendee Roster */}
      <EventRegistrationsModal
        isOpen={rosterModalOpen}
        event={rosterEvent}
        onClose={() => {
          setRosterModalOpen(false);
          setRosterEvent(null);
        }}
      />
    </div>
  );
}

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
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import EventFormModal from '../../components/admin/EventFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import EventRegistrationsModal from '../../components/admin/EventRegistrationsModal';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  // Active Dashboard Tab: 'events' | 'registrations' | 'analytics'
  const [activeTab, setActiveTab] = useState('events');

  // Stats
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    fullEvents: 0,
  });

  // Events list & filter
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');

  // All Registrations list & filter
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

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
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
      return matchTitle || matchVenue;
    }
    return true;
  });

  // Export Master Roster to CSV
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

  return (
    <div className="min-h-screen bg-[#EDF5FB] text-slate-900 pb-24 font-sans selection:bg-slate-200">
      {/* Top Breadcrumb & Return Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:shadow-xs transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Public Event Catalog</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Coordinator Session Active</span>
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Banner Notice Alert */}
        {bannerNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-emerald-300 shadow-md text-slate-900 text-xs sm:text-sm font-medium flex items-center justify-between animate-hero-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
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

        {/* ======================================================== */}
        {/* ENTERPRISE CAMPUS CONSOLE HERO CARD (Same Platform Style) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 shadow-xl border border-white/80 overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFC700] text-slate-950 text-[11px] font-bold uppercase tracking-wider mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Campus Event Operations • Academic Year 2026-2027</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-950 tracking-normal leading-tight">
                Event Management Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                Publish campus events, manage student admission rosters, track seating capacity utilization, and inspect live registration activity.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  fetchStats();
                  fetchEvents();
                  if (activeTab === 'registrations') fetchRegistrations();
                }}
                className="p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition shadow-2xs cursor-pointer active:scale-95"
                title="Refresh All Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-950 hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-xl active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campus Event</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SUMMARY KPI METRIC CARDS */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
            {/* 1. Total Published Events */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Published Events
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-950">
                {stats.totalEvents}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {stats.upcomingEvents} Upcoming • {stats.pastEvents} Concluded
              </span>
            </div>

            {/* 2. Total Student Registrations */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Registrations
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-950">
                {stats.totalRegistrations}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                ● Verified Student Passes
              </span>
            </div>

            {/* 3. Seating Capacity Utilization */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Campus Capacity Rate
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-950">
                {overallUtilization}%
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-slate-950 rounded-full transition-all duration-700"
                  style={{ width: `${overallUtilization}%` }}
                />
              </div>
            </div>

            {/* 4. Events At Full Capacity */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Fully Booked Events
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-950">
                {stats.fullEvents}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {stats.fullEvents > 0 ? 'Waitlist or Closed' : 'All events have seats'}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NAVIGATION PILL TABS */}
        {/* ======================================================== */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('events')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'bg-slate-950 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Event Management (CRUD)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'events'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('registrations')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'registrations'
                ? 'bg-slate-950 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Attendee Rosters</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'registrations'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {stats.totalRegistrations}
            </span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: EVENT MANAGEMENT (CRUD) */}
        {/* ======================================================== */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="bg-white p-4 rounded-3xl border border-white/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Search events by title or venue..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10 transition"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline mr-1">
                  Filter:
                </span>
                {[
                  { key: 'all', label: 'All Events' },
                  { key: 'upcoming', label: 'Upcoming' },
                  { key: 'open', label: 'Open' },
                  { key: 'full', label: 'Sold Out' },
                  { key: 'past', label: 'Concluded' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setEventStatusFilter(key)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      eventStatusFilter === key
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Management Table Container */}
            <div className="bg-white rounded-[32px] border border-white/80 overflow-hidden shadow-md">
              {eventsLoading ? (
                <div className="py-24 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-900 mb-2" />
                  <span className="text-xs font-medium">Loading campus event listings...</span>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Events Found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search criteria or publish a new event.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                        <th className="py-4 px-6">Event Details</th>
                        <th className="py-4 px-4">Date &amp; Time</th>
                        <th className="py-4 px-4">Venue</th>
                        <th className="py-4 px-4">Seating Capacity</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEvents.map((ev) => {
                        const eventDate = new Date(ev.dateTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        });

                        const capacityPercent = Math.min(
                          100,
                          Math.round(((ev.registeredCount || 0) / (ev.capacity || 1)) * 100)
                        );

                        return (
                          <tr key={ev._id} className="hover:bg-slate-50/70 transition">
                            {/* Thumbnail & Title */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={ev.imageUrl}
                                  alt=""
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                                  }}
                                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0 max-w-xs">
                                  <Link
                                    to={`/events/${ev._id}`}
                                    target="_blank"
                                    className="font-bold text-slate-900 hover:text-black line-clamp-1 transition flex items-center gap-1 group"
                                  >
                                    <span>{ev.title}</span>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </Link>
                                  <span className="text-[11px] text-slate-400 block line-clamp-1 mt-0.5">
                                    {ev.description}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 whitespace-nowrap text-slate-700 text-xs font-medium">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {eventDate}
                              </span>
                            </td>

                            {/* Venue */}
                            <td className="py-4 px-4 text-slate-700 text-xs font-medium">
                              <span className="flex items-center gap-1.5 line-clamp-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{ev.venue}</span>
                              </span>
                            </td>

                            {/* Seating Progress */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="w-36">
                                <div className="flex justify-between text-[11px] font-bold text-slate-800 mb-1">
                                  <span>{ev.registeredCount || 0} / {ev.capacity}</span>
                                  <span className="text-slate-500 font-semibold">{capacityPercent}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      ev.status === 'FULL'
                                        ? 'bg-rose-500'
                                        : ev.status === 'PAST'
                                        ? 'bg-slate-400'
                                        : 'bg-slate-950'
                                    }`}
                                    style={{ width: `${capacityPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <StatusBadge status={ev.status} seatsLeft={ev.seatsLeft} />
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenRoster(ev)}
                                  className="p-2 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer"
                                  title="View Attendee Roster"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(ev)}
                                  className="p-2 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer"
                                  title="Edit Event"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(ev)}
                                  className="p-2 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
        {/* TAB 2: STUDENT ATTENDEE ROSTERS (Module 5) */}
        {/* ======================================================== */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-white/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {/* Search input */}
                <div className="relative w-full sm:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchRegistrations()}
                    placeholder="Search by student name, email, or phone..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10 transition"
                  />
                </div>

                {/* Event dropdown selector */}
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 text-xs sm:text-sm rounded-full border border-slate-200 bg-white focus:outline-hidden focus:border-slate-950 text-slate-800 font-medium"
                >
                  <option value="">All Events ({events.length})</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title} ({ev.registeredCount || 0} registered)
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchRegistrations}
                  className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-black text-white text-xs font-semibold transition active:scale-95 cursor-pointer"
                >
                  Search
                </button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span className="text-xs text-slate-500 font-medium">
                  Listed Registrations: <strong className="text-slate-900 font-bold">{registrations.length}</strong>
                </span>

                {registrations.length > 0 && (
                  <button
                    onClick={exportMasterCSV}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Export Roster CSV</span>
                  </button>
                )}
              </div>
            </div>

            {/* Registrations Master Table */}
            <div className="bg-white rounded-[32px] border border-white/80 overflow-hidden shadow-md">
              {regLoading ? (
                <div className="py-24 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-900 mb-2" />
                  <span className="text-xs font-medium">Loading student registration records...</span>
                </div>
              ) : registrations.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Registrations Found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    No student registrations match the selected event or search filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                        <th className="py-4 px-6">Student Attendee</th>
                        <th className="py-4 px-4">Contact Details</th>
                        <th className="py-4 px-4">Associated Event</th>
                        <th className="py-4 px-4">Registration Date</th>
                        <th className="py-4 px-4">Ticket ID</th>
                        <th className="py-4 px-6 text-right">Status</th>
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
                          <tr key={reg._id} className="hover:bg-slate-50/70 transition">
                            {/* Name */}
                            <td className="py-4 px-6 font-bold text-slate-900">
                              {reg.fullName}
                            </td>

                            {/* Contact info */}
                            <td className="py-4 px-4 text-xs">
                              <span className="block font-medium text-slate-800">{reg.email}</span>
                              <span className="text-slate-500 font-semibold text-[11px] block mt-0.5">
                                +91 {reg.contactNumber}
                              </span>
                            </td>

                            {/* Event details */}
                            <td className="py-4 px-4 text-xs">
                              {reg.event ? (
                                <div className="max-w-xs">
                                  <span className="font-bold text-slate-900 block truncate">
                                    {reg.event.title}
                                  </span>
                                  <span className="text-slate-400 text-[11px] block truncate">
                                    {reg.event.venue}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Archived Event</span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 text-slate-500 text-xs whitespace-nowrap">
                              {regDate}
                            </td>

                            {/* Ticket ID */}
                            <td className="py-4 px-4 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                                #REG-{reg._id ? reg._id.slice(-6).toUpperCase() : 'PASS'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6 text-right whitespace-nowrap">
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

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
      showNotification(`Event "${eventToDelete.title}" has been deleted.`);
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

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Admin Header Bar */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Event Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Management Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Oversee event listings, attendee registrations, and schedule operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStats();
                fetchEvents();
                if (activeTab === 'registrations') fetchRegistrations();
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 font-semibold text-xs sm:text-sm transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Banner Notice */}
        {bannerNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{bannerNotice}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Module 3: Summary Metrics Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Events */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Events
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalEvents}
              </span>
            </div>
          </div>

          {/* Total Registrations */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Registrations
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalRegistrations}
              </span>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Upcoming Events
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.upcomingEvents}
              </span>
            </div>
          </div>

          {/* Full / At Capacity Events */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                At Capacity
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.fullEvents}
              </span>
            </div>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'events'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Event Management (CRUD)</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('registrations')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'registrations'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Registrations Management</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
              {stats.totalRegistrations}
            </span>
          </button>
        </div>

        {/* TAB 1: EVENT MANAGEMENT (Module 4) */}
        {activeTab === 'events' && (
          <section className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Search events by title or venue..."
                  className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 transition"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                  Filter:
                </span>
                {['all', 'upcoming', 'open', 'full', 'past'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEventStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                      eventStatusFilter === tab
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Table Container */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              {eventsLoading ? (
                <div className="py-20 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                  <span className="text-xs">Loading event records...</span>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No Events Found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search criteria or create a new event.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="py-3.5 px-4 sm:px-6">Event Details</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Venue</th>
                        <th className="py-3.5 px-4">Attendance</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
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
                            {/* Title & Thumbnail */}
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={ev.imageUrl}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                                />
                                <div>
                                  <Link
                                    to={`/events/${ev._id}`}
                                    target="_blank"
                                    className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 transition"
                                  >
                                    {ev.title}
                                  </Link>
                                  <span className="text-[11px] text-slate-400 block line-clamp-1">
                                    {ev.description}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 whitespace-nowrap text-slate-600 text-xs">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                {eventDate}
                              </span>
                            </td>

                            {/* Venue */}
                            <td className="py-4 px-4 text-slate-600 text-xs">
                              <span className="flex items-center gap-1.5 font-medium line-clamp-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {ev.venue}
                              </span>
                            </td>

                            {/* Attendance / Capacity */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="w-32">
                                <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                                  <span>{ev.registeredCount || 0} / {ev.capacity}</span>
                                  <span className="text-slate-400">{capacityPercent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      ev.status === 'FULL'
                                        ? 'bg-rose-500'
                                        : ev.status === 'PAST'
                                        ? 'bg-slate-400'
                                        : 'bg-indigo-600'
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

                            {/* Action Buttons */}
                            <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenRoster(ev)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                  title="View Attendee Roster"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(ev)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                  title="Edit Event"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(ev)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                                  title="Delete Event"
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
          </section>
        )}

        {/* TAB 2: REGISTRATION MANAGEMENT (Module 5) */}
        {activeTab === 'registrations' && (
          <section className="space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
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
                    placeholder="Search by student name or email..."
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 transition"
                  />
                </div>

                {/* Event dropdown selector */}
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 text-slate-700"
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
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  Search
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Total Registrations Listed: <strong className="text-slate-900">{registrations.length}</strong>
              </div>
            </div>

            {/* Registrations Table Container */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              {regLoading ? (
                <div className="py-20 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                  <span className="text-xs">Loading registration records...</span>
                </div>
              ) : registrations.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No Registrations Found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    No attendees match the selected event or search query.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="py-3.5 px-4 sm:px-6">Attendee</th>
                        <th className="py-3.5 px-4">Contact Details</th>
                        <th className="py-3.5 px-4">Associated Event</th>
                        <th className="py-3.5 px-4">Registration Date</th>
                        <th className="py-3.5 px-4 sm:px-6">Status</th>
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
                            <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
                              {reg.fullName}
                            </td>
                            <td className="py-4 px-4 text-xs">
                              <span className="block font-medium text-slate-800">{reg.email}</span>
                              <span className="text-slate-400 text-[11px]">{reg.contactNumber}</span>
                            </td>
                            <td className="py-4 px-4 text-xs">
                              {reg.event ? (
                                <div>
                                  <span className="font-bold text-slate-900 block line-clamp-1">
                                    {reg.event.title}
                                  </span>
                                  <span className="text-slate-400 text-[11px]">
                                    {reg.event.venue}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Archived Event</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-500 text-xs whitespace-nowrap">
                              {regDate}
                            </td>
                            <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                <CheckCircle className="w-3 h-3" />
                                <span>Confirmed</span>
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
          </section>
        )}
      </main>

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

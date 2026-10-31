import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  X,
  ExternalLink,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api/client';
import {
  AdminHeader,
  StatCard,
  StatusBadge,
  CategoryBadge,
  Tabs,
  Button,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  TableEmptyState,
  TableLoadingState,
  Toast,
  EventDetailDrawer,
} from '../../components/admin/enterprise';
import EventFormModal from '../../components/admin/EventFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  // Active Navigation Tab: 'overview' | 'events' | 'registrations'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    fullEvents: 0,
    deletedEvents: 0,
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
  const [showDeletedEvents, setShowDeletedEvents] = useState(false);
  const [eventPage, setEventPage] = useState(1);
  const [eventPageSize, setEventPageSize] = useState(10);

  // Registrations list & filters
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regSearchInput, setRegSearchInput] = useState('');
  const [debouncedRegSearch, setDebouncedRegSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [regPage, setRegPage] = useState(1);
  const [regPageSize, setRegPageSize] = useState(10);

  // Debounce search input (300ms) for Registration Management
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRegSearch(regSearchInput.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [regSearchInput]);

  // Modals & Drawers state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEvent, setDrawerEvent] = useState(null);

  // Enterprise Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

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
    fetchRegistrations();
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data) setStats(res.data);
    } catch (err) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        handleLogout();
      }
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const res = await api.get('/admin/events', {
        params: { showDeleted: showDeletedEvents ? 'true' : 'false' },
      });
      setEvents(res.data || []);
    } catch (err) {
      console.error('Error fetching admin events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setRegLoading(true);
      let url = '/admin/registrations';
      if (selectedEventId) {
        url += `?eventId=${selectedEventId}`;
      }
      const res = await api.get(url);
      setRegistrations(res.data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setRegLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [showDeletedEvents]);

  useEffect(() => {
    if (activeTab === 'registrations' || activeTab === 'overview') {
      fetchRegistrations();
    }
  }, [activeTab, selectedEventId]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
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
    showToast(
      'success',
      editingEvent
        ? `Successfully updated "${savedEvent?.title || 'event'}".`
        : `Successfully created "${savedEvent?.title || 'new event'}".`
    );
    fetchEvents();
    fetchStats();
  };

  // Delete Handlers (Soft Delete)
  const handleOpenDelete = (event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/events/${eventToDelete._id}`);
      const affected = res.data?.affectedRegistrations || eventToDelete.registeredCount || 0;
      showToast(
        'success',
        `Event "${eventToDelete.title}" deleted (soft delete). ${affected} registrations preserved for audit.`
      );
      setDeleteModalOpen(false);
      setEventToDelete(null);
      fetchEvents();
      fetchStats();
      if (drawerEvent && drawerEvent._id === eventToDelete._id) {
        setDrawerOpen(false);
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to delete event.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore Soft-Deleted Event Handler
  const handleRestoreEvent = async (event) => {
    try {
      await api.post(`/admin/events/${event._id}/restore`);
      showToast('success', `Event "${event.title}" has been restored to the catalog.`);
      fetchEvents();
      fetchStats();
      if (drawerEvent && drawerEvent._id === event._id) {
        setDrawerOpen(false);
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to restore event.');
    }
  };

  // View Event Detail Drawer Handler
  const handleOpenDrawer = (event) => {
    setDrawerEvent(event);
    setDrawerOpen(true);
  };

  // Selected event metadata when an event filter is active in Registrations
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return events.find((e) => e._id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Jump to Registrations Tab for a specific event
  const handleJumpToRoster = (event) => {
    setSelectedEventId(event._id);
    setActiveTab('registrations');
  };

  // Category counts
  const culturalCount = useMemo(
    () => events.filter((e) => !e.isDeleted && (e.category || '').toLowerCase() === 'cultural').length,
    [events]
  );
  const technicalCount = useMemo(
    () => events.filter((e) => !e.isDeleted && (e.category || '').toLowerCase() === 'technical').length,
    [events]
  );
  const sportsCount = useMemo(
    () => events.filter((e) => !e.isDeleted && (e.category || '').toLowerCase() === 'sports').length,
    [events]
  );

  // Filtered Events with Category, Status, Search, and Soft-delete filters
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Soft-delete visibility filter
      if (!showDeletedEvents && ev.isDeleted) return false;

      // Category filter
      if (eventCategoryFilter !== 'all') {
        const cat = (ev.category || 'Cultural').toLowerCase();
        if (cat !== eventCategoryFilter.toLowerCase()) return false;
      }

      // Status filter
      if (eventStatusFilter === 'cancelled' && !ev.isDeleted) return false;
      if (eventStatusFilter === 'upcoming' && (ev.isDeleted || ev.status === 'PAST')) return false;
      if (eventStatusFilter === 'open' && (ev.isDeleted || ev.status !== 'UPCOMING')) return false;
      if (eventStatusFilter === 'full' && (ev.isDeleted || ev.status !== 'FULL')) return false;
      if (eventStatusFilter === 'past' && (ev.isDeleted || ev.status !== 'PAST')) return false;
      if (
        eventStatusFilter === 'filling' &&
        (ev.isDeleted || !(ev.registeredCount && ev.capacity && ev.registeredCount / ev.capacity >= 0.8))
      ) {
        return false;
      }

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
  }, [events, eventCategoryFilter, eventStatusFilter, eventSearch, showDeletedEvents]);

  // Paginated Events
  const totalEventPages = Math.max(1, Math.ceil(filteredEvents.length / eventPageSize));
  const paginatedEvents = useMemo(() => {
    const start = (eventPage - 1) * eventPageSize;
    return filteredEvents.slice(start, start + eventPageSize);
  }, [filteredEvents, eventPage, eventPageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setEventPage(1);
  }, [eventCategoryFilter, eventStatusFilter, eventSearch, showDeletedEvents]);

  // Filtered Registrations by Debounced Search (Name OR Email OR Contact)
  const filteredRegistrations = useMemo(() => {
    if (!debouncedRegSearch) return registrations;
    const q = debouncedRegSearch.toLowerCase();
    return registrations.filter((r) => {
      const matchName = r.fullName?.toLowerCase().includes(q);
      const matchEmail = r.email?.toLowerCase().includes(q);
      const matchPhone = r.contactNumber?.toLowerCase().includes(q);
      const matchEvent = r.event?.title?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchEvent;
    });
  }, [registrations, debouncedRegSearch]);

  // Paginated Registrations
  const totalRegPages = Math.max(1, Math.ceil(filteredRegistrations.length / regPageSize));
  const paginatedRegistrations = useMemo(() => {
    const start = (regPage - 1) * regPageSize;
    return filteredRegistrations.slice(start, start + regPageSize);
  }, [filteredRegistrations, regPage, regPageSize]);

  // Reset regPage when search, page size, or selectedEventId changes
  useEffect(() => {
    setRegPage(1);
  }, [debouncedRegSearch, selectedEventId, regPageSize]);

  // Occupancy Watchlist for Overview Tab: events >= 75% or sold out
  const highOccupancyEvents = useMemo(() => {
    return events
      .filter((e) => !e.isDeleted)
      .map((e) => ({
        ...e,
        percent: Math.min(100, Math.round(((e.registeredCount || 0) / (e.capacity || 1)) * 100)),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5);
  }, [events]);

  // Export Roster to CSV
  const exportMasterCSV = () => {
    if (!filteredRegistrations.length) {
      alert('No registration records available to export.');
      return;
    }

    const headers = [
      '#',
      'Attendee Name',
      'Email Address',
      'Mobile Number (India)',
      'Event Name',
      'Category',
      'Campus Venue',
      'Registration Date',
      'Ticket Code',
      'Status',
    ];

    const rows = filteredRegistrations.map((r, i) => [
      i + 1,
      `"${r.fullName || ''}"`,
      `"${r.email || ''}"`,
      `"+91 ${r.contactNumber || ''}"`,
      `"${r.event?.title || 'Event'}"`,
      `"${r.event?.category || 'Cultural'}"`,
      `"${r.event?.venue || ''}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`,
      `"#REG-${r._id ? r._id.slice(-6).toUpperCase() : 'PASS'}"`,
      r.event?.isDeleted ? `"Archived (Event Deleted)"` : `"Verified"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = selectedEvent
      ? `EventFlow_${selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_Attendees_${new Date().toISOString().slice(0, 10)}.csv`
      : `EventFlow_All_Attendees_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Enterprise Underline Tabs Navigation
  const tabsConfig = [
    { id: 'overview', label: 'Overview', count: stats.totalEvents },
    { id: 'events', label: 'Event Management', count: events.length },
    { id: 'registrations', label: 'Registrations', count: stats.totalRegistrations },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans pb-16 selection:bg-slate-200">
      {/* 1. TOP BAR HEADER: Simple top bar, logo left, subtle user menu right with Sign Out */}
      <AdminHeader onLogout={handleLogout} />

      {/* Main Content Workspace */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 2. PAGE HEADER: Title and subtitle on left, primary button "Create Event" on right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[24px] font-semibold text-[#111827] tracking-[-0.01em] leading-tight">
              Event Management
            </h1>
            <p className="text-[14px] text-[#6B7280] font-normal mt-1">
              Manage campus event schedules, venue capacity, and student registrations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Create Event
            </Button>
          </div>
        </div>

        {/* 3. TOP SUMMARY CARDS (3 cards, 1px border, no colored icon boxes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Events"
            value={stats.totalEvents}
            helperText={`${stats.pastEvents} concluded · ${stats.fullEvents || 0} full capacity`}
          />
          <StatCard
            label="Total Registrations"
            value={stats.totalRegistrations}
            helperText="Across all active scheduled campus events"
          />
          <StatCard
            label="Upcoming Events"
            value={stats.upcomingEvents}
            helperText="Scheduled campus events open for registration"
          />
        </div>

        {/* 4. UNDERLINE-STYLE TABS NAVIGATION (Overview, Event Management, Registrations) */}
        <Tabs
          tabs={tabsConfig}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          className="mb-6"
        />

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Category Distribution Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Cultural Category
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[22px] font-semibold text-[#111827] tabular-nums">
                    {stats.categories?.cultural || 0}
                  </span>
                  <CategoryBadge category="Cultural" />
                </div>
                <span className="text-[12px] text-[#6B7280] mt-1 block">
                  Arts, music, dance performances
                </span>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Technical Category
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[22px] font-semibold text-[#111827] tabular-nums">
                    {stats.categories?.technical || 0}
                  </span>
                  <CategoryBadge category="Technical" />
                </div>
                <span className="text-[12px] text-[#6B7280] mt-1 block">
                  Hackathons, robotics, AI summits
                </span>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Sports Category
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[22px] font-semibold text-[#111827] tabular-nums">
                    {stats.categories?.sports || 0}
                  </span>
                  <CategoryBadge category="Sports" />
                </div>
                <span className="text-[12px] text-[#6B7280] mt-1 block">
                  Athletics, tournaments, field matches
                </span>
              </div>
            </div>

            {/* Capacity & Attendance Watchlist */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F3F4F6]">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#111827] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 stroke-[1.5] text-[#6B7280]" />
                    <span>Capacity &amp; Occupancy Watchlist</span>
                  </h2>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">
                    Highest occupancy campus events currently scheduled.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('events')}
                >
                  View All in Event Management
                </Button>
              </div>

              <div className="divide-y divide-[#F3F4F6]">
                {highOccupancyEvents.length === 0 ? (
                  <div className="py-6 text-center text-[#6B7280] text-[13px]">
                    No active events currently scheduled.
                  </div>
                ) : (
                  highOccupancyEvents.map((ev) => (
                    <div key={ev._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[13px] text-[#111827] truncate">
                            {ev.title}
                          </span>
                          <CategoryBadge category={ev.category} />
                        </div>
                        <span className="text-[12px] text-[#6B7280] truncate block mt-0.5">
                          {ev.venue} · {ev.registeredCount || 0} of {ev.capacity} seats filled
                        </span>
                      </div>

                      <div className="flex items-center gap-4 sm:justify-end shrink-0">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-[#6B7280]">Occupancy</span>
                            <span className="font-semibold text-[#111827] tabular-nums">{ev.percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                ev.percent >= 100
                                  ? 'bg-[#EF4444]'
                                  : ev.percent >= 80
                                  ? 'bg-[#F59E0B]'
                                  : 'bg-[#0F172A]'
                              }`}
                              style={{ width: `${ev.percent}%` }}
                            />
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenDrawer(ev)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Registrations Quick Table */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#111827]">
                    Recent Registrations
                  </h2>
                  <p className="text-[12px] text-[#6B7280]">
                    Latest student attendee passes confirmed across campus events.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('registrations')}
                >
                  View All Registrations ({stats.totalRegistrations})
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <TableHeader>
                    <tr>
                      <TableHead>Attendee Name</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Associated Event</TableHead>
                      <TableHead>Registered On</TableHead>
                      <TableHead align="right">Status</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {registrations.slice(0, 5).map((reg) => (
                      <TableRow key={reg._id}>
                        <TableCell className="font-semibold text-[#111827] text-[13px] whitespace-nowrap">
                          {reg.fullName}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#6B7280] whitespace-nowrap">
                          {reg.email}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#111827] font-medium whitespace-nowrap">
                          {reg.event?.title || 'Event'}
                        </TableCell>
                        <TableCell className="text-[12px] text-[#6B7280] tabular-nums whitespace-nowrap">
                          {new Date(reg.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell align="right" className="whitespace-nowrap">
                          <span className="inline-flex items-center text-[12px] font-medium text-[#374151]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-2 shrink-0" />
                            <span>Verified</span>
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: EVENT MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Filter & Search Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Segmented control for categories */}
              <div className="bg-[#F3F4F6] p-1 rounded-[8px] inline-flex items-center gap-1 self-start">
                {[
                  { key: 'all', label: 'All', count: events.filter((e) => !e.isDeleted).length },
                  { key: 'Cultural', label: 'Cultural', count: culturalCount },
                  { key: 'Technical', label: 'Technical', count: technicalCount },
                  { key: 'Sports', label: 'Sports', count: sportsCount },
                ].map(({ key, label, count }) => {
                  const isActive = eventCategoryFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEventCategoryFilter(key)}
                      className={`px-3 py-1.5 text-[13px] rounded-[6px] transition-all cursor-pointer font-medium select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] ${
                        isActive
                          ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-[#E5E7EB]'
                          : 'text-[#6B7280] hover:text-[#111827] border border-transparent'
                      }`}
                    >
                      <span>{label}</span>
                      <span
                        className={`ml-1.5 text-[11px] tabular-nums ${
                          isActive ? 'text-[#111827] font-semibold' : 'text-[#6B7280]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right side: Search, Status select, Show Deleted toggle, Refresh button (all 36px) */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                    <Search className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search events..."
                    className="w-full h-9 pl-9 pr-8 text-[13px] rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                  />
                  {eventSearch && (
                    <button
                      type="button"
                      onClick={() => setEventSearch('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#9CA3AF] hover:text-[#111827]"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  )}
                </div>

                {/* Status Select */}
                <select
                  value={eventStatusFilter}
                  onChange={(e) => setEventStatusFilter(e.target.value)}
                  className="h-9 px-3 text-[13px] font-medium text-[#111827] bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="filling">Filling Fast</option>
                  <option value="full">Sold Out</option>
                  <option value="past">Concluded</option>
                  <option value="cancelled">Soft-Deleted / Cancelled</option>
                </select>

                {/* Show Deleted Events Audit Toggle */}
                <label className="inline-flex items-center gap-1.5 h-9 px-2.5 text-[12px] font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-[8px] cursor-pointer select-none hover:bg-[#F9FAFB]">
                  <input
                    type="checkbox"
                    checked={showDeletedEvents}
                    onChange={(e) => setShowDeletedEvents(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-[4px] border-[#D1D5DB] text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                  />
                  <span>Show Deleted ({stats.deletedEvents || 0})</span>
                </label>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={() => {
                    fetchStats();
                    fetchEvents();
                  }}
                  title="Refresh events"
                  aria-label="Refresh events"
                  className="w-9 h-9 rounded-[8px] border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Event Management Table */}
            <Table>
              {eventsLoading ? (
                <TableLoadingState message="Loading campus events..." />
              ) : filteredEvents.length === 0 ? (
                <TableEmptyState
                  icon={Calendar}
                  title="No events found"
                  description="No events match your current filter or search criteria."
                  action={
                    (eventSearch || eventCategoryFilter !== 'all' || eventStatusFilter !== 'all' || showDeletedEvents) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEventSearch('');
                          setEventCategoryFilter('all');
                          setEventStatusFilter('all');
                          setShowDeletedEvents(false);
                        }}
                      >
                        Reset filters
                      </Button>
                    )
                  }
                />
              ) : (
                <>
                  <table className="w-full text-left border-collapse">
                    <TableHeader>
                      <tr>
                        <TableHead>Event</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date &amp; Time</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead align="right">Actions</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {paginatedEvents.map((ev) => {
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

                        // Progress bar color: neutral dark navy normally, amber over 80%, red at 100%
                        let progressBarColor = 'bg-[#0F172A]';
                        if (ev.isDeleted) {
                          progressBarColor = 'bg-[#9CA3AF]';
                        } else if (ev.status === 'FULL' || capacityPercent >= 100) {
                          progressBarColor = 'bg-[#EF4444]';
                        } else if (capacityPercent >= 80) {
                          progressBarColor = 'bg-[#F59E0B]';
                        }

                        return (
                          <TableRow key={ev._id} className={ev.isDeleted ? 'bg-[#FAFAFA] opacity-75' : ''}>
                            {/* Event Column: 40px rounded-6 thumbnail, title, one-line description */}
                            <TableCell className="max-w-[280px]">
                              <div className="flex items-center gap-3">
                                <img
                                  src={ev.imageUrl}
                                  alt=""
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                                  }}
                                  className="w-10 h-10 rounded-[6px] object-cover shrink-0 border border-[#E5E7EB]"
                                />
                                <div className="min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDrawer(ev)}
                                    title={ev.title}
                                    className="font-medium text-[13px] text-[#111827] hover:text-[#0F172A] hover:underline truncate block text-left transition-colors cursor-pointer"
                                  >
                                    <span className="truncate">{ev.title}</span>
                                  </button>
                                  <span
                                    title={ev.description}
                                    className="text-[12px] text-[#6B7280] font-normal truncate block mt-0.5"
                                  >
                                    {ev.description}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Category Column: Plain neutral gray text-only tag */}
                            <TableCell className="whitespace-nowrap">
                              <CategoryBadge category={ev.category} />
                            </TableCell>

                            {/* Date & Time Column: Tabular numbers */}
                            <TableCell className="whitespace-nowrap">
                              <span className="text-[13px] font-medium text-[#111827] tabular-nums block">
                                {dateFormatted}
                              </span>
                              <span className="text-[12px] text-[#6B7280] tabular-nums block mt-0.5">
                                {timeFormatted}
                              </span>
                            </TableCell>

                            {/* Venue Column */}
                            <TableCell className="whitespace-nowrap">
                              <span
                                title={ev.venue}
                                className="text-[13px] text-[#111827] font-normal truncate max-w-[170px] block"
                              >
                                {ev.venue}
                              </span>
                            </TableCell>

                            {/* Attendance Column: "75 / 120" with slim 4px progress bar */}
                            <TableCell className="whitespace-nowrap">
                              <div className="w-28">
                                <div className="flex items-center justify-between text-[13px] font-medium tabular-nums text-[#111827] mb-1">
                                  <span>
                                    {ev.registeredCount || 0} / {ev.capacity}
                                  </span>
                                  <span className="text-[11px] text-[#6B7280] font-normal">
                                    {capacityPercent}%
                                  </span>
                                </div>
                                <div className="w-full h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
                                    style={{ width: `${capacityPercent}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>

                            {/* Status Column: 6px colored dot + text */}
                            <TableCell className="whitespace-nowrap">
                              <StatusBadge
                                status={ev.status}
                                seatsLeft={ev.seatsLeft}
                                capacity={ev.capacity}
                                registeredCount={ev.registeredCount}
                              />
                            </TableCell>

                            {/* Actions Column: Ghost icon buttons with tooltips */}
                            <TableCell align="right" className="whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDrawer(ev)}
                                  aria-label={`View details for ${ev.title}`}
                                  title="View Event Details"
                                  className="w-8 h-8 rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 stroke-[1.5]" />
                                </button>

                                {!ev.isDeleted ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(ev)}
                                      aria-label={`Edit ${ev.title}`}
                                      title="Edit Event"
                                      className="w-8 h-8 rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="w-4 h-4 stroke-[1.5]" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDelete(ev)}
                                      aria-label={`Delete ${ev.title}`}
                                      title="Delete Event (Soft Delete)"
                                      className="w-8 h-8 rounded-[6px] text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRestoreEvent(ev)}
                                    aria-label={`Restore ${ev.title}`}
                                    title="Restore Deleted Event"
                                    className="w-8 h-8 rounded-[6px] text-[#10B981] hover:bg-[#ECFDF5] flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <RotateCcw className="w-4 h-4 stroke-[1.5]" />
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </table>

                  {/* Pagination Footer */}
                  <Pagination
                    currentPage={eventPage}
                    totalPages={totalEventPages}
                    totalItems={filteredEvents.length}
                    pageSize={eventPageSize}
                    pageSizeOptions={[10, 25, 50]}
                    onPageChange={(p) => setEventPage(p)}
                    onPageSizeChange={(sz) => {
                      setEventPageSize(sz);
                      setEventPage(1);
                    }}
                    itemName="events"
                  />
                </>
              )}
            </Table>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: REGISTRATIONS */}
        {/* ======================================================== */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            {/* Header line for selected event */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F3F4F6]">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#111827]">
                    Event Registration Roster
                  </h2>
                  <p className="text-[13px] text-[#4B5563] mt-0.5">
                    {selectedEvent
                      ? `Total registrations: ${selectedEvent.registeredCount || 0} / ${selectedEvent.capacity} seats (${Math.min(100, Math.round(((selectedEvent.registeredCount || 0) / (selectedEvent.capacity || 1)) * 100))}% filled)`
                      : `Total registrations: ${stats.totalRegistrations} across all ${events.filter((e) => !e.isDeleted).length} active campus events`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedEventId && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedEventId('')}
                    >
                      View All Events ({stats.totalRegistrations})
                    </Button>
                  )}
                </div>
              </div>

              {/* Grid of Event Registration Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* "All Campus Events" card */}
                <button
                  type="button"
                  onClick={() => setSelectedEventId('')}
                  className={`text-left p-3.5 rounded-[8px] border transition-all cursor-pointer flex flex-col justify-between ${
                    !selectedEventId
                      ? 'border-[#0F172A] bg-[#F8FAFC] shadow-sm ring-1 ring-[#0F172A]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                        Global View
                      </span>
                      {!selectedEventId && (
                        <span className="text-[11px] font-medium text-[#0F172A] bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded-[4px]">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] font-semibold text-[#111827] truncate">
                      All Campus Events
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#F3F4F6]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[20px] font-semibold text-[#111827] tabular-nums">
                        {stats.totalRegistrations}
                      </span>
                      <span className="text-[12px] text-[#6B7280]">
                        total registrations
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7280] mt-0.5">
                      Across {events.filter((e) => !e.isDeleted).length} active events
                    </div>
                  </div>
                </button>

                {/* Individual Event Cards */}
                {events
                  .filter((ev) => !ev.isDeleted)
                  .map((ev) => {
                    const isSelected = selectedEventId === ev._id;
                    const regCount = ev.registeredCount || 0;
                    const cap = ev.capacity || 1;
                    const pct = Math.min(100, Math.round((regCount / cap) * 100));

                    return (
                      <button
                        key={ev._id}
                        type="button"
                        onClick={() => setSelectedEventId(ev._id)}
                        className={`text-left p-3.5 rounded-[8px] border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#0F172A] bg-[#F8FAFC] shadow-sm ring-1 ring-[#0F172A]'
                            : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#FAFAFA]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <CategoryBadge category={ev.category} />
                            {isSelected && (
                              <span className="text-[11px] font-medium text-[#0F172A] bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded-[4px]">
                                Active
                              </span>
                            )}
                          </div>
                          <div
                            title={ev.title}
                            className="text-[13px] font-semibold text-[#111827] truncate"
                          >
                            {ev.title}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#F3F4F6]">
                          <div className="flex items-baseline justify-between text-[12px] mb-1">
                            <span className="text-[#111827] font-semibold tabular-nums text-[16px]">
                              {regCount}
                              <span className="text-[12px] font-normal text-[#6B7280] ml-1">
                                / {cap}
                              </span>
                            </span>
                            <span className="text-[11px] font-medium text-[#6B7280] tabular-nums">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                pct >= 100
                                  ? 'bg-[#EF4444]'
                                  : pct >= 80
                                  ? 'bg-[#F59E0B]'
                                  : 'bg-[#0F172A]'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Selected Event Filter Banner */}
            {selectedEvent && (
              <div className="p-3.5 rounded-[8px] bg-white border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0F172A]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#6B7280] font-medium">Selected Event:</span>
                      <span className="text-[13px] font-semibold text-[#111827]">{selectedEvent.title}</span>
                      <CategoryBadge category={selectedEvent.category} />
                    </div>
                    <span className="text-[12px] text-[#6B7280]">
                      Venue: {selectedEvent.venue} · Total registrations:{' '}
                      <strong className="text-[#111827] font-semibold tabular-nums">
                        {selectedEvent.registeredCount || 0}
                      </strong>{' '}
                      / {selectedEvent.capacity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={X}
                    onClick={() => setSelectedEventId('')}
                  >
                    View All Registrations
                  </Button>
                </div>
              </div>
            )}

            {/* Registrations Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                {/* Search input (case-insensitive, 300ms debounced) */}
                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                    <Search className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <input
                    type="text"
                    value={regSearchInput}
                    onChange={(e) => setRegSearchInput(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full h-9 pl-9 pr-8 text-[13px] rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                  />
                  {regSearchInput && (
                    <button
                      type="button"
                      onClick={() => setRegSearchInput('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#9CA3AF] hover:text-[#111827]"
                      aria-label="Clear student search"
                    >
                      <X className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  )}
                </div>

                {/* Event dropdown selector */}
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full sm:w-72 h-9 px-3 text-[13px] font-medium text-[#111827] bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] cursor-pointer"
                >
                  <option value="">All Events ({stats.totalRegistrations} total)</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      [{ev.category || 'Event'}] {ev.title} ({ev.registeredCount || 0} / {ev.capacity})
                      {ev.isDeleted ? ' [Deleted]' : ''}
                    </option>
                  ))}
                </select>

                {selectedEventId && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setSelectedEventId('')}
                  >
                    View All
                  </Button>
                )}

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={() => {
                    fetchStats();
                    fetchEvents();
                    fetchRegistrations();
                  }}
                  title="Refresh registrations"
                  aria-label="Refresh registrations"
                  className="w-9 h-9 rounded-[8px] border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>

              {/* CSV Export & Counter */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span className="text-[13px] text-[#6B7280] tabular-nums">
                  Showing: <strong className="font-semibold text-[#111827]">{filteredRegistrations.length}</strong> of{' '}
                  <strong className="font-semibold text-[#111827]">{registrations.length}</strong>
                </span>

                {filteredRegistrations.length > 0 && (
                  <Button
                    variant="secondary"
                    size="md"
                    icon={Download}
                    onClick={exportMasterCSV}
                  >
                    Export CSV
                  </Button>
                )}
              </div>
            </div>

            {/* Dense Registrations Table */}
            <Table>
              {regLoading ? (
                <TableLoadingState message="Loading attendee records..." />
              ) : filteredRegistrations.length === 0 ? (
                <TableEmptyState
                  icon={Users}
                  title={
                    debouncedRegSearch
                      ? 'No results match your search'
                      : 'No registrations yet'
                  }
                  description={
                    debouncedRegSearch
                      ? `No attendee records found matching "${debouncedRegSearch}". Try a different name or email.`
                      : selectedEvent
                      ? 'No student registrations recorded for this event yet.'
                      : 'No active student registrations currently exist.'
                  }
                  action={
                    (debouncedRegSearch || selectedEventId) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setRegSearchInput('');
                          setSelectedEventId('');
                        }}
                      >
                        Reset Search &amp; View All
                      </Button>
                    )
                  }
                />
              ) : (
                <>
                  <table className="w-full text-left border-collapse">
                    <TableHeader>
                      <tr>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact Number</TableHead>
                        <TableHead>Associated Event</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Registered On</TableHead>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead align="right">Status</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {paginatedRegistrations.map((reg) => {
                        const regDateObj = new Date(reg.createdAt);
                        const regDate = regDateObj.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                        const regTime = regDateObj.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        });

                        const isArchived = reg.event?.isDeleted;

                        return (
                          <TableRow key={reg._id} className={isArchived ? 'bg-[#FAFAFA]' : ''}>
                            {/* Name */}
                            <TableCell className="font-semibold text-[#111827] text-[13px] whitespace-nowrap">
                              {reg.fullName}
                            </TableCell>

                            {/* Email */}
                            <TableCell className="text-[13px] text-[#111827] font-normal whitespace-nowrap">
                              <a
                                href={`mailto:${reg.email}`}
                                className="hover:underline hover:text-[#0F172A]"
                                title={`Email ${reg.fullName}`}
                              >
                                {reg.email}
                              </a>
                            </TableCell>

                            {/* Contact Number */}
                            <TableCell className="text-[13px] text-[#111827] font-medium tabular-nums whitespace-nowrap">
                              <a
                                href={`tel:${reg.contactNumber}`}
                                className="hover:underline hover:text-[#0F172A]"
                                title={`Call +91 ${reg.contactNumber}`}
                              >
                                +91 {reg.contactNumber}
                              </a>
                            </TableCell>

                            {/* Associated Event */}
                            <TableCell>
                              {reg.event ? (
                                <div className="max-w-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-[13px] text-[#111827] truncate">
                                      {reg.event.title}
                                    </span>
                                    {isArchived && (
                                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5] uppercase tracking-wide shrink-0">
                                        Event deleted
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[12px] text-[#6B7280] block truncate mt-0.5">
                                    {reg.event.venue}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[#9CA3AF] text-[13px] italic">Archived Record</span>
                              )}
                            </TableCell>

                            {/* Category */}
                            <TableCell className="whitespace-nowrap">
                              <CategoryBadge category={reg.event?.category} />
                            </TableCell>

                            {/* Registered On */}
                            <TableCell className="whitespace-nowrap tabular-nums text-[13px] text-[#111827]">
                              <span>{regDate}</span>
                              <span className="text-[11px] text-[#6B7280] block mt-0.5">{regTime}</span>
                            </TableCell>

                            {/* Ticket ID */}
                            <TableCell className="whitespace-nowrap font-mono text-[12px] text-[#374151]">
                              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F3F4F6] border border-[#E5E7EB] tabular-nums font-medium">
                                #REG-{reg._id ? reg._id.slice(-6).toUpperCase() : 'PASS'}
                              </span>
                            </TableCell>

                            {/* Status */}
                            <TableCell align="right" className="whitespace-nowrap">
                              {isArchived ? (
                                <span className="inline-flex items-center text-[12px] font-medium text-[#6B7280]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] mr-2 shrink-0" />
                                  <span>Archived</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[12px] font-medium text-[#374151]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-2 shrink-0" />
                                  <span>Verified</span>
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </table>

                  {/* Pagination Footer */}
                  <Pagination
                    currentPage={regPage}
                    totalPages={totalRegPages}
                    totalItems={filteredRegistrations.length}
                    pageSize={regPageSize}
                    pageSizeOptions={[10, 25, 50]}
                    onPageChange={(p) => setRegPage(p)}
                    onPageSizeChange={(sz) => {
                      setRegPageSize(sz);
                      setRegPage(1);
                    }}
                    itemName="attendees"
                  />
                </>
              )}
            </Table>
          </div>
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

      {/* MODAL 2: Delete Confirmation Modal */}
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

      {/* DRAWER: Event Detail Drawer */}
      <EventDetailDrawer
        isOpen={drawerOpen}
        event={drawerEvent}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerEvent(null);
        }}
        onEdit={(event) => {
          setDrawerOpen(false);
          handleOpenEdit(event);
        }}
        onViewRoster={(event) => {
          setDrawerOpen(false);
          handleJumpToRoster(event);
        }}
        onRestore={handleRestoreEvent}
      />

      {/* TOAST: Enterprise Notification Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

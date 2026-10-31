import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  X,
  Calendar,
  Download,
} from 'lucide-react';
import api from '../../api/client';
import {
  AdminAppShell,
  StatCard,
  StatusBadge,
  CategoryBadge,
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
  RowActionMenu,
  Toast,
  EventDetailDrawer,
} from '../../components/admin/enterprise';
import EventFormModal from '../../components/admin/EventFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

/**
 * EventFlow Admin Dashboard (Linear / Stripe / Vercel layout)
 * - 240px Left sidebar with text-only nav items (Overview, Events, Registrations)
 * - 56px Slim top bar with breadcrumb on left & user menu on right
 * - 1280px max-width workspace with 24px padding and 24px gap
 * - 3 equal-width stat cards + compact upcoming events list on Overview
 * - Single-row toolbar & clean table on Events and Registrations tabs
 */
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

  // Toast notification state (top-right, auto-dismiss 4s)
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
        ? `Updated "${savedEvent?.title || 'event'}".`
        : `Created "${savedEvent?.title || 'new event'}".`
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
        `Deleted "${eventToDelete.title}". ${affected} registrations archived.`
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
      showToast('success', `Restored "${event.title}" to catalog.`);
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

  // Next 5 upcoming events for Overview list
  const upcomingEventsList = useMemo(() => {
    return events
      .filter((e) => !e.isDeleted && e.status !== 'PAST')
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, 5);
  }, [events]);

  // Export Roster to CSV
  const exportMasterCSV = () => {
    if (!filteredRegistrations.length) {
      showToast('error', 'No registration records available to export.');
      return;
    }

    const headers = [
      '#',
      'Attendee Name',
      'Email Address',
      'Contact Number',
      'Event Name',
      'Category',
      'Venue',
      'Registration Date',
      'Status',
    ];

    const rows = filteredRegistrations.map((r, i) => [
      i + 1,
      `"${r.fullName || ''}"`,
      `"${r.email || ''}"`,
      `"${r.contactNumber || ''}"`,
      `"${r.event?.title || 'Event'}"`,
      `"${r.event?.category || 'Cultural'}"`,
      `"${r.event?.venue || ''}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`,
      r.event?.isDeleted ? `"Archived"` : `"Active"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = selectedEvent
      ? `EventFlow_${selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_Attendees.csv`
      : `EventFlow_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV export generated successfully.');
  };

  return (
    <AdminAppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {/* ======================================================== */}
      {/* 1. OVERVIEW TAB                                          */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] leading-[32px] font-semibold text-[#0F172A] tracking-[-0.01em]">
                Overview
              </h1>
              <p className="text-[14px] leading-[20px] text-[#64748B] mt-0.5 font-normal">
                Campus event schedule, attendance metrics, and quick summaries.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Create Event
            </Button>
          </div>

          {/* 3 Equal-width Stat Cards (Stack on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total Events"
              value={stats.totalEvents}
              helperText={`${stats.pastEvents} concluded · ${stats.fullEvents || 0} at full capacity`}
            />
            <StatCard
              label="Total Registrations"
              value={stats.totalRegistrations}
              helperText="Across all active campus events"
            />
            <StatCard
              label="Upcoming Events"
              value={stats.upcomingEvents}
              helperText="Scheduled events open for registration"
            />
          </div>

          {/* Compact "Upcoming events" list (next 5) */}
          <div className="bg-white rounded-[8px] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-[16px] leading-[24px] font-semibold text-[#0F172A]">
                  Upcoming events
                </h2>
                <p className="text-[12px] leading-[16px] text-[#64748B]">
                  Next scheduled campus events by date.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className="text-[13px] font-medium text-[#0F172A] hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>

            {upcomingEventsList.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-[#64748B]">
                No upcoming events scheduled.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {upcomingEventsList.map((ev) => {
                  const evDate = new Date(ev.dateTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                  const evTime = new Date(ev.dateTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  const regCount = ev.registeredCount || 0;
                  const cap = ev.capacity || 1;
                  const pct = Math.min(100, Math.round((regCount / cap) * 100));

                  let barColor = 'bg-[#0F172A]';
                  if (pct >= 100) barColor = 'bg-[#DC2626]';
                  else if (pct >= 80) barColor = 'bg-[#D97706]';

                  return (
                    <div
                      key={ev._id}
                      onClick={() => handleOpenDrawer(ev)}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] -mx-2 px-2 rounded-[6px] transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="text-[12px] text-[#64748B] tabular-nums shrink-0 w-16">
                          <div>{evDate}</div>
                          <div className="text-[11px] text-[#64748B]">{evTime}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] leading-[20px] font-medium text-[#0F172A] truncate">
                            {ev.title}
                          </div>
                          <div className="text-[12px] text-[#64748B] truncate">
                            {ev.venue} · {ev.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="w-24 text-right">
                          <div className="text-[12px] font-medium text-[#0F172A] tabular-nums">
                            {regCount} / {cap}
                          </div>
                          <div className="w-full h-1 bg-[#F1F5F9] rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <StatusBadge
                          status={ev.status}
                          seatsLeft={ev.seatsLeft}
                          capacity={ev.capacity}
                          registeredCount={ev.registeredCount}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. EVENTS TABLE TAB                                      */}
      {/* ======================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-[24px] leading-[32px] font-semibold text-[#0F172A] tracking-[-0.01em]">
                Events
              </h1>
              <p className="text-[14px] leading-[20px] text-[#64748B] font-normal">
                Manage campus events, schedules, capacity, and status.
              </p>
            </div>
          </div>

          {/* Single-row Toolbar (Search, Category, Status, Refresh, Create Event) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search input (left, 320px) */}
              <div className="relative w-full md:w-[320px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Search events..."
                  className="w-full h-[36px] pl-9 pr-8 text-[14px] rounded-[6px] border border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#64748B] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
                {eventSearch && (
                  <button
                    type="button"
                    onClick={() => setEventSearch('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#64748B] hover:text-[#0F172A]"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Select Dropdown */}
              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="h-[36px] px-3 text-[14px] font-normal text-[#0F172A] bg-white border border-[#E2E8F0] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
              >
                <option value="all">All categories</option>
                <option value="Cultural">Cultural</option>
                <option value="Technical">Technical</option>
                <option value="Sports">Sports</option>
              </select>

              {/* Status Select Dropdown */}
              <select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                className="h-[36px] px-3 text-[14px] font-normal text-[#0F172A] bg-white border border-[#E2E8F0] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="filling">Filling fast</option>
                <option value="full">Full</option>
                <option value="past">Past</option>
                <option value="cancelled">Soft-deleted</option>
              </select>

              {/* Refresh button */}
              <button
                type="button"
                onClick={() => {
                  fetchStats();
                  fetchEvents();
                }}
                title="Refresh events"
                aria-label="Refresh events"
                className="w-[36px] h-[36px] rounded-[6px] border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Primary "Create Event" button on right */}
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
              className="shrink-0"
            >
              Create Event
            </Button>
          </div>

          {/* Events Data Table */}
          <Table>
            {eventsLoading ? (
              <TableLoadingState rows={6} cols={7} />
            ) : filteredEvents.length === 0 ? (
              <TableEmptyState
                title="No events found"
                description="Try adjusting your search query or filters."
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
                      const evDate = new Date(ev.dateTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      const evTime = new Date(ev.dateTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      });

                      const regCount = ev.registeredCount || 0;
                      const cap = ev.capacity || 1;
                      const pct = Math.min(100, Math.round((regCount / cap) * 100));

                      let barColor = 'bg-[#0F172A]';
                      if (ev.isDeleted) {
                        barColor = 'bg-[#64748B]';
                      } else if (pct >= 100) {
                        barColor = 'bg-[#DC2626]';
                      } else if (pct >= 80) {
                        barColor = 'bg-[#D97706]';
                      }

                      return (
                        <TableRow
                          key={ev._id}
                          className={ev.isDeleted ? 'bg-[#F8FAFC] opacity-75' : ''}
                        >
                          {/* Column 1: Event (40px thumbnail, 6px radius) */}
                          <TableCell className="max-w-[280px]">
                            <div className="flex items-center gap-3">
                              <img
                                src={ev.imageUrl}
                                alt=""
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80';
                                }}
                                className="w-10 h-10 rounded-[6px] object-cover shrink-0 border border-[#E2E8F0]"
                              />
                              <div className="min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDrawer(ev)}
                                  title={ev.title}
                                  className="font-medium text-[14px] leading-[20px] text-[#0F172A] hover:underline truncate block text-left transition-colors cursor-pointer"
                                >
                                  {ev.title}
                                </button>
                                <span
                                  title={ev.description}
                                  className="text-[12px] leading-[16px] text-[#64748B] font-normal truncate block"
                                >
                                  {ev.description}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Column 2: Category (plain gray text) */}
                          <TableCell className="whitespace-nowrap">
                            <CategoryBadge category={ev.category} />
                          </TableCell>

                          {/* Column 3: Date & Time (Date line 1, Time line 2 in muted gray) */}
                          <TableCell className="whitespace-nowrap tabular-nums">
                            <span className="text-[14px] leading-[20px] font-normal text-[#0F172A] block">
                              {evDate}
                            </span>
                            <span className="text-[12px] leading-[16px] text-[#64748B] block">
                              {evTime}
                            </span>
                          </TableCell>

                          {/* Column 4: Venue (plain text, ellipsis + tooltip) */}
                          <TableCell className="whitespace-nowrap">
                            <span
                              title={ev.venue}
                              className="text-[14px] leading-[20px] text-[#0F172A] font-normal truncate max-w-[170px] block"
                            >
                              {ev.venue}
                            </span>
                          </TableCell>

                          {/* Column 5: Attendance (75 / 120 and 4px bar) */}
                          <TableCell className="whitespace-nowrap">
                            <div className="w-28">
                              <div className="text-[13px] font-normal tabular-nums text-[#0F172A] mb-1">
                                {regCount} / {cap}
                              </div>
                              <div className="w-full h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>

                          {/* Column 6: Status (6px dot + text) */}
                          <TableCell className="whitespace-nowrap">
                            <StatusBadge
                              status={ev.status}
                              seatsLeft={ev.seatsLeft}
                              capacity={ev.capacity}
                              registeredCount={ev.registeredCount}
                              isDeleted={ev.isDeleted}
                            />
                          </TableCell>

                          {/* Column 7: Actions ("..." row menu) */}
                          <TableCell align="right" className="whitespace-nowrap">
                            <RowActionMenu
                              event={ev}
                              onView={handleOpenDrawer}
                              onEdit={handleOpenEdit}
                              onDelete={handleOpenDelete}
                              onRestore={handleRestoreEvent}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </table>

                {/* Pagination */}
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
                />
              </>
            )}
          </Table>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. REGISTRATIONS TAB                                     */}
      {/* ======================================================== */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          {/* Top Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-[24px] leading-[32px] font-semibold text-[#0F172A] tracking-[-0.01em]">
                Registrations
              </h1>
              <p className="text-[14px] leading-[20px] text-[#64748B] font-normal">
                View student pass holders and export verified rosters.
              </p>
            </div>
          </div>

          {/* Event Selector Dropdown at Top + Muted Summary Text */}
          <div className="bg-white rounded-[8px] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label htmlFor="reg-event-select" className="text-[13px] font-medium text-[#0F172A] whitespace-nowrap">
                Event filter:
              </label>
              <select
                id="reg-event-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="h-[36px] px-3 text-[14px] font-normal text-[#0F172A] bg-white border border-[#E2E8F0] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] cursor-pointer max-w-sm"
              >
                <option value="">All events ({stats.totalRegistrations} total)</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} ({ev.registeredCount || 0} / {ev.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[13px] text-[#64748B]">
              {selectedEvent ? (
                <span>
                  Total registrations: <strong className="font-medium text-[#0F172A] tabular-nums">{selectedEvent.registeredCount || 0}</strong> / {selectedEvent.capacity} capacity
                </span>
              ) : (
                <span>
                  Total registrations: <strong className="font-medium text-[#0F172A] tabular-nums">{stats.totalRegistrations}</strong> across all active events
                </span>
              )}
            </div>
          </div>

          {/* Single-row Toolbar: Search (debounced 300ms) + Export CSV */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-[320px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={regSearchInput}
                onChange={(e) => setRegSearchInput(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full h-[36px] pl-9 pr-8 text-[14px] rounded-[6px] border border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#64748B] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
              {regSearchInput && (
                <button
                  type="button"
                  onClick={() => setRegSearchInput('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#64748B] hover:text-[#0F172A]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Export CSV secondary button */}
            <Button
              variant="secondary"
              size="md"
              icon={Download}
              onClick={exportMasterCSV}
              className="w-full sm:w-auto shrink-0"
            >
              Export CSV
            </Button>
          </div>

          {/* Registrations Data Table */}
          <Table>
            {regLoading ? (
              <TableLoadingState rows={6} cols={4} />
            ) : filteredRegistrations.length === 0 ? (
              <TableEmptyState
                title="No registrations found"
                description={
                  debouncedRegSearch
                    ? `No registrations match "${debouncedRegSearch}".`
                    : selectedEvent
                    ? `No students have registered for "${selectedEvent.title}" yet.`
                    : 'No registration records currently available.'
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
                      Clear filters
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
                      <TableHead>Registered On</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {paginatedRegistrations.map((reg) => (
                      <TableRow key={reg._id}>
                        {/* Column 1: Name */}
                        <TableCell className="font-medium text-[#0F172A] whitespace-nowrap">
                          {reg.fullName}
                        </TableCell>

                        {/* Column 2: Email */}
                        <TableCell className="text-[#64748B] whitespace-nowrap">
                          {reg.email}
                        </TableCell>

                        {/* Column 3: Contact Number */}
                        <TableCell className="text-[#64748B] tabular-nums whitespace-nowrap">
                          {reg.contactNumber ? `+91 ${reg.contactNumber}` : '—'}
                        </TableCell>

                        {/* Column 4: Registered On */}
                        <TableCell className="text-[#64748B] tabular-nums whitespace-nowrap">
                          {new Date(reg.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>

                {/* Pagination */}
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
                />
              </>
            )}
          </Table>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. DIALOGS, MODALS & DRAWERS                             */}
      {/* ======================================================== */}
      {/* Create / Edit Event Modal */}
      <EventFormModal
        isOpen={formModalOpen}
        event={editingEvent}
        onClose={() => {
          setFormModalOpen(false);
          setEditingEvent(null);
        }}
        onSaved={handleEventSaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        event={eventToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        isOpen={drawerOpen}
        event={drawerEvent}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerEvent(null);
        }}
        onEdit={(ev) => {
          setDrawerOpen(false);
          handleOpenEdit(ev);
        }}
        onViewRoster={(ev) => {
          setDrawerOpen(false);
          handleJumpToRoster(ev);
        }}
        onRestore={handleRestoreEvent}
      />

      {/* Top-Right Auto-dismiss Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
          duration={4000}
        />
      )}
    </AdminAppShell>
  );
}

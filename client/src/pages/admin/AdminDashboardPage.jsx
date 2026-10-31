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
} from '../../components/admin/enterprise';
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
  const [eventPage, setEventPage] = useState(1);
  const [eventPageSize, setEventPageSize] = useState(10);

  // Registrations list & filters
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regSearch, setRegSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [regPage, setRegPage] = useState(1);
  const [regPageSize, setRegPageSize] = useState(10);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [rosterEvent, setRosterEvent] = useState(null);

  // Notice alert banner
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
  const culturalCount = useMemo(
    () => events.filter((e) => (e.category || '').toLowerCase() === 'cultural').length,
    [events]
  );
  const technicalCount = useMemo(
    () => events.filter((e) => (e.category || '').toLowerCase() === 'technical').length,
    [events]
  );
  const sportsCount = useMemo(
    () => events.filter((e) => (e.category || '').toLowerCase() === 'sports').length,
    [events]
  );

  // Filtered Events with Category & Status filters
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
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
      if (eventStatusFilter === 'filling' && !(ev.registeredCount && ev.capacity && (ev.registeredCount / ev.capacity >= 0.8))) {
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
  }, [events, eventCategoryFilter, eventStatusFilter, eventSearch]);

  // Paginated Events
  const totalEventPages = Math.max(1, Math.ceil(filteredEvents.length / eventPageSize));
  const paginatedEvents = useMemo(() => {
    const start = (eventPage - 1) * eventPageSize;
    return filteredEvents.slice(start, start + eventPageSize);
  }, [filteredEvents, eventPage, eventPageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setEventPage(1);
  }, [eventCategoryFilter, eventStatusFilter, eventSearch]);

  // Paginated Registrations
  const totalRegPages = Math.max(1, Math.ceil(registrations.length / regPageSize));
  const paginatedRegistrations = useMemo(() => {
    const start = (regPage - 1) * regPageSize;
    return registrations.slice(start, start + regPageSize);
  }, [registrations, regPage, regPageSize]);

  // Export Master Roster to CSV
  const exportMasterCSV = () => {
    if (!registrations.length) {
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
    ];

    const rows = registrations.map((r, i) => [
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
    link.setAttribute('download', `EventFlow_Attendees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabsConfig = [
    { id: 'events', label: 'Event Management', count: events.length },
    { id: 'registrations', label: 'Student Attendee Rosters', count: stats.totalRegistrations },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans pb-16 selection:bg-slate-200">
      {/* 1. TOP BAR HEADER: Simple top bar, logo left, subtle user menu right */}
      <AdminHeader onLogout={handleLogout} />

      {/* Main Content Workspace */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Banner Alert for Actions */}
        {bannerNotice && (
          <div
            role="status"
            className="mb-6 p-3.5 rounded-[8px] bg-white border border-[#E5E7EB] text-[#111827] text-[13px] flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 stroke-[1.5] text-[#10B981] shrink-0" />
              <span className="font-medium">{bannerNotice}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-[#6B7280] hover:text-[#111827] text-[12px] font-medium p-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

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

        {/* 3. STAT CARDS: 2 cards, 12px radius max, 1px border, no icons in colored boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard
            label="Total Events"
            value={stats.totalEvents}
            helperText={`${stats.upcomingEvents} upcoming · ${stats.pastEvents} concluded`}
          />
          <StatCard
            label="Student Registrations"
            value={stats.totalRegistrations}
            helperText="Active confirmed student attendee records"
          />
        </div>

        {/* 4. UNDERLINE-STYLE TABS: No icons, small neutral count */}
        <Tabs
          tabs={tabsConfig}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          className="mb-6"
        />

        {/* ======================================================== */}
        {/* TAB 1: EVENT MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Filter & Search Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Segmented control for categories */}
              <div className="bg-[#F3F4F6] p-1 rounded-[8px] inline-flex items-center gap-1 self-start">
                {[
                  { key: 'all', label: 'All', count: events.length },
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

              {/* Right side: Search, Status select, Refresh button (all 36px) */}
              <div className="flex items-center gap-2.5 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 lg:w-64">
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
                </select>

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
                    (eventSearch || eventCategoryFilter !== 'all' || eventStatusFilter !== 'all') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEventSearch('');
                          setEventCategoryFilter('all');
                          setEventStatusFilter('all');
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

                        // Progress bar color: neutral dark navy normally, turns amber over 80%, red at 100%
                        let progressBarColor = 'bg-[#0F172A]';
                        if (ev.status === 'FULL' || capacityPercent >= 100) {
                          progressBarColor = 'bg-[#EF4444]'; // Red
                        } else if (capacityPercent >= 80) {
                          progressBarColor = 'bg-[#F59E0B]'; // Amber
                        }

                        return (
                          <TableRow key={ev._id}>
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
                                  <Link
                                    to={`/events/${ev._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={ev.title}
                                    className="font-medium text-[13px] text-[#111827] hover:text-[#0F172A] truncate block transition-colors group"
                                  >
                                    <span className="truncate">{ev.title}</span>
                                  </Link>
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

                            {/* Date & Time Column: Tabular numbers, date on line one, time on line two in gray */}
                            <TableCell className="whitespace-nowrap">
                              <span className="text-[13px] font-medium text-[#111827] tabular-nums block">
                                {dateFormatted}
                              </span>
                              <span className="text-[12px] text-[#6B7280] tabular-nums block mt-0.5">
                                {timeFormatted}
                              </span>
                            </TableCell>

                            {/* Venue Column: Plain text, truncated, no pin icon */}
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

                            {/* Actions Column: Three 32px ghost icon buttons (View, Edit, Delete) */}
                            <TableCell align="right" className="whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenRoster(ev)}
                                  aria-label={`View attendee roster for ${ev.title}`}
                                  title="View Attendee Roster"
                                  className="w-8 h-8 rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 stroke-[1.5]" />
                                </button>
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
                                  aria-label={`Deactivate ${ev.title}`}
                                  title="Deactivate Event"
                                  className="w-8 h-8 rounded-[6px] text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 stroke-[1.5]" />
                                </button>
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
        {/* TAB 2: STUDENT ATTENDEE ROSTERS */}
        {/* ======================================================== */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {/* Registrations Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                {/* Search query */}
                <div className="relative w-full sm:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                    <Search className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <input
                    type="text"
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchRegistrations()}
                    placeholder="Search by student, email, phone..."
                    className="w-full h-9 pl-9 pr-8 text-[13px] rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
                  />
                  {regSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setRegSearch('');
                        fetchRegistrations();
                      }}
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
                  className="w-full sm:w-64 h-9 px-3 text-[13px] font-medium text-[#111827] bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] cursor-pointer"
                >
                  <option value="">All Events ({events.length})</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      [{ev.category || 'Event'}] {ev.title} ({ev.registeredCount || 0})
                    </option>
                  ))}
                </select>

                <Button variant="secondary" size="md" onClick={fetchRegistrations}>
                  Search
                </Button>
              </div>

              {/* CSV Export & Record Counter */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span className="text-[13px] text-[#6B7280] tabular-nums">
                  Total: <strong className="font-medium text-[#111827]">{registrations.length}</strong>
                </span>

                {registrations.length > 0 && (
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

            {/* Registrations Master Table */}
            <Table>
              {regLoading ? (
                <TableLoadingState message="Loading attendee records..." />
              ) : registrations.length === 0 ? (
                <TableEmptyState
                  icon={Users}
                  title="No registrations found"
                  description="No student registration records match your filter criteria."
                />
              ) : (
                <>
                  <table className="w-full text-left border-collapse">
                    <TableHeader>
                      <tr>
                        <TableHead>Student Attendee</TableHead>
                        <TableHead>Contact Details</TableHead>
                        <TableHead>Associated Event</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead align="right">Status</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {paginatedRegistrations.map((reg) => {
                        const regDate = new Date(reg.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        });

                        return (
                          <TableRow key={reg._id}>
                            {/* Student Attendee */}
                            <TableCell className="font-medium text-[#111827]">
                              {reg.fullName}
                            </TableCell>

                            {/* Contact Details */}
                            <TableCell>
                              <span className="text-[13px] font-normal text-[#111827] block">
                                {reg.email}
                              </span>
                              <span className="text-[12px] text-[#6B7280] tabular-nums block mt-0.5">
                                +91 {reg.contactNumber}
                              </span>
                            </TableCell>

                            {/* Associated Event */}
                            <TableCell>
                              {reg.event ? (
                                <div className="max-w-xs">
                                  <span className="font-medium text-[13px] text-[#111827] block truncate">
                                    {reg.event.title}
                                  </span>
                                  <span className="text-[12px] text-[#6B7280] block truncate mt-0.5">
                                    {reg.event.venue}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[#9CA3AF] text-[13px] italic">Archived Event</span>
                              )}
                            </TableCell>

                            {/* Category */}
                            <TableCell className="whitespace-nowrap">
                              <CategoryBadge category={reg.event?.category} />
                            </TableCell>

                            {/* Registration Date */}
                            <TableCell className="whitespace-nowrap tabular-nums text-[13px] text-[#6B7280]">
                              {regDate}
                            </TableCell>

                            {/* Ticket ID */}
                            <TableCell className="whitespace-nowrap font-mono text-[12px] text-[#374151]">
                              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F3F4F6] border border-[#E5E7EB] tabular-nums">
                                #REG-{reg._id ? reg._id.slice(-6).toUpperCase() : 'PASS'}
                              </span>
                            </TableCell>

                            {/* Status */}
                            <TableCell align="right" className="whitespace-nowrap">
                              <span className="inline-flex items-center text-[12px] font-medium text-[#374151]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-2 shrink-0" />
                                <span>Verified</span>
                              </span>
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
                    totalItems={registrations.length}
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

      {/* MODAL 3: Event Attendee Roster Modal */}
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

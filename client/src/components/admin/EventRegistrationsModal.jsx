import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  Loader2,
  AlertCircle,
  Download,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/client';

export default function EventRegistrationsModal({ isOpen, event, onClose }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && event && event._id) {
      fetchEventRegistrations();
    }
  }, [isOpen, event]);

  const fetchEventRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/events/${event._id}/registrations`);
      setRegistrations(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendee registrations.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  // Filter registrations by search term
  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = reg.fullName?.toLowerCase().includes(term);
    const emailMatch = reg.email?.toLowerCase().includes(term);
    const phoneMatch = reg.contactNumber?.includes(term);
    return nameMatch || emailMatch || phoneMatch;
  });

  // Export CSV handler for this event
  const exportToCSV = () => {
    if (!registrations.length) return;
    const headers = ['#', 'Attendee Name', 'Email', 'Mobile Number', 'Registration Date', 'Ticket ID'];
    const rows = registrations.map((r, i) => [
      i + 1,
      `"${r.fullName || ''}"`,
      `"${r.email || ''}"`,
      `"+91 ${r.contactNumber || ''}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`,
      `"#REG-${r._id ? r._id.slice(-6).toUpperCase() : 'CONFIRMED'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_')}_Attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const capacityPercent = Math.min(
    100,
    Math.round(((registrations.length) / (event.capacity || 1)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-hero-fade-in overflow-y-auto font-sans">
      <div
        className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl border border-white/60 overflow-hidden my-8 animate-modal-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Template Header */}
        <div className="relative px-6 sm:px-8 py-6 bg-slate-950 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC700] text-slate-950 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
            <Users className="w-3.5 h-3.5" />
            <span>Verified Attendee Roster</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white line-clamp-1 pr-8">
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1.5">
            <span>{event.venue}</span>
            <span>•</span>
            <span className="font-semibold text-amber-300">
              {registrations.length} of {event.capacity} seats filled ({capacityPercent}%)
            </span>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, email, or phone..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-full border border-slate-200 bg-white focus:outline-hidden focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10 transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-900 font-bold">{filteredRegistrations.length}</strong> attendees
            </span>

            {registrations.length > 0 && (
              <button
                type="button"
                onClick={exportToCSV}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Attendee Table */}
        <div className="p-4 sm:p-6 max-h-[55vh] overflow-y-auto">
          {loading ? (
            <div className="py-14 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-slate-900 mb-2" />
              <span className="text-xs font-medium">Loading attendee roster...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No Registrations Found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm
                  ? 'No attendees matched your search criteria.'
                  : 'No student registrations recorded for this event yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Student Attendee</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Mobile (India)</th>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((reg, index) => {
                    const regDate = new Date(reg.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={reg._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {reg.fullName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{reg.email}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>+91 {reg.contactNumber}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                            #REG-{reg._id ? reg._id.slice(-6).toUpperCase() : 'PASS'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {regDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official University Event Roster</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-black text-white font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
}

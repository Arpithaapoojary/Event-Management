import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Users,
  Loader2,
  AlertCircle,
  Download,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto font-sans">
      <div
        className="relative w-full max-w-3xl bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E5E7EB] overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-white border-b border-[#E5E7EB]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>

          <div className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#F3F4F6] text-[#374151] text-[12px] font-medium mb-1.5">
            <span>Attendee Roster</span>
          </div>
          <h3 className="text-[20px] font-semibold text-[#111827] tracking-[-0.01em] line-clamp-1 pr-8">
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#6B7280] mt-1">
            <span>{event.venue}</span>
            <span>·</span>
            <span className="tabular-nums font-medium text-[#111827]">
              {registrations.length} / {event.capacity} seats filled ({capacityPercent}%)
            </span>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="px-6 py-3 border-b border-[#E5E7EB] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
              <Search className="w-4 h-4 stroke-[1.5]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, email, phone..."
              className="w-full h-9 pl-9 pr-3 text-[13px] rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[12px] text-[#6B7280] tabular-nums">
              Showing <strong className="font-medium text-[#111827]">{filteredRegistrations.length}</strong> attendees
            </span>

            {registrations.length > 0 && (
              <button
                type="button"
                onClick={exportToCSV}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-white hover:bg-[#F9FAFB] active:bg-[#F3F4F6] border border-[#E5E7EB] text-[13px] font-medium text-[#111827] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[1.5] text-[#6B7280]" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Attendee Table */}
        <div className="p-6 max-h-[55vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-[#6B7280]">
              <Loader2 className="w-6 h-6 stroke-[1.5] animate-spin text-[#0F172A] mb-2" />
              <span className="text-[13px] font-medium">Loading attendee roster...</span>
            </div>
          ) : error ? (
            <div className="p-3.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[1.5]" />
              <span>{error}</span>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">
              <Users className="w-8 h-8 stroke-[1.5] mx-auto text-[#9CA3AF] mb-2" />
              <p className="text-[14px] font-medium text-[#111827]">No Registrations Found</p>
              <p className="text-[13px] text-[#6B7280] mt-1">
                {searchTerm
                  ? 'No attendees matched your search criteria.'
                  : 'No student registrations recorded for this event yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[8px] border border-[#E5E7EB]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-2.5 px-3 text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B7280]">#</th>
                    <th className="py-2.5 px-4 text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B7280]">Student Attendee</th>
                    <th className="py-2.5 px-4 text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B7280]">Email</th>
                    <th className="py-2.5 px-4 text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B7280]">Phone</th>
                    <th className="py-2.5 px-4 text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B7280]">Ticket ID</th>
                    <th className="py-2.5 px-4 text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B7280]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredRegistrations.map((reg, index) => {
                    const regDate = new Date(reg.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <tr key={reg._id} className="h-12 hover:bg-[#F9FAFB] transition-colors text-[13px]">
                        <td className="py-2.5 px-3 font-mono text-[#9CA3AF] text-[12px] tabular-nums">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-[#111827]">
                          {reg.fullName}
                        </td>
                        <td className="py-2.5 px-4 text-[#374151]">
                          {reg.email}
                        </td>
                        <td className="py-2.5 px-4 text-[#374151] whitespace-nowrap tabular-nums">
                          +91 {reg.contactNumber}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[12px] text-[#374151]">
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F3F4F6] border border-[#E5E7EB] tabular-nums">
                            #REG-{reg._id ? reg._id.slice(-6).toUpperCase() : 'PASS'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[#6B7280] text-[12px] whitespace-nowrap tabular-nums">
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
        <div className="px-6 py-3.5 bg-[#FAFAFA] border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="text-[12px] text-[#6B7280]">
            Confirmed student attendance records
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-[8px] bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium text-[13px] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

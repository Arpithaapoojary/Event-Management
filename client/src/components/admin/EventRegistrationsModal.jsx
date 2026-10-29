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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Attendee Roster</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1">
              {event.title}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {registrations.length} of {event.capacity} seats filled ({Math.round(((registrations.length) / (event.capacity || 1)) * 100)}% capacity)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 transition"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredRegistrations.length}</strong> registered attendees
          </div>
        </div>

        {/* Content Table */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <span className="text-xs">Loading attendee registrations...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No Registrations Found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm
                  ? 'No attendees matched your search query.'
                  : 'No students have registered for this event yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Attendee Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Contact Number</th>
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
                        <td className="py-3 px-4 font-mono text-slate-400">{index + 1}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {reg.fullName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {reg.email}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {reg.contactNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">{regDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
}

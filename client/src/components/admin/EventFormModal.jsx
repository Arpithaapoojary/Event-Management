import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import api from '../../api/client';

export default function EventFormModal({ isOpen, event, onClose, onSaved }) {
  const isEditing = Boolean(event && event._id);

  // Helper to format Date object to "YYYY-MM-DDTHH:mm" for datetime-local input
  const formatDateTimeForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    venue: '',
    capacity: 50,
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        dateTime: formatDateTimeForInput(event.dateTime),
        venue: event.venue || '',
        capacity: event.capacity || 50,
        imageUrl: event.imageUrl || '',
      });
    } else {
      // Default initial state for new event (tomorrow at 10:00 AM)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      setFormData({
        title: '',
        description: '',
        dateTime: formatDateTimeForInput(tomorrow.toISOString()),
        venue: '',
        capacity: 50,
        imageUrl:
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      });
    }
    setErrors({});
    setServerError(null);
  }, [event, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 150) {
      errs.title = 'Title cannot exceed 150 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required';
    }

    if (!formData.dateTime) {
      errs.dateTime = 'Date and time is required';
    } else {
      const d = new Date(formData.dateTime);
      if (isNaN(d.getTime())) {
        errs.dateTime = 'Please enter a valid date and time';
      }
    }

    if (!formData.venue.trim()) {
      errs.venue = 'Venue location is required';
    }

    const cap = Number(formData.capacity);
    if (!cap || cap < 1) {
      errs.capacity = 'Capacity must be at least 1 attendee';
    } else if (isEditing && event.registeredCount && cap < event.registeredCount) {
      errs.capacity = `Cannot reduce capacity below current registered attendees (${event.registeredCount})`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setServerError(null);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dateTime: new Date(formData.dateTime).toISOString(),
        venue: formData.venue.trim(),
        capacity: Number(formData.capacity),
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      let res;
      if (isEditing) {
        res = await api.put(`/admin/events/${event._id}`, payload);
      } else {
        res = await api.post('/admin/events', payload);
      }

      if (onSaved) {
        onSaved(res.data);
      }
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save event. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {isEditing ? 'Edit Event Details' : 'Create New Event'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isEditing
                ? 'Update schedule, venue, capacity, or details'
                : 'Publish an upcoming event to the student catalog'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 max-h-[80vh] overflow-y-auto">
          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Annual Campus AI Summit 2026"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition ${
                errors.title
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Date/Time and Venue 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition ${
                    errors.dateTime
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.dateTime && <p className="text-xs text-rose-600 mt-1">{errors.dateTime}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Venue Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. Main Auditorium / Room 402"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition ${
                    errors.venue
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.venue && <p className="text-xs text-rose-600 mt-1">{errors.venue}</p>}
            </div>
          </div>

          {/* Capacity & Image URL 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Seat Capacity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="50"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition ${
                  errors.capacity
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              {errors.capacity && <p className="text-xs text-rose-600 mt-1">{errors.capacity}</p>}
              {isEditing && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Currently registered: {event.registeredCount || 0}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Banner Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide event details, itinerary, prerequisites, and speaker info..."
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition ${
                errors.description
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Event...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

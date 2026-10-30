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
  Sparkles,
  Check,
  Tag,
} from 'lucide-react';
import api from '../../api/client';

const FALLBACK_PREVIEW =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

export default function EventFormModal({ isOpen, event, onClose, onSaved }) {
  const isEditing = Boolean(event && event._id);

  // Helper to format Date to "YYYY-MM-DDTHH:mm" for datetime-local input
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
    category: 'Cultural',
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
        category: event.category || 'Cultural',
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
        imageUrl: FALLBACK_PREVIEW,
        category: 'Cultural',
      });
    }
    setErrors({});
    setServerError(null);
  }, [event, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Event title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 150) {
      errs.title = 'Title cannot exceed 150 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Event description is required';
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
      errs.venue = 'Campus venue location is required';
    }

    const cap = Number(formData.capacity);
    if (!cap || cap < 1) {
      errs.capacity = 'Capacity must be at least 1 attendee';
    } else if (isEditing && event.registeredCount && cap < event.registeredCount) {
      errs.capacity = `Cannot reduce capacity below current registrations (${event.registeredCount})`;
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
        category: formData.category,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-hero-fade-in overflow-y-auto font-sans">
      <div
        className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-white/60 overflow-hidden my-8 animate-modal-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Template Header (Matching User Site & Modal Aesthetic) */}
        <div className="relative px-6 sm:px-8 py-6 bg-slate-950 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC700] text-slate-950 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Update Event Listing' : 'New Event Publishing'}</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white pr-8">
            {isEditing ? 'Edit Event Details' : 'Create Campus Event'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 font-normal">
            {isEditing
              ? `Modifying listings for "${event.title}"`
              : 'Add an authorized event to the live student catalog'}
          </p>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-4.5 max-h-[78vh] overflow-y-auto">
          {serverError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Event Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Annual AI &amp; Tech Summit 2026"
                className={`w-full pl-10 pr-4 py-3 text-sm rounded-2xl border bg-white focus:outline-hidden transition-all ${
                  errors.title
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10'
                }`}
              />
            </div>
            {errors.title && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.title}</p>}
          </div>

          {/* Section / Category Selector (Cultural, Technical, Sports) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Section / Arena Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Cultural', label: 'Cultural', icon: '🎭', desc: 'Dance, Music, Fashion' },
                { id: 'Technical', label: 'Technical', icon: '💻', desc: 'Coding, Hackathons, AI' },
                { id: 'Sports', label: 'Sports', icon: '🏆', desc: 'Athletics, Tournaments' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    formData.category === cat.id
                      ? 'border-slate-950 bg-slate-950 text-white shadow-md'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <span
                    className={`text-[10px] block mt-0.5 line-clamp-1 ${
                      formData.category === cat.id ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {cat.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column: Date & Time and Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date &amp; Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm rounded-2xl border bg-white focus:outline-hidden transition-all ${
                    errors.dateTime
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10'
                  }`}
                />
              </div>
              {errors.dateTime && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.dateTime}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Campus Venue <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. Main Auditorium / Seminar Hall A"
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-2xl border bg-white focus:outline-hidden transition-all ${
                    errors.venue
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10'
                  }`}
                />
              </div>
              {errors.venue && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.venue}</p>}
            </div>
          </div>

          {/* 2-Column: Seating Capacity and Cover Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Seating Capacity Limit <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Users className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 150"
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-2xl border bg-white focus:outline-hidden transition-all ${
                    errors.capacity
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10'
                  }`}
                />
              </div>
              {errors.capacity && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.capacity}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Banner Image URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 bg-white focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10 focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Image Live Preview */}
          {formData.imageUrl && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                Image Preview
              </span>
              <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-900 relative">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_PREVIEW;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Event Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a comprehensive event overview, highlights, agenda, and guidelines for students..."
              className={`w-full p-4 text-sm rounded-2xl border bg-white focus:outline-hidden transition-all leading-relaxed ${
                errors.description
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-slate-950 hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-xl active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Event...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Publish Campus Event'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

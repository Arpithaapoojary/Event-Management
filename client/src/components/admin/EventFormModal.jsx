import React, { useState, useEffect, useRef } from 'react';
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
  Palette,
  Cpu,
  Trophy,
  UploadCloud,
  FolderOpen,
  Link as LinkIcon,
  RefreshCw,
  Trash2,
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

  // Folder Image Upload & Link States
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
      if (event.imageUrl && event.imageUrl.startsWith('http')) {
        setImageMode('url');
      } else {
        setImageMode('upload');
      }
      setUploadedFileName(event.imageUrl ? 'Active Event Image' : '');
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
      setImageMode('upload');
      setUploadedFileName('');
    }
    setErrors({});
    setServerError(null);
    setUploadError(null);
  }, [event, isOpen]);

  // Handler for selecting an image file from the user's folder
  const processImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    setUploadError(null);
    setUploadedFileName(file.name);

    // 1. Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, imageUrl: e.target.result }));
    };
    reader.readAsDataURL(file);

    // 2. Upload file to backend /api/admin/upload
    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('image', file);

      const res = await api.post('/admin/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res?.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.imageUrl }));
      }
    } catch (err) {
      console.warn('Backend file upload fallback to local preview data:', err);
      // Reader DataURL in formData.imageUrl will be saved cleanly in MongoDB
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-hero-fade-in overflow-y-auto font-sans">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-8 animate-modal-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Clean All-White Executive Header */}
        <div className="relative px-6 sm:px-8 py-6 bg-white border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEditing ? 'Update Event Listing' : 'Campus Event Publishing'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pr-8">
            {isEditing ? 'Edit Event Details' : 'Create Campus Event'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {isEditing
              ? `Modifying listings for "${event.title}"`
              : 'Add an authorized event to the live student catalog'}
          </p>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-5 max-h-[78vh] overflow-y-auto">
          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Event Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                placeholder="e.g. Annual AI & Tech Summit 2026"
                className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-white focus:outline-hidden transition-all font-medium ${
                  errors.title
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10'
                }`}
              />
            </div>
            {errors.title && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.title}</p>}
          </div>

          {/* Section / Category Selector (Cultural, Technical, Sports) - No Emojis */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Arena Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Cultural', label: 'Cultural', Icon: Palette, iconColor: 'text-amber-600', desc: 'Arts, Dance, Music' },
                { id: 'Technical', label: 'Technical', Icon: Cpu, iconColor: 'text-blue-600', desc: 'Coding, Hackathons, AI' },
                { id: 'Sports', label: 'Sports', Icon: Trophy, iconColor: 'text-emerald-600', desc: 'Athletics, Tournaments' },
              ].map((cat) => {
                const IconComponent = cat.Icon;
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : cat.iconColor}`} />
                      <span>{cat.label}</span>
                    </div>
                    <span
                      className={`text-xs block mt-1 font-medium line-clamp-1 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2-Column: Date & Time and Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Date &amp; Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-white focus:outline-hidden transition-all font-medium ${
                    errors.dateTime
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                      : 'border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10'
                  }`}
                />
              </div>
              {errors.dateTime && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.dateTime}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-white focus:outline-hidden transition-all font-medium ${
                    errors.venue
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                      : 'border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10'
                  }`}
                />
              </div>
              {errors.venue && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.venue}</p>}
            </div>
          </div>

          {/* Seating Capacity Limit */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-white focus:outline-hidden transition-all font-medium ${
                  errors.capacity
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10'
                }`}
              />
            </div>
            {errors.capacity && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.capacity}</p>}
          </div>

          {/* Event Banner Image: Folder File Upload + Link Support */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Event Banner Image
              </label>
              {/* Mode Toggle: Upload from Folder vs Web Link */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    imageMode === 'upload'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose from Folder</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    imageMode === 'url'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Image URL Link</span>
                </button>
              </div>
            </div>

            {/* MODE 1: Local Folder File Upload & Drag-and-Drop */}
            {imageMode === 'upload' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-slate-900 bg-slate-100 scale-[0.99]'
                      : 'border-slate-200 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-xs flex items-center justify-center mx-auto mb-3">
                    {uploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-slate-800" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {uploadingImage
                      ? 'Uploading folder image to server...'
                      : 'Click to select image from your folder'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Or drag and drop your photo file directly here
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-600">
                      PNG, JPG, WEBP, GIF
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-600">
                      Up to 10MB
                    </span>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 mt-2 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>
            )}

            {/* MODE 2: Web Image Link URL input */}
            {imageMode === 'url' && (
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Paste any direct HTTPS image URL from Unsplash, Imgur, or your campus CDN.
                </p>
              </div>
            )}

            {/* Live Image Preview with File Details */}
            {formData.imageUrl && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Banner Preview</span>
                    {uploadedFileName && (
                      <span className="font-mono text-[11px] text-slate-500 font-medium">
                        ({uploadedFileName})
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-3">
                    {imageMode === 'upload' && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline cursor-pointer"
                      >
                        Change Image
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, imageUrl: '' }));
                        setUploadedFileName('');
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100 relative border border-slate-200">
                  <img
                    src={formData.imageUrl}
                    alt="Event Banner Preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_PREVIEW;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Event Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Event Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a comprehensive event overview, highlights, agenda, and guidelines for students..."
              className={`w-full p-4 text-sm rounded-xl border bg-white focus:outline-hidden transition-all leading-relaxed font-medium ${
                errors.description
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                  : 'border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-70 cursor-pointer"
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

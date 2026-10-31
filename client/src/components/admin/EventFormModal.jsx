import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Loader2,
  FolderOpen,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';
import api from '../../api/client';
import { Button, FormField } from './enterprise';
import { resolveImageUrl, FALLBACK_EVENT_IMAGE } from '../../utils/imageUrl';

const CAMPUS_PRESETS = [
  {
    name: '🎭 Cultural & Dance',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: '💻 Tech Hackathon',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: '⚽ Sports Arena',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: '🎵 Music Fusion',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: '🤖 Robotics & Drone',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
];

// Client-side lightweight canvas compressor (< 250KB WebP/JPEG)
const compressImageFile = (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

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
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      setFormData({
        title: '',
        description: '',
        dateTime: formatDateTimeForInput(tomorrow.toISOString()),
        venue: '',
        capacity: 50,
        imageUrl: CAMPUS_PRESETS[0].url,
        category: 'Cultural',
      });
      setImageMode('upload');
    }
    setErrors({});
    setServerError(null);
    setUploadError(null);
  }, [event, isOpen]);

  // Handler for selecting an image file from local folder
  const processImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB limit. Please choose a smaller image.');
      return;
    }

    setUploadError(null);
    setUploadingImage(true);

    try {
      // 1. Instant client-side optimized preview (< 200KB)
      const compressedDataUrl = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));

      // 2. Also upload file to backend server storage if online
      const data = new FormData();
      data.append('image', file);

      const res = await api.post('/admin/upload', data, {
        headers: {
          'Content-Type': undefined,
        },
      });

      if (res?.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.imageUrl }));
      }
    } catch (err) {
      console.warn('Backend file upload fallback to optimized local data URL:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
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
    if (file) processImageFile(file);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  // Real-time client-side validation
  const validateField = (name, value) => {
    let err = null;
    if (name === 'title') {
      if (!value.trim()) err = 'Event title is required.';
      else if (value.trim().length < 3) err = 'Title must be at least 3 characters.';
    }
    if (name === 'venue') {
      if (!value.trim()) err = 'Venue is required.';
    }
    if (name === 'dateTime') {
      if (!value) {
        err = 'Date and start time are required.';
      } else if (!isEditing) {
        const selected = new Date(value);
        if (selected <= new Date()) {
          err = 'Scheduled date must be in the future.';
        }
      }
    }
    if (name === 'capacity') {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        err = 'Capacity must be at least 1 attendee.';
      } else if (isEditing && event.registeredCount && num < event.registeredCount) {
        err = `Cannot be lower than confirmed registrations (${event.registeredCount}).`;
      }
    }
    if (name === 'description') {
      if (!value.trim()) err = 'Description is required.';
      else if (value.trim().length < 10) err = 'Description must be at least 10 characters.';
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    // Validate all fields
    const formErrors = {
      title: validateField('title', formData.title),
      venue: validateField('venue', formData.venue),
      dateTime: validateField('dateTime', formData.dateTime),
      capacity: validateField('capacity', formData.capacity),
      description: validateField('description', formData.description),
    };

    const hasErrors = Object.values(formErrors).some(Boolean);
    if (hasErrors) {
      setErrors(formErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dateTime: new Date(formData.dateTime).toISOString(),
        venue: formData.venue.trim(),
        capacity: parseInt(formData.capacity, 10),
        imageUrl: formData.imageUrl.trim() || FALLBACK_PREVIEW,
        category: formData.category,
      };

      let res;
      if (isEditing) {
        res = await api.put(`/admin/events/${event._id}`, payload);
      } else {
        res = await api.post('/admin/events', payload);
      }

      onSaved(res.data);
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save event. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    formData.title.trim().length >= 3 &&
    formData.venue.trim().length > 0 &&
    Boolean(formData.dateTime) &&
    parseInt(formData.capacity, 10) >= 1 &&
    formData.description.trim().length >= 10 &&
    !Object.values(errors).some(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs overflow-y-auto font-sans">
      <div
        className="relative w-full max-w-2xl bg-white rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#E2E8F0] overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 id="modal-headline" className="text-[16px] leading-[24px] font-semibold text-[#0F172A]">
              {isEditing ? 'Edit event' : 'Create event'}
            </h2>
            <p className="text-[12px] leading-[16px] text-[#64748B]">
              {isEditing
                ? `Update details for "${event.title}".`
                : 'Add a new authorized event to the campus schedule.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-[6px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body: 2-column grid on desktop, 1 column on mobile */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {serverError && (
            <div
              role="alert"
              className="p-3 rounded-[6px] bg-[#FEF2F2] border border-[#DC2626]/20 text-[#DC2626] text-[13px] font-normal"
            >
              {serverError}
            </div>
          )}

          {/* Event Title (Full Width) */}
          <FormField
            id="event-title"
            label="Event title"
            required
            error={errors.title}
            currentLength={formData.title.length}
            maxLength={120}
          >
            <input
              id="event-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={120}
              placeholder="e.g. Annual Technical Symposium 2026"
              className={`w-full h-[36px] px-3 text-[14px] rounded-[6px] border bg-white focus:outline-hidden transition-colors text-[#0F172A] placeholder:text-[#64748B] ${
                errors.title
                  ? 'border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]'
                  : 'border-[#E2E8F0] focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]'
              }`}
            />
          </FormField>

          {/* 2-Column Grid: Category & Seating Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="event-category" label="Category" required>
              <select
                id="event-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-[36px] px-3 text-[14px] font-normal text-[#0F172A] bg-white border border-[#E2E8F0] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
              >
                <option value="Cultural">Cultural (Arts, Music, Dance)</option>
                <option value="Technical">Technical (Coding, Robotics, AI)</option>
                <option value="Sports">Sports (Athletics, Tournaments)</option>
              </select>
            </FormField>

            <FormField
              id="event-capacity"
              label="Seating capacity"
              required
              error={errors.capacity}
              helperText={
                isEditing && event.registeredCount
                  ? `Min ${event.registeredCount} (confirmed attendees)`
                  : 'Maximum attendee headcount'
              }
            >
              <input
                id="event-capacity"
                type="number"
                name="capacity"
                min={isEditing ? event.registeredCount || 1 : 1}
                value={formData.capacity}
                onChange={handleChange}
                placeholder="100"
                className={`w-full h-[36px] px-3 text-[14px] rounded-[6px] border bg-white focus:outline-hidden transition-colors tabular-nums text-[#0F172A] ${
                  errors.capacity
                    ? 'border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]'
                    : 'border-[#E2E8F0] focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]'
                }`}
              />
            </FormField>
          </div>

          {/* 2-Column Grid: Date & Time and Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="event-datetime"
              label="Date & start time"
              required
              error={errors.dateTime}
              helperText={!isEditing ? 'Must be scheduled in future' : undefined}
            >
              <input
                id="event-datetime"
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                className={`w-full h-[36px] px-3 text-[14px] rounded-[6px] border bg-white focus:outline-hidden transition-colors text-[#0F172A] ${
                  errors.dateTime
                    ? 'border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]'
                    : 'border-[#E2E8F0] focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]'
                }`}
              />
            </FormField>

            <FormField
              id="event-venue"
              label="Campus venue"
              required
              error={errors.venue}
            >
              <input
                id="event-venue"
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Main Auditorium"
                className={`w-full h-[36px] px-3 text-[14px] rounded-[6px] border bg-white focus:outline-hidden transition-colors text-[#0F172A] placeholder:text-[#64748B] ${
                  errors.venue
                    ? 'border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]'
                    : 'border-[#E2E8F0] focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]'
                }`}
              />
            </FormField>
          </div>

          {/* Banner Image (File upload, Presets, or Web URL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-[#0F172A] flex items-center gap-1.5">
                <span>Event banner photo</span>
                <span className="text-[11px] text-[#64748B] font-normal">(displayed on lineup & passes)</span>
              </label>
              <div className="inline-flex rounded-[6px] border border-[#E2E8F0] p-0.5 bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                    imageMode === 'upload' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Upload file
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                    imageMode === 'url' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Web URL
                </button>
              </div>
            </div>

            {/* Live Banner Preview when an image is present */}
            {formData.imageUrl ? (
              <div className="relative rounded-[8px] overflow-hidden border border-[#E2E8F0] bg-slate-950 group">
                <div className="h-36 w-full overflow-hidden relative">
                  <img
                    src={resolveImageUrl(formData.imageUrl)}
                    alt="Event banner preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_EVENT_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-[6px] bg-white text-slate-900 text-[12px] font-medium shadow-xs hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Change photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="px-3 py-1.5 rounded-[6px] bg-rose-600 text-white text-[12px] font-medium shadow-xs hover:bg-rose-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
                <div className="px-3 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Photo attached & preview ready
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#2563EB] hover:underline font-medium cursor-pointer"
                  >
                    Select different photo
                  </button>
                </div>
              </div>
            ) : null}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />

            {/* Upload Mode Dropzone (shown if no image or to add new) */}
            {imageMode === 'upload' && !formData.imageUrl && (
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[8px] p-5 text-center cursor-pointer transition-colors ${
                    isDragging ? 'border-slate-950 bg-[#F8FAFC]' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <FolderOpen className="w-6 h-6 text-[#64748B] mx-auto mb-1.5" />
                  <span className="text-[13px] font-medium text-[#0F172A] block">
                    {uploadingImage ? 'Processing & uploading photo...' : 'Click to browse or drop event photo here'}
                  </span>
                  <span className="text-[12px] text-[#64748B] block mt-0.5">
                    PNG, JPG, JPEG, WEBP (auto-optimized for web)
                  </span>
                </div>
              </div>
            )}

            {/* Web URL Mode */}
            {imageMode === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-[38px] px-3 text-[14px] rounded-[6px] border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            )}

            {uploadError && (
              <p className="text-[12px] text-[#DC2626] font-medium mt-1">{uploadError}</p>
            )}

            {/* 1-Click Campus Theme Presets */}
            <div className="pt-1">
              <span className="text-[11px] font-medium text-[#64748B] block mb-1.5">
                Or pick a 1-click campus theme photo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CAMPUS_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, imageUrl: preset.url }));
                      if (uploadError) setUploadError(null);
                    }}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-[6px] border transition-colors cursor-pointer ${
                      formData.imageUrl === preset.url
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#334155]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <FormField
            id="event-description"
            label="Event description"
            required
            error={errors.description}
            currentLength={formData.description.length}
            maxLength={1000}
          >
            <textarea
              id="event-description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              maxLength={1000}
              placeholder="Provide event details, schedule highlights, and prerequisites..."
              className={`w-full p-3 text-[14px] leading-[20px] rounded-[6px] border bg-white focus:outline-hidden transition-colors resize-y text-[#0F172A] placeholder:text-[#64748B] ${
                errors.description
                  ? 'border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]'
                  : 'border-[#E2E8F0] focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]'
              }`}
            />
          </FormField>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
            <Button
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={submitting || !isFormValid}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                'Save changes'
              ) : (
                'Create event'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

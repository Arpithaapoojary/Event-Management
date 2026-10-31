import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  Loader2,
  FolderOpen,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react';
import api from '../../api/client';
import { Button, FormField } from './enterprise';

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

  // Handler for selecting an image file from local folder
  const processImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    setUploadError(null);
    setUploadedFileName(file.name);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, imageUrl: e.target.result }));
    };
    reader.readAsDataURL(file);

    // Upload to backend /api/admin/upload
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

  // Strict client-side validation
  const validate = () => {
    const errs = {};
    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      errs.title = 'Event title is required and cannot be whitespace only.';
    } else if (trimmedTitle.length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    } else if (trimmedTitle.length > 120) {
      errs.title = 'Title cannot exceed 120 characters.';
    }

    const trimmedDescription = formData.description.trim();
    if (!trimmedDescription) {
      errs.description = 'Event description is required.';
    } else if (trimmedDescription.length > 1000) {
      errs.description = 'Description cannot exceed 1000 characters.';
    }

    if (!formData.dateTime) {
      errs.dateTime = 'Date and start time is required.';
    } else {
      const d = new Date(formData.dateTime);
      if (isNaN(d.getTime())) {
        errs.dateTime = 'Please enter a valid date and time.';
      } else if (!isEditing && d <= new Date()) {
        errs.dateTime = 'Event date must be in the future. Past dates cannot be scheduled.';
      }
    }

    if (!formData.venue.trim()) {
      errs.venue = 'Campus venue location is required.';
    }

    const cap = Number(formData.capacity);
    if (!Number.isInteger(cap) || cap < 1) {
      errs.capacity = 'Capacity must be a positive integer (at least 1 seat).';
    } else if (isEditing && event.registeredCount && cap < event.registeredCount) {
      errs.capacity = `Cannot reduce capacity below current registered attendees (${event.registeredCount}).`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto font-sans">
      <div
        className="relative w-full max-w-2xl bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E5E7EB] overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-white border-b border-[#E5E7EB]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>

          <div className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#F3F4F6] text-[#374151] text-[12px] font-medium mb-1.5">
            <span>{isEditing ? 'Update Event' : 'Create Event'}</span>
          </div>
          <h2 id="modal-headline" className="text-[18px] font-semibold text-[#111827] tracking-[-0.01em]">
            {isEditing ? 'Edit Event Details' : 'Create Campus Event'}
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            {isEditing
              ? `Updating settings for "${event.title}". Registrations remain attached.`
              : 'Add a new authorized event to the campus schedule and catalog.'}
          </p>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {serverError && (
            <div
              role="alert"
              className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] font-medium flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 stroke-[1.5]" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Event Title */}
          <FormField
            id="event-title"
            label="Event Title"
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
              placeholder="e.g. Annual Tech Symposium 2026"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'event-title-error' : undefined}
              className={`w-full h-9 px-3 text-[13px] rounded-[8px] border bg-white focus:outline-none transition-colors text-[#111827] placeholder:text-[#9CA3AF] ${
                errors.title
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#E5E7EB] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]'
              }`}
            />
          </FormField>

          {/* Category Selector (Cultural, Technical, Sports) */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Category <span className="text-[#EF4444]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'Cultural', label: 'Cultural', desc: 'Arts, Music, Dance' },
                { id: 'Technical', label: 'Technical', desc: 'Coding, AI, Robotics' },
                { id: 'Sports', label: 'Sports', desc: 'Athletics, Tournaments' },
              ].map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                    className={`p-3 rounded-[8px] border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-sm'
                        : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#111827]'
                    }`}
                  >
                    <div className="font-semibold text-[13px]">
                      {cat.label}
                    </div>
                    <span
                      className={`text-[11px] block mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-slate-300' : 'text-[#6B7280]'
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
            <FormField
              id="event-datetime"
              label="Date & Start Time"
              required
              error={errors.dateTime}
              helperText={!isEditing ? 'Must be scheduled in the future' : undefined}
            >
              <input
                id="event-datetime"
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                aria-invalid={Boolean(errors.dateTime)}
                aria-describedby={errors.dateTime ? 'event-datetime-error' : undefined}
                className={`w-full h-9 px-3 text-[13px] rounded-[8px] border bg-white focus:outline-none transition-colors font-medium text-[#111827] ${
                  errors.dateTime
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-[#E5E7EB] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]'
                }`}
              />
            </FormField>

            <FormField
              id="event-venue"
              label="Campus Venue"
              required
              error={errors.venue}
            >
              <input
                id="event-venue"
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Main Auditorium / Lab 4"
                aria-invalid={Boolean(errors.venue)}
                aria-describedby={errors.venue ? 'event-venue-error' : undefined}
                className={`w-full h-9 px-3 text-[13px] rounded-[8px] border bg-white focus:outline-none transition-colors text-[#111827] placeholder:text-[#9CA3AF] ${
                  errors.venue
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-[#E5E7EB] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]'
                }`}
              />
            </FormField>
          </div>

          {/* Seating Capacity Limit */}
          <FormField
            id="event-capacity"
            label="Seating Capacity Limit"
            required
            error={errors.capacity}
            helperText={
              isEditing && event.registeredCount
                ? `Minimum ${event.registeredCount} seats (current confirmed registrations)`
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
              placeholder="e.g. 100"
              aria-invalid={Boolean(errors.capacity)}
              aria-describedby={errors.capacity ? 'event-capacity-error' : undefined}
              className={`w-full h-9 px-3 text-[13px] rounded-[8px] border bg-white focus:outline-none transition-colors tabular-nums font-medium text-[#111827] ${
                errors.capacity
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#E5E7EB] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]'
              }`}
            />
          </FormField>

          {/* Event Banner Image: Folder File Upload or Web Link */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-[13px] font-medium text-[#374151]">
                Event Banner Image
              </label>

              {/* Mode Toggle */}
              <div className="inline-flex p-0.5 rounded-[6px] bg-[#F3F4F6] border border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-all cursor-pointer ${
                    imageMode === 'upload'
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-all cursor-pointer ${
                    imageMode === 'url'
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Web URL
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-[8px] p-4 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#0F172A] bg-[#F8FAFC]'
                      : 'border-[#D1D5DB] hover:border-[#9CA3AF] bg-[#FAFAFA]'
                  }`}
                >
                  <FolderOpen className="w-5 h-5 stroke-[1.5] text-[#6B7280] mx-auto mb-1" />
                  <span className="text-[13px] font-medium text-[#111827] block">
                    {uploadingImage ? 'Uploading image...' : 'Click or drag image file here'}
                  </span>
                  <span className="text-[11px] text-[#6B7280] block mt-0.5">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                </div>

                {uploadError && (
                  <p className="text-[12px] text-red-600 mt-1">{uploadError}</p>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-9 px-3 text-[13px] rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <FormField
            id="event-description"
            label="Event Description"
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
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'event-description-error' : undefined}
              className={`w-full p-3 text-[13px] rounded-[8px] border bg-white focus:outline-none transition-colors resize-y text-[#111827] placeholder:text-[#9CA3AF] ${
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#E5E7EB] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]'
              }`}
            />
          </FormField>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E7EB]">
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
              loading={submitting}
              disabled={submitting || Object.keys(errors).length > 0}
            >
              {isEditing ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

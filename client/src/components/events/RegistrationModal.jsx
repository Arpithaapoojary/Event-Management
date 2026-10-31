import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Ticket,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/client';

export default function RegistrationModal({ event, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [registrationSuccessData, setRegistrationSuccessData] = useState(null);

  if (!isOpen || !event) return null;

  // Single field validation with India 10-digit phone requirement
  const validateField = (name, value, isTyping = false) => {
    const val = (value || '').trim();

    if (name === 'fullName') {
      if (!val) return 'Full name is required';
      if (val.length < 2) return 'Full name must be at least 2 characters';
      if (val.length > 100) return 'Full name cannot exceed 100 characters';
      if (!/^[a-zA-Z\s'-]+$/.test(val)) return 'Name can only contain letters, spaces, and hyphens';
      return null;
    }

    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!val) return 'Email address is required';
      if (!emailRegex.test(val)) return 'Please enter a valid email address (e.g. name@domain.com)';
      return null;
    }

    if (name === 'contactNumber') {
      if (!val) return 'Contact phone number is required';

      // Clean non-digits
      const raw = val.replace(/[\s\-()+]/g, '');
      let core = raw;
      if (raw.startsWith('91') && raw.length === 12) core = raw.slice(2);
      else if (raw.startsWith('0') && raw.length === 11) core = raw.slice(1);

      if (!/^\d+$/.test(core)) {
        return 'Phone number can only contain digits';
      }
      if (core.length > 0 && !/^[6-9]/.test(core)) {
        return 'Indian mobile numbers must start with 6, 7, 8, or 9';
      }
      if (core.length !== 10) {
        if (isTyping) return null; // Don't interrupt while typing valid initial digits
        return 'Phone number must be exactly 10 digits (India)';
      }
      return null;
    }
    return null;
  };

  // Validate entire form
  const validate = () => {
    const errs = {
      fullName: validateField('fullName', formData.fullName, false),
      email: validateField('email', formData.email, false),
      contactNumber: validateField('contactNumber', formData.contactNumber, false),
    };

    const filteredErrs = Object.fromEntries(
      Object.entries(errs).filter(([_, v]) => v !== null)
    );
    setErrors(filteredErrs);
    return Object.keys(filteredErrs).length === 0;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value, false);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const errorMsg = validateField(name, value, true);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
    if (apiError) setApiError(null);
  };

  // Dedicated India 10-digit phone handler
  const handlePhoneChange = (e) => {
    let raw = e.target.value;

    // Auto-strip country code prefix if pasted with +91, 91, or 0
    let cleaned = raw.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
    else if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.slice(2);
    else if (cleaned.startsWith('0') && cleaned.length > 10) cleaned = cleaned.slice(1);

    // Filter to digits only and limit strictly to 10 digits
    cleaned = cleaned.replace(/\D/g, '').slice(0, 10);

    setFormData((prev) => ({ ...prev, contactNumber: cleaned }));

    const errorMsg = validateField('contactNumber', cleaned, true);
    setErrors((prev) => ({ ...prev, contactNumber: errorMsg }));
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, contactNumber: true });

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setApiError(null);

      // Cleaned 10-digit mobile number
      const raw = formData.contactNumber.trim().replace(/[\s\-()+]/g, '');
      let corePhone = raw;
      if (raw.startsWith('91') && raw.length === 12) corePhone = raw.slice(2);
      else if (raw.startsWith('0') && raw.length === 11) corePhone = raw.slice(1);

      const res = await api.post(`/events/${event._id}/register`, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        contactNumber: corePhone,
      });

      // Handle server responses
      const isSuccess = res?.success || res?.data?.success;
      const data = res?.data || res;

      if (isSuccess || res?.message?.toLowerCase().includes('success')) {
        setRegistrationSuccessData(data);
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        setApiError(res?.message || 'Registration could not be completed.');
      }
    } catch (err) {
      setApiError(
        err.message || 'Registration could not be completed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({ fullName: '', email: '', contactNumber: '' });
    setTouched({});
    setErrors({});
    setApiError(null);
    setRegistrationSuccessData(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleResetForm();
    onClose();
  };

  const formattedDate = new Date(event.dateTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Extract attendee & pass details for clean presentation
  const regObj =
    registrationSuccessData?.registration ||
    registrationSuccessData?.data?.registration ||
    registrationSuccessData ||
    {};

  const attendeeName = regObj.fullName || formData.fullName || 'Attendee';
  const attendeePhone = regObj.contactNumber || formData.contactNumber || '';
  const attendeeEmail = regObj.email || formData.email || '';
  const ticketCode = regObj._id
    ? regObj._id.slice(-6).toUpperCase()
    : 'CONFIRMED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-hero-fade-in font-sans overflow-y-auto">
      {/* Modal Dialog with smooth entrance animation */}
      <div
        className="relative w-full max-w-md bg-white rounded-[16px] shadow-xl border border-slate-200 overflow-hidden transform animate-modal-in transition-all max-h-[92vh] overflow-y-auto my-auto"
        role="dialog"
        aria-modal="true"
      >
        {registrationSuccessData ? (
          /* ======================================================== */
          /* PROFESSIONAL CONFIRMATION SCREEN (Same Template) */
          /* ======================================================== */
          <div>
            {/* Template Header (Dark with Golden Pill & Event Context) */}
            <div className="relative px-5 py-4 bg-slate-950 text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-[6px] text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] bg-[#FFC700] text-slate-950 text-[11px] font-semibold uppercase tracking-wider mb-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Registration Confirmed</span>
              </div>
              <h3 className="text-[16px] font-bold font-display text-white pr-8 line-clamp-1 leading-snug">
                {event.title}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-3 mt-1.5 font-normal">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {event.venue}
                </span>
              </p>
            </div>

            {/* Modal Body: High-End Clean Confirmation Summary */}
            <div className="p-6 sm:p-7 animate-hero-fade-up">
              {/* Refined Emerald Success Icon */}
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200/90 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs animate-success-pop">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <h4 className="text-xl font-bold text-slate-950 mb-1 text-center">
                Registration Confirmed
              </h4>
              <p className="text-xs text-slate-500 mb-6 text-center max-w-sm mx-auto leading-relaxed">
                Your registration has been successfully confirmed. A summary of your booking is shown below.
              </p>

              {/* Professional Receipt Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-6 space-y-3.5">
                {/* Header row with Reference ID & Verified Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Registration ID
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-white rounded-md inline-block mt-0.5">
                      #REG-{ticketCode}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seat Reserved</span>
                  </span>
                </div>

                {/* Structured Detail Rows */}
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Attendee Name</span>
                    </span>
                    <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                      {attendeeName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mobile Number</span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      +91 {attendeePhone}
                    </span>
                  </div>

                  {attendeeEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Email Address</span>
                      </span>
                      <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                        {attendeeEmail}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Venue</span>
                    </span>
                    <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                      {event.venue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3.5 px-6 rounded-full bg-slate-950 hover:bg-black text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-98 cursor-pointer text-center"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer text-center whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Register Another</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* REGISTRATION FORM STATE (Same Template) */
          /* ======================================================== */
          <div>
            {/* Template Header (Dark with Golden Pill & Event Context) */}
            <div className="relative px-5 py-4 bg-slate-950 text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-[6px] text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] bg-[#FFC700] text-slate-950 text-[11px] font-semibold uppercase tracking-wider mb-1.5 shadow-2xs">
                <Ticket className="w-3.5 h-3.5" />
                <span>Event Registration</span>
              </div>
              <h3 className="text-[16px] font-bold font-display text-white pr-8 line-clamp-1 leading-snug">
                {event.title}
              </h3>
              <p className="text-[12px] text-slate-300 flex items-center gap-3 mt-1 font-normal">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {event.venue}
                </span>
              </p>
            </div>

            {/* Modal Body: Registration Form */}
            <div className="p-5">
              <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                {apiError && (
                  <div className="p-3 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-start gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="font-medium">{apiError}</span>
                  </div>
                )}

                {/* Full Name Field */}
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. John Doe"
                      disabled={isSubmitting}
                      className={`w-full h-10 pl-9 pr-3 text-[14px] rounded-[8px] border bg-white focus:outline-hidden transition-colors ${
                        errors.fullName
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-200 focus:border-slate-950 focus:ring-1 focus:ring-slate-950'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[12px] text-rose-600 mt-1 font-medium flex items-center gap-1 animate-hero-fade-in">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Email Address Field */}
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. alex@example.com"
                      disabled={isSubmitting}
                      className={`w-full h-10 pl-9 pr-3 text-[14px] rounded-[8px] border bg-white focus:outline-hidden transition-colors ${
                        errors.email
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-200 focus:border-slate-950 focus:ring-1 focus:ring-slate-950'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[12px] text-rose-600 mt-1 font-medium flex items-center gap-1 animate-hero-fade-in">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    One registration per email address is permitted for this event.
                  </p>
                </div>

                {/* Contact Number Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[13px] font-medium text-slate-700">
                      Contact Number (India) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      10 Digits
                    </span>
                  </div>

                  <div
                    className={`flex items-center h-10 rounded-[8px] border transition-colors overflow-hidden bg-white ${
                      errors.contactNumber
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-500'
                        : formData.contactNumber.length === 10 && !errors.contactNumber
                        ? 'border-emerald-500'
                        : 'border-slate-200 focus-within:border-slate-950 focus-within:ring-1 focus-within:ring-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-1 px-2.5 h-full bg-slate-50 border-r border-slate-200 text-slate-700 text-[13px] font-semibold select-none shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>

                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handlePhoneChange}
                      onBlur={handleBlur}
                      maxLength={10}
                      placeholder="98765 43210"
                      disabled={isSubmitting}
                      className="w-full px-3 text-[14px] text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-hidden tracking-wider font-normal"
                    />

                    {formData.contactNumber.length === 10 && !errors.contactNumber && (
                      <div className="pr-2.5 text-emerald-500 shrink-0 animate-hero-fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {errors.contactNumber ? (
                    <p className="text-[12px] text-rose-600 mt-1 font-medium flex items-center gap-1 animate-hero-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.contactNumber}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enter 10-digit Indian mobile number starting with 6, 7, 8, or 9.
                    </p>
                  )}
                </div>

                {/* Action Buttons: 40px height, 8px radius */}
                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="h-10 px-4 rounded-[8px] border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-[14px] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[8px] bg-slate-950 hover:bg-black text-white font-medium text-[14px] transition-colors shadow-2xs active:scale-98 disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <span>Confirm Registration</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

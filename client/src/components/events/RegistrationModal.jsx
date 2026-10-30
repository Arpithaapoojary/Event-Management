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

  // Single field validation
  const validateField = (name, value) => {
    const val = value.trim();
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
      if (!emailRegex.test(val)) return 'Please enter a valid email (e.g. name@domain.com)';
      return null;
    }

    if (name === 'contactNumber') {
      const digitsOnly = val.replace(/\D/g, '');
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
      if (!val) return 'Contact phone number is required';
      if (!phoneRegex.test(val) || digitsOnly.length < 7 || digitsOnly.length > 15) {
        return 'Please enter a valid phone number (7 to 15 digits)';
      }
      return null;
    }
    return null;
  };

  // Validate entire form
  const validate = () => {
    const errs = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      contactNumber: validateField('contactNumber', formData.contactNumber),
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
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If field was previously touched, re-validate on change
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, contactNumber: true });

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setApiError(null);

      const res = await api.post(`/events/${event._id}/register`, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        contactNumber: formData.contactNumber.trim(),
      });

      // Handle both direct and intercepted responses safely
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

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({ fullName: '', email: '', contactNumber: '' });
    setTouched({});
    setErrors({});
    setApiError(null);
    setRegistrationSuccessData(null);
    onClose();
  };

  const formattedDate = new Date(event.dateTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Event Registration</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white pr-8 line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-slate-300 flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {event.venue}
            </span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {registrationSuccessData ? (
            /* Success State */
            <div className="text-center py-2 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
                <span>✓ Successfully Registered</span>
              </div>

              <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                You're Confirmed!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-sm mx-auto">
                Your registration was successfully processed. Your seat is confirmed for <span className="font-semibold text-slate-800">{event.title}</span>.
              </p>

              {/* Digital Pass Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-left mb-6 space-y-3 shadow-inner">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-500">Attendee Name</span>
                  <span className="text-xs font-bold text-slate-900">
                    {registrationSuccessData.registration?.fullName || formData.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-500">Registered Email</span>
                  <span className="text-xs font-medium text-slate-700">
                    {registrationSuccessData.registration?.email || formData.email}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-500">Contact Number</span>
                  <span className="text-xs font-medium text-slate-700">
                    {registrationSuccessData.registration?.contactNumber || formData.contactNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-xs font-semibold text-slate-500">Registration Pass #</span>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                    #REG-{registrationSuccessData.registration?._id ? registrationSuccessData.registration._id.slice(-6).toUpperCase() : 'CONFIRMED'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-lg shadow-slate-900/10 active:scale-98"
              >
                Close & Return to Event
              </button>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {apiError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{apiError}</span>
                </div>
              )}

              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition ${
                      errors.fullName
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Email Address Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  One registration per email address is permitted for this event.
                </p>
              </div>

              {/* Contact Number Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 9876543210 or +1 555-019-2834"
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition ${
                      errors.contactNumber
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.contactNumber && (
                  <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.contactNumber}</span>
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-70"
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
          )}
        </div>
      </div>
    </div>
  );
}

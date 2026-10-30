import React from 'react';
import { AlertTriangle, X, Loader2, ShieldCheck, Calendar, MapPin, Users } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  event,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-hero-fade-in font-sans">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform animate-modal-in transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Clean All-White Header */}
        <div className="relative px-6 sm:px-8 py-6 bg-white border-b border-slate-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Event Deactivation</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 pr-8">
            Deactivate Event Listing
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Remove this event from the live campus catalog
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            Are you sure you want to deactivate <strong className="text-slate-900 font-bold">"{event.title}"</strong>? New student registrations will be disabled immediately.
          </p>

          {/* Event Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm space-y-2 mb-4">
            <div className="font-bold text-slate-900 line-clamp-1">{event.title}</div>
            <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-200">
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="truncate max-w-[150px]">{event.venue}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{event.registeredCount || 0} Registered</span>
              </span>
            </div>
          </div>

          {/* Data integrity security guarantee */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-normal mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Data Protection Guarantee:</strong> Soft-deletion protects student records. All registered attendee history and ticket passes remain safely archived for audit reports.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deactivating...</span>
                </>
              ) : (
                <span>Confirm Deactivation</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

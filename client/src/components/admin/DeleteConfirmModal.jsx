import React from 'react';
import { AlertTriangle, X, Loader2, Info } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  event,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Delete Event Confirmation
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this event from the public listing?
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Event Summary Box */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="font-bold text-slate-800 line-clamp-1">{event.title}</div>
            <div className="text-slate-500 flex justify-between">
              <span>Venue: {event.venue}</span>
              <span className="font-semibold text-indigo-600">
                {event.registeredCount || 0} Registered Attendees
              </span>
            </div>
          </div>

          {/* Data consistency note */}
          <div className="mt-3.5 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 leading-normal">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Data Integrity Guarantee:</strong> This performs a soft-deletion. All registration records and attendee history remain securely preserved in the database for reporting and auditing.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-lg shadow-rose-600/20 disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Confirm & Delete</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

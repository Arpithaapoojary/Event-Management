import React from 'react';
import { X, Loader2, Calendar, MapPin, Users, ShieldAlert } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  event,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-sans">
      <div
        className="relative w-full max-w-md bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E5E7EB] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-white border-b border-[#E5E7EB]">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-5 right-5 p-1.5 rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>

          <div className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-700 text-[12px] font-medium mb-1.5">
            <span>Deactivate Event</span>
          </div>
          <h3 className="text-[18px] font-semibold text-[#111827] tracking-[-0.01em]">
            Confirm Deactivation
          </h3>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            This event will be unpublished from the campus catalog.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-[13px] text-[#374151] mb-4 leading-relaxed">
            Are you sure you want to deactivate <strong className="font-semibold text-[#111827]">"{event.title}"</strong>? New registrations will be disabled immediately.
          </p>

          {/* Event Summary Card */}
          <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-[13px] space-y-2 mb-4">
            <div className="font-medium text-[#111827] truncate">{event.title}</div>
            <div className="flex items-center justify-between text-[#6B7280] text-[12px] pt-2 border-t border-[#E5E7EB]">
              <span className="truncate max-w-[160px]">{event.venue}</span>
              <span className="tabular-nums font-medium text-[#111827]">
                {event.registeredCount || 0} registered
              </span>
            </div>
          </div>

          <div className="p-3 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-[12px] text-[#6B7280] leading-normal mb-6">
            Registered student records and ticket IDs remain safely archived for audit reporting.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="h-9 px-4 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] font-medium text-[13px] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium text-[13px] transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 stroke-[1.5] animate-spin" />
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

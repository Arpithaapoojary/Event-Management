import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './enterprise';

/**
 * Clean Confirm Delete Dialog (Linear / Stripe / Vercel style)
 * - Names the event and affected registrations count
 * - Calm neutral layout: "Cancel" (secondary) and "Delete event" (red)
 */
export default function DeleteConfirmModal({
  isOpen,
  event,
  onClose,
  onConfirm,
  isDeleting,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !event) return null;

  const affectedCount = event.registeredCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs font-sans">
      <div
        className="relative w-full max-w-md bg-white rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#E2E8F0] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-event-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 id="delete-event-title" className="text-[16px] leading-[24px] font-semibold text-[#0F172A]">
            Delete event
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-[6px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <p className="text-[14px] leading-[20px] text-[#0F172A]">
            Are you sure you want to delete <strong className="font-semibold">"{event.title}"</strong>?
          </p>

          <p className="text-[13px] leading-[18px] text-[#64748B]">
            This event currently has <strong className="font-medium text-[#0F172A] tabular-nums">{affectedCount}</strong> registered {affectedCount === 1 ? 'attendee' : 'attendees'}.
            The event will be removed from the public schedule while preserving registration records for institutional audit.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete event'}
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './enterprise';

/**
 * Enterprise Delete Confirmation Modal (Module 4)
 * - Explicitly states the event name and how many registrations are affected
 * - "Cancel" and red "Delete event" button
 * - Never deletes on a single click
 * - Preserves registrations under soft-delete policy
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
      <div
        className="relative w-full max-w-md bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-event-title"
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-white border-b border-[#E5E7EB]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-5 right-5 p-1.5 rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>

          <div className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#FEF2F2] text-[#991B1B] text-[12px] font-medium mb-1.5 border border-[#FCA5A5]">
            <span>Soft Delete Event</span>
          </div>
          <h2 id="delete-event-title" className="text-[18px] font-semibold text-[#111827] tracking-[-0.01em]">
            Delete Event
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            This will remove the event from the public catalog while preserving student data.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-[13px] text-[#374151] leading-relaxed">
            Are you sure you want to delete <strong className="font-semibold text-[#111827]">"{event.title}"</strong>?
          </p>

          {/* Registration impact notification */}
          <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-[13px] space-y-1.5">
            <div className="flex items-center justify-between text-[#111827] font-medium">
              <span>Affected Registrations:</span>
              <span className="tabular-nums font-semibold text-[#111827]">
                {affectedCount} {affectedCount === 1 ? 'attendee' : 'attendees'}
              </span>
            </div>
            <p className="text-[12px] text-[#6B7280] leading-normal">
              Under EventFlow's institutional soft-delete policy, all {affectedCount} registration records, contact details, and ticket IDs are retained as an archive and marked read-only.
            </p>
          </div>

          <p className="text-[12px] text-[#6B7280]">
            The event can be reviewed or restored anytime from the audit view.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            size="md"
            onClick={onConfirm}
            loading={isDeleting}
          >
            Delete event
          </Button>
        </div>
      </div>
    </div>
  );
}

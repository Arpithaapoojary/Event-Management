import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import Button from './Button';

/**
 * Enterprise Confirmation Dialog
 * - Used for destructive and high-impact actions
 * - Explicitly states the event name and affected registrations
 * - 'Cancel' and red 'Delete event' buttons
 * - Keyboard accessible (Escape to cancel)
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Delete Event',
  eventName,
  affectedRegistrations = 0,
  confirmButtonText = 'Delete event',
  isProcessing = false,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 id="confirm-dialog-title" className="text-[16px] font-semibold text-[#111827]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close dialog"
            className="p-1 rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-[13px] text-[#374151] leading-relaxed">
            Are you sure you want to delete <strong className="font-semibold text-[#111827]">"{eventName}"</strong>?
          </p>

          {/* Registration impact notification */}
          <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-[13px] text-[#374151] space-y-1">
            <div className="font-medium text-[#111827]">Impact on Registrations:</div>
            <p className="text-[12px] text-[#6B7280]">
              This event currently has{' '}
              <strong className="text-[#111827] font-semibold tabular-nums">
                {affectedRegistrations} {affectedRegistrations === 1 ? 'student registration' : 'student registrations'}
              </strong>{' '}
              attached. Under institutional soft-delete policy, all student records and ticket IDs will remain safely archived and marked read-only.
            </p>
          </div>

          <p className="text-[12px] text-[#6B7280]">
            The event will immediately disappear from the public catalog and active counts. An administrator can still review or restore it from the audit view.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            size="md"
            onClick={onConfirm}
            loading={isProcessing}
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}

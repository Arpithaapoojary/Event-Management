import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

/**
 * Toast Notification (Linear / Stripe / Vercel style)
 * - Positioned top-right, auto-dismiss after 4s
 * - White surface, 1px border #E2E8F0, 6px radius, subtle shadow
 * - Monoline Lucide icon (16px) with status color: success #16A34A, error #DC2626
 */
export default function Toast({
  type = 'success', // 'success' | 'error'
  message,
  onDismiss,
  duration = 4000,
}) {
  useEffect(() => {
    if (!message || !duration) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-6 right-6 z-50 max-w-sm w-full bg-white rounded-[6px] border border-[#E2E8F0] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between gap-3 font-sans transition-all"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
        )}
        <span className="text-[13px] text-[#0F172A] font-normal truncate">
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-[4px] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

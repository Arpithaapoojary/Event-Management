import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Enterprise Toast Notification
 * - Monoline Lucide icon (16px, 1.5px stroke)
 * - Clean white card, 1px border (#E5E7EB), subtle shadow
 * - No bright gradients or playful banners
 * - Accessible with role="status" and aria-live="polite"
 */
export default function Toast({
  type = 'success', // 'success' | 'error' | 'info'
  message,
  onDismiss,
  duration = 4500,
}) {
  useEffect(() => {
    if (!message || !duration) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 stroke-[1.5] text-[#10B981] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 stroke-[1.5] text-[#EF4444] shrink-0" />,
    info: <Info className="w-4 h-4 stroke-[1.5] text-[#6B7280] shrink-0" />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-[8px] border border-[#E5E7EB] p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 font-sans transition-all animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icons[type] || icons.info}
        <span className="text-[13px] text-[#111827] font-medium truncate">
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-[4px] hover:bg-[#F3F4F6] transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5 stroke-[1.5]" />
      </button>
    </div>
  );
}

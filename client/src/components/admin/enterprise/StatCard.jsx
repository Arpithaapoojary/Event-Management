import React from 'react';

/**
 * Clean, Calm StatCard Component (Linear / Stripe / Vercel design)
 * - White surface, 1px border #E2E8F0, 8px radius
 * - 16-24px padding (p-4 sm:p-5)
 * - Small gray label (12px), 28px/600 value with tabular-nums, one muted helper line
 * - NO icons or colored icon boxes
 */
export default function StatCard({ label, value, helperText, className = '' }) {
  return (
    <div
      className={`bg-white rounded-[8px] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-4 sm:p-5 flex flex-col justify-between ${className}`}
    >
      <div className="text-[12px] leading-[16px] font-normal text-[#64748B]">
        {label}
      </div>
      <div className="text-[28px] leading-[36px] font-semibold text-[#0F172A] tabular-nums tracking-[-0.01em] my-1">
        {value}
      </div>
      {helperText ? (
        <div className="text-[12px] leading-[16px] text-[#64748B] truncate">
          {helperText}
        </div>
      ) : (
        <div className="h-[16px]" />
      )}
    </div>
  );
}

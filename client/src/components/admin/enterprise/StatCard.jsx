import React from 'react';

/**
 * Enterprise StatCard Component
 * - 12px radius max
 * - 1px border (#E5E7EB)
 * - Clean white background (#FFFFFF)
 * - No icons in colored boxes
 * - Label: small uppercase gray (11-12px, weight 500, letter-spacing 0.04em)
 * - Value: 28px, weight 600, tabular numbers
 * - Helper text: muted gray (13px, weight 400)
 */
export default function StatCard({ label, value, helperText, className = '' }) {
  return (
    <div
      className={`bg-white rounded-[12px] border border-[#E5E7EB] p-5 transition-colors hover:border-[#D1D5DB] ${className}`}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B7280]">
        {label}
      </div>
      <div className="text-[28px] font-semibold text-[#111827] tabular-nums tracking-[-0.01em] leading-tight mt-1 mb-1">
        {value}
      </div>
      {helperText && (
        <div className="text-[13px] text-[#6B7280] leading-normal font-normal">
          {helperText}
        </div>
      )}
    </div>
  );
}

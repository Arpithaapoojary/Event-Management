import React from 'react';

/**
 * Status Dot Component (Linear / Stripe / Vercel style)
 * - 6px dot + text ("Open", "Filling fast", "Full", "Past")
 * - Dot colors:
 *   - Open: #16A34A (success)
 *   - Filling fast: #D97706 (warning)
 *   - Full: #DC2626 (danger)
 *   - Past: #64748B (muted)
 * - NO filled or bordered colored pills.
 */
export function StatusBadge({ status, seatsLeft, capacity, registeredCount, isDeleted, className = '' }) {
  if (isDeleted) {
    return (
      <span className={`inline-flex items-center text-[13px] font-normal text-[#64748B] select-none ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#64748B] mr-2 shrink-0" />
        <span>Deleted</span>
      </span>
    );
  }

  const isPast = status === 'PAST';
  const isFull = status === 'FULL' || (capacity && registeredCount !== undefined && registeredCount >= capacity);
  const fillRate = capacity ? (registeredCount || 0) / capacity : 0;
  const isFillingFast = (seatsLeft !== undefined && seatsLeft <= 10 && seatsLeft > 0) || fillRate >= 0.8;

  let dotColor = 'bg-[#16A34A]';
  let label = 'Open';

  if (isPast) {
    dotColor = 'bg-[#64748B]';
    label = 'Past';
  } else if (isFull) {
    dotColor = 'bg-[#DC2626]';
    label = 'Full';
  } else if (isFillingFast) {
    dotColor = 'bg-[#D97706]';
    label = 'Filling fast';
  } else {
    dotColor = 'bg-[#16A34A]';
    label = 'Open';
  }

  return (
    <span className={`inline-flex items-center text-[13px] font-normal text-[#0F172A] select-none ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mr-2 shrink-0`} />
      <span>{label}</span>
    </span>
  );
}

/**
 * Category text - plain gray text, no pill, no color, no icon
 */
export function CategoryBadge({ category, className = '' }) {
  const label = category || 'Cultural';
  return (
    <span className={`text-[13px] text-[#64748B] font-normal select-none ${className}`}>
      {label}
    </span>
  );
}

export default StatusBadge;

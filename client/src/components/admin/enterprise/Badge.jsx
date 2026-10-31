import React from 'react';

/**
 * Enterprise StatusBadge Component
 * - 6px colored dot + text
 * - Green = available / open
 * - Amber = filling up (>80% or <= 10 seats left)
 * - Red = sold out / full
 * - Gray = concluded / past
 * - No heavy borders, no pill glow
 */
export function StatusBadge({ status, seatsLeft, capacity, registeredCount, className = '' }) {
  // Determine status color and label
  let dotColor = 'bg-[#10B981]'; // emerald-500
  let label = 'Open';

  const isPast = status === 'PAST';
  const isFull = status === 'FULL' || (capacity && registeredCount !== undefined && registeredCount >= capacity);
  const fillRate = capacity ? (registeredCount || 0) / capacity : 0;
  const isFillingFast = (seatsLeft !== undefined && seatsLeft <= 10 && seatsLeft > 0) || fillRate >= 0.8;

  if (isPast) {
    dotColor = 'bg-[#9CA3AF]'; // gray-400
    label = 'Concluded';
  } else if (isFull) {
    dotColor = 'bg-[#EF4444]'; // red-500
    label = 'Sold out';
  } else if (isFillingFast) {
    dotColor = 'bg-[#F59E0B]'; // amber-500
    label = seatsLeft !== undefined && seatsLeft <= 10 ? `Only ${seatsLeft} left` : 'Filling fast';
  } else {
    dotColor = 'bg-[#10B981]'; // emerald-500
    label = seatsLeft !== undefined ? `${seatsLeft} open` : 'Open';
  }

  return (
    <span
      className={`inline-flex items-center text-[12px] font-medium text-[#374151] select-none ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mr-2 shrink-0`} />
      <span>{label}</span>
    </span>
  );
}

/**
 * Enterprise CategoryBadge Component
 * - Plain neutral gray text-only tags
 * - gray-100 background (#F3F4F6)
 * - gray-700 text (#374151)
 * - 4px radius
 * - No icons
 * - No different bright colors per category
 */
export function CategoryBadge({ category, className = '' }) {
  const label = category || 'Cultural';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium bg-[#F3F4F6] text-[#374151] select-none ${className}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;

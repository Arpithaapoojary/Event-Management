import React from 'react';

export default function StatusBadge({ status, seatsLeft, capacity, registeredCount }) {
  let dotColor = 'bg-[#10B981]';
  let label = 'Open';

  const isPast = status === 'PAST';
  const isFull = status === 'FULL' || (capacity && registeredCount !== undefined && registeredCount >= capacity);
  const fillRate = capacity ? (registeredCount || 0) / capacity : 0;
  const isFillingFast = (seatsLeft !== undefined && seatsLeft <= 10 && seatsLeft > 0) || fillRate >= 0.8;

  if (isPast) {
    dotColor = 'bg-[#9CA3AF]';
    label = 'Concluded';
  } else if (isFull) {
    dotColor = 'bg-[#EF4444]';
    label = 'Sold out';
  } else if (isFillingFast) {
    dotColor = 'bg-[#F59E0B]';
    label = seatsLeft !== undefined && seatsLeft <= 10 ? `Only ${seatsLeft} left` : 'Filling fast';
  } else {
    dotColor = 'bg-[#10B981]';
    label = seatsLeft !== undefined ? `${seatsLeft} open` : 'Open';
  }

  return (
    <span className="inline-flex items-center text-[12px] font-medium text-[#374151]">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mr-2 shrink-0`} />
      <span>{label}</span>
    </span>
  );
}

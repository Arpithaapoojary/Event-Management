import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Users, Edit2, Eye, RotateCcw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge, CategoryBadge } from './Badge';
import Button from './Button';

/**
 * Enterprise Event Detail Drawer
 * - Slides in from right (Linear / Stripe style)
 * - Shows all fields: Title, description, category, venue, datetime, capacity, attendance metrics
 * - Actions: Edit, View Registrations Roster, Close
 * - Keyboard accessible (Escape to close)
 */
export default function EventDetailDrawer({
  isOpen,
  event,
  onClose,
  onEdit,
  onViewRoster,
  onRestore,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const eventDateObj = new Date(event.dateTime);
  const formattedDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const registeredCount = event.registeredCount || 0;
  const capacity = event.capacity || 1;
  const occupancyPercent = Math.min(100, Math.round((registeredCount / capacity) * 100));

  let progressColor = 'bg-[#0F172A]';
  if (event.isDeleted) {
    progressColor = 'bg-[#9CA3AF]';
  } else if (occupancyPercent >= 100) {
    progressColor = 'bg-[#EF4444]';
  } else if (occupancyPercent >= 80) {
    progressColor = 'bg-[#F59E0B]';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150 cursor-pointer"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          className="w-screen max-w-lg bg-white border-l border-[#E5E7EB] shadow-[0_16px_36px_rgba(0,0,0,0.12)] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
        >
          {/* Top Bar Header */}
          <div className="p-6 border-b border-[#E5E7EB] sticky top-0 bg-white z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-[#6B7280]">Event Details</span>
              <span className="text-[#D1D5DB]">·</span>
              <span className="text-[11px] font-mono text-[#6B7280]">ID: {event._id ? event._id.slice(-6).toUpperCase() : ''}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Soft-deleted notice banner */}
            {event.isDeleted && (
              <div className="p-3.5 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold text-[#991B1B]">Event Deactivated (Soft-Deleted)</div>
                  <div className="text-[12px] text-[#B91C1C] mt-0.5">
                    This event is archived and hidden from the public catalog. Registrations are preserved.
                  </div>
                </div>
                {onRestore && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={RotateCcw}
                    onClick={() => onRestore(event)}
                  >
                    Restore
                  </Button>
                )}
              </div>
            )}

            {/* Thumbnail banner */}
            <div className="w-full h-44 rounded-[8px] overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6] relative">
              <img
                src={event.imageUrl}
                alt=""
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <CategoryBadge category={event.category} />
                <StatusBadge
                  status={event.status}
                  seatsLeft={event.seatsLeft}
                  capacity={event.capacity}
                  registeredCount={event.registeredCount}
                />
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h1 id="drawer-title" className="text-[20px] font-semibold text-[#111827] leading-tight">
                {event.title}
              </h1>
              <p className="text-[13px] text-[#4B5563] mt-3 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Schedule & Venue Specifications */}
            <div className="grid grid-cols-1 gap-3.5 pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 stroke-[1.5] text-[#6B7280] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Date &amp; Time
                  </div>
                  <div className="text-[13px] font-medium text-[#111827] tabular-nums mt-0.5">
                    {formattedDate}
                  </div>
                  <div className="text-[12px] text-[#6B7280] tabular-nums">
                    Starts at {formattedTime}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 stroke-[1.5] text-[#6B7280] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Campus Venue
                  </div>
                  <div className="text-[13px] font-medium text-[#111827] mt-0.5">
                    {event.venue}
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance & Capacity Metric Box */}
            <div className="p-4 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  <Users className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Attendance Capacity</span>
                </div>
                <span className="text-[12px] font-semibold text-[#111827] tabular-nums">
                  {occupancyPercent}% Occupancy
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[13px] pt-1">
                <span className="text-[#6B7280]">
                  Registered:{' '}
                  <strong className="text-[#111827] font-semibold tabular-nums">
                    {registeredCount}
                  </strong>
                </span>
                <span className="text-[#6B7280]">
                  Total Capacity:{' '}
                  <strong className="text-[#111827] font-semibold tabular-nums">
                    {capacity}
                  </strong>
                </span>
                <span className="text-[#6B7280]">
                  Seats Left:{' '}
                  <strong className="text-[#111827] font-semibold tabular-nums">
                    {Math.max(0, capacity - registeredCount)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Public catalog preview link */}
            {!event.isDeleted && (
              <div className="pt-2">
                <Link
                  to={`/events/${event._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0F172A] hover:underline"
                >
                  <span>View Public Event Page</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                </Link>
              </div>
            )}
          </div>

          {/* Drawer Actions Footer */}
          <div className="p-6 border-t border-[#E5E7EB] bg-[#F9FAFB] sticky bottom-0 flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={Eye}
              onClick={() => {
                onClose();
                onViewRoster?.(event);
              }}
            >
              View Roster ({registeredCount})
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Edit2}
                onClick={() => {
                  onClose();
                  onEdit?.(event);
                }}
              >
                Edit Event
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

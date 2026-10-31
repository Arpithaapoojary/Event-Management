import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

import { resolveImageUrl, FALLBACK_EVENT_IMAGE } from '../../utils/imageUrl';

export default function EventCard({ event }) {
  // Format Date and Time
  const eventDate = new Date(event.dateTime);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Status Badge Text
  let badgeText = 'Open to All';
  if (event.status === 'FULL') {
    badgeText = 'Registration Full';
  } else if (event.status === 'PAST') {
    badgeText = 'Event Concluded';
  } else if (event.seatsLeft !== undefined && event.seatsLeft <= 40 && event.seatsLeft > 0) {
    badgeText = `${event.seatsLeft} Seats Left`;
  }

  return (
    <div className="relative bg-white rounded-[16px] p-4 shadow-2xs hover:shadow-md transition-all duration-200 border border-slate-200/90 flex flex-col justify-between overflow-hidden group">
      {/* 180px Image Container with 12px radius */}
      <div className="relative w-full h-[180px] rounded-[12px] overflow-hidden bg-slate-100 mb-3 shrink-0">
        <img
          src={resolveImageUrl(event.imageUrl)}
          alt={event.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_EVENT_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />
      </div>

      {/* Card Content & Action Bar */}
      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Category & Status Badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
          <span className="bg-slate-900 text-white font-semibold text-[11px] sm:text-[12px] px-2.5 py-1 rounded-[6px] uppercase tracking-wider">
            {event.category || 'Cultural'}
          </span>
          <span className="bg-[#FFC700] text-slate-950 font-semibold text-[11px] sm:text-[12px] px-2.5 py-1 rounded-[6px] inline-block uppercase tracking-wider">
            {badgeText}
          </span>
        </div>

        {/* Card Title: 20px weight 600/700 font-display */}
        <h3 className="text-[18px] sm:text-[20px] font-bold font-display text-slate-950 tracking-tight mb-1 group-hover:text-black transition-colors line-clamp-1 w-full px-1">
          {event.title}
        </h3>

        {/* Card Subtitle: 14px */}
        <p className="text-[14px] font-normal text-slate-600 mb-3 line-clamp-1 w-full px-1">
          {formattedDate} • {event.venue}
        </p>

        {/* Bottom Action Bar: 40px height, 8px radius, 14px font */}
        <div className="w-full flex items-center gap-2">
          <Link
            to={`/events/${event._id || event.id}`}
            className="flex-1 h-10 px-4 rounded-[8px] bg-slate-950 hover:bg-black text-white font-medium text-[14px] transition-colors flex items-center justify-center text-center cursor-pointer active:scale-98"
          >
            View Details
          </Link>

          <Link
            to={`/events/${event._id || event.id}`}
            title={`Venue: ${event.venue} (${formattedDate})`}
            className="w-10 h-10 rounded-[8px] bg-slate-950 hover:bg-black text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-98"
          >
            <MapPin className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80';

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
    <div className="relative bg-white rounded-[32px] p-5 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100/90 flex flex-col justify-between overflow-hidden group">
      {/* Clean Image Container with smooth scale animation (no colored box / plates) */}
      <div className="relative w-full aspect-[16/11] sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 mb-5 shadow-xs">
        <img
          src={event.imageUrl}
          alt={event.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </div>

      {/* Card Content & Action Bar - Centered matching main cards */}
      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Bright Golden-Yellow Pill Badge */}
        <span className="bg-[#FFC700] text-slate-950 font-black text-xs px-4 py-1.5 rounded-full inline-block mb-2.5 shadow-xs uppercase tracking-wider">
          {badgeText}
        </span>

        {/* Bold Display Card Title */}
        <h3 className="text-2xl sm:text-[25px] font-black font-display text-slate-950 tracking-tight mb-1 group-hover:text-black transition-colors line-clamp-1 w-full px-1">
          {event.title}
        </h3>

        {/* Subtitle / Venue & Date */}
        <p className="text-xs font-bold text-slate-600 mb-5 tracking-wide line-clamp-1 w-full px-2">
          {formattedDate} • {event.venue}
        </p>

        {/* Bottom Action Bar: Black Pill + Black Circle Pin Button */}
        <div className="w-full flex items-center gap-3">
          <Link
            to={`/events/${event._id || event.id}`}
            className="flex-1 py-3.5 px-6 rounded-full bg-slate-950 hover:bg-black text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 text-center cursor-pointer"
          >
            View Details
          </Link>

          <Link
            to={`/events/${event._id || event.id}`}
            title={`Venue: ${event.venue} (${formattedDate})`}
            className="w-12 h-12 rounded-full bg-slate-950 hover:bg-black text-white flex items-center justify-center shrink-0 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <MapPin className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}

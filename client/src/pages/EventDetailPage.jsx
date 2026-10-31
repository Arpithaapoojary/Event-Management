import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import api from '../api/client';
import RegistrationModal from '../components/events/RegistrationModal';
import { resolveImageUrl, FALLBACK_EVENT_IMAGE } from '../utils/imageUrl';

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        setError(err.message || 'Event could not be found.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDF5FB] py-16 px-4">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-10 w-44 bg-white/70 rounded-full mb-8 shadow-xs" />
          <div className="bg-white rounded-[36px] p-8 shadow-sm">
            <div className="aspect-[21/9] bg-slate-200 rounded-3xl mb-8" />
            <div className="h-10 w-2/3 bg-slate-200 rounded-xl mb-4" />
            <div className="h-5 w-full bg-slate-100 rounded mb-2" />
            <div className="h-5 w-4/5 bg-slate-100 rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-slate-100 rounded-2xl" />
              <div className="h-24 bg-slate-100 rounded-2xl" />
              <div className="h-24 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#EDF5FB] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-white rounded-[32px] border border-slate-200/80 p-8 shadow-lg">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black font-display text-slate-950 mb-2">Event Not Available</h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">{error || 'This event may have been removed or does not exist.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-950 hover:bg-black text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Event Lineup</span>
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.dateTime);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const capacityPercent = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / (event.capacity || 1)) * 100)
  );

  return (
    <div className="min-h-screen bg-[#EDF5FB] text-slate-900 pb-16 selection:bg-slate-200 selection:text-slate-900">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-white hover:bg-slate-50 border border-slate-200 text-[14px] font-medium text-slate-800 shadow-2xs transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Event Lineup</span>
          </Link>

          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-slate-500 font-display hidden sm:inline-block">
            ANNUAL CAMPUS EVENT 2026
          </span>
        </div>

        {/* Success Registration Notice Banner */}
        {registrationMessage && (
          <div className="mb-6 p-4 rounded-[12px] bg-white border border-emerald-300 shadow-2xs flex items-start sm:items-center justify-between gap-3 animate-hero-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[8px] bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-[15px] text-slate-950 flex items-center gap-2">
                  <span>Registration Confirmed!</span>
                  <span className="text-[11px] font-semibold bg-[#FFC700] text-slate-950 px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                    Pass Issued
                  </span>
                </h4>
                <p className="text-[13px] text-slate-600 mt-0.5">{registrationMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setRegistrationMessage(null)}
              className="p-1.5 rounded-[6px] hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* MAIN EVENT SHOWCASE CARD (16px radius, compact padding)  */}
        {/* ======================================================== */}
        <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-2xs border border-slate-200 overflow-hidden mb-6">
          {/* Hero Banner Container */}
          <div className="relative h-56 sm:h-64 lg:h-72 w-full rounded-[12px] overflow-hidden bg-slate-950 mb-5 shadow-2xs group">
            <img
              src={resolveImageUrl(event.imageUrl)}
              alt={event.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_EVENT_IMAGE;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Status Badge in Top Right */}
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-[#FFC700] text-slate-950 font-semibold text-[11px] sm:text-[12px] px-2.5 py-1 rounded-[6px] inline-block shadow-2xs uppercase tracking-wider">
                {event.status === 'FULL'
                  ? 'Registration Full'
                  : event.status === 'PAST'
                  ? 'Event Concluded'
                  : `${event.seatsLeft} Seats Left`}
              </span>
            </div>

            {/* Category and Official Pass pill in Bottom Left */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 flex-wrap">
              <span className="bg-slate-950 text-white font-semibold text-[11px] sm:text-[12px] px-2.5 py-1 rounded-[6px] shadow-2xs uppercase tracking-wider">
                {event.category || 'Cultural'}
              </span>
              <span className="bg-slate-950/85 backdrop-blur-md text-white font-semibold text-[11px] sm:text-[12px] px-2.5 py-1 rounded-[6px] shadow-2xs inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Campus Event</span>
              </span>
            </div>
          </div>

          {/* Eyebrow with Category */}
          <div className="mb-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-indigo-600 font-display">
              {event.category || 'Cultural'} ARENA
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-slate-500 font-display">
              EVENT DETAILS &amp; PASS REGISTRATION
            </span>
          </div>

          {/* Clean Modern Headline */}
          <h1 className="text-[clamp(24px,3vw,36px)] font-black font-display text-slate-950 tracking-tight leading-tight mb-5">
            {event.title}
          </h1>

          {/* Key Info Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {/* 1. Schedule Card */}
            <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-200/80 flex items-start gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-[6px] bg-slate-950 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block mb-0.5">
                  Schedule
                </span>
                <span className="text-[14px] font-semibold text-slate-950 block truncate">
                  {formattedDate}
                </span>
                <span className="text-[12px] font-normal text-slate-600 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formattedTime}</span>
                </span>
              </div>
            </div>

            {/* 2. Venue Card */}
            <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-200/80 flex items-start gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-[6px] bg-slate-950 text-white flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block mb-0.5">
                  Location &amp; Venue
                </span>
                <span className="text-[14px] font-semibold text-slate-950 block truncate">
                  {event.venue}
                </span>
                <span className="text-[12px] font-normal text-slate-600 block mt-0.5">
                  University Main Campus
                </span>
              </div>
            </div>

            {/* 3. Capacity Card */}
            <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-200/80 flex items-start gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-[6px] bg-slate-950 text-white flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                    Seats Capacity
                  </span>
                  <span className="text-[13px] font-semibold text-slate-900 tabular-nums">
                    {event.registeredCount || 0} / {event.capacity}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      event.status === 'FULL'
                        ? 'bg-rose-500'
                        : event.status === 'PAST'
                        ? 'bg-slate-400'
                        : 'bg-slate-950'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-normal text-slate-600 block mt-1">
                  {event.seatsLeft > 0 ? `${event.seatsLeft} seats remaining` : 'Full capacity'}
                </span>
              </div>
            </div>
          </div>

          {/* About this Event */}
          <div className="mb-6">
            <h2 className="text-[20px] font-bold font-display text-slate-950 tracking-tight mb-2">
              About this Event
            </h2>
            <p className="text-slate-600 text-[14px] sm:text-[15px] leading-relaxed font-normal whitespace-pre-line max-w-3xl">
              {event.description}
            </p>
          </div>

          {/* Registration Action Bar */}
          <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <span className="text-[12px] font-medium uppercase tracking-wider text-slate-500 block">
                Registration Status
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    event.status === 'UPCOMING' && event.seatsLeft > 0
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-[14px] sm:text-[15px] font-semibold text-slate-950">
                  {event.status === 'UPCOMING'
                    ? `${event.seatsLeft} seats currently available`
                    : event.status === 'FULL'
                    ? 'Registration closed - Maximum capacity reached'
                    : 'Event has concluded'}
                </span>
              </div>
            </div>

            {registrationMessage ? (
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-emerald-500 text-white font-medium text-[14px] shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>You're Registered</span>
                </div>
                {event.status === 'UPCOMING' && event.seatsLeft > 0 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-[13px] font-medium text-slate-900 hover:text-black underline px-2 py-1 cursor-pointer"
                  >
                    Register another attendee
                  </button>
                )}
              </div>
            ) : event.status === 'UPCOMING' && event.seatsLeft > 0 ? (
              <button
                id="register-now-btn"
                onClick={() => setIsModalOpen(true)}
                className="h-10 px-5 rounded-[8px] bg-slate-950 hover:bg-black text-white font-medium text-[14px] transition-colors cursor-pointer text-center active:scale-98 shadow-xs"
              >
                Register for this Event
              </button>
            ) : (
              <button
                disabled
                className="h-10 px-5 rounded-[8px] bg-slate-200 text-slate-400 font-medium text-[14px] cursor-not-allowed text-center"
              >
                Registration Closed
              </button>
            )}
          </div>
        </div>

        {/* Registration Modal Dialog */}
        <RegistrationModal
          event={event}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(result) => {
            if (result) {
              setEvent((prev) => ({
                ...prev,
                registeredCount: result.registeredCount ?? ((prev.registeredCount || 0) + 1),
                seatsLeft: result.seatsLeft !== undefined ? result.seatsLeft : Math.max(0, (prev.seatsLeft || 1) - 1),
                status: result.status || (result.seatsLeft === 0 ? 'FULL' : prev.status),
              }));
              setRegistrationMessage(
                `Success! You are confirmed for "${event.title}". Your digital ticket reference has been issued.`
              );
            }
          }}
        />
      </div>
    </div>
  );
}

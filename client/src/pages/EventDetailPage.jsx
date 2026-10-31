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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

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
    <div className="min-h-screen bg-[#EDF5FB] text-slate-900 pb-24 selection:bg-slate-200 selection:text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Navigation Bar matching aesthetic */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-extrabold text-slate-900 shadow-2xs hover:shadow-xs transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Event Lineup</span>
          </Link>

          <span className="text-xs font-black tracking-[0.2em] uppercase text-slate-500 font-display hidden sm:inline-block">
            ANNUAL CAMPUS EVENT 2026
          </span>
        </div>

        {/* Success Registration Notice Banner */}
        {registrationMessage && (
          <div className="mb-8 p-5 rounded-[28px] bg-white border border-emerald-300 shadow-lg flex items-start sm:items-center justify-between gap-4 animate-hero-fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black font-display text-base text-slate-950 flex items-center gap-2">
                  <span>Registration Confirmed!</span>
                  <span className="text-[11px] font-extrabold bg-[#FFC700] text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Pass Issued
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">{registrationMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setRegistrationMessage(null)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* MAIN EVENT SHOWCASE CARD (Matching HomePage rounded-[36px]) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-[24px] sm:rounded-[36px] p-5 sm:p-10 shadow-xl border border-white/80 overflow-hidden mb-8">
          {/* Hero Banner Container */}
          <div className="relative aspect-[16/10] sm:aspect-[21/9] sm:h-96 min-h-[200px] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 mb-6 sm:mb-8 shadow-sm group">
            <img
              src={event.imageUrl}
              alt={event.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMAGE;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Status Badge in Top Right */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              <span className="bg-[#FFC700] text-slate-950 font-black text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full inline-block shadow-md uppercase tracking-wider">
                {event.status === 'FULL'
                  ? 'Registration Full'
                  : event.status === 'PAST'
                  ? 'Event Concluded'
                  : `${event.seatsLeft} Seats Left`}
              </span>
            </div>

            {/* Category and Official Pass pill in Bottom Left */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="bg-slate-950 text-white font-extrabold text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md uppercase tracking-wider">
                {event.category || 'Cultural'}
              </span>
              <span className="bg-slate-950/85 backdrop-blur-md text-white font-extrabold text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Campus Event</span>
              </span>
            </div>
          </div>

          {/* Super-Kicker with Category */}
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black tracking-[0.2em] uppercase text-indigo-600 font-sans">
              {event.category || 'Cultural'} ARENA
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-slate-500 font-sans">
              EVENT DETAILS &amp; PASS REGISTRATION
            </span>
          </div>

          {/* Clean Modern Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-950 tracking-normal leading-snug mb-8 font-sans">
            {event.title}
          </h1>

          {/* ======================================================== */}
          {/* KEY INFO HIGHLIGHT CARDS (Schedule, Venue, Capacity) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* 1. Schedule Card */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5 font-sans">
                  Schedule
                </span>
                <span className="text-sm font-bold text-slate-950 block truncate">
                  {formattedDate}
                </span>
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formattedTime}</span>
                </span>
              </div>
            </div>

            {/* 2. Venue Card */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5 font-sans">
                  Location &amp; Venue
                </span>
                <span className="text-sm font-bold text-slate-950 block truncate">
                  {event.venue}
                </span>
                <span className="text-xs font-medium text-slate-600 block mt-0.5">
                  University Main Campus
                </span>
              </div>
            </div>

            {/* 3. Capacity Card */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block font-sans">
                    Seats Capacity
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {event.registeredCount || 0} / {event.capacity}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      event.status === 'FULL'
                        ? 'bg-rose-500'
                        : event.status === 'PAST'
                        ? 'bg-slate-400'
                        : 'bg-slate-950'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 block mt-1.5">
                  {event.seatsLeft > 0 ? `${event.seatsLeft} seats remaining` : 'Full capacity'}
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ABOUT THIS EVENT DESCRIPTION */}
          {/* ======================================================== */}
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-normal mb-4 font-sans">
              About this Event
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal whitespace-pre-line max-w-3xl">
              {event.description}
            </p>


          </div>

          {/* ======================================================== */}
          {/* REGISTRATION ACTION BAR */}
          {/* ======================================================== */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans block">
                Registration Status
              </span>
              <div className="flex items-center gap-2.5 mt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    event.status === 'UPCOMING' && event.seatsLeft > 0
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-base sm:text-lg font-bold text-slate-950 font-sans">
                  {event.status === 'UPCOMING'
                    ? `${event.seatsLeft} seats currently available`
                    : event.status === 'FULL'
                    ? 'Registration closed - Maximum capacity reached'
                    : 'Event has concluded'}
                </span>
              </div>
            </div>

            {registrationMessage ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500 text-white font-extrabold text-sm shadow-md">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>You're Registered</span>
                </div>
                {event.status === 'UPCOMING' && event.seatsLeft > 0 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-extrabold text-slate-900 hover:text-black underline px-3 py-2 cursor-pointer"
                  >
                    Register another attendee
                  </button>
                )}
              </div>
            ) : event.status === 'UPCOMING' && event.seatsLeft > 0 ? (
              <button
                id="register-now-btn"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-950 hover:bg-black text-white font-extrabold text-sm sm:text-base tracking-wide shadow-md hover:shadow-2xl transition-all active:scale-95 cursor-pointer text-center"
              >
                Register for this Event
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-200 text-slate-400 font-extrabold text-sm sm:text-base cursor-not-allowed text-center"
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

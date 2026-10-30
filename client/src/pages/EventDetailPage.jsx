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
import StatusBadge from '../components/common/StatusBadge';
import RegistrationModal from '../components/events/RegistrationModal';

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
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
        <div className="aspect-[21/9] bg-slate-200 rounded-3xl mb-8" />
        <div className="h-8 w-2/3 bg-slate-200 rounded mb-4" />
        <div className="h-4 w-full bg-slate-200 rounded mb-2" />
        <div className="h-4 w-5/6 bg-slate-200 rounded" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-lg mx-auto my-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Event Not Available</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This event may have been removed.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Events Catalog</span>
        </Link>

        {/* Success Registration Notice Banner */}
        {registrationMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                  <span>Registration Confirmed!</span>
                  <span className="text-[11px] font-semibold bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full">
                    Success
                  </span>
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">{registrationMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setRegistrationMessage(null)}
              className="p-1 rounded-lg text-emerald-600 hover:text-emerald-950 hover:bg-emerald-100/60 transition"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-8">
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute top-4 right-4">
              <StatusBadge status={event.status} seatsLeft={event.seatsLeft} />
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {/* Title & Metadata Header */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-indigo-600 mb-3">
              <span className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedTime}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
              {event.title}
            </h1>

            {/* Grid of Key Info Chips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-indigo-600 shadow-sm border border-slate-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 block">Event Venue</span>
                  <span className="text-sm font-bold text-slate-800">{event.venue}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-indigo-600 shadow-sm border border-slate-200">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 block">Registration Seats</span>
                    <span className="text-xs font-bold text-slate-700">
                      {event.registeredCount || 0} / {event.capacity} Filled
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${
                        event.status === 'FULL'
                          ? 'bg-rose-500'
                          : event.status === 'PAST'
                          ? 'bg-slate-400'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">About this Event</h2>
              <div className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Registration Action Area */}
            <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Registration Status</span>
                <span className="text-sm font-bold text-slate-900">
                  {event.status === 'UPCOMING'
                    ? `${event.seatsLeft} seats currently available`
                    : event.status === 'FULL'
                    ? 'Registration closed - Maximum capacity reached'
                    : 'Event has concluded'}
                </span>
              </div>

              {registrationMessage ? (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You're Registered</span>
                  </div>
                  {event.status === 'UPCOMING' && event.seatsLeft > 0 && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline px-2 py-1"
                    >
                      Register another attendee
                    </button>
                  )}
                </div>
              ) : event.status === 'UPCOMING' ? (
                <button
                  id="register-now-btn"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  Register for this Event
                </button>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-200 text-slate-400 font-semibold text-sm cursor-not-allowed"
                >
                  Registration Closed
                </button>
              )}
            </div>
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

import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, seatsLeft }) {
  if (status === 'PAST') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <Clock className="w-3.5 h-3.5" />
        <span>Event Ended</span>
      </span>
    );
  }

  if (status === 'FULL') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Sold Out</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span>{seatsLeft !== undefined ? `${seatsLeft} seats left` : 'Registration Open'}</span>
    </span>
  );
}

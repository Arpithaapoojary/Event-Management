import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function StatusBadge({ status, seatsLeft }) {
  if (status === 'PAST') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>Concluded</span>
      </span>
    );
  }

  if (status === 'FULL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
        <span>Sold Out</span>
      </span>
    );
  }

  if (seatsLeft !== undefined && seatsLeft <= 10 && seatsLeft > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Only {seatsLeft} left</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>{seatsLeft !== undefined ? `${seatsLeft} seats open` : 'Open'}</span>
    </span>
  );
}

import React from 'react';
import { Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 p-8 text-center transition-all">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 ring-8 ring-indigo-50/50">
          <Calendar className="w-8 h-8" />
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-4">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>React & Tailwind CSS Setup Ready</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-3">
          Parrophins Event Management
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          The client setup has been configured with React 18, Tailwind CSS, Lucide icons, and modern typography.
        </p>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-left text-xs sm:text-sm text-slate-600">
          <span className="font-medium text-slate-800">Ready to commit to Git:</span>
          <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-slate-200 text-indigo-600">
            git add . &amp;&amp; git commit
          </span>
        </div>
      </div>
    </div>
  );
}

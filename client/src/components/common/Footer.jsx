import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} EventFlow Event Management Platform. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Staff / Coordinator Portal</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}


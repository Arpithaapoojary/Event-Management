import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  KeyRound,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import api from '../../api/client';

export default function AdminLoginPage() {
  const [searchParams] = useSearchParams();
  const isSessionExpired = searchParams.get('reason') === 'expired';

  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    isSessionExpired ? 'Your session has ended. Please sign in again.' : null
  );
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter your coordinator passcode.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/admin/login', { passcode: passcode.trim() });
      if (res && res.token) {
        sessionStorage.setItem('admin_token', res.token);
        localStorage.setItem('admin_token', res.token);
        navigate('/admin');
      }
    } catch (err) {
      setError(
        err.message || 'Invalid passcode. Please verify and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 px-4 py-12 font-sans selection:bg-slate-200">
      <div className="w-full max-w-sm">
        {/* Navigation back to public portal */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to site</span>
          </Link>
          <span className="text-[12px] font-medium text-slate-400">
            Administrative Area
          </span>
        </div>

        {/* Clean, Professional Authentication Card (Stripe / Linear standard) */}
        <div className="w-full bg-white rounded-[12px] border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-7 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="w-10 h-10 rounded-[8px] bg-slate-950 text-white flex items-center justify-center mb-4 shadow-2xs">
              <Lock className="w-5 h-5 text-slate-200" />
            </div>
            <h1 className="text-[20px] font-bold text-slate-950 font-display tracking-tight">
              Coordinator Portal
            </h1>
            <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
              Sign in with your administrative passcode to manage campus events and registrations.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="admin-passcode"
                className="block text-[13px] font-medium text-slate-800 mb-1.5"
              >
                Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-passcode"
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your passcode"
                  disabled={loading}
                  autoFocus
                  autoComplete="current-password"
                  className="w-full h-10 pl-10 pr-10 text-[14px] rounded-[8px] border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !passcode.trim()}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-[8px] bg-slate-950 hover:bg-black active:bg-slate-950 text-white text-[14px] font-medium transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-950"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Discrete Subtitle */}
        <p className="text-center text-[12px] text-slate-400 mt-6 font-normal">
          EventFlow Campus Management System
        </p>
      </div>
    </div>
  );
}

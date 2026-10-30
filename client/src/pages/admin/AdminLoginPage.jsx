import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  KeyRound,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/client';

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the administrative passcode.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/admin/login', { passcode: passcode.trim() });
      if (res && res.token) {
        localStorage.setItem('admin_token', res.token);
        navigate('/admin');
      }
    } catch (err) {
      setError(
        err.message || 'Invalid administrative passcode. Please verify and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoPasscode = () => {
    setPasscode('admin2026');
    if (error) setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#EDF5FB] px-4 py-12 font-sans selection:bg-slate-200">
      <div className="w-full max-w-md">
        {/* Navigation back to public portal */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 shadow-2xs hover:shadow-xs transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to EventFlow</span>
          </Link>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Institutional Console
          </span>
        </div>

        {/* Login Card Matching Platform Template */}
        <div className="w-full bg-white rounded-[32px] border border-white/80 shadow-2xl overflow-hidden animate-modal-in">
          {/* Header block (Matching Template) */}
          <div className="bg-slate-950 px-8 py-7 text-white text-center relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC700] text-slate-950 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrative Access</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Campus Event Operations
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-normal">
              Authorized coordinators &amp; institutional faculty login
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Passcode input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Coordinator Passcode <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter coordinator passcode"
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-2xl border border-slate-200 bg-white focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10 focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Quick Demo Autofill Chip */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={fillDemoPasscode}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Auto-fill Demo: <strong>admin2026</strong></span>
                  </button>
                  <span className="text-[11px] text-slate-400">Key Protected</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-slate-950 hover:bg-black active:scale-98 text-white font-semibold text-sm transition-all shadow-md hover:shadow-xl disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Authorization...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Coordinator Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institutional Multi-Role Authentication Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

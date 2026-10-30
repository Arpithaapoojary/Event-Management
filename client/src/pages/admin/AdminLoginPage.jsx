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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50/70 px-4 py-12 font-sans selection:bg-slate-200">
      <div className="w-full max-w-md animate-hero-fade-up">
        {/* Navigation back to public portal */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Public Portal</span>
          </Link>
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">
            Institutional Console
          </span>
        </div>

        {/* Login Card - Clean White Professional Architecture */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300">
          {/* Header block (Clean White Executive Styling) */}
          <div className="px-8 pt-8 pb-6 bg-white border-b border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 shadow-sm animate-float-gentle">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
              <span>Admin Authentication</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Campus Event Operations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Authorized coordinators and institutional faculty sign-in
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Passcode input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
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
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400 font-medium"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Auto-fill Demo: <strong>admin2026</strong></span>
                  </button>
                  <span className="text-xs text-slate-500 font-medium">Secured Session</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-black active:scale-98 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer"
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
          <div className="px-8 py-3.5 bg-slate-50/80 border-t border-slate-100 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Institutional Multi-Role Authentication Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

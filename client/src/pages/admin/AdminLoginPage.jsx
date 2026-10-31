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
} from 'lucide-react';
import api from '../../api/client';

export default function AdminLoginPage() {
  const [searchParams] = useSearchParams();
  const isSessionExpired = searchParams.get('reason') === 'expired';

  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    isSessionExpired ? 'Session expired. Please enter passcode to sign in again.' : null
  );
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
        sessionStorage.setItem('admin_token', res.token);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12 font-sans text-[#0F172A]">
      <div className="w-full max-w-sm">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to site</span>
          </Link>
          <span className="text-[12px] text-[#64748B]">
            Admin Console
          </span>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white rounded-[8px] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
            <h1 className="text-[18px] leading-[26px] font-semibold text-[#0F172A] tracking-[-0.01em]">
              EventFlow Admin
            </h1>
            <p className="text-[13px] leading-[18px] text-[#64748B] mt-0.5">
              Enter coordinator passcode to access dashboard.
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-[6px] bg-[#FEF2F2] border border-[#DC2626]/20 text-[#DC2626] text-[13px] font-normal flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-[#0F172A] mb-1">
                  Passcode <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
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
                    autoFocus
                    className="w-full h-[36px] pl-9 pr-9 text-[14px] rounded-[6px] border border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#64748B] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !passcode.trim()}
                className="w-full h-[36px] flex items-center justify-center gap-2 rounded-[6px] bg-[#0F172A] hover:bg-[#1E293B] active:bg-[#0F172A] text-white text-[14px] font-medium transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

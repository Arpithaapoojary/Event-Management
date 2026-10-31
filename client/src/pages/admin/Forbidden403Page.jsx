import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '../../components/admin/enterprise';

export default function Forbidden403Page() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-12 font-sans text-[#0F172A]">
      <div className="w-full max-w-sm text-center">
        {/* Monoline Icon Badge */}
        <div className="w-10 h-10 rounded-[6px] bg-white border border-[#E2E8F0] text-[#0F172A] flex items-center justify-center mx-auto mb-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
        </div>

        {/* Heading & Details */}
        <h1 className="text-[20px] leading-[28px] font-semibold text-[#0F172A] tracking-[-0.01em] mb-1">
          Access Restricted
        </h1>
        <p className="text-[13px] leading-[18px] text-[#64748B] mb-6">
          Access to the EventFlow Admin Console is restricted to authorized coordinators.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link to="/admin/login">
            <Button variant="primary" size="md" icon={KeyRound}>
              Sign in as admin
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="md" icon={ArrowLeft}>
              Return to catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

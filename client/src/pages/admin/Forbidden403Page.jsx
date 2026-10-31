import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '../../components/admin/enterprise';

export default function Forbidden403Page() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12 font-sans selection:bg-slate-200">
      <div className="w-full max-w-md text-center">
        {/* Monoline Icon Badge */}
        <div className="w-12 h-12 rounded-[10px] bg-white border border-[#E5E7EB] text-[#111827] flex items-center justify-center mx-auto mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <ShieldAlert className="w-6 h-6 stroke-[1.5] text-[#EF4444]" />
        </div>

        {/* Status Tag */}
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] bg-[#F3F4F6] text-[#374151] text-[12px] font-mono font-medium mb-3 border border-[#E5E7EB] tabular-nums">
          HTTP 403 · FORBIDDEN
        </div>

        {/* Heading & Details */}
        <h1 className="text-[24px] font-semibold text-[#111827] tracking-[-0.01em] leading-tight mb-2">
          Administrative Privileges Required
        </h1>
        <p className="text-[14px] text-[#6B7280] leading-relaxed mb-6">
          Access to the EventFlow Admin Console is restricted to authorized coordinators. Your current session does not possess valid administrative privileges.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/admin/login">
            <Button variant="primary" size="md" icon={KeyRound}>
              Log In as Admin
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="md" icon={ArrowLeft}>
              Return to Catalog
            </Button>
          </Link>
        </div>

        {/* Footer Audit Notice */}
        <p className="text-[12px] text-[#9CA3AF] mt-8">
          All administrative access attempts are monitored and recorded for institutional compliance.
        </p>
      </div>
    </div>
  );
}

import React from 'react';

/**
 * Standard Design Token Button (Linear / Stripe / Vercel style)
 * - Control height: 36px (size="md"), 6px radius
 * - Focus ring: #2563EB
 * - Primary: #0F172A (one per screen)
 * - Secondary: White with #E2E8F0 border, subtle shadow 0 1px 2px rgba(0,0,0,0.05)
 * - Ghost: Transparent, hover #F1F5F9
 * - Danger: #DC2626
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#0F172A] hover:bg-[#1E293B] active:bg-[#0F172A] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-transparent',
    secondary:
      'bg-white hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
    ghost:
      'bg-transparent hover:bg-[#F1F5F9] active:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]',
    danger:
      'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-transparent',
  };

  const sizes = {
    sm: 'h-[32px] px-2.5 text-[13px] rounded-[6px] gap-1.5',
    md: 'h-[36px] px-3.5 text-[14px] rounded-[6px] gap-2',
    icon: 'w-[36px] h-[36px] rounded-[6px] p-0',
    'icon-sm': 'w-[32px] h-[32px] rounded-[6px] p-0',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 stroke-[1.5] shrink-0 text-current" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 stroke-[1.5] shrink-0 text-current" />
      )}
    </button>
  );
}

import React from 'react';

/**
 * Enterprise Button Component
 * - Variants:
 *   - primary: Deep navy #0F172A (hover #1E293B, focus ring #0F172A/20)
 *   - secondary: 1px border #E5E7EB, bg-white, text #111827 (hover bg #F9FAFB)
 *   - ghost: transparent, text #6B7280 (hover text #111827, hover bg #F3F4F6)
 *   - danger-ghost: transparent, text #6B7280 (hover text #EF4444, hover bg #FEF2F2)
 *   - danger: bg #DC2626 (hover #B91C1C, text white)
 * - Sizes:
 *   - sm: 32px height, 13px text
 *   - md: 36px height, 13-14px text
 *   - icon-sm: 32x32px square icon button
 *   - icon-md: 36x36px square icon button
 * - Radius: 8px (controls) / 6px (icon buttons)
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
    'inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#0F172A] hover:bg-[#1E293B] active:bg-[#0F172A] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-transparent',
    secondary:
      'bg-white hover:bg-[#F9FAFB] active:bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
    ghost:
      'bg-transparent hover:bg-[#F3F4F6] active:bg-[#E5E7EB] text-[#6B7280] hover:text-[#111827]',
    'danger-ghost':
      'bg-transparent hover:bg-[#FEF2F2] active:bg-[#FEE2E2] text-[#6B7280] hover:text-[#EF4444]',
    danger:
      'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-transparent',
  };

  const sizes = {
    sm: 'h-8 px-2.5 text-[13px] rounded-[8px] gap-1.5',
    md: 'h-9 px-3.5 text-[13px] rounded-[8px] gap-2',
    lg: 'h-10 px-4 text-[14px] rounded-[8px] gap-2',
    'icon-sm': 'w-8 h-8 rounded-[6px] p-0',
    'icon-md': 'w-9 h-9 rounded-[8px] p-0',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 stroke-[1.5] shrink-0" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 stroke-[1.5] shrink-0" />
      )}
    </button>
  );
}

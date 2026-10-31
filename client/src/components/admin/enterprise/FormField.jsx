import React from 'react';

/**
 * Standard Design Token FormField Component (Linear / Stripe style)
 * - 13px font-medium #0F172A label, required marked with * #DC2626
 * - Helper text in muted gray #64748B
 * - Inline error in red #DC2626
 */
export default function FormField({
  id,
  label,
  required = false,
  helperText,
  error,
  currentLength,
  maxLength,
  children,
  className = '',
}) {
  const errorId = id ? `${id}-error` : undefined;
  const helperId = id ? `${id}-helper` : undefined;

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label and Character Count */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-[13px] font-medium text-[#0F172A]"
        >
          {label}
          {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </label>

        {maxLength !== undefined && (
          <span className="text-[12px] text-[#64748B] tabular-nums">
            {currentLength || 0} / {maxLength}
          </span>
        )}
      </div>

      {/* Control Input */}
      {children}

      {/* Helper text if no error */}
      {helperText && !error && (
        <p id={helperId} className="text-[12px] text-[#64748B]">
          {helperText}
        </p>
      )}

      {/* Inline Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-[12px] text-[#DC2626] font-normal"
        >
          {error}
        </p>
      )}
    </div>
  );
}

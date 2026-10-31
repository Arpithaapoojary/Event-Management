import React from 'react';

/**
 * Enterprise Form Field Component
 * - Standardized typography (13px label, 12px helper/error)
 * - Accessible error messaging with role="alert" and id for aria-describedby
 * - Character count display
 * - 4/8px spacing scale
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
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Character Count */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-[13px] font-medium text-[#374151]"
        >
          {label}
          {required && <span className="text-[#EF4444] ml-0.5">*</span>}
        </label>

        {maxLength !== undefined && (
          <span className="text-[11px] text-[#9CA3AF] tabular-nums">
            {currentLength || 0} / {maxLength}
          </span>
        )}
      </div>

      {/* Control Input */}
      {children}

      {/* Helper text if no error */}
      {helperText && !error && (
        <p id={helperId} className="text-[12px] text-[#6B7280]">
          {helperText}
        </p>
      )}

      {/* Inline Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-[12px] text-red-600 font-medium flex items-center gap-1"
        >
          {error}
        </p>
      )}
    </div>
  );
}

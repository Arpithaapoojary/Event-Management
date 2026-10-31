import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

/**
 * Enterprise Table Container
 */
export function Table({ children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${className}`}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

/**
 * Enterprise Table Header
 * - Sticky header
 * - 11-12px, uppercase, weight 500, letter-spacing 0.04em, gray-500 (#6B7280)
 */
export function TableHeader({ children, className = '' }) {
  return (
    <thead
      className={`sticky top-0 z-10 bg-[#FAFAFA] border-b border-[#E5E7EB] ${className}`}
    >
      {children}
    </thead>
  );
}

export function TableHead({ children, className = '', align = 'left', ...props }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      className={`py-3 px-4 text-[11px] uppercase font-medium tracking-[0.04em] text-[#6B7280] whitespace-nowrap select-none ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

/**
 * Enterprise Table Body
 * - Row height 56-64px
 * - 1px bottom border only
 * - No zebra stripes, no vertical lines
 * - Subtle hover background #F9FAFB
 */
export function TableBody({ children, className = '' }) {
  return <tbody className={`divide-y divide-[#E5E7EB] ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '', onClick, ...props }) {
  return (
    <tr
      onClick={onClick}
      className={`h-[60px] border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB] transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', align = 'left', ...props }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td
      className={`py-2.5 px-4 text-[13px] text-[#111827] ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

/**
 * Enterprise Pagination Footer
 * - Rows per page, page x of y, prev/next buttons
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  itemName = 'events',
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="px-4 py-3 border-t border-[#E5E7EB] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#6B7280]">
      {/* Left: item count info */}
      <div className="tabular-nums">
        {totalItems > 0 ? (
          <span>
            Showing <strong className="font-medium text-[#111827]">{startItem}</strong> to{' '}
            <strong className="font-medium text-[#111827]">{endItem}</strong> of{' '}
            <strong className="font-medium text-[#111827]">{totalItems}</strong> {itemName}
          </span>
        ) : (
          <span>No {itemName} to display</span>
        )}
      </div>

      {/* Right: page size & pagination navigation */}
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
        {/* Rows per page selector */}
        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#6B7280]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 px-2 text-[12px] font-medium text-[#111827] bg-white border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#0F172A] cursor-pointer tabular-nums"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page status */}
        <span className="text-[12px] tabular-nums">
          Page <strong className="font-medium text-[#111827]">{totalPages === 0 ? 0 : currentPage}</strong> of{' '}
          <strong className="font-medium text-[#111827]">{totalPages}</strong>
        </span>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="w-7 h-7 rounded-[6px] border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] active:bg-[#F3F4F6] text-[#111827] disabled:text-[#9CA3AF] disabled:bg-[#FAFAFA] disabled:border-[#E5E7EB] disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
            aria-label="Next page"
            className="w-7 h-7 rounded-[6px] border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] active:bg-[#F3F4F6] text-[#111827] disabled:text-[#9CA3AF] disabled:bg-[#FAFAFA] disabled:border-[#E5E7EB] disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Enterprise Empty State
 * - No colorful emojis or bright illustrations
 * - Neutral monoline icon, 16-24px, 1.5px stroke
 */
export function TableEmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'Try adjusting your search query or filters.',
  action,
}) {
  return (
    <div className="py-16 px-4 text-center">
      {Icon && (
        <div className="w-10 h-10 rounded-[8px] bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-3 text-[#6B7280]">
          <Icon className="w-5 h-5 stroke-[1.5]" />
        </div>
      )}
      <h4 className="text-[14px] font-medium text-[#111827]">{title}</h4>
      <p className="text-[13px] text-[#6B7280] mt-1 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Enterprise Loading State
 */
export function TableLoadingState({ message = 'Loading records...' }) {
  return (
    <div className="py-16 px-4 text-center text-[#6B7280]">
      <Loader2 className="w-6 h-6 stroke-[1.5] animate-spin mx-auto text-[#0F172A] mb-2.5" />
      <span className="text-[13px] font-medium">{message}</span>
    </div>
  );
}

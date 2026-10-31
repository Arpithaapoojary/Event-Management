import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Standard Design Token Table (Linear / Stripe / Vercel style)
 * - 8px radius card container, 1px border #E2E8F0
 * - 56px row height, bottom borders only, hover #F8FAFC
 * - Sticky header with 12px uppercase tracking 0.04em 500
 * - Skeleton loading rows, minimal empty state
 */
export function Table({ children, footer, className = '' }) {
  return (
    <div
      className={`bg-white rounded-[8px] border border-[#E2E8F0] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${className}`}
    >
      <div className="overflow-x-auto w-full">{children}</div>
      {footer}
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead
      className={`sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0] select-none ${className}`}
    >
      {children}
    </thead>
  );
}

export function TableHead({ children, className = '', align = 'left', ...props }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      className={`py-3 px-4 text-[12px] uppercase font-medium tracking-[0.04em] text-[#64748B] whitespace-nowrap ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableBody({ children, className = '' }) {
  return <tbody className={`divide-y divide-[#E2E8F0] ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '', onClick, ...props }) {
  return (
    <tr
      onClick={onClick}
      className={`h-[56px] border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors ${
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
      className={`py-3 px-4 text-[14px] leading-[20px] text-[#0F172A] align-middle ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

/**
 * Clean Pagination Footer
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="px-4 py-3 border-t border-[#E2E8F0] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#64748B]">
      {/* Item count text */}
      <div className="tabular-nums">
        {totalItems > 0 ? (
          <span>
            {startItem}-{endItem} of {totalItems}
          </span>
        ) : (
          <span>0 items</span>
        )}
      </div>

      {/* Rows per page & Navigation */}
      <div className="flex items-center gap-4">
        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#64748B]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-[28px] px-2 text-[12px] font-normal text-[#0F172A] bg-white border border-[#E2E8F0] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] cursor-pointer tabular-nums"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="w-[28px] h-[28px] rounded-[6px] border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[#0F172A] disabled:text-[#CBD5E1] disabled:bg-white disabled:border-[#E2E8F0] disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
            aria-label="Next page"
            className="w-[28px] h-[28px] rounded-[6px] border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[#0F172A] disabled:text-[#CBD5E1] disabled:bg-white disabled:border-[#E2E8F0] disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Clean Empty State (Plain text + one button, no emojis or heavy illustrations)
 */
export function TableEmptyState({
  title = 'No records found',
  description = 'Try adjusting your search or filters.',
  action,
}) {
  return (
    <div className="py-16 px-4 text-center">
      <h4 className="text-[14px] font-medium text-[#0F172A]">{title}</h4>
      <p className="text-[13px] text-[#64748B] mt-1 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Skeleton Loading Rows (No jumping spinners)
 */
export function TableLoadingState({ rows = 5, cols = 6 }) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="h-[44px] flex items-center gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-4 bg-[#F1F5F9] rounded-[4px] flex-1"
              style={{ maxWidth: cIdx === 0 ? '220px' : '100%' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

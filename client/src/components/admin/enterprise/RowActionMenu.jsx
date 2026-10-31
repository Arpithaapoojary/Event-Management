import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit2, Trash2, RotateCcw } from 'lucide-react';

/**
 * Clean "..." Row Action Menu (Linear / Stripe style)
 * - Single "..." button
 * - Dropdown with View, Edit, and red Delete option
 */
export default function RowActionMenu({
  event,
  onView,
  onEdit,
  onDelete,
  onRestore,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev)}
        }
        aria-label="Open actions menu"
        aria-expanded={open}
        className="w-8 h-8 rounded-[6px] border border-transparent hover:border-[#E2E8F0] hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-36 rounded-[6px] bg-white border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)] py-1 z-50 text-[13px] font-sans"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onView?.(event);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left"
            role="menuitem"
          >
            <Eye className="w-3.5 h-3.5 text-[#64748B]" />
            <span>View</span>
          </button>

          {!event.isDeleted ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onEdit?.(event);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left"
                role="menuitem"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Edit</span>
              </button>

              <div className="my-1 border-t border-[#E2E8F0]" />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onDelete?.(event);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left font-normal"
                role="menuitem"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <div className="my-1 border-t border-[#E2E8F0]" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onRestore?.(event);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[#16A34A] hover:bg-[#F0FDF4] transition-colors cursor-pointer text-left font-normal"
                role="menuitem"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Restore</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

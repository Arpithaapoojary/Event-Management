import React from 'react';

/**
 * Enterprise Tabs Component
 * - Underline-style tabs
 * - Small neutral count (tabular-nums)
 * - No icons
 * - Active: dark text + 2px bottom border (#0F172A)
 * - Inactive: gray-500 text, hover gray-900
 */
export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`border-b border-[#E5E7EB] ${className}`}>
      <nav className="flex items-center gap-6" aria-label="Dashboard Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`pb-3 text-[14px] transition-colors relative flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] rounded-t-[4px] ${
                isActive
                  ? 'border-b-2 border-[#0F172A] text-[#111827] font-medium -mb-[1px]'
                  : 'border-b-2 border-transparent text-[#6B7280] hover:text-[#111827] font-normal -mb-[1px]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium tabular-nums transition-colors ${
                    isActive
                      ? 'bg-[#F3F4F6] text-[#111827]'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

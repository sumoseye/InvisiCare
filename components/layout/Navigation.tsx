'use client';

import { TABS } from '@/lib/constants';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface NavigationProps {
  onSelect?: () => void;
}

export function Navigation({ onSelect }: NavigationProps) {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="flex gap-1 overflow-x-auto scrollbar-thin md:gap-2" aria-label="Main navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            onSelect?.();
          }}
          className={cn(
            'relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'text-accent-blue'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full bg-accent-blue" />
          )}
        </button>
      ))}
    </nav>
  );
}

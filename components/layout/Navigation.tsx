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
    <nav
      className="flex gap-1 overflow-x-auto rounded-full border border-border bg-surface/70 p-1 scrollbar-thin md:gap-2"
      aria-label="Main navigation"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            onSelect?.();
          }}
          className={cn(
            'whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-b-2 border-accent-blue text-accent-blue'
              : 'border-b-2 border-transparent text-muted hover:text-text'
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

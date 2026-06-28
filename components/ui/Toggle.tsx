'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  activeLabel = 'Armed',
  inactiveLabel = 'Disarmed',
}: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm text-muted">{label}</span>}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-8 w-16 rounded-full transition-colors duration-300',
          checked ? 'bg-accent-green/20' : 'bg-border'
        )}
      >
        <motion.div
          className={cn(
            'absolute top-1 h-6 w-6 rounded-full shadow-md',
            checked ? 'bg-accent-green' : 'bg-muted'
          )}
          animate={{ left: checked ? '2.25rem' : '0.25rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      <span
        className={cn(
          'text-sm font-semibold',
          checked ? 'text-accent-green' : 'text-muted'
        )}
      >
        {checked ? activeLabel : inactiveLabel}
      </span>
    </div>
  );
}

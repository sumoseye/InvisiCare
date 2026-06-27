'use client';

import { cn } from '@/lib/utils';
import type { Sensitivity } from '@/lib/types';

interface SliderProps {
  value: Sensitivity;
  onChange: (value: Sensitivity) => void;
  label?: string;
}

const LEVELS: Sensitivity[] = ['low', 'medium', 'high'];

export function Slider({ value, onChange, label }: SliderProps) {
  const index = LEVELS.indexOf(value);

  return (
    <div className="space-y-2">
      {label && <span className="text-sm text-slate-400">{label}</span>}
      <div className="flex items-center gap-2">
        {LEVELS.map((level, i) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={cn(
              'flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-all',
              i <= index
                ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'
            )}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

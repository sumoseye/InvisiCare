import { ACTIVITY_COLORS, ACTIVITY_LABELS } from '@/lib/constants';
import type { ActivityType } from '@/lib/types';

interface ActivityBadgeProps {
  activity: ActivityType;
  className?: string;
}

export function ActivityBadge({ activity, className = '' }: ActivityBadgeProps) {
  const color = ACTIVITY_COLORS[activity];
  return (
    <div
      className={`inline-flex rounded-lg px-3 py-1.5 backdrop-blur-sm ${className}`}
      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
    >
      <span className="text-sm font-bold" style={{ color }}>
        {ACTIVITY_LABELS[activity]}
      </span>
    </div>
  );
}

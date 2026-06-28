import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-white/5 text-muted border-border',
  success: 'bg-accent-green/15 text-accent-green border-accent-green/30',
  warning: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
  danger: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  info: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

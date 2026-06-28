'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

interface StatusCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color: string;
  status?: string;
  statusVariant?: 'success' | 'warning' | 'danger' | 'info';
  subtitle?: string;
  confidence?: number;
  trend?: { time: string; value: number }[];
  children?: React.ReactNode;
}

export function StatusCard({
  icon,
  label,
  value,
  color,
  status,
  statusVariant = 'success',
  subtitle,
  confidence,
  trend,
  children,
}: StatusCardProps) {
  return (
    <motion.div className="h-full" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <Card className="relative h-full overflow-hidden transition-shadow hover:shadow-[0_0_0_1px_rgba(0,212,255,0.4),0_4px_24px_rgba(0,212,255,0.08)]">
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `linear-gradient(135deg, ${color}, transparent)` }}
        />
        <div className="relative flex h-full flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span>{icon}</span>
            {status && <Badge variant={statusVariant}>{status}</Badge>}
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
            <p className="text-3xl font-bold text-accent-blue" style={{ textShadow: '0 0 18px rgba(0, 212, 255, 0.18)' }}>
              {value}
            </p>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            {confidence !== undefined && (
              <p className="text-xs text-muted">{(confidence * 100).toFixed(1)}% confidence</p>
            )}
          </div>
          {trend && trend.length > 0 && (
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {children}
        </div>
      </Card>
    </motion.div>
  );
}

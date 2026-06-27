'use client';

import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

interface StatusCardProps {
  icon: string;
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
    <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <Card className="relative overflow-hidden transition-shadow hover:shadow-lg hover:shadow-accent-blue/5">
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `linear-gradient(135deg, ${color}, transparent)` }}
        />
        <div className="relative space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl">{icon}</span>
            {status && <Badge variant={statusVariant}>{status}</Badge>}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-3xl font-bold" style={{ color }}>
              {value}
            </p>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            {confidence !== undefined && (
              <p className="text-xs text-slate-500">{(confidence * 100).toFixed(1)}% confidence</p>
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

'use client';

import { memo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface BreathingChartProps {
  data: { time: string; value: number }[];
}

export const BreathingChart = memo(function BreathingChart({ data }: BreathingChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-text">Breathing Rate History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="breathingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
              <XAxis dataKey="time" stroke="#6B7FA3" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[10, 25]} stroke="#6B7FA3" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid #1E2D45',
                  borderRadius: '8px',
                  color: '#F0F4FF',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00D4FF"
                fill="url(#breathingGrad)"
                strokeWidth={2}
                isAnimationActive={false}
                style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.35))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

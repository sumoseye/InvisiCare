'use client';

import { memo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { OccupancyHour } from '@/lib/types';

function barColor(count: number) {
  if (count >= 3) return '#ef4444';
  if (count >= 2) return '#a78bfa';
  if (count >= 1) return '#60a5fa';
  return '#34d399';
}

interface OccupancyChartProps {
  data: OccupancyHour[];
}

export const OccupancyChart = memo(function OccupancyChart({ data }: OccupancyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>24-Hour Occupancy Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} interval={2} />
              <YAxis domain={[0, 4]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.count)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

'use client';

import { memo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface HeartRateChartProps {
  data: { time: string; value: number }[];
}

export const HeartRateChart = memo(function HeartRateChart({ data }: HeartRateChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-text">Heart Rate History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
              <ReferenceArea y1={60} y2={100} fill="#00FF9D" fillOpacity={0.1} />
              <XAxis dataKey="time" stroke="#6B7FA3" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[50, 110]} stroke="#6B7FA3" tick={{ fontSize: 10 }} />
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
                stroke="#FF4444"
                fill="url(#heartGrad)"
                strokeWidth={2}
                isAnimationActive={false}
                style={{ filter: 'drop-shadow(0 0 8px rgba(255, 68, 68, 0.28))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

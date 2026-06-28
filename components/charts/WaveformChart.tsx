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

interface WaveformChartProps {
  data: number[];
}

export const WaveformChart = memo(function WaveformChart({ data }: WaveformChartProps) {
  const chartData = data.map((value, i) => ({ index: i, value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-text">CSI Waveform — Real-time Subcarrier Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
              <XAxis dataKey="index" stroke="#6B7FA3" tick={{ fontSize: 10 }} />
              <YAxis domain={[80, 120]} stroke="#6B7FA3" tick={{ fontSize: 10 }} />
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
                fill="url(#waveGrad)"
                strokeWidth={2}
                isAnimationActive={false}
                style={{ filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.3))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

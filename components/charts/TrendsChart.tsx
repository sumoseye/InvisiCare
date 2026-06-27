'use client';

import { memo } from 'react';
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { VitalHistoryPoint } from '@/lib/types';
import { isBreathingNormal, isHeartRateNormal } from '@/lib/utils';

interface TrendsChartProps {
  data: VitalHistoryPoint[];
}

export const TrendsChart = memo(function TrendsChart({ data }: TrendsChartProps) {
  const anomalies = data.filter(
    (p) => !isBreathingNormal(p.breathing) || !isHeartRateNormal(p.heartRate)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vital Signs Trends — Last 60 Minutes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} interval={9} />
              <YAxis yAxisId="left" domain={[10, 25]} stroke="#60a5fa" tick={{ fontSize: 10 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[50, 110]}
                stroke="#f87171"
                tick={{ fontSize: 10 }}
              />
              <ReferenceArea yAxisId="left" y1={12} y2={20} fill="#60a5fa" fillOpacity={0.05} />
              <ReferenceArea yAxisId="right" y1={60} y2={100} fill="#f87171" fillOpacity={0.05} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="breathing"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                name="Breathing (BPM)"
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="heartRate"
                stroke="#f87171"
                strokeWidth={2}
                dot={false}
                name="Heart Rate (BPM)"
                isAnimationActive={false}
              />
              <Scatter
                data={anomalies}
                dataKey="heartRate"
                fill="#ef4444"
                yAxisId="right"
                name="Anomalies"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

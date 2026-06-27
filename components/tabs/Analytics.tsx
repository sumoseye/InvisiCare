'use client';

import { ActivityChart } from '@/components/charts/ActivityChart';
import { OccupancyChart } from '@/components/charts/OccupancyChart';
import { TrendsChart } from '@/components/charts/TrendsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAnalyticsStore, useVitalsStore } from '@/lib/store';
import { calcStats, isBreathingNormal, isHeartRateNormal } from '@/lib/utils';

export function Analytics() {
  const { historicalVitals, occupancyData, activityDistribution, fallRisk } = useAnalyticsStore();
  const { breathing, heartRate, activity } = useVitalsStore();

  const breathingStats = calcStats(historicalVitals.map((v) => v.breathing));
  const heartStats = calcStats(historicalVitals.map((v) => v.heartRate));

  const riskFactors = [
    { label: 'Activity Level', value: activity === 'walking' ? 'Moderate' : 'Low' },
    { label: 'Stability Score', value: `${100 - fallRisk}%` },
    { label: 'Recent Falls', value: '0' },
    { label: 'Movement Anomalies', value: fallRisk > 50 ? 'Detected' : 'None' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TrendsChart data={historicalVitals} />
        <OccupancyChart data={occupancyData} />
      </div>

      <ActivityChart data={activityDistribution} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fall Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={fallRisk > 66 ? '#ef4444' : fallRisk > 33 ? '#fbbf24' : '#34d399'}
                    strokeWidth="8"
                    strokeDasharray={`${fallRisk * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{fallRisk}</span>
                </div>
              </div>
              <ul className="flex-1 space-y-2">
                {riskFactors.map((f) => (
                  <li key={f.label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{f.label}</span>
                    <span className="text-white">{f.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Trend: {fallRisk > 40 ? '↑ Increasing' : '↓ Stable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vital Signs Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3 text-sm font-medium text-accent-blue">Breathing (BPM)</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between"><span className="text-slate-400">Min</span> <span>{breathingStats.min}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Max</span> <span>{breathingStats.max}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Avg</span> <span>{breathingStats.avg}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Current</span> <span className={isBreathingNormal(breathing) ? 'text-accent-green' : 'text-accent-orange'}>{breathing.toFixed(1)}</span></p>
                </div>
                <p className="mt-2 text-xs text-slate-500">Normal: 12–20 BPM</p>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-medium text-red-400">Heart Rate (BPM)</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between"><span className="text-slate-400">Min</span> <span>{heartStats.min}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Max</span> <span>{heartStats.max}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Avg</span> <span>{heartStats.avg}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Current</span> <span className={isHeartRateNormal(heartRate) ? 'text-accent-green' : 'text-accent-orange'}>{heartRate}</span></p>
                </div>
                <p className="mt-2 text-xs text-slate-500">Normal: 60–100 BPM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

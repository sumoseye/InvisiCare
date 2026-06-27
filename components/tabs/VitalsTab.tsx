'use client';

import { useVitalsStore, useWaveformStore } from '@/lib/store';
import { BreathingChart } from '@/components/charts/BreathingChart';
import { HeartRateChart } from '@/components/charts/HeartRateChart';
import { WaveformChart } from '@/components/charts/WaveformChart';
import { calcStats, isBreathingNormal, isHeartRateNormal } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useMemo } from 'react';

export function VitalsTab() {
  const { breathingHistory, heartRateHistory, breathing, heartRate } = useVitalsStore();
  const { waveform } = useWaveformStore();

  const breathingStats = useMemo(() => calcStats(breathingHistory.map(b => b.value)), [breathingHistory]);
  const heartStats = useMemo(() => calcStats(heartRateHistory.map(h => h.value)), [heartRateHistory]);

  const anomalies = useMemo(() => {
    const logs: { time: string; metric: string; value: string | number; status: string }[] = [];
    breathingHistory.forEach((b, i) => {
      const h = heartRateHistory[i];
      if (!isBreathingNormal(b.value)) {
        logs.push({ time: b.time, metric: 'Breathing', value: b.value.toFixed(1), status: 'Abnormal' });
      }
      if (h && !isHeartRateNormal(h.value)) {
        logs.push({ time: h.time, metric: 'Heart Rate', value: h.value, status: 'Abnormal' });
      }
    });
    return logs.reverse().slice(0, 20); // Last 20 anomalies
  }, [breathingHistory, heartRateHistory]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-slate-400">Breathing Stats</h3>
            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-accent-blue">{breathing.toFixed(1)}</p>
                <p className="text-xs text-slate-500">Current</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{breathingStats.avg.toFixed(1)}</p>
                <p className="text-xs text-slate-500">Avg</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-300">{breathingStats.min}</p>
                <p className="text-xs text-slate-500">Min</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-300">{breathingStats.max}</p>
                <p className="text-xs text-slate-500">Max</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-slate-400">Heart Rate Stats</h3>
            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-400">{heartRate}</p>
                <p className="text-xs text-slate-500">Current</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{heartStats.avg}</p>
                <p className="text-xs text-slate-500">Avg</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-300">{heartStats.min}</p>
                <p className="text-xs text-slate-500">Min</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-300">{heartStats.max}</p>
                <p className="text-xs text-slate-500">Max</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <BreathingChart data={breathingHistory} />
      <HeartRateChart data={heartRateHistory} />
      <WaveformChart data={waveform} />

      {/* Anomaly Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Log (Last 20)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="border-b border-white/10 bg-slate-900/50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.length > 0 ? (
                  anomalies.map((a, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{a.time}</td>
                      <td className="px-4 py-3">{a.metric}</td>
                      <td className="px-4 py-3 font-semibold text-accent-red">{a.value}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-accent-red/20 px-2 py-1 text-xs text-accent-red">{a.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No anomalies detected in recent history.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
    return logs.reverse().slice(0, 20);
  }, [breathingHistory, heartRateHistory]);

  const breathingNormal = isBreathingNormal(breathing);
  const heartNormal = isHeartRateNormal(heartRate);

  return (
    <div className="space-y-8">

      {/* Stats Cards */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

  {/* Breathing */}
  <Card className="border-t-2 border-t-[#00D4FF]">
    <CardContent className="p-6">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[#6B7FA3]">
          Breathing Rate
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            breathingNormal
              ? 'bg-[#00FF9D15] text-[#00FF9D]'
              : 'bg-[#FF444415] text-[#FF4444]'
          }`}
        >
          {breathingNormal ? 'Normal' : 'Abnormal'}
        </span>
      </div>

      {/* BIG Current Reading (Centered) */}
      <div className="mb-8 flex flex-col items-center justify-center">
        <p className="text-6xl font-bold tracking-tight text-[#00D4FF]">
          {breathing.toFixed(1)}
        </p>
        <p className="mt-2 text-sm font-medium uppercase tracking-widest text-[#6B7FA3]">
          Current
        </p>
      </div>

      {/* Sub Stats (Avg, Min, Max) */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-[#1E2D45] bg-[#0A0F1E] p-3 transition-colors hover:bg-[#121b2d]">
          <p className="text-xl font-semibold text-[#F0F4FF]">{breathingStats.avg.toFixed(1)}</p>
          <p className="mt-1 text-xs text-[#6B7FA3]">Avg</p>
        </div>
        <div className="rounded-xl border border-[#1E2D45] bg-[#0A0F1E] p-3 transition-colors hover:bg-[#121b2d]">
          <p className="text-xl font-semibold text-[#F0F4FF]">{breathingStats.min}</p>
          <p className="mt-1 text-xs text-[#6B7FA3]">Min</p>
        </div>
        <div className="rounded-xl border border-[#1E2D45] bg-[#0A0F1E] p-3 transition-colors hover:bg-[#121b2d]">
          <p className="text-xl font-semibold text-[#F0F4FF]">{breathingStats.max}</p>
          <p className="mt-1 text-xs text-[#6B7FA3]">Max</p>
        </div>
      </div>

    </CardContent>
  </Card>

  {/* Heart Rate */}
  <Card className="border-t-2 border-t-[#FF4444]">
    <CardContent className="p-6">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[#6B7FA3]">
          Heart Rate
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            heartNormal
              ? 'bg-[#00FF9D15] text-[#00FF9D]'
              : 'bg-[#FF444415] text-[#FF4444]'
          }`}
        >
          {heartNormal ? 'Normal' : 'Elevated'}
        </span>
      </div>

      {/* BIG Current Reading (Centered) */}
      <div className="mb-8 flex flex-col items-center justify-center">
        <p className="text-6xl font-bold tracking-tight text-[#FF4444]">
          {heartRate}
        </p>
        <p className="mt-2 text-sm font-medium uppercase tracking-widest text-[#6B7FA3]">
          Current
        </p>
      </div>

      {/* Sub Stats (Avg, Min, Max) */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-[#1E2D45] bg-[#0A0F1E] p-3 transition-colors hover:bg-[#121b2d]">
          <p className="text-xl font-semibold text-[#F0F4FF]">{heartStats.avg}</p>
          <p className="mt-1 text-xs text-[#6B7FA3]">Avg</p>
        </div>
        <div className="rounded-xl border border-[#1E2D45] bg-[#0A0F1E] p-3 transition-colors hover:bg-[#121b2d]">
          <p className="text-xl font-semibold text-[#F0F4FF]">{heartStats.min}</p>
          <p className="mt-1 text-xs text-[#6B7FA3]">Min</p>
        </div>
        <div className="rounded-xl border border-[#1E2D45] bg-[#0A0F1E] p-3 transition-colors hover:bg-[#121b2d]">
          <p className="text-xl font-semibold text-[#F0F4FF]">{heartStats.max}</p>
          <p className="mt-1 text-xs text-[#6B7FA3]">Max</p>
        </div>
      </div>

    </CardContent>
  </Card>
</div>

      {/* Charts */}
      <div>
        <h2 className="mb-4 border-l-2 border-[#00D4FF] pl-3 text-sm font-semibold uppercase tracking-widest text-[#F0F4FF]">
          Live Monitoring
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#00D4FF]">
              Breathing Rate
            </p>
            <BreathingChart data={breathingHistory} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#FF4444]">
              Heart Rate
            </p>
            <HeartRateChart data={heartRateHistory} />
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#6B7FA3]">
            Raw CSI Waveform
          </p>
          <WaveformChart data={waveform} />
        </div>
      </div>

      {/* Anomaly Log */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="border-l-2 border-[#FF4444] pl-3 text-sm font-semibold uppercase tracking-widest text-[#F0F4FF]">
            Anomaly Log
          </h2>
          {anomalies.length > 0 && (
            <span className="animate-pulse h-2 w-2 rounded-full bg-[#FF4444]" />
          )}
          <span className="text-xs text-[#6B7FA3]">Last 20 entries</span>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#1E2D45] bg-[#0A0F1E]">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#6B7FA3]">Timestamp</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#6B7FA3]">Metric</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#6B7FA3]">Value</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#6B7FA3]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.length > 0 ? (
                    anomalies.map((a, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#1E2D45] transition-colors duration-150 hover:bg-[#1E2D45]/40"
                        style={{ backgroundColor: i % 2 === 0 ? '#111827' : '#0D1526' }}
                      >
                        <td className="px-4 py-3 text-xs text-[#6B7FA3]">{a.time}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: a.metric === 'Breathing' ? '#00D4FF' : '#FF4444' }}
                            />
                            <span className="text-[#F0F4FF]">{a.metric}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#FF4444]">{a.value} BPM</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-[#FF444430] bg-[#FF444415] px-2 py-0.5 text-xs font-medium text-[#FF4444]">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl text-[#00FF9D]">✓</span>
                          <p className="text-sm text-[#6B7FA3]">All vitals within normal range</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
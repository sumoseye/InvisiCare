'use client';

import { BreathingChart } from '@/components/charts/BreathingChart';
import { HeartRateChart } from '@/components/charts/HeartRateChart';
import { WaveformChart } from '@/components/charts/WaveformChart';
import { StatusCard } from '@/components/cards/StatusCard';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { useVitalsStore, useWaveformStore } from '@/lib/store';
import { formatDuration, isBreathingNormal, isHeartRateNormal } from '@/lib/utils';

export function Dashboard() {
  const {
    breathing,
    heartRate,
    personCount,
    activity,
    presenceConfidence,
    zones,
    breathingHistory,
    heartRateHistory,
    activityDuration,
  } = useVitalsStore();
  const waveform = useWaveformStore((s) => s.waveform);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon="🫁"
          label="Breathing Rate"
          value={`${breathing.toFixed(1)} BPM`}
          color="#60a5fa"
          status={isBreathingNormal(breathing) ? '✓ Normal' : '⚠ Check'}
          statusVariant={isBreathingNormal(breathing) ? 'success' : 'warning'}
          trend={breathingHistory}
        />
        <StatusCard
          icon="💓"
          label="Heart Rate"
          value={`${heartRate} BPM`}
          color="#f87171"
          status={isHeartRateNormal(heartRate) ? '✓ Normal' : '⚠ Elevated'}
          statusVariant={isHeartRateNormal(heartRate) ? 'success' : 'warning'}
          confidence={presenceConfidence}
          trend={heartRateHistory}
        />
        <StatusCard
          icon="👥"
          label="People Detected"
          value={`${personCount} ${personCount === 1 ? 'PERSON' : 'PERSONS'}`}
          color="#34d399"
          subtitle={zones.join(', ')}
        >
          <div className="mt-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-accent-green transition-all"
                style={{ width: `${Math.min(100, personCount * 40)}%` }}
              />
            </div>
          </div>
        </StatusCard>
        <StatusCard
          icon="🚶"
          label="Current Activity"
          value={ACTIVITY_LABELS[activity]}
          color="#a78bfa"
          confidence={presenceConfidence}
          subtitle={`Duration: ${formatDuration(activityDuration)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BreathingChart data={breathingHistory} />
        <HeartRateChart data={heartRateHistory} />
      </div>

      <WaveformChart data={waveform} />
    </div>
  );
}

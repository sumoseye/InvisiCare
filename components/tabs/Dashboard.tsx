'use client';

import { useEffect, useRef } from 'react';
import { BreathingChart } from '@/components/charts/BreathingChart';
import { HeartRateChart } from '@/components/charts/HeartRateChart';
import { WaveformChart } from '@/components/charts/WaveformChart';
import { StatusCard } from '@/components/cards/StatusCard';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { useVitalsStore, useWaveformStore, useAnalyticsStore } from '@/lib/store';
import { formatDuration, isBreathingNormal, isHeartRateNormal } from '@/lib/utils';
import {
  HeartIcon,
  UserGroupIcon,
  SignalIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

export function Dashboard() {
  const {
    breathing,
    heartRate,
    personCount,
    activity,
    zones,
    breathingHistory,
    heartRateHistory,
    activityDuration,
    setVitalsResponse,
  } = useVitalsStore();

  const { setWaveform } = useWaveformStore();
  const { updateHistoricalVitals } = useAnalyticsStore();

  const vitalsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyticsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch vitals every 1 second
  useEffect(() => {
    // Prevent multiple intervals
    if (vitalsIntervalRef.current) return;

    vitalsIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/vitals');
        if (!response.ok) throw new Error('Failed to fetch vitals');
        const data = await response.json();
        setVitalsResponse(data);
      } catch (error) {
        console.error('Failed to fetch vitals:', error);
      }
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (vitalsIntervalRef.current) {
        clearInterval(vitalsIntervalRef.current);
        vitalsIntervalRef.current = null;
      }
    };
  }, [setVitalsResponse]); // Only vitalsStore action, safe dependency

  // Fetch waveform every 500ms
  useEffect(() => {
    if (waveformIntervalRef.current) return;

    waveformIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/waveform');
        if (!response.ok) throw new Error('Failed to fetch waveform');
        const data = await response.json();
        setWaveform(data.waveform);
      } catch (error) {
        console.error('Failed to fetch waveform:', error);
      }
    }, 500);

    return () => {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
        waveformIntervalRef.current = null;
      }
    };
  }, [setWaveform]);

  // Update analytics every 5 seconds
  useEffect(() => {
    if (analyticsIntervalRef.current) return;

    analyticsIntervalRef.current = setInterval(() => {
      // Add current vitals to historical data
      updateHistoricalVitals({
        breathing,
        heartRate,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      });
    }, 5000);

    return () => {
      if (analyticsIntervalRef.current) {
        clearInterval(analyticsIntervalRef.current);
        analyticsIntervalRef.current = null;
      }
    };
  }, [breathing, heartRate, updateHistoricalVitals]);

  return (
    <div className="space-y-6">
      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon={<SignalIcon className="h-6 w-6 text-accent-blue" />}
          label="Breathing Rate"
          value={`${breathing.toFixed(1)} BPM`}
          color="#60a5fa"
          status={isBreathingNormal(breathing) ? 'Normal' : 'Check'}
          statusVariant={isBreathingNormal(breathing) ? 'success' : 'warning'}
          trend={breathingHistory}
        />
        <StatusCard
          icon={<HeartIcon className="h-6 w-6 text-red-400" />}
          label="Heart Rate"
          value={`${heartRate} BPM`}
          color="#f87171"
          status={isHeartRateNormal(heartRate) ? 'Normal' : 'Elevated'}
          statusVariant={isHeartRateNormal(heartRate) ? 'success' : 'warning'}
          trend={heartRateHistory}
        />
        <StatusCard
          icon={<UserGroupIcon className="h-6 w-6 text-accent-green" />}
          label="Occupancy"
          value={`${personCount} ${personCount === 1 ? 'Person' : 'People'}`}
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
          icon={<BoltIcon className="h-6 w-6 text-accent-purple" />}
          label="Current Activity"
          value={ACTIVITY_LABELS[activity]}
          color="#a78bfa"
          subtitle={`Duration: ${formatDuration(activityDuration)}`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BreathingChart data={breathingHistory} />
        <HeartRateChart data={heartRateHistory} />
      </div>

      {/* Waveform Chart */}
      <WaveformChart data={useWaveformStore((s) => s.waveform)} />
    </div>
  );
}
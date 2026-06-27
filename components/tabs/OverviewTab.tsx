'use client';

import { useVitalsStore } from '@/lib/store';
import { usePoseStore } from '@/lib/usePoseStore';
import { useFallStore } from '@/lib/useFallStore';
import { StatusCard } from '@/components/cards/StatusCard';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { formatDuration, isBreathingNormal, isHeartRateNormal, formatTime } from '@/lib/utils';
import {
  HeartIcon,
  UserIcon,
  UsersIcon,
  ShieldExclamationIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function OverviewTab() {
  const {
    breathing,
    heartRate,
    activity,
    activityDuration,
    breathingHistory,
    heartRateHistory,
    personCount,
  } = useVitalsStore();

  const { pose_label, overall_confidence } = usePoseStore();
  const { fallDetected, lastFallTimestamp, fallsToday, eventLog } = useFallStore();

  const vitalsStatus = isBreathingNormal(breathing) && isHeartRateNormal(heartRate) ? 'Normal' : 'Warning';
  const vitalsColor = vitalsStatus === 'Normal' ? '#34d399' : '#fb923c';

  // Combine data for timeline
  // We'll use breathing history as the base timeline since it updates regularly
  const combinedData = breathingHistory.map((bh, idx) => {
    const hr = heartRateHistory[idx]?.value;
    
    // Check if there was a fall in this minute (mocking based on timestamp for simplicity)
    const fallEvent = eventLog.find(e => {
      // matching just the minute roughly for the timeline, or we can just map falls if they happened
      return formatTime(e.timestamp) === bh.time;
    });

    return {
      time: bh.time,
      breathing: bh.value,
      heartRate: hr,
      fall: fallEvent ? 10 : null, // render fall as a dot at y=10
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Vitals Summary Card */}
        <StatusCard
          icon={<HeartIcon className="h-6 w-6 text-accent-blue" />}
          label="Vitals Summary"
          value={`${breathing.toFixed(1)} / ${heartRate} BPM`}
          color={vitalsColor}
          status={vitalsStatus}
          statusVariant={vitalsStatus === 'Normal' ? 'success' : 'warning'}
        />

        {/* Pose Summary Card */}
        <StatusCard
          icon={<UserIcon className="h-6 w-6 text-accent-purple" />}
          label="Current Pose"
          value={pose_label.charAt(0).toUpperCase() + pose_label.slice(1)}
          color="#a78bfa"
          confidence={overall_confidence}
        />

        {/* Fall Detection Summary Card */}
        <StatusCard
          icon={<ShieldExclamationIcon className={`h-6 w-6 ${fallDetected ? 'text-accent-red animate-pulse' : 'text-accent-green'}`} />}
          label="Fall Status"
          value={fallDetected ? 'FALL DETECTED' : 'Monitoring'}
          color={fallDetected ? '#ef4444' : '#34d399'}
          subtitle={lastFallTimestamp ? `Last fall: ${formatTime(lastFallTimestamp)} | Today: ${fallsToday}` : `Falls today: ${fallsToday}`}
          status={fallDetected ? 'Alert' : 'Clear'}
          statusVariant={fallDetected ? 'danger' : 'success'}
        />

        {/* Activity Card */}
        <StatusCard
          icon={<BoltIcon className="h-6 w-6 text-accent-blue" />}
          label="Current Activity"
          value={ACTIVITY_LABELS[activity] || activity}
          color="#60a5fa"
          subtitle={`Duration: ${formatDuration(activityDuration)}`}
        />

        {/* Occupancy Card */}
        <StatusCard
          icon={<UsersIcon className="h-6 w-6 text-accent-blue" />}
          label="Monitored Person"
          value={personCount > 0 ? 'Detected' : 'Absent'}
          color="#60a5fa"
          subtitle="System configured for a single resident"
        />
      </div>

      {/* Combined Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Health & Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" domain={[10, 30]} stroke="#60a5fa" tick={{ fontSize: 10 }} orientation="left" />
                <YAxis yAxisId="right" domain={[50, 110]} stroke="#f87171" tick={{ fontSize: 10 }} orientation="right" />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="breathing" name="Breathing (BPM)" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#f87171" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Scatter yAxisId="left" dataKey="fall" name="Fall Events" fill="#ef4444" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

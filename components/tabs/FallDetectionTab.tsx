'use client';

import { useFallStore } from '@/lib/useFallStore';
import { useWaveformStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { formatTime, formatDuration } from '@/lib/utils';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer
} from 'recharts';

export function FallDetectionTab() {
  const {
    fallDetected,
    lastFallTimestamp,
    fallsToday,
    fallsThisWeek,
    eventLog,
    settings,
    updateSettings,
    resolveFallEvent
  } = useFallStore();

  const { waveform } = useWaveformStore();

  // Mock fall event on the waveform for visualization
  // If a fall is detected, we can highlight the right side of the graph
  const chartData = waveform.map((val, idx) => ({ index: idx, value: val }));

  const avgRecoveryTime = eventLog.length > 0
    ? eventLog.reduce((acc, curr) => acc + curr.durationOnFloor, 0) / eventLog.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className={`p-4 rounded-xl border flex items-center gap-4 shadow-lg ${
        fallDetected 
          ? 'bg-accent-red/15 border-accent-red/60 shadow-[0_0_0_1px_rgba(255,68,68,0.25)] animate-pulse' 
          : 'bg-accent-green/10 border-accent-green/40 shadow-[0_0_0_1px_rgba(0,255,157,0.16)]'
      }`}>
        {fallDetected ? (
          <ExclamationTriangleIcon className="h-8 w-8 text-accent-red" />
        ) : (
          <ShieldCheckIcon className="h-8 w-8 text-accent-green" />
        )}
        <div>
          <h2 className={`text-xl font-bold ${fallDetected ? 'text-accent-red' : 'text-accent-green'}`}>
            {fallDetected ? `FALL DETECTED — ${formatTime(lastFallTimestamp || Date.now())}` : 'No Falls Detected'}
          </h2>
          <p className={`text-sm ${fallDetected ? 'text-white' : 'text-accent-green'}`}>
            {fallDetected ? 'Immediate assistance may be required.' : 'Monitoring zones actively.'}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-2 text-sm text-muted">Falls Today</p>
            <p className="text-3xl font-bold text-text">{fallsToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-2 text-sm text-muted">Falls This Week</p>
            <p className="text-3xl font-bold text-text">{fallsThisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-2 text-sm text-muted">Last Incident</p>
            <p className="text-3xl font-bold text-text">{lastFallTimestamp ? formatTime(lastFallTimestamp) : 'None'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-2 text-sm text-muted">Avg Recovery</p>
            <p className="text-3xl font-bold text-text">{formatDuration(Math.round(avgRecoveryTime))}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* CSI Chart */}
          <Card>
            <CardHeader>
              <CardTitle>CSI Motion Signal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
                    <XAxis dataKey="index" stroke="#6B7FA3" tick={false} />
                    <YAxis domain={[0, 200]} stroke="#6B7FA3" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: '8px', color: '#F0F4FF' }} />
                    
                    {/* Highlight the fall area if detected (mock logic: last 10 points) */}
                    {fallDetected && <ReferenceArea x1={chartData.length - 10} x2={chartData.length - 1} fill="#FF4444" fillOpacity={0.15} />}
                    
                    <Area type="monotone" dataKey="value" stroke="#00D4FF" fillOpacity={1} fill="url(#colorValue)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Event Log Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fall Event Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="border-b border-border bg-surface/70 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventLog.length > 0 ? eventLog.map((event) => (
                      <tr key={event.id} className="border-b border-border hover:bg-white/5">
                        <td className="px-4 py-3 text-text">{formatTime(event.timestamp)}</td>
                        <td className="px-4 py-3">{event.location}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${event.severity === 'major' ? 'bg-accent-red/20 text-accent-red' : 'bg-accent-orange/15 text-accent-orange'}`}>
                            {event.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatDuration(event.durationOnFloor)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${event.resolved ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-orange/20 text-accent-orange'}`}>
                            {event.resolved ? 'Resolved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {!event.resolved && (
                            <Button size="sm" variant="outline" onClick={() => resolveFallEvent(event.id)}>
                              Resolve
                            </Button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted">No fall events recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fall Detection Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-medium text-text">Sensitivity</h4>
                <Slider 
                  value={settings.sensitivity} 
                  onChange={(val) => updateSettings({ sensitivity: val })} 
                />
                <p className="mt-2 text-xs text-muted">Higher sensitivity detects minor falls but may cause more false alarms.</p>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="mb-3 text-sm font-medium text-text">Alert Notifications</h4>
                <Toggle 
                  checked={settings.notificationsEnabled} 
                  onChange={(val) => updateSettings({ notificationsEnabled: val })}
                  activeLabel="Enabled"
                  inactiveLabel="Muted"
                />
              </div>

              {/* <div className="border-t border-border pt-4">
                <h4 className="mb-3 text-sm font-medium text-text">Monitored Zones</h4>
                <div className="space-y-2">
                  {['Living Room', 'Bedroom', 'Kitchen', 'Bathroom'].map(zone => (
                    <label key={zone} className="flex cursor-pointer items-center gap-3 text-sm text-muted hover:text-text">
                      <input 
                        type="checkbox" 
                        className="rounded border-border bg-surface text-accent-blue focus:ring-accent-blue"
                        checked={settings.zones.includes(zone)}
                        onChange={(e) => {
                          const newZones = e.target.checked 
                            ? [...settings.zones, zone] 
                            : settings.zones.filter(z => z !== zone);
                          updateSettings({ zones: newZones });
                        }}
                      />
                      {zone}
                    </label>
                  ))}
                </div>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

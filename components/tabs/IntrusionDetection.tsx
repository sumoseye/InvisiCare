'use client';

import { useEffect, useRef } from 'react';
import { ZoneCard } from '@/components/cards/ZoneCard';
import { useIntrusionStore, useEventStore, useAlertStore } from '@/lib/store';
import { format } from 'date-fns';

export function IntrusionDetection() {
  const {
    armed,
    sensitivity,
    zones,
    lastIntrusion,
    setArmed,
    setSensitivity,
    setZones,
    setLastIntrusion,
  } = useIntrusionStore();

  const { addEvent } = useEventStore();
  const { setAlert } = useAlertStore();

  const zonesIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch zones data every 1 second
  useEffect(() => {
    if (zonesIntervalRef.current) return;

    zonesIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/zones');
        if (!response.ok) throw new Error('Failed to fetch zones');
        const data = await response.json();
        setZones(data.zones);
      } catch (error) {
        console.error('Failed to fetch zones:', error);
      }
    }, 1000);

    return () => {
      if (zonesIntervalRef.current) {
        clearInterval(zonesIntervalRef.current);
        zonesIntervalRef.current = null;
      }
    };
  }, [setZones]);

  // Handle intrusion events
  useEffect(() => {
    if (!armed) return;

    // Simulate intrusion detection (in real app, this would come from API)
    const randomIntrusion = Math.random() > 0.995; // 0.5% chance per second

    if (randomIntrusion) {
      const timestamp = Date.now();
      setLastIntrusion(timestamp);

      const event = {
        id: `evt-${timestamp}`,
        type: 'intrusion' as const,
        severity: 'critical' as const,
        description: 'Intrusion detected - Person at Entry Door',
        personIds: ['intruder'],
        zone: 'entry',
        confidence: 0.96,
        timestamp,
        acknowledged: false,
        status: 'active' as const,
        message: 'Intrusion detected - Person at Entry Door',
        location: 'entry',
        dismissed: false,
      };

      addEvent(event);

      setAlert({
        id: `alert-${timestamp}`,
        type: 'intrusion',
        message: 'INTRUSION DETECTED - Person at Entry Door',
        severity: 'critical',
        timestamp,
        location: 'entry',
        confidence: 0.96,
      });
    }
  }, [armed, setLastIntrusion, addEvent, setAlert]);

  const timeAgoText =
    lastIntrusion &&
    `${Math.floor((Date.now() - lastIntrusion) / 1000)} seconds ago`;

  return (
    <div className="space-y-6">
      {/* Security Status Panel */}
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Security Status</h3>
          <div
            className={`inline-flex items-center rounded-full px-4 py-2 font-semibold ${
              armed
                ? 'bg-red-500/20 text-red-400'
                : 'bg-green-500/20 text-green-400'
            }`}
          >
            <div
              className={`mr-2 h-2 w-2 rounded-full animate-pulse ${
                armed ? 'bg-red-400' : 'bg-green-400'
              }`}
            />
            {armed ? 'ARMED' : 'DISARMED'}
          </div>
        </div>

        {/* Toggle Armed State */}
        <div className="mb-6 flex items-center justify-between">
          <label className="text-sm text-gray-300">Arm System</label>
          <button
            onClick={() => setArmed(!armed)}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
              armed ? 'bg-red-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                armed ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Sensitivity Slider */}
        <div className="mb-4">
          <label className="text-sm text-gray-300">Sensitivity</label>
          <div className="mt-2 flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="2"
              value={{ low: 0, medium: 1, high: 2 }[sensitivity]}
              onChange={(e) => {
                const levels: Array<'low' | 'medium' | 'high'> = [
                  'low',
                  'medium',
                  'high',
                ];
                setSensitivity(levels[Number(e.target.value)]);
              }}
              className="flex-1"
            />
            <span className="min-w-16 text-sm font-medium capitalize text-accent-blue">
              {sensitivity}
            </span>
          </div>
        </div>

        {/* Last Intrusion */}
        {lastIntrusion && (
          <p className="text-sm text-gray-400">
            Last alert: <span className="font-semibold">{timeAgoText}</span>
          </p>
        )}
      </div>

      {/* Zone Grid */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Zone Monitoring</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone, index) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      </div>
    </div>
  );
}
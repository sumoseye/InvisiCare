'use client';

import { ZoneCard } from '@/components/cards/ZoneCard';
import { FloorPlan } from '@/components/visualizations/FloorPlan';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import type { AppEvent, Zone } from '@/lib/types';
import { useEventStore, useIntrusionStore } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function IntrusionDetection() {
  const { armed, sensitivity, zones, lastIntrusion, setArmed, setSensitivity } =
    useIntrusionStore();
  const events = useEventStore((s) => s.events);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [filterZone, setFilterZone] = useState<string | null>(null);

  const intrusionEvents = events.filter((e) => e.type === 'intrusion').slice(0, 10);
  const hasAlert = zones.some((z) => z.status === 'alert');

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center">
        <motion.div
          className={`flex h-32 w-32 items-center justify-center rounded-full border-4 ${
            hasAlert || (armed && hasAlert)
              ? 'border-accent-red bg-accent-red/10'
              : armed
                ? 'border-accent-green bg-accent-green/10'
                : 'border-slate-600 bg-slate-800/50'
          }`}
          animate={hasAlert ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span
            className={`text-xl font-bold ${
              hasAlert ? 'text-accent-red' : armed ? 'text-accent-green' : 'text-slate-400'
            }`}
          >
            {hasAlert ? 'ALERT' : armed ? 'SECURE' : 'OFF'}
          </span>
        </motion.div>

        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 pt-6">
            <Toggle checked={armed} onChange={setArmed} label="Security System" />
            <Slider value={sensitivity} onChange={setSensitivity} label="Detection Sensitivity" />
            {lastIntrusion && (
              <p className="text-sm text-slate-400">
                Last intrusion: {formatDateTime(lastIntrusion)}
              </p>
            )}
            <Button variant="secondary" size="sm" onClick={() => setArmed(false)}>
              Reset / Clear
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <ZoneCard key={zone.id} zone={zone} onClick={() => setSelectedZone(zone)} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>24-Hour Intrusion Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-16 overflow-x-auto">
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-700" />
            {['12am', '6am', '12pm', '6pm', '12am'].map((label, i) => (
              <div
                key={label}
                className="absolute top-0 text-xs text-slate-500"
                style={{ left: `${i * 25}%` }}
              >
                {label}
              </div>
            ))}
            {intrusionEvents.map((event, i) => (
              <div
                key={event.id}
                className="absolute top-1/2 h-8 w-1 -translate-y-1/2 cursor-pointer bg-accent-red"
                style={{ left: `${10 + (i * 15) % 80}%` }}
                title={`${event.message} — ${formatDateTime(event.timestamp)}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Floor Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <FloorPlan
            zones={zones}
            selectedZone={filterZone}
            onZoneClick={(zone) => setFilterZone(zone.slug || null)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[300px] space-y-2 overflow-y-auto scrollbar-thin">
            {intrusionEvents.length === 0 ? (
              <p className="text-sm text-slate-500">No recent intrusion events</p>
            ) : (
              intrusionEvents.map((event) => (
                <IntrusionEventRow key={event.id} event={event} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedZone}
        onClose={() => setSelectedZone(null)}
        title={selectedZone?.name || 'Zone Details'}
      >
        {selectedZone && (
          <div className="space-y-2 text-sm text-slate-300">
            <p>Status: <span className="capitalize text-white">{selectedZone.status}</span></p>
            <p>Motion Intensity: {selectedZone.motionIntensity}%</p>
            <p>Last Activity: {formatDateTime(selectedZone.lastActivity)}</p>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function IntrusionEventRow({ event }: { event: AppEvent }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
      <div>
        <p className="text-sm font-medium text-white">{event.message}</p>
        <p className="text-xs text-slate-500">
          {formatDateTime(event.timestamp)} · {(event.confidence * 100).toFixed(1)}%
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">View</Button>
        <Button variant="ghost" size="sm">Dismiss</Button>
      </div>
    </div>
  );
}

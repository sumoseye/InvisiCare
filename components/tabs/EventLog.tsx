'use client';

import { EventCard } from '@/components/cards/EventCard';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Toggle } from '@/components/ui/Toggle';
import type { AppEvent, EventFilter } from '@/lib/types';
import { useEventStore } from '@/lib/store';
import {
  downloadFile,
  exportEventsCSV,
  filterEvents,
  timeRangeToMs,
} from '@/lib/utils';
import { useMemo, useState } from 'react';

const FILTERS: { id: EventFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning', label: 'Warnings' },
  { id: 'info', label: 'Info' },
];

const TIME_RANGES = [
  { id: '1h', label: 'Last hour' },
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last week' },
];

const ZONE_OPTIONS = [
  'all',
  'living-room',
  'bedroom',
  'kitchen',
  'hallway',
  'bathroom',
  'entry',
];

export function EventLog() {
  const {
    events,
    filter,
    searchQuery,
    timeRange,
    zoneFilter,
    emailAlerts,
    webhookUrl,
    setFilter,
    setSearchQuery,
    setTimeRange,
    setZoneFilter,
    setEmailAlerts,
    setWebhookUrl,
    dismissEvent,
  } = useEventStore();

  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [webhookInput, setWebhookInput] = useState(webhookUrl);

  const filtered = useMemo(
    () => filterEvents(events, filter, searchQuery, zoneFilter, timeRangeToMs(timeRange)),
    [events, filter, searchQuery, zoneFilter, timeRange]
  );

  const counts = useMemo(
    () => ({
      all: events.length,
      critical: events.filter((e) => e.severity === 'critical').length,
      warning: events.filter((e) => e.severity === 'warning').length,
      info: events.filter((e) => e.severity === 'info').length,
    }),
    [events]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            {f.label}
            <span className="ml-1.5 rounded-full bg-white/10 px-1.5 text-xs">
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          {TIME_RANGES.map((r) => (
            <option key={r.id} value={r.id} className="bg-slate-900">
              {r.label}
            </option>
          ))}
        </select>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          {ZONE_OPTIONS.map((z) => (
            <option key={z} value={z} className="bg-slate-900">
              {z === 'all' ? 'All Zones' : z.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => downloadFile(exportEventsCSV(filtered), 'wifisense-events.csv', 'text/csv')}
        >
          📥 Download CSV
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            downloadFile(
              `WiFiSense Pro Event Report\nGenerated: ${new Date().toISOString()}\n\n${exportEventsCSV(filtered)}`,
              'wifisense-events.txt',
              'text/plain'
            )
          }
        >
          📥 Download Report
        </Button>
        <Toggle checked={emailAlerts} onChange={setEmailAlerts} activeLabel="Alerts On" inactiveLabel="Alerts Off" />
        <Button variant="outline" size="sm" onClick={() => setWebhookOpen(true)}>
          🔗 Webhook Settings
        </Button>
      </div>

      <div className="max-h-[600px] space-y-3 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-slate-500">No events match your filters</p>
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              searchQuery={searchQuery}
              onDismiss={dismissEvent}
              onViewDetails={setSelectedEvent}
            />
          ))
        )}
      </div>

      <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details">
        {selectedEvent && (
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-white">Type:</strong> {selectedEvent.type}</p>
            <p><strong className="text-white">Severity:</strong> {selectedEvent.severity}</p>
            <p><strong className="text-white">Message:</strong> {selectedEvent.message}</p>
            <p><strong className="text-white">Location:</strong> {selectedEvent.location}</p>
            <p><strong className="text-white">Confidence:</strong> {(selectedEvent.confidence * 100).toFixed(1)}%</p>
          </div>
        )}
      </Dialog>

      <Dialog open={webhookOpen} onClose={() => setWebhookOpen(false)} title="Webhook Settings">
        <div className="space-y-4">
          <input
            type="url"
            placeholder="https://your-server.com/webhook"
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <Button
            onClick={() => {
              setWebhookUrl(webhookInput);
              setWebhookOpen(false);
            }}
          >
            Save Webhook URL
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

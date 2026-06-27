'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
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
import { AnimatePresence } from 'framer-motion';

const FILTERS: { id: EventFilter; label: string }[] = [
  { id: 'all', label: 'All Events' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning', label: 'Warnings' },
  { id: 'info', label: 'Info' },
];

const TIME_RANGES = [
  { id: '1h', label: 'Last 1 hour' },
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last 7 days' },
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

const PERSON_OPTIONS = ['all', 'person-1', 'person-2', 'person-3', 'intruder'];

export function EventLog() {
  const {
    events,
    filter,
    searchQuery,
    timeRange,
    zoneFilter,
    personFilter,
    emailAlerts,
    soundAlerts,
    webhookUrl,
    setFilter,
    setSearchQuery,
    setTimeRange,
    setZoneFilter,
    setPersonFilter,
    setEmailAlerts,
    setSoundAlerts,
    setWebhookUrl,
    acknowledgeEvent,
    dismissEvent,
    undoDismiss,
    setEvents,
  } = useEventStore();

  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [webhookInput, setWebhookInput] = useState(webhookUrl);
  const [toast, setToast] = useState<{ message: string; undoId?: string } | null>(null);

  const eventsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch events every 2 seconds (ONLY SETUP ONCE)
  useEffect(() => {
    if (eventsIntervalRef.current) return;

    eventsIntervalRef.current = setInterval(async () => {
      try {
        const params = new URLSearchParams({
          filter,
          timeRange,
          zone: zoneFilter,
          person: personFilter,
          search: searchQuery,
        });

        const response = await fetch(`/api/events?${params}`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();

        setEvents(data.events);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    }, 2000);

    return () => {
      if (eventsIntervalRef.current) {
        clearInterval(eventsIntervalRef.current);
        eventsIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency - runs once on mount

  // Toast cleanup timeout
  useEffect(() => {
    if (!toast?.undoId) return;

    // Clear existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    // Set new timeout
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [toast?.undoId]);

  // Memoized filtered events
  const filtered = useMemo(
    () =>
      filterEvents(
        events,
        filter,
        searchQuery,
        zoneFilter,
        timeRangeToMs(timeRange),
        personFilter
      ),
    [events, filter, searchQuery, zoneFilter, timeRange, personFilter]
  );

  // Memoized event counts
  const counts = useMemo(
    () => ({
      all: events.length,
      critical: events.filter((e) => e.severity === 'critical').length,
      warning: events.filter((e) => e.severity === 'warning').length,
      info: events.filter((e) => e.severity === 'info').length,
    }),
    [events]
  );

  // Handlers
  const handleDismiss = (id: string) => {
    dismissEvent(id);
    setToast({ message: 'Event dismissed', undoId: id });
  };

  const handleExport = (event: AppEvent) => {
    downloadFile(
      JSON.stringify(event, null, 2),
      `event-${event.id}.json`,
      'application/json'
    );
  };

  const handleExportCSV = () => {
    downloadFile(
      exportEventsCSV(filtered),
      'wifisense-events.csv',
      'text/csv'
    );
  };

  const handleExportReport = () => {
    const report = `WiFiSense Pro Event Report\n${'='.repeat(50)}\n\n${exportEventsCSV(filtered)}`;
    downloadFile(report, 'wifisense-report.txt', 'text/plain');
  };

  const handleCopyEvents = () => {
    navigator.clipboard.writeText(JSON.stringify(filtered, null, 2));
    setToast({ message: `${filtered.length} events copied` });
  };

  const handleWebhookSave = () => {
    setWebhookUrl(webhookInput);
    setWebhookOpen(false);
    setToast({ message: 'Webhook settings saved' });
  };

  const handleWebhookTest = () => {
    setToast({ message: 'Test webhook sent (simulated)' });
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchQuery('');
    setTimeRange('24h');
    setZoneFilter('all');
    setPersonFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
        <span className="text-sm text-slate-300">
          Showing {filtered.length} events · Critical: {counts.critical} ·
          Warnings: {counts.warning} · Info: {counts.info}
        </span>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? 'border border-accent-blue/40 bg-accent-blue/20 text-accent-blue'
                : 'border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:border-white/20"
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
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:border-white/20"
        >
          {ZONE_OPTIONS.map((z) => (
            <option key={z} value={z} className="bg-slate-900">
              {z === 'all'
                ? 'All Zones'
                : z
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>

        <select
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:border-white/20"
        >
          {PERSON_OPTIONS.map((p) => (
            <option key={p} value={p} className="bg-slate-900">
              {p === 'all'
                ? 'All People'
                : p
                    .replace('-', ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 transition-colors hover:border-white/20 focus:border-accent-blue focus:outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          Download CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExportReport}>
          Download Report
        </Button>
        <Button variant="secondary" size="sm" onClick={handleCopyEvents}>
          Copy All Events
        </Button>
        <Toggle
          checked={emailAlerts}
          onChange={setEmailAlerts}
          activeLabel="Email On"
          inactiveLabel="Email Off"
        />
        <Toggle
          checked={soundAlerts}
          onChange={setSoundAlerts}
          activeLabel="Sound On"
          inactiveLabel="Sound Off"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWebhookOpen(true)}
        >
          Webhook Settings
        </Button>
      </div>

      {/* Events List */}
      <div className="max-h-[600px] space-y-3 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No events match your filters
            </p>
          ) : (
            filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                searchQuery={searchQuery}
                onAcknowledge={acknowledgeEvent}
                onDismiss={handleDismiss}
                onViewDetails={setSelectedEvent}
                onExport={handleExport}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-lg border border-white/10 bg-slate-800 px-4 py-3 shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm text-white">{toast.message}</span>
          {toast.undoId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                undoDismiss(toast.undoId!);
                setToast(null);
              }}
            >
              Undo
            </Button>
          )}
        </div>
      )}

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
      >
        {selectedEvent && (
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <strong className="text-white">Type:</strong> {selectedEvent.type}
            </p>
            <p>
              <strong className="text-white">Description:</strong>{' '}
              {selectedEvent.description}
            </p>
            <p>
              <strong className="text-white">Zone:</strong> {selectedEvent.zone}
            </p>
            <p>
              <strong className="text-white">People:</strong>{' '}
              {selectedEvent.personIds.join(', ') || 'N/A'}
            </p>
            <p>
              <strong className="text-white">Confidence:</strong>{' '}
              {(selectedEvent.confidence * 100).toFixed(1)}%
            </p>
            <p>
              <strong className="text-white">Timestamp:</strong>{' '}
              {new Date(selectedEvent.timestamp).toLocaleString()}
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport(selectedEvent)}
              >
                Export Event
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog
        open={webhookOpen}
        onClose={() => setWebhookOpen(false)}
        title="Webhook Configuration"
      >
        <div className="space-y-4">
          <input
            type="url"
            placeholder="https://your-server.com/webhook"
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 transition-colors hover:border-white/20 focus:border-accent-blue focus:outline-none"
          />
          <div className="flex gap-2">
            <Button onClick={handleWebhookSave}>Save</Button>
            <Button variant="secondary" onClick={handleWebhookTest}>
              Test
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
'use client';

import type { AppEvent, Severity } from '@/lib/types';
import { formatDateTime, getSeverityBorderColor } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/solid';

interface EventCardProps {
  event: AppEvent;
  searchQuery?: string;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onViewDetails?: (event: AppEvent) => void;
  onExport?: (event: AppEvent) => void;
}

function SeverityIcon({ severity }: { severity: Severity }) {
  switch (severity) {
    case 'critical':
      return <ShieldExclamationIcon className="h-5 w-5 text-accent-red" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-5 w-5 text-accent-orange" />;
    default:
      return <InformationCircleIcon className="h-5 w-5 text-accent-blue" />;
  }
}

function highlightText(text: string, query?: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-accent-blue/30 px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function EventCard({
  event,
  searchQuery,
  onAcknowledge,
  onDismiss,
  onViewDetails,
  onExport,
}: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`rounded-lg border border-white/10 bg-white/[0.03] ${getSeverityBorderColor(event.severity)} ${
        event.acknowledged ? 'opacity-70' : ''
      }`}
    >
      <div className="flex">
        <div className={`w-1 shrink-0 rounded-l-lg ${
          event.severity === 'critical' ? 'bg-accent-red' : event.severity === 'warning' ? 'bg-accent-orange' : 'bg-accent-blue'
        }`} />
        <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <SeverityIcon severity={event.severity} />
            <div className="min-w-0">
              <p className="font-semibold text-white">{highlightText(event.message, searchQuery)}</p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDateTime(event.timestamp)} · {highlightText(event.location, searchQuery)} ·{' '}
                {(event.confidence * 100).toFixed(1)}% confidence
              </p>
              {event.personIds.length > 0 && (
                <p className="text-xs text-slate-600">People: {event.personIds.join(', ')}</p>
              )}
              <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${
                event.status === 'acknowledged' ? 'bg-slate-700 text-slate-300' :
                event.status === 'resolved' ? 'bg-accent-green/20 text-accent-green' :
                'bg-accent-red/20 text-accent-red'
              }`}>
                {event.status || 'Active'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAcknowledge?.(event.id)}
              disabled={event.acknowledged}
            >
              {event.acknowledged ? <CheckCircleIcon className="h-4 w-4" /> : 'Acknowledge'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onViewDetails?.(event)}>
              View Details
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onExport?.(event)}>
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDismiss?.(event.id)}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

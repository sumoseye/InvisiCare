'use client';

import type { AppEvent } from '@/lib/types';
import { formatDateTime, getSeverityColor, getSeverityIcon } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface EventCardProps {
  event: AppEvent;
  searchQuery?: string;
  onDismiss?: (id: string) => void;
  onViewDetails?: (event: AppEvent) => void;
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
  onDismiss,
  onViewDetails,
}: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      <Card className={`border ${getSeverityColor(event.severity)} p-4`}>
        <div className="flex items-start gap-3">
          <span className="text-xl">{getSeverityIcon(event.severity)}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">
              {highlightText(event.message, searchQuery)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {formatDateTime(event.timestamp)} · {highlightText(event.location, searchQuery)} ·{' '}
              {(event.confidence * 100).toFixed(1)}% confidence
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onViewDetails?.(event)}>
                View Details
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDismiss?.(event.id)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAlertStore } from '@/lib/store';
import { formatDateTime, getConfidenceColor } from '@/lib/utils';
import { Button } from '../ui/Button';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

export function AlertBanner() {
  const { alert, clearAlert } = useAlertStore();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!alert) return;
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearAlert();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [alert, clearAlert]);

  if (!alert) return null;

  const isIntrusion = alert.type === 'intrusion';

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="relative overflow-hidden border-b border-accent-red/30 bg-gradient-to-r from-accent-red/20 via-accent-orange/20 to-accent-red/20 px-4 py-4"
    >
      <motion.div
        className="absolute inset-0 bg-accent-red/5"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {isIntrusion ? (
            <ShieldExclamationIcon className="h-8 w-8 shrink-0 text-accent-red" />
          ) : (
            <ExclamationTriangleIcon className="h-8 w-8 shrink-0 text-accent-orange" />
          )}
          <div>
            <p className="text-lg font-bold uppercase tracking-wide text-white">
              {isIntrusion ? 'Intrusion Detected' : alert.message}
            </p>
            <p className="text-sm text-slate-300">
              {isIntrusion && `Unauthorized entry detected — Zone: ${alert.location}`}
              {!isIntrusion && `${alert.location} · ${formatDateTime(alert.timestamp)}`}
            </p>
            <p className="text-sm text-slate-400">
              <span className={getConfidenceColor(alert.confidence)}>
                {(alert.confidence * 100).toFixed(1)}% confidence
              </span>
              {isIntrusion && ` · ${formatDateTime(alert.timestamp)}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            View in Map
          </Button>
          <Button variant="secondary" size="sm" onClick={clearAlert}>
            Dismiss ({countdown}s)
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

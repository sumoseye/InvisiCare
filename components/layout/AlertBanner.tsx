'use client';

import { useAlertStore } from '@/lib/store';
import { formatDateTime, getConfidenceColor } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';

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

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative overflow-hidden border-b border-accent-red/30 bg-gradient-to-r from-accent-red/20 via-accent-orange/20 to-accent-red/20 px-4 py-4"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl">
                {alert.type === 'fall' ? '⚠️' : '🚨'}
              </span>
              <div>
                <p className="text-lg font-bold text-white">{alert.message}</p>
                <p className="text-sm text-slate-300">
                  {alert.location} · {formatDateTime(alert.timestamp)} ·{' '}
                  <span className={getConfidenceColor(alert.confidence)}>
                    {(alert.confidence * 100).toFixed(1)}% confidence
                  </span>
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={clearAlert}>
              Dismiss ({countdown}s)
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

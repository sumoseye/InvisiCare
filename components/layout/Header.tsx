'use client';

import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRoomStore } from '@/lib/store';
import { Navigation } from './Navigation';

export function Header() {
  const [time, setTime] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { selectedRoom, setSelectedRoom } = useRoomStore();

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center justify-between gap-4 lg:justify-start">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text lg:text-xl">
              <span className="bg-gradient-to-r from-accent-blue via-accent-green to-text bg-clip-text text-transparent">
                InvisiCare
              </span>
            </h1>

          </div>

          <button
            className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-text lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="hidden lg:block lg:self-center">
          <Navigation />
        </div>

        <div className="flex items-center gap-3 lg:justify-end">
          <span className="hidden rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted sm:block">
            {time}
          </span>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text shadow-sm outline-none transition focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
          >
            <option value="1">Room 1</option>
            <option value="2">Room 2</option>
          </select>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-border px-4 py-3 lg:hidden"
        >
          <Navigation onSelect={() => setMobileOpen(false)} />
        </motion.div>
      )}
    </header>
  );
}

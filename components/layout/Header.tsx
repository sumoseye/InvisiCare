'use client';

import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TABS } from '@/lib/constants';
import { useAppStore } from '@/lib/store';
import { Badge } from '../ui/Badge';
import { Navigation } from './Navigation';

export function Header() {
  const [time, setTime] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeTab = useAppStore((s) => s.activeTab);

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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-dark/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold lg:text-xl">
            <span className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-green bg-clip-text text-transparent">
              WiFiSense Pro
            </span>
          </h1>
          <div className="hidden items-center gap-2 md:flex">
            <motion.div
              className="h-2.5 w-2.5 rounded-full bg-accent-green"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-accent-green">Live</span>
          </div>
        </div>

        <div className="hidden lg:block">
          <Navigation />
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-400 sm:block">{time}</span>
          <Badge variant="success" className="hidden sm:inline-flex">
            System Active
          </Badge>
          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-white/10 px-4 py-3 lg:hidden"
        >
          <Navigation onSelect={() => setMobileOpen(false)} />
        </motion.div>
      )}

      <div className="hidden h-0.5 bg-slate-800 lg:block">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-blue to-accent-purple"
          layout
          style={{
            width: `${(TABS.findIndex((t) => t.id === activeTab) + 1) * (100 / TABS.length)}%`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
    </header>
  );
}

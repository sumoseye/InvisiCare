'use client';

import type { Zone } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

interface ZoneCardProps {
  zone: Zone;
  onClick?: () => void;
}

const statusColors = {
  clear: 'bg-accent-green',
  occupied: 'bg-yellow-400',
  alert: 'bg-accent-red animate-pulse',
};

export function ZoneCard({ zone, onClick }: ZoneCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-lg hover:shadow-accent-blue/10"
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{zone.icon}</span>
            <div>
              <p className="font-semibold text-white">{zone.name}</p>
              <p className="text-xs text-slate-500">{formatDateTime(zone.lastActivity)}</p>
            </div>
          </div>
          <div className={`h-3 w-3 rounded-full ${statusColors[zone.status]}`} />
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>Motion</span>
            <span>{zone.motionIntensity}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"
              animate={{ width: `${zone.motionIntensity}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

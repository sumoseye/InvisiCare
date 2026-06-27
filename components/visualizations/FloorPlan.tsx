'use client';

import type { Zone } from '@/lib/types';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FloorPlanProps {
  zones: Zone[];
  selectedZone?: string | null;
  onZoneClick?: (zone: Zone) => void;
}

const ROOM_LAYOUT = [
  { id: 1, x: 20, y: 20, w: 180, h: 140 },
  { id: 2, x: 220, y: 20, w: 140, h: 140 },
  { id: 3, x: 380, y: 20, w: 200, h: 140 },
  { id: 4, x: 20, y: 180, w: 120, h: 120 },
  { id: 5, x: 160, y: 180, w: 100, h: 120 },
  { id: 6, x: 280, y: 180, w: 300, h: 120 },
];

const PERSON_POSITIONS = [
  { zoneId: 1, cx: 110, cy: 90 },
  { zoneId: 3, cx: 480, cy: 90 },
];

export function FloorPlan({ zones, selectedZone, onZoneClick }: FloorPlanProps) {
  const zoneMap = useMemo(() => new Map(zones.map((z) => [z.id, z])), [zones]);

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <svg viewBox="0 0 600 320" className="w-full">
        {ROOM_LAYOUT.map((room) => {
          const zone = zoneMap.get(room.id);
          const isAlert = zone?.status === 'alert';
          const isSelected = selectedZone === zone?.slug;
          return (
            <g key={room.id} onClick={() => zone && onZoneClick?.(zone)} className="cursor-pointer">
              <motion.rect
                x={room.x}
                y={room.y}
                width={room.w}
                height={room.h}
                rx={8}
                fill={isAlert ? '#ef444420' : isSelected ? '#60a5fa15' : '#1e293b'}
                stroke={isAlert ? '#ef4444' : isSelected ? '#60a5fa' : '#334155'}
                strokeWidth={isAlert ? 2 : 1}
                animate={isAlert ? { opacity: [1, 0.6, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#94a3b8"
                fontSize="12"
              >
                {zone?.icon} {zone?.name}
              </text>
            </g>
          );
        })}
        {PERSON_POSITIONS.map((p, i) => {
          const zone = zoneMap.get(p.zoneId);
          if (zone?.status === 'clear') return null;
          return (
            <motion.circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={8}
              fill="#60a5fa"
              filter="url(#personGlow)"
              animate={{ r: [8, 10, 8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          );
        })}
        <defs>
          <filter id="personGlow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

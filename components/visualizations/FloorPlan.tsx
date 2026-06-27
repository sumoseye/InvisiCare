'use client';

import type { PersonSkeleton, Zone } from '@/lib/types';
import { PERSON_COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FloorPlanProps {
  zones: Zone[];
  people?: PersonSkeleton[];
  selectedZone?: string | null;
  onZoneClick?: (zone: Zone) => void;
}

const ROOM_LAYOUT: Record<string, { x: number; y: number; w: number; h: number }> = {
  'living-room': { x: 20, y: 20, w: 180, h: 140 },
  bedroom: { x: 220, y: 20, w: 140, h: 140 },
  kitchen: { x: 380, y: 20, w: 200, h: 140 },
  hallway: { x: 20, y: 180, w: 120, h: 120 },
  bathroom: { x: 160, y: 180, w: 100, h: 120 },
  entry: { x: 280, y: 180, w: 300, h: 120 },
};

const ROOM_POSITION_MAP: Record<string, { cx: number; cy: number }> = {
  living_room: { cx: 110, cy: 90 },
  kitchen: { cx: 480, cy: 90 },
  bedroom: { cx: 290, cy: 90 },
  entry: { cx: 430, cy: 240 },
  hallway: { cx: 80, cy: 240 },
  bathroom: { cx: 210, cy: 240 },
};

export function FloorPlan({ zones, people = [], selectedZone, onZoneClick }: FloorPlanProps) {
  const zoneMap = useMemo(() => new Map(zones.map((z) => [z.slug || String(z.id), z])), [zones]);

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <svg viewBox="0 0 600 320" className="w-full">
        {Object.entries(ROOM_LAYOUT).map(([slug, room]) => {
          const zone = zoneMap.get(slug);
          const isAlert = zone?.status === 'alert';
          const isSelected = selectedZone === slug;
          return (
            <g key={slug} onClick={() => zone && onZoneClick?.(zone)} className="cursor-pointer">
              <motion.rect
                x={room.x} y={room.y} width={room.w} height={room.h} rx={8}
                fill={isAlert ? '#ef444420' : isSelected ? '#60a5fa15' : '#1e293b'}
                stroke={isAlert ? '#ef4444' : isSelected ? '#60a5fa' : '#334155'}
                strokeWidth={isAlert ? 2 : 1}
                animate={isAlert ? { opacity: [1, 0.6, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <text x={room.x + room.w / 2} y={room.y + room.h / 2 - 8} textAnchor="middle" fill="#94a3b8" fontSize="11">{zone?.name}</text>
              <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 10} textAnchor="middle" fill="#64748b" fontSize="10">
                {zone?.occupancyCount ?? 0} occupant(s)
              </text>
            </g>
          );
        })}
        {people.map((p) => {
          const pos = ROOM_POSITION_MAP[p.room] || { cx: 300, cy: 160 };
          const offset = p.personId === 'person-2' ? 15 : p.personId === 'intruder' ? -15 : 0;
          const color = p.isIntruder ? PERSON_COLORS.intruder : p.color;
          return (
            <motion.circle
              key={p.personId}
              cx={pos.cx + offset}
              cy={pos.cy}
              r={8}
              fill={color}
              animate={{ r: [8, 10, 8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          );
        })}
      </svg>
    </div>
  );
}

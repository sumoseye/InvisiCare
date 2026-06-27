'use client';

import { useMemo } from 'react';
import { ACTIVITY_LABELS, PERSON_LABELS } from '@/lib/constants';
import type { PersonVitals } from '@/lib/types';
import { useVitalsStore } from '@/lib/store';
import { cn, getConfidenceColor, isBreathingNormal, isHeartRateNormal } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/solid';

interface VitalsPanelProps {
  className?: string;
}

function TrendIcon({ trend }: { trend?: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <ArrowUpIcon className="h-3 w-3 text-accent-orange" />;
  if (trend === 'down') return <ArrowDownIcon className="h-3 w-3 text-accent-blue" />;
  return <ArrowRightIcon className="h-3 w-3 text-slate-500" />;
}

function PersonVitalCard({
  person,
  isFocused,
  onFocus,
}: {
  person: PersonVitals;
  isFocused: boolean;
  onFocus: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onFocus}
      whileHover={{ y: -2 }}
      className={cn(
        'w-full rounded-lg border p-4 text-left transition-all',
        isFocused
          ? 'border-accent-blue/50 bg-accent-blue/10 shadow-lg shadow-accent-blue/10'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: person.color }}
          />
          <span className="font-semibold text-white">
            {PERSON_LABELS[person.personId] || person.label}
          </span>
        </div>
        {person.isIntruder && (
          <span className="rounded bg-accent-red/20 px-2 py-0.5 text-xs text-accent-red">
            Intruder
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Breathing</span>
          <div className="flex items-center gap-1">
            <TrendIcon trend={person.breathingTrend} />
            <span className={isBreathingNormal(person.breathing) ? 'text-accent-green' : 'text-accent-orange'}>
              {person.breathing.toFixed(1)} BPM
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Heart Rate</span>
          <div className="flex items-center gap-1">
            <TrendIcon trend={person.heartTrend} />
            <span className={isHeartRateNormal(person.heartRate) ? 'text-accent-green' : 'text-accent-orange'}>
              {person.heartRate} BPM
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Activity</span>
          <span className="text-white">{ACTIVITY_LABELS[person.activity]}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Confidence</span>
          <span className={getConfidenceColor(person.confidence)}>
            {(person.confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Signal</span>
          <span className="text-xs text-slate-500">{person.signalStrength} dBm</span>
        </div>
      </div>
    </motion.button>
  );
}

export function VitalsPanel({ className = '' }: VitalsPanelProps) {
  const peopleMap = useVitalsStore((s) => s.people);
  const people = useMemo(() => Object.values(peopleMap), [peopleMap]);
  const monitoredPerson = people.find((p) => !p.isIntruder) || null;
  const intruders = people.filter((p) => p.isIntruder);

  return (
    <div
      className={cn(
        'glass-card flex flex-col rounded-xl border border-accent-blue/20 p-5',
        className
      )}
    >
      <div className="mb-4 border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white">Active Monitoring</h3>
        <p className="text-sm text-slate-400">Single-resident mode</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin">
        {monitoredPerson && <PersonVitalCard person={monitoredPerson} isFocused={true} onFocus={() => {}} />}
        {intruders.map((person) => (
          <PersonVitalCard
            key={person.personId}
            person={person}
            isFocused={false}
            onFocus={() => {}}
          />
        ))}
        {!monitoredPerson && intruders.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">Waiting for sensor data...</p>
        )}
      </div>
    </div>
  );
}

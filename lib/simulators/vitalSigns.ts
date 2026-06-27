import type { PersonVitals, VitalsResponse } from '../types';
import { PERSON_COLORS, PERSON_LABELS } from '../constants';
import { clamp, randomNoise } from '../utils';
import { getAllPeopleStates, getPersonCount, isIntruderActive } from './movement';

const prevVitals: Record<string, { breathing: number; heartRate: number }> = {};

function activityBaselines(activity: string) {
  switch (activity) {
    case 'walking':
      return { breathing: 21, heart: 88, breathingRange: 3, heartRange: 7 };
    case 'sitting':
      return { breathing: 16, heart: 70, breathingRange: 2, heartRange: 5 };
    case 'lying':
      return { breathing: 14, heart: 65, breathingRange: 2, heartRange: 4 };
    case 'falling':
      return { breathing: 22, heart: 95, breathingRange: 4, heartRange: 10 };
    default:
      return { breathing: 16, heart: 74, breathingRange: 2, heartRange: 5 };
  }
}

function trend(current: number, prev: number | undefined): 'up' | 'down' | 'stable' {
  if (prev === undefined) return 'stable';
  if (current > prev + 0.5) return 'up';
  if (current < prev - 0.5) return 'down';
  return 'stable';
}

export function generateVitalSigns(): VitalsResponse {
  const states = getAllPeopleStates();
  const people: PersonVitals[] = states.map((s) => {
    const base = activityBaselines(s.activity);
    const breathing = clamp(
      base.breathing + Math.sin(Date.now() / 3000) * base.breathingRange * 0.3 + randomNoise(0.8),
      12,
      25
    );
    const heartRate = Math.round(
      clamp(base.heart + Math.sin(Date.now() / 2000) * base.heartRange * 0.4 + randomNoise(2), 55, 100)
    );

    const prev = prevVitals[s.personId];
    const vitals: PersonVitals = {
      personId: s.personId,
      label: PERSON_LABELS[s.personId] || s.label,
      breathing: Math.round(breathing * 10) / 10,
      heartRate,
      activity: s.activity,
      confidence: clamp(0.88 + randomNoise(0.08), 0.75, 0.99),
      signalStrength: Math.round(-40 + randomNoise(8)),
      position: { ...s.position },
      room: s.room,
      timestamp: Date.now(),
      isIntruder: s.isIntruder,
      breathingTrend: trend(breathing, prev?.breathing),
      heartTrend: trend(heartRate, prev?.heartRate),
      color: s.color || PERSON_COLORS[s.personId] || '#5a6b7a',
    };
    prevVitals[s.personId] = { breathing: vitals.breathing, heartRate: vitals.heartRate };
    return vitals;
  });

  const legit = people.filter((p) => !p.isIntruder);
  const primary = legit[0];
  const avgBreathing = legit.reduce((a, p) => a + p.breathing, 0) / (legit.length || 1);
  const avgHeart = legit.reduce((a, p) => a + p.heartRate, 0) / (legit.length || 1);

  return {
    people,
    timestamp: Date.now(),
    person_count: getPersonCount(),
    breathing_rate: Math.round(avgBreathing * 10) / 10,
    heart_rate: Math.round(avgHeart),
    presence_detected: people.length > 0,
    presence_confidence: primary?.confidence ?? 0.95,
    signal_strength: primary?.signalStrength ?? -45,
    activity: primary?.activity ?? 'standing',
    fall_detected: people.some((p) => p.activity === 'falling'),
    status: isIntruderActive() ? 'alert' : 'active',
    zones: Array.from(new Set(legit.map((p) => p.room.replace('_', ' ')))),
  };
}

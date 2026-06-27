import type { ActivityType } from '../types';
import { clamp, randomNoise } from '../utils';
import { getSkeletonActivity } from './skeleton';

let breathingPhase = 0;
let heartPhase = 0;
let personCount = 2;
let activity: ActivityType = 'standing';
let fallDetected = false;

const ZONE_NAMES = ['Living Room', 'Kitchen', 'Bedroom', 'Hallway'];

export function generateVitalSigns() {
  breathingPhase += 0.04;
  heartPhase += 0.12;

  activity = getSkeletonActivity();

  const breathingBase = activity === 'lying' ? 14 : activity === 'walking' ? 18 : 16;
  const breathing_rate = clamp(
    breathingBase + Math.sin(breathingPhase) * 1.5 + randomNoise(0.8),
    12,
    20
  );

  const hrBase =
    activity === 'walking' ? 85 : activity === 'sitting' ? 68 : activity === 'lying' ? 62 : 72;
  const heart_rate = Math.round(
    clamp(hrBase + Math.sin(heartPhase) * 5 + randomNoise(3), 55, 100)
  );

  if (Math.random() < 0.001) {
    personCount = Math.random() > 0.5 ? 1 : 2;
  }

  fallDetected = activity === 'falling' || activity === 'lying' && Math.random() < 0.0001;

  const occupiedZones =
    personCount >= 2
      ? ['Living Room', 'Kitchen']
      : [ZONE_NAMES[Math.floor(Math.random() * 2)]];

  return {
    timestamp: Date.now(),
    breathing_rate: Math.round(breathing_rate * 10) / 10,
    heart_rate,
    presence_detected: true,
    presence_confidence: clamp(0.92 + randomNoise(0.05), 0.85, 0.99),
    signal_strength: Math.round(-42 + randomNoise(6)),
    person_count: personCount,
    activity,
    fall_detected: fallDetected,
    status: 'active',
    zones: occupiedZones,
  };
}

export function getCurrentActivity(): ActivityType {
  return activity;
}

export function getPersonCount(): number {
  return personCount;
}

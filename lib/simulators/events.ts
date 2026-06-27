import type { AppEvent, Sensitivity, Zone } from '../types';
import { ZONES } from '../constants';
import { getCurrentActivity } from './vitalSigns';

let events: AppEvent[] = [];
let armed = false;
let sensitivity: Sensitivity = 'medium';
let zoneStates: Zone[] = ZONES.map((z) => ({ ...z }));

const SENSITIVITY_MULTIPLIER: Record<Sensitivity, number> = {
  low: 0.5,
  medium: 1,
  high: 2,
};

function createEvent(
  type: string,
  severity: AppEvent['severity'],
  message: string,
  location: string,
  confidence: number
): AppEvent {
  return {
    id: crypto.randomUUID(),
    type,
    severity,
    message,
    timestamp: Date.now(),
    location,
    confidence,
  };
}

function seedEvents() {
  const now = Date.now();
  events = [
    createEvent('occupancy', 'info', 'Person entered Living Room', 'Living Room', 0.94),
    createEvent('activity', 'info', 'Activity changed to walking', 'Kitchen', 0.91),
    createEvent('vitals', 'warning', 'Elevated heart rate detected', 'Living Room', 0.87),
    createEvent('occupancy', 'info', 'Person left Bedroom', 'Bedroom', 0.96),
    createEvent('motion', 'info', 'Motion detected in Hallway', 'Hallway', 0.89),
  ].map((e, i) => ({ ...e, timestamp: now - (i + 1) * 300000 }));
}

seedEvents();

export function setArmed(value: boolean) {
  armed = value;
}

export function setSensitivity(value: Sensitivity) {
  sensitivity = value;
}

export function tickEvents() {
  const activity = getCurrentActivity();
  const multiplier = SENSITIVITY_MULTIPLIER[sensitivity];

  if ((activity === 'standing' || activity === 'walking') && Math.random() < 0.002 * multiplier) {
    const event = createEvent(
      'fall',
      'critical',
      'Fall detected',
      'Living Room',
      0.92 + Math.random() * 0.06
    );
    events.unshift(event);
  }

  if (armed && Math.random() < 0.0015 * multiplier) {
    const zone = zoneStates[Math.floor(Math.random() * zoneStates.length)];
    const event = createEvent(
      'intrusion',
      'critical',
      `Intrusion detected in ${zone.name}`,
      zone.name,
      0.88 + Math.random() * 0.1
    );
    events.unshift(event);
    zoneStates = zoneStates.map((z) =>
      z.id === zone.id ? { ...z, status: 'alert' as const, lastActivity: Date.now() } : z
    );
  }

  if (Math.random() < 0.003) {
    const zone = zoneStates[Math.floor(Math.random() * zoneStates.length)];
    const types = [
      { type: 'occupancy', severity: 'info' as const, message: `Occupancy change in ${zone.name}` },
      { type: 'activity', severity: 'info' as const, message: `Activity switch detected in ${zone.name}` },
      { type: 'vitals', severity: 'warning' as const, message: 'Irregular breathing pattern detected' },
    ];
    const t = types[Math.floor(Math.random() * types.length)];
    events.unshift(
      createEvent(t.type, t.severity, t.message, zone.name, 0.85 + Math.random() * 0.12)
    );
  }

  events = events.slice(0, 100);

  zoneStates = zoneStates.map((z) => {
    const motionIntensity = Math.max(
      0,
      Math.min(100, z.motionIntensity + (Math.random() - 0.5) * 15)
    );
    let status = z.status;
    if (z.status === 'alert' && Math.random() < 0.05) status = 'occupied';
    else if (z.status === 'clear' && motionIntensity > 30) status = 'occupied';
    else if (z.status === 'occupied' && motionIntensity < 10 && Math.random() < 0.02)
      status = 'clear';
    return {
      ...z,
      motionIntensity: Math.round(motionIntensity),
      status,
      lastActivity: motionIntensity > 20 ? Date.now() : z.lastActivity,
    };
  });
}

export function getEvents(
  filter = 'all',
  zone = 'all',
  timeRangeMs = 86400000,
  search = ''
): AppEvent[] {
  tickEvents();
  const now = Date.now();
  return events.filter((event) => {
    if (filter !== 'all' && event.severity !== filter) return false;
    if (zone !== 'all') {
      const slug = event.location.toLowerCase().replace(/\s+/g, '-');
      if (slug !== zone && event.location.toLowerCase() !== zone.replace(/-/g, ' '))
        return false;
    }
    if (now - event.timestamp > timeRangeMs) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !event.message.toLowerCase().includes(q) &&
        !event.location.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

export function getAllEvents(): AppEvent[] {
  return events;
}

export function getZones(): Zone[] {
  tickEvents();
  return zoneStates;
}

export function generateOccupancyData() {
  return Array.from({ length: 24 }, (_, hour) => {
    const peak = hour >= 8 && hour <= 22;
    const count = peak ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);
    return { hour, count, label: `${hour}:00` };
  });
}

export function generateTrendData(points = 60) {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const t = i / points;
    return {
      time: `${i}m`,
      breathing: 16 + Math.sin(t * Math.PI * 4) * 2 + Math.random(),
      heartRate: 72 + Math.sin(t * Math.PI * 6) * 8 + Math.random() * 3,
      timestamp: now - (points - i) * 60000,
    };
  });
}

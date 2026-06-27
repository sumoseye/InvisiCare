import type { AppEvent, EventType, PersonID, Sensitivity, Zone } from '../types';
import { ZONES } from '../constants';
import { getAllPeopleStates } from './movement';
import { spawnIntruder, isIntruderActive } from './movement';

let events: AppEvent[] = [];
let armed = false;
let sensitivity: Sensitivity = 'medium';
let zoneStates: Zone[] = ZONES.map((z) => ({ ...z }));

const SENSITIVITY_MULTIPLIER: Record<Sensitivity, number> = {
  low: 0.5,
  medium: 1,
  high: 2,
};

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function createEvent(
  type: EventType,
  severity: AppEvent['severity'],
  message: string,
  location: string,
  confidence: number,
  personIds: PersonID[] = []
): AppEvent {
  return {
    id: crypto.randomUUID(),
    type,
    severity,
    message,
    description: message,
    timestamp: Date.now(),
    location,
    zone: slugify(location),
    confidence,
    personIds,
    acknowledged: false,
    dismissed: false,
    status: 'active',
  };
}

function seedEvents() {
  const now = Date.now();
  events = [
    createEvent('occupancy_change', 'info', 'Person entered Living Room', 'Living Room', 0.94, ['person-1']),
    createEvent('activity_change', 'info', 'Person 2 transitioned to Walking activity', 'Kitchen', 0.91, ['person-2']),
    createEvent('anomaly', 'warning', 'Elevated heart rate detected - Person 1', 'Living Room', 0.87, ['person-1']),
    createEvent('occupancy_change', 'info', 'Person left Bedroom', 'Bedroom', 0.96, []),
    createEvent('motion', 'info', 'Motion detected in Hallway', 'Hallway', 0.89, []),
  ].map((e, i) => ({ ...e, timestamp: now - (i + 1) * 300000 }));
}

seedEvents();

export function setArmed(value: boolean) {
  armed = value;
  if (!value) {
    // keep intruder for demo until cleared manually
  }
}

export function getArmed() {
  return armed;
}

export function setSensitivity(value: Sensitivity) {
  sensitivity = value;
}

export function acknowledgeEvent(eventId: string) {
  events = events.map((e) =>
    e.id === eventId ? { ...e, acknowledged: true, status: 'acknowledged' as const } : e
  );
}

export function dismissEventById(eventId: string) {
  events = events.map((e) =>
    e.id === eventId ? { ...e, dismissed: true, status: 'resolved' as const } : e
  );
}

export function deleteEvent(eventId: string) {
  events = events.filter((e) => e.id !== eventId);
}

export function tickEvents() {
  const people = getAllPeopleStates().filter((p) => !p.isIntruder);
  const multiplier = SENSITIVITY_MULTIPLIER[sensitivity];

  people.forEach((p) => {
    if (
      (p.activity === 'standing' || p.activity === 'walking') &&
      Math.random() < 0.0008 * multiplier
    ) {
      events.unshift(
        createEvent(
          'fall',
          'critical',
          `Fall Detected - ${p.label}`,
          'Living Room',
          0.92 + Math.random() * 0.06,
          [p.personId]
        )
      );
    }
  });

  if (armed && !isIntruderActive() && Math.random() < 0.002 * multiplier) {
    spawnIntruder();
    events.unshift(
      createEvent(
        'intrusion',
        'critical',
        'Intrusion detected - Person at Entry Door',
        'Entry',
        0.88 + Math.random() * 0.1,
        ['intruder']
      )
    );
    zoneStates = zoneStates.map((z) =>
      z.slug === 'entry' || z.id === 'entry'
        ? { ...z, status: 'alert' as const, lastActivity: Date.now(), personIds: ['intruder'], occupancyCount: 1 }
        : z
    );
  }

  if (Math.random() < 0.002) {
    const person = people[Math.floor(Math.random() * people.length)];
    const zone = zoneStates[Math.floor(Math.random() * zoneStates.length)];
    const types = [
      {
        type: 'occupancy_change' as EventType,
        severity: 'info' as const,
        message: `Occupancy change in ${zone.name}`,
        personIds: person ? [person.personId] : [],
      },
      {
        type: 'activity_change' as EventType,
        severity: 'info' as const,
        message: `${person?.label || 'Person'} transitioned to Sitting activity`,
        personIds: person ? [person.personId] : [],
      },
      {
        type: 'anomaly' as EventType,
        severity: 'warning' as const,
        message: 'Irregular breathing pattern detected',
        personIds: person ? [person.personId] : [],
      },
    ];
    const t = types[Math.floor(Math.random() * types.length)];
    events.unshift(createEvent(t.type, t.severity, t.message, zone.name, 0.85 + Math.random() * 0.12, t.personIds));
  }

  events = events.filter((e) => !e.dismissed).slice(0, 100);

  const personRooms: Record<string, PersonID[]> = {};
  getAllPeopleStates().forEach((p) => {
    const roomSlug = p.room.replace('_', '-');
    if (!personRooms[roomSlug]) personRooms[roomSlug] = [];
    personRooms[roomSlug].push(p.personId);
  });

  zoneStates = zoneStates.map((z) => {
    const slug = z.slug || String(z.id);
    const occupants = personRooms[slug] || [];
    const motionIntensity = Math.max(
      0,
      Math.min(100, z.motionIntensity + (Math.random() - 0.5) * 12)
    );
    let status = z.status;
    if (occupants.includes('intruder')) status = 'alert';
    else if (occupants.length > 0) status = 'occupied';
    else if (motionIntensity < 8) status = 'clear';

    return {
      ...z,
      personIds: occupants,
      occupancyCount: occupants.filter((id) => id !== 'intruder').length,
      motionIntensity: Math.round(motionIntensity),
      status,
      lastActivity: occupants.length > 0 || motionIntensity > 20 ? Date.now() : z.lastActivity,
    };
  });
}

export function getEvents(
  filter = 'all',
  zone = 'all',
  timeRangeMs = 86400000,
  search = '',
  personFilter = 'all'
): AppEvent[] {
  tickEvents();
  const now = Date.now();
  return events.filter((event) => {
    if (filter !== 'all' && event.severity !== filter) return false;
    if (zone !== 'all') {
      const slug = event.location.toLowerCase().replace(/\s+/g, '-');
      if (slug !== zone && event.zone !== zone) return false;
    }
    if (personFilter !== 'all' && !event.personIds.includes(personFilter)) return false;
    if (now - event.timestamp > timeRangeMs) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !event.message.toLowerCase().includes(q) &&
        !event.location.toLowerCase().includes(q) &&
        !event.personIds.some((id) => id.includes(q))
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

export function generateTrendData(points = 60, personId?: string) {
  const now = Date.now();
  const offset = personId === 'person-2' ? 2 : personId === 'person-3' ? -1 : 0;
  return Array.from({ length: points }, (_, i) => {
    const t = i / points;
    return {
      time: `${i}m`,
      breathing: 16 + offset + Math.sin(t * Math.PI * 4) * 2 + Math.random(),
      heartRate: 72 + offset * 3 + Math.sin(t * Math.PI * 6) * 8 + Math.random() * 3,
      timestamp: now - (points - i) * 60000,
      personId,
    };
  });
}

export function generatePersonTrendData(personId: string, points = 60) {
  return generateTrendData(points, personId);
}

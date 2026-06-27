import type { ActivityType, RoomType, Zone } from './types';

export const COLORS = {
  dark: '#0f172a',
  darker: '#1e293b',
  accentBlue: '#60a5fa',
  accentPurple: '#a78bfa',
  accentGreen: '#34d399',
  accentRed: '#ef4444',
  accentOrange: '#fb923c',
  trailCyan: '#06b6d4',
  trailGreen: '#6ee7b7',
  trailOrange: '#fdba74',
} as const;

export const PERSON_COLORS: Record<string, string> = {
  'person-1': '#5a6b7a',
  intruder: '#c7636d',
};

export const PERSON_LABELS: Record<string, string> = {
  'person-1': 'Person 1',
  intruder: 'Intruder',
};

export const TRAIL_COLORS: Record<string, number> = {
  'person-1': 0x06b6d4,
  intruder: 0xef4444,
};

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  standing: COLORS.accentBlue,
  walking: COLORS.accentGreen,
  sitting: COLORS.accentPurple,
  lying: COLORS.accentRed,
  falling: COLORS.accentOrange,
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  standing: 'Standing',
  walking: 'Walking',
  sitting: 'Sitting',
  lying: 'Lying Down',
  falling: 'Falling',
};

export const ROOM_LABELS: Record<RoomType, string> = {
  living_room: 'Living Room',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen',
  entry: 'Entry',
  hallway: 'Hallway',
  bathroom: 'Bathroom',
};

export const ZONES: Zone[] = [
  { id: 'living-room', name: 'Living Room', status: 'occupied', lastActivity: Date.now(), motionIntensity: 45, slug: 'living-room', personIds: ['person-1'], occupancyCount: 1 },
  { id: 'bedroom', name: 'Bedroom', status: 'clear', lastActivity: Date.now() - 3600000, motionIntensity: 5, slug: 'bedroom', personIds: [], occupancyCount: 0 },
  { id: 'kitchen', name: 'Kitchen', status: 'clear', lastActivity: Date.now() - 120000, motionIntensity: 62, slug: 'kitchen', personIds: [], occupancyCount: 0 },
  { id: 'hallway', name: 'Hallway', status: 'clear', lastActivity: Date.now() - 7200000, motionIntensity: 12, slug: 'hallway', personIds: [], occupancyCount: 0 },
  { id: 'bathroom', name: 'Bathroom', status: 'clear', lastActivity: Date.now() - 1800000, motionIntensity: 8, slug: 'bathroom', personIds: [], occupancyCount: 0 },
  { id: 'entry', name: 'Entry', status: 'clear', lastActivity: Date.now() - 5400000, motionIntensity: 3, slug: 'entry', personIds: [], occupancyCount: 0 },
];

export const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'vitals', label: 'Vitals' },
  { id: 'pose', label: 'Pose Detection' },
  { id: 'fall', label: 'Fall Detection' },
] as const;

export type TabId = (typeof TABS)[number]['id'];

export const NORMAL_BREATHING = { min: 12, max: 20 };
export const NORMAL_HEART_RATE = { min: 60, max: 100 };

export const ROOM_SIZE = { width: 10, depth: 8, height: 2.5 };

export const ANALYTICS_PERSONS = ['all', 'person-1'] as const;

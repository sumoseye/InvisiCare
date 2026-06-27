import { create } from 'zustand';

export interface FallEvent {
  id: string;
  timestamp: number;
  location: string;
  severity: 'minor' | 'major';
  durationOnFloor: number; // in seconds
  resolved: boolean;
}

export interface FallSettings {
  sensitivity: 'low' | 'medium' | 'high';
  zones: string[];
  notificationsEnabled: boolean;
}

export interface FallState {
  fallDetected: boolean;
  lastFallTimestamp: number | null;
  fallsToday: number;
  fallsThisWeek: number;
  eventLog: FallEvent[];
  settings: FallSettings;
  setFallDetected: (detected: boolean) => void;
  addFallEvent: (event: Omit<FallEvent, 'id'>) => void;
  resolveFallEvent: (id: string) => void;
  updateSettings: (settings: Partial<FallSettings>) => void;
  resetFall: () => void;
}

export const useFallStore = create<FallState>((set) => ({
  fallDetected: false,
  lastFallTimestamp: null,
  fallsToday: 0,
  fallsThisWeek: 0,
  eventLog: [
    // Mock initial data
    {
      id: 'mock-1',
      timestamp: Date.now() - 3600000 * 2,
      location: 'Living Room',
      severity: 'minor',
      durationOnFloor: 12,
      resolved: true,
    }
  ],
  settings: {
    sensitivity: 'medium',
    zones: ['Living Room', 'Bedroom', 'Kitchen'],
    notificationsEnabled: true,
  },

  setFallDetected: (detected) => set({ fallDetected: detected }),
  
  addFallEvent: (event) => set((state) => {
    const newEvent = { ...event, id: Math.random().toString(36).substring(7) };
    return {
      eventLog: [newEvent, ...state.eventLog].slice(0, 50),
      lastFallTimestamp: event.timestamp,
      fallsToday: state.fallsToday + 1,
      fallsThisWeek: state.fallsThisWeek + 1,
    };
  }),

  resolveFallEvent: (id) => set((state) => ({
    eventLog: state.eventLog.map(e => e.id === id ? { ...e, resolved: true } : e)
  })),

  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings }
  })),

  resetFall: () => set({
    fallDetected: false,
    lastFallTimestamp: null,
    fallsToday: 0,
    fallsThisWeek: 0,
    eventLog: [],
  }),
}));

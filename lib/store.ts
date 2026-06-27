'use client';

import { create } from 'zustand';
import type {
  ActivityType,
  Alert,
  AppEvent,
  EventFilter,
  OccupancyHour,
  PathPoint,
  PersonID,
  PersonMetrics,
  PersonSkeleton,
  PersonVitals,
  RoomType,
  TimeRange,
  VitalHistoryPoint,
  VitalsResponse,
  ActivityDistribution,
} from './types';

// ============ VITALS STORE ============
interface VitalsStore {
  people: Record<PersonID, PersonVitals>;
  breathing: number;
  heartRate: number;
  personCount: number;
  activity: ActivityType;
  presenceConfidence: number;
  signalStrength: number;
  zones: string[];
  breathingHistory: { time: string; value: number }[];
  heartRateHistory: { time: string; value: number }[];
  activityDuration: number;
  setVitalsResponse: (data: VitalsResponse) => void;
  updatePerson: (id: PersonID, vitals: Partial<PersonVitals>) => void;
  getPersonCount: () => number;
  getPeopleList: () => PersonVitals[];
  resetVitals: () => void;
}

export const useVitalsStore = create<VitalsStore>((set, get) => ({
  people: {},
  breathing: 16,
  heartRate: 72,
  personCount: 1,
  activity: 'standing',
  presenceConfidence: 0.95,
  signalStrength: -45,
  zones: ['Living Room'],
  breathingHistory: [],
  heartRateHistory: [],
  activityDuration: 0,

  setVitalsResponse: (data) => {
    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const peopleMap: Record<PersonID, PersonVitals> = {};
    data.people.forEach((p) => {
      peopleMap[p.personId] = p;
    });

    const state = get();
    const activityChanged = state.activity !== data.activity;

    set({
      people: peopleMap,
      breathing: data.breathing_rate,
      heartRate: data.heart_rate,
      personCount: data.person_count,
      activity: data.activity,
      presenceConfidence: data.presence_confidence,
      signalStrength: data.signal_strength,
      zones: data.zones || state.zones,
      activityDuration: activityChanged ? 0 : state.activityDuration + 1,
      breathingHistory: [
        ...state.breathingHistory,
        { time: now, value: data.breathing_rate },
      ].slice(-60),
      heartRateHistory: [
        ...state.heartRateHistory,
        { time: now, value: data.heart_rate },
      ].slice(-60),
    });
  },

  updatePerson: (id, vitals) =>
    set((state) => ({
      people: {
        ...state.people,
        [id]: { ...state.people[id], ...vitals } as PersonVitals,
      },
    })),

  getPersonCount: () =>
    Object.values(get().people).filter((p) => !p.isIntruder).length,

  getPeopleList: () =>
    Object.values(get().people).filter((p) => !p.isIntruder),

  resetVitals: () =>
    set({
      people: {},
      breathing: 0,
      heartRate: 0,
      personCount: 0,
      activity: 'standing',
      presenceConfidence: 0,
      signalStrength: 0,
      breathingHistory: [],
      heartRateHistory: [],
      activityDuration: 0,
    }),
}));

// ============ SKELETON STORE ============
interface SkeletonStore {
  people: Record<PersonID, PersonSkeleton>;
  setSkeletonResponse: (people: PersonSkeleton[]) => void;
  getActivePeople: () => PersonSkeleton[];
  resetSkeleton: () => void;
}

export const useSkeletonStore = create<SkeletonStore>((set, get) => ({
  people: {},

  setSkeletonResponse: (people) => {
    const map: Record<PersonID, PersonSkeleton> = {};
    people.forEach((p) => {
      map[p.personId] = p;
    });
    set({ people: map });
  },

  getActivePeople: () => Object.values(get().people),

  resetSkeleton: () => set({ people: {} }),
}));

// ============ ROOM STORE ============
interface RoomStore {
  currentRoom: RoomType;
  setCurrentRoom: (room: RoomType) => void;
  selectedRoom: string;
  setSelectedRoom: (room: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  currentRoom: 'living_room',
  setCurrentRoom: (room) => set({ currentRoom: room }),
  selectedRoom: '1',
  setSelectedRoom: (room) => set({ selectedRoom: room }),
}));

// ============ MOVEMENT STORE ============
interface MovementStore {
  pathTrails: Record<PersonID, PathPoint[]>;
  addPathPoint: (personId: PersonID, point: Omit<PathPoint, 'timestamp'>) => void;
  clearTrails: (personId?: PersonID) => void;
}

const TRAIL_MAX = 500;
const TRAIL_AGE_MS = 10000;

export const useMovementStore = create<MovementStore>((set) => ({
  pathTrails: {},

  addPathPoint: (personId, point) =>
    set((state) => {
      const now = Date.now();
      const existing = state.pathTrails[personId] || [];
      const filtered = existing.filter((p) => now - p.timestamp < TRAIL_AGE_MS);
      const next = [...filtered, { ...point, timestamp: now }].slice(-TRAIL_MAX);
      return { pathTrails: { ...state.pathTrails, [personId]: next } };
    }),

  clearTrails: (personId) => {
    if (personId) {
      set((state) => {
        const copy = { ...state.pathTrails };
        delete copy[personId];
        return { pathTrails: copy };
      });
    } else {
      set({ pathTrails: {} });
    }
  },
}));

// ============ EVENT STORE ============
interface EventStore {
  events: AppEvent[];
  filter: EventFilter;
  searchQuery: string;
  timeRange: TimeRange;
  zoneFilter: string;
  personFilter: string;
  emailAlerts: boolean;
  soundAlerts: boolean;
  webhookUrl: string;
  dismissedPending: AppEvent[];
  setEvents: (events: AppEvent[]) => void;
  addEvent: (event: AppEvent) => void;
  acknowledgeEvent: (id: string) => void;
  dismissEvent: (id: string) => void;
  undoDismiss: (id: string) => void;
  deleteEvent: (id: string) => void;
  setFilter: (filter: EventFilter) => void;
  setSearchQuery: (query: string) => void;
  setTimeRange: (range: TimeRange) => void;
  setZoneFilter: (zone: string) => void;
  setPersonFilter: (person: string) => void;
  setEmailAlerts: (enabled: boolean) => void;
  setSoundAlerts: (enabled: boolean) => void;
  setWebhookUrl: (url: string) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  filter: 'all',
  searchQuery: '',
  timeRange: '24h',
  zoneFilter: 'all',
  personFilter: 'all',
  emailAlerts: false,
  soundAlerts: false,
  webhookUrl: '',
  dismissedPending: [],

  setEvents: (events) => set({ events }),

  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events].slice(0, 200) })),

  acknowledgeEvent: (id) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, acknowledged: true, status: 'acknowledged' } : e
      ),
    })),

  dismissEvent: (id) =>
    set((state) => {
      const event = state.events.find((e) => e.id === id);
      return {
        events: state.events.filter((e) => e.id !== id),
        dismissedPending: event
          ? [...state.dismissedPending, event]
          : state.dismissedPending,
      };
    }),

  undoDismiss: (id) =>
    set((state) => {
      const event = state.dismissedPending.find((e) => e.id === id);
      return {
        dismissedPending: state.dismissedPending.filter((e) => e.id !== id),
        events: event ? [event, ...state.events] : state.events,
      };
    }),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
      dismissedPending: state.dismissedPending.filter((e) => e.id !== id),
    })),

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTimeRange: (range) => set({ timeRange: range }),
  setZoneFilter: (zone) => set({ zoneFilter: zone }),
  setPersonFilter: (person) => set({ personFilter: person }),
  setEmailAlerts: (enabled) => set({ emailAlerts: enabled }),
  setSoundAlerts: (enabled) => set({ soundAlerts: enabled }),
  setWebhookUrl: (url) => set({ webhookUrl: url }),
}));

// ============ ALERT STORE ============
interface AlertStore {
  alert: Alert | null;
  setAlert: (alert: Alert | null) => void;
  clearAlert: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alert: null,
  setAlert: (alert) => set({ alert }),
  clearAlert: () => set({ alert: null }),
}));

// ============ ANALYTICS STORE ============
interface AnalyticsStore {
  historicalVitals: VitalHistoryPoint[];
  personMetrics: Record<PersonID, PersonMetrics>;
  occupancyData: OccupancyHour[];
  activityDistribution: ActivityDistribution;
  fallRisk: number;
  selectedPerson: string;
  updateHistoricalVitals: (point: VitalHistoryPoint) => void;
  updatePersonMetrics: (personId: PersonID, point: VitalHistoryPoint) => void;
  setOccupancyData: (data: OccupancyHour[]) => void;
  setActivityDistribution: (data: ActivityDistribution) => void;
  setFallRisk: (risk: number) => void;
  setSelectedPerson: (person: string) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  historicalVitals: [],
  personMetrics: {},
  occupancyData: [],
  activityDistribution: { standing: 30, sitting: 40, walking: 20, lying: 10 },
  fallRisk: 22,
  selectedPerson: 'all',

  updateHistoricalVitals: (point) =>
    set((state) => ({
      historicalVitals: [...state.historicalVitals, point].slice(-120),
    })),

  updatePersonMetrics: (personId, point) =>
    set((state) => {
      const existing = state.personMetrics[personId] || {
        historicalVitals: [],
        activityDistribution: { standing: 30, sitting: 40, walking: 20, lying: 10 },
        fallRisk: 22,
      };
      return {
        personMetrics: {
          ...state.personMetrics,
          [personId]: {
            ...existing,
            historicalVitals: [...existing.historicalVitals, point].slice(-120),
          },
        },
      };
    }),

  setOccupancyData: (data) => set({ occupancyData: data }),
  setActivityDistribution: (data) => set({ activityDistribution: data }),
  setFallRisk: (risk) => set({ fallRisk: risk }),
  setSelectedPerson: (person) => set({ selectedPerson: person }),
}));

// ============ WAVEFORM STORE ============
interface WaveformStore {
  waveform: number[];
  setWaveform: (waveform: number[]) => void;
  resetWaveform: () => void;
}

export const useWaveformStore = create<WaveformStore>((set) => ({
  waveform: Array(50).fill(100),
  setWaveform: (waveform) => set({ waveform }),
  resetWaveform: () => set({ waveform: Array(50).fill(100) }),
}));

// ============ APP STORE ============
interface AppStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
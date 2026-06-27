import { create } from 'zustand';
import type {
  ActivityType,
  Alert,
  AppEvent,
  EventFilter,
  Keypoints,
  OccupancyHour,
  Sensitivity,
  TimeRange,
  VitalHistoryPoint,
  VitalsResponse,
  Zone,
  ActivityDistribution,
} from './types';
import { ZONES } from './constants';

interface VitalsStore {
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
  setVitals: (vitals: VitalsResponse) => void;
}

export const useVitalsStore = create<VitalsStore>((set, get) => ({
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
  setVitals: (vitals) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const state = get();
    const activityChanged = state.activity !== vitals.activity;
    set({
      breathing: vitals.breathing_rate,
      heartRate: vitals.heart_rate,
      personCount: vitals.person_count,
      activity: vitals.activity,
      presenceConfidence: vitals.presence_confidence,
      signalStrength: vitals.signal_strength,
      zones: vitals.zones || state.zones,
      activityDuration: activityChanged ? 0 : state.activityDuration + 1,
      breathingHistory: [...state.breathingHistory, { time: now, value: vitals.breathing_rate }].slice(-60),
      heartRateHistory: [...state.heartRateHistory, { time: now, value: vitals.heart_rate }].slice(-60),
    });
  },
}));

interface SkeletonStore {
  keypoints: Keypoints | null;
  activity: ActivityType;
  confidence: number;
  velocity: number;
  setSkeleton: (data: { keypoints: Keypoints; activity: ActivityType; confidence: number; velocity?: number }) => void;
}

export const useSkeletonStore = create<SkeletonStore>((set) => ({
  keypoints: null,
  activity: 'standing',
  confidence: 0.92,
  velocity: 0,
  setSkeleton: (data) => set(data),
}));

interface IntrusionStore {
  armed: boolean;
  sensitivity: Sensitivity;
  zones: Zone[];
  lastIntrusion: number | null;
  setArmed: (armed: boolean) => void;
  setSensitivity: (sensitivity: Sensitivity) => void;
  setZones: (zones: Zone[]) => void;
  updateZone: (index: number, zone: Zone) => void;
  setLastIntrusion: (timestamp: number | null) => void;
}

export const useIntrusionStore = create<IntrusionStore>((set) => ({
  armed: false,
  sensitivity: 'medium',
  zones: ZONES,
  lastIntrusion: null,
  setArmed: (armed) => set({ armed }),
  setSensitivity: (sensitivity) => set({ sensitivity }),
  setZones: (zones) => set({ zones }),
  updateZone: (index, zone) =>
    set((state) => ({
      zones: state.zones.map((z, i) => (i === index ? zone : z)),
    })),
  setLastIntrusion: (timestamp) => set({ lastIntrusion: timestamp }),
}));

interface EventStore {
  events: AppEvent[];
  filter: EventFilter;
  searchQuery: string;
  timeRange: TimeRange;
  zoneFilter: string;
  emailAlerts: boolean;
  webhookUrl: string;
  addEvent: (event: AppEvent) => void;
  setEvents: (events: AppEvent[]) => void;
  dismissEvent: (id: string) => void;
  setFilter: (filter: EventFilter) => void;
  setSearchQuery: (query: string) => void;
  setTimeRange: (range: TimeRange) => void;
  setZoneFilter: (zone: string) => void;
  setEmailAlerts: (enabled: boolean) => void;
  setWebhookUrl: (url: string) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  filter: 'all',
  searchQuery: '',
  timeRange: '24h',
  zoneFilter: 'all',
  emailAlerts: false,
  webhookUrl: '',
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 200),
    })),
  setEvents: (events) => set({ events }),
  dismissEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTimeRange: (range) => set({ timeRange: range }),
  setZoneFilter: (zone) => set({ zoneFilter: zone }),
  setEmailAlerts: (enabled) => set({ emailAlerts: enabled }),
  setWebhookUrl: (url) => set({ webhookUrl: url }),
}));

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

interface AnalyticsStore {
  historicalVitals: VitalHistoryPoint[];
  occupancyData: OccupancyHour[];
  activityDistribution: ActivityDistribution;
  fallRisk: number;
  updateHistoricalVitals: (point: VitalHistoryPoint) => void;
  setOccupancyData: (data: OccupancyHour[]) => void;
  setActivityDistribution: (data: ActivityDistribution) => void;
  setFallRisk: (risk: number) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  historicalVitals: [],
  occupancyData: [],
  activityDistribution: { standing: 30, sitting: 40, walking: 20, lying: 10 },
  fallRisk: 22,
  updateHistoricalVitals: (point) =>
    set((state) => ({
      historicalVitals: [...state.historicalVitals, point].slice(-120),
    })),
  setOccupancyData: (data) => set({ occupancyData: data }),
  setActivityDistribution: (data) => set({ activityDistribution: data }),
  setFallRisk: (risk) => set({ fallRisk: risk }),
}));

interface WaveformStore {
  waveform: number[];
  setWaveform: (waveform: number[]) => void;
}

export const useWaveformStore = create<WaveformStore>((set) => ({
  waveform: Array(50).fill(100),
  setWaveform: (waveform) => set({ waveform }),
}));

interface AppStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

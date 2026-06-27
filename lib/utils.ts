import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AppEvent, Severity, VitalHistoryPoint } from './types';
import { NORMAL_BREATHING, NORMAL_HEART_RATE } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randomNoise(scale = 1): number {
  return (Math.random() - 0.5) * scale;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.85) return 'text-accent-green';
  if (confidence >= 0.75) return 'text-yellow-400';
  return 'text-accent-red';
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'text-accent-red border-accent-red/30 bg-accent-red/10';
    case 'warning':
      return 'text-accent-orange border-accent-orange/30 bg-accent-orange/10';
    default:
      return 'text-accent-blue border-accent-blue/30 bg-accent-blue/10';
  }
}

export function getSeverityIcon(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return '🚨';
    case 'warning':
      return '⚠️';
    default:
      return 'ℹ️';
  }
}

export function calcStats(values: number[]) {
  if (values.length === 0) return { min: 0, max: 0, avg: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return { min: Math.round(min * 10) / 10, max: Math.round(max * 10) / 10, avg: Math.round(avg * 10) / 10 };
}

export function calcFallRisk(
  activity: string,
  heartRate: number,
  recentFalls: number,
  stability: number
): number {
  let risk = 0;
  if (activity === 'lying' || activity === 'falling') risk += 30;
  if (activity === 'walking') risk += 15;
  if (heartRate > 90) risk += 20;
  if (heartRate < 55) risk += 15;
  risk += recentFalls * 25;
  risk += (100 - stability) * 0.3;
  return clamp(Math.round(risk), 0, 100);
}

export function filterEvents(
  events: AppEvent[],
  filter: string,
  searchQuery: string,
  zone: string,
  timeRangeMs: number
): AppEvent[] {
  const now = Date.now();
  return events.filter((event) => {
    if (filter !== 'all' && event.severity !== filter) return false;
    if (zone !== 'all' && event.location.toLowerCase().replace(/\s+/g, '-') !== zone && event.location !== zone) {
      const zoneName = zone.replace(/-/g, ' ');
      if (event.location.toLowerCase() !== zoneName.toLowerCase()) return false;
    }
    if (now - event.timestamp > timeRangeMs) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        event.message.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.type.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

export function exportEventsCSV(events: AppEvent[]): string {
  const header = 'Timestamp,Severity,Description,Location,Confidence';
  const rows = events.map(
    (e) =>
      `"${formatDateTime(e.timestamp)}","${e.severity}","${e.message}","${e.location}",${(e.confidence * 100).toFixed(1)}%`
  );
  return [header, ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function isBreathingNormal(rate: number): boolean {
  return rate >= NORMAL_BREATHING.min && rate <= NORMAL_BREATHING.max;
}

export function isHeartRateNormal(rate: number): boolean {
  return rate >= NORMAL_HEART_RATE.min && rate <= NORMAL_HEART_RATE.max;
}

export function findAnomalies(history: VitalHistoryPoint[]) {
  return history.filter(
    (p) => !isBreathingNormal(p.breathing) || !isHeartRateNormal(p.heartRate)
  );
}

export function timeRangeToMs(range: string): number {
  switch (range) {
    case '1h':
      return 3600000;
    case '24h':
      return 86400000;
    case '7d':
      return 604800000;
    default:
      return 86400000;
  }
}

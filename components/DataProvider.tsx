'use client';

import { useEffect } from 'react';
import {
  useAlertStore,
  useAnalyticsStore,
  useEventStore,
  useIntrusionStore,
  useSkeletonStore,
  useVitalsStore,
  useWaveformStore,
} from '@/lib/store';
import { calcFallRisk } from '@/lib/utils';
import { generateOccupancyData, generateTrendData } from '@/lib/simulators/events';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const setVitals = useVitalsStore((s) => s.setVitals);
  const setSkeleton = useSkeletonStore((s) => s.setSkeleton);
  const setWaveform = useWaveformStore((s) => s.setWaveform);
  const setEvents = useEventStore((s) => s.setEvents);
  const setAlert = useAlertStore((s) => s.setAlert);
  const { armed, sensitivity, setZones, setLastIntrusion } = useIntrusionStore();
  const { updateHistoricalVitals, setOccupancyData, setFallRisk } = useAnalyticsStore();

  useEffect(() => {
    setOccupancyData(generateOccupancyData());
    generateTrendData(60).forEach((point) => updateHistoricalVitals(point));
  }, [setOccupancyData, updateHistoricalVitals]);

  useEffect(() => {
    const fetchVitals = async () => {
      const res = await fetch('/api/vitals');
      const data = await res.json();
      setVitals(data);

      updateHistoricalVitals({
        time: `${new Date().getMinutes()}m`,
        breathing: data.breathing_rate,
        heartRate: data.heart_rate,
        timestamp: data.timestamp,
      });

      setFallRisk(
        calcFallRisk(data.activity, data.heart_rate, 0, data.presence_confidence * 100)
      );

      if (data.fall_detected) {
        setAlert({
          id: crypto.randomUUID(),
          type: 'fall',
          severity: 'critical',
          message: 'Fall detected',
          location: data.zones?.[0] || 'Living Room',
          confidence: data.presence_confidence,
          timestamp: data.timestamp,
        });
      }
    };

    fetchVitals();
    const id = setInterval(fetchVitals, 1000);
    return () => clearInterval(id);
  }, [setVitals, updateHistoricalVitals, setFallRisk, setAlert]);

  useEffect(() => {
    const fetchSkeleton = async () => {
      const res = await fetch('/api/skeleton');
      const data = await res.json();
      setSkeleton(data);
    };
    fetchSkeleton();
    const id = setInterval(fetchSkeleton, 100);
    return () => clearInterval(id);
  }, [setSkeleton]);

  useEffect(() => {
    const fetchWaveform = async () => {
      const res = await fetch('/api/waveform');
      const data = await res.json();
      setWaveform(data.waveform);
    };
    fetchWaveform();
    const id = setInterval(fetchWaveform, 500);
    return () => clearInterval(id);
  }, [setWaveform]);

  useEffect(() => {
    const fetchEvents = async () => {
      const params = new URLSearchParams({
        filter: 'all',
        armed: String(armed),
        sensitivity,
      });
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events);

      const critical = data.events.find(
        (e: { severity: string; type: string }) =>
          e.severity === 'critical' && e.type === 'intrusion'
      );
      if (critical && armed) {
        setLastIntrusion(critical.timestamp);
        setAlert({
          id: critical.id,
          type: 'intrusion',
          severity: 'critical',
          message: critical.message,
          location: critical.location,
          confidence: critical.confidence,
          timestamp: critical.timestamp,
        });
      }
    };
    fetchEvents();
    const id = setInterval(fetchEvents, 2000);
    return () => clearInterval(id);
  }, [armed, sensitivity, setEvents, setAlert, setLastIntrusion]);

  useEffect(() => {
    const fetchZones = async () => {
      const params = new URLSearchParams({
        armed: String(armed),
        sensitivity,
      });
      const res = await fetch(`/api/zones?${params}`);
      const data = await res.json();
      setZones(data.zones);
    };
    fetchZones();
    const id = setInterval(fetchZones, 1000);
    return () => clearInterval(id);
  }, [armed, sensitivity, setZones]);

  return <>{children}</>;
}

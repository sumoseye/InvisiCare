'use client';

import { useEffect } from 'react';
import {
  useAlertStore,
  useAnalyticsStore,
  useEventStore,
  useIntrusionStore,
  useMovementStore,
  useSkeletonStore,
  useVitalsStore,
  useWaveformStore,
} from '@/lib/store';
import { calcFallRisk } from '@/lib/utils';
import { generateOccupancyData, generatePersonTrendData } from '@/lib/simulators/events';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const setVitalsResponse = useVitalsStore((s) => s.setVitalsResponse);
  const setSkeletonResponse = useSkeletonStore((s) => s.setSkeletonResponse);
  const setWaveform = useWaveformStore((s) => s.setWaveform);
  const setEvents = useEventStore((s) => s.setEvents);
  const setAlert = useAlertStore((s) => s.setAlert);
  const addPathPoint = useMovementStore((s) => s.addPathPoint);
  const { armed, sensitivity, setZones, setLastIntrusion, setIntruders } = useIntrusionStore();
  const { updateHistoricalVitals, updatePersonMetrics, setOccupancyData, setFallRisk } =
    useAnalyticsStore();

  useEffect(() => {
    setOccupancyData(generateOccupancyData());
    ['person-1', 'person-2'].forEach((id) => {
      generatePersonTrendData(id, 60).forEach((point) => updatePersonMetrics(id, point));
    });
    generatePersonTrendData('person-1', 60).forEach((point) => updateHistoricalVitals(point));
  }, [setOccupancyData, updateHistoricalVitals, updatePersonMetrics]);

  useEffect(() => {
    const fetchVitals = async () => {
      const res = await fetch('/api/vitals');
      const data = await res.json();
      setVitalsResponse(data);

      data.people?.forEach((p: { personId: string; breathing: number; heartRate: number; position?: { x: number; y: number; z: number } }) => {
        updatePersonMetrics(p.personId, {
          time: `${new Date().getMinutes()}m`,
          breathing: p.breathing,
          heartRate: p.heartRate,
          timestamp: data.timestamp,
          personId: p.personId,
        });
        if (p.position) {
          addPathPoint(p.personId, { x: p.position.x, y: p.position.y, z: p.position.z });
        }
      });

      const primary = data.people?.find((p: { isIntruder?: boolean }) => !p.isIntruder);
      updateHistoricalVitals({
        time: `${new Date().getMinutes()}m`,
        breathing: data.breathing_rate,
        heartRate: data.heart_rate,
        timestamp: data.timestamp,
      });

      if (primary) {
        setFallRisk(
          calcFallRisk(primary.activity, primary.heartRate, 0, primary.confidence * 100)
        );
      }

      const intruders = data.people?.filter((p: { isIntruder?: boolean }) => p.isIntruder).map((p: { personId: string }) => p.personId) || [];
      setIntruders(intruders);

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
  }, [setVitalsResponse, updateHistoricalVitals, updatePersonMetrics, setFallRisk, setAlert, addPathPoint, setIntruders]);

  useEffect(() => {
    const fetchSkeleton = async () => {
      const res = await fetch('/api/skeleton');
      const data = await res.json();
      setSkeletonResponse(data.people || []);
    };
    fetchSkeleton();
    const id = setInterval(fetchSkeleton, 100);
    return () => clearInterval(id);
  }, [setSkeletonResponse]);

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
        (e: { severity: string; type: string; acknowledged?: boolean }) =>
          e.severity === 'critical' && e.type === 'intrusion' && !e.acknowledged
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
      const params = new URLSearchParams({ armed: String(armed), sensitivity });
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

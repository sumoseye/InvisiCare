'use client';

import { useEffect } from 'react';
import {
  useAlertStore,
  useAnalyticsStore,
  useEventStore,
  useMovementStore,
  useSkeletonStore,
  useVitalsStore,
  useWaveformStore,
  useRoomStore,
} from '@/lib/store';
import { usePoseStore } from '@/lib/usePoseStore';
import { useFallStore } from '@/lib/useFallStore';
import { calcFallRisk } from '@/lib/utils';
import { generateOccupancyData, generatePersonTrendData } from '@/lib/simulators/events';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const setVitalsResponse = useVitalsStore((s) => s.setVitalsResponse);
  const setSkeletonResponse = useSkeletonStore((s) => s.setSkeletonResponse);
  const setWaveform = useWaveformStore((s) => s.setWaveform);
  const setEvents = useEventStore((s) => s.setEvents);
  const setAlert = useAlertStore((s) => s.setAlert);
  const addPathPoint = useMovementStore((s) => s.addPathPoint);
  const { updateHistoricalVitals, updatePersonMetrics, setOccupancyData, setFallRisk } =
    useAnalyticsStore();
  const selectedRoom = useRoomStore((s) => s.selectedRoom);
  const resetPose = usePoseStore((s) => s.resetPose);
  const resetFall = useFallStore((s) => s.resetFall);
  const resetVitals = useVitalsStore((s) => s.resetVitals);
  const resetSkeleton = useSkeletonStore((s) => s.resetSkeleton);
  const resetWaveform = useWaveformStore((s) => s.resetWaveform);

  useEffect(() => {
    resetVitals();
    resetSkeleton();
    resetWaveform();
    resetPose();
    resetFall();
  }, [selectedRoom, resetVitals, resetSkeleton, resetWaveform, resetPose, resetFall]);

  useEffect(() => {
    setOccupancyData(generateOccupancyData());
    ['person-1'].forEach((id) => {
      generatePersonTrendData(id, 60).forEach((point) => updatePersonMetrics(id, point));
    });
    generatePersonTrendData('person-1', 60).forEach((point) => updateHistoricalVitals(point));
  }, [setOccupancyData, updateHistoricalVitals, updatePersonMetrics]);

  useEffect(() => {
    const fetchVitals = async () => {
      const res = await fetch(`/api/vitals?room=${selectedRoom}`);
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
  }, [selectedRoom, setVitalsResponse, updateHistoricalVitals, updatePersonMetrics, setFallRisk, setAlert, addPathPoint]);

  useEffect(() => {
    const fetchSkeleton = async () => {
      const res = await fetch(`/api/skeleton?room=${selectedRoom}`);
      const data = await res.json();
      setSkeletonResponse(data.people || []);
    };
    fetchSkeleton();
    const id = setInterval(fetchSkeleton, 100);
    return () => clearInterval(id);
  }, [selectedRoom, setSkeletonResponse]);

  useEffect(() => {
    const fetchWaveform = async () => {
      const res = await fetch(`/api/waveform?room=${selectedRoom}`);
      const data = await res.json();
      setWaveform(data.waveform);
    };
    fetchWaveform();
    const id = setInterval(fetchWaveform, 500);
    return () => clearInterval(id);
  }, [selectedRoom, setWaveform]);

  useEffect(() => {
    const fetchEvents = async () => {
      const params = new URLSearchParams({
        filter: 'all',
        room: selectedRoom,
      });
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events);

      const critical = data.events.find(
        (e: { severity: string; type: string; acknowledged?: boolean }) =>
          e.severity === 'critical' && e.type === 'fall' && !e.acknowledged
      );
      if (critical) {
        setAlert({
          id: critical.id,
          type: 'fall',
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
  }, [selectedRoom, setEvents, setAlert]);

  useEffect(() => {
    const fetchZones = async () => {
      // const params = new URLSearchParams({});
      // const res = await fetch(`/api/zones?${params}`);
      // const data = await res.json();
      // setZones(data.zones);
    };
    fetchZones();
    const id = setInterval(fetchZones, 1000);
    return () => clearInterval(id);
  }, []);

  return <>{children}</>;
}

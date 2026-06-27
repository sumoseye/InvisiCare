'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { VitalsPanel } from '@/components/cards/VitalsPanel';
import { useSkeletonStore, useMovementStore } from '@/lib/store';

const RoomRenderer = dynamic(
  () =>
    import('@/components/visualizations/RoomRenderer').then(
      (m) => m.RoomRenderer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-white/10 bg-slate-900/80">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
      </div>
    ),
  }
);

export function PoseTracking() {
  const { setSkeletonResponse } = useSkeletonStore();
  const { addPathPoint } = useMovementStore();
  const people = useSkeletonStore((s) => Object.values(s.people));

  const skeletonIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch skeleton data every 100ms for smooth animation
  useEffect(() => {
    if (skeletonIntervalRef.current) return;

    skeletonIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/skeleton');
        if (!response.ok) throw new Error('Failed to fetch skeleton');
        const data = await response.json();

        setSkeletonResponse(data.people);

        // Add path points for each person
        data.people.forEach(
          (person: { personId: string; position: { x: number; y: number; z: number } }) => {
            if (person.position) {
              addPathPoint(person.personId, person.position);
            }
          }
        );
      } catch (error) {
        console.error('Failed to fetch skeleton:', error);
      }
    }, 100);

    return () => {
      if (skeletonIntervalRef.current) {
        clearInterval(skeletonIntervalRef.current);
        skeletonIntervalRef.current = null;
      }
    };
  }, [setSkeletonResponse, addPathPoint]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <div className="xl:col-span-3">
        <RoomRenderer people={people} showTrails />
      </div>
      <div className="xl:col-span-2">
        <VitalsPanel className="min-h-[400px] xl:min-h-[500px]" />
      </div>
    </div>
  );
}
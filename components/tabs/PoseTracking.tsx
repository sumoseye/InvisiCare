'use client';

import { useEffect, useRef } from 'react';
import { VitalsPanel } from '@/components/cards/VitalsPanel';
import { useSkeletonStore, useMovementStore } from '@/lib/store';
import { RoomRenderer } from '@/components/visualizations/RoomRenderer';

export function PoseTracking() {
  // Get the people list for rendering
  const people = useSkeletonStore((s) => Object.values(s.people));

  // Use ref to track if interval is running
  const skeletonIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch skeleton data every 100ms for smooth animation
  useEffect(() => {
    // Prevent multiple intervals from running
    if (skeletonIntervalRef.current) return;

    skeletonIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/skeleton');
        if (!response.ok) throw new Error('Failed to fetch skeleton');
        const data = await response.json();

        // Update store directly
        useSkeletonStore.setState({
          people: data.people.reduce(
            (acc: Record<string, any>, person: any) => {
              acc[person.personId] = person;
              return acc;
            },
            {}
          ),
        });

        // Add path points for each person
        data.people.forEach(
          (person: { personId: string; position?: { x: number; y: number; z: number } }) => {
            if (person.position) {
              useMovementStore.getState().addPathPoint(person.personId, person.position);
            }
          }
        );
      } catch (error) {
        console.error('Failed to fetch skeleton:', error);
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      if (skeletonIntervalRef.current) {
        clearInterval(skeletonIntervalRef.current);
        skeletonIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency array - runs once on mount only

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* 3D Room Renderer */}
      <div className="xl:col-span-3">
        <RoomRenderer people={people} showTrails />
      </div>

      {/* Vitals Panel */}
      <div className="xl:col-span-2">
        <VitalsPanel className="min-h-[400px] xl:min-h-[500px]" />
      </div>
    </div>
  );
}
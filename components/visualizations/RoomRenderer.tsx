'use client';

import { useEffect, useRef } from 'react';
import type { PersonSkeleton } from '@/lib/types';
import {
  initRoomRenderer,
  resizeRoomRenderer,
  syncHumanoids,
  type HumanoidParts,
  PathTracer,
  THREE,
} from '@/lib/three-utils';
import { useRoomStore } from '@/lib/store';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { getConfidenceColor } from '@/lib/utils';
import { ActivityBadge } from './ActivityBadge';

interface RoomRendererProps {
  people: PersonSkeleton[];
  showTrails?: boolean;
  className?: string;
}

export function RoomRenderer({ people, showTrails = true, className = '' }: RoomRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    pathTracer: PathTracer;
    humanoids: Map<string, HumanoidParts>;
    frameId: number;
  } | null>(null);
  const peopleRef = useRef(people);
  const { focusedPersonId, currentRoom } = useRoomStore();

  peopleRef.current = people;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = initRoomRenderer(container, currentRoom);
    ctxRef.current = { ...ctx, frameId: 0 };

    const animate = () => {
      const c = ctxRef.current;
      if (!c) return;
      c.frameId = requestAnimationFrame(animate);

      syncHumanoids(c.scene, c.humanoids, peopleRef.current, focusedPersonId);

      if (showTrails) {
        peopleRef.current.forEach((p) => {
          c.pathTracer.addPoint(p.personId, p.position.x, p.position.y, p.position.z);
        });
        c.pathTracer.updateMeshes();
      }

      c.renderer.render(c.scene, c.camera);
    };
    animate();

    const onResize = () => {
      if (containerRef.current && ctxRef.current) {
        resizeRoomRenderer(containerRef.current, ctxRef.current.camera, ctxRef.current.renderer);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(ctxRef.current?.frameId || 0);
      ctx.pathTracer.dispose();
      ctx.renderer.dispose();
      if (container.contains(ctx.renderer.domElement)) {
        container.removeChild(ctx.renderer.domElement);
      }
      ctxRef.current = null;
    };
  }, [currentRoom, focusedPersonId, showTrails]);

  const primary = people.find((p) => !p.isIntruder) || people[0];

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="min-h-[400px] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 lg:min-h-[500px]"
      />
      {primary && (
        <>
          <div className="absolute right-3 top-3">
            <ActivityBadge activity={primary.activity} />
          </div>
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <span className={`text-sm font-medium ${getConfidenceColor(primary.confidence)}`}>
              {(primary.confidence * 100).toFixed(1)}% confidence
            </span>
          </div>
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-sm text-slate-300">
              Activity: {ACTIVITY_LABELS[primary.activity]}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

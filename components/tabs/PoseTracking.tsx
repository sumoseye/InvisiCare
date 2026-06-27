'use client';

import { ActivityBadge } from '@/components/visualizations/ActivityBadge';
import { SkeletonRenderer } from '@/components/visualizations/SkeletonRenderer';
import { useSkeletonStore } from '@/lib/store';

export function PoseTracking() {
  const { keypoints, activity, confidence, velocity } = useSkeletonStore();

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute right-4 top-4 z-10">
          <ActivityBadge activity={activity} />
        </div>
        <SkeletonRenderer
          keypoints={keypoints}
          confidence={confidence}
          velocity={velocity}
        />
      </div>

      <div className="mx-auto max-w-[600px]">
        <p className="mb-2 text-sm font-medium text-slate-400">Movement Heatmap</p>
        <div className="relative mx-auto h-[200px] w-[200px] overflow-hidden rounded-full border border-white/10 bg-slate-900/80">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <defs>
              <radialGradient id="heatGrad">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="none" stroke="#334155" strokeWidth="1" />
            {[0, 45, 90, 135].map((angle) => (
              <line
                key={angle}
                x1="100"
                y1="100"
                x2={100 + 90 * Math.cos((angle * Math.PI) / 180)}
                y2={100 + 90 * Math.sin((angle * Math.PI) / 180)}
                stroke="#334155"
                strokeWidth="0.5"
              />
            ))}
            <circle cx="100" cy="100" r="40" fill="url(#heatGrad)" />
            <circle cx={100 + (velocity > 0.3 ? 20 : 5)} cy="100" r="6" fill="#60a5fa" />
          </svg>
        </div>
      </div>
    </div>
  );
}

'use client';

import { SKELETON_CONNECTIONS } from '@/lib/constants';
import type { ActivityType, Keypoints } from '@/lib/types';
import { getConfidenceColor } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonRendererProps {
  keypoints: Keypoints | null;
  activity: ActivityType;
  confidence: number;
  velocity?: number;
}

export function SkeletonRenderer({
  keypoints,
  confidence,
  velocity = 0,
}: Omit<SkeletonRendererProps, 'activity'>) {
  if (!keypoints) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-slate-900/50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
      </div>
    );
  }

  const joints = Object.entries(keypoints);

  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-square max-w-[600px] overflow-hidden rounded-xl border border-white/10 bg-slate-900/80">
        <svg viewBox="0 0 600 600" className="h-full w-full">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.5" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="600" height="600" fill="url(#grid)" />
          <ellipse
            cx="300"
            cy="280"
            rx="80"
            ry="160"
            fill="#60a5fa"
            fillOpacity="0.05"
            stroke="#60a5fa"
            strokeOpacity="0.1"
          />
          {SKELETON_CONNECTIONS.map(([a, b]) => {
            const p1 = keypoints[a];
            const p2 = keypoints[b];
            return (
              <motion.line
                key={`${a}-${b}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#60a5fa"
                strokeWidth={3}
                filter="url(#glow)"
                animate={{ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }}
                transition={{ duration: 0.1, ease: 'easeInOut' }}
              />
            );
          })}
          {joints.map(([name, point]) => (
            <motion.circle
              key={name}
              cx={point.x}
              cy={point.y}
              r={6}
              fill="#60a5fa"
              filter="url(#glow)"
              animate={{ cx: point.x, cy: point.y }}
              transition={{ duration: 0.1, ease: 'easeInOut' }}
            />
          ))}
        </svg>
        <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
            {(confidence * 100).toFixed(1)}% confidence
          </span>
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-sm text-slate-300">
            Quality: {confidence >= 0.9 ? 'Excellent' : confidence >= 0.85 ? 'Good' : 'Fair'}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[600px]">
        <div className="mb-1 flex justify-between text-xs text-slate-400">
          <span>Movement Speed</span>
          <span>{(velocity * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, #34d399, #fbbf24, #ef4444)`,
              width: `${Math.min(100, velocity * 100)}%`,
            }}
            animate={{ width: `${Math.min(100, velocity * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

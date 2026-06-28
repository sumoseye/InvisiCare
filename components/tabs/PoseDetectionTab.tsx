'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton3D } from '../visualizations/Skeleton3D';

interface Keypoint {
  name: string;
  x: number;
  y: number;
  confidence: number;
}

interface PoseHistory {
  label: string;
  timestamp: number;
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

export function PoseDetectionTab() {
  const [keypoints, setKeypoints] = useState<Keypoint[]>([
    { name: 'nose', x: 250, y: 100, confidence: 0.9 },
    { name: 'eyes', x: 250, y: 120, confidence: 0.85 },
    { name: 'ears', x: 250, y: 140, confidence: 0.8 },
    { name: 'shoulders', x: 250, y: 150, confidence: 0.8 },
    { name: 'elbows', x: 200, y: 200, confidence: 0.6 },
    { name: 'wrists', x: 180, y: 250, confidence: 0.3 },
    { name: 'hips', x: 250, y: 250, confidence: 0.9 },
    { name: 'knees', x: 250, y: 350, confidence: 0.8 },
    { name: 'ankles', x: 250, y: 450, confidence: 0.7 },
  ]);

  const [poseLabel, setPoseLabel] = useState('standing');
  const [overallConfidence, setOverallConfidence] = useState(0.85);
  const [history, setHistory] = useState<PoseHistory[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const mockKeypoints = [
        { name: 'nose', x: 250 + Math.random() * 10 - 5, y: 100 + Math.random() * 10 - 5, confidence: 0.9 },
        { name: 'eyes', x: 250 + Math.random() * 8 - 4, y: 120 + Math.random() * 8 - 4, confidence: 0.85 },
        { name: 'ears', x: 250 + Math.random() * 8 - 4, y: 140 + Math.random() * 8 - 4, confidence: 0.8 },
        { name: 'shoulders', x: 250, y: 150, confidence: 0.8 },
        { name: 'elbows', x: 200 + Math.random() * 15 - 7.5, y: 200 + Math.random() * 15 - 7.5, confidence: 0.6 },
        { name: 'wrists', x: 180 + Math.random() * 20 - 10, y: 250 + Math.random() * 20 - 10, confidence: 0.3 },
        { name: 'hips', x: 250, y: 250, confidence: 0.9 },
        { name: 'knees', x: 250 + Math.random() * 10 - 5, y: 350 + Math.random() * 10 - 5, confidence: 0.8 },
        { name: 'ankles', x: 250 + Math.random() * 10 - 5, y: 450 + Math.random() * 10 - 5, confidence: 0.7 },
      ];

      const poses = ['standing', 'sitting', 'walking'];
      const newPose = Math.random() > 0.7 ? poses[Math.floor(Math.random() * poses.length)] : poseLabel;

      if (newPose !== poseLabel) {
        setPoseLabel(newPose);
        setHistory((prev) => [
          { label: newPose, timestamp: Date.now() },
          ...prev.slice(0, 49),
        ]);
      }

      setKeypoints(mockKeypoints);
      setOverallConfidence(0.85 + Math.random() * 0.1);
    }, 200);

    return () => clearInterval(interval);
  }, [poseLabel]);

  const postureStatus = poseLabel === 'sitting' ? 'Slouching' : 'Good Posture';

  return (
    <div className="flex flex-col gap-6 lg:flex-row">

      {/* Left Panel — 3D Canvas */}
      <div className="lg:w-3/5">
        <Card className="flex flex-col" style={{ height: '580px' }}>
          <CardHeader className="shrink-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Live Pose Canvas</CardTitle>
              <span className="flex items-center gap-1.5 rounded-full border border-[#1E2D45] bg-[#0A0F1E] px-3 py-1 text-xs text-[#6B7FA3]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
                Drag to rotate · Scroll to zoom
              </span>
            </div>
          </CardHeader>
          <CardContent
            className="relative flex-1 overflow-hidden rounded-b-xl border-t border-[#1E2D45] bg-[#0A0F1E]"
            style={{ padding: 0 }}
          >
            <Skeleton3D
              keypoints={keypoints}
              pose_label={poseLabel}
              overall_confidence={overallConfidence}
              personCount={1}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col gap-4 lg:w-2/5">

        {/* Current Pose Card */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#6B7FA3]">
                  Current Pose
                </p>
                <h3 className="text-3xl font-bold capitalize text-[#00D4FF]">{poseLabel}</h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  postureStatus === 'Good Posture'
                    ? 'bg-[#00FF9D15] text-[#00FF9D] border border-[#00FF9D30]'
                    : 'bg-[#FFB02015] text-[#FFB020] border border-[#FFB02030]'
                }`}
              >
                {postureStatus}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7FA3]">Overall Confidence</span>
                <span className="font-semibold text-[#F0F4FF]">
                  {(overallConfidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#1E2D45]">
                <div
                  className="h-full rounded-full bg-[#00D4FF] transition-all duration-300"
                  style={{ width: `${overallConfidence * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pose History Card — fixed height with scroll */}
        <Card className="flex flex-col" style={{ height: '380px' }}>
          <CardHeader className="shrink-0 border-b border-[#1E2D45] pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Pose History</CardTitle>
              <span className="text-xs text-[#6B7FA3]">{history.length} entries</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1E2D45 transparent' }}>
            {history.length > 0 ? (
              <ul className="divide-y divide-[#1E2D45]">
                {history.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between px-5 py-3 transition-colors duration-150 hover:bg-[#1E2D45]/40"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            h.label === 'standing' ? '#00FF9D' :
                            h.label === 'sitting' ? '#00D4FF' :
                            h.label === 'walking' ? '#FFB020' :
                            h.label === 'falling' ? '#FF4444' : '#6B7FA3',
                        }}
                      />
                      <span className="capitalize text-sm text-[#F0F4FF]">{h.label}</span>
                    </div>
                    <span className="text-xs text-[#6B7FA3]">{formatTime(h.timestamp)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-[#6B7FA3]">No pose changes detected yet</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
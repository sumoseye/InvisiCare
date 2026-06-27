'use client';

import { useEffect, useRef } from 'react';
import { usePoseStore } from '@/lib/usePoseStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTime } from '@/lib/utils';
import { Keypoint } from '@/lib/usePoseStore';

// Define the connections between keypoints to draw bones
const POSE_CONNECTIONS = [
  ['nose', 'eyes'], // simplified connections
  ['eyes', 'ears'],
  ['nose', 'shoulders'],
  ['shoulders', 'elbows'],
  ['elbows', 'wrists'],
  ['shoulders', 'hips'],
  ['hips', 'knees'],
  ['knees', 'ankles'],
];

function drawKeypoints(ctx: CanvasRenderingContext2D, keypoints: Keypoint[]) {
  keypoints.forEach((kp) => {
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = kp.confidence > 0.7 ? '#34d399' : kp.confidence > 0.4 ? '#fbbf24' : '#ef4444';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  });
}

function drawBones(ctx: CanvasRenderingContext2D, keypoints: Keypoint[]) {
  const kpMap = new Map(keypoints.map((kp) => [kp.name, kp]));

  POSE_CONNECTIONS.forEach(([partA, partB]) => {
    // Handling simplified connections by looking for matches (e.g. left_shoulder and right_shoulder will both just map to 'shoulders' in our mock)
    // For a real 17 keypoint map, we'd have exact names.
    const a = kpMap.get(partA);
    const b = kpMap.get(partB);

    if (a && b) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      
      const avgConfidence = (a.confidence + b.confidence) / 2;
      ctx.strokeStyle = avgConfidence > 0.7 ? '#34d399' : avgConfidence > 0.4 ? '#fbbf24' : '#ef4444';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  });
}

export function PoseDetectionTab() {
  const { keypoints, pose_label, overall_confidence, history, setPoseData } = usePoseStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Mock API polling
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate some mock keypoints for the 17 standard points, grouped conceptually for now
      // In a real app this would fetch from /api/pose
      const mockKeypoints = [
        { name: 'nose', x: 250 + Math.random()*10 - 5, y: 100 + Math.random()*10 - 5, confidence: 0.9 },
        { name: 'shoulders', x: 250, y: 150, confidence: 0.8 },
        { name: 'elbows', x: 200, y: 200, confidence: 0.6 },
        { name: 'wrists', x: 180, y: 250, confidence: 0.3 },
        { name: 'hips', x: 250, y: 250, confidence: 0.9 },
        { name: 'knees', x: 250, y: 350, confidence: 0.8 },
        { name: 'ankles', x: 250, y: 450, confidence: 0.7 },
      ];
      
      const poses = ['standing', 'sitting', 'walking'];
      const randomPose = poses[Math.floor(Math.random() * poses.length)];

      setPoseData({
        keypoints: mockKeypoints,
        pose_label: Math.random() > 0.9 ? randomPose : pose_label, // change rarely
        overall_confidence: 0.85 + Math.random() * 0.1,
      });
    }, 200);

    return () => clearInterval(interval);
  }, [pose_label, setPoseData]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We can use lerping here for smooth animation, but for now we draw current state
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for(let i=0; i<canvas.width; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for(let i=0; i<canvas.height; i+=50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      drawBones(ctx, keypoints);
      drawKeypoints(ctx, keypoints);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [keypoints]);

  const postureStatus = pose_label === 'sitting' ? 'Slouching' : 'Good Posture';
  const postureVariant = postureStatus === 'Good Posture' ? 'success' : 'warning';

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Panel - Canvas */}
      <div className="lg:w-3/5">
        <Card className="h-full min-h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle>Live Pose Canvas</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 relative bg-slate-900 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
            <canvas 
              ref={canvasRef} 
              width={500} 
              height={500} 
              className="w-full h-full object-contain"
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Stats */}
      <div className="lg:w-2/5 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Current Pose</p>
                <h3 className="text-3xl font-bold text-accent-purple capitalize">{pose_label}</h3>
              </div>
              <Badge variant={postureVariant}>{postureStatus}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Overall Confidence</span>
                <span className="text-white">{(overall_confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-purple transition-all duration-300" 
                  style={{ width: `${overall_confidence * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Keypoint Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keypoints.map((kp, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-20 text-slate-400 capitalize truncate">{kp.name}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${kp.confidence > 0.7 ? 'bg-accent-green' : kp.confidence > 0.4 ? 'bg-yellow-400' : 'bg-accent-red'}`} 
                      style={{ width: `${kp.confidence * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-500">{(kp.confidence * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Pose History</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {history.length > 0 ? (
                history.map((h, i) => (
                  <li key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className="text-white capitalize">{h.label}</span>
                    <span className="text-slate-500">{formatTime(h.timestamp)}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500 text-center py-4">No recent changes</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

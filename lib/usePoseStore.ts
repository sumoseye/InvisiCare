import { create } from 'zustand';

export interface Keypoint {
  x: number;
  y: number;
  confidence: number;
  name: string;
}

export interface PoseState {
  keypoints: Keypoint[];
  pose_label: string;
  overall_confidence: number;
  history: { label: string; timestamp: number }[];
  setPoseData: (data: {
    keypoints: Keypoint[];
    pose_label: string;
    overall_confidence: number;
  }) => void;
  resetPose: () => void;
}

// Mock initial data
const initialKeypoints = [
  'nose', 'shoulders', 'elbows', 'wrists', 'hips', 'knees', 'ankles', 'eyes', 'ears'
].map(name => ({ x: 0, y: 0, confidence: 0, name }));

export const usePoseStore = create<PoseState>((set, get) => ({
  keypoints: initialKeypoints,
  pose_label: 'standing',
  overall_confidence: 0,
  history: [],

  setPoseData: (data) => {
    const currentLabel = get().pose_label;
    const history = get().history;
    
    // Add to history if label changes
    let newHistory = history;
    if (data.pose_label !== currentLabel && data.pose_label) {
      newHistory = [{ label: data.pose_label, timestamp: Date.now() }, ...history].slice(0, 10);
    }

    set({
      keypoints: data.keypoints || initialKeypoints,
      pose_label: data.pose_label || 'standing',
      overall_confidence: data.overall_confidence || 0,
      history: newHistory,
    });
  },

  resetPose: () => set({
    keypoints: initialKeypoints,
    pose_label: 'standing',
    overall_confidence: 0,
    history: [],
  }),
}));

import type { ActivityType, Keypoints } from '../types';
import { clamp, lerp, randomNoise } from '../utils';

const CENTER_X = 300;
const CENTER_Y = 280;

let tick = 0;
let currentActivity: ActivityType = 'standing';
let fallProgress = 0;
let activityStartTime = Date.now();

const STANDING: Partial<Keypoints> = {
  nose: { x: 0, y: -80 },
  leftEye: { x: -8, y: -88 },
  rightEye: { x: 8, y: -88 },
  leftEar: { x: -15, y: -82 },
  rightEar: { x: 15, y: -82 },
  leftShoulder: { x: -35, y: -50 },
  rightShoulder: { x: 35, y: -50 },
  leftElbow: { x: -50, y: -10 },
  rightElbow: { x: 50, y: -10 },
  leftWrist: { x: -55, y: 30 },
  rightWrist: { x: 55, y: 30 },
  leftHip: { x: -20, y: 20 },
  rightHip: { x: 20, y: 20 },
  leftKnee: { x: -22, y: 70 },
  rightKnee: { x: 22, y: 70 },
  leftAnkle: { x: -20, y: 120 },
  rightAnkle: { x: 20, y: 120 },
};

function getWalkingPose(phase: number): Partial<Keypoints> {
  const swing = Math.sin(phase);
  const armSwing = Math.sin(phase) * 25;
  const legSwing = Math.sin(phase + Math.PI) * 20;
  return {
    ...STANDING,
    leftElbow: { x: -50 + armSwing * 0.3, y: -10 + armSwing * 0.5 },
    rightElbow: { x: 50 - armSwing * 0.3, y: -10 - armSwing * 0.5 },
    leftWrist: { x: -55 + armSwing * 0.5, y: 30 + armSwing * 0.8 },
    rightWrist: { x: 55 - armSwing * 0.5, y: 30 - armSwing * 0.8 },
    leftKnee: { x: -22 + legSwing * 0.3, y: 70 + Math.abs(legSwing) * 0.2 },
    rightKnee: { x: 22 - legSwing * 0.3, y: 70 + Math.abs(-legSwing) * 0.2 },
    leftAnkle: { x: -20 + legSwing * 0.5, y: 120 + legSwing * 0.3 },
    rightAnkle: { x: 20 - legSwing * 0.5, y: 120 - legSwing * 0.3 },
    nose: { x: swing * 3, y: -80 + 5 },
  };
}

function getStandingPose(phase: number): Partial<Keypoints> {
  const sway = Math.sin(phase * 0.5) * 3;
  const result: Partial<Keypoints> = {};
  for (const [key, point] of Object.entries(STANDING)) {
    result[key as keyof Keypoints] = {
      x: point!.x + sway,
      y: point!.y + Math.sin(phase * 0.3) * 2,
    };
  }
  return result;
}

function getSittingPose(): Partial<Keypoints> {
  return {
    nose: { x: 0, y: -40 },
    leftEye: { x: -8, y: -48 },
    rightEye: { x: 8, y: -48 },
    leftEar: { x: -15, y: -42 },
    rightEar: { x: 15, y: -42 },
    leftShoulder: { x: -35, y: -10 },
    rightShoulder: { x: 35, y: -10 },
    leftElbow: { x: -55, y: 10 },
    rightElbow: { x: 55, y: 10 },
    leftWrist: { x: -60, y: 35 },
    rightWrist: { x: 60, y: 35 },
    leftHip: { x: -25, y: 30 },
    rightHip: { x: 25, y: 30 },
    leftKnee: { x: -35, y: 55 },
    rightKnee: { x: 35, y: 55 },
    leftAnkle: { x: -30, y: 30 },
    rightAnkle: { x: 30, y: 30 },
  };
}

function getLyingPose(): Partial<Keypoints> {
  return {
    nose: { x: 80, y: 20 },
    leftEye: { x: 72, y: 15 },
    rightEye: { x: 88, y: 15 },
    leftEar: { x: 65, y: 22 },
    rightEar: { x: 95, y: 22 },
    leftShoulder: { x: 40, y: 10 },
    rightShoulder: { x: 40, y: -10 },
    leftElbow: { x: 10, y: 15 },
    rightElbow: { x: 10, y: -15 },
    leftWrist: { x: -20, y: 18 },
    rightWrist: { x: -20, y: -18 },
    leftHip: { x: -30, y: 12 },
    rightHip: { x: -30, y: -12 },
    leftKnee: { x: -60, y: 15 },
    rightKnee: { x: -60, y: -15 },
    leftAnkle: { x: -90, y: 18 },
    rightAnkle: { x: -90, y: -18 },
  };
}

function getFallingPose(progress: number): Partial<Keypoints> {
  const standing = getStandingPose(0);
  const lying = getLyingPose();
  const result: Partial<Keypoints> = {};
  for (const key of Object.keys(standing) as (keyof Keypoints)[]) {
    const s = standing[key]!;
    const l = lying[key] || s;
    result[key] = { x: lerp(s.x, l.x, progress), y: lerp(s.y, l.y, progress) };
  }
  return result;
}

function toAbsolute(relative: Partial<Keypoints>): Keypoints {
  const keys = [
    'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar',
    'leftShoulder', 'rightShoulder', 'leftHip', 'rightHip',
    'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
    'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle',
  ] as (keyof Keypoints)[];

  const result = {} as Keypoints;
  for (const key of keys) {
    const p = relative[key] || { x: 0, y: 0 };
    result[key] = {
      x: CENTER_X + p.x,
      y: CENTER_Y + p.y,
      confidence: 0.88 + Math.random() * 0.1,
    };
  }
  return result;
}

const ACTIVITIES: ActivityType[] = ['standing', 'walking', 'sitting', 'standing', 'walking'];

export function generateSkeleton() {
  tick += 0.15;

  if (Date.now() - activityStartTime > 15000 + Math.random() * 10000) {
    currentActivity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
    activityStartTime = Date.now();
    fallProgress = 0;
  }

  if (Math.random() < 0.0005 && currentActivity !== 'falling') {
    currentActivity = 'falling';
    fallProgress = 0;
  }

  let relative: Partial<Keypoints>;
  let velocity = 0;

  switch (currentActivity) {
    case 'walking':
      relative = getWalkingPose(tick * 2);
      velocity = 0.6 + Math.abs(Math.sin(tick * 2)) * 0.3;
      break;
    case 'sitting':
      relative = getSittingPose();
      velocity = 0.05;
      break;
    case 'lying':
      relative = getLyingPose();
      velocity = 0;
      break;
    case 'falling':
      fallProgress = Math.min(1, fallProgress + 0.08);
      relative = getFallingPose(fallProgress);
      velocity = 0.9;
      if (fallProgress >= 1) currentActivity = 'lying';
      break;
    default:
      relative = getStandingPose(tick);
      velocity = 0.1 + Math.abs(Math.sin(tick * 0.5)) * 0.05;
  }

  return {
    keypoints: toAbsolute(relative),
    activity: currentActivity,
    confidence: clamp(0.85 + randomNoise(0.08), 0.75, 0.99),
    velocity,
  };
}

export function getSkeletonActivity(): ActivityType {
  return currentActivity;
}

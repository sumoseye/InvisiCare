export type ActivityType = 'standing' | 'walking' | 'sitting' | 'lying' | 'falling';
export type Severity = 'critical' | 'warning' | 'info';
export type ZoneStatus = 'clear' | 'occupied' | 'alert';
export type Sensitivity = 'low' | 'medium' | 'high';
export type EventFilter = 'all' | 'critical' | 'warning' | 'info';
export type TimeRange = '1h' | '24h' | '7d' | 'custom';
export type PersonID = string;
export type RoomType = 'living_room' | 'bedroom' | 'kitchen' | 'entry' | 'hallway' | 'bathroom';
export type EventType = 'fall' | 'intrusion' | 'activity_change' | 'occupancy_change' | 'anomaly' | 'activity' | 'occupancy' | 'vitals' | 'motion';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PersonVitals {
  personId: PersonID;
  label: string;
  breathing: number;
  heartRate: number;
  activity: ActivityType;
  confidence: number;
  signalStrength: number;
  position: Point3D;
  room: RoomType;
  timestamp: number;
  isIntruder?: boolean;
  breathingTrend?: 'up' | 'down' | 'stable';
  heartTrend?: 'up' | 'down' | 'stable';
  color: string;
}

export interface PersonSkeleton {
  personId: PersonID;
  activity: ActivityType;
  confidence: number;
  color: string;
  position: Point3D;
  rotation: number;
  animationPhase: number;
  isIntruder?: boolean;
  isFalling?: boolean;
  fallProgress?: number;
}

export interface VitalsResponse {
  people: PersonVitals[];
  timestamp: number;
  person_count: number;
  breathing_rate: number;
  heart_rate: number;
  presence_detected: boolean;
  presence_confidence: number;
  signal_strength: number;
  activity: ActivityType;
  fall_detected: boolean;
  status: string;
  zones?: string[];
}

export interface SkeletonResponse {
  people: PersonSkeleton[];
  timestamp: number;
}

export interface WaveformResponse {
  waveform: number[];
  timestamp: number;
}

export interface AppEvent {
  id: string;
  type: EventType;
  severity: Severity;
  message: string;
  description?: string;
  timestamp: number;
  location: string;
  zone: string;
  confidence: number;
  personIds: PersonID[];
  acknowledged: boolean;
  dismissed: boolean;
  status?: 'active' | 'resolved' | 'acknowledged';
}

export interface Zone {
  id: string | number;
  name: string;
  icon?: string;
  status: ZoneStatus;
  lastActivity: number;
  motionIntensity: number;
  slug?: string;
  personIds?: PersonID[];
  occupancyCount?: number;
}

export interface PathPoint extends Point3D {
  timestamp: number;
}

export interface VitalHistoryPoint {
  time: string;
  breathing: number;
  heartRate: number;
  timestamp: number;
  personId?: PersonID;
}

export interface OccupancyHour {
  hour: number;
  count: number;
  label: string;
}

export interface ActivityDistribution {
  standing: number;
  sitting: number;
  walking: number;
  lying: number;
}

export interface Alert {
  id: string;
  type: 'fall' | 'intrusion';
  severity: Severity;
  message: string;
  location: string;
  confidence: number;
  timestamp: number;
}

export interface FurnitureDef {
  id: string;
  name: 'sofa' | 'bed' | 'table' | 'chair' | 'dresser' | 'door' | 'window' | 'counter' | 'fridge' | 'tv';
  position: Point3D;
  dimensions: { width: number; depth: number; height: number };
  rotation: number;
  color: string;
}

export interface PersonMetrics {
  historicalVitals: VitalHistoryPoint[];
  activityDistribution: ActivityDistribution;
  fallRisk: number;
}

// Legacy compat
export interface Point {
  x: number;
  y: number;
  confidence?: number;
}

export interface Keypoints {
  nose: Point;
  leftEye: Point;
  rightEye: Point;
  leftEar: Point;
  rightEar: Point;
  leftShoulder: Point;
  rightShoulder: Point;
  leftHip: Point;
  rightHip: Point;
  leftElbow: Point;
  rightElbow: Point;
  leftWrist: Point;
  rightWrist: Point;
  leftKnee: Point;
  rightKnee: Point;
  leftAnkle: Point;
  rightAnkle: Point;
}

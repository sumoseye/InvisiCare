import type { PersonSkeleton, SkeletonResponse } from '../types';
import { getAllPeopleStates } from './movement';

export function generateSkeleton(): SkeletonResponse {
  const states = getAllPeopleStates();

  const people: PersonSkeleton[] = states.map((s) => ({
    personId: s.personId,
    activity: s.activity,
    confidence: 0.88 + Math.random() * 0.1,
    color: s.color,
    position: { ...s.position },
    rotation: s.rotation,
    animationPhase: s.animationPhase,
    room: s.room,
    isIntruder: s.isIntruder,
    isFalling: s.isFalling,
    fallProgress: s.fallProgress,
  }));

  return { people, timestamp: Date.now() };
}

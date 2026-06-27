import type { ActivityType, PersonID, Point3D, RoomType } from '../types';
import { PERSON_COLORS, ROOM_SIZE } from '../constants';
import { clamp, lerp } from '../utils';

export interface PersonState {
  personId: PersonID;
  label: string;
  color: string;
  activity: ActivityType;
  position: Point3D;
  target: Point3D;
  rotation: number;
  room: RoomType;
  animationPhase: number;
  activityStartTime: number;
  isIntruder: boolean;
  isFalling: boolean;
  fallProgress: number;
  pathProgress: number;
}

const ACTIVITIES: ActivityType[] = ['standing', 'walking', 'sitting', 'walking', 'standing'];

const SEATING_POINTS: Point3D[] = [
  { x: 2, y: 0, z: 3.5 },
  { x: 7.5, y: 0, z: 1.5 },
];

const WALK_TARGETS: Point3D[] = [
  { x: 3, y: 0, z: 2 },
  { x: 6, y: 0, z: 4 },
  { x: 5, y: 0, z: 6 },
  { x: 2.5, y: 0, z: 5 },
  { x: 7, y: 0, z: 3 },
];

const BED_POINT: Point3D = { x: 8, y: 0, z: 1.2 };

const FURNITURE_BOUNDS = [
  { minX: 0.5, maxX: 3, minZ: 2.5, maxZ: 4.5 },
  { minX: 4.5, maxX: 5.7, minZ: 3, maxZ: 3.8 },
  { minX: 7, maxX: 9.5, minZ: 0.5, maxZ: 2.5 },
  { minX: 8.5, maxX: 9.8, minZ: 0.2, maxZ: 1.8 },
];

let people: PersonState[] = [];
let intruderActive = false;
let intruderState: PersonState | null = null;

function createPerson(id: PersonID, startPos: Point3D, room: RoomType = 'living_room'): PersonState {
  return {
    personId: id,
    label: id === 'person-1' ? 'Person 1' : id === 'person-2' ? 'Person 2' : 'Person 3',
    color: PERSON_COLORS[id] || '#5a6b7a',
    activity: 'standing',
    position: { ...startPos },
    target: { ...startPos },
    rotation: 0,
    room,
    animationPhase: 0,
    activityStartTime: Date.now(),
    isIntruder: false,
    isFalling: false,
    fallProgress: 0,
    pathProgress: 0,
  };
}

function initPeople() {
  if (people.length === 0) {
    people = [
      createPerson('person-1', { x: 4, y: 0, z: 4 }),
      createPerson('person-2', { x: 6.5, y: 0, z: 2.5 }, 'kitchen'),
    ];
  }
}

function collidesWithFurniture(p: Point3D): boolean {
  return FURNITURE_BOUNDS.some(
    (b) => p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ
  );
}

function pickWalkTarget(from: Point3D): Point3D {
  for (let i = 0; i < 10; i++) {
    const t = WALK_TARGETS[Math.floor(Math.random() * WALK_TARGETS.length)];
    if (!collidesWithFurniture(t) && Math.hypot(t.x - from.x, t.z - from.z) > 1) return { ...t };
  }
  return { x: 5, y: 0, z: 4 };
}

function maybeChangeActivity(person: PersonState) {
  if (Date.now() - person.activityStartTime < 15000 + Math.random() * 15000) return;
  person.activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
  person.activityStartTime = Date.now();
  person.pathProgress = 0;

  switch (person.activity) {
    case 'walking':
      person.target = pickWalkTarget(person.position);
      break;
    case 'sitting':
      person.target = { ...SEATING_POINTS[Math.floor(Math.random() * SEATING_POINTS.length)] };
      break;
    case 'lying':
      person.target = { ...BED_POINT };
      break;
    default:
      person.target = { ...person.position };
  }
}

function updatePersonPosition(person: PersonState, dt: number) {
  person.animationPhase += dt * 2;

  if (person.isFalling) {
    person.fallProgress = Math.min(1, person.fallProgress + dt * 2);
    if (person.fallProgress >= 1) {
      person.activity = 'lying';
      person.isFalling = false;
    }
    return;
  }

  maybeChangeActivity(person);

  const speed = person.activity === 'walking' ? 0.5 : person.activity === 'sitting' ? 0.3 : 0;

  if (person.activity === 'walking' || person.activity === 'sitting' || person.activity === 'lying') {
    const dx = person.target.x - person.position.x;
    const dz = person.target.z - person.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.15 && (person.activity === 'walking' || person.activity === 'sitting')) {
      const step = Math.min(speed * dt, dist);
      person.position.x += (dx / dist) * step;
      person.position.z += (dz / dist) * step;
      person.rotation = Math.atan2(dx, dz);
    } else if (person.activity === 'lying') {
      const dx2 = person.target.x - person.position.x;
      const dz2 = person.target.z - person.position.z;
      const dist2 = Math.hypot(dx2, dz2);
      if (dist2 > 0.1) {
        const step = Math.min(0.3 * dt, dist2);
        person.position.x += (dx2 / dist2) * step;
        person.position.z += (dz2 / dist2) * step;
      }
    }

    if (person.activity === 'walking' && dist < 0.2) {
      person.target = pickWalkTarget(person.position);
    }
  } else if (person.activity === 'standing') {
    person.position.x += Math.sin(person.animationPhase * 0.5) * 0.002;
    person.position.z += Math.cos(person.animationPhase * 0.3) * 0.002;
  }

  person.position.x = clamp(person.position.x, 0.5, ROOM_SIZE.width - 0.5);
  person.position.z = clamp(person.position.z, 0.5, ROOM_SIZE.depth - 0.5);
  person.position.y = person.activity === 'sitting' ? 0.4 : person.activity === 'lying' ? 0.35 : 0;
}

function updateIntruder(dt: number) {
  if (!intruderActive || !intruderState) return;

  intruderState.animationPhase += dt * 2;
  const doorPos: Point3D = { x: 0.3, y: 0, z: 4 };
  const entryPos: Point3D = { x: 1.5, y: 0, z: 4 };

  if (intruderState.pathProgress < 1) {
    intruderState.pathProgress = Math.min(1, intruderState.pathProgress + dt * 0.4);
    intruderState.position.x = lerp(doorPos.x, entryPos.x, intruderState.pathProgress);
    intruderState.position.z = lerp(doorPos.z, entryPos.z, intruderState.pathProgress);
    intruderState.activity = 'walking';
    intruderState.rotation = Math.PI / 2;
  } else if (intruderState.pathProgress < 2) {
    intruderState.pathProgress = Math.min(2, intruderState.pathProgress + dt * 0.3);
    const t = intruderState.pathProgress - 1;
    intruderState.position.x = lerp(entryPos.x, 3, t);
    intruderState.position.z = lerp(entryPos.z, 4, t);
    intruderState.rotation = Math.atan2(3 - entryPos.x, 4 - entryPos.z);
  } else {
    intruderState.activity = 'standing';
    intruderState.position.x += Math.sin(intruderState.animationPhase) * 0.003;
  }
}

export function spawnIntruder() {
  if (intruderActive) return;
  intruderActive = true;
  intruderState = {
    personId: 'intruder',
    label: 'Intruder',
    color: PERSON_COLORS.intruder,
    activity: 'walking',
    position: { x: -0.5, y: 0, z: 4 },
    target: { x: 1.5, y: 0, z: 4 },
    rotation: Math.PI / 2,
    room: 'entry',
    animationPhase: 0,
    activityStartTime: Date.now(),
    isIntruder: true,
    isFalling: false,
    fallProgress: 0,
    pathProgress: 0,
  };
}

export function clearIntruder() {
  intruderActive = false;
  intruderState = null;
}

export function isIntruderActive() {
  return intruderActive;
}

export function getIntruderState() {
  return intruderState;
}

export function tickMovement(dt = 0.016) {
  initPeople();
  people.forEach((p) => updatePersonPosition(p, dt));
  updateIntruder(dt);
}

export function getAllPeopleStates(): PersonState[] {
  initPeople();
  tickMovement();
  const all = [...people];
  if (intruderState) all.push(intruderState);
  return all;
}

export function getPersonCount(): number {
  initPeople();
  return people.length;
}

export function triggerFall(personId: PersonID) {
  const p = people.find((x) => x.personId === personId);
  if (p) {
    p.isFalling = true;
    p.fallProgress = 0;
    p.activity = 'falling';
  }
}

export function setPersonCount(count: number) {
  initPeople();
  while (people.length < count && people.length < 3) {
    const id = `person-${people.length + 1}` as PersonID;
    people.push(createPerson(id, { x: 3 + people.length, y: 0, z: 3 + people.length }));
  }
  while (people.length > count) {
    people.pop();
  }
}

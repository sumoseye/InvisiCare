import * as THREE from 'three';
import type { ActivityType, FurnitureDef, RoomType } from './types';
import { ROOM_SIZE, TRAIL_COLORS } from './constants';

export { THREE };

export function createRoomScene(room: RoomType = 'living_room') {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.Fog(0x1a1a2e, 15, 30);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
  dirLight.position.set(5, 12, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x6080ff, 0.15);
  fillLight.position.set(-3, 5, -3);
  scene.add(fillLight);

  addFloor(scene);
  addWalls(scene);
  addRoomFurniture(scene, room);

  return scene;
}

function addFloor(scene: THREE.Scene) {
  const { width, depth } = ROOM_SIZE;
  const floorGeo = new THREE.PlaneGeometry(width, depth);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.9 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(width / 2, 0, depth / 2);
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(Math.max(width, depth), 20, 0x334155, 0x1e293b);
  grid.position.set(width / 2, 0.01, depth / 2);
  scene.add(grid);
}

function addWalls(scene: THREE.Scene) {
  const { width, depth, height } = ROOM_SIZE;
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.85, side: THREE.DoubleSide });

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
  backWall.position.set(width / 2, height / 2, 0);
  scene.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(0, height / 2, depth / 2);
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(width, height / 2, depth / 2);
  scene.add(rightWall);
}

function addBox(scene: THREE.Scene, def: FurnitureDef, castShadow = true) {
  const geo = new THREE.BoxGeometry(def.dimensions.width, def.dimensions.height, def.dimensions.depth);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.color),
    roughness: 0.7,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(def.position.x, def.position.y + def.dimensions.height / 2, def.position.z);
  mesh.rotation.y = (def.rotation * Math.PI) / 180;
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  mesh.userData = { furnitureId: def.id, name: def.name };
  scene.add(mesh);
  return mesh;
}

function addRoomFurniture(scene: THREE.Scene, room: RoomType) {
  getFurnitureForRoom(room).forEach((f) => addBox(scene, f));
}

export function getFurnitureForRoom(room: RoomType): FurnitureDef[] {
  const common: FurnitureDef[] = [
    { id: 'door', name: 'door', position: { x: 0, y: 0, z: 4 }, dimensions: { width: 0.15, depth: 1, height: 2.2 }, rotation: 0, color: '#4a5568' },
    { id: 'window', name: 'window', position: { x: 5, y: 1.2, z: 0.05 }, dimensions: { width: 2, depth: 0.1, height: 1.2 }, rotation: 0, color: '#718096' },
  ];

  if (room === 'living_room' || room === 'kitchen') {
    return [
      ...common,
      { id: 'sofa', name: 'sofa', position: { x: 1.75, y: 0, z: 3.5 }, dimensions: { width: 2.5, depth: 1, height: 0.85 }, rotation: 0, color: '#4a5568' },
      { id: 'table', name: 'table', position: { x: 5, y: 0, z: 3.4 }, dimensions: { width: 1.2, depth: 0.8, height: 0.5 }, rotation: 0, color: '#553c2a' },
      { id: 'tv', name: 'tv', position: { x: 9.2, y: 0.6, z: 3.5 }, dimensions: { width: 0.15, depth: 1.2, height: 0.8 }, rotation: 0, color: '#1a202c' },
    ];
  }

  if (room === 'bedroom') {
    return [
      ...common,
      { id: 'bed', name: 'bed', position: { x: 8, y: 0, z: 1.5 }, dimensions: { width: 1.5, depth: 2, height: 0.55 }, rotation: 0, color: '#e2e8f0' },
      { id: 'nightstand', name: 'table', position: { x: 6.8, y: 0, z: 1.2 }, dimensions: { width: 0.5, depth: 0.5, height: 0.6 }, rotation: 0, color: '#553c2a' },
      { id: 'dresser', name: 'dresser', position: { x: 2, y: 0, z: 1.5 }, dimensions: { width: 1.5, depth: 0.5, height: 1 }, rotation: 0, color: '#4a5568' },
    ];
  }

  return common;
}

export interface HumanoidParts {
  group: THREE.Group;
  head: THREE.Mesh;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
}

export function createHumanoid(personId: string, color: string): HumanoidParts {
  const group = new THREE.Group();
  const mat = (c: string, roughness = 0.65) =>
    new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness, metalness: 0.08 });

  const headColor = lightenColor(color, 0.12);
  const limbColor = color;
  const extremityColor = darkenColor(color, 0.08);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), mat(headColor));
  head.position.y = 1.62;
  head.castShadow = true;

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 8), mat(limbColor));
  neck.position.y = 1.42;

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.55, 0.22), mat(limbColor));
  torso.position.y = 1.05;
  torso.castShadow = true;

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.18), mat(limbColor));
  pelvis.position.y = 0.68;

  const leftArm = createLimb(0.75, extremityColor, -0.28, 1.15);
  const rightArm = createLimb(0.75, extremityColor, 0.28, 1.15);
  const leftLeg = createLimb(0.85, extremityColor, -0.1, 0.55);
  const rightLeg = createLimb(0.85, extremityColor, 0.1, 0.55);

  group.add(head, neck, torso, pelvis, leftArm.group, rightArm.group, leftLeg.group, rightLeg.group);
  group.userData = { personId, color };

  return { group, head, torso, leftArm: leftArm.group, rightArm: rightArm.group, leftLeg: leftLeg.group, rightLeg: rightLeg.group };
}

function createLimb(length: number, color: string, x: number, y: number) {
  const group = new THREE.Group();
  group.position.set(x, y, 0);
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.65 });

  const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, length * 0.55, 8), mat);
  upper.position.y = -length * 0.275;
  upper.castShadow = true;

  const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, length * 0.45, 8), mat);
  lower.position.y = -length * 0.775;
  lower.castShadow = true;

  const end = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mat);
  end.position.y = -length;

  group.add(upper, lower, end);
  return { group };
}

export function updateHumanoidPose(
  parts: HumanoidParts,
  activity: ActivityType,
  phase: number,
  fallProgress = 0
) {
  const { head, torso, leftArm, rightArm, leftLeg, rightLeg, group } = parts;

  group.rotation.x = 0;
  group.rotation.z = 0;
  head.rotation.x = 0.1;
  torso.rotation.x = 0;
  leftArm.rotation.x = 0;
  rightArm.rotation.x = 0;
  leftLeg.rotation.x = 0;
  rightLeg.rotation.x = 0;
  group.position.y = 0;

  switch (activity) {
    case 'walking': {
      const swing = Math.sin(phase * Math.PI * 2);
      leftArm.rotation.x = swing * 0.55;
      rightArm.rotation.x = -swing * 0.55;
      leftLeg.rotation.x = -swing * 0.45;
      rightLeg.rotation.x = swing * 0.45;
      break;
    }
    case 'sitting':
      torso.rotation.x = 0.4;
      head.rotation.x = 0.25;
      leftLeg.rotation.x = -1.2;
      rightLeg.rotation.x = -1.2;
      group.position.y = 0.35;
      break;
    case 'lying':
      group.rotation.x = -Math.PI / 2;
      group.position.y = 0.35;
      break;
    case 'falling':
      group.rotation.x = (-Math.PI / 2) * fallProgress;
      group.position.y = 0.35 * fallProgress;
      break;
    default:
      group.position.y = Math.sin(phase * 0.5) * 0.03;
      group.rotation.z = Math.sin(phase * 0.4) * 0.03;
      leftArm.rotation.x = Math.sin(phase * 0.3) * 0.05;
      rightArm.rotation.x = -Math.sin(phase * 0.3) * 0.05;
      break;
  }
}

export function createOrthographicCamera(width: number, height: number) {
  const aspect = width / height;
  const frustum = 6;
  const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    0.1,
    100
  );
  camera.position.set(ROOM_SIZE.width / 2 + 6, 8, ROOM_SIZE.depth / 2 + 6);
  camera.lookAt(ROOM_SIZE.width / 2, 0, ROOM_SIZE.depth / 2);
  return camera;
}

export function createPathLine(color: number, points: THREE.Vector3[]) {
  if (points.length < 2) return null;
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, Math.max(points.length, 8), 0.025, 6, false);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
  return new THREE.Mesh(geo, mat);
}

function lightenColor(hex: string, amount: number) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amount);
  return `#${c.getHexString()}`;
}

function darkenColor(hex: string, amount: number) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, -amount);
  return `#${c.getHexString()}`;
}

const MAX_TRAIL_POINTS = 120;

export class PathTracer {
  private trails: Map<string, THREE.Vector3[]> = new Map();
  private meshes: Map<string, THREE.Mesh> = new Map();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  addPoint(personId: string, x: number, y: number, z: number) {
    const points = this.trails.get(personId) || [];
    points.push(new THREE.Vector3(x, y + 0.05, z));
    if (points.length > MAX_TRAIL_POINTS) points.shift();
    this.trails.set(personId, points);
  }

  updateMeshes() {
    this.trails.forEach((points, personId) => {
      const existing = this.meshes.get(personId);
      if (existing) {
        this.scene.remove(existing);
        existing.geometry.dispose();
        (existing.material as THREE.Material).dispose();
      }
      if (points.length < 2) return;
      const color = TRAIL_COLORS[personId] ?? 0x06b6d4;
      const mesh = createPathLine(color, points);
      if (mesh) {
        this.scene.add(mesh);
        this.meshes.set(personId, mesh);
      }
    });
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.meshes.clear();
    this.trails.clear();
  }
}

export function syncHumanoids(
  scene: THREE.Scene,
  humanoids: Map<string, HumanoidParts>,
  people: import('./types').PersonSkeleton[],
  focusedId: string | null
) {
  const ids = new Set(people.map((p) => p.personId));

  humanoids.forEach((parts, id) => {
    if (!ids.has(id)) {
      scene.remove(parts.group);
      humanoids.delete(id);
    }
  });

  people.forEach((person) => {
    let parts = humanoids.get(person.personId);
    if (!parts) {
      parts = createHumanoid(person.personId, person.color);
      scene.add(parts.group);
      humanoids.set(person.personId, parts);
    }

    parts.group.position.set(person.position.x, person.position.y, person.position.z);
    parts.group.rotation.y = person.rotation;

    updateHumanoidPose(parts, person.activity, person.animationPhase, person.fallProgress ?? 0);

    const isFocused = focusedId === person.personId;
    const isIntruder = person.isIntruder;
    parts.group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive.setHex(isIntruder ? 0x661111 : isFocused ? 0x113366 : 0x000000);
        child.material.emissiveIntensity = isIntruder ? 0.4 : isFocused ? 0.25 : 0;
      }
    });
  });
}

export function initRoomRenderer(
  container: HTMLDivElement,
  room: RoomType = 'living_room'
) {
  const width = container.clientWidth;
  const height = Math.max(container.clientHeight, 400);

  const scene = createRoomScene(room);
  const camera = createOrthographicCamera(width, height);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const pathTracer = new PathTracer(scene);
  const humanoids = new Map<string, HumanoidParts>();

  return { scene, camera, renderer, pathTracer, humanoids };
}

export function resizeRoomRenderer(
  container: HTMLDivElement,
  camera: THREE.OrthographicCamera,
  renderer: THREE.WebGLRenderer
) {
  const width = container.clientWidth;
  const height = Math.max(container.clientHeight, 400);
  const aspect = width / height;
  const frustum = 6;
  camera.left = (-frustum * aspect) / 2;
  camera.right = (frustum * aspect) / 2;
  camera.top = frustum / 2;
  camera.bottom = -frustum / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

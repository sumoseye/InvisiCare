'use client';

import { useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import type { PersonSkeleton } from '@/lib/types';
import { useMovementStore } from '@/lib/store';

interface RoomRendererProps {
  people: PersonSkeleton[];
  showTrails?: boolean;
}

export function RoomRenderer({ people, showTrails = true }: RoomRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const peopleGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const trailLinesRef = useRef<Map<string, THREE.Line>>(new Map());
  const initializingRef = useRef(false);

  const pathTrails = useMovementStore((s) => s.pathTrails);

  // Initialize Three.js scene (only once)
  useEffect(() => {
    if (initializingRef.current || !containerRef.current) return;
    initializingRef.current = true;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);
      sceneRef.current = scene;

      // Camera setup
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(5, 4, 5);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Create room
      createRoom(scene);

      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);

        // Update people positions
        people.forEach((person) => {
          if (peopleGroupsRef.current.has(person.personId)) {
            const group = peopleGroupsRef.current.get(person.personId)!;
            if (person.position) {
              group.position.lerp(
                new THREE.Vector3(
                  person.position.x,
                  person.position.y,
                  person.position.z
                ),
                0.1
              );
            }
          }
        });

        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        (cameraRef.current as THREE.PerspectiveCamera).aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (
          containerRef.current &&
          rendererRef.current?.domElement?.parentElement === containerRef.current
        ) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        renderer.dispose();
      };
    } catch (error) {
      console.error('Failed to initialize Three.js:', error);
    }
  }, []);

  // Update people (separate from initialization)
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    people.forEach((person) => {
      if (!peopleGroupsRef.current.has(person.personId)) {
        try {
          const group = createPersonMesh(person.color || '#5a6b7a');
          group.position.set(
            person.position?.x || 0,
            person.position?.y || 0,
            person.position?.z || 0
          );
          scene.add(group);
          peopleGroupsRef.current.set(person.personId, group);
        } catch (error) {
          console.error('Failed to create person mesh:', error);
        }
      }
    });

    // Remove people no longer present
    const personIds = new Set(people.map((p) => p.personId));
    const toRemove: string[] = [];
    peopleGroupsRef.current.forEach((group, personId) => {
      if (!personIds.has(personId)) {
        scene.remove(group);
        toRemove.push(personId);
      }
    });
    toRemove.forEach((id) => peopleGroupsRef.current.delete(id));
  }, [people]);

  // Update trails
  useEffect(() => {
    if (!sceneRef.current || !showTrails) return;

    const scene = sceneRef.current;

    Object.entries(pathTrails).forEach(([personId, points]) => {
      if (points.length < 2) return;

      try {
        // Remove old trail
        if (trailLinesRef.current.has(personId)) {
          const oldLine = trailLinesRef.current.get(personId);
          if (oldLine) scene.remove(oldLine);
        }

        // Create new trail
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(points.length * 3);

        points.forEach((point, index) => {
          positions[index * 3] = point.x;
          positions[index * 3 + 1] = point.y;
          positions[index * 3 + 2] = point.z;
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const person = people.find((p) => p.personId === personId);
        const color = new THREE.Color(person?.color || '#60a5fa');

        const material = new THREE.LineBasicMaterial({
          color,
          linewidth: 2,
          transparent: true,
          opacity: 0.6,
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);
        trailLinesRef.current.set(personId, line);
      } catch (error) {
        console.error('Failed to create trail:', error);
      }
    });
  }, [pathTrails, showTrails, people]);

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-[500px] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50"
    />
  );
}

// Helper functions
function createRoom(scene: THREE.Scene) {
  // Floor
  const floorGeometry = new THREE.PlaneGeometry(10, 8);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Walls
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 });

  // Back wall
  const backWallGeometry = new THREE.PlaneGeometry(10, 2.5);
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
  backWall.position.z = -4;
  backWall.position.y = 1.25;
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Left wall
  const leftWallGeometry = new THREE.PlaneGeometry(8, 2.5);
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.x = -5;
  leftWall.position.y = 1.25;
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Right wall
  const rightWallGeometry = new THREE.PlaneGeometry(8, 2.5);
  const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
  rightWall.rotation.y = Math.PI / 2;
  rightWall.position.x = 5;
  rightWall.position.y = 1.25;
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Sofa
  const sofaGeometry = new THREE.BoxGeometry(2.5, 1, 1);
  const sofaMaterial = new THREE.MeshStandardMaterial({ color: 0x6b5b4a });
  const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
  sofa.position.set(-2, 0.5, 1);
  sofa.castShadow = true;
  sofa.receiveShadow = true;
  scene.add(sofa);

  // Bed
  const bedGeometry = new THREE.BoxGeometry(1.5, 0.8, 2);
  const bedMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
  const bed = new THREE.Mesh(bedGeometry, bedMaterial);
  bed.position.set(3, 0.4, 1);
  bed.castShadow = true;
  bed.receiveShadow = true;
  scene.add(bed);

  // Table
  const tableTopGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.8);
  const tableTopMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
  const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
  tableTop.position.set(0, 0.5, 0);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  scene.add(tableTop);
}

function createPersonMesh(color: string): THREE.Group {
  const group = new THREE.Group();

  // Head
  const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
  const headMaterial = new THREE.MeshStandardMaterial({ color });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.6;
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head);

  // Torso
  const torsoGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.25);
  const torsoMaterial = new THREE.MeshStandardMaterial({ color });
  const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
  torso.position.y = 1;
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  // Left Arm
  const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 16);
  const armMaterial = new THREE.MeshStandardMaterial({ color });
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.3, 1.2, 0);
  leftArm.rotation.z = Math.PI / 6;
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;
  group.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.3, 1.2, 0);
  rightArm.rotation.z = -Math.PI / 6;
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;
  group.add(rightArm);

  // Left Leg
  const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
  const legMaterial = new THREE.MeshStandardMaterial({ color });
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.15, 0.4, 0);
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  group.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.15, 0.4, 0);
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  group.add(rightLeg);

  // Feet
  const footGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.25);
  const footMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
  leftFoot.position.set(-0.15, 0, 0);
  leftFoot.castShadow = true;
  leftFoot.receiveShadow = true;
  group.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
  rightFoot.position.set(0.15, 0, 0);
  rightFoot.castShadow = true;
  rightFoot.receiveShadow = true;
  group.add(rightFoot);

  return group;
}
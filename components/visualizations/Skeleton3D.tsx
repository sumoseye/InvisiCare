'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface Keypoint {
  name: string;
  x: number;
  y: number;
  z?: number;
  confidence: number;
}

interface Skeleton3DProps {
  keypoints: Keypoint[];
  pose_label?: string;
  overall_confidence?: number;
  personCount?: number;
}

// Bone connections
const BONE_CONNECTIONS: [string, string][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

// Pose presets
const POSE_PRESETS: Record<string, Record<string, [number, number, number]>> = {
  standing: {
    head: [0, 1.75, 0],
    left_shoulder: [-0.25, 1.45, 0],
    right_shoulder: [0.25, 1.45, 0],
    left_elbow: [-0.45, 1.15, 0.05],
    right_elbow: [0.45, 1.15, 0.05],
    left_wrist: [-0.50, 0.82, 0.02],
    right_wrist: [0.50, 0.82, 0.02],
    left_hip: [-0.16, 0.95, 0],
    right_hip: [0.16, 0.95, 0],
    left_knee: [-0.18, 0.52, 0.02],
    right_knee: [0.18, 0.52, 0.02],
    left_ankle: [-0.18, 0.08, 0],
    right_ankle: [0.18, 0.08, 0],
  },
  walking: {
    head: [0, 1.75, 0],
    left_shoulder: [-0.25, 1.45, 0],
    right_shoulder: [0.25, 1.45, 0],
    left_elbow: [-0.45, 1.15, 0.05],
    right_elbow: [0.45, 1.15, 0.05],
    left_wrist: [-0.50, 0.82, 0.02],
    right_wrist: [0.50, 0.82, 0.02],
    left_hip: [-0.16, 0.95, 0],
    right_hip: [0.16, 0.95, 0],
    left_knee: [-0.18, 0.52, 0.02],
    right_knee: [0.18, 0.52, 0.02],
    left_ankle: [-0.18, 0.08, 0],
    right_ankle: [0.18, 0.08, 0],
  },
  sitting: {
    head: [0, 1.58, 0],
    left_shoulder: [-0.25, 1.30, 0.05],
    right_shoulder: [0.25, 1.30, 0.05],
    left_elbow: [-0.35, 1.05, 0.05],
    right_elbow: [0.35, 1.05, 0.05],
    left_wrist: [-0.30, 0.88, 0.10],
    right_wrist: [0.30, 0.88, 0.10],
    left_hip: [-0.16, 0.58, 0],
    right_hip: [0.16, 0.58, 0],
    left_knee: [-0.20, 0.58, 0.40],
    right_knee: [0.20, 0.58, 0.40],
    left_ankle: [-0.20, 0.10, 0.40],
    right_ankle: [0.20, 0.10, 0.40],
  },
  crouching: {
    head: [0, 1.18, 0],
    left_shoulder: [-0.25, 1.05, 0],
    right_shoulder: [0.25, 1.05, 0],
    left_elbow: [-0.40, 0.82, 0.08],
    right_elbow: [0.40, 0.82, 0.08],
    left_wrist: [-0.38, 0.62, 0.06],
    right_wrist: [0.38, 0.62, 0.06],
    left_hip: [-0.20, 0.52, 0],
    right_hip: [0.20, 0.52, 0],
    left_knee: [-0.28, 0.32, 0.10],
    right_knee: [0.28, 0.32, 0.10],
    left_ankle: [-0.22, 0.08, 0.05],
    right_ankle: [0.22, 0.08, 0.05],
  },
  lying: {
    head: [0, 0.50, 0.55],
    left_shoulder: [-0.25, 0.50, 0.20],
    right_shoulder: [0.25, 0.50, -0.20],
    left_elbow: [-0.42, 0.50, 0.45],
    right_elbow: [0.42, 0.50, -0.45],
    left_wrist: [-0.50, 0.50, 0.70],
    right_wrist: [0.50, 0.50, -0.70],
    left_hip: [-0.16, 0.50, -0.45],
    right_hip: [0.16, 0.50, -0.45],
    left_knee: [-0.18, 0.50, -0.90],
    right_knee: [0.18, 0.50, -0.90],
    left_ankle: [-0.18, 0.50, -1.30],
    right_ankle: [0.18, 0.50, -1.30],
  },
};

function getColorForConfidence(confidence: number) {
  if (confidence > 0.7) {
    return { color: 0x00ff9d, emissive: 0x00ff9d, emissiveIntensity: 0.3 };
  } else if (confidence > 0.4) {
    return { color: 0xffb020, emissive: 0xffb020, emissiveIntensity: 0.2 };
  } else {
    return { color: 0xff4444, emissive: 0xff4444, emissiveIntensity: 0.2 };
  }
}

function createBone(fromPos: THREE.Vector3, toPos: THREE.Vector3, material: THREE.Material): THREE.Mesh {
  const direction = new THREE.Vector3().subVectors(toPos, fromPos);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);

  const geometry = new THREE.CylinderGeometry(0.018, 0.018, Math.max(length, 0.01), 8);
  const bone = new THREE.Mesh(geometry, material);
  bone.position.copy(midpoint);

  if (length > 0) {
    const axis = new THREE.Vector3(0, 1, 0);
    direction.normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(axis, direction);
    bone.setRotationFromQuaternion(quaternion);
  }

  return bone;
}

interface JointData {
  name: string;
  mesh: THREE.Mesh;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  confidence: number;
}

export function Skeleton3D({
  keypoints,
  pose_label = 'standing',
  overall_confidence = 0.8,
  personCount = 1,
}: Skeleton3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const jointsRef = useRef<JointData[]>([]);
  const animationRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const lastPoseLabelRef = useRef<string>(pose_label);
  const currentPoseLabelRef = useRef<string>(pose_label);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1e);
    sceneRef.current = scene;

    // Create camera
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xe0f2ff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00d4ff, 0.8);
    directionalLight.position.set(2, 3, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00ff9d, 0.3);
    pointLight.position.set(0, 1.5, -1);
    scene.add(pointLight);

    // Add grid and circle
    const gridHelper = new THREE.GridHelper(3, 10);
    scene.add(gridHelper);

    const circleGeometry = new THREE.CircleGeometry(1.5, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x1e2d45 });
    const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
    circleMesh.rotation.x = -Math.PI / 2;
    scene.add(circleMesh);

    // Create skeleton group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Setup OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.autoRotate = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.update();
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      if (groupRef.current && jointsRef.current.length > 0) {
        // Step 1: Lerp all joints toward target position
        const lerpFactor = 0.07;
        jointsRef.current.forEach((joint) => {
          joint.currentPos.lerp(joint.targetPos, lerpFactor);
        });

        // Step 2: Apply walking animation if needed
        if (currentPoseLabelRef.current === 'walking') {
          const cycle = Math.sin(elapsed * 3.0);

          const getJoint = (name: string) => jointsRef.current.find(j => j.name === name);

          const leftHip = getJoint('left_hip');
          const rightHip = getJoint('right_hip');
          const leftKnee = getJoint('left_knee');
          const rightKnee = getJoint('right_knee');
          const leftAnkle = getJoint('left_ankle');
          const rightAnkle = getJoint('right_ankle');

          if (leftHip) leftHip.currentPos.z = POSE_PRESETS.standing.left_hip[2] + cycle * 0.12;
          if (rightHip) rightHip.currentPos.z = POSE_PRESETS.standing.right_hip[2] - cycle * 0.12;
          if (leftKnee) leftKnee.currentPos.z = POSE_PRESETS.standing.left_knee[2] + cycle * 0.20;
          if (rightKnee) rightKnee.currentPos.z = POSE_PRESETS.standing.right_knee[2] - cycle * 0.20;
          if (leftAnkle) leftAnkle.currentPos.z = POSE_PRESETS.standing.left_ankle[2] + cycle * 0.25;
          if (rightAnkle) rightAnkle.currentPos.z = POSE_PRESETS.standing.right_ankle[2] - cycle * 0.25;

          if (leftKnee) leftKnee.currentPos.y = POSE_PRESETS.standing.left_knee[1] + Math.max(0, cycle) * 0.15;
          if (rightKnee) rightKnee.currentPos.y = POSE_PRESETS.standing.right_knee[1] + Math.max(0, -cycle) * 0.15;

          const leftElbow = getJoint('left_elbow');
          const rightElbow = getJoint('right_elbow');
          const leftWrist = getJoint('left_wrist');
          const rightWrist = getJoint('right_wrist');

          if (leftElbow) leftElbow.currentPos.z = POSE_PRESETS.standing.left_elbow[2] - cycle * 0.12;
          if (rightElbow) rightElbow.currentPos.z = POSE_PRESETS.standing.right_elbow[2] + cycle * 0.12;
          if (leftWrist) leftWrist.currentPos.z = POSE_PRESETS.standing.left_wrist[2] - cycle * 0.15;
          if (rightWrist) rightWrist.currentPos.z = POSE_PRESETS.standing.right_wrist[2] + cycle * 0.15;

          const leftShoulder = getJoint('left_shoulder');
          const rightShoulder = getJoint('right_shoulder');
          if (leftShoulder) leftShoulder.currentPos.z = POSE_PRESETS.standing.left_shoulder[2] - cycle * 0.04;
          if (rightShoulder) rightShoulder.currentPos.z = POSE_PRESETS.standing.right_shoulder[2] + cycle * 0.04;
        }

        // Step 3: Update joint mesh positions
        jointsRef.current.forEach((joint) => {
          joint.mesh.position.copy(joint.currentPos);
          
          const pulse = Math.sin(elapsed * 2) * 0.15 + 0.15;
          (joint.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
        });

        // Step 4: Remove all old bones
        groupRef.current.children
          .filter((c) => c.userData.isBone)
          .forEach((c) => {
            if (c instanceof THREE.Mesh) {
              c.geometry.dispose();
              (c.material as THREE.Material).dispose();
            }
            groupRef.current?.remove(c);
          });

        // Step 5: Rebuild bones from current joint positions
        const boneConfidence = 0.8;
        const boneColorData = getColorForConfidence(boneConfidence);
        const boneMaterial = new THREE.MeshStandardMaterial({
          color: boneColorData.color,
          emissive: boneColorData.emissive,
          emissiveIntensity: boneColorData.emissiveIntensity,
          metalness: 0.3,
          roughness: 0.4,
        });

        BONE_CONNECTIONS.forEach(([nameA, nameB]) => {
          const jointA = jointsRef.current.find(j => j.name === nameA);
          const jointB = jointsRef.current.find(j => j.name === nameB);

          if (!jointA || !jointB) return;

          const bone = createBone(jointA.mesh.position, jointB.mesh.position, boneMaterial);
          bone.userData.isBone = true;
          groupRef.current?.add(bone);
        });

        // Add dynamic neck bone from shoulder midpoint to head
        const leftShoulder = jointsRef.current.find(j => j.name === 'left_shoulder');
        const rightShoulder = jointsRef.current.find(j => j.name === 'right_shoulder');
        const head = jointsRef.current.find(j => j.name === 'head');

        if (leftShoulder && rightShoulder && head) {
          const neckBase = new THREE.Vector3(
            (leftShoulder.currentPos.x + rightShoulder.currentPos.x) / 2,
            (leftShoulder.currentPos.y + rightShoulder.currentPos.y) / 2,
            (leftShoulder.currentPos.z + rightShoulder.currentPos.z) / 2
          );
          const neckBone = createBone(neckBase, head.currentPos, boneMaterial);
          neckBone.userData.isBone = true;
          groupRef.current?.add(neckBone);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      if (rendererRef.current && cameraRef.current) {
        const perspCamera = cameraRef.current as THREE.PerspectiveCamera;
        perspCamera.aspect = newWidth / newHeight;
        perspCamera.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      controlsRef.current?.dispose();
      jointsRef.current.forEach(joint => {
        joint.mesh.geometry.dispose();
        (joint.mesh.material as THREE.Material).dispose();
      });
    };
  }, []);

  // Update pose preset
  useEffect(() => {
    currentPoseLabelRef.current = pose_label;
    
    if (!groupRef.current || pose_label === lastPoseLabelRef.current) return;

    const normalizedPose = (pose_label || 'standing').toLowerCase();
    const posePreset = POSE_PRESETS[normalizedPose] || POSE_PRESETS['standing'];

    // If joints haven't been initialized yet, do it now
    if (jointsRef.current.length === 0 && groupRef.current && sceneRef.current) {
      Object.entries(posePreset).forEach(([name, pos]) => {
        const radius = name === 'head' ? 0.14 : 0.035;
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const colorData = getColorForConfidence(0.8);

        const material = new THREE.MeshStandardMaterial({
          color: colorData.color,
          emissive: colorData.emissive,
          emissiveIntensity: colorData.emissiveIntensity,
          metalness: 0.5,
          roughness: 0.2,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.isJoint = true;
        mesh.userData.jointName = name;

        const currentPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
        mesh.position.copy(currentPos);
        groupRef.current?.add(mesh);

        jointsRef.current.push({
          name,
          mesh,
          currentPos: currentPos.clone(),
          targetPos: currentPos.clone(),
          confidence: 0.8,
        });
      });
    }

    // Update target positions to new pose
    Object.entries(posePreset).forEach(([name, pos]) => {
      const joint = jointsRef.current.find(j => j.name === name);
      if (joint) {
        joint.targetPos.set(pos[0], pos[1], pos[2]);
      }
    });

    lastPoseLabelRef.current = pose_label;
  }, [pose_label]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: '#00d4ff',
          textAlign: 'left',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'capitalize' }}>
          {pose_label}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7fa3', marginTop: '4px' }}>
          Confidence: {(overall_confidence * 100).toFixed(1)}%
        </div>
      </div>

      {personCount > 1 && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 176, 32, 0.1)',
            border: '1px solid #FFB020',
            color: '#FFB020',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          ⚠ Multiple occupants — pose accuracy reduced
        </div>
      )}
    </div>
  );
}

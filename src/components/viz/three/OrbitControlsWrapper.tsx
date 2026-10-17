"use client";

/**
 * OrbitControlsWrapper — OrbitControls drei dengan damping aktif dan
 * batas jarak kamera agar pengguna tidak "hilang" dari scene.
 * Dipakai sebagai children di dalam <PhysicsScene>.
 */

import { OrbitControls } from "@react-three/drei";

export interface OrbitControlsWrapperProps {
  /** Titik target orbit (default origin). */
  target?: [number, number, number];
  enableDamping?: boolean;
  dampingFactor?: number;
  /** Jarak minimum kamera ke target (default 2). */
  minDistance?: number;
  /** Jarak maksimum kamera ke target (default 16). */
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  enablePan?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  makeDefault?: boolean;
}

export function OrbitControlsWrapper({
  target,
  enableDamping = true,
  dampingFactor = 0.08,
  minDistance = 2,
  maxDistance = 16,
  minPolarAngle = 0.15,
  maxPolarAngle = Math.PI / 2 + 0.25,
  enablePan = true,
  autoRotate = false,
  autoRotateSpeed = 0.8,
  makeDefault = true,
}: OrbitControlsWrapperProps) {
  return (
    <OrbitControls
      target={target}
      enableDamping={enableDamping}
      dampingFactor={dampingFactor}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      enablePan={enablePan}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      makeDefault={makeDefault}
    />
  );
}

export default OrbitControlsWrapper;

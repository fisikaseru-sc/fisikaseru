"use client";

/**
 * PhysicsScene — wrapper <Canvas> R3F yang dapat dipakai ulang.
 *
 * Menyediakan: pencahayaan (ambient + directional + fill), fog halus,
 * lantai grid bawaan drei, axis helper, dan kamera default.
 * Warna latar menerima token tema "dark" | "light" dari lib/design-tokens.
 *
 * Catatan performa: dpr [1,2], tanpa postprocessing, shadow PCF-soft
 * dengan map 1024. Semua komponen 3D konsumen harus dimuat via
 * next/dynamic dengan ssr:false.
 */

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";

import { colors } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export type SceneBackground = "dark" | "light";

export interface PhysicsSceneProps {
  children: React.ReactNode;
  /** Posisi awal kamera (default [4, 3, 6]). */
  cameraPosition?: [number, number, number];
  /** Field of view kamera (default 45). */
  cameraFov?: number;
  /** Tema latar — token dari design-tokens (default "dark"). */
  background?: SceneBackground;
  /** Fog halus untuk kedalaman (default true). */
  fog?: boolean;
  fogNear?: number;
  fogFar?: number;
  /** Grid lantai (default true). */
  showGrid?: boolean;
  /** Axis helper XYZ di origin (default true). */
  showAxes?: boolean;
  /** Aktifkan soft shadow map (default true). */
  shadows?: boolean;
  /** Mode frameloop R3F (default "always"). */
  frameloop?: "always" | "demand" | "never";
  /** Kelas tambahan untuk container div. */
  className?: string;
}

const GRID_COLORS = {
  dark: { cell: "#334155", section: "#475569" },
  light: { cell: "#dbe4f0", section: "#c3d0e4" },
} as const;

export function PhysicsScene({
  children,
  cameraPosition = [4, 3, 6],
  cameraFov = 45,
  background = "dark",
  fog = true,
  fogNear = 14,
  fogFar = 40,
  showGrid = true,
  showAxes = true,
  shadows = true,
  frameloop = "always",
  className,
}: PhysicsSceneProps) {
  const isDark = background === "dark";
  const bgColor = isDark ? colors.bgDark : colors.bgLight;
  const grid = isDark ? GRID_COLORS.dark : GRID_COLORS.light;

  return (
    <div className={cn("h-full w-full", className)}>
      <Canvas
        dpr={[1, 2]}
        frameloop={frameloop}
        shadows={shadows ? "soft" : false}
        camera={{ position: cameraPosition, fov: cameraFov }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[bgColor]} />
        {fog ? <fog attach="fog" args={[bgColor, fogNear, fogFar]} /> : null}

        {/* Pencahayaan */}
        <ambientLight intensity={isDark ? 0.55 : 0.9} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={isDark ? 1.3 : 1.1}
          castShadow={shadows}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
        />
        {/* Fill light lembut dari belakang agar subjek tidak flat */}
        <directionalLight
          position={[-4, 3, -5]}
          intensity={isDark ? 0.35 : 0.25}
        />

        {showGrid ? (
          <Grid
            infiniteGrid
            cellSize={0.5}
            cellThickness={0.6}
            cellColor={grid.cell}
            sectionSize={2}
            sectionThickness={1}
            sectionColor={grid.section}
            fadeDistance={30}
            fadeStrength={1.5}
            position={[0, 0, 0]}
          />
        ) : null}

        {showAxes ? <axesHelper args={[1.4]} /> : null}

        {children}
      </Canvas>
    </div>
  );
}

export default PhysicsScene;

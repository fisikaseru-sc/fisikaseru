"use client";

/**
 * MillikanChamber3D — kamar kapasitor tetes-minyak Millikan 3D (R3F).
 *
 * FISIKA: kecepatan terminal Stokes diambil dari modul simulasi
 * existing (src/features/millikan/simulation/physics.ts) —
 * calculateMillikanKinematics + MILLIKAN_CONSTANTS — sehingga angka
 * 2D dan 3D selalu identik. Droplet bergerak di sumbu Y antara dua
 * pelat sejajar (jarak fisik PLATE_D = 5 mm), diskalakan ke unit dunia
 * agar terlihat; posisi fisik (meter) dilaporkan via onStateChange.
 *
 * Dimuat konsumen via: next/dynamic(() => import("...MillikanChamber3D"), { ssr: false })
 */

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

import { colors } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import {
  MILLIKAN_CONSTANTS,
  calculateMillikanKinematics,
} from "@/features/millikan/simulation/physics";
import {
  OrbitControlsWrapper,
  PhysicsScene,
  SimulationControls,
  useSimClock,
  type SceneBackground,
} from "@/components/viz/three";

// ── Konstanta scene (unit dunia) ─────────────────────────────
const TIMESTEP = 1 / 240;
const GAP = 2.2; // jarak visual antar permukaan dalam pelat
const PLATE_W = 2.6;
const PLATE_D = 1.6;
const PLATE_T = 0.1;
const PLATE_GAP_M = MILLIKAN_CONSTANTS.PLATE_D; // 0.005 m
const SCALE = GAP / PLATE_GAP_M; // unit dunia per meter

// ── Tipe publik ──────────────────────────────────────────────
export interface MillikanDropletState {
  /** Posisi vertikal fisik dari pelat bawah (m, 0..PLATE_D). */
  yPosition: number;
  /** Kecepatan terminal Stokes (m/s, + = naik). */
  velocity: number;
  /** Waktu simulasi (s). */
  time: number;
}

export interface MillikanChamber3DProps {
  /** Radius droplet (µm). */
  dropletRadiusUm?: number;
  /** Tegangan pelat (V). */
  voltage?: number;
  /** Jumlah muatan elementer n (q = n·e). */
  chargeCount?: number;
  /** Apakah medan listrik aktif. */
  voltageOn?: boolean;
  /** Dikontrol parent. Jika undefined → dikelola sendiri. */
  running?: boolean;
  /** Pengali kecepatan simulasi (default 1). */
  speed?: number;
  /** Visualisasi garis medan (panah animasi). */
  showFieldLines?: boolean;
  /** Partikel debu halus di dalam kamar. */
  showParticles?: boolean;
  /** HUD kondisi kamar (V, q, r). */
  showHud?: boolean;
  /** Bar kontrol bawaan — hanya mode self-managed. */
  showControls?: boolean;
  background?: SceneBackground;
  /** Callback throttled ±10 Hz. */
  onStateChange?: (state: MillikanDropletState) => void;
  className?: string;
}

// ── Panah medan listrik (instanced, animasi turun) ───────────
interface FieldArrowsProps {
  activeRef: React.RefObject<boolean>;
  gap: number;
  columns?: number;
  perColumn?: number;
}

function FieldArrows({
  activeRef,
  gap,
  columns = 5,
  perColumn = 3,
}: FieldArrowsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offset = useRef(0);
  const count = columns * perColumn;

  const columnXs = useMemo(() => {
    const xs: number[] = [];
    for (let i = 0; i < columns; i++) {
      xs.push(-0.9 + (1.8 * i) / (columns - 1));
    }
    return xs;
  }, [columns]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.visible = activeRef.current;
    if (!activeRef.current) return;

    const travel = gap - 0.35;
    const spacing = travel / perColumn;
    offset.current = (offset.current + Math.min(delta, 0.05) * 0.55) % travel;

    let index = 0;
    for (let c = 0; c < columns; c++) {
      for (let k = 0; k < perColumn; k++) {
        const y = travel / 2 - (((k * spacing + offset.current) % travel) - 0.0);
        dummy.position.set(columnXs[c], y, 0);
        // Medan E mengarah dari pelat + (atas) ke pelat − (bawah)
        dummy.rotation.set(Math.PI, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        index += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.035, 0.1, 6]} />
      <meshBasicMaterial color="#fde047" transparent opacity={0.5} />
    </instancedMesh>
  );
}

// ── Droplet bercahaya ────────────────────────────────────────
interface DropletProps {
  yRef: React.RefObject<number>;
  gap: number;
  plateGapM: number;
  radiusUm: number;
}

function Droplet({ yRef, gap, plateGapM, radiusUm }: DropletProps) {
  const groupRef = useRef<THREE.Group>(null);
  const worldRadius = useMemo(
    () => 0.045 + (Math.min(Math.max(radiusUm, 0.4), 4) / 4) * 0.075,
    [radiusUm]
  );

  useFrame(() => {
    if (groupRef.current) {
      const frac = Math.min(Math.max(yRef.current / plateGapM, 0), 1);
      groupRef.current.position.y = -gap / 2 + frac * gap;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Titik minyak — emissive agar tampak bercahaya */}
      <mesh>
        <sphereGeometry args={[worldRadius, 24, 18]} />
        <meshStandardMaterial
          color="#fde047"
          emissive="#facc15"
          emissiveIntensity={1.6}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Cahaya titik mengikuti droplet → efek glow pada pelat */}
      <pointLight color="#fde047" intensity={4} distance={2.2} decay={2} />
    </group>
  );
}

// ── Komponen utama ───────────────────────────────────────────
export function MillikanChamber3D({
  dropletRadiusUm = 1.5,
  voltage = 300,
  chargeCount = 4,
  voltageOn = true,
  running,
  speed = 1,
  showFieldLines = true,
  showParticles = true,
  showHud = true,
  showControls = false,
  background = "dark",
  onStateChange,
  className,
}: MillikanChamber3DProps) {
  const selfManaged = running === undefined;

  // ── State fisika dalam ref ──
  const yRef = useRef(PLATE_GAP_M / 2);
  const vRef = useRef(0);
  const simTimeRef = useRef(0);

  const radiusRef = useRef(dropletRadiusUm);
  const voltageRef = useRef(voltage);
  const chargeRef = useRef(chargeCount);
  const voltageOnRef = useRef(voltageOn);
  const onStateChangeRef = useRef(onStateChange);

  useEffect(() => {
    radiusRef.current = dropletRadiusUm;
  }, [dropletRadiusUm]);
  useEffect(() => {
    voltageRef.current = voltage;
  }, [voltage]);
  useEffect(() => {
    chargeRef.current = chargeCount;
  }, [chargeCount]);
  useEffect(() => {
    voltageOnRef.current = voltageOn;
  }, [voltageOn]);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  // ── Penerbitan state throttled ──
  const publishState = useCallback(() => {
    onStateChangeRef.current?.({
      yPosition: yRef.current,
      velocity: vRef.current,
      time: simTimeRef.current,
    });
  }, []);

  // ── Integrator: kecepatan terminal Stokes + batas pelat ──
  const stepPhysics = useCallback((dt: number, time: number) => {
    simTimeRef.current = time;

    const kin = calculateMillikanKinematics(
      radiusRef.current,
      voltageRef.current,
      chargeRef.current,
      voltageOnRef.current
    );
    const r_m = radiusRef.current * 1e-6;
    const drag =
      MILLIKAN_CONSTANTS.STOKES_6PI * MILLIKAN_CONSTANTS.ETA * r_m;

    // Kecepatan terminal bertanda (+ = naik). Medan aktif: (Fe − Fg)/drag;
    // medan mati: jatuh bebas −vf. (Setara dengan modul 2D, digeneralisasi
    // sehingga Fe < Fg tetap dihitung sebagai jatuh yang diperlambat.)
    const vTerm = voltageOnRef.current
      ? (kin.Fe - kin.Fg) / drag
      : -kin.vf;
    vRef.current = vTerm;

    let y = yRef.current + vTerm * dt;
    const margin = 1e-5; // berhenti menempel di permukaan pelat
    if (y <= margin) {
      y = margin;
      vRef.current = 0;
    } else if (y >= PLATE_GAP_M - margin) {
      y = PLATE_GAP_M - margin;
      vRef.current = 0;
    }
    yRef.current = y;
  }, []);

  const resetSim = useCallback(() => {
    yRef.current = PLATE_GAP_M / 2;
    vRef.current = 0;
    simTimeRef.current = 0;
    publishState();
  }, [publishState]);

  // ── Jam simulasi fixed-timestep ──
  const clock = useSimClock({
    timestep: TIMESTEP,
    running,
    speed,
    onStep: stepPhysics,
    onReset: resetSim,
  });

  const fieldActiveRef = useRef(false);
  fieldActiveRef.current = showFieldLines && voltageOn && voltage > 10;

  useEffect(() => {
    if (running === undefined) return;
    if (running) clock.play();
    else clock.pause();
  }, [running, clock.play, clock.pause]);

  useEffect(() => {
    clock.setSpeed(speed);
  }, [speed, clock.setSpeed]);

  useEffect(() => {
    if (clock.running) publishState();
  }, [clock.time, clock.running, publishState]);

  // ── Geometri kamar ──
  // Pusat grup diangkat agar pelat bawah menempel lantai y=0.
  const groupY = GAP / 2 + PLATE_T / 2;
  const plateTopY = GAP / 2 + PLATE_T / 2;
  const plateBottomY = -(GAP / 2) - PLATE_T / 2;

  const pillarPositions: Array<[number, number, number]> = useMemo(
    () =>
      ([-1, 1] as const).flatMap((x) =>
        ([-1, 1] as const).map(
          (z): [number, number, number] => [
            x * (PLATE_W / 2 + 0.12),
            0,
            z * (PLATE_D / 2 + 0.12),
          ]
        )
      ),
    []
  );
  const chamberHeight = GAP + 2 * PLATE_T + 0.3;

  const emissiveOn = voltageOn && voltage > 10;

  return (
    <div
      className={cn(
        "relative h-full min-h-64 w-full overflow-hidden",
        className
      )}
    >
      <PhysicsScene
        cameraPosition={[3.4, 1.7, 4.6]}
        cameraFov={42}
        background={background}
        fog={false}
        showGrid
        showAxes={false}
        shadows={false}
      >
        <OrbitControlsWrapper
          target={[0, GAP / 2, 0]}
          minDistance={2.5}
          maxDistance={12}
        />

        <group position={[0, groupY, 0]}>
          {/* Pelat atas (+) — tembaga transparan, menyala merah saat bertegangan */}
          <mesh position={[0, plateTopY, 0]}>
            <boxGeometry args={[PLATE_W, PLATE_T, PLATE_D]} />
            <meshStandardMaterial
              color="#b45309"
              metalness={0.7}
              roughness={0.35}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
              emissive={colors.danger}
              emissiveIntensity={emissiveOn ? 0.3 : 0}
            />
          </mesh>

          {/* Pelat bawah (−) — menyala biru saat bertegangan */}
          <mesh position={[0, plateBottomY, 0]}>
            <boxGeometry args={[PLATE_W, PLATE_T, PLATE_D]} />
            <meshStandardMaterial
              color="#b45309"
              metalness={0.7}
              roughness={0.35}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
              emissive={colors.info}
              emissiveIntensity={emissiveOn ? 0.3 : 0}
            />
          </mesh>

          {/* Dinding kaca kamar */}
          <mesh>
            <boxGeometry args={[PLATE_W + 0.35, chamberHeight, PLATE_D + 0.35]} />
            <meshStandardMaterial
              color={colors.skyBlue}
              transparent
              opacity={0.06}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Pilar penyangga */}
          {pillarPositions.map((pos) => (
            <mesh key={`p-${pos[0]}-${pos[2]}`} position={pos}>
              <boxGeometry args={[0.07, chamberHeight, 0.07]} />
              <meshStandardMaterial
                color="#475569"
                metalness={0.5}
                roughness={0.45}
              />
            </mesh>
          ))}

          {/* Garis medan listrik (panah beranimasi turun) */}
          {showFieldLines ? (
            <FieldArrows activeRef={fieldActiveRef} gap={GAP} />
          ) : null}

          {/* Partikel debu halus */}
          {showParticles ? (
            <Sparkles
              count={36}
              scale={[PLATE_W - 0.4, GAP - 0.4, PLATE_D - 0.4]}
              size={1.4}
              speed={0.25}
              opacity={0.35}
              color="#93c5fd"
            />
          ) : null}

          {/* Droplet minyak bercahaya */}
          <Droplet
            yRef={yRef}
            gap={GAP}
            plateGapM={PLATE_GAP_M}
            radiusUm={dropletRadiusUm}
          />
        </group>
      </PhysicsScene>

      {showHud ? (
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-xl border border-border bg-background/90 px-3 py-2 font-mono text-[10px] shadow-depth backdrop-blur-sm">
          <span className="text-[8px] font-bold uppercase tracking-wider text-text-muted">
            Kondisi Kamar
          </span>
          <span className="flex justify-between gap-4">
            <span className="text-text-muted">V</span>
            <span className="font-bold text-amber-500">
              {voltageOn ? `${voltage} V` : "Mati"}
            </span>
          </span>
          <span className="flex justify-between gap-4">
            <span className="text-text-muted">q</span>
            <span className="font-bold text-cyan-500">{chargeCount}e</span>
          </span>
          <span className="flex justify-between gap-4">
            <span className="text-text-muted">r</span>
            <span className="font-bold text-yellow-500">
              {dropletRadiusUm.toFixed(2)} µm
            </span>
          </span>
        </div>
      ) : null}

      {showControls && selfManaged ? (
        <SimulationControls
          className="absolute bottom-4 left-1/2 z-10 w-max max-w-[calc(100%-2rem)] -translate-x-1/2"
          running={clock.running}
          onPlayPause={() => (clock.running ? clock.pause() : clock.play())}
          onReset={clock.reset}
          time={clock.time}
          speed={clock.speed}
          onSpeedChange={clock.setSpeed}
        />
      ) : null}
    </div>
  );
}

export default MillikanChamber3D;

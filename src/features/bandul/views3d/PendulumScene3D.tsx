"use client";

/**
 * PendulumScene3D — bandul sederhana 3D (React Three Fiber).
 *
 * FISIKA (benar, bukan salinan Millikan):
 *   θ'' = -(g/L)·sin(θ) - b·θ'   (penuh nonlinier, bukan small-angle)
 *   Diintegrasikan dengan Runge–Kutta orde 4 pada timestep tetap 1/240 s
 *   melalui useSimClock — terpisah dari FPS render.
 *
 * Periode diestimasi dari deteksi zero-crossing θ arah naik yang
 * berturut-turut (selisihnya = satu periode penuh), dan dibandingkan
 * dengan teori small-angle T = 2π√(L/g) via callback onStateChange.
 *
 * Dimuat konsumen via: next/dynamic(() => import("...PendulumScene3D"), { ssr: false })
 */

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";

import { colors } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import {
  OrbitControlsWrapper,
  PhysicsScene,
  SimulationControls,
  useSimClock,
  type SceneBackground,
} from "@/components/viz/three";

// ── Konstanta scene ──────────────────────────────────────────
const TIMESTEP = 1 / 240;
const FOCUS_Y = 1.1; // tinggi titik tengah ayunan di dunia
const TRAIL_POINTS = 110;
const DEG2RAD = Math.PI / 180;

// ── Tipe publik ──────────────────────────────────────────────
export interface PendulumState {
  /** Sudut saat ini (rad). */
  theta: number;
  /** Kecepatan sudut saat ini (rad/s). */
  omega: number;
  /** Waktu simulasi (s). */
  time: number;
  /** Estimasi periode dari zero-crossing (s), null sebelum 2 crossing. */
  periodEstimate: number | null;
  /** Periode teoretis small-angle 2π√(L/g) (s). */
  periodTheory: number;
}

export interface PendulumScene3DProps {
  /** Panjang tali (m). */
  length?: number;
  /** Massa beban (kg) — mempengaruhi skala visual bob. */
  mass?: number;
  /** Sudut simpangan awal (°). */
  initialAngleDeg?: number;
  /** Percepatan gravitasi (m/s²). */
  gravity?: number;
  /** Koefisien redaman viskos b (default 0 = ideal). */
  damping?: number;
  /** Dikontrol parent. Jika undefined → dikelola sendiri (bar kontrol internal). */
  running?: boolean;
  /** Pengali kecepatan simulasi (default 1). */
  speed?: number;
  showTrail?: boolean;
  showArc?: boolean;
  /** Bar kontrol bawaan — hanya relevan pada mode self-managed. */
  showControls?: boolean;
  background?: SceneBackground;
  /** Callback throttled ±10 Hz agar parent membaca pengukuran. */
  onStateChange?: (state: PendulumState) => void;
  className?: string;
}

// ── Fisika murni (RK4) ───────────────────────────────────────
interface PendulumParams {
  length: number;
  gravity: number;
  damping: number;
}

function pendulumAccel(params: PendulumParams, theta: number, omega: number): number {
  return (
    -(params.gravity / params.length) * Math.sin(theta) - params.damping * omega
  );
}

/** Satu langkah RK4 untuk sistem (θ' = ω, ω' = a(θ, ω)). */
function rk4Step(
  params: PendulumParams,
  theta: number,
  omega: number,
  dt: number
): [number, number] {
  const a = (th: number, om: number) => pendulumAccel(params, th, om);

  const k1t = omega;
  const k1o = a(theta, omega);

  const k2t = omega + (dt / 2) * k1o;
  const k2o = a(theta + (dt / 2) * k1t, omega + (dt / 2) * k1o);

  const k3t = omega + (dt / 2) * k2o;
  const k3o = a(theta + (dt / 2) * k2t, omega + (dt / 2) * k2o);

  const k4t = omega + dt * k3o;
  const k4o = a(theta + dt * k3t, omega + dt * k3o);

  const nextTheta = theta + (dt / 6) * (k1t + 2 * k2t + 2 * k3t + k4t);
  const nextOmega = omega + (dt / 6) * (k1o + 2 * k2o + 2 * k3o + k4o);
  return [nextTheta, nextOmega];
}

// ── Komponen: jejak ayunan memudar ───────────────────────────
interface SwingTrailProps {
  getBobPosition: (out: THREE.Vector3) => THREE.Vector3;
  activeRef: React.RefObject<boolean>;
  /** Counter yang dinaikkan tiap reset untuk mengosongkan jejak. */
  seqRef: React.RefObject<number>;
  headColor: string;
  fadeToColor: string;
  maxPoints?: number;
}

function SwingTrail({
  getBobPosition,
  activeRef,
  seqRef,
  headColor,
  fadeToColor,
  maxPoints = TRAIL_POINTS,
}: SwingTrailProps) {
  const { lineObject, geometry, positionAttribute } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(maxPoints * 3);
    const vertexColors = new Float32Array(maxPoints * 3);

    const head = new THREE.Color(headColor);
    const tail = new THREE.Color(fadeToColor);
    for (let i = 0; i < maxPoints; i++) {
      // i = 0 → ekor (pudar), i = maxPoints-1 → kepala (terang)
      const mixed = tail.clone().lerp(head, i / (maxPoints - 1));
      vertexColors[i * 3] = mixed.r;
      vertexColors[i * 3 + 1] = mixed.g;
      vertexColors[i * 3 + 2] = mixed.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(vertexColors, 3));
    geo.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const line = new THREE.Line(geo, material);
    line.frustumCulled = false;

    return {
      lineObject: line,
      geometry: geo,
      positionAttribute: geo.getAttribute("position") as THREE.BufferAttribute,
    };
  }, [maxPoints, headColor, fadeToColor]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      (lineObject.material as THREE.Material).dispose();
    };
  }, [geometry, lineObject]);

  const history = useRef<Array<[number, number, number]>>([]);
  const lastSeq = useRef(-1);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (seqRef.current !== lastSeq.current) {
      lastSeq.current = seqRef.current;
      history.current = [];
    }

    if (activeRef.current) {
      const p = getBobPosition(scratch);
      history.current.push([p.x, p.y, p.z]);
      if (history.current.length > maxPoints) history.current.shift();
    }

    const count = history.current.length;
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const point = history.current[i];
        positionAttribute.setXYZ(i, point[0], point[1], point[2]);
      }
      geometry.setDrawRange(0, count);
      positionAttribute.needsUpdate = true;
    } else if (geometry.drawRange.count !== 0) {
      geometry.setDrawRange(0, 0);
    }
  });

  return <primitive object={lineObject} />;
}

// ── Komponen: busur jejak sudut (envelope ayunan) ────────────
function AngleArc({
  pivotY,
  length,
  theta0,
  color,
}: {
  pivotY: number;
  length: number;
  theta0: number;
  color: string;
}) {
  const points = useMemo(() => {
    const segments = 48;
    const pts: Array<[number, number, number]> = [];
    for (let i = 0; i <= segments; i++) {
      const t = -theta0 + (2 * theta0 * i) / segments;
      pts.push([length * Math.sin(t), pivotY - length * Math.cos(t), 0]);
    }
    return pts;
  }, [pivotY, length, theta0]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      dashed
      dashSize={0.05}
      gapSize={0.045}
      transparent
      opacity={0.45}
    />
  );
}

// ── Komponen: rig bandul (di dalam Canvas) ───────────────────
interface PendulumRigProps {
  thetaRef: React.RefObject<number>;
  pivotY: number;
  length: number;
  bobRadius: number;
}

function PendulumRig({ thetaRef, pivotY, length, bobRadius }: PendulumRigProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.z = thetaRef.current;
  });

  const rodRadius = 0.012;

  return (
    <group ref={groupRef} position={[0, pivotY, 0]}>
      {/* Batang/tali */}
      <mesh position={[0, -length / 2, 0]} castShadow>
        <cylinderGeometry args={[rodRadius, rodRadius, length, 10]} />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.45}
          roughness={0.5}
        />
      </mesh>

      {/* Poros pivot */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.18, 16]} />
        <meshStandardMaterial
          color="#475569"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>

      {/* Beban (bob) — metalik */}
      <mesh position={[0, -length, 0]} castShadow>
        <sphereGeometry args={[bobRadius, 32, 24]} />
        <meshStandardMaterial
          color={colors.accentCobalt}
          metalness={0.85}
          roughness={0.25}
          emissive={colors.skyBlue}
          emissiveIntensity={0.06}
        />
      </mesh>
    </group>
  );
}

// ── Komponen utama ───────────────────────────────────────────
export function PendulumScene3D({
  length = 1,
  mass = 0.1,
  initialAngleDeg = 15,
  gravity = 9.80665,
  damping = 0,
  running,
  speed = 1,
  showTrail = true,
  showArc = true,
  showControls = false,
  background = "dark",
  onStateChange,
  className,
}: PendulumScene3DProps) {
  const selfManaged = running === undefined;
  const isDark = background === "dark";

  // ── State fisika dalam ref (bebas re-render) ──
  const thetaRef = useRef(initialAngleDeg * DEG2RAD);
  const omegaRef = useRef(0);
  const simTimeRef = useRef(0);
  const periodEstimateRef = useRef<number | null>(null);
  const prevRiseTimeRef = useRef<number | null>(null);
  const prevThetaSignRef = useRef(1);
  const trailSeqRef = useRef(0);
  const appliedInitialAngleRef = useRef(initialAngleDeg);

  const lengthRef = useRef(length);
  const gravityRef = useRef(gravity);
  const dampingRef = useRef(damping);
  const onStateChangeRef = useRef(onStateChange);

  useEffect(() => {
    lengthRef.current = length;
  }, [length]);
  useEffect(() => {
    gravityRef.current = gravity;
  }, [gravity]);
  useEffect(() => {
    dampingRef.current = damping;
  }, [damping]);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  // ── Geometri turunan ──
  const pivotY = FOCUS_Y + length / 2;
  const bobRadius = useMemo(() => {
    const normalized = Math.cbrt(Math.max(mass, 0.001) / 0.1);
    return Math.min(0.045 + 0.05 * normalized, 0.18);
  }, [mass]);
  const trailActiveRef = useRef(false);

  // ── Penerbitan state throttled (dipicu snapshot waktu ±10 Hz) ──
  const publishState = useCallback(() => {
    onStateChangeRef.current?.({
      theta: thetaRef.current,
      omega: omegaRef.current,
      time: simTimeRef.current,
      periodEstimate: periodEstimateRef.current,
      periodTheory:
        2 * Math.PI * Math.sqrt(lengthRef.current / gravityRef.current),
    });
  }, []);

  // ── Integrator: satu step RK4 + deteksi zero-crossing ──
  const stepPhysics = useCallback((dt: number, time: number) => {
    simTimeRef.current = time;

    const [nextTheta, nextOmega] = rk4Step(
      {
        length: lengthRef.current,
        gravity: gravityRef.current,
        damping: dampingRef.current,
      },
      thetaRef.current,
      omegaRef.current,
      dt
    );
    thetaRef.current = nextTheta;
    omegaRef.current = nextOmega;

    // Estimasi periode: selisih dua zero-crossing searah (naik) berturut-turut.
    const sign = Math.sign(thetaRef.current);
    const prevSign = prevThetaSignRef.current;
    if (sign !== 0 && prevSign !== 0 && sign !== prevSign) {
      if (sign > 0) {
        const lastRise = prevRiseTimeRef.current;
        if (lastRise !== null) {
          const candidate = time - lastRise;
          if (candidate > 0.05) periodEstimateRef.current = candidate;
        }
        prevRiseTimeRef.current = time;
      }
      prevThetaSignRef.current = sign;
    } else if (sign !== 0) {
      prevThetaSignRef.current = sign;
    }
  }, []);

  const resetSim = useCallback(() => {
    thetaRef.current = appliedInitialAngleRef.current * DEG2RAD;
    omegaRef.current = 0;
    simTimeRef.current = 0;
    periodEstimateRef.current = null;
    prevRiseTimeRef.current = null;
    prevThetaSignRef.current = Math.sign(thetaRef.current) || 1;
    trailSeqRef.current += 1;
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
  trailActiveRef.current = clock.running;

  // Sinkronisasi mode terkontrol dari parent.
  useEffect(() => {
    if (running === undefined) return;
    if (running) clock.play();
    else clock.pause();
  }, [running, clock.play, clock.pause]);

  useEffect(() => {
    clock.setSpeed(speed);
  }, [speed, clock.setSpeed]);

  // Terbitkan pengukuran ±10 Hz saat berjalan (clock.time = snapshot 10 Hz).
  useEffect(() => {
    if (clock.running) publishState();
  }, [clock.time, clock.running, publishState]);

  // Saat dijeda, mengubah sudut awal langsung diterapkan (mengikuti perilaku
  // modul 2D: slider sudut terlihat real-time sebelum simulasi dijalankan).
  useEffect(() => {
    if (running === false && initialAngleDeg !== appliedInitialAngleRef.current) {
      appliedInitialAngleRef.current = initialAngleDeg;
      thetaRef.current = initialAngleDeg * DEG2RAD;
      omegaRef.current = 0;
      trailSeqRef.current += 1;
      publishState();
    }
  }, [initialAngleDeg, running, publishState]);

  // ── Posisi bob analitik (untuk jejak) ──
  const getBobPosition = useCallback(
    (out: THREE.Vector3) => {
      const th = thetaRef.current;
      const L = lengthRef.current;
      return out.set(L * Math.sin(th), pivotY - L * Math.cos(th), 0);
    },
    [pivotY]
  );

  const groundColor = isDark ? "#141f36" : "#e6edf6";

  return (
    <div
      className={cn(
        "relative h-full min-h-64 w-full overflow-hidden",
        className
      )}
    >
      <PhysicsScene
        cameraPosition={[3.3, 2.1, 4.9]}
        cameraFov={42}
        background={background}
        fog={false}
        showGrid
        showAxes={false}
        shadows
      >
        <OrbitControlsWrapper
          target={[0, FOCUS_Y, 0]}
          minDistance={2}
          maxDistance={12}
        />

        {/* Penangkap bayangan di lantai */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, 0]}
          receiveShadow
        >
          <circleGeometry args={[3.2, 48]} />
          <meshStandardMaterial color={groundColor} roughness={0.95} />
        </mesh>

        {/* Rel gantungan */}
        <mesh position={[0, pivotY + 0.16, 0]} castShadow>
          <boxGeometry args={[0.9, 0.07, 0.14]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
        </mesh>

        {showArc ? (
          <AngleArc
            pivotY={pivotY}
            length={length}
            theta0={Math.abs(initialAngleDeg) * DEG2RAD}
            color={isDark ? colors.skyBlue : colors.accentCobalt}
          />
        ) : null}

        {showTrail ? (
          <SwingTrail
            getBobPosition={getBobPosition}
            activeRef={trailActiveRef}
            seqRef={trailSeqRef}
            headColor={isDark ? colors.skyBlue : colors.accentCobalt}
            fadeToColor={isDark ? colors.bgDark : colors.bgLight}
          />
        ) : null}

        <PendulumRig
          thetaRef={thetaRef}
          pivotY={pivotY}
          length={length}
          bobRadius={bobRadius}
        />
      </PhysicsScene>

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

export default PendulumScene3D;

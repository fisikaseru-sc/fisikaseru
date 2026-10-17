"use client";

/**
 * ProjectileScene3D — gerak parabola 3D (React Three Fiber).
 *
 * FISIKA (murni, dari simulation/projectile.ts):
 *   x(t) = v0·cosθ · t
 *   y(t) = h0 + v0·sinθ · t − ½ g t²
 * Fase terbang memakai bentuk tertutup (eksak) pada jam tetap 1/240 s
 * via useSimClock. Saat y = 0, proyektil melakukan pantulan lembut
 * (restitusi + redaman horizontal) lalu berhenti (bounce-and-stop).
 *
 * Skala dunia menyesuaikan jangkauan (Bulan bisa ratusan meter) sehingga
 * scene selalu terbingkai kamera. Penanda jarak dipasang tiap 5 m
 * (menyesuaikan kelipatan 5 bila jangkauan sangat jauh).
 *
 * Dimuat konsumen via: next/dynamic(() => import("...ProjectileScene3D"), { ssr: false })
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  OPTIMAL_ANGLE_DEG,
  position,
  theoreticalRange,
  timeOfFlight,
  velocityComponents,
  type ProjectileParams,
} from "../simulation/projectile";
import { DEG2RAD } from "../simulation/constants";
import { PARABOLA_CONFIG } from "../config";

// ── Konstanta scene ──────────────────────────────────────────
const TIMESTEP = 1 / 240;
const TRAIL_POINTS = 480;
const MAX_MARKERS = 40;
const REST_THRESHOLD = 0.35; // m/s — di bawah ini pantulan dianggap berhenti
const C = PARABOLA_CONFIG.constants;
const RESTITUTION = C.RESTITUSI;
const HORIZ_DAMP = C.REDAMAN_HORIZONTAL;
const MARKER_SPACING = C.SPASI_PENANDA;

// ── Tipe publik ──────────────────────────────────────────────
export interface ProjectileSceneState {
  /** Posisi horizontal saat ini (m). */
  x: number;
  /** Ketinggian saat ini (m). */
  y: number;
  /** Waktu simulasi (s). */
  t: number;
  /** Kecepatan horizontal (m/s). */
  vx: number;
  /** Kecepatan vertikal (m/s). */
  vy: number;
  /** true setelah menyentuh tanah (pantulan pertama). */
  landed: boolean;
  /** true setelah pantulan berhenti total. */
  rested: boolean;
  /** Jarak titik jatuh pertama (m) — null sebelum mendarat. */
  rangeX: number | null;
}

export interface ProjectileScene3DProps {
  /** Kecepatan awal (m/s, default 25). */
  v0?: number;
  /** Sudut elevasi (°, default 30). */
  angleDeg?: number;
  /** Percepatan gravitasi (m/s², default 9.81). */
  g?: number;
  /** Ketinggian titik lepas (m, default 0). */
  h0?: number;
  /** Dikontrol parent. Jika undefined → dikelola sendiri (bar kontrol internal). */
  running?: boolean;
  /** Pengali kecepatan simulasi (default 1). */
  speed?: number;
  /** Naikkan nilai ini untuk memicu reset dari parent (counter bebas). */
  resetKey?: number;
  /** Bar kontrol bawaan (mode self-managed). */
  showControls?: boolean;
  background?: SceneBackground;
  /** Callback throttled ±10 Hz agar parent membaca pengukuran. */
  onStateChange?: (state: ProjectileSceneState) => void;
  className?: string;
}

// ── Layout dunia (skala adaptif) ─────────────────────────────
interface DistanceMarker {
  x: number;
  major: boolean;
}

interface SceneLayout {
  /** Konversi meter → unit dunia (≤ 1). */
  scale: number;
  /** Perkiraan jangkauan maksimum (m). */
  extent: number;
  /** Jarak antar penanda (m, kelipatan MARKER_SPACING). */
  spacing: number;
  markers: DistanceMarker[];
}

function computeLayout(params: ProjectileParams): SceneLayout {
  // Range maksimum untuk h0 > 0: R_max = (v0/g)·√(v0² + 2 g h0)
  const maxRange =
    params.g > 0
      ? (params.v0 / params.g) * Math.sqrt(params.v0 * params.v0 + 2 * params.g * Math.max(params.h0, 0))
      : theoreticalRange(params.v0, OPTIMAL_ANGLE_DEG, params.g);

  const extent = Math.max(maxRange, params.h0 * 2 + 8, 12);
  const scale = Math.min(1, 26 / extent);

  let spacing = MARKER_SPACING;
  while (extent / spacing > MAX_MARKERS) spacing *= 2;

  const markers: DistanceMarker[] = [];
  const majorEvery = spacing * 5;
  for (let x = spacing; x <= extent * 1.05; x += spacing) {
    markers.push({ x, major: Math.abs(x % majorEvery) < 1e-6 });
  }
  return { scale, extent, spacing, markers };
}

// ── Komponen: jejak lintasan memudar ─────────────────────────
interface TrajectoryTrailProps {
  getPoint: (out: THREE.Vector3) => THREE.Vector3;
  activeRef: React.RefObject<boolean>;
  seqRef: React.RefObject<number>;
  headColor: string;
  fadeToColor: string;
  maxPoints?: number;
}

function TrajectoryTrail({
  getPoint,
  activeRef,
  seqRef,
  headColor,
  fadeToColor,
  maxPoints = TRAIL_POINTS,
}: TrajectoryTrailProps) {
  const { lineObject, geometry, positionAttribute } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(maxPoints * 3);
    const vertexColors = new Float32Array(maxPoints * 3);

    const head = new THREE.Color(headColor);
    const tail = new THREE.Color(fadeToColor);
    for (let i = 0; i < maxPoints; i++) {
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
      opacity: 0.9,
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
      const p = getPoint(scratch);
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

// ── Komponen: peluncur (tilting launcher) ────────────────────
function LauncherRig({
  baseY,
  angleDeg,
  scale,
  accent,
}: {
  baseY: number;
  angleDeg: number;
  scale: number;
  accent: string;
}) {
  const barrelLen = Math.max(0.9, 2.2 * scale);
  const barrelRadius = Math.max(0.035, 0.09 * scale);
  const rad = angleDeg * DEG2RAD;

  return (
    <group position={[0, baseY, 0]}>
      {/* Dudukan */}
      <mesh position={[0, -0.14, 0]} castShadow>
        <boxGeometry args={[barrelRadius * 4.5, 0.18, barrelRadius * 4.5]} />
        <meshStandardMaterial color="#475569" metalness={0.55} roughness={0.4} />
      </mesh>
      {/* Poros */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[barrelRadius * 0.7, barrelRadius * 0.7, 0.16, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Laras — mengikuti sudut */}
      <group rotation={[0, 0, rad]}>
        <mesh position={[barrelLen / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[barrelRadius, barrelRadius * 1.25, barrelLen, 14]} />
          <meshStandardMaterial
            color={accent}
            metalness={0.65}
            roughness={0.35}
            emissive={accent}
            emissiveIntensity={0.08}
          />
        </mesh>
        {/* Bibir laras */}
        <mesh position={[barrelLen, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[barrelRadius * 1.35, barrelRadius * 1.35, barrelLen * 0.06, 14]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// ── Komponen: proyektil bercahaya ────────────────────────────
interface ProjectileBodyProps {
  stateRef: React.RefObject<ProjectileSceneState>;
  scale: number;
  radius: number;
  glowColor: string;
}

function ProjectileBody({ stateRef, scale, radius, glowColor }: ProjectileBodyProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const s = stateRef.current;
    if (groupRef.current) {
      groupRef.current.position.set(s.x * scale, s.y * scale + radius, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshStandardMaterial
          color="#FDE047"
          emissive={glowColor}
          emissiveIntensity={0.85}
          metalness={0.3}
          roughness={0.35}
        />
      </mesh>
      {/* Halo lembut */}
      <mesh>
        <sphereGeometry args={[radius * 1.9, 16, 12]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <pointLight color={glowColor} intensity={2.2} distance={Math.max(2.5, 14 * scale)} />
    </group>
  );
}

// ── Komponen: vektor kecepatan ───────────────────────────────
interface VelocityArrowProps {
  stateRef: React.RefObject<ProjectileSceneState>;
  scale: number;
  radius: number;
}

function VelocityArrow({ stateRef, scale, radius }: VelocityArrowProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const s = stateRef.current;
    const group = groupRef.current;
    if (!group) return;

    const v = Math.hypot(s.vx, s.vy);
    group.visible = v > 0.4 && !s.rested;
    if (!group.visible) return;

    group.position.set(s.x * scale, s.y * scale + radius, 0);
    group.rotation.z = Math.atan2(s.vy, s.vx);

    const len = Math.min(0.3 + v * scale * 0.18, 3.2);
    if (shaftRef.current) {
      shaftRef.current.scale.x = Math.max(len, 1e-3);
      shaftRef.current.position.x = len / 2;
    }
    if (headRef.current) {
      headRef.current.position.x = len;
    }
  });

  const thickness = Math.max(0.018, 0.05 * scale + 0.012);

  return (
    <group ref={groupRef}>
      {/* Batang silinder (unit length, diskala per frame) */}
      <mesh ref={shaftRef} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[thickness, thickness, 1, 8]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>
      {/* Mata panah */}
      <mesh ref={headRef} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[thickness * 2.6, thickness * 6, 10]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>
    </group>
  );
}

// ── Komponen utama ───────────────────────────────────────────
export function ProjectileScene3D({
  v0 = 25,
  angleDeg = 30,
  g = 9.81,
  h0 = 0,
  running,
  speed = 1,
  resetKey = 0,
  showControls = false,
  background = "dark",
  onStateChange,
  className,
}: ProjectileScene3DProps) {
  const selfManaged = running === undefined;
  const isDark = background === "dark";

  const makeParams = useCallback(
    (): ProjectileParams => ({ v0, angleDeg, g, h0 }),
    [v0, angleDeg, g, h0]
  );

  // ── Layout dunia (skala adaptif thd. jangkauan) ──
  const [layout, setLayout] = useState<SceneLayout>(() => computeLayout(makeParams()));

  // ── State fisika dalam ref (bebas re-render) ──
  const stateRef = useRef<ProjectileSceneState>({
    x: 0,
    y: h0,
    t: 0,
    vx: velocityComponents(v0, angleDeg).vx,
    vy: velocityComponents(v0, angleDeg).vy0,
    landed: false,
    rested: false,
    rangeX: null,
  });
  const launchParamsRef = useRef<ProjectileParams>(makeParams());
  const trailSeqRef = useRef(0);
  const onStateChangeRef = useRef(onStateChange);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const { scale } = layout;
  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const projectileRadius = Math.max(0.09, 0.3 * scale + 0.05);

  // ── Penerbitan state throttled (±10 Hz) ──
  const publishState = useCallback(() => {
    const s = stateRef.current;
    onStateChangeRef.current?.({ ...s });
  }, []);

  // ── Reset ke kondisi peluncuran ──
  const resetSim = useCallback(() => {
    const params = makeParams();
    launchParamsRef.current = params;
    const { vx, vy0 } = velocityComponents(params.v0, params.angleDeg);
    stateRef.current = {
      x: 0,
      y: params.h0,
      t: 0,
      vx,
      vy: vy0,
      landed: false,
      rested: false,
      rangeX: null,
    };
    trailSeqRef.current += 1;
    setLayout(computeLayout(params));
    publishState();
  }, [makeParams, publishState]);

  // ── Integrator: fase terbang analitik → pantulan Euler ──
  const stepPhysics = useCallback(
    (dt: number, time: number) => {
      const s = stateRef.current;
      if (s.rested) return;

      if (!s.landed) {
        const params = launchParamsRef.current;
        const prev = position(params, time - dt);
        const curr = position(params, time);

        if (curr.y > 0) {
          s.t = curr.t;
          s.x = curr.x;
          s.y = curr.y;
          s.vx = curr.vx;
          s.vy = curr.vy;
        } else {
          // Interpolasi titik silang y = 0 dalam step ini (aksakus akurat).
          const span = prev.y - curr.y;
          const frac = span > 1e-9 ? prev.y / span : 1;
          const tCross = Math.max(time - dt, 0) + frac * dt;
          const at = position(params, tCross);
          s.t = tCross;
          s.x = at.x;
          s.y = 0;
          s.vx = at.vx;
          s.vy = at.vy;
          s.rangeX = at.x;
          s.landed = true;

          // Pantulan pertama — lembut lalu berhenti.
          s.vy = -s.vy * RESTITUTION;
          s.vx = s.vx * HORIZ_DAMP;
          if (s.vy < REST_THRESHOLD) {
            s.vy = 0;
            s.vx = 0;
            s.rested = true;
            publishState();
          }
        }
        return;
      }

      // Fase pantulan (Euler sederhana — amplitudo kecil, visual saja).
      const params = launchParamsRef.current;
      s.t = time;
      s.vy -= params.g * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.y <= 0 && s.vy < 0) {
        s.y = 0;
        s.vy = -s.vy * RESTITUTION;
        s.vx *= HORIZ_DAMP;
        if (s.vy < REST_THRESHOLD) {
          s.vy = 0;
          s.vx = 0;
          s.rested = true;
          publishState();
        }
      }
    },
    [publishState]
  );

  // ── Jam simulasi fixed-timestep ──
  const clock = useSimClock({
    timestep: TIMESTEP,
    running,
    speed,
    onStep: stepPhysics,
    onReset: resetSim,
  });

  const trailActiveRef = useRef(false);
  useEffect(() => {
    trailActiveRef.current = clock.running;
  }, [clock.running]);

  // Sinkronisasi mode terkontrol dari parent.
  useEffect(() => {
    if (running === undefined) return;
    if (running) clock.play();
    else clock.pause();
  }, [running, clock.play, clock.pause]);

  useEffect(() => {
    clock.setSpeed(speed);
  }, [speed, clock.setSpeed]);

  // Reset dari parent (counter resetKey).
  const lastResetKeyRef = useRef(resetKey);
  useEffect(() => {
    if (resetKey === lastResetKeyRef.current) return;
    lastResetKeyRef.current = resetKey;
    clock.reset();
  }, [resetKey, clock.reset]);

  // Perubahan variabel → mulai ulang peluncuran (preview slider live).
  const paramsSignature = `${v0}|${angleDeg}|${g}|${h0}`;
  const prevSignatureRef = useRef(paramsSignature);
  useEffect(() => {
    if (prevSignatureRef.current === paramsSignature) return;
    prevSignatureRef.current = paramsSignature;
    clock.reset();
  }, [paramsSignature, clock.reset]);

  // Terbitkan pengukuran ±10 Hz saat berjalan.
  useEffect(() => {
    if (clock.running) publishState();
  }, [clock.time, clock.running, publishState]);

  // ── Posisi proyektil (untuk jejak) ──
  const getPoint = useCallback(
    (out: THREE.Vector3) => out.set(stateRef.current.x * scaleRef.current, stateRef.current.y * scaleRef.current, 0),
    []
  );

  // ── Pratinjau lintasan (garis putus-putus saat idle) ──
  const previewPoints = useMemo(() => {
    const params = makeParams();
    const tf = timeOfFlight(params);
    const segments = 56;
    const pts: Array<[number, number, number]> = [];
    for (let i = 0; i <= segments; i++) {
      const t = (tf * i) / segments;
      const p = position(params, t);
      pts.push([p.x * scale, Math.max(p.y, 0) * scale, 0]);
    }
    return pts;
  }, [makeParams, scale]);

  const accent = PARABOLA_CONFIG.meta.accentColor;
  const trailHead = "#FDE047";
  const trailTail = isDark ? colors.bgDark : colors.bgLight;
  const groundColor = isDark ? "#141f36" : "#e6edf6";
  const midX = layout.extent * scale * 0.35;

  return (
    <div className={cn("relative h-full min-h-64 w-full overflow-hidden", className)}>
      <PhysicsScene
        cameraPosition={[midX + 9, 6.5, 13]}
        cameraFov={45}
        background={background}
        fog={false}
        showGrid
        showAxes={false}
        shadows
      >
        <OrbitControlsWrapper
          target={[midX, 1.1, 0]}
          minDistance={2}
          maxDistance={60}
        />

        {/* Penangkap bayangan di lantai */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[midX, 0.001, 0]} receiveShadow>
          <circleGeometry args={[Math.max(layout.extent * scale * 1.15, 6), 48]} />
          <meshStandardMaterial color={groundColor} roughness={0.95} />
        </mesh>

        {/* Penanda jarak (tiap `spacing` meter, mayor tiap 5×) */}
        {layout.markers.map((m) => (
          <mesh key={m.x} position={[m.x * scale, m.major ? 0.3 : 0.16, 0]} castShadow={false}>
            <boxGeometry args={[Math.max(0.015, 0.02 * scale + 0.008), m.major ? 0.6 : 0.32, Math.max(0.015, 0.02 * scale + 0.008)]} />
            <meshStandardMaterial
              color={m.major ? colors.skyBlue : "#64748b"}
              emissive={m.major ? colors.skyBlue : "#000000"}
              emissiveIntensity={m.major ? 0.35 : 0}
            />
          </mesh>
        ))}

        {/* Pratinjau lintasan (dashed) saat tidak berjalan */}
        {!clock.running ? (
          <Line
            points={previewPoints}
            color={isDark ? colors.skyBlue : colors.accentCobalt}
            lineWidth={1}
            dashed
            dashSize={0.12}
            gapSize={0.1}
            transparent
            opacity={0.4}
          />
        ) : null}

        <LauncherRig baseY={h0 * scale} angleDeg={angleDeg} scale={scale} accent={accent} />

        <TrajectoryTrail
          getPoint={getPoint}
          activeRef={trailActiveRef}
          seqRef={trailSeqRef}
          headColor={trailHead}
          fadeToColor={trailTail}
        />

        <ProjectileBody
          stateRef={stateRef}
          scale={scale}
          radius={projectileRadius}
          glowColor={accent}
        />

        <VelocityArrow stateRef={stateRef} scale={scale} radius={projectileRadius} />
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

export default ProjectileScene3D;

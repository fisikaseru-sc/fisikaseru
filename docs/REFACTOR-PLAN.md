# FisikaSeru 4.0 — Grand Refactor Plan

> **Objektif**: Website pembelajaran Fisika kaya fitur — tanpa video pentutor, digantikan
> **visualisasi 3D interaktif & animasi bergerak** — dengan UI/UX shadcn/ui yang tepat.
> Pipeline: Plan → Implement → Review → Revise → Final Review.

---

## 0. Prinsip Desain

1. **Visual instead of video**: setiap konsep yang biasanya dijelaskan tutor via video
   digantikan simulasi 3D interaktif (React Three Fiber) + animasi konseptual (Framer Motion).
2. **Socratic loop tetap inti**: PREDICT → EXPERIMENT → ANALYZE → REFLECT dipertahankan
   dan digeneralisasi ke semua modul.
3. **Modul = plugin**: satu kontrak modul yang typed, modul baru cukup daftar di registry.
4. **shadcn/ui sebagai satu-satunya bahasa UI**: semua komponen ad-hoc dimigrasi.
5. **Presisi fisika**: engine simulasi murni TS (testable), rendering terpisah (2D canvas / 3D R3F).

---

## 1. Arsitektur Target

```
src/
├── app/                      # Next.js App Router (layout, routing)
├── components/
│   ├── ui/                   # shadcn/ui penuh (20+ komponen)
│   ├── layout/               # Navbar, Footer, ModuleShell
│   ├── landing/              # Landing dengan animasi hero
│   └── viz/                  # Lapisan visualisasi bersama
│       ├── three/            # R3F primitives: Scene, Controls3D, AxisHelper, Grid3D
│       ├── charts/           # Chart wrappers (Recharts) dengan tema konsisten
│       └── motion/           # Animasi konseptual reusable (framer-motion)
├── features/
│   ├── bandul/               # + views3d/
│   ├── millikan/             # + views3d/
│   └── parabola/             # MODUL BARU: Gerak Parabola 3D
├── lib/
│   ├── simulation/           # Engine loop bersama (rAF, timestep, noise)
│   ├── analysis/             # Regresi & curve-fitting bersama
│   └── modules/              # Module contract + registry typed
└── ...
```

### Module Contract (inti refactor)
```ts
interface PhysicsModule {
  slug: string; meta: ModuleMeta;
  predict: PredictView; experiment: ExperimentView; analysis: AnalysisView; reflection: ReflectionView;
  config: ModuleConfig;      // konstanta, pertanyaan refleksi, variabel
  simulation: SimulationSpec; // variabel bebas/terikat, rentang, noise
}
```

---

## 2. Workstreams

### WS-A — Design System & UI/UX (shadcn/ui)
- Pasang shadcn/ui penuh: card, dialog, tabs, slider, tooltip, progress, scroll-area,
  separator, sonner (toast), sheet, skeleton, accordion, alert, badge, button, input,
  label, select, switch, table.
- Tailwind v4 design tokens gelap-terang konsisten dengan `lib/design-tokens.ts`.
- Landing page revamp: hero beranimasi (bandul 3D kecil sebagai latar), section dengan
  scroll-reveal Framer Motion.
- Dashboard revamp: kartu progres, streak, rekomendasi modul, empty state.
- Katalog modul: grid kartu dengan preview animasi per modul.
- Navbar/Footer dengan Sheet mobile menu.
- A11y: focus rings, aria, kontras WCAG AA.

### WS-B — Lapisan Visualisasi 3D (React Three Fiber)
- Deps: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.
- `components/viz/three/`: `PhysicsScene` (lighting, grid, axes), `CameraRig`,
  `useAnimationFrame` (delta-based, pause/resume), `SimulationControls` (play/pause/reset/speed shadcn).
- **Bandul 3D**: bandul riil 3D (tali + sphere + pivot), bayangan, trace lintasan,
  slider panjang/massa/sudut/gravitasi real-time.
- **Millikan 3D**: chamber 3D, droplet bercahaya, plat sejajar, efek medan listrik;
  kamera bisa orbit.
- Toggle **2D/3D** per modul (2D canvas dipertahankan untuk perangkat lemah).

### WS-C — Modul Baru: Gerak Parabola 3D + Kerangka Modul
- Refactor registry → typed module contract (WS di atas memakai kontrak ini).
- **Parabola**: meriam/peluncur 3D, sudut & kecepatan awal, lintasan proyektil
  real-time dengan trace, vektor kecepatan panah, mode "bounce", pengambilan data
  jarak-tempuh vs sudut → analisis menemukan sudut optimal 45°.
- Analisis: scatter + curve fit (reuse lapisan `lib/analysis`).
- Refleksi sokratis (reuse pattern Millikan, disederhanakan).

### WS-D — Fitur Pendukung Kaya
- Halaman glossary istilah fisika (accordion shadcn + animasi).
- Quiz singkat per modul di akhir refleksi.
- Progress tracker di dashboard (localStorage + Supabase-ready interface).
- Skeleton loading + toast (sonner) untuk feedback aksi.
- `not-found` kreatif dengan animasi fisika.

---

## 3. Eksekusi & Model Routing (subagent)

| Tahap | Tugas | Model |
|---|---|---|
| Implement WS-A | UI/UX shadcn + landing/dashboard | `9router/ID/deepseek-v4-pro` (fallback `cbai/deepseek-v4.1-flash`) |
| Implement WS-B | 3D R3F layer + Bandul3D + Millikan3D | `9router/ID/glm-5.3` (fallback `cbai/glm-5.2`) |
| Implement WS-C | Module contract + Parabola 3D | `9router/ID/deepseek-v4-pro` |
| Integrasi & build | main agent (saya) | `ID/glm-5.3` |
| Review 1 | adversarial code review lintas-workstream | `9router/cbai/kimi-k2.6` |
| Revisi | perbaikan temuan review | main agent |
| Final review | verifikasi akhir + build hijau | `9router/cbai/glm-5.2` |

## 4. Definition of Done
- `npm run build` hijau, `npm run lint` bersih.
- 3 modul (Bandul, Millikan, Parabola) jalan dengan mode 3D + 2D.
- Semua UI memakai shadcn/ui; tidak ada komponen ad-hoc yang duplikat.
- A11y & responsive lolos pemeriksaan manual.
- Review akhir tanpa temuan blocker.

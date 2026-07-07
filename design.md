# FisikaSeru — Design Document
## Complete Project Architecture, Folder Structure & File Specification

> **Single Source of Truth** untuk seluruh struktur kode, konfigurasi, konvensi, dan keputusan arsitektur.
> Dibaca oleh: Engineer, Designer, Content Specialist, dan AI assistant yang membantu development.

---

## Daftar Isi

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Monorepo Root Structure](#2-monorepo-root-structure)
3. [Apps — Web Frontend (`apps/web`)](#3-apps--web-frontend-appsweb)
4. [Apps — PDF Worker (`apps/pdf-worker`)](#4-apps--pdf-worker-appspdf-worker)
5. [Packages — Shared (`packages/`)](#5-packages--shared-packages)
6. [Database Schema (`packages/db`)](#6-database-schema-packagesdb)
7. [Physics Engine (`packages/physics`)](#7-physics-engine-packagesphysics)
8. [AI Tutor System (`packages/ai-tutor`)](#8-ai-tutor-system-packagesai-tutor)
9. [Curriculum Content (`packages/curriculum`)](#9-curriculum-content-packagescurriculum)
10. [Infrastructure & Config (`infra/`)](#10-infrastructure--config-infra)
11. [Konvensi Kode & Naming](#11-konvensi-kode--naming)
12. [Environment Variables](#12-environment-variables)
13. [Data Flow Diagrams](#13-data-flow-diagrams)
14. [State Management Architecture](#14-state-management-architecture)
15. [API Routes Specification](#15-api-routes-specification)

---

## 1. Tech Stack Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FISIKASERU STACK                           │
├─────────────────┬───────────────────────────────────────────────────┤
│ LAYER           │ TEKNOLOGI                                          │
├─────────────────┼───────────────────────────────────────────────────┤
│ Monorepo        │ Turborepo + pnpm workspaces                       │
│ Frontend        │ Next.js 15 (App Router) + TypeScript 5.4          │
│ 3D Rendering    │ React Three Fiber v8 + @react-three/drei           │
│ Physics Engine  │ @dimforge/rapier3d-compat (WASM, Rust-compiled)    │
│ UI Components   │ Radix UI primitives + Tailwind CSS v4              │
│ Animation       │ Framer Motion v11                                  │
│ Data Viz        │ Recharts v2 + D3.js v7 (drag interactions)        │
│ State (Global)  │ Zustand v4                                        │
│ State (Server)  │ TanStack Query v5                                  │
│ Forms           │ React Hook Form v7 + Zod v3                       │
│ Auth            │ Supabase Auth (Google OAuth + Magic Link)          │
│ Database        │ Supabase PostgreSQL (ap-southeast-1)               │
│ Storage         │ Supabase Storage + Cloudflare R2 (GLTF assets)    │
│ Queue           │ Upstash Redis + Bull (PDF jobs)                    │
│ PDF Worker      │ Railway.app — Node.js 20 + Python 3.12 (pdflatex) │
│ Realtime        │ Supabase Realtime (WebSocket, PDF job status)      │
│ Analytics       │ PostHog (self-hosted, ap-southeast-1)              │
│ Error Monitor   │ Sentry (Frontend + Backend)                        │
│ Testing         │ Vitest + Playwright + axe-playwright               │
│ CI/CD           │ GitHub Actions + Vercel (frontend) + Railway (PDF) │
│ CDN             │ Cloudflare (static assets + R2 GLTF serving)       │
└─────────────────┴───────────────────────────────────────────────────┘
```

---

## 2. Monorepo Root Structure

```
fisikaseru/                              # Monorepo root
│
├── apps/
│   ├── web/                             # Next.js 15 frontend (main app)
│   └── pdf-worker/                      # PDF generation worker service
│
├── packages/
│   ├── db/                              # Database schema, migrations, typed client
│   ├── physics/                         # Physics engine abstraction layer
│   ├── ai-tutor/                        # AI Tutor logic & dialogue system
│   ├── curriculum/                      # Module blueprints & content data
│   ├── shared-types/                    # TypeScript types shared across packages
│   ├── ui/                              # Shared UI component library
│   └── config/                          # Shared configs (ESLint, TS, Tailwind)
│
├── infra/
│   ├── docker/                          # Docker configs untuk PDF worker
│   ├── supabase/                        # Supabase local dev config
│   └── cloudflare/                      # Cloudflare Workers (optional edge logic)
│
├── docs/                                # Documentation
│   ├── design.md                        # ← FILE INI
│   ├── PRD-Master.docx                  # Master PRD
│   ├── api-reference.md                 # API endpoint docs
│   └── adr/                             # Architecture Decision Records
│       ├── 001-monorepo-turborepo.md
│       ├── 002-rapier-physics-engine.md
│       ├── 003-async-pdf-queue.md
│       └── 004-supabase-ap-southeast-1.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml                       # CI: type-check, lint, test, bundle-size
│       ├── cd-web.yml                   # CD: deploy Next.js ke Vercel
│       ├── cd-pdf-worker.yml            # CD: deploy worker ke Railway
│       └── e2e.yml                      # Playwright E2E tests (nightly)
│
├── turbo.json                           # Turborepo pipeline config
├── pnpm-workspace.yaml                  # pnpm workspaces config
├── package.json                         # Root package (dev scripts)
├── .env.example                         # Template environment variables
├── .gitignore
└── README.md
```

---

## 3. Apps — Web Frontend (`apps/web`)

```
apps/web/
│
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── layout.tsx                   # Root layout: fonts, providers, analytics
│   │   ├── page.tsx                     # Beranda (catalog) — SSG/ISR
│   │   ├── globals.css                  # Tailwind base + CSS custom properties
│   │   │
│   │   ├── (auth)/                      # Route group: auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Login page (Google OAuth + Magic Link)
│   │   │   ├── callback/
│   │   │   │   └── route.ts             # OAuth callback handler
│   │   │   └── consent/
│   │   │       └── page.tsx             # UU PDP consent page (wajib setelah register)
│   │   │
│   │   ├── (main)/                      # Route group: authenticated pages
│   │   │   ├── layout.tsx               # Main layout: Navbar + sidebar navigation
│   │   │   │
│   │   │   ├── catalog/
│   │   │   │   └── page.tsx             # Katalog modul (Netflix-style, filter by kategori)
│   │   │   │
│   │   │   ├── lab/
│   │   │   │   └── [moduleId]/
│   │   │   │       ├── page.tsx         # Lab page: orchestrates all 6 steps
│   │   │   │       ├── loading.tsx      # Skeleton loading untuk lab screen
│   │   │   │       └── error.tsx        # Error boundary untuk lab screen
│   │   │   │
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx             # Global onboarding (60-detik, first-time only)
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   └── page.tsx             # Profil pengguna + progress tracking
│   │   │   │
│   │   │   ├── progress/
│   │   │   │   └── page.tsx             # Dashboard progress lintas modul (Pro)
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx             # Daftar laporan yang pernah dibuat
│   │   │   │   └── [reportId]/
│   │   │   │       └── page.tsx         # Detail laporan + PDF preview
│   │   │   │
│   │   │   ├── flashcards/
│   │   │   │   └── page.tsx             # Smart Flashcard dengan spaced repetition (Pro)
│   │   │   │
│   │   │   ├── concept-map/
│   │   │   │   └── page.tsx             # Concept Network visualization (Pro)
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx             # Settings: tema, notifikasi, hapus akun
│   │   │
│   │   ├── (teacher)/                   # Route group: guru (Classroom Link)
│   │   │   ├── layout.tsx               # Teacher layout: dashboard sidebar
│   │   │   ├── classroom/
│   │   │   │   └── page.tsx             # Dashboard guru: buat tautan, lihat hasil siswa
│   │   │   └── classroom/
│   │   │       └── [linkId]/
│   │   │           └── page.tsx         # Detail satu classroom link + daftar siswa
│   │   │
│   │   ├── go/
│   │   │   └── [code]/
│   │   │       └── page.tsx             # Classroom link redirect: fisikaseru.id/go/[code]
│   │   │
│   │   └── api/                         # API Routes (Next.js Route Handlers)
│   │       ├── auth/
│   │       │   └── [...supabase]/
│   │       │       └── route.ts         # Supabase auth handler
│   │       │
│   │       ├── sessions/
│   │       │   ├── route.ts             # POST /api/sessions (buat sesi baru)
│   │       │   └── [sessionId]/
│   │       │       └── route.ts         # GET/PATCH /api/sessions/[id]
│   │       │
│   │       ├── trials/
│   │       │   └── route.ts             # POST /api/trials (rekam data trial)
│   │       │
│   │       ├── reports/
│   │       │   ├── queue/
│   │       │   │   └── route.ts         # POST /api/reports/queue (enqueue PDF job)
│   │       │   └── status/
│   │       │       └── route.ts         # GET /api/reports/status?job_id=X
│   │       │
│   │       ├── subscriptions/
│   │       │   ├── route.ts             # GET /api/subscriptions (cek status Pro)
│   │       │   └── webhook/
│   │       │       └── route.ts         # POST /api/subscriptions/webhook (payment webhook)
│   │       │
│   │       ├── flashcards/
│   │       │   └── route.ts             # GET/POST /api/flashcards (spaced rep data)
│   │       │
│   │       ├── classroom/
│   │       │   ├── route.ts             # POST /api/classroom (buat classroom link)
│   │       │   └── [linkId]/
│   │       │       └── route.ts         # GET/DELETE /api/classroom/[id]
│   │       │
│   │       └── analytics/
│   │           └── route.ts             # POST /api/analytics (track events ke PostHog)
│   │
│   ├── components/
│   │   │
│   │   ├── lab/                         # Komponen inti Lab Screen (Step 1–6)
│   │   │   ├── LabOrchestrator.tsx      # Root component: manages step state machine
│   │   │   ├── LabStepIndicator.tsx     # Progress bar: [●●●○○] Step 3 dari 6
│   │   │   ├── LabLayout.tsx            # Layout 3-kolom: control | canvas | data
│   │   │   │
│   │   │   ├── steps/
│   │   │   │   ├── Step1Trigger.tsx     # Knowledge activation: pertanyaan + pilihan
│   │   │   │   ├── Step2Setup.tsx       # Instrument setup: slider, dropdown, preview
│   │   │   │   ├── Step3Experiment.tsx  # Experiment runtime: 3D canvas + live table
│   │   │   │   ├── Step4Analysis.tsx    # Guided analysis: scatter plot + regression
│   │   │   │   ├── Step5Reflect.tsx     # Reflect & Reconstruct: confrontation card
│   │   │   │   └── Step6Report.tsx      # Report generation + reward display
│   │   │   │
│   │   │   ├── controls/
│   │   │   │   ├── InstrumentPanel.tsx  # Container panel kiri: semua kontrol
│   │   │   │   ├── DataSlider.tsx       # Slider dengan label, unit, range, tooltip
│   │   │   │   ├── VariableDropdown.tsx # Dropdown untuk variabel kategoris
│   │   │   │   ├── VariableInfo.tsx     # Info chip (ikon ?) untuk setiap kontrol
│   │   │   │   ├── ConstraintWarning.tsx # Toast/tooltip saat mendekati batas fisika
│   │   │   │   └── ResetButton.tsx      # Tombol reset semua ke default
│   │   │   │
│   │   │   ├── canvas/
│   │   │   │   ├── SimCanvas.tsx        # R3F Canvas wrapper: lighting, camera, scene
│   │   │   │   ├── SceneContainer.tsx   # Lazy-loads modul-specific 3D scene
│   │   │   │   ├── VectorOverlay.tsx    # Toggle-able vektor gaya (F, v, a) sebagai arrow
│   │   │   │   ├── ValueReadout.tsx     # Nilai real-time overlay di atas canvas
│   │   │   │   ├── ConstraintEffect.tsx # Animasi "alat rusak" saat batas terlewati
│   │   │   │   └── PerformanceMonitor.tsx # FPS monitor → auto-degrade < 30fps
│   │   │   │
│   │   │   ├── data/
│   │   │   │   ├── LiveDataTable.tsx    # Tabel auto-fill saat rekam data
│   │   │   │   ├── DataRow.tsx          # Satu baris data: trial, variabel, nilai, aksi
│   │   │   │   ├── AnomalyHighlight.tsx # Highlight baris anomali (> 2σ)
│   │   │   │   ├── ProgressDots.tsx     # Indikator "Data terkumpul: 3/5"
│   │   │   │   └── RecordButton.tsx     # Tombol "Rekam Data" dengan micro-animation
│   │   │   │
│   │   │   ├── analysis/
│   │   │   │   ├── ScatterPlot.tsx      # Plot interaktif D3 + drag regression line
│   │   │   │   ├── RegressionLine.tsx   # Draggable regression line component
│   │   │   │   ├── R2Display.tsx        # Real-time R² badge + interpretasi
│   │   │   │   ├── GradientPanel.tsx    # Panel: nilai gradien + interpretasi fisika
│   │   │   │   ├── AxisTransformPicker.tsx # Dropdown: T vs L, T² vs L, log-log
│   │   │   │   └── EurekaReveal.tsx     # Animasi celebrasi saat R² > 0.75
│   │   │   │
│   │   │   └── reflect/
│   │   │       ├── ConfrontationCard.tsx # Full-screen card: prediksi vs hasil
│   │   │       ├── SocraticDialogue.tsx  # AI Tutor Socratic Q&A sequence
│   │   │       ├── ReconstructInput.tsx  # Input rekonstruksi mental model
│   │   │       └── ContextInjection.tsx  # Fakta historis/relevansi nyata post-eureka
│   │   │
│   │   ├── simulation/                  # 3D Scene per-modul (lazy-loaded)
│   │   │   ├── BandulScene.tsx          # Bandul matematika: tali + beban + busur
│   │   │   ├── OhmScene.tsx             # Rangkaian listrik: baterai + resistor + ammeter
│   │   │   ├── FreeFallScene.tsx        # Jatuh bebas: dua bola berbeda massa
│   │   │   ├── BoyleScene.tsx           # Hukum Boyle: silinder piston + gas partikel
│   │   │   ├── MillikanScene.tsx        # Millikan: ruang vakum + tetes minyak + pelat
│   │   │   ├── KirchhoffScene.tsx       # Rangkaian Kirchhoff: multi-loop
│   │   │   ├── NewtonScene.tsx          # Hukum Newton: balok di bidang datar/miring
│   │   │   ├── PhotoelectricScene.tsx   # Efek fotolistrik: plat logam + foton + elektron
│   │   │   ├── CharlesScene.tsx         # Hukum Charles: balon + pemanas
│   │   │   └── LensScene.tsx            # Lensa konvergen: sumber cahaya + lensa + layar
│   │   │
│   │   ├── ai-tutor/
│   │   │   ├── AITutorProvider.tsx      # Context provider: tutor state, mode, history
│   │   │   ├── MicroHintBubble.tsx      # Mode 1: tooltip animasi (panah, highlight)
│   │   │   ├── SocraticBubble.tsx       # Mode 2: dialogue card dengan pertanyaan
│   │   │   ├── ReflectionBubble.tsx     # Mode 3: reflection partner post-eureka
│   │   │   ├── TutorTriggerEngine.tsx   # Logic: kapan trigger mode 1/2/3
│   │   │   └── TutorDismissButton.tsx   # Tombol dismiss yang selalu ada
│   │   │
│   │   ├── catalog/
│   │   │   ├── CatalogPage.tsx          # Container halaman katalog
│   │   │   ├── CategoryNav.tsx          # Tab/pill navigasi kategori
│   │   │   ├── SimCardGrid.tsx          # Grid responsive SimCard
│   │   │   ├── SimCard.tsx              # Kartu modul: thumbnail, judul, meta, status
│   │   │   ├── SimCardSkeleton.tsx      # Loading skeleton untuk SimCard
│   │   │   ├── FeaturedBanner.tsx       # Hero banner dengan GIF simulasi
│   │   │   ├── TrendingRow.tsx          # Horizontal scroll "Trending Minggu Ini"
│   │   │   └── ConceptNetworkPreview.tsx # Mini DAG preview di catalog (Pro)
│   │   │
│   │   ├── report/
│   │   │   ├── ReportQueue.tsx          # UI "Sedang Menyusun Laporan..." + progress
│   │   │   ├── ReportPreview.tsx        # PDF inline preview (PDF.js)
│   │   │   ├── ReportActions.tsx        # Tombol: Download PDF, Export DOCX (Pro), Share
│   │   │   └── EurekaCard.tsx           # Shareable card: hasil eksperimen estetis
│   │   │
│   │   ├── monetization/
│   │   │   ├── PaywallGate.tsx          # Gate component: blur + upgrade CTA
│   │   │   ├── UpgradeModal.tsx         # Modal upgrade Pro: pricing + value props
│   │   │   ├── UpgradeBanner.tsx        # Banner inline (non-modal) untuk upsell ringan
│   │   │   ├── ProBadge.tsx             # Badge kecil "PRO" untuk fitur berbayar
│   │   │   ├── TrialActivation.tsx      # UI aktivasi 7-hari trial setelah share
│   │   │   └── PricingTable.tsx         # Tabel harga lengkap (untuk halaman upgrade)
│   │   │
│   │   ├── flashcard/
│   │   │   ├── FlashCardDeck.tsx        # Container deck: manage urutan spaced rep
│   │   │   ├── FlashCard.tsx            # Kartu individual: flip animation, konten
│   │   │   ├── FlashCardBasic.tsx       # Versi Free: static, tidak ada SR
│   │   │   ├── SpacedRepScheduler.tsx   # Leitner System logic: next_review_at
│   │   │   └── FlashCardProgress.tsx    # Progress bar: mastered/learning/new
│   │   │
│   │   ├── concept-map/
│   │   │   ├── ConceptNetworkGraph.tsx  # D3 force-directed graph: modul sebagai node
│   │   │   ├── ConceptNode.tsx          # Node individual: nama, status, tier
│   │   │   ├── ConceptEdge.tsx          # Edge: requires/builds_on/related_to
│   │   │   └── LearningPathPanel.tsx    # Panel kanan: suggested learning path
│   │   │
│   │   ├── onboarding/
│   │   │   ├── OnboardingOrchestrator.tsx # Manager: 4 scene sequence
│   │   │   ├── Scene1DeviceCalibration.tsx # Interaksi 3D dasar, kalibrasi kontrol
│   │   │   ├── Scene2GalileoMoment.tsx    # Dua bola jatuh → cognitive conflict
│   │   │   ├── Scene3AITutorIntro.tsx     # Perkenalan AI Tutor sebagai thinking partner
│   │   │   └── Scene4LevelSelection.tsx   # Pilih level: SMP / SMA / Kuliah
│   │   │
│   │   ├── classroom/
│   │   │   ├── ClassroomDashboard.tsx   # Dashboard guru: daftar link aktif
│   │   │   ├── CreateLinkForm.tsx       # Form buat classroom link baru
│   │   │   ├── StudentResultsTable.tsx  # Tabel hasil siswa per classroom link
│   │   │   └── ClassroomLinkCard.tsx    # Kartu satu link: QR, URL, statistik
│   │   │
│   │   └── shared/                      # Komponen umum (dari packages/ui atau lokal)
│   │       ├── Navbar.tsx               # Top navigation bar
│   │       ├── Sidebar.tsx              # Sidebar navigasi (desktop)
│   │       ├── BottomNav.tsx            # Bottom navigation (mobile)
│   │       ├── ThemeToggle.tsx          # Light/dark mode toggle
│   │       ├── LoadingSpinner.tsx       # Global loading indicator
│   │       ├── ErrorBoundary.tsx        # React Error Boundary wrapper
│   │       ├── ToastProvider.tsx        # Toast notification system (Radix Toast)
│   │       └── AccessibilityAnnouncer.tsx # ARIA live region untuk screen readers
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useLabSession.ts             # Session state: step, data, status
│   │   ├── useTrialRecorder.ts          # Rekam trial: validasi + submit + optimistic
│   │   ├── useRegressionAnalysis.ts     # Kalkulasi R², gradien, intercept real-time
│   │   ├── useAITutor.ts                # AI Tutor trigger logic + dialogue state
│   │   ├── usePhysicsWorld.ts           # Rapier world init + fixed update loop
│   │   ├── useNoiseInjector.ts          # Galat Gaussian per-modul
│   │   ├── useOfflineSync.ts            # IndexedDB + background sync
│   │   ├── useSupabaseRealtime.ts       # WebSocket: subscribe PDF job status
│   │   ├── useConceptNetwork.ts         # DAG queries: prerequisites, related modules
│   │   ├── useSpacedRepetition.ts       # Leitner System: next_review_at kalkulasi
│   │   ├── useProAccess.ts              # Cek status Pro + gating logic
│   │   ├── useDeviceCapability.ts       # WebGL check + performance tier detection
│   │   ├── useAnalytics.ts              # Wrapper PostHog track events
│   │   └── useKeyboardShortcuts.ts      # Global keyboard shortcuts (R, Esc, Tab, dll.)
│   │
│   ├── stores/                          # Zustand stores (global state)
│   │   ├── lab.store.ts                 # Lab session state machine
│   │   ├── physics.store.ts             # Physics world state (rigid bodies, values)
│   │   ├── ui.store.ts                  # UI state: sidebar, modal, toast
│   │   ├── user.store.ts                # Auth user + subscription status
│   │   └── tutor.store.ts               # AI Tutor: mode, history, intervention count
│   │
│   ├── lib/                             # Utility functions & service clients
│   │   ├── supabase/
│   │   │   ├── client.ts                # Supabase browser client (singleton)
│   │   │   ├── server.ts                # Supabase server client (RSC/Route Handler)
│   │   │   └── middleware.ts            # Auth middleware (refresh session)
│   │   │
│   │   ├── physics/
│   │   │   ├── noise.ts                 # Gaussian noise: Box-Muller + seeded PRNG
│   │   │   ├── regression.ts            # Linear regression: R², gradien, intercept
│   │   │   ├── units.ts                 # Unit conversion utilities
│   │   │   └── validators.ts            # Physics constraint validators (batas fisika)
│   │   │
│   │   ├── ai-tutor/
│   │   │   ├── trigger-engine.ts        # Rule-based trigger: kapan muncul mode 1/2/3
│   │   │   ├── dialogue-selector.ts     # Pilih dialogue template berdasarkan context
│   │   │   └── dialogue-templates.ts    # Template dialogue per-modul (parameterized)
│   │   │
│   │   ├── report/
│   │   │   ├── payload-builder.ts       # Build JSON payload untuk PDF queue
│   │   │   └── eureka-card.ts           # Generate Eureka Card image data
│   │   │
│   │   ├── analytics/
│   │   │   ├── events.ts                # Semua event name constants (type-safe)
│   │   │   └── posthog.ts               # PostHog client init + track wrapper
│   │   │
│   │   └── utils/
│   │       ├── cn.ts                    # classnames utility (clsx + twMerge)
│   │       ├── format.ts                # Number formatting: sci notation, decimals
│   │       ├── date.ts                  # Date formatting (id-ID locale)
│   │       └── device.ts                # Device detection utilities
│   │
│   ├── types/                           # Local TypeScript type definitions
│   │   ├── lab.types.ts                 # LabSession, Trial, Step enums
│   │   ├── module.types.ts              # ModuleBlueprint, Variable, ALO
│   │   ├── report.types.ts              # ReportJob, ReportStatus, ReportFormat
│   │   └── analytics.types.ts           # EventPayload, SessionMetrics
│   │
│   ├── styles/
│   │   ├── globals.css                  # Tailwind directives + CSS custom properties
│   │   └── lab.css                      # Lab-specific CSS (3D canvas overrides)
│   │
│   └── config/
│       ├── modules.config.ts            # Daftar semua modul: ID, title, tier, category
│       ├── site.config.ts               # Site-wide config: URL, name, social
│       └── feature-flags.ts             # Feature flags (concept-network, offline, dll.)
│
├── public/
│   ├── fonts/                           # Self-hosted fonts (subset)
│   │   ├── Sora-Regular.woff2
│   │   ├── Sora-SemiBold.woff2
│   │   ├── Sora-Bold.woff2
│   │   └── JetBrainsMono-Regular.woff2
│   │
│   ├── icons/
│   │   ├── sprite.svg                   # SVG sprite semua ikon (single HTTP request)
│   │   ├── favicon.ico
│   │   ├── icon-192.png                 # PWA icon
│   │   └── icon-512.png                 # PWA icon
│   │
│   ├── thumbnails/                      # SimCard thumbnails (webm, served via CDN)
│   │   ├── bandul.webm
│   │   ├── ohm.webm
│   │   ├── freefall.webm
│   │   ├── boyle.webm
│   │   └── millikan.webm
│   │
│   └── manifest.json                    # PWA manifest
│
├── next.config.ts                       # Next.js config: bundle analysis, headers, CSP
├── tailwind.config.ts                   # Tailwind v4 config: design tokens, plugins
├── tsconfig.json                        # TypeScript config (strict mode)
├── vitest.config.ts                     # Vitest unit test config
├── playwright.config.ts                 # Playwright E2E config
└── package.json                         # Dependencies + scripts
```

---

## 4. Apps — PDF Worker (`apps/pdf-worker`)

```
apps/pdf-worker/
│
├── src/
│   ├── worker.ts                        # Entry point: Bull worker, job processor
│   ├── queue.ts                         # Redis Bull queue definition + job types
│   │
│   ├── generators/
│   │   ├── pdf.generator.ts             # Orchestrator: pilih template → compile → upload
│   │   ├── docx.generator.ts            # DOCX generator (docx.js — Node.js)
│   │   └── simplified.generator.ts      # Fallback generator: HTML→PDF via Puppeteer
│   │
│   ├── templates/
│   │   ├── base/
│   │   │   ├── report-base.tex          # LaTeX template dasar (header, footer, packages)
│   │   │   └── report-base.typ          # Typst template dasar (fallback compiler)
│   │   │
│   │   ├── modules/
│   │   │   ├── bandul.tex               # Template LaTeX spesifik Bandul
│   │   │   ├── ohm.tex                  # Template LaTeX spesifik Hukum Ohm
│   │   │   ├── freefall.tex             # Template LaTeX spesifik Jatuh Bebas
│   │   │   ├── boyle.tex                # Template LaTeX spesifik Hukum Boyle
│   │   │   └── millikan.tex             # Template LaTeX spesifik Millikan
│   │   │
│   │   └── docx/
│   │       └── report.docx.template.ts  # DOCX structure template (docx.js builder)
│   │
│   ├── injectors/
│   │   ├── data-injector.ts             # Inject session data ke template placeholders
│   │   ├── graph-injector.ts            # Decode Base64 graph PNG → file → inject ke LaTeX
│   │   └── conclusion-injector.ts       # Generate teks kesimpulan otomatis dari data
│   │
│   ├── compilers/
│   │   ├── pdflatex.compiler.ts         # Jalankan pdflatex di sandbox subprocess
│   │   └── typst.compiler.ts            # Jalankan typst compiler (fallback, lebih cepat)
│   │
│   ├── storage/
│   │   └── supabase-upload.ts           # Upload PDF ke Supabase Storage + return signed URL
│   │
│   └── utils/
│       ├── sandbox.ts                   # Subprocess sandbox config (seccomp, network off)
│       ├── cleanup.ts                   # Hapus file temp setelah kompilasi
│       └── logger.ts                    # Structured logging (JSON, ke Sentry)
│
├── python/                              # Python subprocess untuk pdflatex
│   ├── compile.py                       # Entry script: terima path .tex → jalankan pdflatex
│   └── requirements.txt                 # (kosong — pdflatex via TexLive system)
│
├── Dockerfile                           # Docker image: Node 20 + TexLive slim + Typst
├── railway.json                         # Railway deployment config
├── tsconfig.json
└── package.json
```

---

## 5. Packages — Shared (`packages/`)

### `packages/shared-types`

```
packages/shared-types/
│
├── src/
│   ├── index.ts                         # Re-export semua types
│   │
│   ├── database.types.ts                # Auto-generated dari Supabase schema
│   │   # (dihasilkan oleh: supabase gen types typescript)
│   │
│   ├── module.types.ts
│   │   # ModuleBlueprint
│   │   # ModuleCategory: 'mekanika' | 'listrik' | 'modern' | 'termal'
│   │   # ModuleTier: 'free' | 'pro'
│   │   # DifficultyLevel: 'L1' | 'L2' | 'L3'
│   │   # Variable (name, symbol, unit, min, max, default, step, tooltip)
│   │   # AtomicLearningObjective (bloom_level, verb, object, condition)
│   │   # Misconception (id, statement, source, prevalence_pct)
│   │   # ConceptEdge (from, to, type: 'requires'|'builds_on'|'related_to')
│   │
│   ├── session.types.ts
│   │   # LabSession, SessionStatus, Step (1|2|3|4|5|6)
│   │   # Trial (trial_no, variable_values, measured_value, noise_applied)
│   │   # PredictionData (question_id, selected_option, time_to_decide_ms)
│   │   # ReflectionData (confrontation_shown, reconstruction_text, attempts)
│   │   # SessionMetrics (completion, eureka_rate, ai_tutor_interventions)
│   │
│   ├── report.types.ts
│   │   # ReportJob, JobStatus: 'queued'|'processing'|'completed'|'failed'
│   │   # ReportFormat: 'pdf' | 'docx'
│   │   # ReportPayload (session_data, graph_base64, seed, user_name)
│   │
│   ├── tutor.types.ts
│   │   # TutorMode: 'micro_hint' | 'socratic' | 'reflection'
│   │   # TutorTrigger, TutorDialogue, TutorInterventionLog
│   │
│   └── analytics.types.ts
│       # EventName (enum semua event name)
│       # EventPayload (user_id, session_id, event_name, properties, timestamp)
│
└── package.json
```

### `packages/ui`

```
packages/ui/
│
├── src/
│   ├── index.ts                         # Re-export semua komponen
│   │
│   ├── primitives/                      # Wrapping Radix UI primitives
│   │   ├── Button.tsx                   # Button: variant (primary/secondary/ghost/danger)
│   │   ├── Dialog.tsx                   # Modal dialog (Radix Dialog)
│   │   ├── Sheet.tsx                    # Bottom sheet / side sheet (Radix Dialog)
│   │   ├── Tooltip.tsx                  # Tooltip (Radix Tooltip)
│   │   ├── Select.tsx                   # Dropdown select (Radix Select)
│   │   ├── Slider.tsx                   # Slider (Radix Slider + ARIA)
│   │   ├── Progress.tsx                 # Progress bar (Radix Progress)
│   │   ├── Badge.tsx                    # Badge / chip (inline status)
│   │   ├── Tabs.tsx                     # Tab navigation (Radix Tabs)
│   │   ├── Toast.tsx                    # Toast notification (Radix Toast)
│   │   ├── Switch.tsx                   # Toggle switch (Radix Switch)
│   │   └── Separator.tsx                # Visual separator (Radix Separator)
│   │
│   ├── compound/                        # Komponen gabungan yang lebih kompleks
│   │   ├── DataTable.tsx                # Tabel data dengan sort + highlight
│   │   ├── StepIndicator.tsx            # Progress step indicator [●●●○○]
│   │   ├── ProgressRing.tsx             # Ring progress (sm/md/lg)
│   │   ├── SkeletonCard.tsx             # Loading skeleton
│   │   └── EmptyState.tsx               # Empty state dengan ilustrasi
│   │
│   └── tokens/
│       ├── colors.ts                    # Design token colors (as JS constants)
│       ├── typography.ts                # Font sizes, weights, line heights
│       └── spacing.ts                   # Spacing scale (8px grid)
│
├── package.json
└── tsconfig.json
```

### `packages/config`

```
packages/config/
│
├── eslint/
│   ├── base.js                          # ESLint base rules (semua packages)
│   ├── next.js                          # ESLint rules khusus Next.js
│   └── react.js                         # ESLint rules khusus React
│
├── typescript/
│   ├── base.json                        # tsconfig base (strict: true, target: ES2022)
│   ├── nextjs.json                      # tsconfig untuk Next.js app
│   └── library.json                     # tsconfig untuk packages/library
│
└── tailwind/
    ├── base.ts                          # Tailwind base config (design tokens)
    └── plugins/
        ├── animation.ts                 # Custom animations (eureka, pulse, float)
        └── physics-ui.ts               # Physics UI utils (vector arrows, gauge)
```

---

## 6. Database Schema (`packages/db`)

```
packages/db/
│
├── src/
│   ├── index.ts                         # Re-export client + all query functions
│   ├── client.ts                        # Typed Supabase client (generic types injected)
│   │
│   ├── schema/                          # SQL migration files (Supabase migrations)
│   │   ├── 000_init.sql                 # Initial schema creation
│   │   ├── 001_users.sql
│   │   ├── 002_sessions.sql
│   │   ├── 003_trials.sql
│   │   ├── 004_reports.sql
│   │   ├── 005_subscriptions.sql
│   │   ├── 006_flashcards.sql
│   │   ├── 007_classroom_links.sql
│   │   ├── 008_concept_graph.sql        # DAG: nodes + edges untuk Concept Network
│   │   ├── 009_rls_policies.sql         # Row Level Security policies (WAJIB)
│   │   └── 010_indexes.sql              # Performance indexes
│   │
│   ├── queries/                         # Typed query functions
│   │   ├── users.queries.ts
│   │   ├── sessions.queries.ts
│   │   ├── trials.queries.ts
│   │   ├── reports.queries.ts
│   │   ├── subscriptions.queries.ts
│   │   ├── flashcards.queries.ts
│   │   └── classroom.queries.ts
│   │
│   └── seed/
│       ├── modules.seed.ts              # Seed data modul (dari curriculum package)
│       └── concept-graph.seed.ts        # Seed data DAG Concept Network
│
└── package.json
```

### Skema Tabel Detail

```sql
-- ═══════════════════════════════════════════════
-- TABLE: users
-- ═══════════════════════════════════════════════
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  level           TEXT CHECK (level IN ('smp','sma','kuliah')) DEFAULT 'sma',
  -- UU PDP compliance fields
  consent_at      TIMESTAMPTZ,          -- kapan user setuju ToS + Privacy Policy
  consent_version TEXT,                  -- versi consent yang disetujui (e.g., 'v2.1')
  birth_year      INTEGER,               -- untuk deteksi < 13 tahun
  parent_email    TEXT,                  -- untuk verifikasi orang tua jika < 13 tahun
  parent_verified BOOLEAN DEFAULT FALSE,
  -- metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ            -- soft delete (right to erasure)
);

-- ═══════════════════════════════════════════════
-- TABLE: sessions
-- ═══════════════════════════════════════════════
CREATE TABLE sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id           TEXT NOT NULL,        -- e.g., 'MOD-MECH-003'
  seed                INTEGER NOT NULL,     -- random seed untuk reproducibility
  difficulty_level    TEXT DEFAULT 'L1',
  current_step        INTEGER DEFAULT 1,
  status              TEXT CHECK (status IN ('active','completed','abandoned')) DEFAULT 'active',
  -- Step 1 data
  prediction_data     JSONB,               -- { question_id, selected_option, time_ms, hover_sequence }
  -- Step 5 data
  reflection_data     JSONB,               -- { confrontation_shown, reconstruction_text, attempts, socratic_q_count }
  -- Metrics
  final_r2            DECIMAL(5,4),
  accuracy_pct        DECIMAL(5,2),        -- |g_exp - g_lit| / g_lit * 100
  -- Classroom
  classroom_link_id   UUID REFERENCES classroom_links(id),
  -- Timestamps
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  last_active_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE: trials
-- ═══════════════════════════════════════════════
CREATE TABLE trials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
  trial_no        INTEGER NOT NULL,
  variables       JSONB NOT NULL,          -- { L: 0.75, m: 100, theta: 10 }
  measured_value  DECIMAL(10,6) NOT NULL,  -- nilai yang diukur (T_obs, V, dll.)
  true_value      DECIMAL(10,6),           -- nilai deterministik sebelum noise
  noise_applied   DECIMAL(10,8),           -- ε yang disuntikkan
  derived_values  JSONB,                   -- kalkulasi turunan: { T_squared: 2.34 }
  is_anomaly      BOOLEAN DEFAULT FALSE,   -- apakah > 2σ dari rata-rata
  recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE: reports
-- ═══════════════════════════════════════════════
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id),
  job_id          TEXT UNIQUE,             -- Bull job ID untuk polling
  status          TEXT CHECK (status IN ('queued','processing','completed','failed')) DEFAULT 'queued',
  format          TEXT CHECK (format IN ('pdf','docx')) DEFAULT 'pdf',
  pdf_url         TEXT,                    -- Supabase Storage signed URL
  docx_url        TEXT,                    -- Supabase Storage signed URL (Pro only)
  expires_at      TIMESTAMPTZ,             -- URL expiry (7 hari)
  error_message   TEXT,                    -- Pesan error jika status = 'failed'
  compiler_used   TEXT,                    -- 'pdflatex' | 'typst' | 'puppeteer'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════
-- TABLE: subscriptions
-- ═══════════════════════════════════════════════
CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  plan              TEXT CHECK (plan IN ('monthly','semester','annual','student','classroom')),
  status            TEXT CHECK (status IN ('active','expired','cancelled','trial')) DEFAULT 'active',
  trial_ends_at     TIMESTAMPTZ,           -- Untuk 7-hari trial
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  expires_at        TIMESTAMPTZ,
  payment_provider  TEXT,                  -- 'midtrans' | 'duitku' | 'manual'
  payment_ref       TEXT,                  -- Invoice/transaction ID dari payment gateway
  classroom_seats   INTEGER,               -- Untuk plan Classroom
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE: flashcards
-- ═══════════════════════════════════════════════
CREATE TABLE flashcards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id       TEXT NOT NULL,
  card_type       TEXT CHECK (card_type IN ('basic','spaced_rep')) DEFAULT 'basic',
  content         JSONB NOT NULL,          -- { front, back, formula, graph_url }
  -- Leitner System fields
  leitner_box     INTEGER DEFAULT 1,       -- Box 1-5 (box 5 = mastered)
  next_review_at  TIMESTAMPTZ,
  interval_days   INTEGER DEFAULT 1,
  ease_factor     DECIMAL(3,2) DEFAULT 2.5, -- SuperMemo SM-2 ease factor
  review_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- TABLE: classroom_links
-- ═══════════════════════════════════════════════
CREATE TABLE classroom_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id       TEXT NOT NULL,
  code            TEXT UNIQUE NOT NULL,    -- e.g., 'bandul-sma3-pak-budi'
  title           TEXT,                    -- Nama penugasan, e.g., 'Praktikum Bandul Kelas 11A'
  is_active       BOOLEAN DEFAULT TRUE,
  student_count   INTEGER DEFAULT 0,       -- Auto-increment saat siswa join
  notify_email    TEXT,                    -- Email guru untuk terima PDF otomatis
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ              -- Opsional: tautan expire
);

-- ═══════════════════════════════════════════════
-- TABLE: concept_nodes (untuk Concept Network)
-- ═══════════════════════════════════════════════
CREATE TABLE concept_nodes (
  id              TEXT PRIMARY KEY,        -- sama dengan module_id (MOD-MECH-003)
  label           TEXT NOT NULL,           -- nama konsep
  category        TEXT NOT NULL,
  tier            TEXT DEFAULT 'free',
  x_position      DECIMAL,                 -- posisi default di concept map
  y_position      DECIMAL
);

-- ═══════════════════════════════════════════════
-- TABLE: concept_edges
-- ═══════════════════════════════════════════════
CREATE TABLE concept_edges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node       TEXT REFERENCES concept_nodes(id),
  to_node         TEXT REFERENCES concept_nodes(id),
  edge_type       TEXT CHECK (edge_type IN ('requires','builds_on','related_to'))
);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY (semua tabel)
-- ═══════════════════════════════════════════════
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
  ON users FOR ALL USING (auth.uid() = id);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own sessions"
  ON sessions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own trials via session"
  ON trials FOR ALL USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = trials.session_id AND sessions.user_id = auth.uid())
  );

-- (RLS diterapkan ke semua tabel — lihat 009_rls_policies.sql untuk detail lengkap)
```

---

## 7. Physics Engine (`packages/physics`)

```
packages/physics/
│
├── src/
│   ├── index.ts                         # Re-export semua hooks + utilities
│   │
│   ├── core/
│   │   ├── world.ts                     # PhysicsWorld: init Rapier, gravity config
│   │   ├── fixed-update.ts              # useFixedUpdate: 60Hz loop, independent dari render
│   │   ├── rigid-body.ts                # useRigidBody: abstraksi per-object physics
│   │   └── observable.ts                # useObservable: expose nilai fisik ke React
│   │
│   ├── noise/
│   │   ├── gaussian.ts                  # Box-Muller Gaussian: gaussianNoise(mean, sigma)
│   │   ├── prng.ts                      # Mulberry32 seeded PRNG (reproducible)
│   │   └── injector.ts                  # useNoiseInjector: apply noise per-modul config
│   │
│   ├── models/                          # Deterministik physics models per-modul
│   │   ├── pendulum.ts                  # T = 2π√(L/g), constraint θ < 15°
│   │   ├── free-fall.ts                 # h = ½gt², t = √(2h/g)
│   │   ├── ohm.ts                       # V = IR, linearitas check
│   │   ├── boyle.ts                     # P₁V₁ = P₂V₂
│   │   ├── millikan.ts                  # q = mgd/V, Stokes drag: v_t = 2r²Δρg/9η
│   │   └── kirchhoff.ts                 # KCL + KVL matrix solver (Gaussian elimination)
│   │
│   ├── analysis/
│   │   ├── regression.ts                # Linear regression: R², slope, intercept
│   │   │   # linReg(x: number[], y: number[]): { r2, slope, intercept }
│   │   ├── statistics.ts                # mean, std, variance, outlier detection
│   │   └── gcd-finder.ts                # GCD finder untuk modul Millikan
│   │
│   └── constraints/
│       ├── validator.ts                 # Cek apakah nilai input masih dalam validitas fisika
│       └── auto-stop.ts                 # Trigger auto-stop + animasi "alat rusak"
│
└── package.json
```

---

## 8. AI Tutor System (`packages/ai-tutor`)

```
packages/ai-tutor/
│
├── src/
│   ├── index.ts
│   │
│   ├── trigger-engine/
│   │   ├── index.ts                     # TutorTriggerEngine: evaluate → decide mode
│   │   ├── rules.ts                     # Rule definitions (kondisi → mode → aksi)
│   │   │   #
│   │   │   # RULES (ordered by priority):
│   │   │   # 1. onboarding_first_session  → GUIDED_FULL
│   │   │   # 2. r2_fail_3x               → MICRO_HINT
│   │   │   # 3. r2_fail_5x               → SOCRATIC
│   │   │   # 4. step_timeout_4min        → MICRO_HINT (nudge)
│   │   │   # 5. data_outlier_detected    → MICRO_HINT (inline)
│   │   │   # 6. step5_confrontation      → REFLECTION_PARTNER
│   │   │   # 7. hots_wrong_answer (Pro)  → REFLECTION_PARTNER
│   │   │   # 8. boredom_rapid_click      → RE_ENGAGE
│   │   │
│   │   ├── conditions.ts                # Condition evaluators (pure functions)
│   │   └── cooldown.ts                  # Cooldown logic: tutor tidak spam
│   │
│   ├── dialogue/
│   │   ├── selector.ts                  # Pilih template berdasarkan (module_id, mode, context)
│   │   ├── renderer.ts                  # Render template: inject nilai variabel ke string
│   │   │
│   │   └── templates/                   # Dialogue templates per-modul + per-mode
│   │       ├── _base.templates.ts       # Template generik (fallback jika modul tidak ada)
│   │       ├── bandul.templates.ts      # Dialogue khusus modul Bandul
│   │       ├── ohm.templates.ts
│   │       ├── freefall.templates.ts
│   │       ├── boyle.templates.ts
│   │       └── millikan.templates.ts
│   │       #
│   │       # Format template:
│   │       # {
│   │       #   module_id: 'MOD-MECH-003',
│   │       #   mode: 'socratic',
│   │       #   trigger: 'r2_fail_3x',
│   │       #   messages: [
│   │       #     'Titik data mana yang paling jauh dari garismu?',
│   │       #     'Ada yang berbeda dari trial {{anomaly_trial_no}} dibanding lainnya?',
│   │       #     'Coba hapus trial itu dan tarik garis lagi — apa yang berubah?'
│   │       #   ]
│   │       # }
│   │
│   └── modes/
│       ├── micro-hint.ts                # Mode 1: visual hint logic (area highlight)
│       ├── socratic.ts                  # Mode 2: multi-turn dialogue state machine
│       └── reflection.ts                # Mode 3: confrontation + reconstruction flow
│
└── package.json
```

---

## 9. Curriculum Content (`packages/curriculum`)

```
packages/curriculum/
│
├── src/
│   ├── index.ts                         # Re-export semua modul + DAG
│   │
│   ├── modules/                         # Blueprint tiap modul (sesuai PRD-08)
│   │   │
│   │   ├── mekanika/
│   │   │   ├── bandul.module.ts         # Blueprint lengkap Bandul
│   │   │   ├── freefall.module.ts       # Blueprint Jatuh Bebas
│   │   │   ├── newton.module.ts         # Blueprint Hukum Newton
│   │   │   ├── tumbukan.module.ts       # Blueprint Tumbukan
│   │   │   ├── proyektil.module.ts      # Blueprint Proyektil
│   │   │   └── pegas.module.ts          # Blueprint Getaran Pegas
│   │   │
│   │   ├── listrik/
│   │   │   ├── ohm.module.ts
│   │   │   ├── kirchhoff.module.ts
│   │   │   ├── kapasitor.module.ts
│   │   │   └── faraday.module.ts
│   │   │
│   │   ├── modern/
│   │   │   ├── millikan.module.ts
│   │   │   ├── photoelectric.module.ts
│   │   │   ├── blackbody.module.ts
│   │   │   └── bohr-atom.module.ts
│   │   │
│   │   └── termal-optik/
│   │       ├── boyle.module.ts
│   │       ├── charles.module.ts
│   │       ├── lens.module.ts
│   │       └── young.module.ts
│   │
│   ├── concept-graph/
│   │   ├── nodes.ts                     # Semua node (module_id + label + position)
│   │   └── edges.ts                     # Semua edges DAG (from, to, edge_type)
│   │   #
│   │   # Contoh edges:
│   │   # { from: 'MOD-MECH-001', to: 'MOD-MECH-003', type: 'requires' }
│   │   # (Jatuh Bebas REQUIRES sebelum Bandul — prior knowledge g)
│   │   # { from: 'MOD-MECH-003', to: 'MOD-MECH-006', type: 'related_to' }
│   │   # (Bandul RELATED TO Pegas — keduanya SHM)
│   │   # { from: 'MOD-LISTRIK-001', to: 'MOD-LISTRIK-002', type: 'builds_on' }
│   │   # (Ohm BUILDS_ON ke Kirchhoff)
│   │
│   ├── hots-bank/                       # Bank soal HOTS per-modul (Pro)
│   │   ├── bandul.hots.ts               # 10 soal HOTS Bandul + answer + explanation
│   │   ├── ohm.hots.ts
│   │   ├── millikan.hots.ts
│   │   └── ...
│   │
│   └── misconceptions/                  # Database miskonsepsi (dari FCI/FMCE)
│       ├── mekanika.misconceptions.ts
│       ├── listrik.misconceptions.ts
│       └── modern.misconceptions.ts
│
└── package.json
```

### Format `*.module.ts`

```typescript
// packages/curriculum/src/modules/mekanika/bandul.module.ts

import { ModuleBlueprint } from '@fisikaseru/shared-types';

export const BandulModule: ModuleBlueprint = {
  id: 'MOD-MECH-003',
  category: 'mekanika',
  title: {
    scientific: 'Gerak Harmonis Sederhana — Bandul Matematis',
    b2c: 'Misteri Bandul: Hitung Gravitasi dari Kamarmu!',
  },
  tier: 'free',
  difficulty: 'L1',
  duration_estimate_min: { min: 12, max: 15 },

  curriculum_alignment: {
    kurikulum_merdeka: ['Kelas 11, Bab 5: Getaran'],
    utbk_topics: ['Gerak Periodik', 'Hukum Gravitasi Newton'],
    fci_items: [12, 15, 19, 21, 28],
  },

  prior_knowledge: [
    'Memahami konsep periode (T) dan frekuensi (f)',
    'Familiar dengan grafik linear dan gradien',
    'Mengetahui bahwa gravitasi menarik benda ke bawah',
  ],

  misconceptions: [
    {
      id: 'M1',
      statement: 'Beban lebih berat membuat bandul berayun lebih cepat',
      source: 'FCI Item 12',
      prevalence_pct: 62,
    },
    {
      id: 'M2',
      statement: 'Amplitudo lebih besar membuat bandul lebih cepat',
      source: 'FCI Item 15',
      prevalence_pct: 44,
    },
  ],

  atomic_learning_objectives: [
    {
      bloom_level: 'C3', // Apply
      verb: 'menghitung',
      object: 'nilai gravitasi Bumi',
      condition: 'dari gradien grafik T² vs L hasil eksperimen',
    },
    {
      bloom_level: 'C4', // Analyze
      verb: 'membuktikan',
      object: 'bahwa massa tidak memengaruhi periode bandul',
      condition: 'dengan membandingkan data trial berbeda massa',
    },
  ],

  insight_target: 'Siswa menghitung sendiri g ≈ 9.8 m/s² dari gradien grafik T² vs L, dan menyadari bahwa "hukum fisika" bisa ditemukan dari data—bukan hanya dari buku.',

  physics_model: {
    formula: 'T = 2 * Math.PI * Math.sqrt(L / g)',
    constants: { g: 9.80665 },
    noise_config: { variable: 'T', sigma_pct: 1.5 },
    validity_constraints: {
      theta_max_deg: 15,
      reason: 'Aproksimasi sin θ ≈ θ hanya valid untuk θ < 15°',
    },
  },

  variables: {
    independent: [
      {
        name: 'Panjang Tali',
        symbol: 'L',
        unit: 'm',
        min: 0.20, max: 2.00, default: 0.75, step: 0.05,
        tooltip: 'Panjang tali memengaruhi seberapa jauh bandul harus bergerak per ayunan',
      },
    ],
    controlled: [
      {
        name: 'Massa Beban',
        symbol: 'm',
        unit: 'g',
        options: [50, 100, 200, 500],
        default: 100,
        tooltip: 'Ubah ini antar trial untuk membuktikan sesuatu!',
      },
      {
        name: 'Sudut Awal',
        symbol: 'θ₀',
        unit: '°',
        min: 5, max: 15, default: 10, step: 1,
        tooltip: 'Di atas 20°, rumus T = 2π√(L/g) mulai tidak akurat',
      },
    ],
    dependent: [{ name: 'Periode', symbol: 'T', unit: 's' }],
  },

  step1: {
    question: 'Jika tali bandul dipanjangkan 2× lipat, ayunannya lebih cepat atau lebih lambat?',
    options: [
      { id: 'A', text: 'Lebih cepat', is_misconception: true, misconception_id: 'M1' },
      { id: 'B', text: 'Lebih lambat', is_correct: true },
      { id: 'C', text: 'Sama saja', is_misconception: true },
    ],
  },

  step4: {
    analysis_type: 'linear_regression',
    recommended_transform: 'T_squared_vs_L',
    gradient_interpretation: 'Gradien = 4π²/g → g = 4π² / gradien',
    r2_gate: 0.75,
  },

  step5: {
    confrontation_template: 'PREDIKSIMU: "{{prediction_text}}" | HASIL: {{conclusion_text}}',
    socratic_questions: [
      'Kenapa tali panjang membuat bandul lebih lambat — apa yang sebenarnya berubah?',
      'Bayangkan bandul di Bulan (g = 1.6 m/s²). Apa yang terjadi dengan T?',
      'Jadi, selain L, variabel apa yang bisa mengubah T menurut rumusmu?',
    ],
    reconstruct_validator: {
      required_terms: ['L', 'g', 'panjang', 'gravitasi'],
      min_terms: 2,
    },
  },

  step6: {
    flashcard_content: [
      { front: 'Apa rumus periode bandul matematis?', back: 'T = 2π√(L/g)' },
      { front: 'Apa arti gradien grafik T² vs L?', back: 'Gradien = 4π²/g → bisa cari g!' },
      { front: 'Apakah massa beban memengaruhi T?', back: 'Tidak! T hanya bergantung pada L dan g (Isochronisme Galileo)' },
    ],
    badge: { name: 'Penemu Galileo', icon: 'pendulum-gold' },
    historical_context: 'Galileo Galilei menemukan isochronisme bandul sekitar tahun 1602 — 400 tahun sebelum kamu membuktikannya hari ini.',
  },
};
```

---

## 10. Infrastructure & Config (`infra/`)

```
infra/
│
├── docker/
│   ├── pdf-worker/
│   │   ├── Dockerfile                   # Node 20-slim + TexLive slim + Typst
│   │   │   # FROM node:20-slim
│   │   │   # RUN apt-get install -y texlive-latex-base texlive-science
│   │   │   # RUN curl -sSL typst.sh | sh
│   │   │   # COPY . .
│   │   │   # RUN pnpm install --prod
│   │   │   # CMD ["node", "dist/worker.js"]
│   │   ├── .dockerignore
│   │   └── docker-compose.yml           # Local development dengan Redis
│   │
│   └── local-dev/
│       └── docker-compose.yml           # Redis + ClickHouse lokal untuk dev
│
├── supabase/
│   ├── config.toml                      # Supabase local dev config
│   └── seed.sql                         # Seed data untuk local dev
│
└── cloudflare/
    ├── wrangler.toml                    # Cloudflare Workers config (jika digunakan)
    └── r2-config.json                   # R2 bucket config untuk GLTF asset serving
```

---

## 11. Konvensi Kode & Naming

### File Naming

```
Komponen React     → PascalCase.tsx          (BandulScene.tsx)
Hooks              → camelCase.ts            (usePhysicsWorld.ts)
Stores (Zustand)   → camelCase.store.ts      (lab.store.ts)
Queries            → camelCase.queries.ts    (sessions.queries.ts)
Types              → camelCase.types.ts      (session.types.ts)
Config             → camelCase.config.ts     (modules.config.ts)
Templates          → camelCase.templates.ts  (bandul.templates.ts)
Module blueprints  → camelCase.module.ts     (bandul.module.ts)
SQL migrations     → NNN_description.sql     (002_sessions.sql)
API routes         → route.ts                (selalu route.ts di folder endpoint)
```

### TypeScript Conventions

```typescript
// ✅ Gunakan type untuk union/intersection
type Step = 1 | 2 | 3 | 4 | 5 | 6;
type TutorMode = 'micro_hint' | 'socratic' | 'reflection';

// ✅ Gunakan interface untuk object shapes
interface Trial {
  id: string;
  session_id: string;
  trial_no: number;
  variables: Record<string, number>;
  measured_value: number;
}

// ✅ Enum untuk konstanta yang butuh iteration
enum ModuleCategory {
  Mekanika = 'mekanika',
  Listrik = 'listrik',
  Modern = 'modern',
  Termal = 'termal',
}

// ✅ Zod untuk runtime validation + type inference
const TrialSchema = z.object({
  session_id: z.string().uuid(),
  trial_no: z.number().int().positive(),
  variables: z.record(z.number()),
  measured_value: z.number(),
});
type Trial = z.infer<typeof TrialSchema>;

// ❌ Hindari any
// ❌ Hindari non-null assertion (!) kecuali sangat terpaksa
// ✅ Gunakan optional chaining (?.) dan nullish coalescing (??)
```

### Component Conventions

```tsx
// ✅ Struktur komponen standar
interface DataSliderProps {
  label: string;
  symbol: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function DataSlider({
  label, symbol, unit, value, min, max, step, tooltip, onChange, disabled = false,
}: DataSliderProps) {
  // ... implementation
}

// ✅ Gunakan forwardRef jika komponen perlu forward ref ke DOM element
// ✅ Semua komponen harus ada di Storybook (jika Storybook digunakan)
// ✅ A11y: setiap komponen harus lulus axe-core sebelum merge
```

### Zustand Store Convention

```typescript
// ✅ Format store: state + actions dalam satu interface
interface LabStore {
  // State
  currentStep: Step;
  sessionId: string | null;
  trials: Trial[];
  predictionData: PredictionData | null;
  isPhysicsRunning: boolean;

  // Actions
  setStep: (step: Step) => void;
  addTrial: (trial: Omit<Trial, 'id'>) => void;
  setPrediction: (data: PredictionData) => void;
  resetSession: () => void;
}

export const useLabStore = create<LabStore>((set, get) => ({
  currentStep: 1,
  sessionId: null,
  trials: [],
  predictionData: null,
  isPhysicsRunning: false,

  setStep: (step) => set({ currentStep: step }),
  addTrial: (trial) => set((state) => ({ trials: [...state.trials, { id: crypto.randomUUID(), ...trial }] })),
  // ...
}));
```

---

## 12. Environment Variables

```bash
# apps/web/.env.local (tidak di-commit ke git)

# ── Supabase ──────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # Server-side only, JANGAN prefix NEXT_PUBLIC_

# ── Redis (Upstash) ───────────────────────────────────────────────
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# ── PostHog Analytics ─────────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://analytics.fisikaseru.id   # Self-hosted

# ── Sentry ────────────────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...              # Untuk source maps upload di CI

# ── App ───────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://fisikaseru.id
NEXT_PUBLIC_APP_VERSION=1.0.0

# ── Feature Flags ─────────────────────────────────────────────────
NEXT_PUBLIC_FF_CONCEPT_NETWORK=true
NEXT_PUBLIC_FF_OFFLINE_MODE=false         # Aktifkan setelah Q3 2025
NEXT_PUBLIC_FF_CLASSROOM_LINK=true

# apps/pdf-worker/.env (Railway environment)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=AX...
PDF_WORKER_CONCURRENCY=3                  # Jumlah job paralel per instance
SENTRY_DSN=https://...@sentry.io/...
```

---

## 13. Data Flow Diagrams

### 13.1 Lab Session Flow (Step 1–6)

```
User klik SimCard
      │
      ▼
GET /lab/[moduleId]
      │
      ├── Load ModuleBlueprint (curriculum package)
      ├── Create session di DB (POST /api/sessions)
      └── Generate seed (Math.random() → stored)
              │
              ▼
        LabOrchestrator
              │
    ┌─────── Step 1: Trigger ──────────────────────────────┐
    │  User pilih opsi → save to prediction_data (store)   │
    │  TIDAK ada feedback → lanjut ke Step 2               │
    └──────────────────────────────────────────────────────┘
              │
    ┌─────── Step 2: Setup ────────────────────────────────┐
    │  User geser slider → preview 3D update real-time     │
    │  Klik "Mulai" → inisialisasi PhysicsWorld            │
    └──────────────────────────────────────────────────────┘
              │
    ┌─────── Step 3: Experiment ───────────────────────────┐
    │  PhysicsWorld.step() @ 60Hz (Rapier WASM)            │
    │  User klik "Rekam Data":                             │
    │    1. Ambil true_value dari physics model            │
    │    2. Apply noise: obs = true + gaussian(σ)          │
    │    3. POST /api/trials → save to DB                  │
    │    4. Optimistic update: tambah ke LiveDataTable     │
    │  Setelah 5 trial → tombol "Analisis" aktif           │
    └──────────────────────────────────────────────────────┘
              │
    ┌─────── Step 4: Analysis ─────────────────────────────┐
    │  D3 scatter plot dari trial data                     │
    │  User drag regression line                           │
    │  useRegressionAnalysis: R², slope, intercept         │
    │  TutorTriggerEngine evaluate setiap attempt          │
    │  R² > 0.75 → gate terbuka → Step 5                  │
    └──────────────────────────────────────────────────────┘
              │
    ┌─────── Step 5: Reflect ──────────────────────────────┐
    │  ConfrontationCard: tampilkan prediction_data        │
    │  SocraticDialogue: 3 pertanyaan sekuensial           │
    │  ReconstructInput: user tulis → validate terms       │
    │  Save reflection_data ke DB (PATCH /api/sessions)   │
    └──────────────────────────────────────────────────────┘
              │
    ┌─────── Step 6: Report ───────────────────────────────┐
    │  Generate Eureka Card                                │
    │  POST /api/reports/queue → job_id di-return          │
    │  UI: "Sedang Menyusun Laporan..." (spinner)          │
    │  Subscribe Supabase Realtime: job status             │
    │  Status = 'completed' → tampilkan tombol download   │
    │  [Pro] Tampilkan HOTS soal preview + upsell         │
    └──────────────────────────────────────────────────────┘
```

### 13.2 PDF Generation Async Flow

```
Frontend                  API Route              Redis Queue           PDF Worker
    │                         │                      │                     │
    │ POST /api/reports/queue  │                      │                     │
    ├────────────────────────►│                      │                     │
    │                         │ validate payload     │                     │
    │                         │ enqueue job          │                     │
    │                         ├─────────────────────►│                     │
    │                         │ return { job_id }    │                     │
    │◄────────────────────────┤                      │                     │
    │                         │                      │ dequeue job         │
    │ UI: "Menyusun..."        │                      ├────────────────────►│
    │                         │                      │                     │ inject data ke .tex
    │                         │                      │                     │ run pdflatex (sandbox)
    │                         │                      │                     │ upload ke Supabase Storage
    │                         │                      │                     │ update job status = 'completed'
    │                         │                      │◄────────────────────┤
    │ [Supabase Realtime push] │                      │                     │
    │◄────────────────────────┤                      │                     │
    │ UI: tombol Download PDF  │                      │                     │
```

---

## 14. State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE LAYERS                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LAYER 1: Server State (TanStack Query)                     │
│  ─────────────────────────────────────                      │
│  • User profile + subscription status                       │
│  • Module blueprints (curriculum)                           │
│  • Flashcard deck + review schedule                         │
│  • Report history                                           │
│  • Concept network graph data                               │
│  Strategy: staleTime 5min | refetch on window focus         │
│                                                             │
│  LAYER 2: Global Client State (Zustand)                     │
│  ─────────────────────────────────────                      │
│  lab.store:     currentStep, sessionId, trials, prediction  │
│  physics.store: rigid bodies, observable values, seed       │
│  tutor.store:   mode, history, intervention count           │
│  ui.store:      sidebar open, modal state, active toast     │
│  user.store:    auth user, pro status (cached)              │
│                                                             │
│  LAYER 3: Local Component State (useState/useReducer)       │
│  ─────────────────────────────────────                      │
│  • Slider value (sebelum committed)                         │
│  • Regression line drag position                            │
│  • Form input values (sebelum submit)                       │
│  • Tooltip visibility                                       │
│                                                             │
│  LAYER 4: Persistent Offline State (IndexedDB via idb)     │
│  ─────────────────────────────────────                      │
│  • Trial data yang belum terkirim (background sync)         │
│  • Cached GLTF assets (via Service Worker Cache API)        │
│  • Session checkpoint (untuk resume setelah refresh)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 15. API Routes Specification

```
METHOD  PATH                              AUTH    TIER    DESCRIPTION
──────  ────────────────────────────────  ──────  ──────  ───────────────────────────────
POST    /api/sessions                     User    Free    Buat sesi lab baru
GET     /api/sessions/[id]                User    Free    Ambil data sesi
PATCH   /api/sessions/[id]                User    Free    Update step, reflection_data
POST    /api/trials                       User    Free    Rekam satu trial data
GET     /api/trials?session_id=[id]       User    Free    Ambil semua trial satu sesi
POST    /api/reports/queue                User    Free    Enqueue PDF generation job
GET     /api/reports/status?job_id=[id]   User    Free    Cek status PDF job
GET     /api/reports/[id]                 User    Free    Ambil detail laporan
POST    /api/reports/[id]/docx            User    Pro     Generate DOCX export
GET     /api/subscriptions                User    —       Cek status langganan
POST    /api/subscriptions/webhook        —       —       Payment gateway webhook
GET     /api/flashcards?module_id=[id]    User    Free    Ambil flashcard sesi terbaru
POST    /api/flashcards/review            User    Pro     Submit review result (spaced rep)
POST    /api/classroom                    User    Pro     Buat classroom link baru
GET     /api/classroom/[linkId]           User    Pro     Detail classroom link
DELETE  /api/classroom/[linkId]           User    Pro     Hapus/deactivate link
GET     /api/classroom/[linkId]/students  User    Pro     Daftar siswa + hasil
POST    /api/analytics                    User    —       Track event ke PostHog
GET     /api/modules                      —       —       Public: daftar semua modul (SSG)
GET     /api/modules/[id]                 —       —       Public: detail blueprint modul
GET     /api/concept-graph                User    Free    Ambil DAG Concept Network
GET     /api/concept-graph/path?goal=[id] User    Pro     Generate learning path ke goal
```

### Response Format (Standard)

```typescript
// Success
{
  "data": { ... },
  "meta": { "timestamp": "2025-01-15T07:00:00Z" }
}

// Error
{
  "error": {
    "code": "SESSION_NOT_FOUND",    // Machine-readable
    "message": "Sesi tidak ditemukan atau sudah kedaluwarsa.",  // Human-readable (id-ID)
    "details": { ... }              // Optional: context tambahan
  }
}

// HTTP Status Codes:
// 200 OK           — request berhasil
// 201 Created      — resource baru dibuat
// 400 Bad Request  — payload tidak valid (Zod validation fail)
// 401 Unauthorized — tidak ada/invalid auth token
// 403 Forbidden    — auth valid tapi tidak punya akses (misal: fitur Pro)
// 404 Not Found    — resource tidak ditemukan
// 429 Too Many Req — rate limit (100 req/min per IP untuk public endpoints)
// 500 Server Error — unexpected error (selalu di-log ke Sentry)
```

---

*Design Document versi 1.0 — FisikaSeru — 2025*
*Update dokumen ini setiap ada perubahan arsitektur signifikan. Buat ADR (Architecture Decision Record) di `docs/adr/` untuk keputusan besar.*

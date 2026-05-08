/**
 * FisikaSeru 3.0 — Design Tokens
 * All design tokens as TypeScript constants for programmatic use.
 * CSS variables are defined in globals.css for Tailwind integration.
 */

export const colors = {
  // Brand
  primaryNavy: "#14213D",
  accentCobalt: "#1B4FD8",
  skyBlue: "#3B9EE2",
  teal: "#0D7C6B",
  amber: "#D97706",
  rose: "#C0392B",
  violet: "#5B21B6",

  // Backgrounds
  bgLight: "#F8FAFC",
  bgDark: "#0F172A",
  surfaceLight: "#FFFFFF",
  surfaceDark: "#1E293B",

  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",

  // Text
  textPrimary: "#1F2937",
  textMuted: "#6B7280",
  textInverse: "#FFFFFF",

  // Data Visualization
  dataValid: "#10B981",
  dataOutlier: "#F59E0B",
  regression: "#14213D",
  confidence: "rgba(59, 158, 226, 0.15)",

  // Zones
  zoneSafe: "#10B981",
  zoneSoft: "#F59E0B",
  zoneHard: "#EF4444",
} as const;

export const fonts = {
  display: "'Sora', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const radius = {
  sm: "4px",
  base: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.08)",
  base: "0 4px 12px rgba(0,0,0,0.08)",
  depth: "0 4px 24px rgba(0,0,0,0.10)",
  heavy: "0 8px 40px rgba(0,0,0,0.15)",
  inset: "inset 0 2px 4px rgba(0,0,0,0.06)",
} as const;

export const transitions = {
  fast: "100ms ease-out",
  base: "200ms ease-out",
  slow: "300ms ease-out",
  spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const layout = {
  sidebarLeftWidth: "280px",
  sidebarRightWidth: "280px",
  canvasMinWidth: "600px",
  navbarHeight: "64px",
  mobileTabbarHeight: "60px",
} as const;

export const motionPresets = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.08 } },
  },
} as const;

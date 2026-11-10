import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ThemeColors {
  brand: string
  sidebar: string
  canvas: string
  surface: string
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
  brand: '#3D6B5E',
  sidebar: '#2B2F33',
  canvas: '#F5F2EC',
  surface: '#FFFFFF',
}

const LEGACY_PALETTES: Record<string, ThemeColors> = {
  emerald: DEFAULT_THEME_COLORS,
  navy: { brand: '#1F5A7A', sidebar: '#1B2430', canvas: '#F4F6F8', surface: '#FFFFFF' },
  bronze: { brand: '#8A6A3B', sidebar: '#2C2824', canvas: '#F6F1E8', surface: '#FFFFFF' },
  teal: { brand: '#2A6F6A', sidebar: '#1E2C2E', canvas: '#F3F6F5', surface: '#FFFFFF' },
  wine: { brand: '#7A4450', sidebar: '#2B2628', canvas: '#F6F2F0', surface: '#FFFFFF' },
}

const BASE_STATUS: Record<string, string> = {
  '--color-accent-50': '#EEF6F1',
  '--color-accent-100': '#D5E9DC',
  '--color-accent-500': '#2F6B4F',
  '--color-accent-600': '#24553E',
  '--color-warning-50': '#F8F1E4',
  '--color-warning-100': '#F0E2C4',
  '--color-warning-500': '#B45309',
  '--color-warning-600': '#92400E',
  '--color-danger-50': '#F7EBE9',
  '--color-danger-100': '#EDD4D0',
  '--color-danger-500': '#B42318',
  '--color-danger-600': '#912018',
  '--color-info-50': '#EEF2F5',
  '--color-info-100': '#D7E0E8',
  '--color-info-500': '#3B6B8C',
  '--color-info-600': '#2F5570',
}

export function normalizeHex(raw: string): string | null {
  const v = raw.trim()
  const m = /^#?([0-9a-fA-F]{6})$/.exec(v)
  if (!m) return null
  return `#${m[1].toUpperCase()}`
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t)
}

function luma(hex: string) {
  const [r, g, b] = hexToRgb(hex)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export function applyThemeColors(colors: ThemeColors) {
  const brand = normalizeHex(colors.brand) ?? DEFAULT_THEME_COLORS.brand
  const sidebar = normalizeHex(colors.sidebar) ?? DEFAULT_THEME_COLORS.sidebar
  const canvas = normalizeHex(colors.canvas) ?? DEFAULT_THEME_COLORS.canvas
  const surface = normalizeHex(colors.surface) ?? DEFAULT_THEME_COLORS.surface

  const canvasLight = luma(canvas) > 0.55
  const sidebarLight = luma(sidebar) > 0.55
  const brandLight = luma(brand) > 0.62

  const textPrimary = canvasLight
    ? (luma(sidebar) > 0.5 ? '#2B2F33' : sidebar)
    : mix(canvas, '#FFFFFF', 0.9)
  const textSecondary = mix(textPrimary, canvas, 0.32)
  const textMuted = mix(textPrimary, canvas, 0.52)
  const border = mix(canvas, textPrimary, 0.14)
  const borderSubtle = mix(canvas, textPrimary, 0.08)
  const surface2 = mix(canvas, textPrimary, 0.04)
  const surface3 = mix(canvas, textPrimary, 0.09)

  const brandHover = mix(brand, '#000000', 0.16)
  const brandSoft = mix(brand, canvasLight ? '#FFFFFF' : canvas, 0.86)
  const brandText = mix(brand, '#000000', 0.22)

  const vars: Record<string, string> = {
    ...BASE_STATUS,
    '--color-primary-50': mix(brand, '#FFFFFF', 0.9),
    '--color-primary-100': mix(brand, '#FFFFFF', 0.78),
    '--color-primary-200': mix(brand, '#FFFFFF', 0.58),
    '--color-primary-500': brand,
    '--color-primary-600': brandHover,
    '--color-primary-700': mix(brand, '#000000', 0.28),
    '--color-neutral-50': canvas,
    '--color-neutral-100': surface2,
    '--color-neutral-200': border,
    '--color-neutral-300': mix(canvas, textPrimary, 0.22),
    '--color-neutral-400': textMuted,
    '--color-neutral-500': mix(textPrimary, canvas, 0.42),
    '--color-neutral-600': textSecondary,
    '--color-neutral-700': mix(textPrimary, canvas, 0.18),
    '--color-neutral-800': mix(textPrimary, canvas, 0.08),
    '--color-neutral-900': textPrimary,
    '--color-surface': surface,
    '--color-surface-2': surface2,
    '--color-surface-3': surface3,
    '--color-bg': canvas,
    '--color-border': border,
    '--color-border-subtle': borderSubtle,
    '--color-text-primary': textPrimary,
    '--color-text-secondary': textSecondary,
    '--color-text-muted': textMuted,
    '--color-cta-bg': brand,
    '--color-cta-hover': brandHover,
    '--color-cta-text': brandLight ? '#1C1E21' : '#FFFFFF',
    '--color-brand': brand,
    '--color-brand-hover': brandHover,
    '--color-brand-soft': brandSoft,
    '--color-brand-text': brandText,
    '--color-sidebar': sidebar,
    '--color-sidebar-hover': sidebarLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
    '--color-sidebar-text': sidebarLight ? '#2B2F33' : '#F7F5F2',
    '--color-sidebar-muted': sidebarLight ? 'rgba(43,47,51,0.55)' : 'rgba(247,245,242,0.55)',
    '--color-sidebar-active': brand,
  }

  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value))
  root.setAttribute('data-palette', 'custom')
}

interface PaletteStore {
  colors: ThemeColors
  setColor: (key: keyof ThemeColors, hex: string) => void
  resetColors: () => void
}

export const usePaletteStore = create<PaletteStore>()(
  persist(
    (set, get) => ({
      colors: { ...DEFAULT_THEME_COLORS },
      setColor: (key, hex) => {
        const next = { ...get().colors, [key]: hex }
        applyThemeColors(next)
        set({ colors: next })
      },
      resetColors: () => {
        applyThemeColors(DEFAULT_THEME_COLORS)
        set({ colors: { ...DEFAULT_THEME_COLORS } })
      },
    }),
    {
      name: 'auditlens-palette',
      partialize: (s) => ({ colors: s.colors }),
      merge: (persisted, current) => {
        const p = persisted as { colors?: ThemeColors; paletteId?: string } | undefined
        if (p?.colors?.brand) return { ...current, colors: { ...DEFAULT_THEME_COLORS, ...p.colors } }
        if (p?.paletteId && LEGACY_PALETTES[p.paletteId]) {
          return { ...current, colors: { ...LEGACY_PALETTES[p.paletteId] } }
        }
        return current
      },
    },
  ),
)

export function initPalette() {
  const raw = localStorage.getItem('auditlens-palette')
  try {
    const parsed = JSON.parse(raw ?? '{}')
    const state = parsed?.state ?? {}
    if (state.colors?.brand) applyThemeColors({ ...DEFAULT_THEME_COLORS, ...state.colors })
    else if (state.paletteId && LEGACY_PALETTES[state.paletteId]) applyThemeColors(LEGACY_PALETTES[state.paletteId])
    else applyThemeColors(DEFAULT_THEME_COLORS)
  } catch {
    applyThemeColors(DEFAULT_THEME_COLORS)
  }
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ThemeSettings {
  // Background
  bgColor: string
  bgOpacity: number

  // Text
  textColor: string
  fontSize: 'small' | 'medium' | 'large'

  // Accent
  accentColor: string

  // Effects
  blur: boolean
  shadow: boolean
  borderRadius: 'none' | 'small' | 'medium' | 'large'
}

interface ThemeActions {
  setThemeSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void
  resetTheme: () => void
  applyPreset: (preset: ThemePreset) => void
}

export type ThemePreset = 'default' | 'dark' | 'light' | 'neon' | 'broadcast' | 'minimal'

const defaultTheme: ThemeSettings = {
  bgColor: '#000000',
  bgOpacity: 0.85,
  textColor: '#ffffff',
  fontSize: 'medium',
  accentColor: '#3b82f6',
  blur: true,
  shadow: true,
  borderRadius: 'medium',
}

const presets: Record<ThemePreset, ThemeSettings> = {
  default: defaultTheme,
  dark: {
    bgColor: '#0d0d1a',
    bgOpacity: 0.95,
    textColor: '#ffffff',
    fontSize: 'medium',
    accentColor: '#60a5fa',
    blur: true,
    shadow: true,
    borderRadius: 'medium',
  },
  light: {
    bgColor: '#ffffff',
    bgOpacity: 0.95,
    textColor: '#1f2937',
    fontSize: 'medium',
    accentColor: '#2563eb',
    blur: true,
    shadow: true,
    borderRadius: 'medium',
  },
  neon: {
    bgColor: '#0f0f23',
    bgOpacity: 0.9,
    textColor: '#00ff88',
    fontSize: 'medium',
    accentColor: '#ff00ff',
    blur: true,
    shadow: true,
    borderRadius: 'small',
  },
  broadcast: {
    bgColor: '#1a1a2e',
    bgOpacity: 0.95,
    textColor: '#ffffff',
    fontSize: 'large',
    accentColor: '#ef4444',
    blur: false,
    shadow: true,
    borderRadius: 'small',
  },
  minimal: {
    bgColor: '#000000',
    bgOpacity: 0.7,
    textColor: '#ffffff',
    fontSize: 'small',
    accentColor: '#ffffff',
    blur: false,
    shadow: false,
    borderRadius: 'none',
  },
}

export const useThemeStore = create<ThemeSettings & ThemeActions>()(
  persist(
    (set) => ({
      ...defaultTheme,

      setThemeSetting: (key, value) => {
        set({ [key]: value })
      },

      resetTheme: () => {
        set(defaultTheme)
      },

      applyPreset: (preset: ThemePreset) => {
        set(presets[preset])
      },
    }),
    {
      name: 'lacrosse-theme-storage',
    }
  )
)

// Helper function to generate CSS variables from theme
export function getThemeCSSVariables(theme: ThemeSettings): Record<string, string> {
  const fontSizes = {
    small: { team: '14px', score: '24px', time: '18px' },
    medium: { team: '16px', score: '28px', time: '20px' },
    large: { team: '20px', score: '36px', time: '24px' },
  }

  const borderRadii = {
    none: '0px',
    small: '4px',
    medium: '8px',
    large: '16px',
  }

  return {
    '--theme-bg': `rgba(${hexToRgb(theme.bgColor)}, ${theme.bgOpacity})`,
    '--theme-text': theme.textColor,
    '--theme-accent': theme.accentColor,
    '--theme-team-size': fontSizes[theme.fontSize].team,
    '--theme-score-size': fontSizes[theme.fontSize].score,
    '--theme-time-size': fontSizes[theme.fontSize].time,
    '--theme-radius': borderRadii[theme.borderRadius],
    '--theme-blur': theme.blur ? 'blur(10px)' : 'none',
    '--theme-shadow': theme.shadow ? '0 4px 16px rgba(0, 0, 0, 0.4)' : 'none',
  }
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '0, 0, 0'
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
}

// Parse URL params into theme overrides
export function parseThemeFromURL(): Partial<ThemeSettings> {
  const params = new URLSearchParams(window.location.search)
  const overrides: Partial<ThemeSettings> = {}

  const bgColor = params.get('bgColor')
  if (bgColor && /^[0-9A-Fa-f]{6}$/.test(bgColor)) {
    overrides.bgColor = `#${bgColor}`
  }

  const bgOpacity = params.get('bgOpacity')
  if (bgOpacity) {
    const opacity = parseFloat(bgOpacity)
    if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
      overrides.bgOpacity = opacity
    }
  }

  const textColor = params.get('textColor')
  if (textColor && /^[0-9A-Fa-f]{6}$/.test(textColor)) {
    overrides.textColor = `#${textColor}`
  }

  const fontSize = params.get('fontSize')
  if (fontSize && ['small', 'medium', 'large'].includes(fontSize)) {
    overrides.fontSize = fontSize as ThemeSettings['fontSize']
  }

  const accentColor = params.get('accentColor')
  if (accentColor && /^[0-9A-Fa-f]{6}$/.test(accentColor)) {
    overrides.accentColor = `#${accentColor}`
  }

  const blur = params.get('blur')
  if (blur !== null) {
    overrides.blur = blur !== 'false'
  }

  const shadow = params.get('shadow')
  if (shadow !== null) {
    overrides.shadow = shadow !== 'false'
  }

  const preset = params.get('preset')
  if (preset && preset in presets) {
    return { ...presets[preset as ThemePreset], ...overrides }
  }

  return overrides
}

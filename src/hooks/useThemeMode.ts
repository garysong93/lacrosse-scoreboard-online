import { useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeModeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const useThemeModeStore = create<ThemeModeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      setMode: (mode: ThemeMode) => set({ mode }),
    }),
    {
      name: 'lacrosse-app-theme-mode',
    }
  )
)

// Get effective theme (resolves 'system' to actual value)
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useThemeMode() {
  const { mode, setMode } = useThemeModeStore()

  // Get the effective theme (resolving 'system' to actual value)
  const effectiveTheme = useMemo(() => {
    if (mode === 'system') {
      return getSystemTheme()
    }
    return mode
  }, [mode])

  // Apply theme to document
  useEffect(() => {
    const theme = mode === 'system' ? getSystemTheme() : mode
    document.documentElement.setAttribute('data-theme', theme)
  }, [mode])

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      document.documentElement.setAttribute('data-theme', getSystemTheme())
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mode])

  return {
    mode,
    effectiveTheme,
    setMode,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
  }
}

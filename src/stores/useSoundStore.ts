import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SoundSettings {
  enabled: boolean
  volume: number // 0-1
  goalHorn: boolean
  buzzer: boolean
  shotClockWarning: boolean
}

interface SoundState extends SoundSettings {
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  setGoalHorn: (enabled: boolean) => void
  setBuzzer: (enabled: boolean) => void
  setShotClockWarning: (enabled: boolean) => void
  toggleEnabled: () => void
}

const defaultSettings: SoundSettings = {
  enabled: true,
  volume: 0.7,
  goalHorn: true,
  buzzer: true,
  shotClockWarning: true,
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setEnabled: (enabled: boolean) => set({ enabled }),
      setVolume: (volume: number) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      setGoalHorn: (enabled: boolean) => set({ goalHorn: enabled }),
      setBuzzer: (enabled: boolean) => set({ buzzer: enabled }),
      setShotClockWarning: (enabled: boolean) => set({ shotClockWarning: enabled }),
      toggleEnabled: () => set((state) => ({ enabled: !state.enabled })),
    }),
    {
      name: 'lacrosse-sound-settings',
    }
  )
)

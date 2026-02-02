import { useCallback, useRef, useEffect } from 'react'
import { useSoundStore } from '../stores/useSoundStore'

type SoundType = 'goal' | 'buzzer' | 'shotClockWarning'

// Audio context singleton
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

// Synthesized sound generators
function playGoalHornSound(volume: number) {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // Goal horn: triumphant dual-tone horn
  const frequencies = [349.23, 440, 523.25] // F4, A4, C5 - Major chord
  const duration = 1.5

  frequencies.forEach((freq, i) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(freq, now)

    // Envelope
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + 0.05)
    gainNode.gain.setValueAtTime(volume * 0.3, now + duration - 0.3)
    gainNode.gain.linearRampToValueAtTime(0, now + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(now + i * 0.02)
    oscillator.stop(now + duration)
  })

  // Add a powerful low frequency
  const bassOsc = ctx.createOscillator()
  const bassGain = ctx.createGain()
  bassOsc.type = 'sine'
  bassOsc.frequency.setValueAtTime(87.31, now) // F2
  bassGain.gain.setValueAtTime(0, now)
  bassGain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.1)
  bassGain.gain.setValueAtTime(volume * 0.4, now + duration - 0.3)
  bassGain.gain.linearRampToValueAtTime(0, now + duration)
  bassOsc.connect(bassGain)
  bassGain.connect(ctx.destination)
  bassOsc.start(now)
  bassOsc.stop(now + duration)
}

function playBuzzerSound(volume: number) {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  const duration = 1.2

  // Buzzer: harsh buzzing sound
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(220, now) // A3

  // Add some frequency modulation for harshness
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.setValueAtTime(30, now)
  lfoGain.gain.setValueAtTime(20, now)
  lfo.connect(lfoGain)
  lfoGain.connect(oscillator.frequency)
  lfo.start(now)
  lfo.stop(now + duration)

  // Envelope
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.02)
  gainNode.gain.setValueAtTime(volume * 0.5, now + duration - 0.1)
  gainNode.gain.linearRampToValueAtTime(0, now + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration)
}

function playShotClockWarningSound(volume: number) {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // Shot clock warning: rapid beeps
  const beepCount = 3
  const beepDuration = 0.15
  const beepGap = 0.1
  const frequency = 880 // A5

  for (let i = 0; i < beepCount; i++) {
    const startTime = now + i * (beepDuration + beepGap)

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, startTime)

    // Quick envelope
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.01)
    gainNode.gain.setValueAtTime(volume * 0.4, startTime + beepDuration - 0.02)
    gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(startTime)
    oscillator.stop(startTime + beepDuration)
  }
}

export function useSoundManager() {
  const { enabled, volume, goalHorn, buzzer, shotClockWarning } = useSoundStore()

  // Track if audio context is unlocked (for mobile)
  const audioUnlocked = useRef(false)

  // Track shot clock warning to avoid repeated plays
  const shotClockWarningPlayed = useRef(false)

  // Unlock audio context on first user interaction (for mobile)
  useEffect(() => {
    const unlockAudio = async () => {
      if (audioUnlocked.current) return

      try {
        const ctx = getAudioContext()
        if (ctx.state === 'suspended') {
          await ctx.resume()
        }
        audioUnlocked.current = true
      } catch {
        // Ignore errors - user interaction wasn't sufficient
      }
    }

    // Listen for user interaction
    const events = ['click', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio)
      })
    }
  }, [])

  // Core play function
  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return

    // Check individual sound settings
    if (type === 'goal' && !goalHorn) return
    if (type === 'buzzer' && !buzzer) return
    if (type === 'shotClockWarning' && !shotClockWarning) return

    try {
      // Resume audio context if suspended
      const ctx = getAudioContext()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      // Play the appropriate synthesized sound
      switch (type) {
        case 'goal':
          playGoalHornSound(volume)
          break
        case 'buzzer':
          playBuzzerSound(volume)
          break
        case 'shotClockWarning':
          playShotClockWarningSound(volume)
          break
      }
    } catch (error) {
      console.warn(`Failed to play ${type} sound:`, error)
    }
  }, [enabled, volume, goalHorn, buzzer, shotClockWarning])

  // Convenience methods
  const playGoalHorn = useCallback(() => {
    playSound('goal')
  }, [playSound])

  const playBuzzer = useCallback(() => {
    playSound('buzzer')
  }, [playSound])

  const playShotClockWarning = useCallback(() => {
    playSound('shotClockWarning')
  }, [playSound])

  // Shot clock warning with debounce (only play once per warning period)
  const checkShotClockWarning = useCallback((shotClock: number, isRunning: boolean) => {
    if (shotClock === 10 && isRunning && !shotClockWarningPlayed.current) {
      playShotClockWarning()
      shotClockWarningPlayed.current = true
    }

    // Reset when shot clock goes above 10
    if (shotClock > 10) {
      shotClockWarningPlayed.current = false
    }
  }, [playShotClockWarning])

  // Reset shot clock warning state (call when shot clock is reset)
  const resetShotClockWarning = useCallback(() => {
    shotClockWarningPlayed.current = false
  }, [])

  return {
    playGoalHorn,
    playBuzzer,
    playShotClockWarning,
    checkShotClockWarning,
    resetShotClockWarning,
    isEnabled: enabled,
  }
}

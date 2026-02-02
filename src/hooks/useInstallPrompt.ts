import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Check if already installed
  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true)
    }

    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      const dismissedAt = parseInt(wasDismissed, 10)
      // Only show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
      }
    }
  }, [])

  // Listen for install prompt event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setIsInstallable(false)

    return outcome === 'accepted'
  }, [deferredPrompt])

  const dismissBanner = useCallback(() => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }, [])

  return {
    isInstallable: isInstallable && !isInstalled && !dismissed,
    isInstalled,
    promptInstall,
    dismissBanner,
  }
}

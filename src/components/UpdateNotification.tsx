import { useEffect, useState, useCallback } from 'react'

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Check if service worker is available
    if (!('serviceWorker' in navigator)) return

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        setRegistration(reg)
        setShowUpdate(true)
      }
    }

    // Listen for new service worker
    navigator.serviceWorker.ready.then((reg) => {
      // Check if there's already a waiting worker
      if (reg.waiting) {
        handleUpdate(reg)
      }

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleUpdate(reg)
            }
          })
        }
      })
    })

    // Check for updates periodically (every hour)
    const interval = setInterval(() => {
      navigator.serviceWorker.ready.then((reg) => {
        reg.update()
      })
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const handleUpdate = useCallback(() => {
    if (registration?.waiting) {
      // Tell the waiting service worker to take over
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      // Reload the page to use new version
      window.location.reload()
    }
  }, [registration])

  const handleDismiss = useCallback(() => {
    setShowUpdate(false)
  }, [])

  if (!showUpdate) return null

  return (
    <div className="update-banner">
      <span className="update-icon">🔄</span>
      <span className="update-text">A new version is available!</span>
      <div className="update-actions">
        <button className="update-btn primary" onClick={handleUpdate}>
          Update now
        </button>
        <button className="update-btn secondary" onClick={handleDismiss}>
          Later
        </button>
      </div>
    </div>
  )
}

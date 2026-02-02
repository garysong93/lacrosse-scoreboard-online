import { useState, useEffect, useCallback } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    if (wasOffline) {
      setShowReconnected(true)
      // Auto-hide reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000)
    }
  }, [wasOffline])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    setWasOffline(true)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  const dismissReconnected = useCallback(() => {
    setShowReconnected(false)
  }, [])

  return {
    isOnline,
    isOffline: !isOnline,
    showReconnected,
    dismissReconnected,
  }
}

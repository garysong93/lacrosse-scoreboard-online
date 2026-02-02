import { useEffect, useState } from 'react'
import App from './App'
import { OBSOverlayPage } from './components/OBSOverlay'
import { MobileControlPage } from './components/MobileControl'

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // OBS Overlay route
  if (currentPath === '/obs' || currentPath === '/obs/') {
    return <OBSOverlayPage />
  }

  // Mobile Control route
  if (currentPath === '/control' || currentPath === '/control/') {
    return <MobileControlPage />
  }

  // Default: Main scoreboard
  return <App />
}

export default Router

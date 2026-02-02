import { useEffect, useState } from 'react'
import { HomePage } from './pages/HomePage'
import { RulesPage } from './pages/RulesPage'
import { TutorialPage } from './pages/TutorialPage'
import { FAQPage } from './pages/FAQPage'
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

  // Normalize path (remove trailing slash except for root)
  const normalizedPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '')

  // OBS Overlay route
  if (normalizedPath === '/obs') {
    return <OBSOverlayPage />
  }

  // Mobile Control route
  if (normalizedPath === '/control') {
    return <MobileControlPage />
  }

  // Rules page
  if (normalizedPath === '/rules') {
    return <RulesPage />
  }

  // Tutorial page
  if (normalizedPath === '/tutorial') {
    return <TutorialPage />
  }

  // FAQ page
  if (normalizedPath === '/faq') {
    return <FAQPage />
  }

  // Default: Home page with scoreboard
  return <HomePage />
}

export default Router

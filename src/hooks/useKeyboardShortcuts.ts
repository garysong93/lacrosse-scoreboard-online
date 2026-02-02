import { useEffect, useCallback } from 'react'

export interface KeyboardAction {
  key: string
  altKey?: string // Alternative key
  description: string
  action: () => void
  category: 'timer' | 'scoring' | 'navigation' | 'other'
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  isModalOpen?: boolean
}

export function useKeyboardShortcuts(
  actions: KeyboardAction[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, isModalOpen = false } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle shortcuts if disabled
      if (!enabled) return

      // Don't handle shortcuts when typing in input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Don't override browser shortcuts (Ctrl+/Cmd+)
      if (event.ctrlKey || event.metaKey) {
        return
      }

      // Handle Escape separately - it should work even in modals
      if (event.key === 'Escape') {
        const escapeAction = actions.find(a => a.key === 'Escape')
        if (escapeAction) {
          event.preventDefault()
          escapeAction.action()
        }
        return
      }

      // Don't handle other shortcuts when modal is open (except Escape)
      if (isModalOpen) return

      // Find matching action
      const normalizedKey = event.key.toLowerCase()
      const action = actions.find(
        (a) =>
          a.key.toLowerCase() === normalizedKey ||
          (a.altKey && a.altKey.toLowerCase() === normalizedKey)
      )

      if (action) {
        event.preventDefault()
        action.action()
      }
    },
    [actions, enabled, isModalOpen]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

// Helper to get shortcuts grouped by category
export function getShortcutsByCategory(actions: KeyboardAction[]) {
  const categories: Record<string, KeyboardAction[]> = {
    timer: [],
    scoring: [],
    navigation: [],
    other: [],
  }

  actions.forEach((action) => {
    if (categories[action.category]) {
      categories[action.category].push(action)
    }
  })

  return categories
}

// Format key for display
export function formatKeyForDisplay(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
    Escape: 'Esc',
  }
  return keyMap[key] || key.toUpperCase()
}

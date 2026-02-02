import type { KeyboardAction } from '../hooks/useKeyboardShortcuts'
import { getShortcutsByCategory, formatKeyForDisplay } from '../hooks/useKeyboardShortcuts'

interface KeyboardShortcutsHelpProps {
  actions: KeyboardAction[]
  onClose: () => void
}

const categoryLabels: Record<string, string> = {
  timer: 'Timer Controls',
  scoring: 'Scoring & Stats',
  navigation: 'Navigation',
  other: 'Other',
}

export function KeyboardShortcutsHelp({ actions, onClose }: KeyboardShortcutsHelpProps) {
  const grouped = getShortcutsByCategory(actions)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Keyboard Shortcuts</h3>
        <div className="shortcuts-help">
          {Object.entries(grouped).map(([category, categoryActions]) => {
            if (categoryActions.length === 0) return null
            return (
              <div key={category} className="shortcuts-group">
                <div className="shortcuts-group-title">{categoryLabels[category]}</div>
                {categoryActions.map((action) => (
                  <div key={action.key} className="shortcut-row">
                    <div className="shortcut-keys">
                      <span className="shortcut-key">{formatKeyForDisplay(action.key)}</span>
                      {action.altKey && (
                        <>
                          <span style={{ opacity: 0.5 }}>/</span>
                          <span className="shortcut-key">{formatKeyForDisplay(action.altKey)}</span>
                        </>
                      )}
                    </div>
                    <span className="shortcut-desc">{action.description}</span>
                  </div>
                ))}
              </div>
            )
          })}
          <div className="shortcuts-hint">
            Press <span className="shortcut-key" style={{ display: 'inline-flex', margin: '0 0.25rem' }}>?</span> anytime to show this help
          </div>
        </div>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

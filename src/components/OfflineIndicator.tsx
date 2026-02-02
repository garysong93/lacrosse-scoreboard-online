interface OfflineIndicatorProps {
  isOffline: boolean
  showReconnected: boolean
  onDismissReconnected: () => void
}

export function OfflineIndicator({
  isOffline,
  showReconnected,
  onDismissReconnected,
}: OfflineIndicatorProps) {
  if (!isOffline && !showReconnected) return null

  return (
    <div className={`connection-banner ${isOffline ? 'offline' : 'reconnected'}`}>
      {isOffline ? (
        <>
          <span className="connection-icon">📴</span>
          <span>You're offline - changes will sync when reconnected</span>
        </>
      ) : (
        <>
          <span className="connection-icon">✅</span>
          <span>Back online!</span>
          <button className="connection-dismiss" onClick={onDismissReconnected}>
            ×
          </button>
        </>
      )}
    </div>
  )
}

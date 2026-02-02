interface InstallBannerProps {
  onInstall: () => void
  onDismiss: () => void
}

export function InstallBanner({ onInstall, onDismiss }: InstallBannerProps) {
  return (
    <div className="install-banner">
      <div className="install-banner-content">
        <span className="install-icon">📱</span>
        <div className="install-text">
          <strong>Install App</strong>
          <span>Use offline & get faster access</span>
        </div>
      </div>
      <div className="install-actions">
        <button className="install-btn primary" onClick={onInstall}>
          Install
        </button>
        <button className="install-btn secondary" onClick={onDismiss}>
          Not now
        </button>
      </div>
    </div>
  )
}

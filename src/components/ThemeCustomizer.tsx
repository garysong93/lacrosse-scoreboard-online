import { useThemeStore, type ThemePreset } from '../stores/useThemeStore'

interface ThemeCustomizerProps {
  onClose: () => void
}

export function ThemeCustomizer({ onClose }: ThemeCustomizerProps) {
  const theme = useThemeStore()

  const presets: { id: ThemePreset; name: string; description: string }[] = [
    { id: 'default', name: 'Default', description: 'Standard dark theme' },
    { id: 'dark', name: 'Dark Pro', description: 'Deep dark with blue accents' },
    { id: 'light', name: 'Light', description: 'Clean light theme' },
    { id: 'neon', name: 'Neon', description: 'Cyberpunk style' },
    { id: 'broadcast', name: 'Broadcast', description: 'TV-ready large text' },
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide-modal theme-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Customize Theme</h3>

        {/* Presets */}
        <div className="theme-section">
          <label className="theme-label">Presets</label>
          <div className="preset-grid">
            {presets.map((preset) => (
              <button
                key={preset.id}
                className="preset-btn"
                onClick={() => theme.applyPreset(preset.id)}
              >
                <span className="preset-name">{preset.name}</span>
                <span className="preset-desc">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="theme-section">
          <label className="theme-label">Colors</label>
          <div className="color-controls">
            <div className="color-control">
              <label>Background</label>
              <input
                type="color"
                value={theme.bgColor}
                onChange={(e) => theme.setThemeSetting('bgColor', e.target.value)}
              />
            </div>
            <div className="color-control">
              <label>Text</label>
              <input
                type="color"
                value={theme.textColor}
                onChange={(e) => theme.setThemeSetting('textColor', e.target.value)}
              />
            </div>
            <div className="color-control">
              <label>Accent</label>
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => theme.setThemeSetting('accentColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Opacity */}
        <div className="theme-section">
          <label className="theme-label">Background Opacity: {Math.round(theme.bgOpacity * 100)}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={theme.bgOpacity * 100}
            onChange={(e) => theme.setThemeSetting('bgOpacity', parseInt(e.target.value) / 100)}
            className="opacity-slider"
          />
        </div>

        {/* Font Size */}
        <div className="theme-section">
          <label className="theme-label">Font Size</label>
          <div className="setting-buttons">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                className={`setting-btn ${theme.fontSize === size ? 'active' : ''}`}
                onClick={() => theme.setThemeSetting('fontSize', size)}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div className="theme-section">
          <label className="theme-label">Corner Style</label>
          <div className="setting-buttons">
            {(['none', 'small', 'medium', 'large'] as const).map((radius) => (
              <button
                key={radius}
                className={`setting-btn ${theme.borderRadius === radius ? 'active' : ''}`}
                onClick={() => theme.setThemeSetting('borderRadius', radius)}
              >
                {radius.charAt(0).toUpperCase() + radius.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Effects */}
        <div className="theme-section">
          <label className="theme-label">Effects</label>
          <div className="toggle-controls">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={theme.blur}
                onChange={(e) => theme.setThemeSetting('blur', e.target.checked)}
              />
              <span>Background Blur</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={theme.shadow}
                onChange={(e) => theme.setThemeSetting('shadow', e.target.checked)}
              />
              <span>Drop Shadow</span>
            </label>
          </div>
        </div>

        {/* URL Hint */}
        <div className="theme-hint">
          <p>
            <strong>URL Parameters:</strong> Add theme settings to your OBS URL:
          </p>
          <code>?bgColor=1a1a2e&fontSize=large&preset=broadcast</code>
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={theme.resetTheme}>
            Reset to Default
          </button>
          <button className="modal-btn confirm" onClick={onClose}>
            Done
          </button>
        </div>

        <style>{`
          .theme-modal {
            max-width: 500px;
          }

          .theme-section {
            margin-bottom: 20px;
          }

          .theme-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary, rgba(255, 255, 255, 0.9));
            margin-bottom: 8px;
          }

          .preset-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .preset-btn {
            display: flex;
            flex-direction: column;
            padding: 10px;
            background: var(--bg-input, rgba(30, 30, 50, 0.8));
            border: 1px solid var(--border-medium, rgba(255, 255, 255, 0.2));
            border-radius: 8px;
            color: var(--text-primary, #fff);
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .preset-btn:hover {
            background: var(--bg-hover, rgba(59, 130, 246, 0.3));
            border-color: var(--accent-blue, #3b82f6);
          }

          .preset-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary, #fff);
          }

          .preset-desc {
            font-size: 11px;
            color: var(--text-secondary, rgba(255, 255, 255, 0.6));
            margin-top: 2px;
          }

          .color-controls {
            display: flex;
            gap: 20px;
          }

          .color-control {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .color-control label {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
          }

          .color-control input[type="color"] {
            width: 60px;
            height: 36px;
            padding: 0;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }

          .opacity-slider {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            cursor: pointer;
            -webkit-appearance: none;
          }

          .opacity-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
          }

          .toggle-controls {
            display: flex;
            gap: 20px;
          }

          .toggle-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
          }

          .toggle-label input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }

          .theme-hint {
            margin-top: 16px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
          }

          .theme-hint code {
            display: block;
            margin-top: 6px;
            padding: 8px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            word-break: break-all;
          }
        `}</style>
      </div>
    </div>
  )
}

export default ThemeCustomizer

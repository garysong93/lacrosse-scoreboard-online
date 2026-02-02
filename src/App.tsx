import { useEffect, useRef, useState } from 'react'
import { useGameStore, RULE_PRESETS } from './stores/useGameStore'
import { useRoomStore } from './stores/useRoomStore'
import { useSoundStore } from './stores/useSoundStore'
import { useSoundManager } from './hooks/useSoundManager'
import { useKeyboardShortcuts, type KeyboardAction } from './hooks/useKeyboardShortcuts'
import { useThemeMode, type ThemeMode } from './hooks/useThemeMode'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { OfflineIndicator } from './components/OfflineIndicator'
import { InstallBanner } from './components/InstallBanner'
import { UpdateNotification } from './components/UpdateNotification'
import type { RulePresetId, TeamSide, Player, Penalty } from './types'
import { RoomManager } from './components/RoomManager'
import { LogoUploader } from './components/LogoUploader'
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp'
import { ThemeCustomizer } from './components/ThemeCustomizer'
import './App.css'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatPenaltyTime(penalty: Penalty): string {
  const elapsed = (Date.now() - penalty.startTime) / 1000
  const remaining = Math.max(0, penalty.duration - elapsed)
  return formatTime(remaining)
}

type ModalType = 'settings' | 'players' | 'history' | 'sync' | 'export' | 'timeline' | 'shortcuts' | 'overlay-theme' | null
type GoalModalState = { team: TeamSide } | null

function App() {
  const store = useGameStore()
  const roomStore = useRoomStore()
  const soundSettings = useSoundStore()
  const soundManager = useSoundManager()
  const themeMode = useThemeMode()
  const onlineStatus = useOnlineStatus()
  const installPrompt = useInstallPrompt()
  const {
    rulePreset, home, away, currentPeriod, gameTime, shotClock, isRunning, isGameEnded, isOvertime,
    possession, events, history, savedGames,
    addGoal, removeGoal, addShot, wonFaceoff, useTimeout,
    startTimer, stopTimer, resetShotClock, setGameTime, setShotClock,
    nextPeriod, startOvertime,
    setPossession,
    addPenalty, removePenalty, updatePenalties,
    addPlayer, removePlayer,
    setTeamName, setTeamColor, setTeamLogo, setRulePreset,
    newGame, undo, endGame, saveGame, deleteSavedGame,
    getCurrentRules, getPowerPlay, getSyncableState,
  } = store

  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [goalModal, setGoalModal] = useState<GoalModalState>(null)
  const [penaltyTeam, setPenaltyTeam] = useState<TeamSide | null>(null)
  const [penaltyNumber, setPenaltyNumber] = useState('')
  const [penaltyDuration, setPenaltyDuration] = useState(60)
  const [penaltyDescription, setPenaltyDescription] = useState('')
  const [newPlayerNumber, setNewPlayerNumber] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [addingPlayerTeam, setAddingPlayerTeam] = useState<TeamSide | null>(null)
  const [, setForcePenaltyUpdate] = useState(0)
  const timerRef = useRef<number | null>(null)
  const scoreboardRef = useRef<HTMLDivElement>(null)
  const prevScoreRef = useRef({ home: home.score, away: away.score })
  const prevGameTimeRef = useRef(gameTime)

  const rules = getCurrentRules()
  const powerPlay = getPowerPlay()

  // Immediate sync function for critical events
  const syncNow = () => {
    if (roomStore.isConnected && roomStore.role === 'control') {
      roomStore.syncState(getSyncableState())
    }
  }

  // Timer effect - counts DOWN with faster sync
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setGameTime(gameTime - 1)
        setShotClock(shotClock - 1)
        updatePenalties()
        setForcePenaltyUpdate(prev => prev + 1)

        // Sync to room if hosting (every 500ms effectively with 1s timer)
        syncNow()
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, gameTime, shotClock, setGameTime, setShotClock, updatePenalties, getSyncableState, roomStore])

  // Immediate sync on score changes
  useEffect(() => {
    syncNow()
  }, [home.score, away.score])

  // Immediate sync on penalty changes
  useEffect(() => {
    syncNow()
  }, [home.penalties.length, away.penalties.length])

  // Immediate sync on period/overtime changes
  useEffect(() => {
    syncNow()
  }, [currentPeriod, isOvertime, isGameEnded])

  // Sound effects: Goal horn
  useEffect(() => {
    const prevTotal = prevScoreRef.current.home + prevScoreRef.current.away
    const currentTotal = home.score + away.score
    if (currentTotal > prevTotal) {
      soundManager.playGoalHorn()
    }
    prevScoreRef.current = { home: home.score, away: away.score }
  }, [home.score, away.score, soundManager])

  // Sound effects: Shot clock warning
  useEffect(() => {
    if (isRunning) {
      soundManager.checkShotClockWarning(shotClock, isRunning)
    }
  }, [shotClock, isRunning, soundManager])

  // Sound effects: Period/game end buzzer
  useEffect(() => {
    // Play buzzer when game time reaches 0 (period or game end)
    if (prevGameTimeRef.current > 0 && gameTime === 0 && isRunning) {
      soundManager.playBuzzer()
    }
    prevGameTimeRef.current = gameTime
  }, [gameTime, isRunning, soundManager])

  const isViewOnly = roomStore.isConnected && roomStore.role !== 'control' && !roomStore.isHost
  const isAnyModalOpen = activeModal !== null || goalModal !== null || penaltyTeam !== null

  // Wrap resetShotClock to also reset sound warning state
  const handleResetShotClock = () => {
    resetShotClock()
    soundManager.resetShotClockWarning()
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  // Define keyboard shortcuts
  const keyboardActions: KeyboardAction[] = [
    // Timer controls
    {
      key: ' ',
      description: 'Start/Stop timer',
      category: 'timer',
      action: () => !isViewOnly && (isRunning ? stopTimer() : startTimer()),
    },
    {
      key: 'r',
      description: 'Reset shot clock',
      category: 'timer',
      action: () => !isViewOnly && handleResetShotClock(),
    },
    // Scoring
    {
      key: 'h',
      altKey: 'ArrowLeft',
      description: 'Home team goal',
      category: 'scoring',
      action: () => !isViewOnly && handleGoalClick('home'),
    },
    {
      key: 'a',
      altKey: 'ArrowRight',
      description: 'Away team goal',
      category: 'scoring',
      action: () => !isViewOnly && handleGoalClick('away'),
    },
    // Other controls
    {
      key: 'u',
      description: 'Undo last action',
      category: 'other',
      action: () => !isViewOnly && history.length > 0 && undo(),
    },
    {
      key: 'p',
      description: 'Toggle possession',
      category: 'other',
      action: () => !isViewOnly && store.togglePossession(),
    },
    {
      key: 'f',
      description: 'Toggle fullscreen',
      category: 'navigation',
      action: toggleFullscreen,
    },
    // Navigation
    {
      key: '?',
      altKey: '/',
      description: 'Show keyboard shortcuts',
      category: 'navigation',
      action: () => setActiveModal('shortcuts'),
    },
    {
      key: 'Escape',
      description: 'Close modal',
      category: 'navigation',
      action: () => {
        if (goalModal) setGoalModal(null)
        else if (penaltyTeam) setPenaltyTeam(null)
        else if (activeModal) setActiveModal(null)
      },
    },
  ]

  // Register keyboard shortcuts
  useKeyboardShortcuts(keyboardActions, {
    enabled: !isViewOnly,
    isModalOpen: isAnyModalOpen,
  })

  const handleGoalClick = (team: TeamSide) => {
    if (isViewOnly) return
    const teamData = team === 'home' ? home : away
    if (teamData.players.length > 0) {
      setGoalModal({ team })
    } else {
      addGoal(team)
    }
  }

  const handlePlayerGoal = (playerId?: string) => {
    if (goalModal) {
      addGoal(goalModal.team, playerId)
      setGoalModal(null)
    }
  }

  const handleAddPenalty = () => {
    if (penaltyTeam && penaltyNumber) {
      addPenalty(penaltyTeam, penaltyNumber, penaltyDuration, penaltyDescription || undefined)
      setPenaltyNumber('')
      setPenaltyDescription('')
      setPenaltyTeam(null)
    }
  }

  const handleAddPlayer = (team: TeamSide) => {
    if (newPlayerNumber) {
      addPlayer(team, newPlayerNumber, newPlayerName || `Player ${newPlayerNumber}`)
      setNewPlayerNumber('')
      setNewPlayerName('')
      setAddingPlayerTeam(null)
    }
  }

  const handleExportJSON = () => {
    const data = {
      date: new Date().toISOString(),
      rulePreset,
      home: { ...home },
      away: { ...away },
      events,
      gameTime,
      currentPeriod,
      isOvertime,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `lacrosse-game-${new Date().toISOString().split('T')[0]}.json`
    link.href = URL.createObjectURL(blob)
    link.click()
  }

  const PenaltyBox = ({ team, penalties }: { team: TeamSide; penalties: Penalty[] }) => {
    const activePenalties = penalties.filter(p => !p.isServed)
    if (activePenalties.length === 0) return null

    return (
      <div className="penalty-box">
        {activePenalties.map((penalty) => (
          <div
            key={penalty.id}
            className={`penalty-player ${penalty.isReleasable ? 'releasable' : 'non-releasable'}`}
            onClick={() => !isViewOnly && removePenalty(team, penalty.id)}
          >
            <span className="penalty-number">#{penalty.playerNumber}</span>
            <span className="penalty-time">{formatPenaltyTime(penalty)}</span>
            {penalty.description && <span className="penalty-desc">{penalty.description}</span>}
          </div>
        ))}
      </div>
    )
  }

  const PlayerStats = ({ team, players }: { team: TeamSide; players: Player[] }) => {
    if (players.length === 0) return null
    return (
      <div className="player-stats">
        {players.map((p) => (
          <div key={p.id} className="player-stat-row">
            <span className="player-info">#{p.number} {p.name}</span>
            <span className="player-scores">G:{p.goals} A:{p.assists} GB:{p.groundBalls}</span>
            <button className="player-remove" onClick={() => removePlayer(team, p.id)}>×</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="app">
      {/* PWA Banners */}
      <UpdateNotification />
      {installPrompt.isInstallable && (
        <InstallBanner
          onInstall={installPrompt.promptInstall}
          onDismiss={installPrompt.dismissBanner}
        />
      )}
      <OfflineIndicator
        isOffline={onlineStatus.isOffline}
        showReconnected={onlineStatus.showReconnected}
        onDismissReconnected={onlineStatus.dismissReconnected}
      />

      {/* Quick Action Bar */}
      <div className="quick-action-bar">
        <div className="quick-action-left">
          <span className="quick-action-title">🥍 Lacrosse Scoreboard</span>
        </div>
        <div className="quick-action-controls">
          <button className="header-btn icon-btn" onClick={() => window.open('/obs', '_blank')} title="OBS Overlay" tabIndex={-1}>
            🎬
          </button>
          <button className="header-btn icon-btn" onClick={() => setActiveModal('overlay-theme')} title="Overlay Theme" tabIndex={-1}>
            🎨
          </button>
          <button className="header-btn icon-btn" onClick={() => setActiveModal('sync')} title="Live Sync" tabIndex={-1}>
            {roomStore.isConnected ? '🔴' : '📡'}
          </button>
          <button className="header-btn icon-btn" onClick={() => setActiveModal('export')} title="Export" tabIndex={-1}>💾</button>
          <button className="header-btn icon-btn" onClick={() => setActiveModal('players')} title="Players" tabIndex={-1}>👥</button>
          <button className="header-btn icon-btn" onClick={() => setActiveModal('timeline')} title="Timeline" tabIndex={-1}>📋</button>
          <button className="header-btn icon-btn" onClick={() => setActiveModal('history')} title="History" tabIndex={-1}>📊</button>
          <button className="header-btn icon-btn" onClick={() => setActiveModal('shortcuts')} title="Keyboard Shortcuts" tabIndex={-1}>⌨️</button>
          <button className="header-btn" onClick={() => setActiveModal('settings')}>Settings</button>
        </div>
      </div>

      {/* Connection Badge */}
      {roomStore.isConnected && roomStore.roomId && (
        <div className="share-badge" onClick={() => setActiveModal('sync')}>
          {roomStore.isHost ? '🔴 HOSTING' : '👁️ VIEWING'}: {roomStore.roomId}
        </div>
      )}

      {/* Power Play Indicator */}
      {powerPlay.isActive && (
        <div className={`power-play-banner ${powerPlay.advantage || 'even'}`}>
          {powerPlay.situation} {powerPlay.advantage ? `- ${powerPlay.advantage.toUpperCase()} POWER PLAY` : '- EVEN STRENGTH'}
        </div>
      )}

      {/* Main Scoreboard */}
      <main className="scoreboard" ref={scoreboardRef}>
        {/* Timer Section */}
        <div className="timer-section">
          <div className="timer-row">
            <div className="period-indicator">
              {isOvertime ? 'OT' : `Q${currentPeriod}`}
            </div>
            <div className="timer-display" onClick={() => !isViewOnly && (isRunning ? stopTimer() : startTimer())}>
              {formatTime(gameTime)}
            </div>
            <div className="shot-clock-container">
              <div className="shot-clock-label">SHOT</div>
              <div
                className={`shot-clock ${shotClock <= 10 ? 'warning' : ''}`}
                onClick={() => !isViewOnly && handleResetShotClock()}
              >
                {shotClock}
              </div>
            </div>
          </div>

          {!isViewOnly && (
            <div className="timer-controls">
              <button className="timer-btn" onClick={() => (isRunning ? stopTimer() : startTimer())}>
                {isRunning ? 'STOP' : 'START'}
              </button>
              <button className="timer-btn secondary" onClick={handleResetShotClock}>
                RESET SHOT
              </button>
              {currentPeriod < rules.periodCount && !isOvertime && (
                <button className="timer-btn" onClick={nextPeriod}>END PERIOD</button>
              )}
              {currentPeriod >= rules.periodCount && home.score === away.score && !isOvertime && (
                <button className="timer-btn" onClick={startOvertime}>START OT</button>
              )}
              {(currentPeriod >= rules.periodCount || isOvertime) && !isGameEnded && (
                <button className="timer-btn danger" onClick={endGame}>END GAME</button>
              )}
            </div>
          )}
        </div>

        {/* Possession Indicator */}
        <div className="possession-row">
          <button
            className={`possession-btn ${possession === 'home' ? 'active' : ''}`}
            onClick={() => !isViewOnly && setPossession('home')}
            style={{ borderColor: home.color }}
          >
            {possession === 'home' && '◀'} {home.name}
          </button>
          <button
            className="faceoff-btn"
            onClick={() => !isViewOnly && setPossession(null)}
          >
            FACEOFF
          </button>
          <button
            className={`possession-btn ${possession === 'away' ? 'active' : ''}`}
            onClick={() => !isViewOnly && setPossession('away')}
            style={{ borderColor: away.color }}
          >
            {away.name} {possession === 'away' && '▶'}
          </button>
        </div>

        {/* Teams Section */}
        <div className="teams-section">
          {/* Home Team */}
          <div className="team-panel" style={{ borderColor: home.color }}>
            <div className="team-header" style={{ backgroundColor: home.color }}>
              <h2 className="team-name">{home.name}</h2>
            </div>
            <div
              className="team-score"
              onClick={() => handleGoalClick('home')}
              onContextMenu={(e) => { e.preventDefault(); if (!isViewOnly) removeGoal('home') }}
            >
              {home.score}
            </div>

            <PenaltyBox team="home" penalties={home.penalties} />

            <div className="team-stats">
              <span>SOG: {home.shots}</span>
              <span>FO: {home.faceoffsWon}</span>
              <span>TO: {home.timeoutsRemaining}</span>
            </div>

            {!isViewOnly && (
              <div className="team-actions">
                <button className="action-btn small" onClick={() => addShot('home')}>+SHOT</button>
                <button className="action-btn small" onClick={() => wonFaceoff('home')}>+FO WIN</button>
                <button className="action-btn small warning" onClick={() => setPenaltyTeam('home')}>+PENALTY</button>
                <button className="action-btn small secondary" onClick={() => useTimeout('home')}>TIMEOUT</button>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="team-panel" style={{ borderColor: away.color }}>
            <div className="team-header" style={{ backgroundColor: away.color }}>
              <h2 className="team-name">{away.name}</h2>
            </div>
            <div
              className="team-score"
              onClick={() => handleGoalClick('away')}
              onContextMenu={(e) => { e.preventDefault(); if (!isViewOnly) removeGoal('away') }}
            >
              {away.score}
            </div>

            <PenaltyBox team="away" penalties={away.penalties} />

            <div className="team-stats">
              <span>SOG: {away.shots}</span>
              <span>FO: {away.faceoffsWon}</span>
              <span>TO: {away.timeoutsRemaining}</span>
            </div>

            {!isViewOnly && (
              <div className="team-actions">
                <button className="action-btn small" onClick={() => addShot('away')}>+SHOT</button>
                <button className="action-btn small" onClick={() => wonFaceoff('away')}>+FO WIN</button>
                <button className="action-btn small warning" onClick={() => setPenaltyTeam('away')}>+PENALTY</button>
                <button className="action-btn small secondary" onClick={() => useTimeout('away')}>TIMEOUT</button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        {!isViewOnly && (
          <div className="bottom-controls">
            <button className="control-btn" onClick={undo} disabled={history.length === 0}>UNDO</button>
            <div className="game-mode-badge">{RULE_PRESETS[rulePreset].name}</div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal wide-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Settings</h3>
            <div className="settings-grid">
              <div className="setting-group">
                <label>Rule Preset</label>
                <div className="setting-buttons">
                  {(Object.keys(RULE_PRESETS) as RulePresetId[]).map((preset) => (
                    <button
                      key={preset}
                      className={`setting-btn ${rulePreset === preset ? 'active' : ''}`}
                      onClick={() => setRulePreset(preset)}
                    >
                      {RULE_PRESETS[preset].name}
                    </button>
                  ))}
                </div>
                <p className="setting-hint">{rules.description}</p>
                <p className="setting-hint">Shot Clock: {rules.shotClock}s | Period: {rules.periodDuration / 60}min</p>
              </div>
              <div className="setting-group">
                <label>Home Team</label>
                <input type="text" value={home.name} onChange={(e) => setTeamName('home', e.target.value)} className="setting-input" />
                <div className="setting-row">
                  <input type="color" value={home.color} onChange={(e) => setTeamColor('home', e.target.value)} className="setting-color" />
                  <LogoUploader
                    currentLogo={home.logoUrl}
                    onLogoChange={(url) => setTeamLogo('home', url)}
                    teamColor={home.color}
                    teamName={home.name}
                  />
                </div>
              </div>
              <div className="setting-group">
                <label>Away Team</label>
                <input type="text" value={away.name} onChange={(e) => setTeamName('away', e.target.value)} className="setting-input" />
                <div className="setting-row">
                  <input type="color" value={away.color} onChange={(e) => setTeamColor('away', e.target.value)} className="setting-color" />
                  <LogoUploader
                    currentLogo={away.logoUrl}
                    onLogoChange={(url) => setTeamLogo('away', url)}
                    teamColor={away.color}
                    teamName={away.name}
                  />
                </div>
              </div>
              <div className="setting-group">
                <label>Sound Effects</label>
                <div className="sound-settings">
                  <div className="sound-toggle">
                    <span className="sound-toggle-label">Enable Sounds</span>
                    <button
                      className={`sound-toggle-switch ${soundSettings.enabled ? 'active' : ''}`}
                      onClick={() => soundSettings.toggleEnabled()}
                    />
                  </div>
                  {soundSettings.enabled && (
                    <>
                      <div className="sound-volume">
                        <span className="sound-volume-label">Volume</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={soundSettings.volume * 100}
                          onChange={(e) => soundSettings.setVolume(Number(e.target.value) / 100)}
                          className="sound-volume-slider"
                        />
                      </div>
                      <div className="sound-options">
                        <label className="sound-option">
                          <input
                            type="checkbox"
                            checked={soundSettings.goalHorn}
                            onChange={(e) => soundSettings.setGoalHorn(e.target.checked)}
                          />
                          Goal Horn
                        </label>
                        <label className="sound-option">
                          <input
                            type="checkbox"
                            checked={soundSettings.buzzer}
                            onChange={(e) => soundSettings.setBuzzer(e.target.checked)}
                          />
                          Period Buzzer
                        </label>
                        <label className="sound-option">
                          <input
                            type="checkbox"
                            checked={soundSettings.shotClockWarning}
                            onChange={(e) => soundSettings.setShotClockWarning(e.target.checked)}
                          />
                          Shot Clock Warning
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="setting-group">
                <label>Theme</label>
                <div className="setting-buttons">
                  {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      className={`setting-btn ${themeMode.mode === mode ? 'active' : ''}`}
                      onClick={() => themeMode.setMode(mode)}
                    >
                      {mode === 'dark' ? '🌙 Dark' : mode === 'light' ? '☀️ Light' : '💻 System'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setActiveModal(null)}>Close</button>
              <button className="action-btn danger" onClick={() => { newGame(); setActiveModal(null); }}>New Game</button>
            </div>
          </div>
        </div>
      )}

      {/* Players Modal */}
      {activeModal === 'players' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal wide-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Player Management</h3>
            <div className="players-grid">
              <div className="player-team-section">
                <h4 style={{ color: home.color }}>{home.name}</h4>
                <PlayerStats team="home" players={home.players} />
                {addingPlayerTeam === 'home' ? (
                  <div className="add-player-form">
                    <input type="text" placeholder="#" value={newPlayerNumber} onChange={(e) => setNewPlayerNumber(e.target.value)} className="player-number-input" />
                    <input type="text" placeholder="Name (optional)" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} className="player-name-input" />
                    <button className="modal-btn confirm" onClick={() => handleAddPlayer('home')}>Add</button>
                    <button className="modal-btn cancel" onClick={() => setAddingPlayerTeam(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="add-player-btn" onClick={() => setAddingPlayerTeam('home')}>+ Add Player</button>
                )}
              </div>
              <div className="player-team-section">
                <h4 style={{ color: away.color }}>{away.name}</h4>
                <PlayerStats team="away" players={away.players} />
                {addingPlayerTeam === 'away' ? (
                  <div className="add-player-form">
                    <input type="text" placeholder="#" value={newPlayerNumber} onChange={(e) => setNewPlayerNumber(e.target.value)} className="player-number-input" />
                    <input type="text" placeholder="Name (optional)" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} className="player-name-input" />
                    <button className="modal-btn confirm" onClick={() => handleAddPlayer('away')}>Add</button>
                    <button className="modal-btn cancel" onClick={() => setAddingPlayerTeam(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="add-player-btn" onClick={() => setAddingPlayerTeam('away')}>+ Add Player</button>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setActiveModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {activeModal === 'sync' && (
        <RoomManager onClose={() => setActiveModal(null)} />
      )}

      {/* Export Modal */}
      {activeModal === 'export' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Export Game</h3>
            <div className="export-options">
              <button className="export-btn" onClick={handleExportJSON}>📄 Export as JSON</button>
              <button className="export-btn" onClick={() => { saveGame(); alert('Game saved to history!'); }}>💾 Save to History</button>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setActiveModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {activeModal === 'timeline' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal wide-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Game Timeline</h3>
            <div className="timeline-list">
              {events.length === 0 ? (
                <p className="empty-state">No events yet</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="timeline-event" style={{ borderLeftColor: event.team === 'home' ? home.color : away.color }}>
                    <span className="event-time">{formatTime(event.gameTime)} (Q{event.period})</span>
                    <span className="event-team">{event.team === 'home' ? home.name : away.name}</span>
                    <span className="event-type">{event.type.toUpperCase()}</span>
                    {event.playerNumber && <span className="event-player">#{event.playerNumber}</span>}
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setActiveModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {activeModal === 'history' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal wide-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Game History</h3>
            <div className="history-list">
              {savedGames.length === 0 ? (
                <p className="empty-state">No saved games</p>
              ) : (
                savedGames.map((game) => (
                  <div key={game.id} className="history-match">
                    <span className="match-date">{new Date(game.date).toLocaleDateString()}</span>
                    <span className="match-result">{game.home.name} {game.home.score} - {game.away.score} {game.away.name}</span>
                    <button className="delete-btn" onClick={() => deleteSavedGame(game.id)}>🗑️</button>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setActiveModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {activeModal === 'shortcuts' && (
        <KeyboardShortcutsHelp
          actions={keyboardActions}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Overlay Theme Customizer Modal */}
      {activeModal === 'overlay-theme' && (
        <ThemeCustomizer onClose={() => setActiveModal(null)} />
      )}

      {/* Penalty Modal */}
      {penaltyTeam && (
        <div className="modal-overlay" onClick={() => setPenaltyTeam(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Penalty - {penaltyTeam === 'home' ? home.name : away.name}</h3>
            <input
              type="text"
              placeholder="Player Number"
              value={penaltyNumber}
              onChange={(e) => setPenaltyNumber(e.target.value)}
              className="modal-input"
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={penaltyDescription}
              onChange={(e) => setPenaltyDescription(e.target.value)}
              className="modal-input"
            />
            <div className="setting-group">
              <label>Duration</label>
              <div className="setting-buttons">
                {rules.penaltyDurations.map((dur) => (
                  <button
                    key={dur}
                    className={`setting-btn ${penaltyDuration === dur ? 'active' : ''}`}
                    onClick={() => setPenaltyDuration(dur)}
                  >
                    {dur >= 60 ? `${dur / 60}min` : `${dur}s`}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setPenaltyTeam(null)}>Cancel</button>
              <button className="modal-btn confirm" onClick={handleAddPenalty}>Add Penalty</button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Attribution Modal */}
      {goalModal && (
        <div className="modal-overlay" onClick={() => setGoalModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Who scored?</h3>
            <p>Goal for {goalModal.team === 'home' ? home.name : away.name}</p>
            <div className="player-select-list">
              <button className="player-select-btn" onClick={() => handlePlayerGoal()}>Unknown / Team Goal</button>
              {(goalModal.team === 'home' ? home : away).players.map((player) => (
                <button key={player.id} className="player-select-btn" onClick={() => handlePlayerGoal(player.id)}>
                  #{player.number} {player.name}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setGoalModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Ended Overlay */}
      {isGameEnded && (
        <div className="modal-overlay">
          <div className="modal result-modal">
            <h2>FINAL</h2>
            <div className="final-score">
              <div className="final-team">
                <span className="final-name">{home.name}</span>
                <span className="final-points">{home.score}</span>
              </div>
              <span className="vs">-</span>
              <div className="final-team">
                <span className="final-points">{away.score}</span>
                <span className="final-name">{away.name}</span>
              </div>
            </div>
            <div className="result-actions">
              <button className="modal-btn confirm" onClick={() => { saveGame(); newGame(); }}>Save & New Game</button>
              <button className="modal-btn cancel" onClick={newGame}>New Game</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default App

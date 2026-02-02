import { useEffect, useState } from 'react'
import { useGameStore } from '../stores/useGameStore'
import { useRoomStore } from '../stores/useRoomStore'
import './MobileControl.css'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function MobileControl() {
  const store = useGameStore()
  const roomStore = useRoomStore()
  const {
    home, away, gameTime, shotClock, currentPeriod, isRunning, isOvertime,
    addGoal, removeGoal, startTimer, stopTimer, resetShotClock,
    setPossession, getPowerPlay, getSyncableState, applySyncedState,
  } = store

  const [isJoining, setIsJoining] = useState(false)
  const powerPlay = getPowerPlay()

  // Auto-join room from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roomId = params.get('room')

    if (roomId && !roomStore.isConnected && !isJoining) {
      setIsJoining(true)
      roomStore.initialize()

      // Set up state update callback before joining
      roomStore.setOnStateUpdate((state) => {
        applySyncedState(state)
      })

      roomStore.joinExistingRoom(roomId, 'control').then((success) => {
        setIsJoining(false)
        if (!success) {
          console.error('Failed to join room')
        }
      })
    }
  }, [roomStore, applySyncedState, isJoining])

  // Sync state when connected
  useEffect(() => {
    if (roomStore.isConnected && roomStore.role === 'control') {
      roomStore.syncState(getSyncableState())
    }
  }, [home.score, away.score, gameTime, isRunning, roomStore, getSyncableState])

  const isViewOnly = roomStore.isConnected && roomStore.role !== 'control' && !roomStore.isHost

  const handleGoal = (team: 'home' | 'away', add: boolean) => {
    if (isViewOnly) return
    if (add) {
      addGoal(team)
    } else {
      removeGoal(team)
    }
  }

  return (
    <div className="mobile-control">
      {/* Header */}
      <header className="mc-header">
        <h1 className="mc-title">Lacrosse Control</h1>
        <div className={`mc-connection ${roomStore.isConnected ? 'connected' : ''}`}>
          {roomStore.isConnected ? (
            <span>{roomStore.isHost ? 'HOST' : 'SYNC'}: {roomStore.roomId}</span>
          ) : (
            <span>LOCAL</span>
          )}
        </div>
      </header>

      {/* Power Play Banner */}
      {powerPlay.isActive && (
        <div className={`mc-powerplay ${powerPlay.advantage || 'even'}`}>
          {powerPlay.situation} {powerPlay.advantage ? 'POWER PLAY' : 'EVEN STRENGTH'}
        </div>
      )}

      {/* Time Display */}
      <div className="mc-time-section">
        <div className="mc-period">{isOvertime ? 'OT' : `Q${currentPeriod}`}</div>
        <div className="mc-time">{formatTime(gameTime)}</div>
        <div className={`mc-shot ${shotClock <= 10 ? 'warning' : ''}`}>
          <span className="shot-label">SHOT</span>
          <span className="shot-value">{shotClock}</span>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="mc-timer-controls">
        <button
          className={`mc-btn timer-btn ${isRunning ? 'stop' : 'start'}`}
          onClick={() => !isViewOnly && (isRunning ? stopTimer() : startTimer())}
          disabled={isViewOnly}
        >
          {isRunning ? 'STOP' : 'START'}
        </button>
        <button
          className="mc-btn reset-btn"
          onClick={() => !isViewOnly && resetShotClock()}
          disabled={isViewOnly}
        >
          RESET SHOT
        </button>
      </div>

      {/* Teams Section */}
      <div className="mc-teams">
        {/* Home Team */}
        <div className="mc-team" style={{ borderColor: home.color }}>
          <div className="team-header" style={{ backgroundColor: home.color }}>
            <span className="team-name">{home.name}</span>
          </div>
          <div className="team-score">{home.score}</div>
          <div className="score-controls">
            <button
              className="mc-btn score-btn minus"
              onClick={() => handleGoal('home', false)}
              disabled={isViewOnly || home.score <= 0}
            >
              -
            </button>
            <button
              className="mc-btn score-btn plus"
              onClick={() => handleGoal('home', true)}
              disabled={isViewOnly}
            >
              +
            </button>
          </div>
          <button
            className={`mc-btn possession-btn ${store.possession === 'home' ? 'active' : ''}`}
            onClick={() => !isViewOnly && setPossession('home')}
            style={{ borderColor: home.color }}
            disabled={isViewOnly}
          >
            POSSESSION
          </button>
        </div>

        {/* Away Team */}
        <div className="mc-team" style={{ borderColor: away.color }}>
          <div className="team-header" style={{ backgroundColor: away.color }}>
            <span className="team-name">{away.name}</span>
          </div>
          <div className="team-score">{away.score}</div>
          <div className="score-controls">
            <button
              className="mc-btn score-btn minus"
              onClick={() => handleGoal('away', false)}
              disabled={isViewOnly || away.score <= 0}
            >
              -
            </button>
            <button
              className="mc-btn score-btn plus"
              onClick={() => handleGoal('away', true)}
              disabled={isViewOnly}
            >
              +
            </button>
          </div>
          <button
            className={`mc-btn possession-btn ${store.possession === 'away' ? 'active' : ''}`}
            onClick={() => !isViewOnly && setPossession('away')}
            style={{ borderColor: away.color }}
            disabled={isViewOnly}
          >
            POSSESSION
          </button>
        </div>
      </div>

      {/* Faceoff Button */}
      <button
        className="mc-btn faceoff-btn"
        onClick={() => !isViewOnly && setPossession(null)}
        disabled={isViewOnly}
      >
        FACEOFF
      </button>

      {/* Footer */}
      <footer className="mc-footer">
        <p>Use main app for full controls</p>
        {!roomStore.isConnected && (
          <p className="mc-hint">Scan QR code from main app to sync</p>
        )}
      </footer>
    </div>
  )
}

export function MobileControlPage() {
  return <MobileControl />
}

export default MobileControl

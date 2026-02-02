import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../stores/useGameStore'
import { useRoomStore } from '../stores/useRoomStore'
import './OBSOverlay.css'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

type OverlayStyle = 'minimal' | 'scorebug' | 'fullwidth' | 'espn' | 'fox' | 'college' | 'ticker' | 'sidebar'
type ConnectionStatus = 'live' | 'syncing' | 'offline'

interface OBSOverlayProps {
  style?: OverlayStyle
  showShotClock?: boolean
  showPossession?: boolean
  showPeriod?: boolean
  transparent?: boolean
  showConnectionStatus?: boolean
  showStats?: boolean
}

export function OBSOverlay({
  style = 'scorebug',
  showShotClock = true,
  showPossession = true,
  showPeriod = true,
  transparent = true,
  showConnectionStatus = true,
  showStats = false,
}: OBSOverlayProps) {
  const { home, away, gameTime, shotClock, currentPeriod, isOvertime, possession, getPowerPlay } = useGameStore()
  const roomStore = useRoomStore()
  const powerPlay = getPowerPlay()
  const [, forceUpdate] = useState(0)

  // Track previous scores for goal celebration animation
  const prevHomeScore = useRef(home.score)
  const prevAwayScore = useRef(away.score)
  const [goalAnimation, setGoalAnimation] = useState<'home' | 'away' | null>(null)

  // Connection status
  const getConnectionStatus = (): ConnectionStatus => {
    if (!roomStore.isConnected) return 'offline'
    const timeSinceSync = Date.now() - roomStore.lastSyncTime
    if (timeSinceSync < 2000) return 'live'
    if (timeSinceSync < 5000) return 'syncing'
    return 'offline'
  }
  const connectionStatus = getConnectionStatus()

  // Force re-render every second for live updates
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 500) // Faster updates for smoother display
    return () => clearInterval(interval)
  }, [])

  // Goal celebration animation
  useEffect(() => {
    if (home.score > prevHomeScore.current) {
      setGoalAnimation('home')
      setTimeout(() => setGoalAnimation(null), 3000)
    } else if (away.score > prevAwayScore.current) {
      setGoalAnimation('away')
      setTimeout(() => setGoalAnimation(null), 3000)
    }
    prevHomeScore.current = home.score
    prevAwayScore.current = away.score
  }, [home.score, away.score])

  // Connection status indicator component
  const ConnectionIndicator = () => {
    if (!showConnectionStatus) return null
    return (
      <div className={`connection-status ${connectionStatus}`}>
        <span className="connection-dot" />
        <span className="connection-label">
          {connectionStatus === 'live' ? 'LIVE' : connectionStatus === 'syncing' ? 'SYNC' : 'LOCAL'}
        </span>
      </div>
    )
  }

  // Stats row component
  const StatsRow = ({ team }: { team: typeof home }) => {
    if (!showStats) return null
    const totalFaceoffs = home.faceoffsWon + away.faceoffsWon
    const foPercent = totalFaceoffs > 0 ? Math.round((team.faceoffsWon / totalFaceoffs) * 100) : 0
    return (
      <div className="stats-row">
        <span>SOG: {team.shots}</span>
        <span>GB: {team.groundBalls}</span>
        <span>TO: {team.turnovers}</span>
        <span>FO: {foPercent}%</span>
      </div>
    )
  }

  if (style === 'minimal') {
    return (
      <div className={`obs-overlay minimal ${transparent ? 'transparent' : ''}`}>
        <ConnectionIndicator />
        <div className="minimal-score">
          <span className="minimal-team" style={{ color: home.color }}>{home.name}</span>
          <span className={`minimal-points ${goalAnimation === 'home' ? 'goal-animation' : ''}`} style={goalAnimation === 'home' ? { color: home.color } : undefined}>{home.score}</span>
          <span className="minimal-separator">-</span>
          <span className={`minimal-points ${goalAnimation === 'away' ? 'goal-animation' : ''}`} style={goalAnimation === 'away' ? { color: away.color } : undefined}>{away.score}</span>
          <span className="minimal-team" style={{ color: away.color }}>{away.name}</span>
        </div>
        {goalAnimation && <div className="confetti-container"><div className="confetti" style={{ backgroundColor: goalAnimation === 'home' ? home.color : away.color }} /></div>}
      </div>
    )
  }

  if (style === 'fullwidth') {
    return (
      <div className={`obs-overlay fullwidth ${transparent ? 'transparent' : ''} ${goalAnimation ? 'goal-flash' : ''}`}>
        <ConnectionIndicator />
        <div className="fullwidth-bar">
          <div className={`fullwidth-team home ${goalAnimation === 'home' ? 'goal-team-flash' : ''}`} style={{ backgroundColor: home.color }}>
            {home.logoUrl && <img src={home.logoUrl} alt="" className="team-logo" />}
            <span className="fullwidth-name">{home.name}</span>
            <span className={`fullwidth-score ${goalAnimation === 'home' ? 'goal-animation' : ''}`}>{home.score}</span>
          </div>

          <div className="fullwidth-center">
            {showPeriod && (
              <span className="fullwidth-period">{isOvertime ? 'OT' : `Q${currentPeriod}`}</span>
            )}
            <span className="fullwidth-time">{formatTime(gameTime)}</span>
            {showShotClock && (
              <span className={`fullwidth-shot ${shotClock <= 10 ? 'warning' : ''}`}>{shotClock}</span>
            )}
          </div>

          <div className={`fullwidth-team away ${goalAnimation === 'away' ? 'goal-team-flash' : ''}`} style={{ backgroundColor: away.color }}>
            <span className={`fullwidth-score ${goalAnimation === 'away' ? 'goal-animation' : ''}`}>{away.score}</span>
            <span className="fullwidth-name">{away.name}</span>
            {away.logoUrl && <img src={away.logoUrl} alt="" className="team-logo" />}
          </div>
        </div>

        {showStats && (
          <div className="fullwidth-stats">
            <StatsRow team={home} />
            <StatsRow team={away} />
          </div>
        )}

        {powerPlay.isActive && (
          <div className={`fullwidth-powerplay ${powerPlay.advantage || 'even'}`}>
            {powerPlay.situation} {powerPlay.advantage ? 'POWER PLAY' : 'EVEN STRENGTH'}
          </div>
        )}
        {goalAnimation && <div className="confetti-container"><div className="confetti" style={{ backgroundColor: goalAnimation === 'home' ? home.color : away.color }} /></div>}
      </div>
    )
  }

  // ESPN style - horizontal three-segment layout
  if (style === 'espn') {
    return (
      <div className={`obs-overlay espn ${transparent ? 'transparent' : ''}`}>
        <ConnectionIndicator />
        <div className="espn-container">
          <div className={`espn-team home ${goalAnimation === 'home' ? 'goal-team-flash' : ''}`}>
            <div className="espn-color" style={{ backgroundColor: home.color }} />
            {home.logoUrl && <img src={home.logoUrl} alt="" className="team-logo-sm" />}
            <span className="espn-abbrev">{home.name.substring(0, 3).toUpperCase()}</span>
            <span className={`espn-score ${goalAnimation === 'home' ? 'goal-animation' : ''}`}>{home.score}</span>
            {showPossession && possession === 'home' && <span className="espn-possession" />}
          </div>
          <div className="espn-center">
            {showPeriod && <span className="espn-period">{isOvertime ? 'OT' : `Q${currentPeriod}`}</span>}
            <span className="espn-time">{formatTime(gameTime)}</span>
            {showShotClock && <span className={`espn-shot ${shotClock <= 10 ? 'warning' : ''}`}>{shotClock}</span>}
          </div>
          <div className={`espn-team away ${goalAnimation === 'away' ? 'goal-team-flash' : ''}`}>
            {showPossession && possession === 'away' && <span className="espn-possession" />}
            <span className={`espn-score ${goalAnimation === 'away' ? 'goal-animation' : ''}`}>{away.score}</span>
            <span className="espn-abbrev">{away.name.substring(0, 3).toUpperCase()}</span>
            {away.logoUrl && <img src={away.logoUrl} alt="" className="team-logo-sm" />}
            <div className="espn-color" style={{ backgroundColor: away.color }} />
          </div>
        </div>
        {showStats && <div className="espn-stats"><StatsRow team={home} /><StatsRow team={away} /></div>}
        {powerPlay.isActive && <div className={`espn-powerplay ${powerPlay.advantage || 'even'}`}>{powerPlay.situation}</div>}
        {goalAnimation && <div className="confetti-container"><div className="confetti" style={{ backgroundColor: goalAnimation === 'home' ? home.color : away.color }} /></div>}
      </div>
    )
  }

  // Fox Sports style - L-shaped corner with gradient
  if (style === 'fox') {
    return (
      <div className={`obs-overlay fox ${transparent ? 'transparent' : ''}`}>
        <ConnectionIndicator />
        <div className="fox-container">
          <div className={`fox-team ${goalAnimation === 'home' ? 'goal-team-flash' : ''}`} style={{ '--team-color': home.color } as React.CSSProperties}>
            {home.logoUrl && <img src={home.logoUrl} alt="" className="team-logo-sm" />}
            <span className="fox-name">{home.name}</span>
            <span className={`fox-score ${goalAnimation === 'home' ? 'goal-animation' : ''}`}>{home.score}</span>
          </div>
          <div className={`fox-team ${goalAnimation === 'away' ? 'goal-team-flash' : ''}`} style={{ '--team-color': away.color } as React.CSSProperties}>
            {away.logoUrl && <img src={away.logoUrl} alt="" className="team-logo-sm" />}
            <span className="fox-name">{away.name}</span>
            <span className={`fox-score ${goalAnimation === 'away' ? 'goal-animation' : ''}`}>{away.score}</span>
          </div>
          <div className="fox-time-section">
            {showPeriod && <span className="fox-period">{isOvertime ? 'OT' : `Q${currentPeriod}`}</span>}
            <span className="fox-time">{formatTime(gameTime)}</span>
            {showShotClock && <span className={`fox-shot ${shotClock <= 10 ? 'warning' : ''}`}>{shotClock}</span>}
          </div>
        </div>
        {powerPlay.isActive && <div className={`fox-powerplay ${powerPlay.advantage || 'even'}`}>{powerPlay.situation} PP</div>}
        {goalAnimation && <div className="confetti-container"><div className="confetti" style={{ backgroundColor: goalAnimation === 'home' ? home.color : away.color }} /></div>}
      </div>
    )
  }

  // College style - clean and minimal
  if (style === 'college') {
    return (
      <div className={`obs-overlay college ${transparent ? 'transparent' : ''}`}>
        <ConnectionIndicator />
        <div className="college-container">
          <div className={`college-team ${goalAnimation === 'home' ? 'goal-team-flash' : ''}`}>
            <div className="college-color" style={{ backgroundColor: home.color }} />
            {home.logoUrl && <img src={home.logoUrl} alt="" className="team-logo-sm" />}
            <span className="college-name">{home.name}</span>
            <span className={`college-score ${goalAnimation === 'home' ? 'goal-animation' : ''}`}>{home.score}</span>
          </div>
          <div className={`college-team ${goalAnimation === 'away' ? 'goal-team-flash' : ''}`}>
            <div className="college-color" style={{ backgroundColor: away.color }} />
            {away.logoUrl && <img src={away.logoUrl} alt="" className="team-logo-sm" />}
            <span className="college-name">{away.name}</span>
            <span className={`college-score ${goalAnimation === 'away' ? 'goal-animation' : ''}`}>{away.score}</span>
          </div>
          <div className="college-time">
            {showPeriod && <span className="college-period">{isOvertime ? 'OT' : `Q${currentPeriod}`}</span>}
            <span className="college-clock">{formatTime(gameTime)}</span>
            {showShotClock && <span className={`college-shot ${shotClock <= 10 ? 'warning' : ''}`}>{shotClock}</span>}
          </div>
        </div>
        {goalAnimation && <div className="confetti-container"><div className="confetti" style={{ backgroundColor: goalAnimation === 'home' ? home.color : away.color }} /></div>}
      </div>
    )
  }

  // Ticker style - bottom scrolling bar
  if (style === 'ticker') {
    return (
      <div className={`obs-overlay ticker ${transparent ? 'transparent' : ''}`}>
        <div className="ticker-bar">
          <ConnectionIndicator />
          <div className="ticker-game">
            <span className="ticker-team" style={{ color: home.color }}>{home.name}</span>
            <span className={`ticker-score ${goalAnimation === 'home' ? 'goal-animation' : ''}`}>{home.score}</span>
            <span className="ticker-vs">-</span>
            <span className={`ticker-score ${goalAnimation === 'away' ? 'goal-animation' : ''}`}>{away.score}</span>
            <span className="ticker-team" style={{ color: away.color }}>{away.name}</span>
            <span className="ticker-divider">|</span>
            {showPeriod && <span className="ticker-period">{isOvertime ? 'OT' : `Q${currentPeriod}`}</span>}
            <span className="ticker-time">{formatTime(gameTime)}</span>
            {showShotClock && <span className={`ticker-shot ${shotClock <= 10 ? 'warning' : ''}`}>SC: {shotClock}</span>}
            {powerPlay.isActive && <span className={`ticker-powerplay ${powerPlay.advantage || 'even'}`}>{powerPlay.situation}</span>}
          </div>
        </div>
        {goalAnimation && <div className="confetti-container"><div className="confetti" style={{ backgroundColor: goalAnimation === 'home' ? home.color : away.color }} /></div>}
      </div>
    )
  }

  // Sidebar style - vertical left/right edge
  if (style === 'sidebar') {
    return (
      <div className={`obs-overlay sidebar ${transparent ? 'transparent' : ''}`}>
        <ConnectionIndicator />
        <div className="sidebar-container">
          <div className={`sidebar-team ${goalAnimation === 'home' ? 'goal-team-flash' : ''}`} style={{ borderLeftColor: home.color }}>
            {home.logoUrl && <img src={home.logoUrl} alt="" className="team-logo-sm" />}
            <span className="sidebar-name">{home.name}</span>
            <span className={`sidebar-score ${goalAnimation === 'home' ? 'goal-animation' : ''}`}>{home.score}</span>
          </div>
          <div className={`sidebar-team ${goalAnimation === 'away' ? 'goal-team-flash' : ''}`} style={{ borderLeftColor: away.color }}>
            {away.logoUrl && <img src={away.logoUrl} alt="" className="team-logo-sm" />}
            <span className="sidebar-name">{away.name}</span>
            <span className={`sidebar-score ${goalAnimation === 'away' ? 'goal-animation' : ''}`}>{away.score}</span>
          </div>
          <div className="sidebar-time">
            {showPeriod && <span className="sidebar-period">{isOvertime ? 'OT' : `Q${currentPeriod}`}</span>}
            <span className="sidebar-clock">{formatTime(gameTime)}</span>
            {showShotClock && <span className={`sidebar-shot ${shotClock <= 10 ? 'warning' : ''}`}>{shotClock}</span>}
          </div>
          {powerPlay.isActive && <div className={`sidebar-powerplay ${powerPlay.advantage || 'even'}`}>{powerPlay.situation}</div>}
        </div>
        {goalAnimation && <div className="confetti-container"><div className="confetti" style={{ backgroundColor: goalAnimation === 'home' ? home.color : away.color }} /></div>}
      </div>
    )
  }

  // Default: scorebug style
  return (
    <div className={`obs-overlay scorebug ${transparent ? 'transparent' : ''}`}>
      <ConnectionIndicator />
      <div className="scorebug-container">
        {/* Home Team */}
        <div className={`scorebug-team ${goalAnimation === 'home' ? 'goal-team-flash' : ''}`}>
          <div className="scorebug-color" style={{ backgroundColor: home.color }} />
          {home.logoUrl && <img src={home.logoUrl} alt="" className="team-logo-sm" />}
          <span className="scorebug-name">{home.name}</span>
          <span className={`scorebug-score ${goalAnimation === 'home' ? 'goal-animation' : ''}`}>{home.score}</span>
          {showPossession && possession === 'home' && (
            <span className="scorebug-possession">●</span>
          )}
        </div>

        {/* Away Team */}
        <div className={`scorebug-team ${goalAnimation === 'away' ? 'goal-team-flash' : ''}`}>
          <div className="scorebug-color" style={{ backgroundColor: away.color }} />
          {away.logoUrl && <img src={away.logoUrl} alt="" className="team-logo-sm" />}
          <span className="scorebug-name">{away.name}</span>
          <span className={`scorebug-score ${goalAnimation === 'away' ? 'goal-animation' : ''}`}>{away.score}</span>
          {showPossession && possession === 'away' && (
            <span className="scorebug-possession">●</span>
          )}
        </div>

        {/* Time Display */}
        <div className="scorebug-time-section">
          {showPeriod && (
            <span className="scorebug-period">{isOvertime ? 'OT' : `Q${currentPeriod}`}</span>
          )}
          <span className="scorebug-time">{formatTime(gameTime)}</span>
          {showShotClock && (
            <span className={`scorebug-shot ${shotClock <= 10 ? 'warning' : ''}`}>{shotClock}</span>
          )}
        </div>

        {/* Stats Row */}
        {showStats && (
          <div className="scorebug-stats">
            <StatsRow team={home} />
            <StatsRow team={away} />
          </div>
        )}

        {/* Power Play Indicator */}
        {powerPlay.isActive && (
          <div className={`scorebug-powerplay ${powerPlay.advantage || 'even'}`}>
            {powerPlay.situation}
          </div>
        )}
      </div>
      {goalAnimation && <div className="confetti-container"><div className="confetti" style={{ backgroundColor: goalAnimation === 'home' ? home.color : away.color }} /></div>}
    </div>
  )
}

// URL-based overlay for direct browser source in OBS
export function OBSOverlayPage() {
  const params = new URLSearchParams(window.location.search)

  const [style, setStyle] = useState<OverlayStyle>((params.get('style') as OverlayStyle) || 'scorebug')
  const [showShotClock, setShowShotClock] = useState(params.get('shotclock') !== 'false')
  const [showPossession, setShowPossession] = useState(params.get('possession') !== 'false')
  const [showPeriod] = useState(params.get('period') !== 'false')
  const [transparent, setTransparent] = useState(params.get('transparent') !== 'false')
  const [showConnectionStatus, setShowConnectionStatus] = useState(params.get('status') !== 'false')
  const [showStats, setShowStats] = useState(params.get('stats') === 'true')

  const styles: OverlayStyle[] = ['minimal', 'scorebug', 'fullwidth', 'espn', 'fox', 'college', 'ticker', 'sidebar']

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case '1':
          setStyle('minimal')
          break
        case '2':
          setStyle('scorebug')
          break
        case '3':
          setStyle('fullwidth')
          break
        case '4':
          setStyle('espn')
          break
        case '5':
          setStyle('fox')
          break
        case '6':
          setStyle('college')
          break
        case '7':
          setStyle('ticker')
          break
        case '8':
          setStyle('sidebar')
          break
        case 't':
        case 'T':
          setTransparent(prev => !prev)
          break
        case 's':
        case 'S':
          setShowShotClock(prev => !prev)
          break
        case 'p':
        case 'P':
          setShowPossession(prev => !prev)
          break
        case 'c':
        case 'C':
          setShowConnectionStatus(prev => !prev)
          break
        case 'x':
        case 'X':
          setShowStats(prev => !prev)
          break
        case 'ArrowLeft':
          setStyle(prev => {
            const idx = styles.indexOf(prev)
            return styles[(idx - 1 + styles.length) % styles.length]
          })
          break
        case 'ArrowRight':
          setStyle(prev => {
            const idx = styles.indexOf(prev)
            return styles[(idx + 1) % styles.length]
          })
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="obs-page">
      <OBSOverlay
        style={style}
        showShotClock={showShotClock}
        showPossession={showPossession}
        showPeriod={showPeriod}
        transparent={transparent}
        showConnectionStatus={showConnectionStatus}
        showStats={showStats}
      />
    </div>
  )
}

export default OBSOverlay

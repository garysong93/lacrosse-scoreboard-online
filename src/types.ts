// Lacrosse Scoreboard Types

// ============================================
// Rule Presets - Different lacrosse leagues
// ============================================

export type RulePresetId = 'ncaa-men' | 'nfhs-boys' | 'nll-box' | 'pll' | 'ncaa-women' | 'custom'

export interface RulePreset {
  id: RulePresetId
  name: string
  description: string
  periodDuration: number    // Length of each period in seconds
  periodCount: number       // Number of periods (typically 4)
  shotClock: number         // Shot clock duration in seconds
  overtimeDuration: number  // Overtime period length in seconds
  penaltyDurations: number[] // Available penalty durations [30, 60, 120] etc.
  defaultPenalty: number    // Default penalty duration
  releasableOnGoal: boolean // Can penalty end early if goal scored
  useCards: boolean         // Women's lacrosse uses cards
  isBoxLacrosse: boolean    // Box vs Field lacrosse
}

export const RULE_PRESETS: Record<RulePresetId, RulePreset> = {
  'ncaa-men': {
    id: 'ncaa-men',
    name: 'NCAA Men',
    description: 'College men\'s field lacrosse',
    periodDuration: 15 * 60,
    periodCount: 4,
    shotClock: 80,
    overtimeDuration: 4 * 60,
    penaltyDurations: [30, 60, 120, 180],
    defaultPenalty: 60,
    releasableOnGoal: true,
    useCards: false,
    isBoxLacrosse: false,
  },
  'nfhs-boys': {
    id: 'nfhs-boys',
    name: 'NFHS Boys',
    description: 'High school boys lacrosse',
    periodDuration: 12 * 60,
    periodCount: 4,
    shotClock: 80,
    overtimeDuration: 4 * 60,
    penaltyDurations: [30, 60, 120, 180],
    defaultPenalty: 60,
    releasableOnGoal: true,
    useCards: false,
    isBoxLacrosse: false,
  },
  'nll-box': {
    id: 'nll-box',
    name: 'NLL Box',
    description: 'National Lacrosse League (box)',
    periodDuration: 15 * 60,
    periodCount: 4,
    shotClock: 30,
    overtimeDuration: 5 * 60,
    penaltyDurations: [120, 300],
    defaultPenalty: 120,
    releasableOnGoal: true,
    useCards: false,
    isBoxLacrosse: true,
  },
  'pll': {
    id: 'pll',
    name: 'PLL',
    description: 'Premier Lacrosse League',
    periodDuration: 12 * 60,
    periodCount: 4,
    shotClock: 52,
    overtimeDuration: 12 * 60,
    penaltyDurations: [30, 60, 120, 180],
    defaultPenalty: 60,
    releasableOnGoal: true,
    useCards: false,
    isBoxLacrosse: false,
  },
  'ncaa-women': {
    id: 'ncaa-women',
    name: 'NCAA Women',
    description: 'College women\'s lacrosse',
    periodDuration: 15 * 60,
    periodCount: 4,
    shotClock: 90,
    overtimeDuration: 3 * 60,
    penaltyDurations: [60, 120],
    defaultPenalty: 60,
    releasableOnGoal: false,
    useCards: true,
    isBoxLacrosse: false,
  },
  'custom': {
    id: 'custom',
    name: 'Custom',
    description: 'Custom rules',
    periodDuration: 15 * 60,
    periodCount: 4,
    shotClock: 60,
    overtimeDuration: 4 * 60,
    penaltyDurations: [30, 60, 120, 180, 300],
    defaultPenalty: 60,
    releasableOnGoal: true,
    useCards: false,
    isBoxLacrosse: false,
  },
}

// ============================================
// Penalty System - 6 slots (3 per team)
// ============================================

export interface Penalty {
  id: string
  playerNumber: string
  playerName?: string
  startTime: number
  duration: number
  isReleasable: boolean
  isServed: boolean
  description?: string
}

// ============================================
// Team Types
// ============================================

export interface Player {
  id: string
  number: string
  name: string
  goals: number
  assists: number
  groundBalls: number
  saves: number
  penaltyMinutes: number
}

export interface Team {
  name: string
  color: string
  logoUrl?: string  // base64 data URL for team logo
  score: number
  shots: number
  groundBalls: number
  faceoffsWon: number
  turnovers: number
  penalties: Penalty[]
  players: Player[]
  timeoutsRemaining: number
}

// ============================================
// Game State
// ============================================

export type TeamSide = 'home' | 'away'

export interface GameEvent {
  id: string
  timestamp: number
  gameTime: number
  period: number
  team: TeamSide
  type: 'goal' | 'save' | 'penalty' | 'timeout' | 'period_end' | 'face_off'
  playerId?: string
  playerNumber?: string
  assistPlayerId?: string
  description?: string
  points: number
}

export interface GameStateSnapshot {
  home: Team
  away: Team
  gameTime: number
  shotClock: number
  currentPeriod: number
  events: GameEvent[]
}

export interface GameState {
  rulePreset: RulePresetId
  customRules: RulePreset | null
  home: Team
  away: Team
  currentPeriod: number
  gameTime: number
  shotClock: number
  isRunning: boolean
  isGameEnded: boolean
  isOvertime: boolean
  possession: TeamSide | null
  events: GameEvent[]
  history: GameStateSnapshot[]
  savedGames: SavedGame[]
}

export interface SavedGame {
  id: string
  date: string
  rulePreset: RulePresetId
  home: {
    name: string
    color: string
    score: number
    players: Player[]
  }
  away: {
    name: string
    color: string
    score: number
    players: Player[]
  }
  events: GameEvent[]
  finalPeriod: number
  duration: number
}

// ============================================
// Room System - Real-time Sync
// ============================================

export type RoomRole = 'control' | 'display' | 'view'

export interface SyncableGameState {
  rulePreset: RulePresetId
  home: Team
  away: Team
  currentPeriod: number
  gameTime: number
  shotClock: number
  isRunning: boolean
  isGameEnded: boolean
  isOvertime: boolean
  possession: TeamSide | null
  events: GameEvent[]
}

export interface Room {
  id: string
  hostId: string
  password?: string
  createdAt: number
  lastUpdated: number
  state: SyncableGameState
  activeConnections: number
}

export interface RoomState {
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null
  roomId: string | null
  role: RoomRole
  isHost: boolean
  lastSyncTime: number
}

// ============================================
// Power Play Calculation
// ============================================

export interface PowerPlayState {
  isActive: boolean
  advantage: TeamSide | null
  situation: string
}

export function calculatePowerPlay(home: Team, away: Team): PowerPlayState {
  const homeActivePenalties = home.penalties.filter(p => !p.isServed).length
  const awayActivePenalties = away.penalties.filter(p => !p.isServed).length

  const homePlayers = Math.max(3, 6 - homeActivePenalties)
  const awayPlayers = Math.max(3, 6 - awayActivePenalties)

  const situation = `${homePlayers}v${awayPlayers}`

  if (homePlayers > awayPlayers) {
    return { isActive: true, advantage: 'home', situation }
  } else if (awayPlayers > homePlayers) {
    return { isActive: true, advantage: 'away', situation }
  } else if (homePlayers < 6 && awayPlayers < 6) {
    return { isActive: true, advantage: null, situation }
  }

  return { isActive: false, advantage: null, situation: '6v6' }
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  RULE_PRESETS,
  calculatePowerPlay,
  type RulePresetId,
  type RulePreset,
  type Team,
  type Player,
  type Penalty,
  type GameEvent,
  type GameState,
  type GameStateSnapshot,
  type SavedGame,
  type TeamSide,
  type SyncableGameState,
  type PowerPlayState,
} from '../types'

export { RULE_PRESETS }
export type { RulePresetId, RulePreset, Team, Player, Penalty, GameEvent, TeamSide }

const MAX_PENALTIES_PER_TEAM = 3
const MAX_HISTORY = 50

interface GameActions {
  addGoal: (team: TeamSide, playerId?: string, assistPlayerId?: string) => void
  removeGoal: (team: TeamSide) => void
  addShot: (team: TeamSide) => void
  addGroundBall: (team: TeamSide, playerId?: string) => void
  addSave: (team: TeamSide, playerId?: string) => void
  wonFaceoff: (team: TeamSide) => void
  addTurnover: (team: TeamSide) => void
  addPenalty: (team: TeamSide, playerNumber: string, duration: number, description?: string, isReleasable?: boolean) => void
  removePenalty: (team: TeamSide, penaltyId: string) => void
  updatePenalties: () => void
  useTimeout: (team: TeamSide) => void
  startTimer: () => void
  stopTimer: () => void
  resetShotClock: () => void
  setGameTime: (time: number) => void
  setShotClock: (time: number) => void
  nextPeriod: () => void
  startOvertime: () => void
  setPossession: (team: TeamSide | null) => void
  togglePossession: () => void
  addPlayer: (team: TeamSide, number: string, name: string) => void
  removePlayer: (team: TeamSide, playerId: string) => void
  updatePlayer: (team: TeamSide, playerId: string, updates: Partial<Pick<Player, 'number' | 'name'>>) => void
  setTeamName: (team: TeamSide, name: string) => void
  setTeamColor: (team: TeamSide, color: string) => void
  setTeamLogo: (team: TeamSide, logoUrl: string | undefined) => void
  setRulePreset: (preset: RulePresetId) => void
  setCustomRules: (rules: Partial<RulePreset>) => void
  newGame: () => void
  undo: () => void
  endGame: () => void
  saveGame: () => void
  deleteSavedGame: (gameId: string) => void
  getCurrentRules: () => RulePreset
  getPowerPlay: () => PowerPlayState
  getSyncableState: () => SyncableGameState
  applySyncedState: (state: SyncableGameState) => void
}

const createPlayer = (number: string, name: string): Player => ({
  id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  number,
  name,
  goals: 0,
  assists: 0,
  groundBalls: 0,
  saves: 0,
  penaltyMinutes: 0,
})

const createTeam = (name: string, color: string): Team => ({
  name,
  color,
  score: 0,
  shots: 0,
  groundBalls: 0,
  faceoffsWon: 0,
  turnovers: 0,
  penalties: [],
  players: [],
  timeoutsRemaining: 3,
})

const initialState: GameState = {
  rulePreset: 'ncaa-men',
  customRules: null,
  home: createTeam('HOME', '#1e40af'),
  away: createTeam('AWAY', '#dc2626'),
  currentPeriod: 1,
  gameTime: RULE_PRESETS['ncaa-men'].periodDuration,
  shotClock: RULE_PRESETS['ncaa-men'].shotClock,
  isRunning: false,
  isGameEnded: false,
  isOvertime: false,
  possession: null,
  events: [],
  history: [],
  savedGames: [],
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addGoal: (team: TeamSide, playerId?: string, assistPlayerId?: string) => {
        const state = get()
        const teamData = state[team]
        const rules = get().getCurrentRules()

        const snapshot: GameStateSnapshot = {
          home: { ...state.home, penalties: [...state.home.penalties], players: state.home.players.map(p => ({ ...p })) },
          away: { ...state.away, penalties: [...state.away.penalties], players: state.away.players.map(p => ({ ...p })) },
          gameTime: state.gameTime,
          shotClock: state.shotClock,
          currentPeriod: state.currentPeriod,
          events: [...state.events],
        }
        const newHistory = [...state.history, snapshot].slice(-MAX_HISTORY)

        const updatedTeam = { ...teamData, players: [...teamData.players] }
        updatedTeam.score += 1

        let scorerNumber: string | undefined
        if (playerId) {
          const idx = updatedTeam.players.findIndex((p: Player) => p.id === playerId)
          if (idx !== -1) {
            const player = { ...updatedTeam.players[idx], goals: updatedTeam.players[idx].goals + 1 }
            scorerNumber = player.number
            updatedTeam.players[idx] = player
          }
        }

        if (assistPlayerId) {
          const idx = updatedTeam.players.findIndex((p: Player) => p.id === assistPlayerId)
          if (idx !== -1) {
            updatedTeam.players[idx] = { ...updatedTeam.players[idx], assists: updatedTeam.players[idx].assists + 1 }
          }
        }

        const event: GameEvent = {
          id: `event-${Date.now()}`,
          timestamp: Date.now(),
          gameTime: state.gameTime,
          period: state.currentPeriod,
          team,
          type: 'goal',
          playerId,
          playerNumber: scorerNumber,
          assistPlayerId,
          points: 1,
        }

        const otherTeam = team === 'home' ? 'away' : 'home'
        const otherTeamData = { ...state[otherTeam], penalties: [...state[otherTeam].penalties] }

        if (rules.releasableOnGoal) {
          const releasableIdx = otherTeamData.penalties.findIndex((p: Penalty) => p.isReleasable && !p.isServed)
          if (releasableIdx !== -1) {
            otherTeamData.penalties[releasableIdx] = { ...otherTeamData.penalties[releasableIdx], isServed: true }
          }
        }

        set({
          [team]: updatedTeam,
          [otherTeam]: otherTeamData,
          events: [...state.events, event],
          history: newHistory,
          shotClock: rules.shotClock,
        })
      },

      removeGoal: (team: TeamSide) => {
        const state = get()
        if (state[team].score <= 0) return
        set({ [team]: { ...state[team], score: state[team].score - 1 } })
      },

      addShot: (team: TeamSide) => {
        const state = get()
        set({ [team]: { ...state[team], shots: state[team].shots + 1 } })
      },

      addGroundBall: (team: TeamSide, playerId?: string) => {
        const state = get()
        const teamData = { ...state[team], players: [...state[team].players] }
        teamData.groundBalls += 1
        if (playerId) {
          const idx = teamData.players.findIndex((p: Player) => p.id === playerId)
          if (idx !== -1) {
            teamData.players[idx] = { ...teamData.players[idx], groundBalls: teamData.players[idx].groundBalls + 1 }
          }
        }
        set({ [team]: teamData })
      },

      addSave: (team: TeamSide, playerId?: string) => {
        const state = get()
        const teamData = { ...state[team], players: [...state[team].players] }
        if (playerId) {
          const idx = teamData.players.findIndex((p: Player) => p.id === playerId)
          if (idx !== -1) {
            teamData.players[idx] = { ...teamData.players[idx], saves: teamData.players[idx].saves + 1 }
          }
        }
        set({ [team]: teamData })
      },

      wonFaceoff: (team: TeamSide) => {
        const state = get()
        set({
          [team]: { ...state[team], faceoffsWon: state[team].faceoffsWon + 1 },
          possession: team,
        })
      },

      addTurnover: (team: TeamSide) => {
        const state = get()
        const otherTeam = team === 'home' ? 'away' : 'home'
        set({
          [team]: { ...state[team], turnovers: state[team].turnovers + 1 },
          possession: otherTeam,
        })
      },

      addPenalty: (team: TeamSide, playerNumber: string, duration: number, description?: string, isReleasable: boolean = true) => {
        const state = get()
        const teamData = state[team]
        const activePenalties = teamData.penalties.filter((p: Penalty) => !p.isServed)
        if (activePenalties.length >= MAX_PENALTIES_PER_TEAM) {
          console.warn('Maximum penalties reached for team')
          return
        }

        const penalty: Penalty = {
          id: `penalty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          playerNumber,
          startTime: Date.now(),
          duration,
          isReleasable,
          isServed: false,
          description,
        }

        set({
          [team]: { ...teamData, penalties: [...teamData.penalties, penalty] },
        })
      },

      removePenalty: (team: TeamSide, penaltyId: string) => {
        const state = get()
        set({
          [team]: { ...state[team], penalties: state[team].penalties.filter((p: Penalty) => p.id !== penaltyId) },
        })
      },

      updatePenalties: () => {
        const state = get()
        const now = Date.now()

        const updateTeamPenalties = (penalties: Penalty[]): Penalty[] => {
          return penalties.map((p: Penalty) => {
            if (p.isServed) return p
            const elapsed = (now - p.startTime) / 1000
            if (elapsed >= p.duration) {
              return { ...p, isServed: true }
            }
            return p
          })
        }

        const cleanPenalties = (penalties: Penalty[]): Penalty[] => {
          return penalties.filter((p: Penalty) => {
            if (!p.isServed) return true
            const elapsed = (now - p.startTime) / 1000
            return elapsed < p.duration + 5
          })
        }

        set({
          home: { ...state.home, penalties: cleanPenalties(updateTeamPenalties(state.home.penalties)) },
          away: { ...state.away, penalties: cleanPenalties(updateTeamPenalties(state.away.penalties)) },
        })
      },

      useTimeout: (team: TeamSide) => {
        const state = get()
        if (state[team].timeoutsRemaining <= 0) return
        set({
          [team]: { ...state[team], timeoutsRemaining: state[team].timeoutsRemaining - 1 },
          isRunning: false,
        })
      },

      startTimer: () => set({ isRunning: true }),
      stopTimer: () => set({ isRunning: false }),

      resetShotClock: () => {
        const rules = get().getCurrentRules()
        set({ shotClock: rules.shotClock })
      },

      setGameTime: (time: number) => set({ gameTime: Math.max(0, time) }),
      setShotClock: (time: number) => set({ shotClock: Math.max(0, time) }),

      nextPeriod: () => {
        const state = get()
        const rules = get().getCurrentRules()
        if (state.currentPeriod < rules.periodCount) {
          set({
            currentPeriod: state.currentPeriod + 1,
            gameTime: rules.periodDuration,
            shotClock: rules.shotClock,
            isRunning: false,
          })
        }
      },

      startOvertime: () => {
        const rules = get().getCurrentRules()
        set({
          isOvertime: true,
          gameTime: rules.overtimeDuration,
          shotClock: rules.shotClock,
          isRunning: false,
        })
      },

      setPossession: (team: TeamSide | null) => set({ possession: team }),

      togglePossession: () => {
        const state = get()
        if (state.possession === 'home') {
          set({ possession: 'away' })
        } else if (state.possession === 'away') {
          set({ possession: 'home' })
        }
      },

      addPlayer: (team: TeamSide, number: string, name: string) => {
        const state = get()
        const player = createPlayer(number, name)
        set({
          [team]: { ...state[team], players: [...state[team].players, player] },
        })
      },

      removePlayer: (team: TeamSide, playerId: string) => {
        const state = get()
        set({
          [team]: { ...state[team], players: state[team].players.filter((p: Player) => p.id !== playerId) },
        })
      },

      updatePlayer: (team: TeamSide, playerId: string, updates: Partial<Pick<Player, 'number' | 'name'>>) => {
        const state = get()
        set({
          [team]: {
            ...state[team],
            players: state[team].players.map((p: Player) => p.id === playerId ? { ...p, ...updates } : p),
          },
        })
      },

      setTeamName: (team: TeamSide, name: string) => {
        const state = get()
        set({ [team]: { ...state[team], name } })
      },

      setTeamColor: (team: TeamSide, color: string) => {
        const state = get()
        set({ [team]: { ...state[team], color } })
      },

      setTeamLogo: (team: TeamSide, logoUrl: string | undefined) => {
        const state = get()
        set({ [team]: { ...state[team], logoUrl } })
      },

      setRulePreset: (preset: RulePresetId) => {
        const rules = RULE_PRESETS[preset]
        set({
          rulePreset: preset,
          gameTime: rules.periodDuration,
          shotClock: rules.shotClock,
        })
      },

      setCustomRules: (updates: Partial<RulePreset>) => {
        const state = get()
        const currentRules = state.customRules || RULE_PRESETS['custom']
        set({
          rulePreset: 'custom',
          customRules: { ...currentRules, ...updates } as RulePreset,
        })
      },

      newGame: () => {
        const rules = get().getCurrentRules()
        set({
          home: createTeam('HOME', '#1e40af'),
          away: createTeam('AWAY', '#dc2626'),
          currentPeriod: 1,
          gameTime: rules.periodDuration,
          shotClock: rules.shotClock,
          isRunning: false,
          isGameEnded: false,
          isOvertime: false,
          possession: null,
          events: [],
          history: [],
        })
      },

      undo: () => {
        const state = get()
        if (state.history.length === 0) return
        const previous = state.history[state.history.length - 1]
        set({
          home: previous.home,
          away: previous.away,
          gameTime: previous.gameTime,
          shotClock: previous.shotClock,
          currentPeriod: previous.currentPeriod,
          events: previous.events,
          history: state.history.slice(0, -1),
        })
      },

      endGame: () => set({ isGameEnded: true, isRunning: false }),

      saveGame: () => {
        const state = get()
        const game: SavedGame = {
          id: `game-${Date.now()}`,
          date: new Date().toISOString(),
          rulePreset: state.rulePreset,
          home: {
            name: state.home.name,
            color: state.home.color,
            score: state.home.score,
            players: state.home.players.map((p: Player) => ({ ...p })),
          },
          away: {
            name: state.away.name,
            color: state.away.color,
            score: state.away.score,
            players: state.away.players.map((p: Player) => ({ ...p })),
          },
          events: [...state.events],
          finalPeriod: state.currentPeriod,
          duration: state.gameTime,
        }
        set({ savedGames: [game, ...state.savedGames].slice(0, 50) })
      },

      deleteSavedGame: (gameId: string) => {
        const state = get()
        set({ savedGames: state.savedGames.filter((g: SavedGame) => g.id !== gameId) })
      },

      getCurrentRules: (): RulePreset => {
        const state = get()
        if (state.rulePreset === 'custom' && state.customRules) {
          return state.customRules
        }
        return RULE_PRESETS[state.rulePreset]
      },

      getPowerPlay: (): PowerPlayState => {
        const state = get()
        return calculatePowerPlay(state.home, state.away)
      },

      getSyncableState: (): SyncableGameState => {
        const state = get()
        return {
          rulePreset: state.rulePreset,
          home: state.home,
          away: state.away,
          currentPeriod: state.currentPeriod,
          gameTime: state.gameTime,
          shotClock: state.shotClock,
          isRunning: state.isRunning,
          isGameEnded: state.isGameEnded,
          isOvertime: state.isOvertime,
          possession: state.possession,
          events: state.events,
        }
      },

      applySyncedState: (syncedState: SyncableGameState) => {
        set({
          rulePreset: syncedState.rulePreset,
          home: syncedState.home,
          away: syncedState.away,
          currentPeriod: syncedState.currentPeriod,
          gameTime: syncedState.gameTime,
          shotClock: syncedState.shotClock,
          isRunning: syncedState.isRunning,
          isGameEnded: syncedState.isGameEnded,
          isOvertime: syncedState.isOvertime,
          possession: syncedState.possession,
          events: syncedState.events,
        })
      },
    }),
    {
      name: 'lacrosse-scoreboard-storage',
      partialize: (state) => ({
        rulePreset: state.rulePreset,
        customRules: state.customRules,
        home: state.home,
        away: state.away,
        currentPeriod: state.currentPeriod,
        gameTime: state.gameTime,
        shotClock: state.shotClock,
        isGameEnded: state.isGameEnded,
        isOvertime: state.isOvertime,
        events: state.events,
        savedGames: state.savedGames,
      }),
    }
  )
)

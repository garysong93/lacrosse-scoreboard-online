import { create } from 'zustand'
import type { RoomRole, RoomState, SyncableGameState } from '../types'
import {
  initializeFirebase,
  isFirebaseConfigured,
  createRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
  updateRoomState,
  subscribeToRoom,
  isRoomHost,
  getDeviceId,
} from '../lib/firebase'
import type { Unsubscribe } from 'firebase/database'

interface RoomActions {
  initialize: () => void
  createNewRoom: (state: SyncableGameState, password?: string) => Promise<boolean>
  joinExistingRoom: (roomId: string, role: RoomRole, password?: string) => Promise<boolean>
  leaveCurrentRoom: () => Promise<void>
  deleteCurrentRoom: () => Promise<boolean>
  syncState: (state: SyncableGameState) => Promise<void>
  setOnStateUpdate: (callback: ((state: SyncableGameState) => void) | null) => void
  setRole: (role: RoomRole) => void
  setConnectionError: (error: string | null) => void
}

const initialState: RoomState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  roomId: null,
  role: 'control',
  isHost: false,
  lastSyncTime: 0,
}

let roomUnsubscribe: Unsubscribe | null = null
let stateUpdateCallback: ((state: SyncableGameState) => void) | null = null

export const useRoomStore = create<RoomState & RoomActions>()((set, get) => ({
  ...initialState,

  initialize: () => {
    if (isFirebaseConfigured()) {
      const success = initializeFirebase()
      if (!success) {
        set({ connectionError: 'Failed to initialize Firebase' })
      }
    }
  },

  createNewRoom: async (state: SyncableGameState, password?: string) => {
    set({ isConnecting: true, connectionError: null })

    try {
      const room = await createRoom(state, password)
      if (!room) {
        set({ isConnecting: false, connectionError: 'Failed to create room' })
        return false
      }

      roomUnsubscribe = subscribeToRoom(
        room.id,
        (newState: SyncableGameState) => {
          set({ lastSyncTime: Date.now() })
          stateUpdateCallback?.(newState)
        },
        (error: Error) => {
          set({ connectionError: error.message, isConnected: false })
        }
      )

      set({
        isConnecting: false,
        isConnected: true,
        roomId: room.id,
        role: 'control',
        isHost: true,
        connectionError: null,
      })

      return true
    } catch (error) {
      set({
        isConnecting: false,
        connectionError: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  },

  joinExistingRoom: async (roomId: string, role: RoomRole, password?: string) => {
    set({ isConnecting: true, connectionError: null })

    try {
      const room = await joinRoom(roomId, password)
      if (!room) {
        set({ isConnecting: false, connectionError: 'Room not found or incorrect password' })
        return false
      }

      const host = await isRoomHost(roomId)

      roomUnsubscribe = subscribeToRoom(
        roomId,
        (newState: SyncableGameState) => {
          set({ lastSyncTime: Date.now() })
          stateUpdateCallback?.(newState)
        },
        (error: Error) => {
          set({ connectionError: error.message, isConnected: false })
        }
      )

      if (stateUpdateCallback) {
        stateUpdateCallback(room.state)
      }

      set({
        isConnecting: false,
        isConnected: true,
        roomId,
        role: host ? 'control' : role,
        isHost: host,
        connectionError: null,
      })

      return true
    } catch (error) {
      set({
        isConnecting: false,
        connectionError: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  },

  leaveCurrentRoom: async () => {
    const { roomId } = get()

    if (roomUnsubscribe) {
      roomUnsubscribe()
      roomUnsubscribe = null
    }

    if (roomId) {
      await leaveRoom(roomId)
    }

    set({
      isConnected: false,
      roomId: null,
      role: 'control',
      isHost: false,
      connectionError: null,
    })
  },

  deleteCurrentRoom: async () => {
    const { roomId, isHost } = get()

    if (!roomId || !isHost) {
      return false
    }

    if (roomUnsubscribe) {
      roomUnsubscribe()
      roomUnsubscribe = null
    }

    const success = await deleteRoom(roomId)

    if (success) {
      set({
        isConnected: false,
        roomId: null,
        role: 'control',
        isHost: false,
        connectionError: null,
      })
    }

    return success
  },

  syncState: async (state: SyncableGameState) => {
    const { roomId, role, isHost } = get()

    if (!roomId || (role !== 'control' && !isHost)) {
      return
    }

    const success = await updateRoomState(roomId, state)
    if (success) {
      set({ lastSyncTime: Date.now() })
    }
  },

  setOnStateUpdate: (callback: ((state: SyncableGameState) => void) | null) => {
    stateUpdateCallback = callback
  },

  setRole: (role: RoomRole) => {
    set({ role })
  },

  setConnectionError: (error: string | null) => {
    set({ connectionError: error })
  },
}))

export function useIsFirebaseAvailable(): boolean {
  return isFirebaseConfigured()
}

export function getRoomShareUrl(roomId: string): string {
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?room=${roomId}`
}

export { getDeviceId }

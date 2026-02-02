/**
 * Firebase Realtime Database Integration for Lacrosse Scoreboard
 *
 * This module handles real-time synchronization between devices.
 * Uses Firebase's free Spark Plan which supports:
 * - 100 simultaneous connections
 * - 1GB storage
 * - 10GB/month download
 *
 * Setup:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Realtime Database
 * 3. Set up security rules (see below)
 * 4. Copy your config to .env file
 *
 * Security Rules (paste in Firebase console):
 * ```json
 * {
 *   "rules": {
 *     "rooms": {
 *       "$roomId": {
 *         ".read": true,
 *         ".write": true
 *       }
 *     }
 *   }
 * }
 * ```
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  remove,
  update,
  serverTimestamp,
  type Database,
  type Unsubscribe,
  type DataSnapshot,
} from 'firebase/database'
import type { Room, SyncableGameState } from '../types'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let db: Database | null = null

/**
 * Check if Firebase is configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId
  )
}

/**
 * Initialize Firebase (call once at app startup)
 */
export function initializeFirebase(): boolean {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured. Real-time sync disabled.')
    return false
  }

  try {
    app = initializeApp(firebaseConfig)
    db = getDatabase(app)
    return true
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    return false
  }
}

/**
 * Generate a unique room ID
 * Format: LAX-XXXX (e.g., LAX-A7B3)
 */
export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars (I, O, 0, 1)
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `LAX-${code}`
}

/**
 * Generate a unique device ID (stored in localStorage)
 */
export function getDeviceId(): string {
  const STORAGE_KEY = 'lacrosse-device-id'
  let deviceId = localStorage.getItem(STORAGE_KEY)
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(STORAGE_KEY, deviceId)
  }
  return deviceId
}

// ============================================
// Room CRUD Operations
// ============================================

/**
 * Create a new room
 */
export async function createRoom(
  initialState: SyncableGameState,
  password?: string
): Promise<Room | null> {
  if (!db) {
    console.error('Firebase not initialized')
    return null
  }

  const roomId = generateRoomId()
  const hostId = getDeviceId()

  const room: Room = {
    id: roomId,
    hostId,
    password,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    state: initialState,
    activeConnections: 1,
  }

  try {
    const roomRef = ref(db, `rooms/${roomId}`)
    await set(roomRef, {
      ...room,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    })
    return room
  } catch (error) {
    console.error('Failed to create room:', error)
    return null
  }
}

/**
 * Join an existing room
 */
export async function joinRoom(
  roomId: string,
  password?: string
): Promise<Room | null> {
  if (!db) {
    console.error('Firebase not initialized')
    return null
  }

  try {
    const roomRef = ref(db, `rooms/${roomId}`)
    const snapshot = await get(roomRef)

    if (!snapshot.exists()) {
      console.error('Room not found:', roomId)
      return null
    }

    const room = snapshot.val() as Room

    // Check password if room has one
    if (room.password && room.password !== password) {
      console.error('Incorrect room password')
      return null
    }

    // Increment active connections
    await update(roomRef, {
      activeConnections: (room.activeConnections || 0) + 1,
      lastUpdated: serverTimestamp(),
    })

    return room
  } catch (error) {
    console.error('Failed to join room:', error)
    return null
  }
}

/**
 * Leave a room
 */
export async function leaveRoom(roomId: string): Promise<void> {
  if (!db) return

  try {
    const roomRef = ref(db, `rooms/${roomId}`)
    const snapshot = await get(roomRef)

    if (snapshot.exists()) {
      const room = snapshot.val() as Room
      const newCount = Math.max(0, (room.activeConnections || 1) - 1)

      if (newCount === 0 && room.hostId === getDeviceId()) {
        // Host leaving and no one else - delete room
        await remove(roomRef)
      } else {
        await update(roomRef, {
          activeConnections: newCount,
          lastUpdated: serverTimestamp(),
        })
      }
    }
  } catch (error) {
    console.error('Failed to leave room:', error)
  }
}

/**
 * Delete a room (host only)
 */
export async function deleteRoom(roomId: string): Promise<boolean> {
  if (!db) return false

  try {
    const roomRef = ref(db, `rooms/${roomId}`)
    const snapshot = await get(roomRef)

    if (!snapshot.exists()) return true

    const room = snapshot.val() as Room
    if (room.hostId !== getDeviceId()) {
      console.error('Only host can delete room')
      return false
    }

    await remove(roomRef)
    return true
  } catch (error) {
    console.error('Failed to delete room:', error)
    return false
  }
}

/**
 * Update room state (host only)
 */
export async function updateRoomState(
  roomId: string,
  state: SyncableGameState
): Promise<boolean> {
  if (!db) return false

  try {
    const roomRef = ref(db, `rooms/${roomId}`)
    await update(roomRef, {
      state,
      lastUpdated: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error('Failed to update room state:', error)
    return false
  }
}

/**
 * Check if current device is the host of a room
 */
export async function isRoomHost(roomId: string): Promise<boolean> {
  if (!db) return false

  try {
    const roomRef = ref(db, `rooms/${roomId}`)
    const snapshot = await get(roomRef)

    if (!snapshot.exists()) return false

    const room = snapshot.val() as Room
    return room.hostId === getDeviceId()
  } catch (error) {
    return false
  }
}

// ============================================
// Real-time Subscriptions
// ============================================

/**
 * Subscribe to room state changes
 * Returns an unsubscribe function
 */
export function subscribeToRoom(
  roomId: string,
  onStateChange: (state: SyncableGameState) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  if (!db) {
    onError?.(new Error('Firebase not initialized'))
    return null
  }

  try {
    const stateRef = ref(db, `rooms/${roomId}/state`)
    const unsubscribe = onValue(
      stateRef,
      (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          onStateChange(snapshot.val() as SyncableGameState)
        }
      },
      (error: Error) => {
        console.error('Room subscription error:', error)
        onError?.(error)
      }
    )

    return unsubscribe
  } catch (error) {
    console.error('Failed to subscribe to room:', error)
    onError?.(error as Error)
    return null
  }
}

/**
 * Subscribe to room metadata (connections, etc.)
 */
export function subscribeToRoomMeta(
  roomId: string,
  onMetaChange: (room: Room) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  if (!db) {
    onError?.(new Error('Firebase not initialized'))
    return null
  }

  try {
    const roomRef = ref(db, `rooms/${roomId}`)
    const unsubscribe = onValue(
      roomRef,
      (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          onMetaChange(snapshot.val() as Room)
        }
      },
      (error: Error) => {
        console.error('Room meta subscription error:', error)
        onError?.(error)
      }
    )

    return unsubscribe
  } catch (error) {
    console.error('Failed to subscribe to room meta:', error)
    onError?.(error as Error)
    return null
  }
}

// ============================================
// Cleanup Utilities
// ============================================

/**
 * Clean up stale rooms (older than 24 hours)
 * This would typically be done by a cloud function,
 * but can be called periodically from the client
 */
export async function cleanupStaleRooms(): Promise<void> {
  if (!db) return

  try {
    const roomsRef = ref(db, 'rooms')
    const snapshot = await get(roomsRef)

    if (!snapshot.exists()) return

    const rooms = snapshot.val() as Record<string, Room>
    const now = Date.now()
    const staleThreshold = 24 * 60 * 60 * 1000 // 24 hours

    for (const [roomId, room] of Object.entries(rooms)) {
      if (now - room.lastUpdated > staleThreshold) {
        await remove(ref(db, `rooms/${roomId}`))
        console.log('Cleaned up stale room:', roomId)
      }
    }
  } catch (error) {
    console.error('Failed to cleanup stale rooms:', error)
  }
}

import { useState, useEffect } from 'react'
import { useRoomStore, useIsFirebaseAvailable, getRoomShareUrl } from '../stores/useRoomStore'
import { useGameStore } from '../stores/useGameStore'
import { QRCode } from './QRCode'
import type { RoomRole } from '../types'

interface RoomManagerProps {
  onClose: () => void
}

export function RoomManager({ onClose }: RoomManagerProps) {
  const isFirebaseAvailable = useIsFirebaseAvailable()

  const {
    isConnected,
    isConnecting,
    connectionError,
    roomId,
    role,
    isHost,
    initialize,
    createNewRoom,
    joinExistingRoom,
    leaveCurrentRoom,
    setRole,
    setOnStateUpdate,
  } = useRoomStore()

  const { getSyncableState, applySyncedState } = useGameStore()

  const [joinRoomId, setJoinRoomId] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [joinRole, setJoinRole] = useState<RoomRole>('view')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (role !== 'control') {
      setOnStateUpdate((state) => {
        applySyncedState(state)
      })
    }
    return () => setOnStateUpdate(null)
  }, [role, applySyncedState, setOnStateUpdate])

  const handleCreateRoom = async () => {
    const state = getSyncableState()
    await createNewRoom(state, createPassword || undefined)
  }

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) return
    await joinExistingRoom(
      joinRoomId.trim().toUpperCase(),
      joinRole,
      joinPassword || undefined
    )
  }

  const handleLeaveRoom = async () => {
    await leaveCurrentRoom()
  }

  const handleCopyLink = async () => {
    if (!roomId) return
    const url = getRoomShareUrl(roomId)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCode = async () => {
    if (!roomId) return
    await navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isFirebaseAvailable) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>Live Sync</h3>
          <div className="sync-notice">
            <p>Real-time sync is not configured.</p>
            <p className="sync-notice-detail">
              To enable live game sharing, set up Firebase:
            </p>
            <ol className="sync-setup-steps">
              <li>Create a Firebase project</li>
              <li>Enable Realtime Database</li>
              <li>Add your Firebase config to environment variables</li>
            </ol>
          </div>
          <div className="modal-actions">
            <button className="modal-btn cancel" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Live Game Sync</h3>

        {connectionError && (
          <div className="error-banner">{connectionError}</div>
        )}

        {isConnected && roomId ? (
          <div className="room-connected">
            <div className="room-info">
              <div className="room-code-display">
                <span className="room-code-label">Room Code</span>
                <span className="room-code">{roomId}</span>
              </div>

              <div className="room-qr">
                <QRCode value={getRoomShareUrl(roomId)} size={150} />
              </div>

              <div className="room-role-badge">
                {isHost ? 'HOST' : role.toUpperCase()}
              </div>
            </div>

            <div className="room-share-buttons">
              <button className="share-btn" onClick={handleCopyCode}>
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button className="share-btn" onClick={handleCopyLink}>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {isHost && (
              <div className="room-controls">
                <p className="room-hint">
                  Share the code or QR with others to let them view this game in real-time.
                </p>
              </div>
            )}

            {!isHost && (
              <div className="role-selector">
                <label>View Mode:</label>
                <div className="role-buttons">
                  <button
                    className={`role-btn ${role === 'display' ? 'active' : ''}`}
                    onClick={() => setRole('display')}
                  >
                    Display
                    <span className="role-desc">Full screen scoreboard</span>
                  </button>
                  <button
                    className={`role-btn ${role === 'view' ? 'active' : ''}`}
                    onClick={() => setRole('view')}
                  >
                    Viewer
                    <span className="role-desc">Compact mobile view</span>
                  </button>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="modal-btn danger" onClick={handleLeaveRoom}>
                {isHost ? 'End Session' : 'Leave Room'}
              </button>
              <button className="modal-btn cancel" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <div className="room-setup">
            <div className="room-section">
              <h4>Start a New Session</h4>
              <p className="section-desc">
                Create a room to share this game live with spectators.
              </p>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Password (optional)"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="room-input"
                />
              </div>

              <button
                className="action-btn primary"
                onClick={handleCreateRoom}
                disabled={isConnecting}
              >
                {isConnecting ? 'Creating...' : 'Create Room'}
              </button>
            </div>

            <div className="room-divider">
              <span>OR</span>
            </div>

            <div className="room-section">
              <h4>Join Existing Room</h4>
              <p className="section-desc">
                Enter a room code to view a live game.
              </p>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Room Code (e.g., LAX-A7B3)"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  className="room-input"
                  maxLength={8}
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Password (if required)"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="room-input"
                />
              </div>

              <div className="role-selector">
                <label>Join as:</label>
                <div className="role-buttons">
                  <button
                    className={`role-btn ${joinRole === 'display' ? 'active' : ''}`}
                    onClick={() => setJoinRole('display')}
                  >
                    Display
                    <span className="role-desc">Full screen for venue display</span>
                  </button>
                  <button
                    className={`role-btn ${joinRole === 'view' ? 'active' : ''}`}
                    onClick={() => setJoinRole('view')}
                  >
                    Viewer
                    <span className="role-desc">Compact view for mobile</span>
                  </button>
                </div>
              </div>

              <button
                className="action-btn secondary"
                onClick={handleJoinRoom}
                disabled={isConnecting || !joinRoomId.trim()}
              >
                {isConnecting ? 'Joining...' : 'Join Room'}
              </button>
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomManager

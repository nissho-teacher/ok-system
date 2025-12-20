import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import './App.css'

// 環境変数からサーバーURLを取得（デフォルトはローカル開発用）
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
const socket = io(SOCKET_URL)

function App() {
  const [count, setCount] = useState(0)
  const [isOK, setIsOK] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [activeUsers, setActiveUsers] = useState(0)

  useEffect(() => {
    // 初期接続状態を確認
    if (socket.connected) {
      setIsConnected(true)
      setIsConnecting(false)
      // 既に接続している場合は状態をリクエスト
      socket.emit('request-state')
    }

    // サーバーから最新のカウンターを受信
    socket.on('counter-update', (newCount) => {
      setCount(newCount)
    })

    // 接続中のユーザー数を受信
    socket.on('active-users', (userCount) => {
      setActiveUsers(userCount)
    })

    socket.on('connect', () => {
      setIsConnected(true)
      setIsConnecting(false)
      // 接続時に最新の状態をリクエスト
      socket.emit('request-state')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      setIsConnecting(false)
    })

    socket.on('connect_error', () => {
      setIsConnecting(true) // 接続エラー時は再試行中
    })

    return () => {
      socket.off('counter-update')
      socket.off('active-users')
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
    }
  }, [])

  // 接続状態が変わったときに状態を同期
  useEffect(() => {
    if (isConnected) {
      socket.emit('sync-state', isOK)
    }
  }, [isConnected, isOK])

  const handleClick = () => {
    // 接続していない場合は何もしない
    if (!isConnected) return

    const newIsOK = !isOK
    let newCount
    if (isOK) {
      newCount = count + 1
    } else {
      newCount = count - 1
    }

    // サーバーに新しいカウンターと状態を送信
    socket.emit('update-counter', { newCount, isOK: newIsOK })
    setIsOK(newIsOK)
  }

  return (
    <div className="app-container">
      <div className="status-panel">
        <div className="active-users-display">
          👁️ {activeUsers} 人が視聴中
        </div>
        <div className="server-status">
          {isConnecting ? '🟡 接続中...' : isConnected ? '🟢 接続' : '🔴 切断'}
        </div>
      </div>
      <div className="main-content">
        {isConnecting && (
          <div className="connecting-overlay">
            <div className="connecting-message">
              <div className="spinner"></div>
              <p>サーバーに接続中...</p>
              <p className="sub-message">初回起動時は最大1分ほどかかります</p>
            </div>
          </div>
        )}
        <div className="counter-display">
          {count}
        </div>
        <div className="button-container">
          <button
            className={`action-button ${isOK ? '' : 'pressed'} ${!isConnected ? 'disabled' : ''}`}
            onClick={handleClick}
            disabled={!isConnected}
          >
            {isOK ? 'OK' : 'Cancel'}
          </button>
          <div className="connection-status">
            {isConnecting ? '🟡 接続中...' : isConnected ? '🟢 接続中' : '🔴 切断'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

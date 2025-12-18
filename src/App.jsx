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

  useEffect(() => {
    // サーバーから最新のカウンターを受信
    socket.on('counter-update', (newCount) => {
      setCount(newCount)
    })

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      socket.off('counter-update')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  const handleClick = () => {
    let newCount
    if (isOK) {
      newCount = count + 1
    } else {
      newCount = count - 1
    }

    // サーバーに新しいカウンターを送信
    socket.emit('update-counter', newCount)
    setIsOK(!isOK)
  }

  return (
    <div className="app-container">
      <div className="connection-status">
        {isConnected ? '🟢 接続中' : '🔴 切断'}
      </div>
      <div className="counter-display">
        {count}
      </div>
      <div className="button-container">
        <button
          className={`action-button ${isOK ? '' : 'pressed'}`}
          onClick={handleClick}
        >
          {isOK ? 'OK' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}

export default App

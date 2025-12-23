import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

// 環境変数からフロントエンドのURLを取得（デフォルトはローカル開発用）
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173']
    : true; // 開発環境では全てのオリジンを許可

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 各クライアントの状態を管理（true=OK, false=Cancel）
const clientStates = new Map();

// クライアントの状態からカウンターを計算する関数
function calculateCounter() {
    let counter = 0;
    for (const [socketId, isOK] of clientStates.entries()) {
        if (!isOK) { // Cancel状態の場合
            counter++;
        }
    }
    return counter;
}

io.on('connection', (socket) => {
    // 新しいクライアントの状態をOKで初期化
    clientStates.set(socket.id, true);

    // 現在のカウンターを計算して送信
    const currentCounter = calculateCounter();
    socket.emit('counter-update', currentCounter);

    // 接続数を計算
    const activeConnections = io.sockets.sockets.size;

    // 新しいクライアントに接続数を送信
    socket.emit('active-users', activeConnections);
    // 他の全クライアントにも接続数を送信
    socket.broadcast.emit('active-users', activeConnections);

    // カウンター更新を受信
    socket.on('update-counter', (data) => {
        // クライアントの状態を更新
        clientStates.set(socket.id, data.isOK);
        // 状態から新しいカウンターを計算
        const newCounter = calculateCounter();
        // 全クライアントに新しいカウンターをブロードキャスト
        io.emit('counter-update', newCounter);
    });

    // 再接続時の状態同期
    socket.on('sync-state', (isOK) => {
        // クライアントの状態を更新
        clientStates.set(socket.id, isOK);
    });

    // クライアントからの状態リクエスト
    socket.on('request-state', () => {
        const activeConnections = io.sockets.sockets.size;
        const currentCounter = calculateCounter();
        socket.emit('counter-update', currentCounter);
        socket.emit('active-users', activeConnections);
    });

    socket.on('disconnect', () => {
        // クライアントの状態を削除
        clientStates.delete(socket.id);

        // 状態から新しいカウンターを計算
        const newCounter = calculateCounter();
        io.emit('counter-update', newCounter);

        // 切断後の接続数を全クライアントに送信
        const activeConnections = io.sockets.sockets.size;
        io.emit('active-users', activeConnections);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

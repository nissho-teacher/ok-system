import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

// 環境変数からフロントエンドのURLを取得（デフォルトはローカル開発用）
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173']
    : ['http://localhost:5173'];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

let sharedCounter = 0;

io.on('connection', (socket) => {
    console.log('ユーザーが接続しました:', socket.id);

    // 新しいクライアントに現在のカウンターを送信
    socket.emit('counter-update', sharedCounter);

    // カウンター更新を受信
    socket.on('update-counter', (newCount) => {
        sharedCounter = newCount;
        // 全クライアントに新しいカウンターをブロードキャスト
        io.emit('counter-update', sharedCounter);
    });

    socket.on('disconnect', () => {
        console.log('ユーザーが切断しました:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
});

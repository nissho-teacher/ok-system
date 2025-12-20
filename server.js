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

let sharedCounter = 0;
// 各クライアントの状態を管理（true=OK, false=Cancel）
const clientStates = new Map();

io.on('connection', (socket) => {
    console.log('ユーザーが接続しました:', socket.id);

    // 新しいクライアントの状態をOKで初期化
    clientStates.set(socket.id, true);

    // 新しいクライアントに現在のカウンターを送信
    socket.emit('counter-update', sharedCounter);

    // 接続数を計算
    const activeConnections = io.sockets.sockets.size;
    console.log('現在の接続数:', activeConnections);

    // 新しいクライアントに接続数を送信
    socket.emit('active-users', activeConnections);
    // 他の全クライアントにも接続数を送信
    socket.broadcast.emit('active-users', activeConnections);

    // カウンター更新を受信
    socket.on('update-counter', (data) => {
        sharedCounter = data.newCount;
        // クライアントの状態を更新
        clientStates.set(socket.id, data.isOK);
        // 全クライアントに新しいカウンターをブロードキャスト
        io.emit('counter-update', sharedCounter);
    });

    // 再接続時の状態同期
    socket.on('sync-state', (isOK) => {
        // クライアントの状態を更新
        clientStates.set(socket.id, isOK);
        console.log('クライアント状態を同期:', socket.id, isOK ? 'OK' : 'Cancel');
    });

    // クライアントからの状態リクエスト
    socket.on('request-state', () => {
        const activeConnections = io.sockets.sockets.size;
        socket.emit('counter-update', sharedCounter);
        socket.emit('active-users', activeConnections);
        console.log('状態をリクエストされました:', socket.id, '接続数:', activeConnections);
    });

    socket.on('disconnect', () => {
        console.log('ユーザーが切断しました:', socket.id);

        // クライアントがCancel状態で切断した場合、カウンターを-1して元に戻す
        const clientState = clientStates.get(socket.id);
        if (clientState === false) {
            sharedCounter -= 1;
            io.emit('counter-update', sharedCounter);
            console.log('Cancel状態で切断されたため、カウンターを調整:', sharedCounter);
        }

        // クライアントの状態を削除
        clientStates.delete(socket.id);

        // 切断後の接続数を全クライアントに送信
        const activeConnections = io.sockets.sockets.size;
        io.emit('active-users', activeConnections);
        console.log('現在の接続数:', activeConnections);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
    console.log(`ネットワークアクセス: http://[あなたのIPアドレス]:${PORT}`);
});

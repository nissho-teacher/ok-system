# OK System

マルチユーザー対応のリアルタイムカウンターアプリケーション

## 機能

- リアルタイムカウンター共有
- OK/Cancelボタンによるカウントアップ/ダウン
- Socket.ioによる複数ユーザー間の同期

## ローカル開発

### 必要な環境

- Node.js (v18以上推奨)
- npm

### セットアップ

1. 依存パッケージのインストール:
```bash
npm install
```

2. 環境変数の設定:
`.env.local`ファイルが自動作成されています。

3. サーバーの起動（別々のターミナルで実行）:

**ターミナル1 - バックエンド:**
```bash
npm run server
```

**ターミナル2 - フロントエンド:**
```bash
npm run dev
```

4. ブラウザで開く:
```
http://localhost:5173
```

複数のタブやデバイスで開くと、カウンターが同期されます。

## デプロイ手順

### 1. バックエンドをRenderにデプロイ

1. [Render](https://render.com/)にサインアップ/ログイン
2. 「New +」→「Web Service」を選択
3. GitHubリポジトリを接続
4. 設定:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `FRONTEND_URL`: `https://your-app.vercel.app`（後で更新）

5. デプロイ完了後、URLをメモ（例: `https://ok-system-server.onrender.com`）

### 2. フロントエンドをVercelにデプロイ

1. [Vercel](https://vercel.com/)にサインアップ/ログイン
2. 「Add New」→「Project」を選択
3. GitHubリポジトリをインポート
4. 環境変数を設定:
   - `VITE_SOCKET_URL`: RenderのURL（例: `https://ok-system-server.onrender.com`）
5. デプロイ

### 3. 環境変数の更新

1. VercelのデプロイURL（例: `https://ok-system.vercel.app`）をメモ
2. Renderの管理画面で環境変数`FRONTEND_URL`を更新
3. Renderサービスを再デプロイ

## 技術スタック

- **フロントエンド**: React + Vite
- **バックエンド**: Node.js + Express
- **リアルタイム通信**: Socket.io
- **デプロイ**: Vercel (Frontend) + Render (Backend)

## ライセンス

MIT

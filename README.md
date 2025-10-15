# 🎧 now-playing-to-slack

Spotifyで再生中の曲を自動でSlackチャンネルに投稿するBotです。  
日本時間に対応し、**平日9:00〜21:00のみ稼働**、深夜・土日祝日は停止します。

---

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

---

## ✨ 主な機能
- 🎶 Spotifyの再生中の曲をSlackに自動投稿  
- 🕒 稼働時間を日本時間で管理（平日9:00〜21:00）  
- 🎌 日本の祝日を自動判定（[holidays-jp API](https://holidays-jp.github.io/)）  
- 🐳 Node.js / Docker 両対応  
- ⚙️ `.env` による簡単設定  

---

## 🚀 セットアップ

### 1. リポジトリをクローン
```bash
git clone https://github.com/hiromutsuchiya/now-playing-to-slack.git
cd now-playing-to-slack
cp .env.example .env
````

---

## 🎧 Spotify アプリ設定方法

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) にアクセス
2. 「Create an App」をクリック
3. **Redirect URI** に以下を追加して保存

   ```
   http://127.0.0.1:5173/callback
   ```

   ⚠️ `https://localhost` は使えません
4. `Client ID` と `Client Secret` を控える
5. 認可URLを作成（`{client_id}` を置換）：

   ```
   https://accounts.spotify.com/authorize?client_id={client_id}&response_type=code&redirect_uri=http://127.0.0.1:5173/callback&scope=user-read-currently-playing%20user-read-playback-state
   ```
6. 認可後にリダイレクトされたURLの `?code=` の後ろの文字列をコピー
7. リフレッシュトークンを取得：

   ```bash
   node scripts/get-refresh-token.js
   ```

   （`.env` 内の `SPOTIFY_AUTH_CODE` と `SPOTIFY_REDIRECT_URI` を使います）
8. 出力内の `"refresh_token"` を `.env` の `SPOTIFY_REFRESH_TOKEN` に貼り付け

---

## 💬 Slack Bot 設定方法

1. [Slack API: Your Apps](https://api.slack.com/apps) へアクセス
2. 「Create New App」→「From scratch」
3. 「Bot Token Scopes」で `chat:write` を追加
4. 「Install to Workspace」でインストール
5. **Bot User OAuth Token (xoxb-...)** をコピーし `.env` に貼る
6. Slackチャンネルで追加したBotを招待：

   ```
   # 例
   /invite @DJ Tsucchii
   ```

---

## ⚙️ `.env` 設定例

```bash
# ============================
# 🎧 Spotify API credentials
# ============================

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
SPOTIFY_AUTH_CODE=your_spotify_auth_code
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token

# ============================
# 💬 Slack Bot credentials
# ============================

SLACK_TOKEN=xoxb-your-slack-bot-token
# 投稿したいSlackチャンネル名（先頭の#は不要）
SLACK_CHANNEL=now-playing

# ============================
# ⚙️ Settings
# ============================
CHECK_INTERVAL=20
```

---

## 🏃 実行方法

### Node.js で実行

```bash
npm install
npm start
```

### Docker で実行

```bash
docker compose build
docker compose up -d
docker compose logs -f
```

---

## 🕒 稼働ルール

| 条件           | 動作        |
| ------------ | --------- |
| 平日9:00〜21:00 | ✅ 稼働      |
| 土日・祝日・夜間     | ⏸ 停止      |
| 同じ曲が続く       | 🚫 重複投稿なし |

---

## 💡 トラブルシューティング

| エラー / 状況                                | 対応方法                                         |
| --------------------------------------- | -------------------------------------------- |
| `INVALID_CLIENT: Insecure redirect URI` | `https://localhost` → `http://127.0.0.1` に変更 |
| `127.0.0.1 接続が拒否されました`                  | 正常です。`code=` の値をコピーすればOK                     |
| `Error: not_in_channel`                 | Slackで `/invite @DJ Tsucchii` を実行            |
| 投稿がない                                   | Spotifyアカウントが一致しているか確認                       |
| `Spotify token error`                   | トークンが無効。再取得してください                            |
| Dockerで無反応                              | 稼働時間外のため一時停止中です                              |

---

## 🪪 ライセンス

MIT © 2025 Hiromu Tsuchiya

---

## ☕ 開発メモ

* Node.js v20.11+
* Docker base: `node:20.11-alpine`
* 日本の祝日データ: [holidays-jp API](https://holidays-jp.github.io/api/v1/date.json)
* 稼働時間: 平日 9:00〜21:00 JST

---


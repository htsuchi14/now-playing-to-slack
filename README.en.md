# 🎧 now-playing-to-slack

A Node.js + Docker bot that automatically posts your currently playing **Spotify** track to **Slack** —  
with Japan timezone–aware scheduling (runs only on weekdays 9:00–21:00 JST, pauses at night, weekends, and national holidays).

---

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

---

## ✨ Features
- 🎶 Posts the currently playing Spotify track to Slack  
- 🇯🇵 Japan timezone–aware (active weekdays 09:00–21:00 JST)  
- 🎌 Automatically detects Japanese national holidays via [holidays-jp API](https://holidays-jp.github.io/)  
- 🔁 Refreshes Spotify tokens automatically  
- 🐳 Supports both Node.js and Docker  
- ⚙️ Easy `.env` configuration  

---

## 🚀 Setup

### 1. Clone the repository
```bash
git clone https://github.com/hiromutsuchiya/now-playing-to-slack.git
cd now-playing-to-slack
cp .env.example .env
````

---

## 🎧 Spotify Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **Create an App**
3. Add a **Redirect URI**

   ```
   http://127.0.0.1:5173/callback
   ```

   ⚠️ `https://localhost` will NOT work
4. Save and copy your **Client ID** and **Client Secret**
5. Open the following URL (replace `{client_id}`):

   ```
   https://accounts.spotify.com/authorize?client_id={client_id}&response_type=code&redirect_uri=http://127.0.0.1:5173/callback&scope=user-read-currently-playing%20user-read-playback-state
   ```
6. Copy the value of `?code=...` from your browser URL
7. Generate a refresh token:

   ```bash
   node scripts/get-refresh-token.js
   ```

   (This uses `SPOTIFY_AUTH_CODE` and `SPOTIFY_REDIRECT_URI` from `.env`)
8. Copy the `"refresh_token"` from the output into `.env` under `SPOTIFY_REFRESH_TOKEN`

---

## 💬 Slack Setup

1. Visit [Slack API: Your Apps](https://api.slack.com/apps)
2. Click **Create New App → From scratch**
3. Under **Bot Token Scopes**, add:

   * `chat:write`
4. Install the app to your workspace
5. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
6. Invite your bot to your channel:

   ```
   # Example
   /invite @DJ Tsucchii
   ```

---

## ⚙️ `.env` Example

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
# The name of the Slack channel to post to (without #)
SLACK_CHANNEL=now-playing

# ============================
# ⚙️ Settings
# ============================
CHECK_INTERVAL=20
```

---

## 🏃 Run

### Node.js

```bash
npm install
npm start
```

### Docker

```bash
docker compose build
docker compose up -d
docker compose logs -f
```

---

## 🕒 Schedule Rules

| Condition                   | Behavior             |
| --------------------------- | -------------------- |
| Weekdays 9:00–21:00 JST     | ✅ Active             |
| Weekends / Holidays / Night | 💤 Paused            |
| Same track repeats          | 🚫 No duplicate post |

---

## 💡 Troubleshooting

| Issue                                   | Solution                                                |
| --------------------------------------- | ------------------------------------------------------- |
| `INVALID_CLIENT: Insecure redirect URI` | Use `http://127.0.0.1` instead of `https://localhost`   |
| `127.0.0.1 refused to connect`          | This is normal — just copy the `code=` value            |
| `Error: not_in_channel`                 | Invite your bot to the channel (`/invite @DJ Tsucchii`) |
| No posts                                | Ensure the same Spotify account is used                 |
| `Spotify token error`                   | Reissue the refresh token                               |
| No Docker logs                          | The bot is paused (off-hours)                           |

---

## 🧩 Tech Notes

* Node.js v20.11+
* Docker base: `node:20.11-alpine`
* Holiday source: [holidays-jp API](https://holidays-jp.github.io/api/v1/date.json)
* Active hours: Weekdays 9:00–21:00 JST

---

## 🪪 License

MIT © 2025 Hiromu Tsuchiya

---

## ☕ Acknowledgements

Developed by [@hiromutsuchiya](https://github.com/hiromutsuchiya)
"DJ Tsucchii" — Your friendly Slack music companion 🎵

---

**日本語版はこちら 👉 [README.md](README.md)**

---

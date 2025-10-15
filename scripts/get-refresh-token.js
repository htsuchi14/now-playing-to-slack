// scripts/get-refresh-token.js
import fetch from "node-fetch";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI; // 例: http://localhost:5173/callback
const AUTH_CODE = process.env.SPOTIFY_AUTH_CODE;       // 手順4で取得した ?code=... を設定

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !AUTH_CODE) {
  console.error("Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI, SPOTIFY_AUTH_CODE");
  process.exit(1);
}

const res = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: AUTH_CODE,
    redirect_uri: REDIRECT_URI,
  }),
});

const data = await res.json();
console.log(data); // access_token, refresh_token など

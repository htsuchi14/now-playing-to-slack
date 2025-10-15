import fetch from "node-fetch";
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";
import { isWeekend } from "date-fns";

dotenv.config();

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
  SLACK_TOKEN,
  SLACK_CHANNEL,
  CHECK_INTERVAL = 20,
} = process.env;

const slack = new WebClient(SLACK_TOKEN);
let lastTrackId = null;
let holidayCache = {};

// 🇯🇵 祝日APIからデータ取得
async function fetchJapaneseHolidays() {
  try {
    const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
    if (!res.ok) throw new Error("Failed to fetch holiday API");
    const data = await res.json();
    holidayCache = data;
    console.log("🎌 日本の祝日データを取得しました:", Object.keys(holidayCache).length, "件");
  } catch (err) {
    console.error("⚠️ 祝日API取得失敗:", err.message);
  }
}

// 稼働時間チェック（平日9:00〜22:00）
function isWithinWorkingHours() {
  const now = new Date();
  const JST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));

  const hour = JST.getHours();
  const dateStr = JST.toISOString().slice(0, 10);
  const isHoliday = Object.keys(holidayCache).includes(dateStr);


  if (isWeekend(JST) || isHoliday) return false;
  if (hour < 9 || hour >= 21) return false;
  return true;
}

// Spotifyトークン更新
async function getAccessToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error("Spotify token error");
  return data.access_token;
}

// 再生中の曲取得
async function getNowPlaying(accessToken) {
  const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 204) return null;
  if (!res.ok) throw new Error("Spotify now playing error");

  const data = await res.json();
  return data.item;
}

// Slack投稿
async function postToSlack(track) {
  const text = `🎧 *DJ Tsucchii* is now playing:\n*${track.name}* by *${track.artists
    .map((a) => a.name)
    .join(", ")}*\n${track.external_urls.spotify}`;
  await slack.chat.postMessage({ channel: SLACK_CHANNEL, text });
  console.log(`[${new Date().toLocaleString("ja-JP")}] Posted: ${track.name}`);
}

// メインループ
async function loop() {
  try {
    if (!isWithinWorkingHours()) {
      console.log(`[${new Date().toLocaleString("ja-JP")}] ⏸ 停止中（深夜・土日・祝日）`);
      return setTimeout(loop, CHECK_INTERVAL * 1000);
    }

    const accessToken = await getAccessToken();
    const track = await getNowPlaying(accessToken);

    if (track && track.id !== lastTrackId) {
      lastTrackId = track.id;
      await postToSlack(track);
    } else if (!track) {
      console.log("🎵 再生中の曲なし");
    }
  } catch (err) {
    console.error("⚠️ Error:", err.message);
  } finally {
    setTimeout(loop, CHECK_INTERVAL * 1000);
  }
}

// 初期化
(async () => {
  console.log("🎵 now-playing-to-slack starting...");
  await fetchJapaneseHolidays();
  console.log(`⏰ Interval: ${CHECK_INTERVAL}s`);
  loop();

  // 1日1回祝日情報を更新
  setInterval(fetchJapaneseHolidays, 24 * 60 * 60 * 1000);
})();

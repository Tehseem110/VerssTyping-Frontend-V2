/**
 * lib/mixpanel.ts
 *
 * Central Mixpanel helper.
 * - Initialises the SDK once (client-side only).
 * - Exports a `track` wrapper that is a no-op on the server or when the
 *   token is missing, so SSR / build never breaks.
 * - Exports typed event helpers for every game lifecycle event.
 */

import mixpanel, { type Dict } from "mixpanel-browser";

// ─── Init ──────────────────────────────────────────────────────────────────

let initialised = false;

export function initMixpanel(): void {
  if (typeof window === "undefined") return;
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    console.warn("[Mixpanel] NEXT_PUBLIC_MIXPANEL_TOKEN is not set – tracking disabled.");
    return;
  }
  if (initialised) return;

  mixpanel.init(token, {
    autocapture: true,
    record_sessions_percent: 100,
    api_host: "https://api-eu.mixpanel.com",
    // Persist user identity across sessions
    persistence: "localStorage",
    // Ignore Do-Not-Track; remove if you want to honour it
    ignore_dnt: false,
  });

  initialised = true;
}

// ─── Safe track wrapper ─────────────────────────────────────────────────────

function track(event: string, props?: Dict): void {
  if (typeof window === "undefined" || !initialised) return;
  try {
    mixpanel.track(event, props);
  } catch (err) {
    console.warn("[Mixpanel] track error:", err);
  }
}

// ─── Typed event helpers ────────────────────────────────────────────────────

/** Fired when the home page first loads and a user visits the site. */
export function trackPageView(path: string): void {
  track("Page Viewed", { path });
}

/**
 * Fired when the user clicks "Create Room".
 * Identified by the player name they enter.
 */
export function trackRoomCreated(props: { playerName: string }): void {
  // Identify the user by name so they show up as a distinct person
  mixpanel.identify(props.playerName);
  mixpanel.people.set({ $name: props.playerName, last_seen: new Date().toISOString() });
  track("Room Created", { player_name: props.playerName });
}

/**
 * Fired when a player successfully joins an existing room.
 */
export function trackRoomJoined(props: {
  roomCode: string;
  playerName: string;
}): void {
  mixpanel.identify(props.playerName);
  mixpanel.people.set({ $name: props.playerName, last_seen: new Date().toISOString() });
  track("Room Joined", {
    room_code: props.roomCode,
    player_name: props.playerName,
  });
}

/**
 * Fired when the host clicks "Start Game" and the countdown begins.
 */
export function trackGameStarted(props: {
  roomCode: string;
  playerCount: number;
  playerName: string;
}): void {
  track("Game Started", {
    room_code: props.roomCode,
    player_count: props.playerCount,
    player_name: props.playerName,
  });
}

/**
 * Fired when the local player finishes typing the full prompt.
 */
export function trackGameCompleted(props: {
  roomCode: string;
  playerName: string;
  wpm: number;
  playerCount: number;
  rank: number;          // 1 = winner
  isWinner: boolean;
}): void {
  // Increment lifetime games and accumulate WPM for people analytics
  mixpanel.people.increment("games_completed");
  mixpanel.people.increment("total_wpm", props.wpm);

  track("Game Completed", {
    room_code: props.roomCode,
    player_name: props.playerName,
    wpm: props.wpm,
    player_count: props.playerCount,
    rank: props.rank,
    is_winner: props.isWinner,
  });
}

/**
 * Fired when the results screen is shown to every player (game_finished event).
 */
export function trackResultsViewed(props: {
  roomCode: string;
  playerName: string;
  topWpm: number;
  myWpm: number;
  playerCount: number;
}): void {
  track("Results Viewed", {
    room_code: props.roomCode,
    player_name: props.playerName,
    top_wpm: props.topWpm,
    my_wpm: props.myWpm,
    player_count: props.playerCount,
  });
}

/**
 * Fired when a player leaves the room (back-to-home).
 */
export function trackRoomLeft(props: {
  roomCode: string;
  playerName: string;
  reason: "manual" | "game_over";
}): void {
  track("Room Left", {
    room_code: props.roomCode,
    player_name: props.playerName,
    reason: props.reason,
  });
}

/**
 * Fired on join errors (wrong code, full room, etc.).
 */
export function trackRoomError(props: {
  roomCode: string;
  errorMessage: string;
}): void {
  track("Room Error", {
    room_code: props.roomCode,
    error_message: props.errorMessage,
  });
}

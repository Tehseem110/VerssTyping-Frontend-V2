"use client";

import { useState } from "react";
import type { GameState } from "@/types";

interface LobbyProps {
  gameState: GameState;
  onStart: () => void;
  onLeave: () => void;
}

export default function Lobby({ gameState, onStart, onLeave }: LobbyProps) {
  const { code, players, myId, isHost } = gameState;
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/room/${code}`;
    await copyToClipboard(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const MAX_PLAYERS = 4;
  const hasEnoughPlayers = players.length >= 2;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-1">
            Waiting Room
          </h1>
          <p className="text-gray-500 text-sm">
            Share the room code with your opponents (up to 4 players)
          </p>
        </div>

        {/* Main card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 space-y-8">
          {/* Room code */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">
              Room Code
            </p>
            <div className="flex items-center justify-center gap-3">
              <span
                id="room-code-display"
                className="font-mono font-bold text-4xl tracking-widest text-green-400 select-all"
              >
                {code}
              </span>
              <button
                id="copy-code-btn"
                onClick={handleCopy}
                className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors text-gray-400 hover:text-white"
                title="Copy room code"
              >
                {copied ? (
                  <span className="text-green-400 text-sm font-semibold">✓</span>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-xs mt-2 animate-fade-in">
                Code copied!
              </p>
            )}

            {/* Invite link button */}
            <button
              id="copy-invite-link-btn"
              onClick={handleCopyLink}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border transition-all duration-200 text-sm font-medium ${
                linkCopied
                  ? "border-green-500/60 bg-green-500/10 text-green-400"
                  : "border-[#3a3a3a] bg-[#242424] text-gray-400 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-400"
              }`}
              title="Copy invite link"
            >
              {linkCopied ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Invite link copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>
            <p className="text-gray-600 text-xs mt-2">
              Friends click the link → enter name → join instantly
            </p>
          </div>

          {/* Player list */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">
              Players ({players.length}/{MAX_PLAYERS})
            </p>
            <div className="space-y-2">
              {players.map((player) => {
                const isThisPlayerHost =
                  players.indexOf(player) === 0 ||
                  (gameState.isHost && player.id === myId) ||
                  (!gameState.isHost && player.id !== myId && players.length > 1);

                // Simpler: host is always the first player listed by the server
                const isHostPlayer = players[0]?.id === player.id;
                const isMe = player.id === myId;

                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 bg-[#242424] rounded-xl px-4 py-3"
                  >
                    {/* Status dot */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isHostPlayer
                          ? "bg-green-400 shadow-[0_0_6px_#4ade80]"
                          : "bg-blue-400 shadow-[0_0_6px_#60a5fa]"
                      }`}
                    />

                    <span className="font-semibold text-white flex-1 truncate">
                      {isHostPlayer && <span className="mr-1">👑</span>}
                      {player.name}
                      {isHostPlayer && (
                        <span className="ml-1.5 text-xs text-gray-500 font-normal">Host</span>
                      )}
                      {isMe && (
                        <span className="ml-1.5 text-xs text-gray-500 font-normal">(You)</span>
                      )}
                    </span>

                    {/* Ready badge */}
                    <span className="text-xs text-green-400 font-medium">Ready</span>
                  </div>
                );
              })}

              {/* Waiting slots — one per empty spot, up to MAX_PLAYERS */}
              {Array.from({ length: MAX_PLAYERS - players.length }).map((_, i) => (
                <div
                  key={`waiting-${i}`}
                  className="flex items-center gap-3 bg-[#1e1e1e] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3"
                >
                  <div className="flex gap-1">
                    <span className="wait-dot w-2 h-2 rounded-full bg-gray-600" />
                    <span className="wait-dot w-2 h-2 rounded-full bg-gray-600" />
                    <span className="wait-dot w-2 h-2 rounded-full bg-gray-600" />
                  </div>
                  <span className="text-gray-500 text-sm italic">
                    {i === 0 && players.length < 2
                      ? "Waiting for players to join…"
                      : "Open slot"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action area */}
          <div className="space-y-3">
            {hasEnoughPlayers && isHost && (
              <button
                id="start-game-btn"
                onClick={onStart}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl
                           transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.2)]
                           hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2
                           text-base"
              >
                <span>🏁</span>
                <span>Start Race</span>
              </button>
            )}

            {hasEnoughPlayers && !isHost && (
              <div className="w-full bg-[#242424] text-gray-400 font-medium py-3.5 rounded-xl
                              text-center text-sm border border-[#2a2a2a]">
                Waiting for host to start the race…
              </div>
            )}

            <button
              id="leave-room-btn"
              onClick={onLeave}
              className="w-full bg-transparent border border-red-500/40 text-red-400 font-medium py-2.5 rounded-xl
                         hover:bg-red-500/10 hover:border-red-500 transition-all duration-200 text-sm"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

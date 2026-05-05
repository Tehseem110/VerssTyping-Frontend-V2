"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocketContext } from "@/context/SocketContext";
import Lobby from "@/components/Lobby";
import Countdown from "@/components/Countdown";
import TypingGame from "@/components/TypingGame";
import ResultsScreen from "@/components/ResultsScreen";

interface RoomPageProps {
  params: { code: string };
}

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const { gameState, joinRoom, startGame, sendProgress, sendFinished, leaveRoom, connected } =
    useSocketContext();

  const urlCode = params.code.toUpperCase();
  const isInRoom = !!gameState.code;

  // State for the "join via invite link" modal
  const [linkJoinName, setLinkJoinName] = useState("");
  const [linkJoinError, setLinkJoinError] = useState("");
  const [linkJoinLoading, setLinkJoinLoading] = useState(false);

  // Pre-fill name from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("versustyping_name") ?? "";
    if (saved) setLinkJoinName(saved);
  }, []);

  // Cleanup on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameState.code) leaveRoom(gameState.code);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameState.code, leaveRoom]);

  const handleLeave = () => {
    leaveRoom(gameState.code);
    router.push("/");
  };

  const handleLinkJoin = () => {
    if (!linkJoinName.trim()) {
      setLinkJoinError("Please enter your name.");
      return;
    }
    setLinkJoinError("");
    setLinkJoinLoading(true);
    localStorage.setItem("versustyping_name", linkJoinName.trim());
    joinRoom(urlCode, linkJoinName.trim());
    // Reset loading after timeout in case of error
    setTimeout(() => setLinkJoinLoading(false), 5000);
  };

  const showDisconnectBanner = !connected && isInRoom;

  // ── If user navigated via invite link (no active game state) ──────────────
  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-3xl">⌨️</span>
              <h1 className="text-3xl font-black">
                <span className="text-white">Versus</span>
                <span className="text-green-400">Typing</span>
              </h1>
            </div>
            <p className="text-gray-400 text-sm">You&apos;ve been invited to join a room</p>
          </div>

          {/* Room code badge */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 space-y-5">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Joining Room
              </p>
              <span className="font-mono font-bold text-4xl tracking-widest text-green-400">
                {urlCode}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Your Name
              </label>
              <input
                id="link-join-name-input"
                type="text"
                placeholder="Enter your name…"
                maxLength={20}
                value={linkJoinName}
                onChange={(e) => setLinkJoinName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLinkJoin()}
                autoFocus
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-xl px-4 py-3
                           focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition-all
                           placeholder:text-gray-600 font-medium"
              />
              {linkJoinError && (
                <p className="text-red-400 text-xs mt-1.5">{linkJoinError}</p>
              )}
            </div>

            {gameState.error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm text-center">
                ⚠️ {gameState.error}
              </div>
            )}

            <button
              id="link-join-btn"
              onClick={handleLinkJoin}
              disabled={!connected || linkJoinLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-bold py-3 rounded-xl transition-all duration-200
                         shadow-[0_0_0_0_rgba(34,197,94,0)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]
                         flex items-center justify-center gap-2"
            >
              {linkJoinLoading ? (
                <>
                  <Spinner />
                  <span>Joining…</span>
                </>
              ) : (
                <>
                  <span>Join Room</span>
                  <span>→</span>
                </>
              )}
            </button>

            {/* Connection indicator */}
            <div className="flex items-center justify-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  connected ? "bg-green-400 shadow-[0_0_6px_#4ade80]" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-gray-500">
                {connected ? "Connected" : "Connecting…"}
              </span>
            </div>
          </div>

          <button
            id="back-to-home-btn"
            onClick={() => router.push("/")}
            className="mt-4 w-full text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  // ── Normal in-room view ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f0f0f] relative">
      {/* Disconnect banner */}
      {showDisconnectBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 text-center">
          <span className="text-yellow-400 text-sm font-medium">
            ⚠️ Connection lost. Reconnecting…
          </span>
        </div>
      )}

      {(gameState.status === "waiting" || gameState.status === "countdown") && (
        <>
          <Lobby
            gameState={gameState}
            onStart={() => startGame(gameState.code)}
            onLeave={handleLeave}
          />
          {gameState.status === "countdown" && (
            <Countdown count={gameState.countdown} />
          )}
        </>
      )}

      {gameState.status === "playing" && (
        <TypingGame
          gameState={gameState}
          onProgress={(progress, wpm) => sendProgress(gameState.code, progress, wpm)}
          onFinished={(wpm) => sendFinished(gameState.code, wpm)}
        />
      )}

      {gameState.status === "finished" && (
        <ResultsScreen gameState={gameState} onLeave={handleLeave} />
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

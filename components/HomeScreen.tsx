"use client";

import { useState, useRef } from "react";
import type { GameState } from "@/types";

interface HomeScreenProps {
  gameState: GameState;
  connected: boolean;
  createRoom: (name: string) => void;
  joinRoom: (code: string, name: string) => void;
}

export default function HomeScreen({
  gameState,
  connected,
  createRoom,
  joinRoom,
}: HomeScreenProps) {
  const savedName =
    typeof window !== "undefined" ? localStorage.getItem("versustyping_name") ?? "" : "";
  const [createName, setCreateName] = useState(savedName);
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState(savedName);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [joinError, setJoinError] = useState("");

  const createTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCreate = () => {
    if (!createName.trim()) {
      setCreateError("Please enter your name.");
      return;
    }
    setCreateError("");
    setCreateLoading(true);
    createRoom(createName.trim());

    // Reset loading if no code arrives within 5s (error state)
    createTimeoutRef.current = setTimeout(() => {
      setCreateLoading(false);
    }, 5000);
  };

  const handleJoin = () => {
    if (!joinCode.trim()) {
      setJoinError("Please enter a room code.");
      return;
    }
    if (!joinName.trim()) {
      setJoinError("Please enter your name.");
      return;
    }
    setJoinError("");
    setJoinLoading(true);
    joinRoom(joinCode.trim(), joinName.trim());

    // Reset loading if no confirmation within 5s
    joinTimeoutRef.current = setTimeout(() => {
      setJoinLoading(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-14 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl">⌨️</span>
          <h1 className="text-6xl font-black tracking-tight">
            <span className="text-white">Versus</span>
            <span className="text-green-400">Typing</span>
          </h1>
        </div>
        <p className="text-gray-400 text-lg font-medium">
          Challenge your friends to a typing race
        </p>

        {/* Connection indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              connected ? "bg-green-400 shadow-[0_0_6px_#4ade80]" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-gray-500">
            {connected ? "Connected to server" : "Connecting…"}
          </span>
        </div>
      </div>

      {/* Cards row */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Create Game Card ─────────────────────────────────────────────── */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 card-glow transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <h2 className="text-xl font-bold text-white">Create Game</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Your Name
              </label>
              <input
                id="create-name-input"
                type="text"
                placeholder="Enter your name…"
                maxLength={20}
                value={createName}
                onChange={(e) => {
                  const v = e.target.value;
                  setCreateName(v);
                  setJoinName(v);
                  localStorage.setItem("versustyping_name", v);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-xl px-4 py-3
                           focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition-all
                           placeholder:text-gray-600 font-medium"
              />
              {createError && (
                <p className="text-red-400 text-xs mt-1.5">{createError}</p>
              )}
            </div>

            <button
              id="create-room-btn"
              onClick={handleCreate}
              disabled={!connected || createLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-bold py-3 rounded-xl transition-all duration-200
                         shadow-[0_0_0_0_rgba(34,197,94,0)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]
                         flex items-center justify-center gap-2"
            >
              {createLoading ? (
                <>
                  <Spinner />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <span>Create Room</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Join Game Card ───────────────────────────────────────────────── */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 card-glow transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <span className="text-xl">🔗</span>
            </div>
            <h2 className="text-xl font-bold text-white">Join Game</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Room Code
              </label>
              <input
                id="join-code-input"
                type="text"
                placeholder="E.g. X4KP2A"
                maxLength={10}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-xl px-4 py-3
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all
                           placeholder:text-gray-600 font-mono font-bold tracking-widest uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Your Name
              </label>
              <input
                id="join-name-input"
                type="text"
                placeholder="Enter your name…"
                maxLength={20}
                value={joinName}
                onChange={(e) => {
                  const v = e.target.value;
                  setJoinName(v);
                  setCreateName(v);
                  localStorage.setItem("versustyping_name", v);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-xl px-4 py-3
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all
                           placeholder:text-gray-600 font-medium"
              />
              {joinError && (
                <p className="text-red-400 text-xs mt-1.5">{joinError}</p>
              )}
            </div>

            <button
              id="join-room-btn"
              onClick={handleJoin}
              disabled={!connected || joinLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-bold py-3 rounded-xl transition-all duration-200
                         shadow-[0_0_0_0_rgba(59,130,246,0)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]
                         flex items-center justify-center gap-2"
            >
              {joinLoading ? (
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
          </div>
        </div>
      </div>

      {/* Global socket error */}
      {gameState.error && (
        <div
          id="error-banner"
          className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-xl
                     text-sm font-medium animate-fade-in max-w-md text-center"
        >
          ⚠️ {gameState.error}
        </div>
      )}

      {/* How to play */}
      <div className="mt-14 text-center max-w-lg">
        <p className="text-gray-600 text-xs uppercase tracking-widest mb-3 font-semibold">
          How to play
        </p>
        <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
          <Step n={1} label="Create or join a room" />
          <div className="w-px h-6 bg-[#2a2a2a]" />
          <Step n={2} label="Wait for players to join" />
          <div className="w-px h-6 bg-[#2a2a2a]" />
          <Step n={3} label="Type as fast as you can!" />
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-6 h-6 rounded-full border border-[#3a3a3a] flex items-center justify-center text-xs font-bold text-gray-400">
        {n}
      </div>
      <span className="text-center leading-tight">{label}</span>
    </div>
  );
}

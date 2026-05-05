"use client";

import { useState, useRef, useCallback } from "react";
import type { GameState } from "@/types";
import PlayerCard from "@/components/PlayerCard";
import TypingBox from "@/components/TypingBox";

interface TypingGameProps {
  gameState: GameState;
  onProgress: (progress: number, wpm: number) => void;
  onFinished: (wpm: number) => void;
}

export default function TypingGame({ gameState, onProgress, onFinished }: TypingGameProps) {
  const { players, myId, prompt } = gameState;
  const [gameStartTime] = useState(() => Date.now());
  const [myWpm, setMyWpm] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const myPlayer = players.find((p) => p.id === myId);
  const opponents = players.filter((p) => p.id !== myId);

  const handleProgress = useCallback(
    (progress: number, wpm: number) => {
      setMyWpm(wpm);
      onProgress(progress, wpm);
    },
    [onProgress]
  );

  const handleFinished = useCallback(
    (wpm: number) => {
      setMyWpm(wpm);
      onFinished(wpm);
    },
    [onFinished]
  );

  // Click anywhere on game area → focus input
  const handleContainerClick = () => {
    const input = containerRef.current?.querySelector<HTMLInputElement>("#typing-input");
    input?.focus();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="min-h-screen bg-[#0f0f0f] flex flex-col"
    >
      {/* ── Top bar: all player cards ──────────────────────────────────────── */}
      <div className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div
            className={`grid gap-4 ${
              players.length <= 2
                ? "grid-cols-1 md:grid-cols-2"
                : players.length === 3
                ? "grid-cols-1 md:grid-cols-3"
                : "grid-cols-2 md:grid-cols-4"
            }`}
          >
            {myPlayer && <PlayerCard player={myPlayer} isMe={true} />}
            {opponents.map((opp) => (
              <PlayerCard key={opp.id} player={opp} isMe={false} />
            ))}
            {/* Placeholder when still only 1 player */}
            {players.length < 2 && (
              <div className="bg-[#242424] rounded-xl p-4 border border-[#2a2a2a] flex items-center justify-center">
                <span className="text-gray-600 text-sm italic">Waiting for opponent…</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Middle: typing area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          {/* WPM live counter */}
          <div className="flex justify-end mb-4">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-2 flex items-baseline gap-2">
              <span
                className={`text-3xl font-black tabular-nums ${
                  myWpm > 80
                    ? "text-green-400"
                    : myWpm > 40
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              >
                {myWpm}
              </span>
              <span className="text-gray-500 text-sm font-medium">WPM</span>
            </div>
          </div>

          {/* Prompt + input */}
          <TypingBox
            prompt={prompt}
            onProgress={handleProgress}
            onFinished={handleFinished}
            onWpmUpdate={setMyWpm}
            gameStartTime={gameStartTime}
          />

          {/* Hint */}
          <p className="text-center text-gray-600 text-xs mt-4">
            Click anywhere to focus · Backspace to correct · No paste allowed
          </p>
        </div>
      </div>
    </div>
  );
}

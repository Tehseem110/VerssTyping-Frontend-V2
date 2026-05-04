"use client";

import type { GameState, Player } from "@/types";

interface ResultsScreenProps {
  gameState: GameState;
  onLeave: () => void;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const MEDAL_TEXT = ["text-yellow-400", "text-gray-300", "text-amber-600"];
const MEDAL_BG = [
  "bg-yellow-500/10 border-yellow-500/30",
  "bg-gray-500/10 border-gray-500/30",
  "bg-amber-700/10 border-amber-700/30",
];

export default function ResultsScreen({ gameState, onLeave }: ResultsScreenProps) {
  const { players, myId } = gameState;

  // Sort: by finishedAt first, then WPM
  const ranked = [...players].sort((a: Player, b: Player) => {
    if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
    if (a.finishedAt) return -1;
    if (b.finishedAt) return 1;
    return b.wpm - a.wpm;
  });

  const winner = ranked[0];
  const iWon = winner?.id === myId;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-3">🏁</div>
          <h1 className="text-4xl font-black text-white mb-2">Race Complete!</h1>
          {iWon ? (
            <p className="text-green-400 font-bold text-xl">
              You Win! 🎉
            </p>
          ) : (
            <p className="text-gray-400 text-lg">
              Better luck next time!
            </p>
          )}
        </div>

        {/* Rankings */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden mb-6">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-3 border-b border-[#2a2a2a]
                          text-xs uppercase tracking-widest text-gray-600 font-semibold">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">WPM</span>
            <span className="text-right">Progress</span>
          </div>

          {ranked.map((player, idx) => {
            const isMe = player.id === myId;
            const medal = MEDAL[idx] ?? `#${idx + 1}`;
            const medalColor = MEDAL_TEXT[idx] ?? "text-gray-400";
            const rowBg = idx === 0 ? MEDAL_BG[0] : "border-[#2a2a2a]";

            return (
              <div
                key={player.id}
                className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-4 border-b last:border-b-0
                            ${idx === 0 ? MEDAL_BG[0] : ""} 
                            ${isMe ? "ring-1 ring-green-500/20" : ""}
                            transition-colors border-[#2a2a2a]`}
              >
                {/* Position */}
                <span className={`text-2xl w-8 flex items-center ${medalColor}`}>
                  {medal}
                </span>

                {/* Name */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-white truncate">
                    {player.name}
                  </span>
                  {isMe && (
                    <span className="text-xs text-gray-500 font-normal flex-shrink-0">(You)</span>
                  )}
                  {idx === 0 && (
                    <span className="text-xs text-yellow-400 font-semibold bg-yellow-500/10
                                     px-2 py-0.5 rounded-full border border-yellow-500/20 flex-shrink-0">
                      Winner
                    </span>
                  )}
                </div>

                {/* WPM */}
                <div className="text-right">
                  <span className={`font-black text-lg tabular-nums ${medalColor}`}>
                    {player.wpm}
                  </span>
                  <span className="text-gray-600 text-xs ml-1">wpm</span>
                </div>

                {/* Progress */}
                <div className="text-right">
                  <span className="text-gray-400 font-semibold text-sm tabular-nums">
                    {Math.round(player.progress)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats summary */}
        {ranked.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              label="Your WPM"
              value={String(players.find((p) => p.id === myId)?.wpm ?? 0)}
              unit="wpm"
              color="text-green-400"
            />
            <StatCard
              label="Top WPM"
              value={String(Math.max(...players.map((p) => p.wpm)))}
              unit="wpm"
              color="text-yellow-400"
            />
          </div>
        )}

        {/* Actions */}
        <button
          id="back-to-home-btn"
          onClick={onLeave}
          className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-bold py-3.5 rounded-xl
                     transition-all duration-200 flex items-center justify-center gap-2 text-base border border-[#3a3a3a]"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 text-center">
      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1">
        {label}
      </p>
      <div className="flex items-baseline justify-center gap-1">
        <span className={`text-3xl font-black tabular-nums ${color}`}>{value}</span>
        <span className="text-gray-600 text-sm">{unit}</span>
      </div>
    </div>
  );
}

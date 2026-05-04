"use client";

import type { Player } from "@/types";

interface PlayerCardProps {
  player: Player;
  isMe: boolean;
}

export default function PlayerCard({ player, isMe }: PlayerCardProps) {
  const progress = Math.min(100, Math.max(0, Math.round(player.progress)));
  const accentColor = isMe ? "bg-green-500" : "bg-blue-500";
  const shadowColor = isMe
    ? "shadow-[0_0_12px_rgba(34,197,94,0.4)]"
    : "shadow-[0_0_12px_rgba(59,130,246,0.4)]";

  return (
    <div
      className={`bg-[#242424] border rounded-xl p-4 transition-all duration-300 ${
        isMe
          ? "border-green-500/30 " + shadowColor
          : "border-[#2a2a2a]"
      }`}
    >
      {/* Name row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isMe ? "bg-green-400" : "bg-blue-400"
            }`}
          />
          <span className="font-bold text-white text-sm truncate">
            {player.name}
            {isMe && (
              <span className="ml-1.5 text-gray-500 font-normal text-xs">(You)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {player.finished && (
            <span className="text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
              ✓ Finished
            </span>
          )}
          {player.wpm > 0 && (
            <span className="text-xs font-bold text-gray-300 tabular-nums">
              {player.wpm} WPM
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full progress-fill ${accentColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-1 flex-1 mr-3">
            {/* Mini car emoji that moves with progress */}
            <div
              className="text-base leading-none transition-all duration-300 select-none"
              style={{
                marginLeft: `calc(${progress}% - 1rem)`,
                display: progress > 2 ? "block" : "none",
              }}
            >
              {isMe ? "🟢" : "🔵"}
            </div>
          </div>
          <span
            className={`text-xs font-bold tabular-nums ${
              isMe ? "text-green-400" : "text-blue-400"
            }`}
          >
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

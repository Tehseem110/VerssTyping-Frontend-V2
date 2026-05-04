"use client";

import { useEffect, useRef } from "react";
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
  const { gameState, startGame, sendProgress, sendFinished, leaveRoom, connected } =
    useSocketContext();
  const redirectedRef = useRef(false);

  // Guard: no game state for this room → go home
  useEffect(() => {
    if (!gameState.code && !redirectedRef.current) {
      redirectedRef.current = true;
      router.replace("/");
    }
  }, [gameState.code, router]);

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

  const showDisconnectBanner = !connected && !!gameState.code;

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

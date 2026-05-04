"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { GameState } from "@/types";

interface SocketContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  connected: boolean;
  createRoom: (name: string) => void;
  joinRoom: (code: string, name: string) => void;
  startGame: (code: string) => void;
  sendProgress: (code: string, progress: number, wpm: number) => void;
  sendFinished: (code: string, wpm: number) => void;
  leaveRoom: (code: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketApi = useSocket();
  return (
    <SocketContext.Provider value={socketApi}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): SocketContextType {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocketContext must be used within SocketProvider");
  return ctx;
}

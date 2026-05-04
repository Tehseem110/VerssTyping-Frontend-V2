"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, Player } from "@/types";

const INITIAL_STATE: GameState = {
  code: "",
  players: [],
  status: "waiting",
  prompt: "",
  myId: "",
  myName: "",
  isHost: false,
  error: null,
  countdown: null,
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  // Keep a ref so event handlers always see the latest gameState without stale closures
  const gameStateRef = useRef<GameState>(INITIAL_STATE);

  // Sync ref whenever state changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const updateGameState = useCallback((partial: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...partial }));
  }, []);

  // ─── Socket setup (mount only) ────────────────────────────────────────────
  useEffect(() => {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // ── room_created ────────────────────────────────────────────────────────
    socket.on("room_created", ({ code, players }: { code: string; players: Player[] }) => {
      setGameState((prev) => ({
        ...prev,
        code,
        players,
        status: "waiting",
      }));
    });

    // ── room_updated ────────────────────────────────────────────────────────
    socket.on("room_updated", ({ players, status }: { players: Player[]; status: GameState["status"] }) => {
      setGameState((prev) => ({ ...prev, players, status }));
    });

    // ── room_error ──────────────────────────────────────────────────────────
    socket.on("room_error", ({ message }: { message: string }) => {
      setGameState((prev) => ({ ...prev, error: message }));
      setTimeout(() => {
        setGameState((prev) => ({ ...prev, error: null }));
      }, 3000);
    });

    // ── countdown ───────────────────────────────────────────────────────────
    socket.on("countdown", ({ count }: { count: number }) => {
      setGameState((prev) => ({ ...prev, countdown: count, status: "countdown" }));
      if (count === 1) {
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, countdown: null }));
        }, 1000);
      }
    });

    // ── game_start ──────────────────────────────────────────────────────────
    socket.on("game_start", ({ prompt }: { prompt: string }) => {
      setGameState((prev) => ({
        ...prev,
        prompt,
        status: "playing",
        countdown: null,
      }));
    });

    // ── player_progress ─────────────────────────────────────────────────────
    socket.on("player_progress", ({ players }: { players: Player[] }) => {
      setGameState((prev) => ({ ...prev, players }));
    });

    // ── game_finished ────────────────────────────────────────────────────────
    socket.on("game_finished", ({ players }: { players: Player[] }) => {
      setGameState((prev) => ({
        ...prev,
        players,
        status: "finished",
      }));
    });

    // ── player_left ──────────────────────────────────────────────────────────
    socket.on("player_left", ({ players }: { players: Player[] }) => {
      setGameState((prev) => ({ ...prev, players }));
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Emit helpers ─────────────────────────────────────────────────────────

  const createRoom = useCallback((name: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    setGameState((prev) => ({
      ...prev,
      myName: name.trim(),
      myId: socket.id ?? "",
      isHost: true,
    }));
    socket.emit("create_room", { name: name.trim() });
  }, []);

  const joinRoom = useCallback((code: string, name: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    const upperCode = code.trim().toUpperCase();
    setGameState((prev) => ({
      ...prev,
      myName: name.trim(),
      myId: socket.id ?? "",
      isHost: false,
      code: upperCode,
    }));
    socket.emit("join_room", { code: upperCode, name: name.trim() });
  }, []);

  const startGame = useCallback((code: string) => {
    socketRef.current?.emit("start_game", { code });
  }, []);

  const sendProgress = useCallback((code: string, progress: number, wpm: number) => {
    socketRef.current?.emit("progress_update", { code, progress, wpm });
  }, []);

  const sendFinished = useCallback((code: string, wpm: number) => {
    socketRef.current?.emit("player_finished", { code, wpm });
  }, []);

  const leaveRoom = useCallback((code: string) => {
    socketRef.current?.emit("leave_room", { code });
    setGameState(INITIAL_STATE);
  }, []);

  return {
    socket: socketRef.current,
    gameState,
    setGameState,
    connected,
    createRoom,
    joinRoom,
    startGame,
    sendProgress,
    sendFinished,
    leaveRoom,
  };
}

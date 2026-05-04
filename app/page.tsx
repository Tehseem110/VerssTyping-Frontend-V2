"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeScreen from "@/components/HomeScreen";
import { useSocketContext } from "@/context/SocketContext";

export default function HomePage() {
  const router = useRouter();
  const socketApi = useSocketContext();
  const { gameState } = socketApi;

  // Navigate when room is created (host)
  useEffect(() => {
    if (gameState.code && gameState.isHost && gameState.status === "waiting") {
      router.push(`/room/${gameState.code}`);
    }
  }, [gameState.code, gameState.isHost, gameState.status, router]);

  // Navigate when joined as guest
  useEffect(() => {
    if (gameState.code && !gameState.isHost && gameState.myId) {
      router.push(`/room/${gameState.code}`);
    }
  }, [gameState.code, gameState.isHost, gameState.myId, router]);

  return <HomeScreen {...socketApi} />;
}

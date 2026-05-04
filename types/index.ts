export type Player = {
  id: string;
  name: string;
  progress: number; // 0–100
  wpm: number;
  finished: boolean;
  finishedAt?: number;
};

export type RoomStatus = "waiting" | "countdown" | "playing" | "finished";

export type GameState = {
  code: string;
  players: Player[];
  status: RoomStatus;
  prompt: string;
  myId: string;
  myName: string;
  isHost: boolean;
  error: string | null;
  countdown: number | null; // 3, 2, 1 or null
};

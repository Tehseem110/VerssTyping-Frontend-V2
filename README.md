# VersusTyping Frontend

A real-time multiplayer typing speed game built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Socket.io-client**.

## Prerequisites

- Node.js 18+
- The **VersusTyping Backend** running on `http://localhost:3001`
- npm 9+

## Install

```bash
npm install
```

## Run (Development)

```bash
npm run dev
```

The app runs on **http://localhost:3000**.

> Make sure the backend is already running on port 3001 before starting the frontend.

## How to Play

1. **Create or Join a Room**  
   One player creates a room and shares the 6-character room code. The second player enters the code to join.

2. **Wait in the Lobby**  
   Both players appear in the waiting room. The host clicks **Start Race** once both are ready.

3. **Race!**  
   A 3-second countdown fires, then both players type the displayed prompt as fast as possible. Live progress bars and WPM update in real-time. The first to finish wins!

## Project Structure

```
app/
├── layout.tsx              # Root layout + fonts + SEO
├── page.tsx                # Home page (Create/Join)
├── globals.css             # Global styles + animations
└── room/[code]/
    └── page.tsx            # Game room (Lobby → Countdown → Game → Results)

components/
├── HomeScreen.tsx          # Create/Join UI with loading states
├── Lobby.tsx               # Waiting room + room code share
├── Countdown.tsx           # 3-2-1-GO! overlay with animations
├── TypingGame.tsx          # Game layout: player cards + typing box
├── TypingBox.tsx           # Character-by-character prompt + input
├── PlayerCard.tsx          # Progress bar + WPM per player
└── ResultsScreen.tsx       # Rankings + stat cards

hooks/
└── useSocket.ts            # Single socket connection + all event handlers

types/
└── index.ts                # Shared TypeScript types
```

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 (App Router) | Routing + SSR framework |
| TypeScript (strict) | Type safety |
| Tailwind CSS | Utility-first styling |
| socket.io-client | Real-time WebSocket connection |
| Inter + JetBrains Mono | Typography |

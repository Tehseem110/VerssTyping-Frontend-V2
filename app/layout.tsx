import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/context/SocketContext";

export const metadata: Metadata = {
  title: "VersusTyping — Real-Time Multiplayer Typing Game",
  description:
    "Challenge your friends to a real-time typing speed race on VersusTyping. Create a room, share the code, and see who's the fastest typist.",
  keywords: ["typing game", "multiplayer", "typing speed", "WPM", "versustyping"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}

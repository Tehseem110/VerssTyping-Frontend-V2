"use client";

import { useEffect, useState, useRef } from "react";

interface CountdownProps {
  count: number | null;
}

export default function Countdown({ count }: CountdownProps) {
  const [displayCount, setDisplayCount] = useState<number | null>(count);
  const [showGo, setShowGo] = useState(false);
  const [visible, setVisible] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  const prevCount = useRef<number | null>(count);

  useEffect(() => {
    // count went to null from a number → show "GO!"
    if (prevCount.current !== null && count === null) {
      setDisplayCount(null);
      setShowGo(true);
      setAnimKey((k) => k + 1);
      const timer = setTimeout(() => {
        setShowGo(false);
        setVisible(false);
      }, 900);
      prevCount.current = null;
      return () => clearTimeout(timer);
    }

    if (count !== null) {
      setDisplayCount(count);
      setAnimKey((k) => k + 1);
      setVisible(true);
      setShowGo(false);
    }

    prevCount.current = count;
  }, [count]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {showGo ? (
        <div key={`go-${animKey}`} className="countdown-go text-green-400 font-black select-none"
          style={{ fontSize: "12rem", lineHeight: 1, textShadow: "0 0 60px rgba(34,197,94,0.6)" }}>
          GO!
        </div>
      ) : (
        <div
          key={`count-${animKey}-${displayCount}`}
          className="countdown-number font-black text-white select-none"
          style={{
            fontSize: "14rem",
            lineHeight: 1,
            textShadow: "0 0 80px rgba(255,255,255,0.15)",
          }}
        >
          {displayCount}
        </div>
      )}

      {/* Pulsing ring */}
      <div
        className="absolute w-72 h-72 rounded-full border-2 border-white/5 animate-ping"
        style={{ animationDuration: "1s" }}
      />
    </div>
  );
}

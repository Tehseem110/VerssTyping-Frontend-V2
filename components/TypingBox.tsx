"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TypingBoxProps {
  prompt: string;
  onProgress: (progress: number, wpm: number) => void;
  onFinished: (wpm: number) => void;
  onWpmUpdate?: (wpm: number) => void;
  gameStartTime: number;
}

export default function TypingBox({
  prompt,
  onProgress,
  onFinished,
  onWpmUpdate,
  gameStartTime,
}: TypingBoxProps) {
  // How many characters have been correctly typed (cursor position)
  const [cursor, setCursor] = useState(0);
  // Whether the current character attempt is wrong (shakes the char)
  const [isWrong, setIsWrong] = useState(false);
  const [finished, setFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef(false);
  const wrongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const calcWPM = useCallback(
    (charCount: number): number => {
      const elapsedMs = Date.now() - gameStartTime;
      if (elapsedMs < 500) return 0;
      return Math.max(0, Math.round(charCount / 5 / (elapsedMs / 60000)));
    },
    [gameStartTime]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (finishedRef.current) return;

      // Block all browser shortcuts that modify input (paste, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        return;
      }

      const key = e.key;

      // ── Backspace: move cursor back one step ──────────────────────────────
      if (key === "Backspace") {
        e.preventDefault();
        if (cursor > 0) {
          setCursor((c) => c - 1);
          setIsWrong(false);
          if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
        }
        return;
      }

      // Ignore non-printable / navigation keys
      if (key.length !== 1) return;

      e.preventDefault();

      const expected = prompt[cursor];

      if (key === expected) {
        // ── Correct key ───────────────────────────────────────────────────
        setIsWrong(false);
        if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);

        const newCursor = cursor + 1;
        setCursor(newCursor);

        const progress = Math.round((newCursor / prompt.length) * 100);
        const wpm = calcWPM(newCursor);

        // Update live WPM display every keystroke
        onWpmUpdate?.(wpm);

        // Emit progress at word boundaries (space typed correctly) or on finish
        if (expected === " " || newCursor === prompt.length) {
          onProgress(Math.min(progress, 100), wpm);
        }

        // Finished!
        if (newCursor === prompt.length && !finishedRef.current) {
          finishedRef.current = true;
          setFinished(true);
          const finalWpm = calcWPM(prompt.length);
          onProgress(100, finalWpm);
          onFinished(finalWpm);
        }
      } else {
        // ── Wrong key: flash red, don't advance ───────────────────────────
        setIsWrong(true);
        if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
        wrongTimeoutRef.current = setTimeout(() => setIsWrong(false), 120);
      }
    },
    [cursor, prompt, calcWPM, onProgress, onFinished]
  );

  // Block paste
  const handlePaste = (e: React.ClipboardEvent) => e.preventDefault();

  return (
    <div
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 md:p-8 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* ── Prompt display ──────────────────────────────────────────────── */}
      <div
        className="font-mono text-lg leading-relaxed mb-6 select-none relative"
        style={{ wordBreak: "break-word" }}
        aria-label="Typing prompt"
      >
        {prompt.split("").map((ch, i) => {
          const isCorrect = i < cursor;
          const isCurrent = i === cursor;
          const char = ch === " " ? "\u00A0" : ch;

          return (
            <span
              key={i}
              className={[
                "relative transition-colors duration-75",
                isCorrect
                  ? "text-green-400"
                  : isCurrent
                  ? isWrong
                    ? "text-red-400 bg-red-500/20 rounded-sm"
                    : "text-white"
                  : "text-gray-500",
              ].join(" ")}
              style={
                isCurrent && isWrong
                  ? { animation: "wrongShake 0.12s ease-in-out" }
                  : undefined
              }
            >
              {/* Blinking cursor bar before the current character */}
              {isCurrent && !finished && (
                <span
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-white cursor-blink rounded-full"
                  style={{ transform: "translateX(-1px)" }}
                />
              )}
              {char}
            </span>
          );
        })}
      </div>

      {/* ── Hidden input that captures keystrokes ───────────────────────── */}
      <input
        id="typing-input"
        ref={inputRef}
        type="text"
        value=""
        onChange={() => {}}          // controlled; actual handling is in onKeyDown
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        disabled={finished}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="opacity-0 absolute w-0 h-0 pointer-events-none"
        aria-label="Typing input"
        tabIndex={0}
      />

      {/* ── Progress strip ──────────────────────────────────────────────── */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
          <span>
            {cursor} / {prompt.length} chars
          </span>
          {finished && (
            <span className="text-green-400 font-semibold animate-fade-in">
              🎉 Complete!
            </span>
          )}
        </div>
        <div className="h-1 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full progress-fill"
            style={{ width: `${Math.round((cursor / prompt.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Inline keyframe for wrong-key shake */}
      <style>{`
        @keyframes wrongShake {
          0%   { transform: translateX(0); }
          30%  { transform: translateX(-3px); }
          70%  { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

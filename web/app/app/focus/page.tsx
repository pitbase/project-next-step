"use client";

import { useEffect, useMemo, useState } from "react";
import { getFocusEndsAt, startFocus, clearFocus } from "@/lib/storage";

function msToClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function FocusPage() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [minutes, setMinutes] = useState(15);

  useEffect(() => {
    setEndsAt(getFocusEndsAt());
    const t = setInterval(() => setEndsAt(getFocusEndsAt()), 500);
    return () => clearInterval(t);
  }, []);

  const remaining = useMemo(() => {
    if (!endsAt) return null;
    return endsAt - Date.now();
  }, [endsAt]);

  const running = endsAt != null && (remaining ?? 0) > 0;

  function begin() {
    startFocus(minutes);
    setEndsAt(getFocusEndsAt());
    // Send them to the Shield page immediately
    window.location.href = "/app/shield";
  }

  function stop() {
    clearFocus();
    setEndsAt(null);
  }

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Focus Timer</h1>

      {running ? (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="text-lg font-semibold">Focus is running.</div>
          <div className="text-4xl font-bold">{msToClock(remaining ?? 0)}</div>

          <a
            className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold"
            href="/app/shield"
          >
            Go to Shield (make sure it’s ON)
          </a>

          <button
            className="w-full border rounded-xl px-4 py-3 font-semibold"
            onClick={stop}
          >
            Stop Focus
          </button>
        </div>
      ) : (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="text-lg font-semibold">Pick your focus time.</div>

          <div className="flex gap-2">
            <button
              className={`w-full border rounded-xl px-4 py-3 font-semibold ${
                minutes === 15 ? "bg-black text-white" : ""
              }`}
              onClick={() => setMinutes(15)}
            >
              15 min
            </button>
            <button
              className={`w-full border rounded-xl px-4 py-3 font-semibold ${
                minutes === 25 ? "bg-black text-white" : ""
              }`}
              onClick={() => setMinutes(25)}
            >
              25 min
            </button>
            <button
              className={`w-full border rounded-xl px-4 py-3 font-semibold ${
                minutes === 45 ? "bg-black text-white" : ""
              }`}
              onClick={() => setMinutes(45)}
            >
              45 min
            </button>
          </div>

          <button
            className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
            onClick={begin}
          >
            Start Focus
          </button>

          <a
            className="block text-center border rounded-xl px-4 py-3 font-semibold"
            href="/app/next"
          >
            Back to Next Step
          </a>
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { clearFocus, getFocusEndsAt, startFocus } from "@/lib/storage";

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Focus() {
  const initialEnds = useMemo(() => getFocusEndsAt(), []);
  const [endsAt, setEndsAt] = useState<number | null>(initialEnds);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!endsAt) {
      startFocus(15);
      setEndsAt(getFocusEndsAt());
    }
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!endsAt) return null;

  const left = endsAt - now;
  const done = left <= 0;

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Focus Mode</h1>
      <p className="text-slate-600">No negotiating. Do the work.</p>

      <div className="text-5xl font-bold">{format(left)}</div>

      {!done ? (
        <div className="grid grid-cols-3 gap-2">
          <button className="bg-slate-100 rounded-xl px-3 py-3 font-semibold" onClick={() => startFocus(15)}>
            Keep 15
          </button>
          <button className="bg-slate-100 rounded-xl px-3 py-3 font-semibold" onClick={() => startFocus(20)}>
            +5
          </button>
          <button className="bg-slate-100 rounded-xl px-3 py-3 font-semibold" onClick={() => startFocus(25)}>
            +10
          </button>
        </div>
      ) : (
        <button className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold" onClick={() => { clearFocus(); window.location.href = "/app/next"; }}>
          Time’s up → Back to Next Step
        </button>
      )}

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/app/next">
        Back
      </a>
    </main>
  );
}

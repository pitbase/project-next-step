"use client";

import { useEffect, useState } from "react";
import { getNextTask, markDone, notNow, replaceNextText } from "@/lib/storage";

export default function NextStep() {
  const [taskText, setTaskText] = useState<string | null>(null);
  const [showRescue, setShowRescue] = useState(false);
  const [tiny, setTiny] = useState("");

  function refresh() {
    const t = getNextTask();
    setTaskText(t ? t.text : null);
  }

  useEffect(() => refresh(), []);

  if (!taskText) {
    return (
      <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">You’re done.</h1>
        <p className="text-slate-600">Good. Go be at peace.</p>
        <a className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold" href="/app/brain-dump">
          New Brain Dump
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Next Step</h1>

      <div className="border rounded-2xl p-4">
        <div className="text-sm text-slate-500">Do this now:</div>
        <div className="text-xl font-semibold mt-1">{taskText}</div>
      </div>

      <a className="block text-center bg-blue-600 text-white rounded-xl px-4 py-3 font-semibold" href="/app/focus">
        Start Focus (15 minutes)
      </a>

      <div className="grid grid-cols-2 gap-2">
        <button className="bg-black text-white rounded-xl px-4 py-3 font-semibold" onClick={() => { markDone(); refresh(); }}>
          Done
        </button>
        <button className="bg-slate-100 rounded-xl px-4 py-3 font-semibold" onClick={() => { notNow(); refresh(); }}>
          Not now
        </button>
      </div>

      <button className="w-full border rounded-xl px-4 py-3 font-semibold" onClick={() => setShowRescue((v) => !v)}>
        I’m paralyzed (Rescue)
      </button>

      {showRescue && (
        <div className="border rounded-2xl p-4 space-y-2">
          <div className="font-semibold">Make it smaller. Now.</div>
          <div className="text-sm text-slate-600">Example: “Open laptop” or “Write the title.”</div>
          <input className="w-full border rounded-xl px-3 py-2" value={tiny} onChange={(e) => setTiny(e.target.value)} placeholder="Smallest step…" />
          <button className="w-full bg-black text-white rounded-xl px-4 py-2 font-semibold" onClick={() => { replaceNextText(tiny); setTiny(""); setShowRescue(false); refresh(); }}>
            Replace with tiny step
          </button>
        </div>
      )}
    </main>
  );
}

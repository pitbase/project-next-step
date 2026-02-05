"use client";

import { useMemo, useState } from "react";
import { loadState, setTop3 } from "@/lib/storage";

export default function Pick3() {
  const tasks = useMemo(() => loadState().tasks, []);
  const [picked, setPicked] = useState<string[]>(loadState().top3Ids ?? []);

  function toggle(id: string) {
    setPicked((prev) => {
      const has = prev.includes(id);
      if (has) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function onSave() {
    setTop3(picked);
    window.location.href = "/app/next";
  }

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Pick 3 Must-Dos</h1>
      <p className="text-slate-600">Stop. You do 3 things today. Not 20.</p>

      <div className="text-sm text-slate-600">
        Picked: <span className="font-semibold">{picked.length}</span>/3
      </div>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="border rounded-xl p-3 flex items-center justify-between">
            <span>{t.text}</span>
            <button
              className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                picked.includes(t.id) ? "bg-black text-white" : "bg-slate-100"
              }`}
              onClick={() => toggle(t.id)}
            >
              {picked.includes(t.id) ? "Picked" : "Pick"}
            </button>
          </li>
        ))}
      </ul>

      <button
        className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold disabled:opacity-40"
        onClick={onSave}
        disabled={picked.length !== 3}
      >
        Save 3 → Next Step
      </button>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { getActiveTasks, setTop3 } from "@/lib/storage";

export default function Pick3Page() {
  const tasks = useMemo(() => getActiveTasks(), []);
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setError("");
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        setError("Pick only 3.");
        return prev;
      }
      return [...prev, id];
    });
  }

  function continueNext() {
    if (picked.length !== 3) {
      setError("Pick 3 tasks first.");
      return;
    }
    setTop3(picked);
    window.location.href = "/app/next";
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Pick 3</h1>
      <p className="text-slate-600">
        Only 3. This stops overwhelm.
      </p>

      {error ? <div className="text-red-600 font-semibold">{error}</div> : null}

      <div className="border rounded-2xl p-4 space-y-2">
        {tasks.length === 0 ? (
          <p className="text-slate-600">No active tasks. Go add tasks first.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => {
              const on = picked.includes(t.id);
              return (
                <li
                  key={t.id}
                  className={`border rounded-xl p-3 flex items-start gap-3 ${
                    on ? "bg-slate-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(t.id)}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{t.text}</div>
                    <div className="text-xs text-slate-500">
                      {t.category.toUpperCase()}
                      {t.time ? ` • ${t.time}` : ""}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
        onClick={continueNext}
      >
        Continue to Next Step
      </button>

      <a
        className="block text-center border rounded-xl px-4 py-3 font-semibold"
        href="/app/brain-dump"
      >
        Back
      </a>
    </main>
  );
}

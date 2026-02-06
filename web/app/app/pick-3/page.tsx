"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ensureDailyRoutineApplied,
  getActiveTasks,
  setTop3,
  type Task,
} from "@/lib/storage";

export default function Pick3Page() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  // Load tasks once when page opens
  useEffect(() => {
    // If routines are enabled, auto-add today’s routines (once per day)
    ensureDailyRoutineApplied();

    setTasks(getActiveTasks());
  }, []);

  const selectedCount = selectedIds.length;

  const helperText = useMemo(() => {
    if (tasks.length === 0) return "You have no tasks yet.";
    if (tasks.length < 3) return `You only have ${tasks.length} task(s) available today.`;
    return "Pick up to 3 tasks. (3 is best, but fewer is okay.)";
  }, [tasks.length]);

  function toggle(id: string) {
    setShowWarning(false);

    setSelectedIds((prev) => {
      const has = prev.includes(id);
      if (has) return prev.filter((x) => x !== id);

      // Don’t allow more than 3
      if (prev.length >= 3) return prev;

      return [...prev, id];
    });
  }

  function continueClicked() {
    // If they picked fewer than 3, show a warning first
    if (selectedCount < 3) {
      setShowWarning(true);
      return;
    }

    // Exactly 3 → proceed
    setTop3(selectedIds);
    router.push("/app/next");
  }

  function continueAnyway() {
    // Allow 0,1,2, or 3
    setTop3(selectedIds);
    router.push("/app/next");
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Pick up to 3</h1>

      <p className="text-slate-600">{helperText}</p>

      <div className="text-sm">
        Selected: <span className="font-semibold">{selectedCount}</span> / 3
      </div>

      {tasks.length === 0 ? (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="font-semibold">Coach:</div>
          <div className="text-slate-700">
            No tasks found. Do a quick Brain Dump first.
          </div>

          <a
            className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold"
            href="/app/brain-dump"
          >
            Go to Brain Dump
          </a>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => {
            const checked = selectedIds.includes(t.id);
            const disabled = !checked && selectedIds.length >= 3;

            return (
              <li
                key={t.id}
                className={`border rounded-xl p-3 flex items-start gap-3 ${
                  disabled ? "opacity-60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(t.id)}
                />
                <div className="flex-1">
                  <div className="font-semibold">{t.text}</div>
                  <div className="text-xs text-slate-500">
                    {t.category?.toUpperCase?.() ?? "OTHER"}
                    {t.time ? ` • ${t.time}` : ""}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Warning box if fewer than 3 */}
      {showWarning ? (
        <div className="border rounded-2xl p-4 bg-yellow-50 space-y-3">
          <div className="font-semibold">Coach (firm):</div>

          {selectedCount === 0 ? (
            <div className="text-slate-800">
              You picked <b>0</b>. That’s risky — you might drift.
              <br />
              Want to continue anyway?
            </div>
          ) : (
            <div className="text-slate-800">
              You picked <b>{selectedCount}</b>. Three is best because it stops
              “too much at once.”
              <br />
              Want to continue anyway?
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              className="px-4 py-2 rounded-xl border font-semibold"
              onClick={() => setShowWarning(false)}
            >
              Go back
            </button>

            <button
              className="px-4 py-2 rounded-xl bg-black text-white font-semibold"
              onClick={continueAnyway}
            >
              Continue anyway
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2 flex-wrap">
        <button
          className="flex-1 bg-black text-white rounded-xl px-4 py-3 font-semibold"
          onClick={continueClicked}
        >
          Continue
        </button>

        <a
          className="flex-1 text-center border rounded-xl px-4 py-3 font-semibold"
          href="/app/brain-dump"
        >
          Back
        </a>
      </div>

      <div className="text-xs text-slate-500">
        Tip: You can pick fewer, but 3 is the “sweet spot.”
      </div>
    </main>
  );
}

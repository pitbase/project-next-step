"use client";

import { useMemo, useState } from "react";
import {
  addRoutineItem,
  applyDailyRoutineNow,
  deleteRoutineItem,
  getLastRoutineAppliedDate,
  getPrefs,
  getRoutineItems,
  setPrefs,
  toggleRoutineEnabled,
  type TaskCategory,
} from "@/lib/storage";

const CATS: { key: TaskCategory; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "work", label: "Work" },
  { key: "home", label: "Home" },
  { key: "evening", label: "Evening" },
  { key: "night", label: "Night" },
  { key: "other", label: "Other" },
];

export default function RoutinesPage() {
  const [text, setText] = useState("");
  const [cat, setCat] = useState<TaskCategory>("morning");
  const [time, setTime] = useState("");
  const [msg, setMsg] = useState("");
  const [, tick] = useState(0);

  function refresh(message?: string) {
    if (message) setMsg(message);
    tick((x) => x + 1);
  }

  const prefs = useMemo(() => getPrefs(), [msg]);
  const items = useMemo(() => getRoutineItems(), [msg]);

  const lastApplied = getLastRoutineAppliedDate();

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Daily Routines</h1>
      <p className="text-slate-600">
        These are “repeat every day” tasks (brush teeth, shower, gym…).
      </p>

      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">Auto-add every day</div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.autoAddDailyRoutines}
            onChange={(e) => {
              setPrefs({ autoAddDailyRoutines: e.target.checked });
              refresh("Saved.");
            }}
          />
          <span className="text-slate-700">
            Automatically add my routine tasks once per day
          </span>
        </label>

        <div className="text-xs text-slate-500">
          Last added date: {lastApplied ?? "never"}
        </div>

        <button
          className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
          onClick={() => {
            const res = applyDailyRoutineNow();
            refresh(res.reason);
          }}
        >
          Add today’s routine now
        </button>

        {msg ? <div className="text-sm text-slate-600">{msg}</div> : null}
      </div>

      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">Add a routine task</div>

        <input
          className="w-full border rounded-xl px-4 py-3"
          placeholder="Example: brush teeth"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="text-sm font-semibold">Category</label>
            <select
              className="w-full border rounded-xl px-3 py-3"
              value={cat}
              onChange={(e) => setCat(e.target.value as TaskCategory)}
            >
              {CATS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="text-sm font-semibold">Time (optional)</label>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-3"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <button
          className="w-full border rounded-xl px-4 py-3 font-semibold"
          onClick={() => {
            addRoutineItem(text, cat, time ? time : null);
            setText("");
            setTime("");
            refresh("Routine task added.");
          }}
        >
          Save routine task
        </button>
      </div>

      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">My routine list</div>

        {items.length === 0 ? (
          <p className="text-slate-600">No routine tasks yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((r) => (
              <li
                key={r.id}
                className="border rounded-xl p-3 flex items-start gap-3"
              >
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={() => {
                    toggleRoutineEnabled(r.id);
                    refresh("Updated.");
                  }}
                />

                <div className="flex-1">
                  <div className="font-semibold">{r.text}</div>
                  <div className="text-xs text-slate-500">
                    {r.category.toUpperCase()}
                    {r.time ? ` • ${r.time}` : ""}
                  </div>
                </div>

                <button
                  className="border rounded-lg px-2 py-1 text-sm font-semibold"
                  onClick={() => {
                    deleteRoutineItem(r.id);
                    refresh("Deleted.");
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <a
        className="block text-center border rounded-xl px-4 py-3 font-semibold"
        href="/app/brain-dump"
      >
        Back to Brain Dump
      </a>
    </main>
  );
}

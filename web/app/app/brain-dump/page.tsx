"use client";
<a
  className="block text-center border rounded-xl px-4 py-3 font-semibold"
  href="/app/routines"
>
  Daily Routines (repeat every day)
</a>

import { useEffect, useMemo, useState } from "react";
import {
  addTask,
  deleteTask,
  getTasks,
  toggleTaskDone,
  updateTask,
  type TaskCategory,
} from "@/lib/storage";

const CATS: { key: TaskCategory; label: string }[] = [
  { key: "work", label: "Work" },
  { key: "home", label: "Home" },
  { key: "morning", label: "Morning" },
  { key: "evening", label: "Evening" },
  { key: "night", label: "Night" },
  { key: "other", label: "Other" },
];

export default function BrainDumpPage() {
  const [text, setText] = useState("");
  const [cat, setCat] = useState<TaskCategory>("other");
  const [time, setTime] = useState<string>("");
  const [showDone, setShowDone] = useState(false);
  const [, rerender] = useState(0);

  useEffect(() => {
    rerender((x) => x + 1);
  }, []);

  const tasks = useMemo(() => {
    const all = getTasks();
    return showDone ? all : all.filter((t) => !t.done);
  }, [showDone, text]); // (text included just to refresh often)

  function refresh() {
    rerender((x) => x + 1);
  }

  function addOne() {
    addTask(text, cat, time ? time : null);
    setText("");
    setTime("");
    refresh();
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Brain Dump</h1>
      <p className="text-slate-600">
        Put everything here. Then we’ll pick only 3.
      </p>

      <div className="border rounded-2xl p-4 space-y-3">
        <label className="font-semibold">Task</label>
        <input
          className="w-full border rounded-xl px-4 py-3"
          placeholder="Example: email landlord"
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
          className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
          onClick={addOne}
        >
          Add task
        </button>

        <div className="flex items-center gap-2">
          <input
            id="showDone"
            type="checkbox"
            checked={showDone}
            onChange={(e) => setShowDone(e.target.checked)}
          />
          <label htmlFor="showDone" className="text-sm text-slate-600">
            Show done tasks
          </label>
        </div>
      </div>

      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">Your tasks</div>

        {tasks.length === 0 ? (
          <p className="text-slate-600">No tasks yet.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-start gap-2 border rounded-xl p-3"
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => {
                    toggleTaskDone(t.id);
                    refresh();
                  }}
                />

                <div className="flex-1">
                  <div
                    className={`font-semibold ${
                      t.done ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {t.text}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.category.toUpperCase()}
                    {t.time ? ` • ${t.time}` : ""}
                  </div>

                  <div className="mt-2 flex gap-2 flex-wrap">
                    <select
                      className="border rounded-lg px-2 py-1 text-sm"
                      value={t.category}
                      onChange={(e) => {
                        updateTask(t.id, { category: e.target.value as TaskCategory });
                        refresh();
                      }}
                    >
                      {CATS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      className="border rounded-lg px-2 py-1 text-sm"
                      value={t.time ?? ""}
                      onChange={(e) => {
                        updateTask(t.id, { time: e.target.value || null });
                        refresh();
                      }}
                    />
                  </div>
                </div>

                <button
                  className="border rounded-lg px-2 py-1 text-sm font-semibold"
                  onClick={() => {
                    deleteTask(t.id);
                    refresh();
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
        className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold"
        href="/app/pick-3"
      >
        Next: Pick 3
      </a>
    </main>
  );
}

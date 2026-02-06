"use client";

import { useMemo, useState } from "react";
import { deleteTask, getNextTask, markDone, notNow, replaceNextText } from "@/lib/storage";

export default function NextPage() {
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState("");

  const task = useMemo(() => getNextTask(), []);

  if (!task) {
    return (
      <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Next Step</h1>
        <p className="text-slate-600">No next task. Pick 3 again.</p>
        <a className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold" href="/app/pick-3">
          Pick 3
        </a>
        <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/app/brain-dump">
          Add tasks
        </a>
      </main>
    );
  }

  function refresh() {
    window.location.reload();
  }

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Next Step</h1>

      <div className="border rounded-2xl p-4 space-y-2">
        <div className="text-xs text-slate-500">
          {task.category.toUpperCase()}
          {task.time ? ` • ${task.time}` : ""}
        </div>

        {!edit ? (
          <div className="text-xl font-bold">{task.text}</div>
        ) : (
          <div className="space-y-2">
            <input
              className="w-full border rounded-xl px-4 py-3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Edit task text"
            />
            <button
              className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
              onClick={() => {
                replaceNextText(text);
                setEdit(false);
                refresh();
              }}
            >
              Save edit
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          className="bg-black text-white rounded-xl px-4 py-3 font-semibold"
          onClick={() => {
            markDone();
            refresh();
          }}
        >
          Done
        </button>

        <button
          className="border rounded-xl px-4 py-3 font-semibold"
          onClick={() => {
            notNow();
            refresh();
          }}
        >
          Not now
        </button>

        <button
          className="border rounded-xl px-4 py-3 font-semibold"
          onClick={() => {
            setEdit(true);
            setText(task.text);
          }}
        >
          Edit
        </button>

        <button
          className="border rounded-xl px-4 py-3 font-semibold"
          onClick={() => {
            deleteTask(task.id);
            refresh();
          }}
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/app/shield">
          Shield
        </a>
        <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/app/settings">
          Block list
        </a>
      </div>
    </main>
  );
}

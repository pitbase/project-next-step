"use client";

import { useEffect, useState } from "react";
import { addTask, loadState } from "@/lib/storage";

export default function BrainDump() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState(loadState().tasks);

  useEffect(() => setTasks(loadState().tasks), []);

  function onAdd() {
    addTask(text);
    setText("");
    setTasks(loadState().tasks);
  }

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Brain Dump</h1>
      <p className="text-slate-600">Dump everything. No sorting. No shame.</p>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Example: Pay rent"
        />
        <button className="bg-black text-white rounded-xl px-4 py-2" onClick={onAdd}>
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="border rounded-xl p-3">
            {t.text}
          </li>
        ))}
      </ul>

      <a className="block text-center bg-blue-600 text-white rounded-xl px-4 py-3 font-semibold" href="/app/pick-3">
        Next: Pick 3
      </a>
    </main>
  );
}

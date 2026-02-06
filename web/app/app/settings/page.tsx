"use client";

import { useMemo, useState } from "react";
import {
  addBlockedDomain,
  getBlockedDomains,
  removeBlockedDomain,
  setBlockedDomains,
} from "@/lib/storage";

const SUGGESTED = [
  "tiktok.com",
  "youtube.com",
  "instagram.com",
  "facebook.com",
  "x.com",
  "reddit.com",
  "web.whatsapp.com",
];

export default function SettingsPage() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");

  const domains = useMemo(() => getBlockedDomains(), [status]);

  function refresh(msg?: string) {
    if (msg) setStatus(msg);
    else setStatus(String(Date.now()));
  }

  function addOne() {
    addBlockedDomain(input);
    setInput("");
    refresh("Added.");
  }

  function copyList() {
    navigator.clipboard.writeText(domains.join("\n"));
    refresh("Copied list.");
  }

  function resetSuggested() {
    setBlockedDomains(SUGGESTED);
    refresh("Reset to suggested.");
  }

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-slate-600">
        Add sites you want blocked by Shield.
      </p>

      <div className="border rounded-2xl p-4 space-y-3">
        <label className="font-semibold">Add a site</label>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-xl px-4 py-3"
            placeholder="example: youtube.com"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-black text-white rounded-xl px-4 py-3 font-semibold"
            onClick={addOne}
          >
            Add
          </button>
        </div>

        <div className="text-sm text-slate-600">Quick add:</div>
        <div className="flex gap-2 flex-wrap">
          {SUGGESTED.map((d) => (
            <button
              key={d}
              className="border rounded-xl px-3 py-2 text-sm font-semibold"
              onClick={() => {
                addBlockedDomain(d);
                refresh("Added.");
              }}
            >
              + {d}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            className="border rounded-xl px-4 py-3 font-semibold"
            onClick={copyList}
          >
            Copy list
          </button>
          <button
            className="border rounded-xl px-4 py-3 font-semibold"
            onClick={resetSuggested}
          >
            Reset suggested
          </button>
        </div>

        {status ? <div className="text-xs text-slate-500">{status}</div> : null}
      </div>

      <div className="border rounded-2xl p-4 space-y-2">
        <div className="font-semibold">Blocked sites</div>
        {domains.length === 0 ? (
          <p className="text-slate-600">None yet.</p>
        ) : (
          <ul className="space-y-2">
            {domains.map((d) => (
              <li
                key={d}
                className="border rounded-xl p-3 flex items-center justify-between"
              >
                <span className="font-semibold">{d}</span>
                <button
                  className="border rounded-xl px-3 py-2 text-sm font-semibold"
                  onClick={() => {
                    removeBlockedDomain(d);
                    refresh("Removed.");
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <a
        className="block text-center border rounded-xl px-4 py-3 font-semibold"
        href="/app/next"
      >
        Back to Next Step
      </a>
    </main>
  );
}

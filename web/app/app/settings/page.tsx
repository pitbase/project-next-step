"use client";

import { useEffect, useState } from "react";
import { getBlockedDomains, setBlockedDomains } from "@/lib/storage";

function clean(line: string) {
  return line
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

export default function SettingsPage() {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(getBlockedDomains().join("\n"));
  }, []);

  function save() {
    const domains = text
      .split("\n")
      .map(clean)
      .filter(Boolean);

    setBlockedDomains(domains);
    alert("Saved.");
  }

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-slate-600">
        One website per line. Example: <span className="font-semibold">youtube.com</span>
      </p>

      <textarea
        className="w-full border rounded-xl p-3 min-h-[240px]"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold" onClick={save}>
        Save blocked sites
      </button>

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/app/next">
        Back to Next Step
      </a>

      <p className="text-xs text-slate-500">
        Note: This saves your list. The actual “blocking” comes later with the Shield.
      </p>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { isShieldOn, setShieldOn } from "@/lib/storage";

export default function ShieldPage() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isShieldOn());
  }, []);

  function turnOn() {
    setShieldOn(true);
    setOn(true);
  }

  function turnOff() {
    setShieldOn(false);
    setOn(false);
  }

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Shield</h1>

      {on ? (
        <div className="border rounded-2xl p-4 space-y-2">
          <div className="text-lg font-semibold">Shield is ON.</div>
          <p className="text-slate-600">
            Close distraction tabs. Do your Next Step now.
          </p>

          <button
            className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
            onClick={turnOff}
          >
            Turn Shield OFF
          </button>
        </div>
      ) : (
        <div className="border rounded-2xl p-4 space-y-2">
          <div className="text-lg font-semibold">Shield is OFF.</div>
          <p className="text-slate-600">Turn it on when you want to focus.</p>

          <button
            className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
            onClick={turnOn}
          >
            Turn Shield ON
          </button>
        </div>
      )}

      <a
        className="block text-center border rounded-xl px-4 py-3 font-semibold"
        href="/app/settings"
      >
        Edit blocked sites
      </a>

      <a
        className="block text-center border rounded-xl px-4 py-3 font-semibold"
        href="/app/next"
      >
        Back to Next Step
      </a>
    </main>
  );
}

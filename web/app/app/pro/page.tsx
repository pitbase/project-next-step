"use client";

import { useState } from "react";

export default function ProPage() {
  const [loading, setLoading] = useState(false);

  async function goCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (data.url) window.location.href = data.url;
    else alert(data.error || "Checkout failed");
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Go Pro</h1>

      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">Pro ($5/month)</div>
        <ul className="list-disc pl-5 text-slate-700 space-y-1">
          <li>Unlimited routines</li>
          <li>Unlimited blocked sites</li>
          <li>Smart reminders</li>
          <li>Cloud sync across devices</li>
        </ul>

        <button
          className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
          onClick={goCheckout}
          disabled={loading}
        >
          {loading ? "Loading…" : "Start Pro"}
        </button>

        <div className="text-xs text-slate-500">
          Cancel anytime in your Stripe customer portal.
        </div>
      </div>

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/app/settings">
        Back to Settings
      </a>
    </main>
  );
}

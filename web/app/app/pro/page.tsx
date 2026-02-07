"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SubRow = {
  status: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
};

export default function ProPage() {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sub, setSub] = useState<SubRow | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setUserEmail(user?.email ?? null);
      if (!user) return;

      const { data: row } = await supabase
        .from("pns_subscriptions")
        .select("status,stripe_customer_id,current_period_end")
        .eq("user_id", user.id)
        .single();

      setSub((row as any) ?? null);
    })();
  }, []);

  const isPro = sub?.status === "active" || sub?.status === "trialing";

  async function startCheckout() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
    else setMsg(data.error || "Checkout failed");
  }

  async function manageBilling() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
    else setMsg(data.error || "Portal failed");
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Pro</h1>

      {!userEmail ? (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="font-semibold">Coach:</div>
          <div className="text-slate-700">Sign in first so we can save your Pro status.</div>
          <a className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold" href="/app/auth">
            Go to Sign In
          </a>
        </div>
      ) : (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="text-slate-700">
            Signed in as: <b>{userEmail}</b>
          </div>

          {isPro ? (
            <>
              <div className="font-semibold">Status: ✅ Pro ({sub?.status})</div>
              <button
                className="w-full border rounded-xl px-4 py-3 font-semibold"
                onClick={manageBilling}
                disabled={loading}
              >
                {loading ? "Loading…" : "Manage billing (cancel / card / invoices)"}
              </button>
            </>
          ) : (
            <>
              <div className="font-semibold">Status: Free</div>
              <button
                className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
                onClick={startCheckout}
                disabled={loading}
              >
                {loading ? "Loading…" : "Start Pro ($5/month)"}
              </button>
            </>
          )}

          <div className="text-xs text-slate-500">
            After you pay, your Pro status updates via Stripe webhooks.
          </div>
        </div>
      )}

      {msg ? <div className="text-sm text-slate-600">{msg}</div> : null}

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/app/settings">
        Back to Settings
      </a>
    </main>
  );
}

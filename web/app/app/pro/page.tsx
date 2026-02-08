"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type SubRow = {
  status: string | null;
  stripe_price_id: string | null;
  current_period_end: string | null;
};

export default function ProPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sub, setSub] = useState<SubRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const success = params.get("success");
  const canceled = params.get("canceled");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.replace("/app/auth");
        return;
      }

      setUserEmail(user.email ?? null);

      const { data: row, error } = await supabase
        .from("pns_subscriptions")
        .select("status,stripe_price_id,current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) setMsg(`Could not load subscription: ${error.message}`);
      setSub(row ?? null);
      setLoading(false);
    })();
  }, [router]);

  const isPro = useMemo(() => {
    const s = (sub?.status ?? "").toLowerCase();
    return s === "active" || s === "trialing";
  }, [sub]);

  async function startCheckout() {
    setBusy(true);
    setMsg("");

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const body = await res.json();

      if (!res.ok) throw new Error(body?.error || "Checkout failed");
      if (!body?.url) throw new Error("Missing Stripe checkout URL");

      // Stripe returns a hosted Checkout URL. Redirect users to it. :contentReference[oaicite:1]{index=1}
      window.location.href = body.url;
    } catch (e: any) {
      setMsg(e?.message || "Checkout failed");
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    setMsg("");

    try {
      // Some implementations use POST, some use GET. Try POST first, then GET.
      let res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.status === 405) res = await fetch("/api/stripe/portal");

      const body = await res.json();

      if (!res.ok) throw new Error(body?.error || "Portal failed");
      if (!body?.url) throw new Error("Missing portal URL");

      window.location.href = body.url;
    } catch (e: any) {
      setMsg(e?.message || "Portal failed");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Pro</h1>

      {success ? (
        <div className="border rounded-2xl p-4">
          <div className="font-semibold">Payment received ✅</div>
          <div className="text-sm text-slate-600">
            It can take a few seconds for your Pro status to update.
          </div>
        </div>
      ) : null}

      {canceled ? (
        <div className="border rounded-2xl p-4">
          <div className="font-semibold">Payment canceled</div>
          <div className="text-sm text-slate-600">You can try again anytime.</div>
        </div>
      ) : null}

      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">Signed in as</div>
        <div className="text-slate-700">{userEmail ?? "…"}</div>

        {loading ? (
          <div className="text-sm text-slate-600">Loading subscription…</div>
        ) : isPro ? (
          <>
            <div className="text-sm">
              <span className="font-semibold">Status:</span> {sub?.status ?? "active"}
            </div>

            {sub?.current_period_end ? (
              <div className="text-sm text-slate-600">
                Renews/ends: {new Date(sub.current_period_end).toLocaleDateString()}
              </div>
            ) : null}

            <button
              className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
              onClick={openPortal}
              disabled={busy}
            >
              {busy ? "Opening…" : "Manage subscription"}
            </button>
          </>
        ) : (
          <>
            <div className="text-sm text-slate-600">
              You’re on the free plan. Upgrade to unlock Pro.
            </div>

            <button
              className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
              onClick={startCheckout}
              disabled={busy}
            >
              {busy ? "Opening Stripe…" : "Upgrade to Pro"}
            </button>
          </>
        )}
      </div>

      {msg ? <div className="text-sm text-slate-600">{msg}</div> : null}

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/">
        Back home
      </a>
    </main>
  );
}

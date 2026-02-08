"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type SubRow = {
  status: string | null;
  stripe_price_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
};

function isProStatus(status: string | null) {
  // You can adjust this list later if you want different access rules.
  return status === "active" || status === "trialing";
}

export default function ProClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sub, setSub] = useState<SubRow | null>(null);
  const [loading, setLoading] = useState(true);

  const [notice, setNotice] = useState<string>("");
  const [busyCheckout, setBusyCheckout] = useState(false);
  const [busyPortal, setBusyPortal] = useState(false);

  const pro = useMemo(() => isProStatus(sub?.status ?? null), [sub?.status]);

  async function loadUserAndSub() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      // Not signed in -> send to auth
      router.replace("/app/auth");
      return;
    }

    setUserEmail(user.email ?? null);

    const { data: subRow, error } = await supabase
      .from("pns_subscriptions")
      .select("status,stripe_price_id,stripe_subscription_id,current_period_end")
      .maybeSingle();

    if (error) {
      // If table/RLS is misconfigured you'll see the error here
      setNotice(error.message);
      setSub(null);
    } else {
      setSub((subRow as SubRow) ?? null);
    }

    setLoading(false);
  }

  // initial load
  useEffect(() => {
    loadUserAndSub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After Stripe redirects back with success=1, webhooks may take a few seconds.
  // Poll Supabase until status flips to active/trialing (or timeout).
  useEffect(() => {
    if (!success) return;
    if (pro) return;

    setNotice("✅ Payment received. Activating Pro… (may take a few seconds)");

    let tries = 0;
    const maxTries = 20; // ~20 * 1500ms = 30s
    const interval = setInterval(async () => {
      tries += 1;
      await loadUserAndSub();

      // After reload, if pro is true we can stop.
      // (We check again from latest state via query below.)
      const { data: check } = await supabase
        .from("pns_subscriptions")
        .select("status")
        .maybeSingle();

      if (isProStatus((check as any)?.status ?? null)) {
        clearInterval(interval);
        setNotice("🎉 You’re Pro! Your subscription is active.");
        // Clean the URL so success=1 doesn’t keep showing
        router.replace("/app/pro");
        return;
      }

      if (tries >= maxTries) {
        clearInterval(interval);
        setNotice(
          "Still activating… If this doesn’t update, check Stripe → Webhooks → Recent deliveries (your webhook may not be reaching your app)."
        );
      }
    }, 1500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, pro]);

  useEffect(() => {
    if (canceled) setNotice("Payment canceled. You can try again anytime.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canceled]);

  async function startCheckout() {
    setBusyCheckout(true);
    setNotice("Opening Stripe Checkout…");

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();

      if (!res.ok || !json?.url) {
        setNotice(json?.error ?? "Could not start checkout.");
        setBusyCheckout(false);
        return;
      }

      window.location.href = json.url;
    } catch (e: any) {
      setNotice(e?.message ?? "Could not start checkout.");
      setBusyCheckout(false);
    }
  }

  async function openPortal() {
    setBusyPortal(true);
    setNotice("Opening billing portal…");

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();

      if (!res.ok || !json?.url) {
        setNotice(json?.error ?? "Could not open billing portal.");
        setBusyPortal(false);
        return;
      }

      window.location.href = json.url;
    } catch (e: any) {
      setNotice(e?.message ?? "Could not open billing portal.");
      setBusyPortal(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-6 max-w-md mx-auto">
        <div className="border rounded-2xl p-4">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Pro</h1>

      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">Signed in as:</div>
        <div className="text-slate-700">{userEmail ?? "Unknown"}</div>

        <div className="text-sm">
          Current status:{" "}
          <span className="font-semibold">
            {pro ? "PRO ✅" : sub?.status ?? "free"}
          </span>
        </div>

        {pro ? (
          <>
            <div className="text-sm text-slate-600">
              🎉 Thanks for subscribing — you have Pro access.
            </div>

            <button
              className="w-full border rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
              onClick={openPortal}
              disabled={busyPortal}
            >
              {busyPortal ? "Opening…" : "Manage billing"}
            </button>
          </>
        ) : (
          <>
            <button
              className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
              onClick={startCheckout}
              disabled={busyCheckout}
            >
              {busyCheckout ? "Opening…" : "Upgrade to Pro"}
            </button>

            <button
              className="w-full border rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
              onClick={openPortal}
              disabled={busyPortal}
            >
              {busyPortal ? "Opening…" : "Manage billing"}
            </button>
          </>
        )}

        {notice ? <div className="text-sm text-slate-600">{notice}</div> : null}
      </div>

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/">
        Back home
      </a>
    </main>
  );
}

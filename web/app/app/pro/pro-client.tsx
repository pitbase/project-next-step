"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type SubRow = {
  status?: string | null;
  current_period_end?: string | null;
  stripe_price_id?: string | null;
};

export default function ProClient() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("success")) setMsg("✅ Success! Your checkout started.");
    if (searchParams.get("canceled")) setMsg("❌ Checkout canceled.");
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      setEmail(user?.email ?? null);
      if (!user) return;

      // Optional: if you created pns_subscriptions, show status
      const { data: row } = await supabase
        .from("pns_subscriptions")
        .select("status,current_period_end,stripe_price_id")
        .eq("user_id", user.id)
        .maybeSingle();

      setSubStatus((row as SubRow | null)?.status ?? null);
    })();
  }, []);

  async function startCheckout() {
    setMsg("Opening Stripe checkout…");
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const json = await res.json();
    if (!res.ok) return setMsg(json?.error ?? "Checkout failed.");
    window.location.href = json.url;
  }

  async function openPortal() {
    setMsg("Opening billing portal…");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const json = await res.json();
    if (!res.ok) return setMsg(json?.error ?? "Portal failed.");
    window.location.href = json.url;
  }

  if (!email) {
    return (
      <div className="border rounded-2xl p-4 space-y-3">
        <div className="text-sm text-slate-700">Please sign in first.</div>
        <a
          className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold"
          href="/app/auth"
        >
          Go to Sign in
        </a>
        {msg ? <div className="text-sm text-slate-600">{msg}</div> : null}
      </div>
    );
  }

  return (
    <div className="border rounded-2xl p-4 space-y-3">
      <div className="font-semibold">Signed in as:</div>
      <div className="text-slate-700">{email}</div>

      <div className="text-sm text-slate-600">
        Current status: <span className="font-semibold">{subStatus ?? "free"}</span>
      </div>

      <button
        className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
        onClick={startCheckout}
      >
        Upgrade to Pro
      </button>

      <button
        className="w-full border rounded-xl px-4 py-3 font-semibold"
        onClick={openPortal}
      >
        Manage billing
      </button>

      {msg ? <div className="text-sm text-slate-600">{msg}</div> : null}
    </div>
  );
}

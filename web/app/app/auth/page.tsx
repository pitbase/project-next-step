"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // IMPORTANT: match your real callback route
  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/app/auth/callback`;
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  async function sendMagicLink() {
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("Type an email first.");
      return;
    }

    setBusy(true);
    setStatus("Sending link…");

    // For PKCE flows, Supabase expects a callback route and redirect allow list. :contentReference[oaicite:0]{index=0}
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus(
        "Check your email and click the sign-in link. IMPORTANT: open the link in the SAME browser you used to request it."
      );
    }

    setBusy(false);
  }

  async function signOut() {
    setBusy(true);
    await supabase.auth.signOut();
    setUserEmail(null);
    setStatus("Signed out.");
    setBusy(false);
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>

      {userEmail ? (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="font-semibold">You are signed in as:</div>
          <div className="text-slate-700 break-words">{userEmail}</div>

          <a
            className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold"
            href="/app/cloud"
          >
            Go to Cloud Sync
          </a>

          <button
            className="w-full border rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
            onClick={signOut}
            disabled={busy}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="font-semibold">Email</div>

          <input
            className="w-full border rounded-xl px-4 py-3"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
          />

          <button
            className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
            onClick={sendMagicLink}
            disabled={busy}
          >
            {busy ? "Sending…" : "Send me a sign-in link"}
          </button>

          <div className="text-xs text-slate-500">
            The email link returns to{" "}
            <span className="font-mono">
              {callbackUrl || "/app/auth/callback"}
            </span>
            . Open the email link in the <b>same browser</b> you used to request it.
          </div>
        </div>
      )}

      {status ? <div className="text-sm text-slate-600">{status}</div> : null}

      <a
        className="block text-center border rounded-xl px-4 py-3 font-semibold"
        href="/"
      >
        Back home
      </a>
    </main>
  );
}

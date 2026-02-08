"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendMagicLink() {
    setStatus("Sending link…");

    // This must be allowed in Supabase Redirect URLs
    const redirectTo = `${location.origin}/app/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Check your email. Click the link to sign in.");
    setCooldown(60);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserEmail(null);
    setStatus("Signed out.");
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>

      {userEmail ? (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="font-semibold">You are signed in as:</div>
          <div className="text-slate-700">{userEmail}</div>

          <a
            className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold"
            href="/app/pro"
          >
            Continue to Pro (Payment)
          </a>

          <button
            className="w-full border rounded-xl px-4 py-3 font-semibold"
            onClick={signOut}
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
          />

          <button
            className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
            onClick={sendMagicLink}
            disabled={!email || cooldown > 0}
          >
            {cooldown > 0 ? `Wait ${cooldown}s…` : "Send me a sign-in link"}
          </button>

          <div className="text-xs text-slate-500">
            Tip: open the email link in the same browser you used to request it.
          </div>
        </div>
      )}

      {status ? <div className="text-sm text-slate-600">{status}</div> : null}

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/">
        Back home
      </a>
    </main>
  );
}

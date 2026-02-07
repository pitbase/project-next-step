"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function sendMagicLink() {
    setStatus("Sending link…");
    const redirectTo = `${location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) setStatus(error.message);
    else setStatus("Check your email. Click the link to sign in.");
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
            href="/app/cloud"
          >
            Go to Cloud Sync
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
            className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
            onClick={sendMagicLink}
          >
            Send me a sign-in link
          </button>
        </div>
      )}

      {status ? <div className="text-sm text-slate-600">{status}</div> : null}

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/">
        Back home
      </a>
    </main>
  );
}

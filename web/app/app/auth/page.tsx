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

    // Send the user back to our server callback route so PKCE/code exchange is handled server-side.
    const redirectTo = `${location.origin}/app/auth/callback?next=/app/cloud`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Check your email. Open the link in the SAME browser you requested it in.");
    }
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

          <div className="text-xs text-slate-500">
            Tip: open the email link in the <b>same browser</b> you used to request it.
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

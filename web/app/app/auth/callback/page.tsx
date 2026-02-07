"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Finishing sign in…");

  useEffect(() => {
    async function run() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (!code) {
          setStatus("No code found in the URL. Try signing in again.");
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setStatus(`Sign in failed: ${error.message}`);
          return;
        }

        setStatus("Signed in! Sending you to Cloud Sync…");
        setTimeout(() => window.location.assign("/app/cloud"), 700);
      } catch {
        setStatus("Something went wrong. Try again.");
      }
    }

    run();
  }, []);

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Signing you in…</h1>
      <div className="text-slate-700">{status}</div>

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/app/auth">
        Back to Sign In
      </a>
    </main>
  );
}

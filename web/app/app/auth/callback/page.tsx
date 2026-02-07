"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (!code) {
          setStatus("Missing sign-in code. Go back and request a new sign-in link.");
          return;
        }

        // PKCE: exchange the auth code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setStatus(`Sign in failed: ${error.message}`);
          return;
        }

        setStatus("Signed in! Redirecting…");
        setTimeout(() => window.location.replace("/app/cloud"), 400);
      } catch {
        setStatus("Sign in failed unexpectedly. Please try again.");
      }
    };

    run();
  }, []);

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Signing you in…</h1>

      <div className="border rounded-2xl p-4 space-y-3">
        <div className="text-slate-700">{status}</div>

        <a
          className="block text-center border rounded-xl px-4 py-3 font-semibold"
          href="/app/auth"
        >
          Back to Sign In
        </a>
      </div>
    </main>
  );
}

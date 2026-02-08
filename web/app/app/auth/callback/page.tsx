"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        setMsg("Missing code. Go back and request a new link.");
        router.replace("/app/auth");
        return;
      }

      // Exchanges the PKCE auth code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setMsg(`Sign-in failed: ${error.message}`);
        router.replace("/app/auth");
        return;
      }

      router.replace("/app/pro");
    })();
  }, [router]);

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <div className="border rounded-2xl p-4">
        <div className="font-semibold">{msg}</div>
      </div>
    </main>
  );
}

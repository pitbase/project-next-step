"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function safeNextPath(input: string | null, fallback: string) {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  return input;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Signing you in…");

  const nextPath = useMemo(() => {
    return safeNextPath(searchParams.get("next"), "/app/pro");
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      const code = searchParams.get("code");

      if (!code) {
        setMsg("Missing code. Please request a new sign-in link.");
        router.replace(`/app/auth?next=${encodeURIComponent(nextPath)}&error=missing_code`);
        return;
      }

      // Supabase documents exchanging the `code` for a session. :contentReference[oaicite:2]{index=2}
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setMsg(`Sign-in failed: ${error.message}`);
        router.replace(
          `/app/auth?next=${encodeURIComponent(nextPath)}&error=auth_failed&error_description=${encodeURIComponent(
            error.message
          )}`
        );
        return;
      }

      // Success: go to Pro (or whatever "next" was)
      router.replace(nextPath);
    })();
  }, [router, searchParams, nextPath]);

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <div className="border rounded-2xl p-4">
        <div className="font-semibold">{msg}</div>
      </div>
    </main>
  );
}

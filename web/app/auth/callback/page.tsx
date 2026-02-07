"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setMsg("No code found. Try signing in again.");
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setMsg(error.message);
      else router.replace("/app/cloud");
    });
  }, [params, router]);

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <div className="border rounded-2xl p-4">
        <div className="font-semibold">Coach:</div>
        <div className="text-slate-700">{msg}</div>
      </div>
    </main>
  );
}

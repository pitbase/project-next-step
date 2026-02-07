import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/app/cloud";

  const supabase = createSupabaseServerClient();

  // Support BOTH common patterns:
  // 1) Magic link / OAuth style: ?code=...
  // 2) PKCE email template flow: ?token_hash=...&type=...
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as
    | "signup"
    | "magiclink"
    | "recovery"
    | "invite"
    | "email_change"
    | null;

  let ok = false;

  try {
    if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      ok = !error;
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      ok = !error;
    }
  } catch {
    ok = false;
  }

  // Always redirect somewhere predictable
  const dest = ok ? next : "/app/auth";
  return NextResponse.redirect(new URL(dest, url.origin));
}

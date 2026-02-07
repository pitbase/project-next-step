// web/app/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app/cloud";

  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type"); // e.g. "magiclink"

  const supabase = await createClient();

  try {
    if (code) {
      // PKCE/OAuth-style callback
      await supabase.auth.exchangeCodeForSession(code);
    } else if (token_hash && type) {
      // Some email links come back as token_hash + type
      await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });
    }
  } catch {
    // If something goes wrong, still redirect to sign-in so user can retry.
    return NextResponse.redirect(`${origin}/app/auth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

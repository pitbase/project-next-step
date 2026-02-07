// web/app/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  // Where to send the user after auth completes
  let next = searchParams.get("next") ?? "/app/cloud";
  if (!next.startsWith("/")) next = "/app/cloud";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // This forwarded-host handling is from Supabase docs for Next.js callback routes. :contentReference[oaicite:4]{index=4}
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) return NextResponse.redirect(`${origin}${next}`);
      if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something failed, send them back to sign-in with a hint.
  return NextResponse.redirect(`${origin}/app/auth?error=auth_callback_failed`);
}

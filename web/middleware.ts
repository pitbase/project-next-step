import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabaseProxy";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// This matcher pattern is what Supabase recommends so you don’t run middleware on static assets. :contentReference[oaicite:6]{index=6}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

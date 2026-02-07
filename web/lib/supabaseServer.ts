// web/lib/supabaseServer.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Supabase server client (cookie-based)
 * NOTE: cookies() is async in newer Next.js versions, so we must await it. :contentReference[oaicite:2]{index=2}
 */
export async function createClient() {
  const url = mustEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = mustEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  // cookies() is async in newer Next.js versions
  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Setting cookies can fail during some server render phases.
          // It's safe to ignore here; Supabase handles session refresh elsewhere.
        }
      },
    },
  });
}

// Backwards-compatible alias (if you imported a different name elsewhere)
export const createSupabaseServerClient = createClient;

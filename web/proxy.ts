import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Next.js requires proxy.ts to export ONE function:
// either default export OR a named export called `proxy`. :contentReference[oaicite:2]{index=2}
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

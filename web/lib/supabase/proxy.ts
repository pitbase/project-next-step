// web/proxy.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Next.js expects either a default export OR a named export called `proxy`.
// We use the named export exactly as documented.
export function proxy(_request: NextRequest) {
  // Do nothing for now — let the request continue normally.
  return NextResponse.next();
}

// Optional: If you want this to run only on certain paths, uncomment and edit.
// export const config = {
//   matcher: ["/app/:path*", "/auth/:path*"],
// };

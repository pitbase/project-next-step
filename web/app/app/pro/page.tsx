import { Suspense } from "react";
import ProClient from "./pro-client";

export default function ProPage() {
  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Pro</h1>

      {/* Next.js requires Suspense around the subtree that uses useSearchParams() */}
      <Suspense fallback={<div className="text-sm text-slate-600">Loading…</div>}>
        <ProClient />
      </Suspense>

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/">
        Back home
      </a>
    </main>
  );
}

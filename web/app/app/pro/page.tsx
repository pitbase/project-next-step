import { Suspense } from "react";
import ProClient from "./pro-client";

export default function ProPage() {
  return (
    <Suspense fallback={<main className="min-h-screen p-6 max-w-md mx-auto">Loading…</main>}>
      <ProClient />
    </Suspense>
  );
}

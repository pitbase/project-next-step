"use client";

import { useEffect, useRef, useState } from "react";

export default function SyncDaemon() {
  const [state, setState] = useState<"loaded" | "loading" | "offline">("loaded");
  const lastRun = useRef(0);
  const inFlight = useRef(false);

  useEffect(() => {
    const run = () => {
      const now = Date.now();
      if (inFlight.current) return;

      // ✅ Only allow a sync “status change” once per 60 seconds
      if (now - lastRun.current < 60_000) return;

      lastRun.current = now;
      inFlight.current = true;

      setState("loading");

      // NOTE: put your real sync code here later.
      setTimeout(() => {
        setState(navigator.onLine ? "loaded" : "offline");
        inFlight.current = false;
      }, 400);
    };

    // Run once after load
    const t = setTimeout(run, 300);

    // Run when tab becomes visible again
    const onVis = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVis);

    // Run when internet comes back
    const onOnline = () => run();
    window.addEventListener("online", onOnline);

    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 text-xs">
      <div className="border bg-white rounded-full px-3 py-1 shadow">
        Sync: {state} {state === "loaded" ? "✓" : ""}
      </div>
    </div>
  );
}

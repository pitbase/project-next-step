"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { cloudLoad, cloudSave } from "@/lib/cloud";

export default function CloudPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function doSave() {
    setStatus("Saving…");
    const res = await cloudSave();
    setStatus(res.message);
  }

  async function doLoad() {
    setStatus("Loading…");
    const res = await cloudLoad();
    setStatus(res.message);
    if (res.ok) {
      setTimeout(() => location.assign("/app/brain-dump"), 500);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Cloud Sync</h1>

      {!userEmail ? (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="font-semibold">Coach:</div>
          <div className="text-slate-700">Sign in first.</div>

          <a
            className="block text-center bg-black text-white rounded-xl px-4 py-3 font-semibold"
            href="/app/auth"
          >
            Go to Sign In
          </a>
        </div>
      ) : (
        <div className="border rounded-2xl p-4 space-y-3">
          <div className="text-slate-700">
            Signed in as: <b>{userEmail}</b>
          </div>

          <button
            className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
            onClick={doSave}
          >
            Save my data to cloud
          </button>

          <button
            className="w-full border rounded-xl px-4 py-3 font-semibold"
            onClick={doLoad}
          >
            Load my data from cloud
          </button>

          <div className="text-xs text-slate-500">
            Loading will overwrite what’s currently saved in this browser.
          </div>
        </div>
      )}

      {status ? <div className="text-sm text-slate-600">{status}</div> : null}

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/">
        Back home
      </a>
    </main>
  );
}

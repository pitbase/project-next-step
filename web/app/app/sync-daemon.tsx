"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const TABLE = "pns_user_state";
const LOCAL_KEY = "pns_state_v2";

export default function SyncDaemon() {
  const [msg, setMsg] = useState("");
  const lastSavedRef = useRef<string>("");
  const savingRef = useRef(false);

  // Auto-load once after sign-in
  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      setMsg("Sync: loading…");

      const { data: row, error } = await supabase
        .from(TABLE)
        .select("state")
        .eq("user_id", user.id)
        .single();

      if (!error && row?.state) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(row.state));
        setMsg("Sync: loaded ✔");
        setTimeout(() => location.reload(), 300);
      } else {
        setMsg("Sync: nothing saved yet.");
      }
    };

    run();
  }, []);

  // Auto-save when app writes localStorage
  useEffect(() => {
    let t: any = null;

    const saveNow = async () => {
      if (savingRef.current) return;

      const raw = localStorage.getItem(LOCAL_KEY) || "";
      if (!raw) return;
      if (raw === lastSavedRef.current) return;

      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      savingRef.current = true;
      setMsg("Sync: saving…");

      try {
        const state = JSON.parse(raw);

        const { error } = await supabase.from(TABLE).upsert({
          user_id: user.id,
          state,
          updated_at: new Date().toISOString(),
        });

        if (!error) {
          lastSavedRef.current = raw;
          setMsg("Sync: saved ✔");
        } else {
          setMsg("Sync: save failed");
        }
      } catch {
        setMsg("Sync: save failed");
      } finally {
        savingRef.current = false;
      }
    };

    const bump = () => {
      clearTimeout(t);
      t = setTimeout(saveNow, 700);
    };

    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (key: string, value: string) => {
      origSetItem(key, value);
      if (key === LOCAL_KEY) bump();
    };

    return () => {
      localStorage.setItem = origSetItem;
    };
  }, []);

  if (!msg) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
      <div className="text-xs bg-white border rounded-full px-3 py-1 shadow">
        {msg}
      </div>
    </div>
  );
}

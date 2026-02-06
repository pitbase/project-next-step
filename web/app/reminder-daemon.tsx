"use client";

import { useEffect, useState } from "react";
import {
  ensureDailyRoutineApplied,
  getActiveTasks,
  getPrefs,
  setPrefs,
  touchActiveNow,
  getLastRemindedKey,
  setLastRemindedKey,
} from "@/lib/storage";

function nowHHMM() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function todayKey(hhmm: string) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mo}-${da} ${hhmm}`;
}

function canNotify() {
  return (
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  );
}

function sendNotify(title: string, body: string) {
  try {
    if (!canNotify()) return;
    new Notification(title, { body });
  } catch {
    // ignore
  }
}

export default function ReminderDaemon() {
  const [banner, setBanner] = useState<string>("");

  // Track activity (only while the app is open)
  useEffect(() => {
    // ✅ NEW: auto-add daily routines once per day (no duplicates)
    ensureDailyRoutineApplied();

    const onAct = () => touchActiveNow();
    window.addEventListener("mousemove", onAct);
    window.addEventListener("keydown", onAct);
    window.addEventListener("scroll", onAct);
    window.addEventListener("click", onAct);
    return () => {
      window.removeEventListener("mousemove", onAct);
      window.removeEventListener("keydown", onAct);
      window.removeEventListener("scroll", onAct);
      window.removeEventListener("click", onAct);
    };
  }, []);

  // Main loop: once per minute
  useEffect(() => {
    const tick = () => {
      const prefs = getPrefs();

      // if silenced, do nothing
      if (prefs.silencedUntil && Date.now() < prefs.silencedUntil) return;

      // Idle check: 3 hours
      const idleMs = Date.now() - prefs.lastActiveAt;
      if (idleMs > 3 * 60 * 60 * 1000) {
        setBanner("Hey. You’ve been away a while. Want to do ONE Next Step?");
        if (prefs.notificationsEnabled) {
          sendNotify(
            "Project Next Step",
            "You’ve been away. Come back and do ONE Next Step."
          );
        }
        return;
      }

      // Time reminders: if a task matches current HH:MM
      const hhmm = nowHHMM();
      const key = todayKey(hhmm);
      const lastKey = getLastRemindedKey();
      if (lastKey === key) return; // already reminded this minute

      const tasks = getActiveTasks();
      const due = tasks.find((t) => t.time === hhmm);
      if (due) {
        setLastRemindedKey(key);
        setBanner(`Time: ${hhmm}. Do this now: ${due.text}`);
        if (prefs.notificationsEnabled) {
          sendNotify("Time to do this", `${due.text}`);
        }
      }
    };

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setBanner("Notifications aren’t available in this browser.");
      return;
    }
    const res = await Notification.requestPermission();
    if (res === "granted") {
      setPrefs({ notificationsEnabled: true });
      setBanner("Notifications enabled.");
    } else {
      setPrefs({ notificationsEnabled: false });
      setBanner("Notifications blocked.");
    }
  }

  function silence3h() {
    setPrefs({ silencedUntil: Date.now() + 3 * 60 * 60 * 1000 });
    setBanner("Okay. Silent for 3 hours.");
  }

  if (!banner) return null;

  const prefs = getPrefs();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-xl mx-auto">
      <div className="border bg-white rounded-2xl p-4 shadow space-y-2">
        <div className="font-semibold">Coach:</div>
        <div className="text-slate-700">{banner}</div>

        <div className="flex gap-2 flex-wrap">
          <a
            className="px-4 py-2 rounded-xl bg-black text-white font-semibold"
            href="/app/next"
          >
            Go to Next Step
          </a>

          <button
            className="px-4 py-2 rounded-xl border font-semibold"
            onClick={() => setBanner("")}
          >
            Dismiss
          </button>

          <button
            className="px-4 py-2 rounded-xl border font-semibold"
            onClick={silence3h}
          >
            Silence 3 hours
          </button>

          {!prefs.notificationsEnabled ? (
            <button
              className="px-4 py-2 rounded-xl border font-semibold"
              onClick={enableNotifications}
            >
              Enable notifications
            </button>
          ) : null}
        </div>

        <div className="text-xs text-slate-500">
          Note: reminders work best while the app is open.
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPrefs,
  setPrefs,
  getRoutines,
  setRoutines,
  setQuickTalk,
  type QuickTalkAnswers,
} from "@/lib/storage";

export default function SetupPage() {
  const router = useRouter();

  // Step 1: Quick Talk answers
  const [planningNow, setPlanningNow] = useState("");
  const [annoyingPart, setAnnoyingPart] = useState("");
  const [messUpWhen, setMessUpWhen] = useState("");
  const [magicFix, setMagicFix] = useState("");
  const [payWhy, setPayWhy] = useState("");

  // Step 2: Preferences
  const [coachStyle, setCoachStyle] = useState<"firm" | "gentle">("firm");
  const [mainGoal, setMainGoal] = useState<"stopDistractions" | "nextStep">(
    "stopDistractions"
  );
  const [focusMinutes, setFocusMinutes] = useState<15 | 25>(15);
  const [autoAddDailyRoutines, setAutoAddDailyRoutines] = useState(true);

  // Step 3: Schedule times
  const [morningStart, setMorningStart] = useState("07:00");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [eveningStart, setEveningStart] = useState("18:00");
  const [nightStart, setNightStart] = useState("21:30");

  const [status, setStatus] = useState("");

  useEffect(() => {
    const p = getPrefs();
    const r = getRoutines();

    setCoachStyle(p.coachStyle);
    setMainGoal(p.mainGoal);
    setFocusMinutes(p.defaultFocusMinutes);
    setAutoAddDailyRoutines((p as any).autoAddDailyRoutines ?? true);

    setMorningStart(r.morningStart);
    setWorkStart(r.workStart);
    setWorkEnd(r.workEnd);
    setEveningStart(r.eveningStart);
    setNightStart(r.nightStart);
  }, []);

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setStatus("Notifications aren’t available in this browser.");
      return;
    }
    const res = await Notification.requestPermission();
    if (res === "granted") {
      setPrefs({ notificationsEnabled: true });
      setStatus("Notifications enabled.");
    } else {
      setPrefs({ notificationsEnabled: false });
      setStatus("Notifications blocked.");
    }
  }

  function saveAll() {
    const answers: QuickTalkAnswers = {
      planningNow,
      annoyingPart,
      messUpWhen,
      magicFix,
      payWhy,
    };

    setQuickTalk(answers);

    setPrefs({
      coachStyle,
      mainGoal,
      defaultFocusMinutes: focusMinutes,
      hasOnboarded: true,
      autoAddDailyRoutines,
    } as any);

    setRoutines({
      morningStart,
      workStart,
      workEnd,
      eveningStart,
      nightStart,
    });

    setStatus("Saved. Taking you to Brain Dump…");
    router.push("/app/brain-dump");
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Setup</h1>
      <p className="text-slate-600">
        Answer once. The app will coach you better.
      </p>

      {/* Step 1 */}
      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">1) Quick Talk</div>

        <label className="text-sm font-semibold">
          What do you use to plan your day right now?
        </label>
        <input
          className="w-full border rounded-xl px-4 py-3"
          value={planningNow}
          onChange={(e) => setPlanningNow(e.target.value)}
          placeholder="Example: paper list / Excel / notes app"
        />

        <label className="text-sm font-semibold">What’s the most annoying part?</label>
        <input
          className="w-full border rounded-xl px-4 py-3"
          value={annoyingPart}
          onChange={(e) => setAnnoyingPart(e.target.value)}
          placeholder="Example: don’t know what to do first"
        />

        <label className="text-sm font-semibold">When do you mess up your plan?</label>
        <input
          className="w-full border rounded-xl px-4 py-3"
          value={messUpWhen}
          onChange={(e) => setMessUpWhen(e.target.value)}
          placeholder="Example: distractions / priorities change"
        />

        <label className="text-sm font-semibold">
          If a magic app fixed ONE thing, what would it fix?
        </label>
        <input
          className="w-full border rounded-xl px-4 py-3"
          value={magicFix}
          onChange={(e) => setMagicFix(e.target.value)}
          placeholder="Example: tell me what to do next"
        />

        <label className="text-sm font-semibold">
          Would you pay $5/month if it actually helped? Why?
        </label>
        <input
          className="w-full border rounded-xl px-4 py-3"
          value={payWhy}
          onChange={(e) => setPayWhy(e.target.value)}
          placeholder="Example: yes, if it proves value"
        />
      </div>

      {/* Step 2 */}
      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">2) Preferences</div>

        <label className="text-sm font-semibold">Coach voice</label>
        <select
          className="w-full border rounded-xl px-3 py-3"
          value={coachStyle}
          onChange={(e) => setCoachStyle(e.target.value as any)}
        >
          <option value="firm">Firm and direct</option>
          <option value="gentle">Gentle</option>
        </select>

        <label className="text-sm font-semibold">Main goal</label>
        <select
          className="w-full border rounded-xl px-3 py-3"
          value={mainGoal}
          onChange={(e) => setMainGoal(e.target.value as any)}
        >
          <option value="stopDistractions">Stop distractions</option>
          <option value="nextStep">Next step clarity</option>
        </select>

        <label className="text-sm font-semibold">Default focus time</label>
        <select
          className="w-full border rounded-xl px-3 py-3"
          value={focusMinutes}
          onChange={(e) => setFocusMinutes(Number(e.target.value) as 15 | 25)}
        >
          <option value={15}>15 minutes</option>
          <option value={25}>25 minutes</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoAddDailyRoutines}
            onChange={(e) => setAutoAddDailyRoutines(e.target.checked)}
          />
          <span className="text-slate-700">Auto-add my daily routines once per day</span>
        </label>

        <button
          className="w-full border rounded-xl px-4 py-3 font-semibold"
          onClick={enableNotifications}
        >
          Enable notifications (optional)
        </button>

        <div className="text-xs text-slate-500">
          Notifications need permission the first time.
        </div>
      </div>

      {/* Step 3 */}
      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">3) Schedule times</div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-semibold">Morning start</label>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-3"
              value={morningStart}
              onChange={(e) => setMorningStart(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Work start</label>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-3"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Work end</label>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-3"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Evening start</label>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-3"
              value={eveningStart}
              onChange={(e) => setEveningStart(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Night start</label>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-3"
              value={nightStart}
              onChange={(e) => setNightStart(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        className="w-full bg-black text-white rounded-xl px-4 py-3 font-semibold"
        onClick={saveAll}
      >
        Save setup
      </button>

      {status ? <div className="text-sm text-slate-600">{status}</div> : null}

      <a className="block text-center border rounded-xl px-4 py-3 font-semibold" href="/">
        Back home
      </a>
    </main>
  );
}

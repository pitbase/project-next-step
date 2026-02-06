export type TaskCategory =
  | "work"
  | "home"
  | "morning"
  | "evening"
  | "night"
  | "other";

export type Task = {
  id: string;
  text: string;
  category: TaskCategory;
  time: string | null; // "HH:MM"
  done: boolean;
  deleted: boolean;
  createdAt: number;
  doneAt: number | null;
};

export type RoutineItem = {
  id: string;
  text: string;
  category: TaskCategory;
  time: string | null; // "HH:MM"
  enabled: boolean;
};

export type QuickTalkAnswers = {
  planningNow: string;
  annoyingPart: string;
  messUpWhen: string;
  magicFix: string;
  payWhy: string;
};

export type Preferences = {
  coachStyle: "firm" | "gentle";
  mainGoal: "stopDistractions" | "nextStep";
  defaultFocusMinutes: 15 | 25;
  hasOnboarded: boolean;

  notificationsEnabled: boolean;
  silencedUntil: number | null;
  lastActiveAt: number;

  autoAddDailyRoutines: boolean; // NEW
};

export type Routines = {
  workStart: string; // "HH:MM"
  workEnd: string; // "HH:MM"
  morningStart: string; // "HH:MM"
  eveningStart: string; // "HH:MM"
  nightStart: string; // "HH:MM"
};

type State = {
  tasks: Task[];
  top3Ids: string[];
  queueIds: string[];
  focusEndsAt: number | null;

  blockedDomains: string[];
  shieldOn: boolean;

  prefs: Preferences;
  routines: Routines;
  quickTalk: QuickTalkAnswers | null;

  routineItems: RoutineItem[]; // NEW
  lastRoutineAppliedDate: string | null; // "YYYY-MM-DD" local date // NEW

  lastRemindedKey: string | null;
};

const KEY = "pns_state_v2";

const DEFAULT_BLOCKED = [
  "tiktok.com",
  "youtube.com",
  "instagram.com",
  "facebook.com",
  "x.com",
  "twitter.com",
  "reddit.com",
  "web.whatsapp.com",
];

const DEFAULT_PREFS: Preferences = {
  coachStyle: "firm",
  mainGoal: "stopDistractions",
  defaultFocusMinutes: 15,
  hasOnboarded: false,
  notificationsEnabled: false,
  silencedUntil: null,
  lastActiveAt: Date.now(),
  autoAddDailyRoutines: true, // NEW
};

const DEFAULT_ROUTINES: Routines = {
  workStart: "09:00",
  workEnd: "17:00",
  morningStart: "07:00",
  eveningStart: "18:00",
  nightStart: "21:30",
};

function blank(): State {
  return {
    tasks: [],
    top3Ids: [],
    queueIds: [],
    focusEndsAt: null,
    blockedDomains: DEFAULT_BLOCKED,
    shieldOn: false,
    prefs: DEFAULT_PREFS,
    routines: DEFAULT_ROUTINES,
    quickTalk: null,

    routineItems: [],
    lastRoutineAppliedDate: null,

    lastRemindedKey: null,
  };
}

export function loadState(): State {
  if (typeof window === "undefined") return blank();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw) as Partial<State>;
    const b = blank();

    return {
      ...b,
      ...parsed,
      tasks: parsed.tasks ?? [],
      top3Ids: parsed.top3Ids ?? [],
      queueIds: parsed.queueIds ?? [],
      focusEndsAt: parsed.focusEndsAt ?? null,
      blockedDomains: parsed.blockedDomains ?? DEFAULT_BLOCKED,
      shieldOn: parsed.shieldOn ?? false,
      prefs: { ...DEFAULT_PREFS, ...(parsed.prefs ?? {}) },
      routines: { ...DEFAULT_ROUTINES, ...(parsed.routines ?? {}) },
      quickTalk: parsed.quickTalk ?? null,

      routineItems: parsed.routineItems ?? [],
      lastRoutineAppliedDate: parsed.lastRoutineAppliedDate ?? null,

      lastRemindedKey: parsed.lastRemindedKey ?? null,
    };
  } catch {
    return blank();
  }
}

export function saveState(state: State) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

// -------- helpers --------
function todayLocalYMD(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------- Daily routines ----------------
export function getRoutineItems(): RoutineItem[] {
  return loadState().routineItems;
}

export function addRoutineItem(
  text: string,
  category: TaskCategory,
  time: string | null
) {
  const s = loadState();
  const trimmed = text.trim();
  if (!trimmed) return;

  s.routineItems.unshift({
    id: crypto.randomUUID(),
    text: trimmed,
    category,
    time,
    enabled: true,
  });
  saveState(s);
}

export function toggleRoutineEnabled(id: string) {
  const s = loadState();
  const r = s.routineItems.find((x) => x.id === id);
  if (!r) return;
  r.enabled = !r.enabled;
  saveState(s);
}

export function deleteRoutineItem(id: string) {
  const s = loadState();
  s.routineItems = s.routineItems.filter((x) => x.id !== id);
  saveState(s);
}

// Adds routine tasks ONCE per day, no duplicates.
// Returns true if it added tasks today.
export function ensureDailyRoutineApplied(): boolean {
  const s = loadState();
  if (!s.prefs.autoAddDailyRoutines) return false;

  const today = todayLocalYMD();
  if (s.lastRoutineAppliedDate === today) return false;

  const enabled = s.routineItems.filter((r) => r.enabled);
  if (enabled.length === 0) {
    s.lastRoutineAppliedDate = today;
    saveState(s);
    return false;
  }

  for (const r of enabled) {
    s.tasks.push({
      id: crypto.randomUUID(),
      text: r.text,
      category: r.category,
      time: r.time,
      done: false,
      deleted: false,
      createdAt: Date.now(),
      doneAt: null,
    });
  }

  s.lastRoutineAppliedDate = today;
  saveState(s);
  return true;
}

// Button use: "Add today's routine now"
export function applyDailyRoutineNow(): { added: boolean; reason: string } {
  const s = loadState();
  const today = todayLocalYMD();

  if (s.lastRoutineAppliedDate === today) {
    return { added: false, reason: "Already added today." };
  }

  const enabled = s.routineItems.filter((r) => r.enabled);
  if (enabled.length === 0) {
    s.lastRoutineAppliedDate = today;
    saveState(s);
    return { added: false, reason: "No enabled routine items." };
  }

  for (const r of enabled) {
    s.tasks.push({
      id: crypto.randomUUID(),
      text: r.text,
      category: r.category,
      time: r.time,
      done: false,
      deleted: false,
      createdAt: Date.now(),
      doneAt: null,
    });
  }

  s.lastRoutineAppliedDate = today;
  saveState(s);
  return { added: true, reason: "Added today's routine tasks." };
}

export function getLastRoutineAppliedDate(): string | null {
  return loadState().lastRoutineAppliedDate;
}

// ---------------- Tasks ----------------
export function addTask(
  text: string,
  category: TaskCategory = "other",
  time: string | null = null
) {
  const s = loadState();
  const trimmed = text.trim();
  if (!trimmed) return;

  s.tasks.push({
    id: crypto.randomUUID(),
    text: trimmed,
    category,
    time,
    done: false,
    deleted: false,
    createdAt: Date.now(),
    doneAt: null,
  });

  saveState(s);
}

export function getTasks(): Task[] {
  const s = loadState();
  return s.tasks.filter((t) => !t.deleted);
}

export function getActiveTasks(): Task[] {
  return getTasks().filter((t) => !t.done);
}

export function toggleTaskDone(taskId: string) {
  const s = loadState();
  const t = s.tasks.find((x) => x.id === taskId);
  if (!t || t.deleted) return;

  t.done = !t.done;
  t.doneAt = t.done ? Date.now() : null;

  if (t.done) {
    s.queueIds = s.queueIds.filter((id) => id !== taskId);
    s.top3Ids = s.top3Ids.filter((id) => id !== taskId);
  }

  saveState(s);
}

export function deleteTask(taskId: string) {
  const s = loadState();
  const t = s.tasks.find((x) => x.id === taskId);
  if (!t) return;
  t.deleted = true;

  s.queueIds = s.queueIds.filter((id) => id !== taskId);
  s.top3Ids = s.top3Ids.filter((id) => id !== taskId);

  saveState(s);
}

export function updateTask(
  taskId: string,
  patch: Partial<Pick<Task, "text" | "category" | "time">>
) {
  const s = loadState();
  const t = s.tasks.find((x) => x.id === taskId);
  if (!t || t.deleted) return;

  if (typeof patch.text === "string") t.text = patch.text.trim() || t.text;
  if (typeof patch.category === "string")
    t.category = patch.category as TaskCategory;
  if (patch.time === null || typeof patch.time === "string") t.time = patch.time;

  saveState(s);
}

export function setTop3(ids: string[]) {
  const s = loadState();
  s.top3Ids = ids;
  s.queueIds = [...ids];
  saveState(s);
}

function getNextValidTask(s: State): Task | null {
  while (s.queueIds.length > 0) {
    const nextId = s.queueIds[0];
    const t = s.tasks.find((x) => x.id === nextId);
    if (!t || t.deleted || t.done) {
      s.queueIds.shift();
      continue;
    }
    return t;
  }
  return null;
}

export function getNextTask(): Task | null {
  const s = loadState();
  const t = getNextValidTask(s);
  if (t) saveState(s);
  return t;
}

export function markDone() {
  const s = loadState();
  const t = getNextValidTask(s);
  if (!t) {
    saveState(s);
    return;
  }
  t.done = true;
  t.doneAt = Date.now();

  s.queueIds.shift();
  s.top3Ids = s.top3Ids.filter((id) => id !== t.id);

  saveState(s);
}

export function notNow() {
  const s = loadState();
  const t = getNextValidTask(s);
  if (!t) {
    saveState(s);
    return;
  }
  const first = s.queueIds.shift();
  if (first) s.queueIds.push(first);
  saveState(s);
}

export function replaceNextText(newText: string) {
  const s = loadState();
  const t = getNextValidTask(s);
  if (!t) {
    saveState(s);
    return;
  }
  t.text = newText.trim() || t.text;
  saveState(s);
}

// ---------------- Focus Timer ----------------
export function startFocus(minutes: number) {
  const s = loadState();
  s.focusEndsAt = Date.now() + minutes * 60_000;
  saveState(s);
}

export function clearFocus() {
  const s = loadState();
  s.focusEndsAt = null;
  saveState(s);
}

export function getFocusEndsAt(): number | null {
  return loadState().focusEndsAt;
}

// ---------------- Blocked sites list ----------------
export function getBlockedDomains(): string[] {
  return loadState().blockedDomains;
}

export function setBlockedDomains(domains: string[]) {
  const s = loadState();
  s.blockedDomains = domains;
  saveState(s);
}

export function addBlockedDomain(domain: string) {
  const s = loadState();
  const clean = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");

  if (!clean) return;

  if (!s.blockedDomains.includes(clean)) {
    s.blockedDomains = [clean, ...s.blockedDomains];
    saveState(s);
  }
}

export function removeBlockedDomain(domain: string) {
  const s = loadState();
  s.blockedDomains = s.blockedDomains.filter((d) => d !== domain);
  saveState(s);
}

// ---------------- Shield ON/OFF ----------------
export function isShieldOn(): boolean {
  return loadState().shieldOn;
}

export function setShieldOn(on: boolean) {
  const s = loadState();
  s.shieldOn = on;
  saveState(s);
}

// ---------------- Preferences + routines + quick talk ----------------
export function getPrefs(): Preferences {
  return loadState().prefs;
}

export function setPrefs(patch: Partial<Preferences>) {
  const s = loadState();
  s.prefs = { ...s.prefs, ...patch };
  saveState(s);
}

export function getRoutines(): Routines {
  return loadState().routines;
}

export function setRoutines(patch: Partial<Routines>) {
  const s = loadState();
  s.routines = { ...s.routines, ...patch };
  saveState(s);
}

export function setQuickTalk(answers: QuickTalkAnswers) {
  const s = loadState();
  s.quickTalk = answers;
  saveState(s);
}

export function touchActiveNow() {
  const s = loadState();
  s.prefs.lastActiveAt = Date.now();
  saveState(s);
}

export function getLastRemindedKey(): string | null {
  return loadState().lastRemindedKey;
}

export function setLastRemindedKey(key: string | null) {
  const s = loadState();
  s.lastRemindedKey = key;
  saveState(s);
}

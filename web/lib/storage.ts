export type Task = { id: string; text: string };

type State = {
  tasks: Task[];
  top3Ids: string[];
  queueIds: string[];
  focusEndsAt: number | null;
  blockedDomains: string[];
};

const KEY = "pns_state_v1";

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

function blank(): State {
  return {
    tasks: [],
    top3Ids: [],
    queueIds: [],
    focusEndsAt: null,
    blockedDomains: DEFAULT_BLOCKED,
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
    };
  } catch {
    return blank();
  }
}

export function saveState(state: State) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function addTask(text: string) {
  const s = loadState();
  const trimmed = text.trim();
  if (!trimmed) return;
  s.tasks.push({ id: crypto.randomUUID(), text: trimmed });
  saveState(s);
}

export function setTop3(ids: string[]) {
  const s = loadState();
  s.top3Ids = ids;
  s.queueIds = [...ids];
  saveState(s);
}

export function getNextTask(): Task | null {
  const s = loadState();
  const nextId = s.queueIds[0];
  if (!nextId) return null;
  return s.tasks.find((t) => t.id === nextId) ?? null;
}

export function markDone() {
  const s = loadState();
  s.queueIds.shift();
  saveState(s);
}

export function notNow() {
  const s = loadState();
  const first = s.queueIds.shift();
  if (first) s.queueIds.push(first);
  saveState(s);
}

export function replaceNextText(newText: string) {
  const s = loadState();
  const nextId = s.queueIds[0];
  if (!nextId) return;
  const t = s.tasks.find((x) => x.id === nextId);
  if (!t) return;
  t.text = newText.trim() || t.text;
  saveState(s);
}

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

// Blocked sites list (saved in browser)
export function getBlockedDomains(): string[] {
  return loadState().blockedDomains;
}

export function setBlockedDomains(domains: string[]) {
  const s = loadState();
  s.blockedDomains = domains;
  saveState(s);
}

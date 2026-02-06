const DEFAULT_BLOCKED = [
  "tiktok.com",
  "youtube.com",
  "instagram.com",
  "facebook.com",
  "x.com",
  "twitter.com",
  "reddit.com",
  "web.whatsapp.com"
];

const APP_NEXT_URL = "https://project-next-step.vercel.app/app/next";

function getSync(keys) {
  return new Promise(resolve => chrome.storage.sync.get(keys, resolve));
}

function setSync(obj) {
  return new Promise(resolve => chrome.storage.sync.set(obj, resolve));
}

function toRules(domains) {
  // Rule IDs must be numbers. We'll use 1..N
  return domains.map((domain, i) => ({
    id: i + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { url: APP_NEXT_URL }
    },
    condition: {
      // Domain-style filter recommended by Chrome docs: ||example.com
      urlFilter: `||${domain}`,
      resourceTypes: ["main_frame"]
    }
  }));
}

async function syncRules() {
  const data = await getSync(["shieldOn", "blockedDomains"]);
  const shieldOn = data.shieldOn ?? false;
  const blockedDomains = data.blockedDomains ?? DEFAULT_BLOCKED;

  // Save defaults once if missing
  if (data.blockedDomains == null) await setSync({ blockedDomains });

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);

  const addRules = shieldOn ? toRules(blockedDomains) : [];

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules
  });
}

// Run on install/startup
chrome.runtime.onInstalled.addListener(() => {
  syncRules().catch(() => {});
});
chrome.runtime.onStartup.addListener(() => {
  syncRules().catch(() => {});
});

// Popup asks us to sync after changes
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "SYNC_RULES") {
    syncRules()
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, err: String(err) }));
    return true;
  }
});

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

function cleanDomains(text) {
  return text
    .split("\n")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .map(s => s.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""));
}

function getSync(keys) {
  return new Promise(resolve => chrome.storage.sync.get(keys, resolve));
}

function setSync(obj) {
  return new Promise(resolve => chrome.storage.sync.set(obj, resolve));
}

function sendSyncMessage() {
  return new Promise(resolve => chrome.runtime.sendMessage({ type: "SYNC_RULES" }, resolve));
}

async function loadUI() {
  const data = await getSync(["shieldOn", "blockedDomains"]);
  const shieldOn = data.shieldOn ?? false;
  const blockedDomains = data.blockedDomains ?? DEFAULT_BLOCKED;

  document.getElementById("toggleBtn").textContent = shieldOn ? "Shield is ON (click to turn OFF)" : "Shield is OFF (click to turn ON)";
  document.getElementById("domains").value = blockedDomains.join("\n");
}

async function setStatus(msg) {
  const el = document.getElementById("status");
  el.textContent = msg;
  setTimeout(() => (el.textContent = ""), 2500);
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadUI();

  document.getElementById("toggleBtn").addEventListener("click", async () => {
    const data = await getSync(["shieldOn"]);
    const next = !(data.shieldOn ?? false);
    await setSync({ shieldOn: next });
    await sendSyncMessage();
    await loadUI();
    await setStatus("Updated Shield.");
  });

  document.getElementById("saveBtn").addEventListener("click", async () => {
    const raw = document.getElementById("domains").value;
    const cleaned = cleanDomains(raw);
    await setSync({ blockedDomains: cleaned });
    await sendSyncMessage();
    await loadUI();
    await setStatus("Saved list + updated rules.");
  });

  document.getElementById("openAppBtn").addEventListener("click", async () => {
    chrome.tabs.create({ url: APP_NEXT_URL });
  });
});

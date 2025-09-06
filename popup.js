async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

async function ensureInjected(tabId) {
    try {
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => Boolean(window.__AF_CONTENT_READY__)
        });
        if (result) {
            console.log("Content script already active");
            return true;
        }
    } catch (error) {
        console.log("Could not check injection status:", error);
    }
    
    // Note: Scripts are already injected via manifest.json content_scripts
    // This function now only checks if they're ready
    console.log("Content scripts should be injected via manifest");
    return false;
}

async function sendToTab(type) {
    const tab = await getActiveTab();
    if (!tab?.id) {
        console.log("No active tab found");
        return;
    }
    
    // Check if it's a restricted URL
    if (tab.url && (
        tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('about:') ||
        tab.url === 'chrome://newtab/'
    )) {
        console.log("Cannot run on system pages");
        alert("AutoFill cannot run on browser system pages.\nPlease navigate to a regular website!");
        return;
    }
    
    try {
        await chrome.tabs.sendMessage(tab.id, { type });
    } catch (error) {
        console.log("Message failed:", error);
        
        // Check if content script is loaded
        const isReady = await ensureInjected(tab.id);
        
        if (!isReady) {
            // Content scripts should be auto-injected via manifest
            // If not ready, the page might need a refresh
            alert("AutoFill Scout is not active on this page.\nPlease refresh the page and try again.");
        } else {
            // Script is loaded but not responding - might be context invalidation
            console.error("Content script not responding:", error);
            alert("Connection lost with the page.\nThis can happen after extension updates.\nPlease refresh the page.");
        }
    }
}

const fillBtn = document.getElementById("fill");
const listBtn = document.getElementById("listFields");
const toggle = document.getElementById("autofillToggle");
const openOptions = document.getElementById("openOptions");
const pass = document.getElementById("pass");
const unlock = document.getElementById("unlock");
const lockBtn = document.getElementById("lock");
const status = document.getElementById("status");

chrome.storage.local.get(["af_autoFillEnabled"], ({ af_autoFillEnabled }) => {
    toggle.checked = !!af_autoFillEnabled;
});
toggle.addEventListener("change", async () => {
    await chrome.storage.local.set({ af_autoFillEnabled: toggle.checked });
});

fillBtn.addEventListener("click", () => sendToTab("AF_FILL_NOW"));
listBtn.addEventListener("click", () => sendToTab("AF_LIST_FIELDS"));

openOptions.addEventListener("click", (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });

async function renderStatus() {
    try {
        const s = await chrome.storage.session.get("af_passphrase");
        status.textContent = s.af_passphrase ? "Unlocked for this browser session." : "Locked.";
    } catch { status.textContent = "Session storage unavailable."; }
}
unlock.addEventListener("click", async () => {
    if (!pass.value) { alert("Enter passphrase"); return; }
    try { await chrome.storage.session.set({ af_passphrase: pass.value }); } catch {}
    pass.value = "";
    renderStatus();
});
lockBtn.addEventListener("click", async () => {
    try { await chrome.storage.session.remove("af_passphrase"); } catch {}
    renderStatus();
});
renderStatus();


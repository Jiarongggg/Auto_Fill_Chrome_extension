// Define fields - now includes multi-input field types
const singleFields = [
    // Personal
    "firstName", "middleName", "lastName", "fullName", "preferredName", "maidenName",
    // Contact
    "email", "workEmail", "phone", "altPhone",
    // Demographics
    "birthday", "sex", "nationality",
    // Address
    "address1", "address2", "cityAddress", "stateAddress", "postalCode", "countryAddress",
    // Education (single fields)
    "gpa", "gradYear",
    // Professional (single field)
    "workExperience",
    // Online
    "linkedin", "github", "website",
    // Additional (single fields)
    "skills", "summary"
];

// Multi-input fields
const multiFields = [
    "university", "degree", "major", "employer", "jobTitle", "languages"
];

const $ = (id) => document.getElementById(id);

// ============================================
// Multi-input field management functions
// ============================================
function addField(fieldType) {
    const container = document.getElementById(fieldType + 'Container');
    const wrapper = document.createElement('div');
    wrapper.className = 'multi-input-wrapper';
    
    const input = document.createElement('input');
    input.className = fieldType + '-input';
    input.placeholder = getPlaceholder(fieldType);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '−';
    removeBtn.onclick = function() { wrapper.remove(); };
    
    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    container.appendChild(wrapper);
}

function getPlaceholder(fieldType) {
    const placeholders = {
        'university': 'e.g., Harvard University',
        'degree': 'e.g., Master of Science',
        'major': 'e.g., Data Science',
        'employer': 'e.g., Amazon, Apple',
        'jobTitle': 'e.g., Product Manager',
        'languages': 'e.g., French, German'
    };
    return placeholders[fieldType] || '';
}

// Collect values from multi-input fields
function collectMultiInputValues(fieldType) {
    const inputs = document.querySelectorAll('.' + fieldType + '-input');
    const values = [];
    inputs.forEach(input => {
        if (input.value.trim()) {
            values.push(input.value.trim());
        }
    });
    return values.join(', ');
}

// Populate multi-input fields from saved data
function populateMultiInputFields(fieldType, value) {
    if (!value) return;
    
    const container = document.getElementById(fieldType + 'Container');
    if (!container) return;
    
    const values = value.split(',').map(v => v.trim()).filter(v => v);
    
    // Clear existing inputs except the first one
    const wrappers = container.querySelectorAll('.multi-input-wrapper');
    for (let i = 1; i < wrappers.length; i++) {
        wrappers[i].remove();
    }
    
    // Set first value
    if (values.length > 0) {
        const firstInput = container.querySelector('.' + fieldType + '-input');
        if (firstInput) firstInput.value = values[0];
    }
    
    // Add additional fields for remaining values
    for (let i = 1; i < values.length; i++) {
        addField(fieldType);
        const inputs = container.querySelectorAll('.' + fieldType + '-input');
        inputs[inputs.length - 1].value = values[i];
    }
}

// Make functions globally available for HTML onclick handlers
window.addField = addField;
window.collectMultiInputValues = collectMultiInputValues;
window.populateMultiInputFields = populateMultiInputFields;

// ============================================
// Profile management functions
// ============================================
async function getUserIdentifier() {
    const storage = await chrome.storage.local.get(['currentUserId']);
    return storage.currentUserId || 'default-user';
}

async function getSessionPass() {
    try {
        const s = await chrome.storage.session.get("af_passphrase");
        return s.af_passphrase || "";
    } catch { return ""; }
}

async function load() {
    const local = await chrome.storage.local.get(["af_profile", "af_profile_enc"]);
    const encBundle = local.af_profile_enc;
    const sessionPass = await getSessionPass();

    // UI state
    const encEnabled = !!encBundle;
    $("encEnabled").checked = encEnabled;
    $("encStatus").textContent = encEnabled
        ? (sessionPass ? "🔓 Encrypted (unlocked for this session)" : "🔒 Encrypted (locked; enter passphrase to save/overwrite)")
        : "⚠️ Not encrypted";

    let profile = {};
    if (encBundle && sessionPass) {
        try { profile = await AF_CRYPTO.decryptJSON(encBundle, sessionPass); }
        catch { console.warn("[AutoFill] Wrong session passphrase; cannot prefill options."); }
    } else if (local.af_profile) {
        profile = local.af_profile;
    }

    // Populate single fields
    singleFields.forEach(k => { 
        const el = $(k); 
        if (el && profile[k] !== undefined) {
            el.value = profile[k];
        }
    });
    
    // Populate multi-input fields
    multiFields.forEach(fieldType => {
        if (profile[fieldType]) {
            populateMultiInputFields(fieldType, profile[fieldType]);
        }
    });
}

async function save() {
    const encEnabled = $("encEnabled").checked;
    const pass = $("encPass").value;
    const pass2 = $("encPass2").value;

    const profile = {};
    
    // Collect single fields
    singleFields.forEach(k => {
        const el = $(k);
        if (el) {
            profile[k] = el.value.trim();
        }
    });
    
    // Collect multi-input fields
    multiFields.forEach(fieldType => {
        const value = collectMultiInputValues(fieldType);
        if (value) {
            profile[fieldType] = value;
        }
    });

    if (encEnabled) {
        if (!pass || pass !== pass2) { 
            alert("Passphrases must be non-empty and match."); 
            return; 
        }
        const bundle = await AF_CRYPTO.encryptJSON(profile, pass);
        await chrome.storage.local.set({ af_profile_enc: bundle });
        await chrome.storage.local.remove("af_profile");
        // Cache for this browser session so content.js can decrypt
        try { await chrome.storage.session.set({ af_passphrase: pass }); } catch {}
        alert("✅ Profile saved (encrypted).");
    } else {
        await chrome.storage.local.set({ af_profile: profile });
        await chrome.storage.local.remove("af_profile_enc");
        alert("✅ Profile saved (plaintext).");
    }
    
    // Also update sync status
    await chrome.storage.local.set({
        lastSyncTime: Date.now(),
        lastSyncSource: 'local'
    });
    
    await load();
    updateSyncStatus();
}

async function reset() {
    if (!confirm("⚠️ Clear all stored profile data (both plaintext and encrypted)?")) return;
    await chrome.storage.local.remove(["af_profile", "af_profile_enc"]);
    
    // Clear all single fields
    singleFields.forEach(k => {
        const el = $(k);
        if (el) el.value = "";
    });
    
    // Clear all multi-input fields
    multiFields.forEach(fieldType => {
        const container = $(fieldType + 'Container');
        if (container) {
            // Keep only the first input wrapper and clear its value
            const wrappers = container.querySelectorAll('.multi-input-wrapper');
            for (let i = 1; i < wrappers.length; i++) {
                wrappers[i].remove();
            }
            const firstInput = container.querySelector('.' + fieldType + '-input');
            if (firstInput) firstInput.value = '';
        }
    });
    
    await load();
    alert("✅ All data cleared.");
}

async function fetchFromAWS() {
    const syncMessage = document.getElementById('syncMessage');
    
    try {
        syncMessage.style.display = 'block';
        syncMessage.style.background = '#e3f2fd';
        syncMessage.textContent = '⏳ Fetching from company database...';
        
        // Check if we're in mock mode
        const isMockMode = typeof SERVICE_CONFIG !== 'undefined' && SERVICE_CONFIG.useMockService;
        
        // Fetch from AWS
        const storageService = new StorageService(SERVICE_CONFIG);
        const userId = await getUserIdentifier();
        const remoteProfile = await storageService.loadProfile(userId);
        
        if (remoteProfile && remoteProfile.data) {
            // Populate single fields with AWS data
            for (const [key, value] of Object.entries(remoteProfile.data)) {
                if (singleFields.includes(key)) {
                    const field = document.getElementById(key);
                    if (field && value !== undefined) {
                        field.value = value;
                    }
                } else if (multiFields.includes(key) && value) {
                    // Populate multi-input fields
                    populateMultiInputFields(key, value);
                }
            }
            
            // Update sync status
            await chrome.storage.local.set({
                lastSyncTime: Date.now(),
                lastSyncSource: 'aws'
            });
            
            syncMessage.style.background = '#c8e6c9';
            syncMessage.textContent = isMockMode 
                ? '✅ Successfully fetched from mock database (test mode)'
                : '✅ Successfully fetched from company database';
            updateSyncStatus();
            
            // Auto-save locally
            await save();
        } else {
            syncMessage.style.background = '#fff3cd';
            syncMessage.textContent = '⚠️ No profile found in company database';
        }
    } catch (error) {
        console.error('[AutoFill] Fetch error:', error);
        syncMessage.style.background = '#ffcdd2';
        syncMessage.textContent = '❌ Failed to fetch: ' + error.message;
    }
    
    // Hide message after 3 seconds
    setTimeout(() => {
        syncMessage.style.display = 'none';
    }, 3000);
}

async function pushToAWS() {
    const syncMessage = document.getElementById('syncMessage');
    
    try {
        syncMessage.style.display = 'block';
        syncMessage.style.background = '#e3f2fd';
        syncMessage.textContent = '⏳ Pushing to company database...';
        
        // Collect current form data
        const profile = {};
        
        // Collect single fields
        singleFields.forEach(key => {
            const el = document.getElementById(key);
            if (el) profile[key] = el.value.trim();
        });
        
        // Collect multi-input fields
        multiFields.forEach(fieldType => {
            const value = collectMultiInputValues(fieldType);
            if (value) {
                profile[fieldType] = value;
            }
        });
        
        // Check if we're in mock mode
        const isMockMode = typeof SERVICE_CONFIG !== 'undefined' && SERVICE_CONFIG.useMockService;
        
        // Push to AWS
        const storageService = new StorageService(SERVICE_CONFIG);
        const userId = await getUserIdentifier();
        await storageService.saveProfile(profile, userId);
        
        // Update sync status
        await chrome.storage.local.set({
            lastSyncTime: Date.now(),
            lastSyncSource: 'pushed'
        });
        
        syncMessage.style.background = '#c8e6c9';
        syncMessage.textContent = isMockMode
            ? '✅ Successfully pushed to mock database (test mode)'
            : '✅ Successfully pushed to company database';
        updateSyncStatus();
        
    } catch (error) {
        console.error('[AutoFill] Push error:', error);
        syncMessage.style.background = '#ffcdd2';
        syncMessage.textContent = '❌ Failed to push: ' + error.message;
    }
    
    // Hide message after 3 seconds
    setTimeout(() => {
        syncMessage.style.display = 'none';
    }, 3000);
}

async function updateSyncStatus() {
    const storage = await chrome.storage.local.get(['lastSyncTime', 'lastSyncSource']);
    const statusText = document.getElementById('syncStatusText');
    const timeText = document.getElementById('lastSyncTime');
    
    if (storage.lastSyncTime) {
        const date = new Date(storage.lastSyncTime);
        const source = storage.lastSyncSource === 'aws' ? 'Fetched from AWS' : 
                       storage.lastSyncSource === 'pushed' ? 'Pushed to AWS' : 
                       storage.lastSyncSource === 'local' ? 'Saved locally' : 'Unknown';
        
        statusText.textContent = `✅ ${source}`;
        statusText.style.color = '#4caf50';
        timeText.textContent = `Last update: ${date.toLocaleString()}`;
    } else {
        statusText.textContent = '⚠️ Not synced';
        statusText.style.color = '#ff9800';
        timeText.textContent = '';
    }
}

// ============================================
// Initialize when page loads
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners
    const fetchBtn = document.getElementById('fetchFromAWS');
    const pushBtn = document.getElementById('pushToAWS');
    const autoSyncCheckbox = document.getElementById('autoSync');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');
    
    if (fetchBtn) fetchBtn.addEventListener('click', fetchFromAWS);
    if (pushBtn) pushBtn.addEventListener('click', pushToAWS);
    if (saveBtn) saveBtn.addEventListener('click', save);
    if (resetBtn) resetBtn.addEventListener('click', reset);
    
    if (autoSyncCheckbox) {
        // Load auto-sync preference
        chrome.storage.local.get(['syncWithAWS'], (result) => {
            autoSyncCheckbox.checked = result.syncWithAWS !== false;
        });
        
        // Save auto-sync preference
        autoSyncCheckbox.addEventListener('change', () => {
            chrome.storage.local.set({ syncWithAWS: autoSyncCheckbox.checked });
        });
    }
    
    // Load profile and update sync status
    load();
    updateSyncStatus();
});
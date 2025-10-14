// Load schools data
let schoolsData = [];
let selectedSchools = new Set();

// Load schools from JSON
fetch(chrome.runtime.getURL('schools.json'))
    .then(response => response.json())
    .then(data => {
        schoolsData = data;
        renderSchools(schoolsData);
        loadSavedSettings();
    })
    .catch(error => {
        console.error('Error loading schools:', error);
        showStatus('Failed to load schools data', 'error');
    });

// Render schools list
function renderSchools(schools) {
    const schoolList = document.getElementById('schoolList');
    schoolList.innerHTML = '';
    
    schools.forEach((school) => {
        // Find the original index in the full schoolsData array
        const originalIndex = schoolsData.findIndex(s => s.name === school.name);
        
        const schoolItem = document.createElement('div');
        schoolItem.className = 'school-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `school-${originalIndex}`;
        checkbox.value = originalIndex;
        checkbox.checked = selectedSchools.has(originalIndex);
        
        const label = document.createElement('label');
        label.htmlFor = `school-${originalIndex}`;
        label.textContent = school.name;
        
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedSchools.add(originalIndex);
            } else {
                selectedSchools.delete(originalIndex);
            }
            updateSelectedCount();
        });
        
        schoolItem.appendChild(checkbox);
        schoolItem.appendChild(label);
        schoolList.appendChild(schoolItem);
    });
}

// Search functionality
document.getElementById('schoolSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSchools = schoolsData.filter(school => 
        school.name.toLowerCase().includes(searchTerm) ||
        school.abbreviations.some(abbr => abbr.toLowerCase().includes(searchTerm))
    );
    renderSchools(filteredSchools);
});

// Update selected count
function updateSelectedCount() {
    const count = selectedSchools.size;
    document.getElementById('selectedCount').textContent = `${count} school${count !== 1 ? 's' : ''} selected`;
}

// Handle mode selection
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const testModeSection = document.getElementById('testModeSection');
        const quickTestModeSection = document.getElementById('quickTestModeSection');
        
        if (e.target.value === 'test') {
            testModeSection.style.display = 'block';
            quickTestModeSection.style.display = 'none';
        } else if (e.target.value === 'quicktest') {
            testModeSection.style.display = 'none';
            quickTestModeSection.style.display = 'block';
        } else {
            testModeSection.style.display = 'none';
            quickTestModeSection.style.display = 'none';
        }
    });
});

// Show status message
function showStatus(message, type = 'info') {
    const banner = document.getElementById('statusBanner');
    banner.textContent = message;
    banner.className = `status-banner ${type}`;
    
    if (type !== 'error') {
        setTimeout(() => {
            banner.style.display = 'none';
        }, 5000);
    }
}

// Load saved settings
function loadSavedSettings() {
    chrome.storage.local.get(['instagramUsername', 'selectedSchools', 'botMode', 'botStats'], (result) => {
        if (result.instagramUsername) {
            document.getElementById('instagramUsername').value = result.instagramUsername;
        }
        
        if (result.selectedSchools) {
            selectedSchools = new Set(result.selectedSchools);
            renderSchools(schoolsData);
            updateSelectedCount();
        }
        
        if (result.botMode) {
            const modeRadio = document.querySelector(`input[name="mode"][value="${result.botMode}"]`);
            if (modeRadio) modeRadio.checked = true;
        }
        
        if (result.botStats) {
            updateStats(result.botStats);
        }
    });
    
    // Check if bot is running
    chrome.storage.local.get(['botRunning'], (result) => {
        if (result.botRunning) {
            showBotRunning();
        }
    });
}

// Save settings
function saveSettings() {
    const username = document.getElementById('instagramUsername').value.trim();
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    chrome.storage.local.set({
        instagramUsername: username,
        selectedSchools: Array.from(selectedSchools),
        botMode: mode
    });
}

// Update statistics display
function updateStats(stats) {
    document.getElementById('statsSection').style.display = 'block';
    document.getElementById('profilesVisited').textContent = stats.profilesVisited || 0;
    document.getElementById('followedCount').textContent = stats.followedCount || 0;
    document.getElementById('botStatus').textContent = stats.status || 'Idle';
}

// Start bot
document.getElementById('startBtn').addEventListener('click', async () => {
    const username = document.getElementById('instagramUsername').value.trim();
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    // Validation
    if (!username && mode !== 'test') {
        showStatus('Please enter your Instagram username', 'error');
        return;
    }
    
    if (selectedSchools.size === 0) {
        showStatus('Please select at least one school', 'error');
        return;
    }
    
    // Test mode specific validation
    let testUsername = '';
    let quickTestUsernames = [];
    
    if (mode === 'test') {
        testUsername = document.getElementById('testUsername').value.trim();
        if (!testUsername) {
            showStatus('Please enter a test profile username', 'error');
            return;
        }
    } else if (mode === 'quicktest') {
        const usernamesText = document.getElementById('quickTestUsernames').value.trim();
        if (!usernamesText) {
            showStatus('Please enter usernames to test (one per line)', 'error');
            return;
        }
        // Parse usernames from textarea (one per line)
        quickTestUsernames = usernamesText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                // Remove @ symbol and any URL parts
                return line.replace(/^@/, '').replace(/^https?:\/\/(?:www\.)?instagram\.com\//, '').replace(/\/$/, '');
            });
        
        if (quickTestUsernames.length === 0) {
            showStatus('Please enter at least one username', 'error');
            return;
        }
    }
    
    // Get selected schools data
    const selectedSchoolsData = Array.from(selectedSchools).map(index => schoolsData[index]);
    
    // Save settings
    saveSettings();
    
    // Note: No need to check if on Instagram - bot will navigate there automatically
    
    // Initialize bot stats
    const botStats = {
        profilesVisited: 0,
        followedCount: 0,
        status: 'Starting...'
    };
    
    chrome.storage.local.set({
        botRunning: true,
        botStats: botStats,
        botConfig: {
            username: username,
            mode: mode,
            schools: selectedSchoolsData
        }
    });
    
    // Send message to background script to start bot
    chrome.runtime.sendMessage({
        action: 'startBot',
        config: {
            username: username,
            mode: mode,
            schools: selectedSchoolsData,
            testUsername: testUsername || null,
            quickTestUsernames: quickTestUsernames.length > 0 ? quickTestUsernames : null
        }
    }, (response) => {
        if (response && response.success) {
            showStatus('Bot started successfully!', 'success');
            showBotRunning();
        } else {
            showStatus(response?.error || 'Failed to start bot', 'error');
            chrome.storage.local.set({ botRunning: false });
        }
    });
});

// Stop bot
document.getElementById('stopBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopBot' }, (response) => {
        if (response && response.success) {
            showStatus('Bot stopped', 'info');
            showBotStopped();
            chrome.storage.local.set({ botRunning: false });
        }
    });
});

// Enable screen sharing button
document.getElementById('enableSharingBtn').addEventListener('click', async () => {
    console.log('User clicked Enable Screen Sharing button');
    
    showStatus('Opening screen sharing tab...', 'info');
    
    try {
        // Open dedicated screen sharing page in a new tab
        const screenShareTab = await chrome.tabs.create({
            url: chrome.runtime.getURL('screen-share.html'),
            active: true  // Focus on the new tab
        });
        
        console.log('✅ Screen sharing tab opened:', screenShareTab.id);
        
        // Store the tab ID
        chrome.storage.local.set({ screenShareTabId: screenShareTab.id });
        
        showStatus('Screen sharing tab opened! Click the button there to start.', 'success');
        
        // Update UI to show tab is open
        document.getElementById('enableSharingBtn').textContent = '🎥 Screen Sharing Tab Open';
        document.getElementById('enableSharingBtn').disabled = true;
        document.getElementById('enableSharingBtn').style.opacity = '0.7';
        
    } catch (error) {
        console.error('❌ Error opening screen sharing tab:', error);
        showStatus('Could not open screen sharing tab.', 'error');
    }
});

// Show bot running state
function showBotRunning() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'block';
    document.getElementById('instagramUsername').disabled = true;
    document.getElementById('schoolSearch').disabled = true;
    document.querySelectorAll('input[name="mode"]').forEach(radio => radio.disabled = true);
    document.querySelectorAll('.school-item input[type="checkbox"]').forEach(cb => cb.disabled = true);
}

// Show bot stopped state  
function showBotStopped() {
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('instagramUsername').disabled = false;
    document.getElementById('schoolSearch').disabled = false;
    document.querySelectorAll('input[name="mode"]').forEach(radio => radio.disabled = false);
    document.querySelectorAll('.school-item input[type="checkbox"]').forEach(cb => cb.disabled = false);
}

// Listen for stats updates and screen sharing events
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateStats') {
        updateStats(request.stats);
    } else if (request.action === 'botStopped') {
        showBotStopped();
        showStatus(request.reason || 'Bot stopped', 'info');
    } else if (request.action === 'botError') {
        showBotStopped();
        showStatus(request.error || 'Bot encountered an error', 'error');
        chrome.storage.local.set({ botRunning: false });
    } else if (request.action === 'showSharingButton') {
        // Store tabId for screen sharing
        chrome.storage.local.set({ botTabId: request.tabId });
        
        // Make button more prominent now that bot window is open
        const shareSection = document.getElementById('shareBtnSection');
        const shareBox = shareSection.querySelector('div');
        shareBox.style.background = '#fff3cd';
        shareBox.style.borderColor = '#ffc107';
        shareBox.querySelector('strong').style.color = '#856404';
        shareBox.querySelector('p').style.color = '#856404';
        shareBox.style.animation = 'pulse 2s infinite';
        
        showStatus('Bot window created! Click "Enable Screen Sharing" for best performance.', 'info');
    } else if (request.action === 'screenSharingEnabled') {
        // Screen sharing was successfully started
        console.log('✅ Screen sharing enabled:', request.surface, request.resolution);
        
        showStatus(`✅ Screen sharing active! (${request.surface} at ${request.resolution})`, 'success');
        
        // Show success status
        document.getElementById('sharingStatus').style.display = 'block';
        document.getElementById('sharingStatus').innerHTML = `
            <span style="color: #155724; font-size: 12px;">
                ✅ Screen sharing active! Bot will scroll perfectly. Keep the sharing tab open!
            </span>
        `;
        
        // Update info box
        const infoBox = document.getElementById('shareInfoBox');
        infoBox.style.background = '#d4edda';
        infoBox.style.borderColor = '#c3e6cb';
        infoBox.style.animation = 'none';
        infoBox.innerHTML = `
            <strong style="color: #155724; font-size: 14px;">✅ Sharing Active</strong>
            <p style="color: #155724; margin: 6px 0 0 0; font-size: 12px; line-height: 1.4;">
                Stream is active in the Screen Sharing tab.<br>
                Keep that tab open to maintain sharing!
            </p>
        `;
    } else if (request.action === 'screenSharingStopped') {
        // Screen sharing stopped
        console.log('⚠️ Screen sharing stopped');
        
        showStatus('⚠️ Screen sharing stopped. Click button to restart.', 'error');
        
        // Reset button
        document.getElementById('enableSharingBtn').textContent = '🎥 Enable Screen Sharing';
        document.getElementById('enableSharingBtn').disabled = false;
        document.getElementById('enableSharingBtn').style.opacity = '1';
        document.getElementById('sharingStatus').style.display = 'none';
        
        // Reset info box
        const infoBox = document.getElementById('shareInfoBox');
        infoBox.style.background = '#fff3cd';
        infoBox.style.borderColor = '#ffc107';
        infoBox.style.animation = 'pulse 2s infinite';
        infoBox.innerHTML = `
            <strong style="color: #856404; font-size: 14px;">🎥 Screen Sharing (Highly Recommended!)</strong>
            <p style="color: #856404; margin: 6px 0 0 0; font-size: 12px; line-height: 1.4;">
                <strong>How it works:</strong> Opens a dedicated tab. Click the button there to start sharing. Keep that tab open!
            </p>
        `;
    }
});


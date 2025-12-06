// Background script for bot logic and flow control
console.log('Instagram Follower Bot - Background Script Loaded');

// Import native messaging handler
importScripts('native_messaging.js');

// Initialize native messaging
console.log('🔌 Initializing native messaging...');
if (typeof nativeMessaging !== 'undefined') {
    console.log('✅ Native messaging module loaded');
} else {
    console.error('❌ Native messaging module not loaded');
}

let botState = {
    running: false,
    paused: false,
    config: null,
    stats: {
        profilesVisited: 0,
        followedCount: 0,
        status: 'Idle'
    },
    followCount: 0,
    lastFollowTime: null,
    processingQueue: [],
    offscreenDocumentCreated: false,
    botWindowId: null,
    tabId: null,
    mediaStream: null
};

// Create offscreen document for background operations
async function createOffscreenDocument() {
    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    
    if (existingContexts.length > 0) {
        console.log('✓ Offscreen document already exists');
        botState.offscreenDocumentCreated = true;
        return;
    }
    
    // Create new offscreen document
    try {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['DOM_SCRAPING'],
            justification: 'Keep background tab active for Instagram scrolling and automation'
        });
        botState.offscreenDocumentCreated = true;
        console.log('✓ Offscreen document created successfully');
        console.log('✓ Background tab operations enabled!');
    } catch (error) {
        console.error('Failed to create offscreen document:', error);
        throw error;
    }
}

// Close offscreen document when done
async function closeOffscreenDocument() {
    if (!botState.offscreenDocumentCreated) {
        return;
    }
    
    try {
        await chrome.offscreen.closeDocument();
        botState.offscreenDocumentCreated = false;
        console.log('✓ Offscreen document closed');
    } catch (error) {
        console.log('⚠️ Could not close offscreen document:', error);
    }
}

// Helper function to send message to content script with retry
async function sendToContentScript(tabId, message, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tabId, message, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });
        } catch (error) {
            if (i === retries - 1) {
                throw new Error(`Failed to connect to Instagram page. Please refresh the page and try again.`);
            }
            // Wait before retry
            await wait(1000);
        }
    }
}

// Force execute script in tab (works even in background tabs)
async function forceExecuteInTab(tabId, func) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: func
        });
        return results[0].result;
    } catch (error) {
        console.error('Failed to execute script in tab:', error);
        throw error;
    }
}

// Start tab capture/sharing using getDisplayMedia (works better!)
async function startTabCapture(tabId) {
    try {
        console.log('🎥 Starting tab capture using getDisplayMedia...');
        
        // Inject script to request screen sharing directly in the tab
        const result = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: async () => {
                try {
                    console.log('🎥 Requesting screen share via getDisplayMedia...');
                    
                    // Use getDisplayMedia - this shows Chrome's sharing picker
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            displaySurface: 'browser'  // Prefer browser tab
                        },
                        audio: false,
                        preferCurrentTab: true  // Hint to select current tab
                    });
                    
                    // Store stream globally
                    window.__botMediaStream = stream;
                    
                    const videoTrack = stream.getVideoTracks()[0];
                    const settings = videoTrack.getSettings();
                    
                    console.log('✅ SCREEN SHARING ACTIVE!');
                    console.log(`   Display surface: ${settings.displaySurface}`);
                    console.log(`   Resolution: ${settings.width}x${settings.height}`);
                    console.log('🎉 Chrome will NOT throttle this tab!');
                    console.log('🚀 Perfect scrolling even in background!');
                    
                    return { 
                        success: true, 
                        surface: settings.displaySurface,
                        resolution: `${settings.width}x${settings.height}`
                    };
                    
                } catch (error) {
                    console.error('❌ getDisplayMedia failed:', error.message);
                    
                    // Fallback: requestAnimationFrame
                    if (!window.__botAnimationFrame) {
                        function keepAlive() {
                            window.__botAnimationFrame = requestAnimationFrame(keepAlive);
                        }
                        keepAlive();
                        console.log('📺 Using requestAnimationFrame fallback');
                    }
                    
                    return { success: false, error: error.message };
                }
            }
        });
        
        const captureResult = result[0].result;
        
        if (captureResult.success) {
            console.log('✅ Screen sharing started successfully!');
            console.log(`   Surface: ${captureResult.surface}`);
            console.log(`   Resolution: ${captureResult.resolution}`);
            console.log('🎉 Tab will stay fully active!\n');
            return true;
        } else {
            console.log('❌ Screen sharing failed:', captureResult.error);
            console.log('⚠️ Using fallback mode (requestAnimationFrame)\n');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Tab capture error:', error);
        return false;
    }
}

// Stop tab capture when bot stops
async function stopTabCapture(tabId) {
    try {
        console.log('Stopping screen sharing...');
        
        // Stop stream in the tab
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // Stop keep-alive monitors
                if (window.__streamKeepAlive) {
                    clearInterval(window.__streamKeepAlive);
                    window.__streamKeepAlive = null;
                    console.log('✓ Stream keep-alive monitor stopped');
                }
                
                // Stop the media stream
                if (window.__botMediaStream) {
                    window.__botMediaStream.getTracks().forEach(track => {
                        track.stop();
                        console.log('✓ Stopped video track');
                    });
                    window.__botMediaStream = null;
                }
                
                // Remove video element
                const video = document.getElementById('__botVideoKeepAlive');
                if (video) {
                    video.srcObject = null;
                    video.remove();
                    console.log('✓ Video keep-alive element removed');
                }
                
                // Clear flags
                window.__botShouldKeepSharing = false;
                
                // Stop animation frame fallback
                if (window.__botAnimationFrame) {
                    cancelAnimationFrame(window.__botAnimationFrame);
                    window.__botAnimationFrame = null;
                    console.log('✓ Animation frame stopped');
                }
                
                console.log('✅ Screen sharing fully stopped');
            }
        });
        
        console.log('✓ Screen sharing cleanup complete');
    } catch (error) {
        console.log('⚠️ Could not stop tab capture:', error);
    }
}

// BACKGROUND-DRIVEN SCROLLING - Uses tab capture to prevent throttling!
async function scrollModalFromBackground(tabId, modalSelector) {
    console.log('🔄 Starting BACKGROUND-DRIVEN scrolling with tab capture...');
    console.log('🎥 Tab capture active - scrolling works perfectly in background!\n');
    
    let noChangeCount = 0;
    let scrollAttempts = 0;
    const maxAttempts = 200;
    const maxNoChange = 10;
    
    let previousHeight = 0;
    
    while (noChangeCount < maxNoChange && scrollAttempts < maxAttempts) {
        scrollAttempts++;
        
        console.log(`\n🔄 Scroll attempt ${scrollAttempts}/${maxAttempts}...`);
        
        // Execute scroll directly from background script
        // (Works because tab capture prevents throttling!)
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (selector) => {
                const modal = document.querySelector(selector);
                if (!modal) {
                    console.log('❌ Modal not found!');
                    return;
                }
                
                // Find scrollable element - try ALL methods
                let scrollable = null;
                
                // Method 1: div with overflow in style
                scrollable = modal.querySelector('div[style*="overflow"]');
                if (scrollable && scrollable.scrollHeight > scrollable.clientHeight) {
                    console.log('✓ Found scrollable via overflow style');
                } else {
                    // Method 2: Find ANY div that's scrollable
                    const allDivs = modal.querySelectorAll('div');
                    for (const div of allDivs) {
                        if (div.scrollHeight > div.clientHeight && div.clientHeight > 100) {
                            scrollable = div;
                            console.log(`✓ Found scrollable div: scrollHeight=${div.scrollHeight}, clientHeight=${div.clientHeight}`);
                            break;
                        }
                    }
                }
                
                if (!scrollable) {
                    console.log('⚠️ No scrollable found, using modal');
                    scrollable = modal;
                }
                
                const beforeHeight = scrollable.scrollHeight;
                const beforePos = scrollable.scrollTop;
                const beforeClient = scrollable.clientHeight;
                
                console.log(`📏 BEFORE: height=${beforeHeight}, pos=${beforePos}, client=${beforeClient}, maxScroll=${beforeHeight - beforeClient}`);
                
                // FORCE SCROLL TO ABSOLUTE BOTTOM - Try everything!
                const maxScrollPos = scrollable.scrollHeight - scrollable.clientHeight;
                
                // Method 1: Set scrollTop to max calculated position
                scrollable.scrollTop = maxScrollPos;
                
                // Method 2: scrollBy huge amount
                scrollable.scrollBy(0, 999999999);
                
                // Method 3: Set to scrollHeight directly
                scrollable.scrollTop = scrollable.scrollHeight;
                
                // Method 4: Set to ridiculous number
                scrollable.scrollTop = 999999999;
                
                // Method 5: Use scrollTo
                scrollable.scrollTo(0, scrollable.scrollHeight);
                scrollable.scrollTo(0, 999999999);
                
                // Method 6: scrollIntoView on EVERY element near bottom
                const links = scrollable.querySelectorAll('a');
                const linkCount = links.length;
                
                if (linkCount > 0) {
                    // Scroll last 10 links into view
                    const startIdx = Math.max(0, linkCount - 10);
                    for (let i = linkCount - 1; i >= startIdx; i--) {
                        links[i].scrollIntoView({ behavior: 'auto', block: 'end' });
                    }
                }
                
                // Method 7: Force scroll one more time after scrollIntoView
                scrollable.scrollTop = scrollable.scrollHeight;
                scrollable.scrollBy(0, 999999);
                
                // Trigger scroll events MULTIPLE times
                for (let i = 0; i < 5; i++) {
                    scrollable.dispatchEvent(new Event('scroll', { bubbles: true }));
                }
                
                // Final position check
                const afterPos = scrollable.scrollTop;
                const afterHeight = scrollable.scrollHeight;
                const atBottom = afterPos >= (maxScrollPos - 10);
                
                console.log(`📏 AFTER: height=${afterHeight}, pos=${afterPos}, links=${linkCount}, atBottom=${atBottom}`);
            },
            args: [modalSelector]
        });
        
        console.log('✓ Scroll executed, waiting for content to load...');
        
        // Wait for Instagram to load more content
        await wait(3000);
        
        // NOW check the height after waiting
        const checkResult = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (selector) => {
                const modal = document.querySelector(selector);
                if (!modal) return { error: 'Modal not found' };
                
                let scrollable = modal.querySelector('div[style*="overflow"]');
                if (!scrollable || scrollable.scrollHeight <= scrollable.clientHeight) {
                    const allDivs = modal.querySelectorAll('div');
                    for (const div of allDivs) {
                        if (div.scrollHeight > div.clientHeight && div.clientHeight > 100) {
                            scrollable = div;
                            break;
                        }
                    }
                }
                if (!scrollable) scrollable = modal;
                
                return {
                    height: scrollable.scrollHeight,
                    position: scrollable.scrollTop,
                    linksFound: scrollable.querySelectorAll('a').length
                };
            },
            args: [modalSelector]
        });
        
        const scrollData = checkResult[0].result;
        
        if (scrollData.error) {
            console.log('❌ Modal not found, stopping scroll');
            break;
        }
        
        const currentHeight = scrollData.height;
        const heightChange = currentHeight - previousHeight;
        
        console.log(`📊 Height: ${previousHeight} → ${currentHeight}px (Δ${heightChange}px) | Links: ${scrollData.linksFound} | Pos: ${scrollData.position}`);
        
        if (heightChange === 0 && scrollAttempts > 1) {
            noChangeCount++;
            console.log(`  ⏸️ No new content loaded (${noChangeCount}/${maxNoChange})`);
        } else {
            noChangeCount = 0;
            if (heightChange > 0) {
                console.log(`  ✅ Loaded ${heightChange}px more content!`);
            }
        }
        
        previousHeight = currentHeight;
    }
    
    console.log(`✅ Background scrolling complete! ${scrollAttempts} attempts, ${noChangeCount} no-changes`);
    return true;
}

// Inject content script if not already injected
async function ensureContentScriptInjected(tabId) {
    try {
        // Try to ping the content script
        await sendToContentScript(tabId, { action: 'ping' }, 1);
        return true;
    } catch (error) {
        // Content script not responding, try to inject it
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            await wait(1000); // Wait for script to initialize
            return true;
        } catch (injectError) {
            console.error('Failed to inject content script:', injectError);
            return false;
        }
    }
}

// Helper function to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to check for and close Instagram sleep mode dialog
async function checkAndCloseSleepModeDialog(tabId) {
    try {
        if (!tabId) return false;
        
        console.log('🌙 Checking for sleep mode dialog...');
        
        const response = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // Look for the sleep mode dialog
                const sleepModeDialog = document.querySelector('div[role="dialog"]');
                if (sleepModeDialog) {
                    const sleepModeText = sleepModeDialog.textContent;
                    if (sleepModeText && sleepModeText.includes("You're in sleep mode")) {
                        console.log('🌙 Sleep mode dialog detected, closing...');
                        
                        // Method 1: Look for the specific OK button structure
                        const okButton = sleepModeDialog.querySelector('div[role="button"][tabindex="0"]');
                        if (okButton && okButton.textContent.trim() === 'OK') {
                            console.log('✅ Found OK button (method 1), clicking...');
                            okButton.click();
                            return true;
                        }
                        
                        // Method 2: Look for any div with role="button" containing "OK"
                        const okButtons = sleepModeDialog.querySelectorAll('div[role="button"]');
                        for (const button of okButtons) {
                            if (button.textContent && button.textContent.trim() === 'OK') {
                                console.log('✅ Found OK button (method 2), clicking...');
                                button.click();
                                return true;
                            }
                        }
                        
                        // Method 3: Look for any clickable element with "OK" text
                        const clickableElements = sleepModeDialog.querySelectorAll('[role="button"], button, [tabindex="0"]');
                        for (const element of clickableElements) {
                            if (element.textContent && element.textContent.trim() === 'OK') {
                                console.log('✅ Found OK button (method 3), clicking...');
                                element.click();
                                return true;
                            }
                        }
                        
                        // Method 4: Look for elements with specific classes that might be the OK button
                        const specificOkButton = sleepModeDialog.querySelector('.x1i10hfl.xjqpnuy.xc5r6h4.xqeqjp1.x1phubyo.xdl72j9.x2lah0s.x3ct3a4.xdj266r.x14z9mp.xat24cr.x1lziwak.x2lwn1j.xeuugli.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x1a2a7pz.x6s0dn4.xjyslct.x1ejq31n.x18oe1m7.x1sy0etr.xstzfhl.x9f619.x1ypdohk.x1f6kntn.xl56j7k.x17ydfre.x2b8uid.xlyipyv.x87ps6o.x14atkfc.x5c86q.x18br7mf.x1i0vuye.xl0gqc1.xr5sc7.xlal1re.x14jxsvd.xt0b8zv.xjbqb8w.xr9e8f9.x1e4oeot.x1ui04y5.x6en5u8.x972fbf.x10w94by.x1qhh985.x14e42zd.xt0psk2.xt7dq6l.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1n2onr6.x1n5bzlp');
                        if (specificOkButton && specificOkButton.textContent && specificOkButton.textContent.trim() === 'OK') {
                            console.log('✅ Found OK button (method 4 - specific classes), clicking...');
                            specificOkButton.click();
                            return true;
                        }
                        
                        // Last resort: try to close by pressing Escape
                        console.log('⚠️ No close button found, trying Escape key...');
                        const escapeEvent = new KeyboardEvent('keydown', {
                            key: 'Escape',
                            code: 'Escape',
                            keyCode: 27,
                            which: 27,
                            bubbles: true
                        });
                        document.dispatchEvent(escapeEvent);
                        return true;
                    }
                }
                return false;
            }
        });
        
        if (response && response[0] && response[0].result) {
            console.log('✅ Sleep mode dialog closed successfully');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error checking for sleep mode dialog:', error);
        return false;
    }
}

// Update stats and notify popup
function updateStats(updates) {
    botState.stats = { ...botState.stats, ...updates };
    
    // Save to storage
    chrome.storage.local.set({ botStats: botState.stats });
    
    // Notify popup
    chrome.runtime.sendMessage({
        action: 'updateStats',
        stats: botState.stats
    }).catch(() => {
        // Popup might be closed, ignore error
    });
}

// Stop bot
async function stopBot(reason = 'Bot stopped') {
    botState.running = false;
    botState.paused = false;
    
    chrome.storage.local.set({ botRunning: false });
    
    updateStats({ status: 'Stopped' });
    
    // Notify native host that bot stopped
    if (nativeMessaging.isAvailable()) {
        console.log('📡 Notifying native host: bot stopped');
        nativeMessaging.stopBot();
    }
    
    // Stop tab capture (screen sharing mechanism)
    if (botState.tabId) {
        console.log('Stopping tab capture...');
        await stopTabCapture(botState.tabId);
    }
    
    // Clean up keep-alive mechanism
    if (botState.tabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: botState.tabId },
                func: () => {
                    if (window.__botKeepAlive) {
                        clearInterval(window.__botKeepAlive);
                        window.__botKeepAlive = null;
                        console.log('✓ Keep-alive mechanism stopped');
                    }
                }
            });
        } catch (error) {
            console.log('⚠️ Could not clean up keep-alive:', error);
        }
    }
    
    // Close offscreen document
    console.log('Closing Offscreen API document...');
    await closeOffscreenDocument();
    
    // Close bot window if it exists
    if (botState.botWindowId) {
        try {
            console.log('Closing bot window...');
            await chrome.windows.remove(botState.botWindowId);
            botState.botWindowId = null;
            console.log('✓ Bot window closed');
        } catch (error) {
            console.log('⚠️ Could not close bot window (may already be closed):', error);
        }
    }
    
    // Notify popup
    chrome.runtime.sendMessage({
        action: 'botStopped',
        reason: reason
    }).catch(() => {});
}

// Handle bot error
function handleBotError(error) {
    console.error('Bot error:', error);
    stopBot('Error: ' + error);
    
    chrome.runtime.sendMessage({
        action: 'botError',
        error: error
    }).catch(() => {});
}

// Navigate to URL
async function navigateToUrl(tabId, url) {
    return new Promise((resolve) => {
        chrome.tabs.update(tabId, { url: url }, () => {
            // Wait for page to load
            chrome.tabs.onUpdated.addListener(function listener(updatedTabId, info) {
                if (updatedTabId === tabId && info.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    setTimeout(() => resolve(), 2000);
                }
            });
        });
    });
}

// Process a single profile without school filter (follow everyone)
async function processProfileNoFilter(tabId, username) {
    try {
        // Check for and close sleep mode dialog BEFORE processing
        await checkAndCloseSleepModeDialog(tabId);
        await wait(1000); // Give it a moment to close
        
        // Check for daily limit BEFORE processing
        try {
            console.log('Checking for daily limit before processing profile...');
            const limitCheckBefore = await sendToContentScript(tabId, {
                action: 'checkForDailyLimit'
            });
            
            if (limitCheckBefore && limitCheckBefore.limitReached === true) {
                console.log('⚠️ Daily limit already reached, stopping before processing');
                throw new Error('Daily limit reached');
            }
        } catch (error) {
            // If it's a daily limit error, throw it
            if (error.message.includes('Daily limit')) {
                throw error;
            }
            // Otherwise log and continue (check will happen after follow attempt)
            console.log('⚠️ Daily limit check failed, continuing (will check after follow):', error.message);
        }
        
        // Navigate to profile
        await navigateToUrl(tabId, `https://www.instagram.com/${username}/`);
        await wait(3000);
        
        // Follow profile without school check
        const response = await sendToContentScript(tabId, {
            action: 'followProfileNoFilter'
        });
        
        if (response.shouldStop) {
            throw new Error(response.error || 'Bot should stop due to comprehensive check failure');
        }
        
        if (response.success && response.followed) {
            botState.followCount++;
            updateStats({
                followedCount: botState.stats.followedCount + 1,
                status: `✅ Followed @${username}! (${botState.stats.followedCount + 1} total)`
            });
            
            botState.lastFollowTime = Date.now();
            
            // Check if we need to take a break after 5 follows
            if (botState.followCount >= 5) {
                botState.followCount = 0;
                console.log('Taking 60 minute break after 5 follows');
                
                // 60 minute countdown
                const breakMinutes = 60;
                for (let i = breakMinutes; i > 0; i--) {
                    updateStats({ 
                        status: `⏸️ 60-minute break: ${i} minutes remaining...` 
                    });
                    await wait(60 * 1000); // Wait 1 minute
                }
                
                updateStats({ status: '✓ Break complete! Resuming...' });
                await wait(2000);
            }
        } else if (response.success && !response.followed) {
            // Not followed - show reason
            updateStats({
                status: `⏭️ Skipped @${username} (${response.reason || 'already following'})`
            });
        } else if (!response.success && response.rateLimit) {
            // Rate limit detected - take 3 hour break then continue
            console.log('\n⏱️  RATE LIMIT DETECTED (Try Again Later)');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Taking a 3-hour break as requested by Instagram...');
            console.log('Bot will automatically resume after the break.');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            const breakMinutes = 180; // 3 hours
            const resumeTime = new Date(Date.now() + (breakMinutes * 60 * 1000));
            console.log(`Will resume at: ${resumeTime.toLocaleString()}`);
            
            // 3 hour countdown (update every minute)
            for (let i = breakMinutes; i > 0; i--) {
                const hours = Math.floor(i / 60);
                const mins = i % 60;
                updateStats({ 
                    status: `⏱️ Rate limit - break: ${hours}h ${mins}m remaining...` 
                });
                await wait(60 * 1000); // Wait 1 minute
            }
            
            console.log('\n✓ 3-hour break complete! Resuming bot...\n');
            updateStats({ 
                status: '✓ Rate limit break complete - resuming...' 
            });
            await wait(2000);
            
            // Don't throw error - just continue processing
            return;
        } else if (!response.success && response.dailyLimit) {
            // Daily limit - stop completely
            throw new Error('Instagram daily follow limit reached');
        }
        
        // Wait 15 seconds before next profile with countdown
        console.log('Waiting 15 seconds before next profile...');
        for (let i = 15; i > 0; i--) {
            updateStats({ 
                status: `⏳ Waiting ${i}s before next profile...`,
                profilesVisited: botState.stats.profilesVisited,
                followedCount: botState.stats.followedCount
            });
            await wait(1000); // Wait 1 second
        }
        
        return response;
    } catch (error) {
        console.error('Error processing profile:', error);
        throw error;
    }
}

// Process a single profile
async function processProfile(tabId, username, schools) {
    try {
        // Check for and close sleep mode dialog BEFORE processing
        await checkAndCloseSleepModeDialog(tabId);
        await wait(1000); // Give it a moment to close
        
        // Check for daily limit BEFORE processing
        try {
            console.log('Checking for daily limit before processing profile...');
            const limitCheckBefore = await sendToContentScript(tabId, {
                action: 'checkForDailyLimit'
            });
            
            if (limitCheckBefore && limitCheckBefore.limitReached === true) {
                console.log('⚠️ Daily limit already reached, stopping before processing');
                throw new Error('Daily limit reached');
            }
        } catch (error) {
            // If it's a daily limit error, throw it
            if (error.message.includes('Daily limit')) {
                throw error;
            }
            // Otherwise log and continue (check will happen after follow attempt)
            console.log('⚠️ Daily limit check failed, continuing (will check after follow):', error.message);
        }
        
        // Don't update stats here - will be updated with more context from calling function
        
        // Navigate to profile
        await navigateToUrl(tabId, `https://www.instagram.com/${username}/`);
        await wait(3000);
        
        // Check profile and follow if matches
        const response = await sendToContentScript(tabId, {
            action: 'checkProfileAndFollow',
            schools: schools
        });
        
        if (response.shouldStop) {
            throw new Error(response.error || 'Bot should stop due to comprehensive check failure');
        }
        
        if (response.success && response.followed) {
            botState.followCount++;
            updateStats({
                followedCount: botState.stats.followedCount + 1,
                status: `✅ Followed @${username}! (${botState.stats.followedCount + 1} total)`
            });
            
            botState.lastFollowTime = Date.now();
            
            // Check if we need to take a break after 5 follows
            if (botState.followCount >= 5) {
                botState.followCount = 0;
                console.log('Taking 60 minute break after 5 follows');
                
                // 60 minute countdown
                const breakMinutes = 60;
                for (let i = breakMinutes; i > 0; i--) {
                    updateStats({ 
                        status: `⏸️ 60-minute break: ${i} minutes remaining...` 
                    });
                    await wait(60 * 1000); // Wait 1 minute
                }
                
                updateStats({ status: '✓ Break complete! Resuming...' });
                await wait(2000);
            }
        } else if (response.success && !response.followed) {
            // Not followed - show reason
            updateStats({
                status: `⏭️ Skipped @${username} (${response.reason || 'already following'})`
            });
            
            // If no school match, wait only 5 seconds (faster skip)
            if (response.reason === 'No school match') {
                console.log('⏩ No school match - quick skip (5 second wait)');
                for (let i = 5; i > 0; i--) {
                    updateStats({ 
                        status: `⏩ No match - waiting ${i}s before next profile...`,
                        profilesVisited: botState.stats.profilesVisited,
                        followedCount: botState.stats.followedCount
                    });
                    await wait(1000);
                }
                return response; // Return early, skip the 15-second wait below
            }
        } else if (!response.success && response.rateLimit) {
            // Rate limit detected - take 3 hour break then continue
            console.log('\n⏱️  RATE LIMIT DETECTED (Try Again Later)');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Taking a 3-hour break as requested by Instagram...');
            console.log('Bot will automatically resume after the break.');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            const breakMinutes = 180; // 3 hours
            const resumeTime = new Date(Date.now() + (breakMinutes * 60 * 1000));
            console.log(`Will resume at: ${resumeTime.toLocaleString()}`);
            
            // 3 hour countdown (update every minute)
            for (let i = breakMinutes; i > 0; i--) {
                const hours = Math.floor(i / 60);
                const mins = i % 60;
                updateStats({ 
                    status: `⏱️ Rate limit - break: ${hours}h ${mins}m remaining...` 
                });
                await wait(60 * 1000); // Wait 1 minute
            }
            
            console.log('\n✓ 3-hour break complete! Resuming bot...\n');
            updateStats({ 
                status: '✓ Rate limit break complete - resuming...' 
            });
            await wait(2000);
            
            // Don't throw error - just continue processing
            return;
        } else if (!response.success && response.dailyLimit) {
            // Daily limit - stop completely
            throw new Error('Instagram daily follow limit reached');
        }
        
        // Wait 15 seconds before next profile with countdown
        console.log('Waiting 15 seconds before next profile...');
        for (let i = 15; i > 0; i--) {
            updateStats({ 
                status: `⏳ Waiting ${i}s before next profile...`,
                profilesVisited: botState.stats.profilesVisited,
                followedCount: botState.stats.followedCount
            });
            await wait(1000); // Wait 1 second
        }
        
        return response;
    } catch (error) {
        console.error('Error processing profile:', error);
        throw error;
    }
}

// Mode 1: Following -> Followers
async function runMode1(tabId, username, schools) {
    try {
        // Check for daily limit at the very start (non-blocking)
        try {
            console.log('Checking for daily limit before starting Mode 1...');
            const initialCheck = await sendToContentScript(tabId, {
                action: 'checkForDailyLimit'
            });
            
            if (initialCheck && initialCheck.limitReached === true) {
                console.log('⚠️ Daily limit already reached, cannot start Mode 1');
                throw new Error('Daily limit already reached. Please wait 24 hours.');
            }
        } catch (error) {
            if (error.message.includes('Daily limit')) {
                throw error;
            }
            console.log('⚠️ Initial Mode 1 limit check failed, continuing:', error.message);
        }
        
        updateStats({ status: `📍 Navigating to your profile (@${username})...` });
        
        // Navigate to user's profile
        await navigateToUrl(tabId, `https://www.instagram.com/${username}/`);
        await wait(3000);
        
        // Get following list (scroll to end ONCE using background-driven scrolling)
        updateStats({ status: '📜 Opening following modal...' });
        console.log('Requesting content script to open following modal...');
        
        const modalResponse = await sendToContentScript(tabId, {
            action: 'getFollowingList'
        });
        
        console.log('Modal response:', modalResponse);
        
        if (modalResponse.shouldStop) {
            throw new Error(modalResponse.error || 'Bot should stop due to comprehensive check failure');
        }
        
        if (!modalResponse.success || !modalResponse.modalReady) {
            throw new Error('Failed to open following modal');
        }
        
        // NOW USE BACKGROUND-DRIVEN SCROLLING
        updateStats({ status: '📜 Scrolling following list (tab will flash - you can switch back)...' });
        console.log('\n🚀 Starting BACKGROUND-DRIVEN scrolling...');
        console.log('💡 Instagram tab will briefly activate for each scroll, then you can switch back');
        await scrollModalFromBackground(tabId, 'div[role="dialog"]');
        
        // Extract usernames after scrolling
        console.log('Extracting usernames after background scrolling...');
        const extractResponse = await sendToContentScript(tabId, {
            action: 'extractFollowingUsernames'
        });
        
        console.log('📊 Extract response:', extractResponse);
        
        if (!extractResponse.success) {
            console.error('❌ Extraction failed:', extractResponse.error);
            throw new Error('Failed to extract following list: ' + (extractResponse.error || 'Unknown error'));
        }
        
        if (!extractResponse.usernames) {
            console.error('❌ No usernames in response');
            throw new Error('No usernames returned from extraction');
        }
        
        if (extractResponse.usernames.length === 0) {
            console.error('❌ Empty usernames array - check console for extraction debug info');
            throw new Error('Following list is empty - this might mean all users were filtered out or extraction failed');
        }
        
        const followingList = extractResponse.usernames;
        console.log(`✅ Successfully collected ${followingList.length} users from following list`);
        console.log('First 10 usernames:', followingList.slice(0, 10));
        
        updateStats({ 
            status: `✅ Found ${followingList.length} people you follow. Starting to process their followers...` 
        });
        
        // Wait a moment before starting to process
        await wait(3000);
        
        // For each person they follow, get their followers
        let processedCount = 0;
        for (const followingUsername of followingList) {
            if (!botState.running) {
                console.log('Bot stopped by user');
                return;
            }
            
            // Check for daily limit before processing each person (non-blocking)
            try {
                console.log('Checking for daily limit before processing next person...');
                const limitCheck = await sendToContentScript(tabId, {
                    action: 'checkForDailyLimit'
                });
                
                if (limitCheck && limitCheck.limitReached === true) {
                    console.log('⚠️ Daily limit detected before processing, stopping Mode 1');
                    throw new Error('Daily limit reached');
                }
            } catch (error) {
                if (error.message.includes('Daily limit')) {
                    throw error;
                }
                console.log('⚠️ Limit check failed, continuing:', error.message);
            }
            
            processedCount++;
            console.log(`\n=== Processing ${processedCount}/${followingList.length}: @${followingUsername} ===`);
            updateStats({ 
                status: `📋 [${processedCount}/${followingList.length}] Opening @${followingUsername}'s profile...` 
            });
            
            // Navigate to their profile
            console.log(`Navigating to @${followingUsername}'s profile...`);
            await navigateToUrl(tabId, `https://www.instagram.com/${followingUsername}/`);
            await wait(3000);
            
            // Get their followers (using background-driven scrolling)
            updateStats({ 
                status: `📜 [${processedCount}/${followingList.length}] Opening @${followingUsername}'s followers modal...` 
            });
            console.log(`Opening followers modal for @${followingUsername}...`);
            
            const modalResponse = await sendToContentScript(tabId, {
                action: 'getFollowersList'
            });
            
            if (modalResponse.shouldStop) {
                throw new Error(modalResponse.error || 'Bot should stop due to comprehensive check failure');
            }
            
            if (!modalResponse.success || !modalResponse.modalReady) {
                console.log(`⚠ Failed to open followers modal for @${followingUsername}`);
                continue;
            }
            
            // NOW USE BACKGROUND-DRIVEN SCROLLING
            updateStats({ 
                status: `📜 [${processedCount}/${followingList.length}] Scrolling @${followingUsername}'s followers (YOU CAN SWITCH TABS!)...` 
            });
            console.log(`🚀 Background scrolling followers of @${followingUsername}...`);
            await scrollModalFromBackground(tabId, 'div[role="dialog"]');
            
            // Extract usernames after scrolling
            console.log('Extracting followers usernames...');
            const extractResponse = await sendToContentScript(tabId, {
                action: 'extractFollowersUsernames'
            });
            
            if (!extractResponse.success || !extractResponse.usernames || extractResponse.usernames.length === 0) {
                console.log(`⚠ Failed to extract followers for @${followingUsername} or they have no followers`);
                continue; // Move to next person in following list
            }
            
            const followersList = extractResponse.usernames;
            console.log(`✓ Found ${followersList.length} followers for @${followingUsername}`);
            console.log(`📋 Followers list saved in memory - no need to go back to @${followingUsername}`);
            console.log(`Now processing each follower directly...\n`);
            
            updateStats({ 
                status: `✅ Found ${followersList.length} followers of @${followingUsername}. Checking each...` 
            });
            await wait(2000);
            
            // Process each follower of this person (no navigation back needed!)
            let followerCount = 0;
            for (const followerUsername of followersList) {
                if (!botState.running) {
                    console.log('Bot stopped by user');
                    return;
                }
                
                followerCount++;
                console.log(`  → [${followerCount}/${followersList.length}] Going directly to @${followerUsername}'s profile`);
                console.log(`     (Not going back to @${followingUsername} - we have the full list)`);
                
                // Update status with detailed context
                updateStats({ 
                    status: `👤 Following [${processedCount}/${followingList.length}] | Checking follower [${followerCount}/${followersList.length}] of @${followingUsername}`,
                    profilesVisited: botState.stats.profilesVisited + 1
                });
                
                try {
                    await processProfile(tabId, followerUsername, schools);
                } catch (error) {
                    if (error.message.includes('daily limit')) {
                        throw error;
                    }
                    console.log(`  ✗ Error processing @${followerUsername}:`, error.message);
                    // Continue with next follower
                }
            }
            
            console.log(`\n✓ Finished all ${followersList.length} followers of @${followingUsername}`);
            console.log(`📍 Next: Moving to process followers of the next person you follow\n`);
        }
        
        updateStats({ status: 'Mode 1 completed!' });
        stopBot('Mode 1 completed successfully');
        
    } catch (error) {
        throw error;
    }
}

// Test Mode - Test on a single profile
async function runTestMode(tabId, testUsername, schools) {
    try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       🧪 TEST MODE STARTED            ║');
        console.log('╚════════════════════════════════════════╝\n');
        
        // Check for daily limit before starting (non-blocking)
        try {
            console.log('Checking for daily limit before starting Test Mode...');
            const initialCheck = await sendToContentScript(tabId, {
                action: 'checkForDailyLimit'
            });
            
            if (initialCheck && initialCheck.limitReached === true) {
                console.log('⚠️ Daily limit already reached, cannot test');
                throw new Error('Daily limit already reached. Please wait 24 hours.');
            }
        } catch (error) {
            if (error.message.includes('Daily limit')) {
                throw error;
            }
            console.log('⚠️ Initial Test Mode limit check failed, continuing:', error.message);
        }
        
        updateStats({ status: `Test Mode: Checking @${testUsername}` });
        console.log(`Target profile: @${testUsername}`);
        console.log(`Testing with ${schools.length} school(s):`, schools.map(s => s.name).join(', '));
        console.log('');
        
        // Navigate to test profile
        console.log('📍 Step 1: Navigating to profile...');
        updateStats({ status: `Navigating to @${testUsername}...` });
        await navigateToUrl(tabId, `https://www.instagram.com/${testUsername}/`);
        await wait(3000);
        console.log('✓ Page loaded');
        
        // Get profile information
        console.log('\n📖 Step 2: Reading profile bio and name...');
        updateStats({ status: `Reading @${testUsername}'s profile...` });
        
        const response = await sendToContentScript(tabId, {
            action: 'checkProfileAndFollow',
            schools: schools
        });
        
        if (response.shouldStop) {
            throw new Error(response.error || 'Bot should stop due to comprehensive check failure');
        }
        
        console.log('\n📊 Test Results:');
        console.log('═══════════════════════════════════════');
        
        if (response.success) {
            if (response.followed) {
                console.log('✅ RESULT: Successfully followed!');
                console.log('   → Profile matched school criteria');
                console.log('   → Was not already following');
                console.log('   → Follow button clicked');
                updateStats({
                    status: '✅ Test passed! Profile followed',
                    followedCount: 1,
                    profilesVisited: 1
                });
            } else {
                console.log('ℹ️  RESULT: Did not follow');
                console.log(`   → Reason: ${response.reason || 'Unknown'}`);
                
                if (response.reason === 'No school match') {
                    console.log('   → Profile bio/name does not contain selected school keywords');
                    console.log('   → Try different schools or check the profile manually');
                } else if (response.reason === 'Already following') {
                    console.log('   → You are already following this profile');
                }
                
                updateStats({
                    status: `ℹ️ Test complete: ${response.reason}`,
                    profilesVisited: 1
                });
            }
        } else {
            console.log('❌ RESULT: Error occurred');
            console.log(`   → Error: ${response.error || 'Unknown error'}`);
            
            if (response.error === 'Daily limit reached') {
                console.log('   → Instagram has blocked further follows for today');
                console.log('   → Wait 24 hours before trying again');
            }
            
            updateStats({
                status: `❌ Test failed: ${response.error}`,
                profilesVisited: 1
            });
        }
        
        console.log('═══════════════════════════════════════');
        console.log('\n💡 Test Mode Tips:');
        console.log('   • Check the Instagram tab to see the profile');
        console.log('   • Open Console (F12) on Instagram tab for more details');
        console.log('   • If successful, you can now run Mode 1 or Explore Mode');
        console.log('');
        console.log('╔════════════════════════════════════════╗');
        console.log('║       🧪 TEST MODE COMPLETE           ║');
        console.log('╚════════════════════════════════════════╝\n');
        
        // Stop the bot after test
        await wait(2000);
        stopBot('Test mode completed');
        
    } catch (error) {
        console.error('❌ Test Mode Error:', error);
        throw error;
    }
}

// Quick Test Mode - Test first follower of specified users
async function runQuickTestMode(tabId, usernames, schools) {
    try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║    ⚡ QUICK TEST MODE STARTED         ║');
        console.log('╚════════════════════════════════════════╝\n');
        
        console.log(`Testing ${usernames.length} user(s):`);
        usernames.forEach((u, i) => console.log(`  ${i + 1}. @${u}`));
        console.log(`Selected schools:`, schools.map(s => s.name).join(', '));
        console.log('Will check FIRST follower of each\n');
        
        let processedCount = 0;
        
        for (const targetUsername of usernames) {
            if (!botState.running) {
                console.log('Bot stopped by user');
                return;
            }
            
            processedCount++;
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`Testing [${processedCount}/${usernames.length}]: @${targetUsername}`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            
            updateStats({ 
                status: `⚡ [${processedCount}/${usernames.length}] Opening @${targetUsername}'s profile...` 
            });
            
            // Navigate to their profile
            await navigateToUrl(tabId, `https://www.instagram.com/${targetUsername}/`);
            await wait(3000);
            
            // Get their followers list (using background scrolling)
            updateStats({ 
                status: `⚡ [${processedCount}/${usernames.length}] Opening @${targetUsername}'s followers modal...` 
            });
            
            const modalResponse = await sendToContentScript(tabId, {
                action: 'getFollowersList'
            });
            
            if (modalResponse.shouldStop) {
                throw new Error(modalResponse.error || 'Bot should stop due to comprehensive check failure');
            }
            
            if (!modalResponse.success || !modalResponse.modalReady) {
                console.log(`⚠️ Failed to open followers modal for @${targetUsername}`);
                continue;
            }
            
            // Background-driven scrolling
            updateStats({ 
                status: `⚡ [${processedCount}/${usernames.length}] Scrolling @${targetUsername}'s followers (background mode)...` 
            });
            console.log(`🚀 Background scrolling...`);
            await scrollModalFromBackground(tabId, 'div[role="dialog"]');
            
            // Extract usernames
            const extractResponse = await sendToContentScript(tabId, {
                action: 'extractFollowersUsernames'
            });
            
            if (!extractResponse.success || !extractResponse.usernames || extractResponse.usernames.length === 0) {
                console.log(`⚠️ No followers found for @${targetUsername}`);
                updateStats({ 
                    status: `⚠️ @${targetUsername} has no followers - skipping` 
                });
                await wait(2000);
                continue;
            }
            
            const firstFollower = extractResponse.usernames[0];
            const totalFollowers = extractResponse.usernames.length;
            
            console.log(`✓ Found ${totalFollowers} followers for @${targetUsername}`);
            console.log(`📍 Testing FIRST follower only: @${firstFollower}`);
            
            updateStats({ 
                status: `⚡ [${processedCount}/${usernames.length}] Testing @${targetUsername}'s 1st follower (@${firstFollower})...`,
                profilesVisited: botState.stats.profilesVisited + 1
            });
            
            // Process only the first follower
            try {
                await processProfile(tabId, firstFollower, schools);
                console.log(`✓ Finished testing first follower of @${targetUsername}`);
            } catch (error) {
                if (error.message.includes('daily limit') || error.message.includes('Rate limit')) {
                    throw error;
                }
                console.log(`⚠️ Error processing @${firstFollower}:`, error.message);
            }
        }
        
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║    ⚡ QUICK TEST MODE COMPLETE        ║');
        console.log('╚════════════════════════════════════════╝');
        console.log(`\n✓ Tested ${processedCount} user(s)`);
        console.log('✓ Checked first follower of each');
        console.log('\n💡 Ready for full Mode 1? All systems working!\n');
        
        updateStats({ status: '✅ Quick test complete!' });
        await wait(3000);
        stopBot('Quick test mode completed');
        
    } catch (error) {
        console.error('❌ Quick Test Mode Error:', error);
        throw error;
    }
}

// Explore Mode
async function runExploreMode(tabId, schools) {
    try {
        // Check for daily limit before starting (non-blocking)
        try {
            console.log('Checking for daily limit before starting Explore Mode...');
            const initialCheck = await sendToContentScript(tabId, {
                action: 'checkForDailyLimit'
            });
            
            if (initialCheck && initialCheck.limitReached === true) {
                console.log('⚠️ Daily limit already reached, cannot start Explore Mode');
                throw new Error('Daily limit already reached. Please wait 24 hours.');
            }
        } catch (error) {
            if (error.message.includes('Daily limit')) {
                throw error;
            }
            console.log('⚠️ Initial Explore Mode limit check failed, continuing:', error.message);
        }
        
        updateStats({ status: 'Navigating to Explore People...' });
        
        // Navigate to explore people
        await navigateToUrl(tabId, 'https://www.instagram.com/explore/people/');
        await wait(3000);
        
        let consecutiveErrors = 0;
        const maxConsecutiveErrors = 5;
        
        while (botState.running) {
            // Check for and close sleep mode dialog before each cycle
            await checkAndCloseSleepModeDialog(tabId);
            await wait(1000); // Give it a moment to close
            
            // Check for daily limit before each explore cycle (non-blocking)
            try {
                console.log('Checking for daily limit before exploring more profiles...');
                const limitCheck = await sendToContentScript(tabId, {
                    action: 'checkForDailyLimit'
                });
                
                if (limitCheck && limitCheck.limitReached === true) {
                    console.log('⚠️ Daily limit detected in Explore Mode, stopping');
                    throw new Error('Daily limit reached');
                }
            } catch (error) {
                if (error.message.includes('Daily limit')) {
                    throw error;
                }
                console.log('⚠️ Explore cycle limit check failed, continuing:', error.message);
            }
            
            // Get profiles from explore page
            updateStats({ status: 'Getting explore profiles...' });
            
            const exploreResponse = await sendToContentScript(tabId, {
                action: 'getExplorePeoples'
            });
            
            if (!exploreResponse.success || !exploreResponse.usernames || exploreResponse.usernames.length === 0) {
                console.log('No profiles found on explore page');
                consecutiveErrors++;
                
                if (consecutiveErrors >= maxConsecutiveErrors) {
                    throw new Error('Failed to find profiles multiple times');
                }
                
                // Scroll and try again
                await wait(5000);
                continue;
            }
            
            consecutiveErrors = 0;
            const profiles = exploreResponse.usernames;
            console.log(`Found ${profiles.length} profiles on explore page`);
            
            // Process each profile
            for (const profileUsername of profiles) {
                if (!botState.running) {
                    console.log('Bot stopped by user');
                    return;
                }
                
                try {
                    await processProfile(tabId, profileUsername, schools);
                } catch (error) {
                    if (error.message.includes('daily limit')) {
                        throw error;
                    }
                    console.log(`Error processing @${profileUsername}:`, error);
                    // Continue with next profile
                }
            }
            
            // Scroll down to load more profiles
            await navigateToUrl(tabId, 'https://www.instagram.com/explore/people/');
            await wait(3000);
        }
        
    } catch (error) {
        throw error;
    }
}

// Setup bot in existing or new Instagram tab
async function createBotWindow() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📱 SETTING UP BOT IN TAB                                ║');
    console.log('║                                                           ║');
    console.log('║  The bot will use an Instagram tab (existing or new).    ║');
    console.log('║  No separate window will be created.                      ║');
    console.log('║                                                           ║');
    console.log('║  💡 For best performance:                                 ║');
    console.log('║     Click "Enable Screen Sharing" in the popup!          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Check if there's already an Instagram tab open
    const existingTabs = await chrome.tabs.query({ 
        url: 'https://www.instagram.com/*' 
    });
    
    let tab;
    let windowId;
    
    if (existingTabs.length > 0) {
        // Use the first Instagram tab found
        tab = existingTabs[0];
        windowId = tab.windowId;
        console.log('✓ Found existing Instagram tab, using it');
        
        // Focus on that tab
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(windowId, { focused: true });
        
        // Refresh the tab to ensure clean state
        await chrome.tabs.reload(tab.id);
        
        // Wait for reload to complete
        await new Promise((resolve) => {
            const listener = (tabId, info) => {
                if (tabId === tab.id && info.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        });
    } else {
        // No Instagram tab, create one in current window
        console.log('No Instagram tab found, creating new tab...');
        
        tab = await chrome.tabs.create({
            url: 'https://www.instagram.com/',
            active: true
        });
        
        windowId = tab.windowId;
        
        // Wait for Instagram to load
        await new Promise((resolve) => {
            const listener = (tabId, info) => {
                if (tabId === tab.id && info.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        });
    }
    
    await wait(3000);
    console.log('✓ Bot tab ready and Instagram loaded');
    
    // IMMEDIATELY notify popup to show screen sharing button
    chrome.runtime.sendMessage({
        action: 'showSharingButton',
        tabId: tab.id
    }).catch(() => {
        console.log('(Popup may be closed)');
    });
    
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🎥 SCREEN SHARING RECOMMENDED                            ║');
    console.log('║                                                           ║');
    console.log('║  Click "Enable Screen Sharing" in the popup              ║');
    console.log('║  for perfect background scrolling!                        ║');
    console.log('║                                                           ║');
    console.log('║  This prevents Chrome throttling.                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    
    return { windowId: windowId, tabId: tab.id };
}

// Following Detection Test Mode - Test the "Following" button detection logic
async function runFollowingDetectionTest(tabId, testUsername) {
    try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  🔍 FOLLOWING DETECTION TEST MODE      ║');
        console.log('╚════════════════════════════════════════╝\n');
        
        console.log(`Testing user: @${testUsername}`);
        console.log(`This will open their followers list and show detailed button detection debug info\n`);
        
        updateStats({ status: `🔍 Navigating to @${testUsername}...` });
        
        // Navigate to the test profile
        await navigateToUrl(tabId, `https://www.instagram.com/${testUsername}/`);
        await wait(3000);
        
        // Open followers modal
        updateStats({ status: `📜 Opening followers modal for @${testUsername}...` });
        console.log('Opening followers modal...');
        
        const modalResponse = await sendToContentScript(tabId, {
            action: 'getFollowersList'
        });
        
        if (!modalResponse.success || !modalResponse.modalReady) {
            throw new Error('Failed to open followers modal');
        }
        
        // Scroll to load more followers
        updateStats({ status: `📜 Scrolling followers list (loading profiles for testing)...` });
        console.log('🚀 Background scrolling to load profiles...');
        await scrollModalFromBackground(tabId, 'div[role="dialog"]');
        
        // Extract usernames with DEBUG logging
        updateStats({ status: `🔍 Analyzing followers for "Following" detection...` });
        console.log('🔍 Extracting usernames with full debug info...');
        console.log('📋 Check console for detailed button detection analysis!\n');
        
        const extractResponse = await sendToContentScript(tabId, {
            action: 'extractFollowersUsernames'
        });
        
        if (!extractResponse.success) {
            throw new Error('Failed to extract followers');
        }
        
        const usernames = extractResponse.usernames || [];
        
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  📊 FOLLOWING DETECTION TEST RESULTS   ║');
        console.log('╚════════════════════════════════════════╝\n');
        console.log(`Total profiles found: ${usernames.length}`);
        console.log(`Check the detailed debug output above for button detection info\n`);
        console.log('Look for:');
        console.log('  - 🔍 DEBUG sections showing button text and classes');
        console.log('  - ⏭️ "Skipping" messages for profiles you follow');
        console.log('  - ✅ "Adding" messages for profiles you don\'t follow');
        console.log('  - 📊 EXTRACTION SUMMARY at the end\n');
        
        updateStats({ 
            status: `✅ Test complete! Found ${usernames.length} profiles. Check console for debug details.`,
            profilesVisited: usernames.length
        });
        
        await wait(2000);
        console.log('Test completed. Review the console output above for detection analysis.');
        stopBot('Following detection test completed');
        
    } catch (error) {
        console.error('❌ Following Detection Test Error:', error);
        throw error;
    }
}

// Reels Like Comments Mode - Like all comments on all reels of an account
async function runReelsLikeCommentsMode(tabId, reelsAccount) {
    try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  🎬 REELS LIKE COMMENTS MODE STARTED  ║');
        console.log('╚════════════════════════════════════════╝\n');
        
        console.log(`Target account: @${reelsAccount}`);
        console.log('Mode: Like all comments on all reels\n');
        
        updateStats({ status: `📍 Navigating to @${reelsAccount}'s profile...` });
        
        // Navigate to the account profile
        await navigateToUrl(tabId, `https://www.instagram.com/${reelsAccount}/`);
        await wait(3000);
        
        // Click on Reels tab
        updateStats({ status: `🎬 Clicking Reels tab...` });
        console.log('Clicking Reels tab...');
        const reelsTabResponse = await sendToContentScript(tabId, {
            action: 'clickReelsTab'
        });
        
        if (!reelsTabResponse.success) {
            throw new Error('Failed to click Reels tab: ' + (reelsTabResponse.error || 'Unknown error'));
        }
        
        await wait(3000);
        
        // Get all reel videos from the grid (without scrolling first)
        updateStats({ status: `📹 Getting reel videos...` });
        console.log('Getting reel videos (fetching links first, no scrolling)...');
        
        const reelsResponse = await sendToContentScript(tabId, {
            action: 'getReelVideos'
        });
        
        if (!reelsResponse.success || !reelsResponse.reelIds || reelsResponse.reelIds.length === 0) {
            throw new Error('No reel videos found');
        }
        
        const reelIds = reelsResponse.reelIds;
        console.log(`✅ Found ${reelIds.length} reel videos`);
        updateStats({ status: `✅ Found ${reelIds.length} reels. Processing...` });
        await wait(2000);
        
        // Process each reel
        let processedCount = 0;
        let totalLiked = 0;
        
        for (const reelId of reelIds) {
            if (!botState.running) {
                console.log('Bot stopped by user');
                return;
            }
            
            processedCount++;
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`🎬 Processing reel [${processedCount}/${reelIds.length}]: ${reelId}`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            
            updateStats({ 
                status: `🎬 [${processedCount}/${reelIds.length}] Opening reel ${reelId}...`,
                profilesVisited: processedCount
            });
            
            // Click on the reel video to open it
            const clickResponse = await sendToContentScript(tabId, {
                action: 'clickReelVideo',
                reelId: reelId
            });
            
            if (!clickResponse.success) {
                console.log(`⚠️ Failed to open reel ${reelId}, trying direct navigation...`);
                await navigateToUrl(tabId, `https://www.instagram.com/reel/${reelId}/`);
            }
            
            await wait(5000); // Wait for reel to fully load
            
            // Like all comments (will scroll comments section if no likes detected)
            updateStats({ status: `❤️ [${processedCount}/${reelIds.length}] Liking all comments...` });
            console.log('Liking all comments (will scroll if no likes found)...');
            
            const likeResponse = await sendToContentScript(tabId, {
                action: 'likeAllComments'
            });
            
            if (likeResponse.success) {
                const liked = likeResponse.likedCount || 0;
                const skipped = likeResponse.skippedCount || 0;
                totalLiked += liked;
                console.log(`✅ Liked ${liked} comments, skipped ${skipped} (already liked)`);
                updateStats({ 
                    status: `✅ [${processedCount}/${reelIds.length}] Liked ${liked} comments (${totalLiked} total)`,
                    followedCount: totalLiked
                });
            } else {
                console.log(`⚠️ Error liking comments: ${likeResponse.error}`);
            }
            
            // Close reel viewer and go back to reels grid
            updateStats({ status: `⏭️ [${processedCount}/${reelIds.length}] Moving to next reel...` });
            const closeResponse = await sendToContentScript(tabId, {
                action: 'closeReelViewer'
            });
            
            // Navigate back to reels page
            await navigateToUrl(tabId, `https://www.instagram.com/${reelsAccount}/reels/`);
            await wait(2000);
        }
        
        console.log(`\n✅ Finished processing all ${processedCount} reels`);
        console.log(`Total comments liked: ${totalLiked}`);
        
        updateStats({ 
            status: `✅ Completed! Liked ${totalLiked} comments across ${processedCount} reels`,
            followedCount: totalLiked
        });
        
        await wait(2000);
        stopBot('Reels Like Comments Mode completed successfully');
        
    } catch (error) {
        console.error('❌ Reels Like Comments Mode Error:', error);
        throw error;
    }
}

// PVHS Followers Mode - Follow all followers of a specific PVHS account
async function runPVHSFollowersMode(tabId, pvphsAccount) {
    try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║    🏫 PVHS FOLLOWERS MODE STARTED      ║');
        console.log('╚════════════════════════════════════════╝\n');
        
        // Check for daily limit before starting (non-blocking)
        try {
            console.log('Checking for daily limit before starting PVHS Followers Mode...');
            const initialCheck = await sendToContentScript(tabId, {
                action: 'checkForDailyLimit'
            });
            
            if (initialCheck && initialCheck.limitReached === true) {
                console.log('⚠️ Daily limit already reached, cannot start PVHS Followers Mode');
                throw new Error('Daily limit already reached. Please wait 24 hours.');
            }
        } catch (error) {
            if (error.message.includes('Daily limit')) {
                throw error;
            }
            console.log('⚠️ Initial PVHS Followers Mode limit check failed, continuing:', error.message);
        }
        
        console.log(`Target account: @${pvphsAccount}`);
        console.log(`Mode: Following ALL followers (no keyword filter)`);
        console.log('');
        
        updateStats({ status: `📍 Navigating to @${pvphsAccount}'s profile...` });
        
        // Navigate to the PVHS account profile
        await navigateToUrl(tabId, `https://www.instagram.com/${pvphsAccount}/`);
        await wait(3000);
        
        // Get their followers list (using background-driven scrolling)
        updateStats({ status: `📜 Opening @${pvphsAccount}'s followers modal...` });
        console.log(`Opening followers modal for @${pvphsAccount}...`);
        
        const modalResponse = await sendToContentScript(tabId, {
            action: 'getFollowersList'
        });
        
        if (modalResponse.shouldStop) {
            throw new Error(modalResponse.error || 'Bot should stop due to comprehensive check failure');
        }
        
        if (!modalResponse.success || !modalResponse.modalReady) {
            throw new Error(`Failed to open followers modal for @${pvphsAccount}`);
        }
        
        // NOW USE BACKGROUND-DRIVEN SCROLLING
        updateStats({ status: `📜 Scrolling @${pvphsAccount}'s followers (YOU CAN SWITCH TABS!)...` });
        console.log(`🚀 Background scrolling followers of @${pvphsAccount}...`);
        await scrollModalFromBackground(tabId, 'div[role="dialog"]');
        
        // Extract usernames after scrolling
        console.log('Extracting followers usernames...');
        const extractResponse = await sendToContentScript(tabId, {
            action: 'extractFollowersUsernames'
        });
        
        if (!extractResponse.success || !extractResponse.usernames || extractResponse.usernames.length === 0) {
            throw new Error(`Failed to extract followers for @${pvphsAccount} or they have no followers`);
        }
        
        const followersList = extractResponse.usernames;
        console.log(`✅ Found ${followersList.length} followers for @${pvphsAccount}`);
        console.log(`Now following ALL followers (no filter)...\n`);
        
        updateStats({ 
            status: `✅ Found ${followersList.length} followers. Following all...` 
        });
        await wait(2000);
        
        // Process each follower (no filter - follow everyone)
        let followerCount = 0;
        for (const followerUsername of followersList) {
            if (!botState.running) {
                console.log('Bot stopped by user');
                return;
            }
            
            followerCount++;
            console.log(`  → [${followerCount}/${followersList.length}] Following @${followerUsername}`);
            
            // Update status with detailed context
            updateStats({ 
                status: `👤 Following [${followerCount}/${followersList.length}] of @${pvphsAccount}: @${followerUsername}`,
                profilesVisited: botState.stats.profilesVisited + 1
            });
            
            try {
                // Process profile without school filter - follow everyone
                await processProfileNoFilter(tabId, followerUsername);
            } catch (error) {
                if (error.message.includes('daily limit')) {
                    throw error;
                }
                console.log(`  ✗ Error processing @${followerUsername}:`, error.message);
                // Continue with next follower
            }
        }
        
        console.log(`\n✅ Finished processing all ${followersList.length} followers of @${pvphsAccount}`);
        
        updateStats({ status: '✅ PVHS Followers Mode completed!' });
        await wait(2000);
        stopBot('PVHS Followers Mode completed successfully');
        
    } catch (error) {
        console.error('❌ PVHS Followers Mode Error:', error);
        throw error;
    }
}

// Story Like Mode - Like people's stories
async function runStoryLikeMode(tabId) {
    try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       ❤️ STORY LIKE MODE STARTED       ║');
        console.log('╚════════════════════════════════════════╝\n');
        
        updateStats({ status: '📱 Navigating to Instagram home...' });
        
        // Navigate to Instagram home page (where stories are shown)
        await navigateToUrl(tabId, 'https://www.instagram.com/');
        await wait(3000);
        
        console.log('✅ On Instagram home page - stories should be visible at the top');
        
        // Click on first story circle
        updateStats({ status: '🎬 Opening first story...' });
        console.log('🎬 Attempting to open first story...');
        
        const storyResponse = await sendToContentScript(tabId, {
            action: 'clickStoryCircle'
        });
        
        if (!storyResponse.success) {
            throw new Error(storyResponse.reason || 'Failed to open story');
        }
        
        console.log('✅ Story circle clicked');
        console.log('⏳ Waiting for story viewer to fully load...');
        
        // Wait for story viewer to fully load
        await wait(5000);
        
        // Verify story viewer is open
        console.log('🔍 Checking if story viewer is open...');
        const viewerCheck = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // Check multiple ways to find the story viewer
                
                // Method 1: Look for dialog
                const dialog = document.querySelector('div[role="dialog"]');
                console.log('1. Dialog with role="dialog" found:', dialog !== null);
                
                // Method 2: Look for like button (indicates story is open)
                const likeButtons = Array.from(document.querySelectorAll('svg')).filter(svg => {
                    const ariaLabel = svg.getAttribute('aria-label');
                    return ariaLabel === 'Like' || ariaLabel === '좋아요';
                });
                console.log('2. Like buttons found:', likeButtons.length);
                
                // Method 3: Look for next button (indicates story is open)
                const nextButtons = Array.from(document.querySelectorAll('svg')).filter(svg => {
                    const ariaLabel = svg.getAttribute('aria-label');
                    return ariaLabel === 'Next' || ariaLabel === '다음';
                });
                console.log('3. Next buttons found:', nextButtons.length);
                
                // Method 4: Check if URL changed to story view
                const urlHasStories = window.location.href.includes('/stories/');
                console.log('4. URL contains /stories/:', urlHasStories);
                
                // Method 5: Look for story video/image container
                const hasVideo = document.querySelector('video') !== null;
                const hasStoryImage = document.querySelector('img[style*="object-fit"]') !== null;
                console.log('5. Has video:', hasVideo, '| Has story image:', hasStoryImage);
                
                // Story viewer is open if any of these are true
                const isOpen = dialog !== null || 
                              likeButtons.length > 0 || 
                              nextButtons.length > 0 || 
                              urlHasStories ||
                              hasVideo ||
                              hasStoryImage;
                
                console.log('=> Story viewer open:', isOpen);
                
                return isOpen;
            }
        });
        
        console.log('Viewer check result:', viewerCheck[0].result);
        
        if (!viewerCheck[0].result) {
            throw new Error('Story viewer did not open properly - no story indicators found');
        }
        
        console.log('✅ Story viewer is open and ready!');
        console.log('⏳ Waiting 2 more seconds for content to fully settle...');
        await wait(2000); // Extra wait for content to fully load
        console.log('✅ Ready to start liking stories!\n');
        
        let storiesLiked = 0;
        let storiesSkipped = 0;
        let totalStories = 0;
        
        // Like stories and manually advance to next
        console.log('🚀 Starting fast story like mode!');
        console.log('💡 Will like then click next button for maximum speed\n');
        
        while (botState.running) {
            // Check if we're still in story viewer
            console.log('🔍 Checking if still in story viewer...');
            const endCheck = await sendToContentScript(tabId, {
                action: 'isAtEndOfStories'
            });
            
            if (endCheck.atEnd) {
                console.log('✅ Back on feed - all stories liked!');
                break;
            }
            
            totalStories++;
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📖 Story #${totalStories}`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            
            // Try to like the current story
            updateStats({ 
                status: `❤️ Liking story ${totalStories}... (${storiesLiked} liked, ${storiesSkipped} skipped)` 
            });
            
            let likeResponse;
            try {
                likeResponse = await sendToContentScript(tabId, {
                    action: 'clickStoryLikeButton'
                });
                
                if (likeResponse && likeResponse.success) {
                    if (likeResponse.liked) {
                        storiesLiked++;
                        console.log(`✅ Liked story #${totalStories}!`);
                    } else {
                        storiesSkipped++;
                        console.log(`ℹ️ Skipped story #${totalStories} (${likeResponse.reason || 'already liked'})`);
                    }
                } else {
                    console.log(`⚠️ Could not like story #${totalStories}: ${likeResponse?.reason || 'like button not found'}`);
                }
            } catch (error) {
                console.log(`⚠️ Error on story #${totalStories}: ${error.message}`);
            }
            
            // Small delay after like
            await wait(800);
            
            // Click next button to advance immediately
            console.log('➡️ Clicking next button...');
            updateStats({ 
                status: `➡️ Moving to next story... (${storiesLiked} liked, ${storiesSkipped} skipped)` 
            });
            
            try {
                const nextResponse = await sendToContentScript(tabId, {
                    action: 'clickStoryNextButton'
                });
                
                if (nextResponse && nextResponse.success) {
                    console.log('✅ Moved to next story');
                } else {
                    console.log('ℹ️ No next button - reached the end');
                    break;
                }
            } catch (error) {
                console.log('ℹ️ Error clicking next - assuming end reached');
                break;
            }
            
            // Short wait for next story to load
            console.log('⏳ Waiting 1 second for next story to load...');
            await wait(1000);
        }
        
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       ❤️ STORY LIKE MODE COMPLETE      ║');
        console.log('╚════════════════════════════════════════╝');
        console.log(`\n📊 Final Statistics:`);
        console.log(`   Total stories viewed: ${totalStories}`);
        console.log(`   Stories liked: ${storiesLiked}`);
        console.log(`   Stories skipped: ${storiesSkipped}`);
        console.log('');
        
        updateStats({ 
            status: `✅ Completed! Liked ${storiesLiked} stories, skipped ${storiesSkipped}`,
            profilesVisited: totalStories,
            followedCount: storiesLiked
        });
        
        // Close story viewer
        await sendToContentScript(tabId, {
            action: 'closeStoryViewer'
        });
        
        await wait(2000);
        stopBot('Story like mode completed successfully');
        
    } catch (error) {
        console.error('❌ Story Like Mode Error:', error);
        throw error;
    }
}

// Start bot
async function startBot(config) {
    try {
        console.log('Setting up bot in Instagram tab...');
        updateStats({ status: '📱 Setting up bot tab...' });
        
        // Setup bot in Instagram tab (existing or new)
        const { windowId, tabId } = await createBotWindow();
        
        // Store for later cleanup
        botState.botWindowId = windowId;
        botState.tabId = tabId;
        
        // Setup Offscreen API to keep service worker alive
        console.log('🔒 Setting up Offscreen API for service worker...');
        try {
            await createOffscreenDocument();
            console.log('✓ Offscreen API enabled - service worker will stay alive');
        } catch (error) {
            console.log('⚠️ Could not create offscreen document:', error);
        }
        
        // Set tab as non-discardable (bot window won't be unloaded)
        console.log('🔒 Protecting bot window from being discarded...');
        try {
            await chrome.tabs.update(tabId, { autoDiscardable: false });
            console.log('✓ Bot window protected');
        } catch (error) {
            console.log('⚠️ Could not protect tab:', error);
        }
        
        console.log('');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║  ✅ BOT TAB READY!                                        ║');
        console.log('║                                                           ║');
        console.log('║  🎥 HIGHLY RECOMMENDED: Enable Screen Sharing            ║');
        console.log('║     1. Click "Enable Screen Sharing" in popup            ║');
        console.log('║     2. Click button in the screen sharing tab            ║');
        console.log('║     3. Select "Window" and choose Instagram window       ║');
        console.log('║                                                           ║');
        console.log('║  This prevents ALL throttling for perfect scrolling!     ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
        
        // Ensure content script is loaded
        const injected = await ensureContentScriptInjected(tabId);
        if (!injected) {
            throw new Error('Failed to connect to Instagram page. Please refresh the page and try again.');
        }
        
        // Note: Login check removed - bot will work whether logged in or not
        // If not logged in, Instagram will show their own login page
        
        // Check for daily limit immediately after loading Instagram
        console.log('Checking for existing daily limit popup on Instagram...');
        updateStats({ status: 'Checking for daily limit...' });
        
        try {
            const initialLimitCheck = await sendToContentScript(tabId, {
                action: 'checkForDailyLimit'
            });
            
            if (initialLimitCheck && initialLimitCheck.limitReached === true) {
                console.log('⚠️ Daily limit popup already visible on Instagram!');
                console.log('Cannot start bot - you have already reached your daily limit.');
                throw new Error('Daily limit already reached. The limit popup is visible on Instagram. Please wait 24 hours and try again.');
            }
            
            console.log('✓ No daily limit detected, proceeding with bot...');
        } catch (error) {
            // If daily limit check fails, log it but don't stop the bot
            // The check will happen again before each follow attempt
            console.log('⚠️ Initial daily limit check failed (will check again later):', error.message);
        }
        
        // Initialize bot state
        botState.running = true;
        botState.config = config;
        botState.followCount = 0;
        botState.stats = {
            profilesVisited: 0,
            followedCount: 0,
            status: 'Running...'
        };
        
        updateStats({ status: 'Bot started...' });
        
        // Notify native host that bot started
        if (nativeMessaging.isAvailable()) {
            console.log('📡 Notifying native host: bot started');
            nativeMessaging.startBot(tabId);
        } else {
            console.log('⚠️ Native host not available, running in fallback mode');
        }
        
        // Run appropriate mode
        if (config.mode === 'mode1') {
            await runMode1(tabId, config.username, config.schools);
        } else if (config.mode === 'explore') {
            await runExploreMode(tabId, config.schools);
        } else if (config.mode === 'test') {
            await runTestMode(tabId, config.testUsername, config.schools);
        } else if (config.mode === 'quicktest') {
            await runQuickTestMode(tabId, config.quickTestUsernames, config.schools);
        } else if (config.mode === 'followtest') {
            await runFollowingDetectionTest(tabId, config.followTestUsername);
        } else if (config.mode === 'storylike') {
            await runStoryLikeMode(tabId);
        } else if (config.mode === 'pvphs') {
            await runPVHSFollowersMode(tabId, config.pvphsAccount);
        } else if (config.mode === 'reelslike') {
            await runReelsLikeCommentsMode(tabId, config.reelsAccount);
        } else {
            throw new Error('Invalid mode');
        }
        
    } catch (error) {
        handleBotError(error.message);
        throw error;
    }
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    if (request.action === 'startBot') {
        if (botState.running) {
            sendResponse({ success: false, error: 'Bot is already running' });
            return;
        }
        
        startBot(request.config)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
        
        return true; // Keep channel open for async response
    } else if (request.action === 'stopBot') {
        stopBot('Stopped by user');
        sendResponse({ success: true });
    } else if (request.action === 'getBotState') {
        sendResponse({ 
            success: true, 
            running: botState.running,
            stats: botState.stats
        });
    } else if (request.action === 'checkSleepModeDialog') {
        // Manual check for sleep mode dialog
        if (!botState.tabId) {
            sendResponse({ success: false, error: 'No bot tab found' });
            return;
        }
        
        checkAndCloseSleepModeDialog(botState.tabId)
            .then((closed) => {
                sendResponse({ success: true, closed: closed });
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
        
        return true; // Keep channel open for async response
    } else if (request.action === 'startTabCapture') {
        // User clicked the "Enable Screen Sharing" button
        if (!botState.tabId) {
            sendResponse({ success: false, error: 'No bot tab found' });
            return;
        }
        
        console.log('🎥 User clicked "Enable Screen Sharing" button');
        
        startTabCapture(botState.tabId)
            .then((success) => {
                if (success) {
                    console.log('✅ Screen sharing enabled by user!');
                    sendResponse({ success: true });
                } else {
                    console.log('⚠️ Screen sharing failed, using fallback');
                    sendResponse({ success: false });
                }
            })
            .catch((error) => {
                console.error('Error starting tab capture:', error);
                sendResponse({ success: false, error: error.message });
            });
        
        return true;
    } else if (request.action === 'notifyNativeHost') {
        // Forward message to native host
        if (nativeMessaging.isAvailable()) {
            nativeMessaging.sendToNativeHost({
                type: request.type,
                timestamp: new Date().toISOString()
            });
        }
        sendResponse({ success: true });
    } else if (request.action === 'checkNativeHost') {
        // Check native host connection status
        console.log('🔍 Background: Checking native host status...');
        const connected = nativeMessaging.isAvailable();
        const message = connected ? 'Native host is running and ready' : 'Native host not available';
        console.log('📡 Background: Native host status:', connected, message);
        
        sendResponse({
            success: true,
            connected: connected,
            message: message
        });
    } else if (request.action === 'forceConnectNativeHost') {
        // Force a connection attempt to native host
        console.log('🔄 Background: Force connecting to native host...');
        if (nativeMessaging.isAvailable()) {
            console.log('✅ Native host already connected');
            sendResponse({ success: true, message: 'Already connected' });
        } else {
            console.log('🔄 Attempting to force connect...');
            nativeMessaging.forceConnect();
            // Wait a moment and check status
            setTimeout(() => {
                const connected = nativeMessaging.isAvailable();
                console.log('📡 Force connect result:', connected);
            }, 1000);
            sendResponse({ success: true, message: 'Force connect attempted' });
        }
    }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
    console.log('Instagram Follower Bot installed');
    chrome.storage.local.set({ 
        botRunning: false,
        botStats: {
            profilesVisited: 0,
            followedCount: 0,
            status: 'Idle'
        }
    });
});


// Content script for Instagram DOM interactions
console.log('Instagram Follower Bot - Content Script Loaded');

// Helper function to wait for element
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// Helper function to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to check both daily limit and sleep mode with double verification
async function checkDailyLimitAndSleepMode() {
    try {
        console.log('🔍 Performing comprehensive check (daily limit + sleep mode)...');
        
        // First check: Daily limit
        console.log('📊 First check: Daily limit...');
        const firstDailyLimitCheck = checkForDailyLimit();
        if (firstDailyLimitCheck && firstDailyLimitCheck.limitReached) {
            console.log('⚠️ First check: Daily limit detected, performing second check...');
            
            // Wait a moment and check again
            await wait(3000);
            const secondDailyLimitCheck = checkForDailyLimit();
            if (secondDailyLimitCheck && secondDailyLimitCheck.limitReached) {
                console.log('❌ Second check: Daily limit confirmed, stopping bot');
                return { shouldStop: true, reason: 'Daily limit reached (confirmed)' };
            } else {
                console.log('✅ Second check: Daily limit false positive, continuing');
            }
        }
        
        // Second check: Sleep mode dialog
        console.log('🌙 Second check: Sleep mode dialog...');
        const firstSleepModeCheck = await closeSleepModeDialog();
        if (firstSleepModeCheck) {
            console.log('⚠️ First check: Sleep mode dialog detected, performing second check...');
            
            // Wait a moment and check again
            await wait(2000);
            const secondSleepModeCheck = await closeSleepModeDialog();
            if (secondSleepModeCheck) {
                console.log('✅ Second check: Sleep mode dialog closed again, continuing');
            } else {
                console.log('✅ Second check: Sleep mode dialog was a one-time issue, continuing');
            }
        }
        
        console.log('✅ Comprehensive check complete, continuing bot operation');
        return { shouldStop: false, reason: 'All checks passed' };
        
    } catch (error) {
        console.error('Error in comprehensive check:', error);
        return { shouldStop: false, reason: 'Check error, continuing' };
    }
}

// Function to detect and close Instagram sleep mode dialog with retry logic (up to 6 attempts)
async function closeSleepModeDialog() {
    const maxAttempts = 6;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`🔄 Checking for sleep mode dialog (attempt ${attempt}/${maxAttempts})...`);
            
            // Look for the sleep mode dialog with the specific text
            const sleepModeDialog = document.querySelector('div[role="dialog"]');
            if (sleepModeDialog) {
                // Check if it contains the sleep mode text
                const sleepModeText = sleepModeDialog.textContent;
                if (sleepModeText && sleepModeText.includes("You're in sleep mode")) {
                    console.log('🌙 Sleep mode dialog detected, closing...');
                    
                    // Method 1: Look for the specific OK button structure you provided
                    const okButton = sleepModeDialog.querySelector('div[role="button"][tabindex="0"]');
                    if (okButton && okButton.textContent.trim() === 'OK') {
                        console.log('✅ Found OK button (method 1), clicking...');
                        okButton.click();
                        await wait(1500);
                        
                        // Verify if the dialog is actually closed
                        const stillVisible = document.querySelector('div[role="dialog"]');
                        const stillSleepMode = stillVisible && stillVisible.textContent && stillVisible.textContent.includes("You're in sleep mode");
                        if (!stillSleepMode) {
                            console.log(`✅ Sleep mode dialog successfully closed on attempt ${attempt}`);
                            return true;
                        } else {
                            console.log(`⚠️ Dialog still visible after attempt ${attempt}, retrying...`);
                            await wait(1000);
                            continue;
                        }
                    }
                    
                    // Method 2: Look for any div with role="button" containing "OK"
                    const okButtons = sleepModeDialog.querySelectorAll('div[role="button"]');
                    for (const button of okButtons) {
                        if (button.textContent && button.textContent.trim() === 'OK') {
                            console.log('✅ Found OK button (method 2), clicking...');
                            button.click();
                            await wait(1500);
                            
                            // Verify if the dialog is actually closed
                            const stillVisible = document.querySelector('div[role="dialog"]');
                            const stillSleepMode = stillVisible && stillVisible.textContent && stillVisible.textContent.includes("You're in sleep mode");
                            if (!stillSleepMode) {
                                console.log(`✅ Sleep mode dialog successfully closed on attempt ${attempt}`);
                                return true;
                            } else {
                                console.log(`⚠️ Dialog still visible after attempt ${attempt}, retrying...`);
                                await wait(1000);
                                continue;
                            }
                        }
                    }
                    
                    // Method 3: Look for any clickable element with "OK" text
                    const clickableElements = sleepModeDialog.querySelectorAll('[role="button"], button, [tabindex="0"]');
                    for (const element of clickableElements) {
                        if (element.textContent && element.textContent.trim() === 'OK') {
                            console.log('✅ Found OK button (method 3), clicking...');
                            element.click();
                            await wait(1500);
                            
                            // Verify if the dialog is actually closed
                            const stillVisible = document.querySelector('div[role="dialog"]');
                            const stillSleepMode = stillVisible && stillVisible.textContent && stillVisible.textContent.includes("You're in sleep mode");
                            if (!stillSleepMode) {
                                console.log(`✅ Sleep mode dialog successfully closed on attempt ${attempt}`);
                                return true;
                            } else {
                                console.log(`⚠️ Dialog still visible after attempt ${attempt}, retrying...`);
                                await wait(1000);
                                continue;
                            }
                        }
                    }
                    
                    // Method 4: Look for elements with specific classes that might be the OK button
                    const specificOkButton = sleepModeDialog.querySelector('.x1i10hfl.xjqpnuy.xc5r6h4.xqeqjp1.x1phubyo.xdl72j9.x2lah0s.x3ct3a4.xdj266r.x14z9mp.xat24cr.x1lziwak.x2lwn1j.xeuugli.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x1a2a7pz.x6s0dn4.xjyslct.x1ejq31n.x18oe1m7.x1sy0etr.xstzfhl.x9f619.x1ypdohk.x1f6kntn.xl56j7k.x17ydfre.x2b8uid.xlyipyv.x87ps6o.x14atkfc.x5c86q.x18br7mf.x1i0vuye.xl0gqc1.xr5sc7.xlal1re.x14jxsvd.xt0b8zv.xjbqb8w.xr9e8f9.x1e4oeot.x1ui04y5.x6en5u8.x972fbf.x10w94by.x1qhh985.x14e42zd.xt0psk2.xt7dq6l.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1n2onr6.x1n5bzlp');
                    if (specificOkButton && specificOkButton.textContent && specificOkButton.textContent.trim() === 'OK') {
                        console.log('✅ Found OK button (method 4 - specific classes), clicking...');
                        specificOkButton.click();
                        await wait(1500);
                        
                        // Verify if the dialog is actually closed
                        const stillVisible = document.querySelector('div[role="dialog"]');
                        const stillSleepMode = stillVisible && stillVisible.textContent && stillVisible.textContent.includes("You're in sleep mode");
                        if (!stillSleepMode) {
                            console.log(`✅ Sleep mode dialog successfully closed on attempt ${attempt}`);
                            return true;
                        } else {
                            console.log(`⚠️ Dialog still visible after attempt ${attempt}, retrying...`);
                            await wait(1000);
                            continue;
                        }
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
                    await wait(1500);
                    
                    // Verify if the dialog is actually closed
                    const stillVisible = document.querySelector('div[role="dialog"]');
                    const stillSleepMode = stillVisible && stillVisible.textContent && stillVisible.textContent.includes("You're in sleep mode");
                    if (!stillSleepMode) {
                        console.log(`✅ Sleep mode dialog successfully closed on attempt ${attempt} (via Escape)`);
                        return true;
                    } else {
                        console.log(`⚠️ Dialog still visible after Escape on attempt ${attempt}, retrying...`);
                        await wait(1000);
                    }
                }
            }
            
            // No sleep mode dialog found
            if (attempt === 1) {
                console.log('✓ No sleep mode dialog detected');
            }
            return false;
            
        } catch (error) {
            console.error(`Error on attempt ${attempt} to check/close sleep mode dialog:`, error);
            await wait(1000);
        }
    }
    
    console.log(`❌ Sleep mode dialog still present after ${maxAttempts} attempts`);
    return false;
}

// NOTE: scrollToBottomOfModal() function removed
// All scrolling is now done by background script using chrome.scripting.executeScript()
// This bypasses Chrome's throttling of inactive tabs

// Simple username extraction (no filtering) - for YOUR following list
function extractUsernamesSimple(container) {
    const usernames = new Set();
    const links = container.querySelectorAll('a[href^="/"][role="link"]');
    
    console.log(`📋 Simple extraction: Found ${links.length} profile links`);
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.includes('/p/') && !href.includes('/reel/') && !href.includes('/explore/')) {
            const username = href.split('/').filter(x => x)[0];
            if (username && username.length > 0) {
                usernames.add(username);
            }
        }
    });
    
    console.log(`✓ Simple extraction complete: ${usernames.size} unique usernames`);
    return Array.from(usernames);
}

// Extract usernames from a list (skip already following) - IMMEDIATE PROCESSING
function extractUsernames(container) {
    const usernames = [];
    const processedUsernames = new Set();
    let totalProcessed = 0;
    let skippedFollowing = 0;
    let duplicates = 0;
    
    // Find all username links
    const links = container.querySelectorAll('a[href^="/"][role="link"]');
    
    console.log(`\n📋 Starting immediate processing of ${links.length} profile links...`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Process each profile IMMEDIATELY
    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('/') || href.includes('/p/') || href.includes('/reel/') || href.includes('/explore/')) {
            continue;
        }
        
        const username = href.split('/').filter(x => x)[0];
        if (!username || username.length === 0) continue;
        
        // Skip duplicates
        if (processedUsernames.has(username)) {
            duplicates++;
            continue;
        }
        
        processedUsernames.add(username);
        totalProcessed++;
        
        // IMMEDIATE DETECTION - Process right away
        let isFollowing = false;
        let detectionMethod = '';
        
        // Find the container with buttons
        let profileContainer = link;
        for (let i = 0; i < 15; i++) {
            profileContainer = profileContainer.parentElement;
            if (!profileContainer) break;
            
            const containerTextContent = profileContainer.textContent || '';
            const followingButtons = profileContainer.querySelectorAll('button');
            
            // Debug for first profile only
            if (totalProcessed === 1 && followingButtons.length > 0) {
                console.log(`🔍 DEBUG INFO FOR FIRST PROFILE (@${username}):`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`   Found ${followingButtons.length} button(s) in container`);
                followingButtons.forEach((btn, idx) => {
                    console.log(`\n   Button ${idx + 1}:`);
                    console.log(`      Text: "${btn.textContent.trim()}"`);
                    console.log(`      Classes: ${btn.className}`);
                    console.log(`      Has _aswp: ${btn.className.includes('_aswp')}`);
                    const divs = btn.querySelectorAll('div');
                    if (divs.length > 0) {
                        console.log(`      Inner divs: ${divs.length}`);
                        divs.forEach((div, didx) => {
                            if (didx < 3) { // Only show first 3
                                console.log(`         Div ${didx + 1}: "${div.textContent.trim()}" | classes: ${div.className.substring(0, 50)}...`);
                            }
                        });
                    }
                });
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
            }
            
            // Detection methods based on actual Instagram HTML structure
            for (const btn of followingButtons) {
                const btnText = btn.textContent.trim();
                const btnClasses = btn.className;
                
                // Method 1: Text-based detection (most reliable)
                // Check the inner div text first
                const btnDiv = btn.querySelector('div._ap3a._aaco._aacw._aad6._aade');
                if (btnDiv) {
                    const divText = btnDiv.textContent.trim();
                    if (divText === 'Following' || divText === 'Requested') {
                        isFollowing = true;
                        detectionMethod = 'div-text-following';
                        break;
                    } else if (divText === 'Follow') {
                        // Explicitly NOT following - it's a Follow button
                        isFollowing = false;
                        detectionMethod = 'div-text-follow';
                        break;
                    }
                }
                
                // Method 2: Check button text directly
                if (btnText === 'Following' || btnText === 'Requested') {
                    isFollowing = true;
                    detectionMethod = 'button-text-following';
                    break;
                } else if (btnText === 'Follow') {
                    isFollowing = false;
                    detectionMethod = 'button-text-follow';
                    break;
                }
                
                // Method 3: Check div with dir="auto"
                const btnDivAuto = btn.querySelector('div[dir="auto"]');
                if (btnDivAuto) {
                    const divAutoText = btnDivAuto.textContent.trim();
                    if (divAutoText === 'Following' || divAutoText === 'Requested') {
                        isFollowing = true;
                        detectionMethod = 'div-auto-following';
                        break;
                    } else if (divAutoText === 'Follow') {
                        isFollowing = false;
                        detectionMethod = 'div-auto-follow';
                        break;
                    }
                }
                
                // Method 4: Class detection as last resort
                // Following button: _aswp _aswr _aswu _asw_ _asx2
                // Follow button: _aswp _aswr _aswv _asw_ _asx2
                // Check for _aswu AND make sure it doesn't have "Follow" text
                if (btnClasses.includes('_aswu') && !btnText.includes('Follow')) {
                    isFollowing = true;
                    detectionMethod = 'class-aswu-following';
                    break;
                }
            }
            
            // Method 5: Text node search
            if (!isFollowing && containerTextContent.includes('Following') && followingButtons.length > 0) {
                const walker = document.createTreeWalker(profileContainer, NodeFilter.SHOW_TEXT, null, false);
                let node;
                while (node = walker.nextNode()) {
                    const trimmed = node.textContent.trim();
                    if (trimmed === 'Following' || trimmed === 'Requested') {
                        isFollowing = true;
                        detectionMethod = 'text-node-exact';
                        break;
                    }
                }
            }
            
            if (isFollowing || followingButtons.length > 0) {
                break; // Found the right container level
            }
        }
        
        // IMMEDIATE DECISION AND LOGGING
        if (isFollowing) {
            console.log(`⏭️ [${totalProcessed}] Skipping @${username} - already following (${detectionMethod})`);
            skippedFollowing++;
        } else {
            console.log(`✅ [${totalProcessed}] Adding @${username} - not following yet`);
            usernames.push(username);
        }
    }
    
    // Final summary
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 FINAL EXTRACTION SUMMARY:`);
    console.log(`   Total links found: ${links.length}`);
    console.log(`   Unique profiles processed: ${totalProcessed}`);
    console.log(`   Duplicates skipped: ${duplicates}`);
    console.log(`   Already following (skipped): ${skippedFollowing}`);
    console.log(`   New profiles to check: ${usernames.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    return usernames;
}

// Check if logged in
function checkIfLoggedIn() {
    // Check for profile link in navigation
    const profileLinks = document.querySelectorAll('a[href*="/"]');
    let loggedIn = false;
    
    profileLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.match(/^\/[a-zA-Z0-9._]+\/$/)) {
            loggedIn = true;
        }
    });
    
    // Alternative check - look for "Log In" button
    const loginButton = document.querySelector('a[href="/accounts/login/"]');
    if (loginButton) {
        loggedIn = false;
    }
    
    return loggedIn;
}

// Navigate to profile
async function navigateToProfile(username) {
    const url = `https://www.instagram.com/${username}/`;
    window.location.href = url;
    await wait(3000); // Wait for page to load
}

// Click following button
async function clickFollowingButton() {
    try {
        // Comprehensive check: Daily limit + Sleep mode with double verification
        console.log('🔍 Performing comprehensive check before opening following modal...');
        const checkResult = await checkDailyLimitAndSleepMode();
        if (checkResult.shouldStop) {
            console.log('❌ Comprehensive check failed:', checkResult.reason);
            return { success: false, shouldStop: true, reason: checkResult.reason };
        }
        
        // Wait for the page to load
        await wait(2000);
        
        // Look for following span with specific text
        const spans = document.querySelectorAll('span');
        let followingButton = null;
        
        for (const span of spans) {
            const text = span.textContent.toLowerCase();
            if (text.includes('following')) {
                followingButton = span.closest('a');
                break;
            }
        }
        
        if (followingButton) {
            followingButton.click();
            await wait(2000);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error clicking following button:', error);
        return false;
    }
}

// Click followers button
async function clickFollowersButton() {
    try {
        // Comprehensive check: Daily limit + Sleep mode with double verification
        console.log('🔍 Performing comprehensive check before opening followers modal...');
        const checkResult = await checkDailyLimitAndSleepMode();
        if (checkResult.shouldStop) {
            console.log('❌ Comprehensive check failed:', checkResult.reason);
            return { success: false, shouldStop: true, reason: checkResult.reason };
        }
        
        await wait(2000);
        
        const spans = document.querySelectorAll('span');
        let followersButton = null;
        
        for (const span of spans) {
            const text = span.textContent.toLowerCase();
            if (text.includes('follower')) {
                followersButton = span.closest('a');
                break;
            }
        }
        
        if (followersButton) {
            followersButton.click();
            await wait(2000);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error clicking followers button:', error);
        return false;
    }
}

// NOTE: getFollowingList() and getFollowersList() functions removed
// Now using message handlers with background-driven scrolling
// See message handlers below for 'getFollowingList', 'extractFollowingUsernames', etc.

// Get profile bio and name
function getProfileBioAndName() {
    try {
        let bioText = '';
        let nameText = '';
        
        // Get the username/name from header (h1, h2 only - more specific)
        const headers = document.querySelectorAll('main h1, main h2');
        headers.forEach(header => {
            nameText += ' ' + header.textContent;
        });
        
        // Get bio from specific selectors - Instagram uses these classes for actual bio
        // Target only the bio span elements with specific class patterns
        const bioSelectors = [
            'span._ap3a._aaco._aacu._aacx._aad7._aade', // The specific bio class you provided
            'span[dir="auto"]._ap3a',
            'div._aa_c span', // Alternative bio container
            'section span._ap3a'
        ];
        
        for (const selector of bioSelectors) {
            const bioElements = document.querySelectorAll(selector);
            bioElements.forEach(elem => {
                const text = elem.textContent.trim();
                // Exclude "Followed by" sections and other metadata
                if (text && 
                    !text.includes('Followed by') && 
                    !text.includes('+ ') && 
                    !text.match(/^\d+\s+(posts|followers|following)/i) &&
                    text.length > 0 &&
                    text.length < 300) { // Bio shouldn't be too long
                    bioText += ' ' + text;
                }
            });
        }
        
        // If no bio found with specific selectors, try a more targeted approach
        if (!bioText.trim()) {
            const mainSection = document.querySelector('main section');
            if (mainSection) {
                // Find spans that are likely bio text (not in buttons, not "Followed by", etc.)
                const spans = mainSection.querySelectorAll('span[dir="auto"]');
                spans.forEach(span => {
                    const text = span.textContent.trim();
                    // Check if this is bio text (not metadata)
                    if (text && 
                        !text.includes('Followed by') &&
                        !text.includes('following') &&
                        !text.includes('followers') &&
                        !text.includes('posts') &&
                        !text.match(/^\d+$/) && // Not just numbers
                        !span.querySelector('img') && // No images
                        !span.closest('a[role="link"]') && // Not inside a link
                        text.length > 5 && 
                        text.length < 300) {
                        bioText += ' ' + text;
                    }
                });
            }
        }
        
        const result = {
            bio: bioText.toLowerCase().trim(),
            name: nameText.toLowerCase().trim()
        };
        
        console.log('📖 Profile text extracted:');
        console.log('   Name:', result.name.substring(0, 100));
        console.log('   Bio:', result.bio.substring(0, 200));
        
        return result;
    } catch (error) {
        console.error('Error getting profile bio:', error);
        return { bio: '', name: '' };
    }
}

// Check if bio contains school abbreviation (simple substring matching)
function bioContainsSchool(bio, name, schools) {
    // Remove all spaces and convert to lowercase for matching
    const combinedText = `${bio}${name}`.toLowerCase().replace(/\s+/g, '');
    
    console.log('🔍 Checking for school matches...');
    console.log('   Text (no spaces):', combinedText.substring(0, 100));
    
    for (const school of schools) {
        for (const abbr of school.abbreviations) {
            if (!abbr) continue;
            
            // Remove spaces from abbreviation and convert to lowercase
            const abbrLower = abbr.toLowerCase().trim().replace(/\s+/g, '');
            if (!abbrLower) continue;
            
            // Simple substring match - will find "ahs" in "ewfiojfwoahs"
            if (combinedText.includes(abbrLower)) {
                console.log(`✅ MATCH FOUND: "${abbrLower}" found in profile text`);
                console.log(`   School: ${school.name}`);
                console.log(`   Original abbreviation: "${abbr}"`);
                return true;
            }
        }
    }
    
    console.log('❌ No school match found in bio/name');
    return false;
}

// Check if already following
function isAlreadyFollowing() {
    try {
        // Look for "Following" button
        const buttons = document.querySelectorAll('button, div[role="button"]');
        
        for (const button of buttons) {
            const text = button.textContent.toLowerCase().trim();
            if (text === 'following' || text === 'requested') {
                return true;
            }
        }
        
        // Check for Follow button (if not following)
        for (const button of buttons) {
            const text = button.textContent.toLowerCase().trim();
            if (text === 'follow') {
                return false;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking follow status:', error);
        return false;
    }
}

// Click follow button
async function clickFollowButton() {
    try {
        // Comprehensive check: Daily limit + Sleep mode with double verification
        console.log('🔍 Performing comprehensive check before clicking follow button...');
        const checkResult = await checkDailyLimitAndSleepMode();
        if (checkResult.shouldStop) {
            console.log('❌ Comprehensive check failed:', checkResult.reason);
            return { success: false, shouldStop: true, reason: checkResult.reason };
        }
        
        const buttons = document.querySelectorAll('button');
        
        for (const button of buttons) {
            const text = button.textContent.toLowerCase().trim();
            if (text === 'follow') {
                button.click();
                await wait(2000);
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error clicking follow button:', error);
        return false;
    }
}

// Check for rate limit warning (Try Again Later - 3 hour break needed)
function checkForRateLimit() {
    // Look for "Try Again Later" heading
    const headings = document.querySelectorAll('h3.x1lliihq, h2, h3');
    for (const heading of headings) {
        const text = heading.textContent.toLowerCase();
        if (text.includes("try again later")) {
            console.log('⏱️ Rate limit (Try Again Later) detected:', heading.textContent);
            
            // Verify it's the rate limit popup by checking for the description
            const parent = heading.closest('div');
            if (parent) {
                const spans = parent.querySelectorAll('span');
                for (const span of spans) {
                    if (span.textContent.includes("We limit how often you can do certain things")) {
                        console.log('✓ Confirmed: Rate limit popup (need 3-hour break)');
                        return true;
                    }
                }
            }
            return true; // Found "Try Again Later" heading
        }
    }
    return false;
}

// Check for daily limit warning (full day limit - stop bot)
function checkForDailyLimit() {
    // Method 1: Check for specific h1 with class pattern
    const limitHeadings = document.querySelectorAll('h1.x1lliihq');
    for (const heading of limitHeadings) {
        const text = heading.textContent.toLowerCase();
        if (text.includes("reached your daily limit") || 
            text.includes("you've reached your daily limit")) {
            console.log('🛑 Daily limit detected via h1:', heading.textContent);
            return true;
        }
    }
    
    // Method 2: Check all h1 headings as fallback
    const allH1 = document.querySelectorAll('h1');
    for (const heading of allH1) {
        const text = heading.textContent.toLowerCase();
        if (text.includes("reached your daily limit") || 
            text.includes("you've reached your daily limit") ||
            text.includes("action blocked")) {
            console.log('🛑 Daily limit detected via h1:', heading.textContent);
            return true;
        }
    }
    
    return false;
}

// Close rate limit dialog (Try Again Later) by clicking OK
async function closeRateLimitDialog() {
    try {
        console.log('Attempting to close rate limit dialog (Try Again Later)...');
        
        // Method 1: Look for button with "OK" text
        const allButtons = document.querySelectorAll('button');
        for (const button of allButtons) {
            const buttonText = button.textContent.trim().toLowerCase();
            if (buttonText === 'ok') {
                console.log('Clicking OK button on rate limit dialog');
                button.click();
                await wait(1000);
                return true;
            }
        }
        
        // Method 2: Look for div inside button with class pattern
        const divsWithOK = document.querySelectorAll('div._ap3a');
        for (const div of divsWithOK) {
            if (div.textContent.trim().toLowerCase() === 'ok') {
                const button = div.closest('button');
                if (button) {
                    console.log('Clicking OK button (via div)');
                    button.click();
                    await wait(1000);
                    return true;
                }
            }
        }
        
        // Method 3: Press Escape as fallback
        console.log('OK button not found, pressing Escape key');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
        await wait(1000);
        
        return false;
    } catch (error) {
        console.error('Error closing rate limit dialog:', error);
        return false;
    }
}

// Close daily limit dialog with retry logic (up to 6 attempts)
async function closeDailyLimitDialog() {
    const maxAttempts = 6;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`🔄 Attempting to close daily limit dialog (attempt ${attempt}/${maxAttempts})...`);
            
            // Method 1: Look for SVG with aria-label="close" and click its parent
            const closeSvgs = document.querySelectorAll('svg[aria-label="close"]');
            if (closeSvgs.length > 0) {
                console.log(`Found ${closeSvgs.length} close SVG(s)`);
                for (const svg of closeSvgs) {
                    // Find the clickable parent (div with role="button")
                    const clickableParent = svg.closest('div[role="button"]');
                    if (clickableParent) {
                        console.log('Clicking close button (via SVG parent)');
                        clickableParent.click();
                        await wait(1500);
                        
                        // Verify if the dialog is actually closed
                        const stillVisible = checkForDailyLimit();
                        if (!stillVisible) {
                            console.log(`✅ Daily limit dialog successfully closed on attempt ${attempt}`);
                            return true;
                        } else {
                            console.log(`⚠️ Dialog still visible after attempt ${attempt}, retrying...`);
                            await wait(1000);
                            continue;
                        }
                    }
                }
            }
            
            // Method 2: Look for div[role="button"] containing close SVG
            const roleButtons = document.querySelectorAll('div[role="button"]');
            for (const button of roleButtons) {
                const svg = button.querySelector('svg[aria-label="close"]');
                if (svg) {
                    console.log('Clicking close button (role=button with close SVG)');
                    button.click();
                    await wait(1500);
                    
                    // Verify if the dialog is actually closed
                    const stillVisible = checkForDailyLimit();
                    if (!stillVisible) {
                        console.log(`✅ Daily limit dialog successfully closed on attempt ${attempt}`);
                        return true;
                    } else {
                        console.log(`⚠️ Dialog still visible after attempt ${attempt}, retrying...`);
                        await wait(1000);
                        continue;
                    }
                }
            }
            
            // Method 3: Look for any button with close aria-label
            const allButtons = document.querySelectorAll('button, div[role="button"]');
            for (const button of allButtons) {
                const ariaLabel = button.getAttribute('aria-label')?.toLowerCase();
                if (ariaLabel && ariaLabel.includes('close')) {
                    console.log('Clicking close button (aria-label)');
                    button.click();
                    await wait(1500);
                    
                    // Verify if the dialog is actually closed
                    const stillVisible = checkForDailyLimit();
                    if (!stillVisible) {
                        console.log(`✅ Daily limit dialog successfully closed on attempt ${attempt}`);
                        return true;
                    } else {
                        console.log(`⚠️ Dialog still visible after attempt ${attempt}, retrying...`);
                        await wait(1000);
                        continue;
                    }
                }
            }
            
            // Method 4: Press Escape key as fallback
            console.log('Close button not found, pressing Escape key');
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
            await wait(1500);
            
            // Verify if the dialog is actually closed
            const stillVisible = checkForDailyLimit();
            if (!stillVisible) {
                console.log(`✅ Daily limit dialog successfully closed on attempt ${attempt} (via Escape)`);
                return true;
            } else {
                console.log(`⚠️ Dialog still visible after Escape on attempt ${attempt}, retrying...`);
                await wait(1000);
            }
            
        } catch (error) {
            console.error(`Error on attempt ${attempt} to close daily limit dialog:`, error);
            await wait(1000);
        }
    }
    
    console.log(`❌ Failed to close daily limit dialog after ${maxAttempts} attempts`);
    return false;
}

// Get explore people profiles
async function getExplorePeopleProfiles() {
    try {
        // Scroll down to load more profiles
        window.scrollTo(0, document.body.scrollHeight);
        await wait(2000);
        
        // Extract profile links
        const links = document.querySelectorAll('a[href^="/"]');
        const usernames = new Set();
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.match(/^\/[a-zA-Z0-9._]+\/$/)) {
                const username = href.split('/')[1];
                if (username && username.length > 0) {
                    usernames.add(username);
                }
            }
        });
        
        return Array.from(usernames);
    } catch (error) {
        console.error('Error getting explore profiles:', error);
        return [];
    }
}

// Story liking functions
// Find and click on a story circle (profile picture with story)
async function clickStoryCircle() {
    try {
        console.log('🔍 Looking for story circles...');
        
        // Method 1: Look for divs with role="button" and aria-label starting with "Story by"
        const allButtons = document.querySelectorAll('div[role="button"]');
        const storyButtons = [];
        
        for (const button of allButtons) {
            const ariaLabel = button.getAttribute('aria-label');
            if (ariaLabel && ariaLabel.startsWith('Story by')) {
                storyButtons.push(button);
            }
        }
        
        if (storyButtons.length > 0) {
            console.log(`✅ Found ${storyButtons.length} story circle(s) (via aria-label)`);
            console.log(`   First story: ${storyButtons[0].getAttribute('aria-label')}`);
            console.log('✅ Clicking first story circle...');
            storyButtons[0].click();
            await wait(3000); // Wait for story to open
            console.log('✅ Story circle clicked, waiting for viewer to load...');
            return { success: true };
        }
        
        // Method 2: Look for story circles with canvas elements inside
        console.log('📋 Trying alternative method (canvas detection)...');
        const storyContainers = document.querySelectorAll('div.x6s0dn4.x78zum5.xl56j7k.x1iorvi4.xf159sx.xwib8y2.xmzvs34');
        
        if (storyContainers.length === 0) {
            console.log('❌ No story circles found');
            return { success: false, reason: 'No stories available' };
        }
        
        console.log(`✅ Found ${storyContainers.length} story container(s)`);
        
        // Find the parent button element
        const firstStory = storyContainers[0];
        const parentButton = firstStory.closest('div[role="button"]');
        
        if (!parentButton) {
            console.log('❌ No clickable button found for story circle');
            return { success: false, reason: 'Story circle not clickable' };
        }
        
        console.log('✅ Clicking story circle...');
        parentButton.click();
        await wait(3000); // Wait for story to open
        console.log('✅ Story circle clicked, waiting for viewer to load...');
        
        return { success: true };
    } catch (error) {
        console.error('Error clicking story circle:', error);
        return { success: false, error: error.message };
    }
}

// Find and click the like button on a story
async function clickStoryLikeButton() {
    try {
        console.log('❤️ Looking for like button IN STORY VIEWER...');
        
        // IMPORTANT: Only look for buttons in the story viewer area, not the background feed
        // Strategy: Find buttons that are positioned in the story viewer overlay
        
        // Method 1: Look for buttons that are visible and in front (high z-index)
        const allButtons = document.querySelectorAll('div[role="button"]');
        console.log(`   Found ${allButtons.length} total button(s) on page`);
        
        // Filter to only buttons that are likely in the story viewer
        const visibleButtons = Array.from(allButtons).filter(button => {
            // Check if button is actually visible and in foreground
            const rect = button.getBoundingClientRect();
            const style = window.getComputedStyle(button);
            
            // Must be visible on screen
            const isVisible = rect.width > 0 && rect.height > 0 && 
                            style.display !== 'none' && 
                            style.visibility !== 'hidden' &&
                            style.opacity !== '0';
            
            // Check if button is in the center area (story viewer is usually centered)
            const isInCenter = rect.left >= 0 && rect.top >= 0;
            
            return isVisible && isInCenter;
        });
        
        console.log(`   Filtered to ${visibleButtons.length} visible button(s)`);
        
        // Collect all like buttons with their positions
        const likeButtonCandidates = [];
        
        for (const button of visibleButtons) {
            // Look for SVG with aria-label
            const svg = button.querySelector('svg');
            if (!svg) continue;
            
            const ariaLabel = svg.getAttribute('aria-label');
            if (!ariaLabel) continue;
            
            // Check if it's a Like button (English or Korean)
            const isLikeButton = ariaLabel === 'Like' || 
                                 ariaLabel === '좋아요' || 
                                 ariaLabel.toLowerCase().includes('like') ||
                                 ariaLabel.includes('좋아요');
            
            if (isLikeButton) {
                const rect = button.getBoundingClientRect();
                likeButtonCandidates.push({ button, rect, ariaLabel });
            }
        }
        
        console.log(`   Found ${likeButtonCandidates.length} like button candidate(s)`);
        
        // Sort by vertical position (topmost first - story like button should be on top)
        likeButtonCandidates.sort((a, b) => a.rect.top - b.rect.top);
        
        // Try the first (topmost) like button - this should be the story one
        for (const candidate of likeButtonCandidates) {
            const { button, rect, ariaLabel } = candidate;
            
            console.log(`   Checking like button at position: x=${Math.round(rect.left)}, y=${Math.round(rect.top)}, width=${Math.round(rect.width)}, height=${Math.round(rect.height)}`);
            
            // Story like buttons are typically:
            // - Not in the very top (navigation)
            // - Not at the very bottom (could be footer)
            // - In the main viewing area
            const screenHeight = window.innerHeight;
            const isInStoryPosition = rect.top > 50 && rect.top < (screenHeight - 50);
            
            if (!isInStoryPosition) {
                console.log(`   ⏭️ Skipping - button outside story area (top=${Math.round(rect.top)}, screenHeight=${screenHeight})`);
                continue;
            }
            
            console.log(`   Found button with aria-label: "${ariaLabel}"`);
            console.log(`   Button element:`, button);
            console.log(`   Button role: ${button.getAttribute('role')}`);
            console.log(`   Button tabindex: ${button.getAttribute('tabindex')}`);
            
            // Check if it's NOT already liked (unfilled heart has specific path)
            const svg = button.querySelector('svg');
            const path = svg ? svg.querySelector('path') : null;
            
            if (path) {
                const dAttr = path.getAttribute('d');
                console.log(`   Path data starts with: ${dAttr.substring(0, 30)}...`);
                
                // Unfilled heart path starts with "M16.792 3.904A4.989"
                // Filled/liked heart has different path (starts with different pattern)
                if (dAttr && dAttr.includes('M16.792')) {
                    // CONFIRMED UNFILLED HEART - Safe to click
                    console.log('✅ Found UNFILLED heart (NOT yet liked) - safe to click!');
                    console.log('   Clicking once...');
                    
                    // Click ONCE using direct click (most reliable)
                    button.click();
                    
                    console.log('✅ Like button clicked successfully!');
                    await wait(500);
                    return { success: true, liked: true };
                } else if (dAttr && (dAttr.includes('M34.6') || dAttr.includes('M19.5') || dAttr.includes('M34.26'))) {
                    // CONFIRMED FILLED HEART - Already liked, DO NOT CLICK
                    console.log('ℹ️ Story already liked (FILLED heart detected) - skipping to avoid unlike!');
                    console.log(`   Filled heart path: ${dAttr.substring(0, 50)}`);
                    return { success: true, liked: false, reason: 'Already liked' };
                } else {
                    // UNKNOWN PATH - Could be filled or unfilled
                    // SAFETY: Skip it to avoid accidentally unliking
                    console.log('⚠️ Unknown heart path pattern - SKIPPING for safety (to avoid unliking)');
                    console.log(`   Path: ${dAttr.substring(0, 80)}`);
                    console.log(`   If you see this often, the path might have changed. Check console.`);
                    return { success: true, liked: false, reason: 'Unknown path - skipped for safety' };
                }
            } else {
                // NO PATH FOUND - Can't determine state
                // SAFETY: Skip it to avoid accidentally unliking
                console.log('⚠️ No path found in SVG - SKIPPING for safety (to avoid unliking)');
                return { success: true, liked: false, reason: 'No path found - skipped for safety' };
            }
        }
        
        console.log('❌ Like button not found among all buttons');
        return { success: false, reason: 'Like button not found' };
    } catch (error) {
        console.error('Error clicking like button:', error);
        return { success: false, error: error.message };
    }
}

// Find and click the next button on a story
async function clickStoryNextButton() {
    try {
        console.log('➡️ Looking for next button...');
        
        // Look for the next button - it has an SVG with aria-label containing "다음" or "Next"
        const allButtons = document.querySelectorAll('div[role="button"]');
        
        console.log(`   Found ${allButtons.length} button(s), checking for next button...`);
        
        for (const button of allButtons) {
            const svg = button.querySelector('svg');
            if (!svg) continue;
            
            const ariaLabel = svg.getAttribute('aria-label');
            if (!ariaLabel) continue;
            
            // Check if it's a Next button (English or Korean)
            const isNextButton = ariaLabel === 'Next' || 
                                ariaLabel === '다음' ||
                                ariaLabel.toLowerCase().includes('next') ||
                                ariaLabel.includes('다음');
            
            if (isNextButton) {
                console.log(`✅ Found next button (aria-label: "${ariaLabel}"), clicking...`);
                button.click();
                await wait(2500); // Wait for next story to load
                console.log('✅ Next button clicked, waiting for story to load...');
                return { success: true };
            }
        }
        
        console.log('❌ Next button not found - might be at the end');
        return { success: false, reason: 'No next button (end of stories)' };
    } catch (error) {
        console.error('Error clicking next button:', error);
        return { success: false, error: error.message };
    }
}

// Check if we're at the end of stories (no more next button or back to feed)
function isAtEndOfStories() {
    try {
        console.log('🔍 Checking if at end of stories...');
        
        // CRITICAL CHECK: If URL still has /stories/, we're definitely still in story viewer
        const urlHasStories = window.location.href.includes('/stories/');
        console.log('   URL has /stories/:', urlHasStories);
        
        if (!urlHasStories) {
            console.log('✅ URL changed - back to feed');
            return true;
        }
        
        // If URL has /stories/, we're definitely in story viewer
        // Only check if there's a next button to know if we can continue
        const nextButtons = Array.from(document.querySelectorAll('svg')).filter(svg => {
            const ariaLabel = svg.getAttribute('aria-label');
            return ariaLabel === 'Next' || ariaLabel === '다음';
        });
        console.log('   Next buttons found:', nextButtons.length);
        
        const likeButtons = Array.from(document.querySelectorAll('svg')).filter(svg => {
            const ariaLabel = svg.getAttribute('aria-label');
            return ariaLabel === 'Like' || ariaLabel === '좋아요';
        });
        console.log('   Like buttons found:', likeButtons.length);
        
        // If URL has /stories/ AND we have like/next buttons, we're still viewing stories
        if (urlHasStories && (likeButtons.length > 0 || nextButtons.length > 0)) {
            console.log('ℹ️ Still in story viewer (URL + buttons confirm)');
            return false;
        }
        
        // If URL has /stories/ but NO buttons, might be loading or at end
        if (urlHasStories && likeButtons.length === 0 && nextButtons.length === 0) {
            console.log('⚠️ In /stories/ URL but no buttons - might be loading or at end');
            console.log('   Assuming still in viewer (will try to continue)');
            return false; // Be conservative - assume still in viewer
        }
        
        console.log('✅ At end of stories');
        return true;
    } catch (error) {
        console.error('Error checking if at end:', error);
        return false;
    }
}

// Close story viewer
async function closeStoryViewer() {
    try {
        console.log('❌ Closing story viewer...');
        
        // Method 1: Press Escape key
        const escapeEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true
        });
        document.dispatchEvent(escapeEvent);
        await wait(1000);
        
        // Method 2: Look for close button
        const closeButtons = document.querySelectorAll('svg[aria-label*="Close"], svg[aria-label*="close"]');
        for (const svg of closeButtons) {
            const button = svg.closest('div[role="button"], button');
            if (button) {
                button.click();
                break;
            }
        }
        
        await wait(1000);
        console.log('✅ Story viewer closed');
        return { success: true };
    } catch (error) {
        console.error('Error closing story viewer:', error);
        return { success: false, error: error.message };
    }
}

// Message handler from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    switch (request.action) {
        case 'ping':
            sendResponse({ success: true, message: 'Content script is ready' });
            break;
            
        case 'closeSleepModeDialog':
            const closed = closeSleepModeDialog();
            sendResponse({ success: true, closed: closed });
            break;
            
        case 'checkLoggedIn':
            sendResponse({ loggedIn: checkIfLoggedIn() });
            break;
            
        case 'navigateToProfile':
            navigateToProfile(request.username).then(() => {
                sendResponse({ success: true });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true; // Keep channel open for async response
            
        case 'getFollowingList':
            (async () => {
                try {
                    console.log('Opening following modal...');
                    const clicked = await clickFollowingButton();
                    if (!clicked || (clicked && clicked.shouldStop)) {
                        if (clicked && clicked.shouldStop) {
                            sendResponse({ success: false, error: clicked.reason, shouldStop: true });
                        } else {
                            sendResponse({ success: false, error: 'Could not click following button' });
                        }
                        return;
                    }
                    
                    await wait(3000);
                    
                    const modal = document.querySelector('div[role="dialog"]');
                    if (!modal) {
                        sendResponse({ success: false, error: 'Modal did not open' });
                        return;
                    }
                    
                    console.log('✓ Modal open - ready for background scrolling');
                    // Return success with modalReady flag - background will handle scrolling
                    sendResponse({ success: true, modalReady: true, needsBackgroundScroll: true });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'extractFollowingUsernames':
            (async () => {
                try {
                    const modal = document.querySelector('div[role="dialog"]');
                    if (!modal) {
                        sendResponse({ success: false, error: 'Modal not found' });
                        return;
                    }
                    
                    // For extracting YOUR following list, we want ALL usernames (no filtering)
                    // We'll filter later when getting THEIR followers
                    console.log('📋 Extracting YOUR following list (no "Following" filter needed)...');
                    const usernames = extractUsernamesSimple(modal);
                    console.log(`✓ Extracted ${usernames.length} usernames from your following list`);
                    
                    // Close modal
                    const buttons = modal.querySelectorAll('button');
                    for (const btn of buttons) {
                        if (btn.getAttribute('aria-label')?.toLowerCase().includes('close')) {
                            btn.click();
                            break;
                        }
                    }
                    
                    // Try SVG close if button didn't work
                    const svgs = modal.querySelectorAll('svg[aria-label*="Close"]');
                    if (svgs.length > 0) {
                        const parent = svgs[0].closest('button, div[role="button"]');
                        if (parent) parent.click();
                    }
                    
                    await wait(1000);
                    sendResponse({ success: true, usernames: usernames });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'getFollowersList':
            (async () => {
                try {
                    console.log('Opening followers modal...');
                    const clicked = await clickFollowersButton();
                    if (!clicked || (clicked && clicked.shouldStop)) {
                        if (clicked && clicked.shouldStop) {
                            sendResponse({ success: false, error: clicked.reason, shouldStop: true });
                        } else {
                            sendResponse({ success: false, error: 'Could not click followers button' });
                        }
                        return;
                    }
                    
                    await wait(3000);
                    
                    const modal = document.querySelector('div[role="dialog"]');
                    if (!modal) {
                        sendResponse({ success: false, error: 'Modal did not open' });
                        return;
                    }
                    
                    console.log('✓ Followers modal open - ready for background scrolling');
                    sendResponse({ success: true, modalReady: true, needsBackgroundScroll: true });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'extractFollowersUsernames':
            (async () => {
                try {
                    const modal = document.querySelector('div[role="dialog"]');
                    if (!modal) {
                        sendResponse({ success: false, error: 'Modal not found' });
                        return;
                    }
                    
                    const usernames = extractUsernames(modal);
                    console.log(`✓ Extracted ${usernames.length} usernames from followers list`);
                    
                    // Close modal
                    const buttons = modal.querySelectorAll('button');
                    for (const btn of buttons) {
                        if (btn.getAttribute('aria-label')?.toLowerCase().includes('close')) {
                            btn.click();
                            break;
                        }
                    }
                    
                    // Try SVG close if button didn't work
                    const svgs = modal.querySelectorAll('svg[aria-label*="Close"]');
                    if (svgs.length > 0) {
                        const parent = svgs[0].closest('button, div[role="button"]');
                        if (parent) parent.click();
                    }
                    
                    await wait(1000);
                    sendResponse({ success: true, usernames: usernames });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'checkProfileAndFollow':
            (async () => {
                try {
                    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('🔍 CHECKING PROFILE FOR SCHOOL MATCH');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    
                    const { bio, name } = getProfileBioAndName();
                    
                    console.log(`\n🎯 Selected Schools (${request.schools.length}):`);
                    request.schools.forEach((school, i) => {
                        console.log(`   ${i + 1}. ${school.name}`);
                        console.log(`      Abbreviations: ${school.abbreviations.join(', ')}`);
                    });
                    
                    console.log('\n🔍 Matching...');
                    const hasSchool = bioContainsSchool(bio, name, request.schools);
                    
                    if (!hasSchool) {
                        console.log('\n❌ RESULT: No school match');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                        sendResponse({ success: true, followed: false, reason: 'No school match' });
                        return;
                    }
                    
                    console.log('\n✅ School match confirmed!');
                    console.log('Checking if already following...');
                    
                    const alreadyFollowing = isAlreadyFollowing();
                    if (alreadyFollowing) {
                        console.log('⏭️ Already following this profile');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                        sendResponse({ success: true, followed: false, reason: 'Already following' });
                        return;
                    }
                    
                    console.log('✓ Not following yet - attempting to follow...');
                    const followed = await clickFollowButton();
                    
                    if (followed && followed.shouldStop) {
                        console.log('❌ Follow button check failed:', followed.reason);
                        sendResponse({ 
                            success: false, 
                            error: followed.reason,
                            shouldStop: true
                        });
                        return;
                    } else if (followed) {
                        console.log('✅ Follow button clicked!');
                    } else {
                        console.log('⚠️ Could not click follow button');
                    }
                    
                    // Check for limit popups (give them time to appear)
                    console.log('Checking for limit popups...');
                    await wait(3000); // Wait 3 seconds for popup to appear
                    
                    // First check for rate limit (Try Again Later) - 3 hour break
                    if (checkForRateLimit()) {
                        console.log('⏱️ Rate limit (Try Again Later) detected!');
                        const closed = await closeRateLimitDialog();
                        
                        if (closed) {
                            console.log('✓ Rate limit dialog closed');
                        } else {
                            console.log('⚠️ Could not close dialog');
                        }
                        
                        sendResponse({ 
                            success: false, 
                            error: 'Rate limit reached',
                            rateLimit: true,
                            needsBreak: true,
                            breakDuration: 3 * 60 * 60 * 1000 // 3 hours in milliseconds
                        });
                        return;
                    }
                    
                    // Then check for daily limit - full stop
                    if (checkForDailyLimit()) {
                        console.log('🛑 Daily limit detected! Attempting to close dialog...');
                        const closed = await closeDailyLimitDialog();
                        
                        if (closed) {
                            console.log('✓ Daily limit dialog closed');
                        } else {
                            console.log('⚠️ Could not close dialog, but continuing...');
                        }
                        
                        sendResponse({ 
                            success: false, 
                            error: 'Daily limit reached',
                            dailyLimit: true
                        });
                        return;
                    }
                    
                    console.log('✓ No limits detected, follow successful');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                    sendResponse({ success: true, followed: followed });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'followProfileNoFilter':
            (async () => {
                try {
                    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('👤 FOLLOWING PROFILE (NO FILTER)');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    
                    console.log('Checking if already following...');
                    const alreadyFollowing = isAlreadyFollowing();
                    if (alreadyFollowing) {
                        console.log('⏭️ Already following this profile');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                        sendResponse({ success: true, followed: false, reason: 'Already following' });
                        return;
                    }
                    
                    console.log('✓ Not following yet - attempting to follow...');
                    const followed = await clickFollowButton();
                    
                    if (followed && followed.shouldStop) {
                        console.log('❌ Follow button check failed:', followed.reason);
                        sendResponse({ 
                            success: false, 
                            error: followed.reason,
                            shouldStop: true
                        });
                        return;
                    } else if (followed) {
                        console.log('✅ Follow button clicked!');
                    } else {
                        console.log('⚠️ Could not click follow button');
                    }
                    
                    // Check for limit popups (give them time to appear)
                    console.log('Checking for limit popups...');
                    await wait(3000); // Wait 3 seconds for popup to appear
                    
                    // First check for rate limit (Try Again Later) - 3 hour break
                    if (checkForRateLimit()) {
                        console.log('⏱️ Rate limit (Try Again Later) detected!');
                        const closed = await closeRateLimitDialog();
                        
                        if (closed) {
                            console.log('✓ Rate limit dialog closed');
                        } else {
                            console.log('⚠️ Could not close dialog');
                        }
                        
                        sendResponse({ 
                            success: false, 
                            error: 'Rate limit reached',
                            rateLimit: true,
                            needsBreak: true,
                            breakDuration: 3 * 60 * 60 * 1000 // 3 hours in milliseconds
                        });
                        return;
                    }
                    
                    // Then check for daily limit - full stop
                    if (checkForDailyLimit()) {
                        console.log('🛑 Daily limit detected! Attempting to close dialog...');
                        const closed = await closeDailyLimitDialog();
                        
                        if (closed) {
                            console.log('✓ Daily limit dialog closed');
                        } else {
                            console.log('⚠️ Could not close dialog, but continuing...');
                        }
                        
                        sendResponse({ 
                            success: false, 
                            error: 'Daily limit reached',
                            dailyLimit: true
                        });
                        return;
                    }
                    
                    console.log('✓ No limits detected, follow successful');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                    sendResponse({ success: true, followed: followed });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'getExplorePeoples':
            getExplorePeopleProfiles().then(usernames => {
                sendResponse({ success: true, usernames: usernames });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'checkForDailyLimit':
            (async () => {
                try {
                    const limitReached = checkForDailyLimit();
                    console.log('Daily limit check result:', limitReached);
                    
                    if (limitReached) {
                        console.log('Daily limit popup is visible, attempting to close...');
                        await closeDailyLimitDialog();
                    }
                    
                    sendResponse({ limitReached: limitReached });
                } catch (error) {
                    console.error('Error checking daily limit:', error);
                    sendResponse({ limitReached: false, error: error.message });
                }
            })();
            return true;
            
        case 'checkForRateLimit':
            (async () => {
                try {
                    const rateLimit = checkForRateLimit();
                    console.log('Rate limit check result:', rateLimit);
                    
                    if (rateLimit) {
                        console.log('Rate limit popup is visible, attempting to close...');
                        await closeRateLimitDialog();
                    }
                    
                    sendResponse({ rateLimit: rateLimit });
                } catch (error) {
                    console.error('Error checking rate limit:', error);
                    sendResponse({ rateLimit: false, error: error.message });
                }
            })();
            return true;
            
        case 'clickStoryCircle':
            clickStoryCircle().then(result => {
                sendResponse(result);
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'clickStoryLikeButton':
            clickStoryLikeButton().then(result => {
                sendResponse(result);
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'clickStoryNextButton':
            clickStoryNextButton().then(result => {
                sendResponse(result);
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'isAtEndOfStories':
            sendResponse({ atEnd: isAtEndOfStories() });
            break;
            
        case 'closeStoryViewer':
            closeStoryViewer().then(result => {
                sendResponse(result);
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'clickReelsTab':
            (async () => {
                try {
                    console.log('🎬 Clicking Reels tab...');
                    // Look for the Reels tab link with aria-selected or the specific href pattern
                    const reelsLink = document.querySelector('a[href*="/reels/"]');
                    if (reelsLink) {
                        reelsLink.click();
                        await wait(3000);
                        console.log('✅ Reels tab clicked');
                        sendResponse({ success: true });
                    } else {
                        console.log('❌ Reels tab not found');
                        sendResponse({ success: false, error: 'Reels tab not found' });
                    }
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'getReelVideos':
            (async () => {
                try {
                    console.log('📹 Getting reel videos (fetching links first, no scrolling)...');
                    
                    // Find all reel video containers - look for divs with view count icons
                    const reelContainers = document.querySelectorAll('div._aajy');
                    const reelIds = [];
                    
                    reelContainers.forEach(container => {
                        // Find the parent link that contains this container
                        const link = container.closest('a[href*="/reel/"]');
                        if (link) {
                            const href = link.getAttribute('href');
                            if (href && href.includes('/reel/')) {
                                const reelId = href.split('/reel/')[1].split('/')[0].split('?')[0];
                                if (reelId && !reelIds.includes(reelId)) {
                                    reelIds.push(reelId);
                                }
                            }
                        }
                    });
                    
                    // Also try finding by direct links
                    const reelLinks = document.querySelectorAll('a[href*="/reel/"]');
                    reelLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && href.includes('/reel/')) {
                            const reelId = href.split('/reel/')[1].split('/')[0].split('?')[0];
                            if (reelId && !reelIds.includes(reelId)) {
                                reelIds.push(reelId);
                            }
                        }
                    });
                    
                    console.log(`✅ Found ${reelIds.length} reel videos`);
                    sendResponse({ success: true, reelIds: reelIds });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'clickReelVideo':
            (async () => {
                try {
                    console.log(`🎬 Clicking reel video: ${request.reelId}`);
                    // Find the reel link or container
                    const reelLink = document.querySelector(`a[href*="/reel/${request.reelId}"]`);
                    if (reelLink) {
                        reelLink.click();
                        await wait(3000);
                        console.log('✅ Reel video clicked');
                        sendResponse({ success: true });
                    } else {
                        // Try navigating directly
                        window.location.href = `https://www.instagram.com/reel/${request.reelId}/`;
                        await wait(3000);
                        console.log('✅ Navigated to reel');
                        sendResponse({ success: true });
                    }
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'likeAllComments':
            (async () => {
                try {
                    console.log('❤️ Liking all comments...');
                    let likedCount = 0;
                    let skippedCount = 0;
                    let processedButtons = new Set();
                    
                    // Function to detect and close error dialog (400 Bad Request)
                    const closeErrorDialog = async () => {
                        try {
                            // Look for dialog with the specific structure
                            const dialog = document.querySelector('div[role="dialog"]');
                            if (!dialog) {
                                return false;
                            }
                            
                            // Check if it contains the OK button with class _a9_1
                            const okButton = dialog.querySelector('button._a9_1');
                            if (okButton && okButton.textContent.trim() === 'OK') {
                                console.log('⚠️ Error dialog detected (400 Bad Request), clicking OK...');
                                okButton.click();
                                await wait(1000);
                                console.log('✅ Error dialog closed');
                                return true;
                            }
                            
                            // Alternative: Look for button with text "OK" in the dialog
                            const allButtons = dialog.querySelectorAll('button');
                            for (const button of allButtons) {
                                if (button.textContent.trim() === 'OK') {
                                    console.log('⚠️ Error dialog detected, clicking OK (alternative method)...');
                                    button.click();
                                    await wait(1000);
                                    console.log('✅ Error dialog closed');
                                    return true;
                                }
                            }
                            
                            return false;
                        } catch (error) {
                            console.error('Error closing error dialog:', error);
                            return false;
                        }
                    };
                    
                    // Function to find and click "Load more comments" button
                    const clickLoadMoreButton = async () => {
                        // Method 1: Look for button with class "_abl-"
                        const loadMoreButton1 = document.querySelector('button._abl-');
                        if (loadMoreButton1) {
                            const svg = loadMoreButton1.querySelector('svg[aria-label="Load more comments"]');
                            if (svg) {
                                console.log('✅ Found "Load more comments" button (method 1), clicking...');
                                loadMoreButton1.click();
                                await wait(2000); // Wait for comments to load
                                return true;
                            }
                        }
                        
                        // Method 2: Look for button with SVG containing "Load more comments" title
                        const allButtons = document.querySelectorAll('button');
                        for (const button of allButtons) {
                            const svg = button.querySelector('svg[aria-label="Load more comments"]');
                            if (svg) {
                                console.log('✅ Found "Load more comments" button (method 2), clicking...');
                                button.click();
                                await wait(2000);
                                return true;
                            }
                            
                            // Also check by title
                            const svgTitle = button.querySelector('svg title');
                            if (svgTitle && svgTitle.textContent === 'Load more comments') {
                                console.log('✅ Found "Load more comments" button (method 3 - by title), clicking...');
                                button.click();
                                await wait(2000);
                                return true;
                            }
                        }
                        
                        console.log('ℹ️ "Load more comments" button not found');
                        return false;
                    };
                    
                    // Function to like comments in current view
                    const likeCommentsInView = () => {
                        // Find all like buttons - look for heart SVG icons
                        const allSvgs = document.querySelectorAll('svg');
                        const likeButtons = [];
                        
                        for (const svg of allSvgs) {
                            const ariaLabel = svg.getAttribute('aria-label');
                            const path = svg.querySelector('path');
                            
                            if (path) {
                                const dAttr = path.getAttribute('d');
                                // Check if it's an unfilled heart (not already liked)
                                // Unfilled heart path contains "M16.792"
                                if (dAttr && dAttr.includes('M16.792')) {
                                    const button = svg.closest('button, div[role="button"]');
                                    if (button) {
                                        const buttonId = button.getBoundingClientRect().top + ',' + button.getBoundingClientRect().left;
                                        if (!processedButtons.has(buttonId)) {
                                            likeButtons.push(button);
                                            processedButtons.add(buttonId);
                                        }
                                    }
                                }
                            }
                        }
                        
                        return likeButtons;
                    };
                    
                    // First, like all visible comments
                    let likeButtons = likeCommentsInView();
                    console.log(`🔍 Found ${likeButtons.length} like buttons in initial view`);
                    
                    for (const button of likeButtons) {
                        button.click();
                        likedCount++;
                        await wait(300); // Small delay between likes
                        
                        // Check for error dialog after each like
                        await closeErrorDialog();
                    }
                    
                    console.log(`✅ Liked ${likedCount} comments in initial view`);
                    
                    // Priority: Use "Load more comments" button first (it actually loads content)
                    if (likedCount > 0) {
                        console.log('✅ Liked all visible comments, using "Load more comments" button to find more...');
                        
                        let loadMoreAttempts = 0;
                        const maxLoadMoreAttempts = 50; // Allow many attempts since button actually works
                        let noNewLikesCount = 0;
                        
                        while (loadMoreAttempts < maxLoadMoreAttempts && noNewLikesCount < 3) {
                            loadMoreAttempts++;
                            console.log(`\n🔄 Load more comments attempt ${loadMoreAttempts}/${maxLoadMoreAttempts}...`);
                            
                            // Try clicking "Load more comments" button
                            const clickedLoadMore = await clickLoadMoreButton();
                            
                            if (clickedLoadMore) {
                                // Wait for new comments to load
                                await wait(3000); // Give it more time to load
                                
                                // Check for error dialog before processing new comments
                                await closeErrorDialog();
                                
                                // Like new comments that appeared
                                const beforeLiked = likedCount;
                                likeButtons = likeCommentsInView();
                                console.log(`🔍 Found ${likeButtons.length} like buttons after clicking "Load more comments"`);
                                
                                for (const button of likeButtons) {
                                    button.click();
                                    likedCount++;
                                    await wait(300);
                                    
                                    // Check for error dialog after each like
                                    await closeErrorDialog();
                                }
                                
                                if (likedCount > beforeLiked) {
                                    console.log(`✅ Liked ${likedCount - beforeLiked} new comments (${likedCount} total)`);
                                    noNewLikesCount = 0; // Reset counter - we found new likes
                                } else {
                                    noNewLikesCount++;
                                    console.log(`⚠️ No new likes found after button click (${noNewLikesCount}/3)`);
                                    if (noNewLikesCount >= 3) {
                                        console.log('ℹ️ No more comments to load via button');
                                        break;
                                    }
                                }
                            } else {
                                // Button not found - might be at the end
                                console.log('ℹ️ "Load more comments" button not found');
                                noNewLikesCount++;
                                if (noNewLikesCount >= 3) {
                                    console.log('ℹ️ No more "Load more comments" buttons found, finished');
                                    break;
                                }
                            }
                        }
                        
                        console.log(`✅ Finished using "Load more comments" button: ${loadMoreAttempts} attempts, ${likedCount} total likes`);
                    } else {
                        console.log('ℹ️ No likes found in initial view - no comments to like or all already liked');
                    }
                    
                    console.log(`✅ Liked ${likedCount} comments, skipped ${skippedCount} (already liked)`);
                    sendResponse({ success: true, likedCount: likedCount, skippedCount: skippedCount });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        case 'closeReelViewer':
            (async () => {
                try {
                    console.log('❌ Closing reel viewer...');
                    // Press Escape to close
                    const escapeEvent = new KeyboardEvent('keydown', {
                        key: 'Escape',
                        code: 'Escape',
                        keyCode: 27,
                        which: 27,
                        bubbles: true
                    });
                    document.dispatchEvent(escapeEvent);
                    await wait(2000);
                    console.log('✅ Reel viewer closed');
                    sendResponse({ success: true });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
            })();
            return true;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});


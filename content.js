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

// NOTE: scrollToBottomOfModal() function removed
// All scrolling is now done by background script using chrome.scripting.executeScript()
// This bypasses Chrome's throttling of inactive tabs

// Extract usernames from a list
function extractUsernames(container) {
    const usernames = new Set();
    const links = container.querySelectorAll('a[href^="/"]');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.includes('/p/') && !href.includes('/reel/')) {
            const username = href.split('/')[1];
            if (username && username.length > 0) {
                usernames.add(username);
            }
        }
    });
    
    return Array.from(usernames);
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
        
        // Get the username/name from header
        const headers = document.querySelectorAll('h1, h2, span[dir="auto"]');
        headers.forEach(header => {
            nameText += ' ' + header.textContent;
        });
        
        // Get bio from main section - Instagram usually puts bio in specific elements
        const mainSection = document.querySelector('main');
        if (mainSection) {
            // Get all text from main section
            const allSpans = mainSection.querySelectorAll('span, div, h1, h2');
            allSpans.forEach(elem => {
                bioText += ' ' + elem.textContent;
            });
        }
        
        // Also check for specific bio container patterns
        const bioContainers = document.querySelectorAll('[class*="bio"], [class*="description"]');
        bioContainers.forEach(container => {
            bioText += ' ' + container.textContent;
        });
        
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

// Check if bio contains school abbreviation (improved matching)
function bioContainsSchool(bio, name, schools) {
    const combinedText = ` ${bio} ${name} `.toLowerCase();
    
    console.log('🔍 Checking for school matches...');
    
    for (const school of schools) {
        for (const abbr of school.abbreviations) {
            if (!abbr) continue;
            
            const abbrLower = abbr.toLowerCase().trim();
            if (!abbrLower) continue;
            
            // Method 1: Exact word boundary match (for abbreviations like "hw", "stuy")
            const wordBoundaryRegex = new RegExp(`\\b${abbrLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (wordBoundaryRegex.test(combinedText)) {
                console.log(`✅ MATCH FOUND: "${abbrLower}" in profile (word boundary)`);
                console.log(`   School: ${school.name}`);
                return true;
            }
            
            // Method 2: Direct includes for multi-word abbreviations (e.g., "harvard-westlake")
            if (abbrLower.includes(' ') || abbrLower.includes('-')) {
                if (combinedText.includes(abbrLower)) {
                    console.log(`✅ MATCH FOUND: "${abbrLower}" in profile (multi-word)`);
                    console.log(`   School: ${school.name}`);
                    return true;
                }
            }
            
            // Method 3: Check with common separators (e.g., "hw'25", "stuy|senior")
            const patterns = [
                ` ${abbrLower} `,
                ` ${abbrLower}'`,
                ` ${abbrLower}"`,
                `|${abbrLower}`,
                `•${abbrLower}`,
                `${abbrLower}|`,
                `${abbrLower}•`,
                `${abbrLower}'`,
                `${abbrLower}"`,
                `(${abbrLower}`,
                `${abbrLower})`
            ];
            
            for (const pattern of patterns) {
                if (combinedText.includes(pattern)) {
                    console.log(`✅ MATCH FOUND: "${abbrLower}" with separator in profile`);
                    console.log(`   School: ${school.name}`);
                    return true;
                }
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

// Close daily limit dialog
async function closeDailyLimitDialog() {
    try {
        console.log('Attempting to close daily limit dialog...');
        
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
                    await wait(1000);
                    return true;
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
                await wait(1000);
                return true;
            }
        }
        
        // Method 3: Look for any button with close aria-label
        const allButtons = document.querySelectorAll('button, div[role="button"]');
        for (const button of allButtons) {
            const ariaLabel = button.getAttribute('aria-label')?.toLowerCase();
            if (ariaLabel && ariaLabel.includes('close')) {
                console.log('Clicking close button (aria-label)');
                button.click();
                await wait(1000);
                return true;
            }
        }
        
        // Method 4: Press Escape key as fallback
        console.log('Close button not found, pressing Escape key');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
        await wait(1000);
        
        return false;
    } catch (error) {
        console.error('Error closing daily limit dialog:', error);
        return false;
    }
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

// Message handler from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    switch (request.action) {
        case 'ping':
            sendResponse({ success: true, message: 'Content script is ready' });
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
                    if (!clicked) {
                        sendResponse({ success: false, error: 'Could not click following button' });
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
                    
                    const usernames = extractUsernames(modal);
                    console.log(`✓ Extracted ${usernames.length} usernames from following list`);
                    
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
                    if (!clicked) {
                        sendResponse({ success: false, error: 'Could not click followers button' });
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
                    
                    if (followed) {
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
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});


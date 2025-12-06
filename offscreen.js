// Offscreen document for background operations
console.log('📄 Offscreen document loaded - enables background tab operations');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Offscreen received message:', message.action);
    
    if (message.action === 'keepTabActive') {
        console.log('✓ Offscreen document is keeping bot tab active');
        sendResponse({ success: true });
    }
    
    return true;
});

// Keep this document alive to prevent throttling of the main Instagram tab
setInterval(() => {
    // Tiny operation to keep offscreen document "active"
    // This prevents Chrome from throttling the service worker
    const timestamp = Date.now();
}, 1000);

console.log('✓ Offscreen document running - background tab operations enabled');







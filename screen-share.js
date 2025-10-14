// Screen sharing page script
console.log('📺 Screen sharing page loaded');

const shareBtn = document.getElementById('shareBtn');
const statusDiv = document.getElementById('status');
const warningBox = document.getElementById('warningBox');

let mediaStream = null;

// Show status message
function showStatus(message, type = 'active') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
}

// Start screen sharing
shareBtn.addEventListener('click', async () => {
    console.log('🎥 User clicked Start Screen Sharing');
    
    try {
        shareBtn.disabled = true;
        showStatus('Opening screen sharing dialog...', 'active');
        
        console.log('');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║  🎥 REQUESTING SCREEN SHARING                             ║');
        console.log('║                                                           ║');
        console.log('║  Chrome dialog will appear. Please:                       ║');
        console.log('║  1. Select "Window"                                       ║');
        console.log('║  2. Choose the Instagram bot window                       ║');
        console.log('║  3. Click "Share"                                         ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
        
        // Request screen sharing
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });
        
        console.log('✅ Screen sharing stream obtained!');
        
        const videoTrack = mediaStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        const surfaceType = settings.displaySurface || 'unknown';
        
        console.log(`   Surface: ${surfaceType}`);
        console.log(`   Resolution: ${settings.width}x${settings.height}`);
        
        // Create hidden video element to keep stream alive
        let video = document.getElementById('__botScreenShare');
        if (!video) {
            video = document.createElement('video');
            video.id = '__botScreenShare';
            video.autoplay = true;
            video.muted = true;
            video.style.display = 'none';
            video.style.position = 'fixed';
            video.style.top = '-9999px';
            video.style.left = '-9999px';
            video.style.width = '1px';
            video.style.height = '1px';
            video.srcObject = mediaStream;
            document.body.appendChild(video);
            console.log('✓ Hidden video element created');
        } else {
            video.srcObject = mediaStream;
        }
        
        // Monitor if sharing stops
        videoTrack.addEventListener('ended', () => {
            console.log('⚠️ Screen sharing stopped!');
            showStatus('⚠️ Screen sharing stopped. Click button to restart.', 'error');
            shareBtn.disabled = false;
            warningBox.style.display = 'none';
            mediaStream = null;
            
            // Remove video element
            const vid = document.getElementById('__botScreenShare');
            if (vid) vid.remove();
            
            // Notify extension
            chrome.runtime.sendMessage({
                action: 'screenSharingStopped'
            }).catch(() => {});
        });
        
        // Keep-alive: constantly access the stream
        if (window.__shareKeepAlive) {
            clearInterval(window.__shareKeepAlive);
        }
        
        window.__shareKeepAlive = setInterval(() => {
            if (mediaStream) {
                const tracks = mediaStream.getVideoTracks();
                if (tracks.length > 0 && tracks[0].readyState === 'live') {
                    // Stream is healthy
                } else {
                    console.log('⚠️ Stream not live');
                }
            }
        }, 3000);
        
        console.log('✓ Stream keep-alive started (checks every 3s)');
        console.log('');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║  🎉 SCREEN SHARING ACTIVE!                                ║');
        console.log('║                                                           ║');
        console.log(`║  Surface: ${surfaceType.toUpperCase().padEnd(46)}║`);
        console.log(`║  Resolution: ${settings.width}x${settings.height}`.padEnd(62) + '║');
        console.log('║                                                           ║');
        console.log('║  The bot window will NOT be throttled!                    ║');
        console.log('║  You can switch tabs, minimize bot window, etc.           ║');
        console.log('║                                                           ║');
        console.log('║  ⚠️  Keep THIS tab open to maintain sharing!              ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
        
        // Update UI
        showStatus(`✅ Screen sharing active! (${surfaceType} at ${settings.width}x${settings.height})`, 'success');
        warningBox.style.display = 'block';
        
        // Notify extension that sharing is active
        chrome.runtime.sendMessage({
            action: 'screenSharingEnabled',
            surface: surfaceType,
            resolution: `${settings.width}x${settings.height}`
        }).catch(() => {});
        
    } catch (error) {
        console.error('❌ Screen sharing failed:', error);
        
        shareBtn.disabled = false;
        
        if (error.name === 'NotAllowedError') {
            showStatus('Screen sharing cancelled. Bot will use fallback mode.', 'error');
        } else if (error.name === 'NotSupportedError') {
            showStatus('Screen sharing not supported in this browser.', 'error');
        } else {
            showStatus(`Error: ${error.message}`, 'error');
        }
    }
});

// Prevent accidental tab close
window.addEventListener('beforeunload', (e) => {
    if (mediaStream && mediaStream.active) {
        e.preventDefault();
        e.returnValue = '';
        return 'Screen sharing is active. Are you sure you want to close this tab?';
    }
});

console.log('✅ Screen sharing page ready');


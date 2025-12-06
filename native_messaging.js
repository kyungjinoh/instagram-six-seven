/**
 * Native Messaging Handler for Instagram Bot
 * Provides persistent background operation independent of Chrome's service worker lifecycle
 */

class NativeMessagingHandler {
    constructor() {
        this.port = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.keepAliveInterval = null;
        this.nativeHostAvailable = false;
        
        this.init();
    }
    
    init() {
        console.log('🔌 Initializing Native Messaging Handler...');
        this.connectToNativeHost();
        this.setupKeepAlive();
    }
    
    connectToNativeHost() {
        try {
            console.log('📡 Attempting to connect to native host...');
            console.log('🔍 Extension ID:', chrome.runtime.id);
            
            this.port = chrome.runtime.connectNative('com.instagrambot.host');
            
            this.port.onMessage.addListener((message) => {
                this.handleNativeMessage(message);
            });
            
            this.port.onDisconnect.addListener(() => {
                console.log('⚠️ Native host disconnected');
                this.connected = false;
                this.nativeHostAvailable = false;
                this.attemptReconnect();
            });
            
            this.connected = true;
            this.nativeHostAvailable = true;
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000;
            
            console.log('✅ Connected to native host successfully');
            
            // Send initial status
            this.sendToNativeHost({
                type: 'get_status'
            });
            
        } catch (error) {
            console.log('❌ Failed to connect to native host:', error.message);
            console.log('🔍 Full error:', error);
            this.connected = false;
            this.nativeHostAvailable = false;
            
            if (error.message.includes('Specified native messaging host not found')) {
                console.log('💡 Native host not installed. Run install_native_host.py first.');
            } else if (error.message.includes('Access to the specified native messaging host is forbidden')) {
                console.log('💡 Extension ID mismatch. Check the manifest file.');
            } else {
                console.log('💡 Unknown error. Check native host installation.');
            }
            
            this.attemptReconnect();
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Max reconnection attempts reached. Native host unavailable.');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`🔄 Attempting to reconnect to native host (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        setTimeout(() => {
            this.connectToNativeHost();
            this.reconnectDelay *= 2; // Exponential backoff
        }, this.reconnectDelay);
    }
    
    handleNativeMessage(message) {
        console.log('📨 Received from native host:', message);
        
        switch (message.type) {
            case 'native_host_ready':
                console.log('🎉 Native host is ready and running');
                this.nativeHostAvailable = true;
                break;
                
            case 'keep_alive':
                // Native host is alive and well
                console.log('💓 Native host keep-alive received');
                break;
                
            case 'bot_started':
                console.log('✅ Bot started via native host');
                break;
                
            case 'bot_stopped':
                console.log('🛑 Bot stopped via native host');
                break;
                
            case 'screen_sharing_confirmed':
                console.log('🎥 Screen sharing status confirmed by native host');
                break;
                
            case 'status_response':
                console.log('📊 Native host status:', message.bot_state);
                break;
                
            case 'pong':
                console.log('🏓 Native host pong received');
                break;
                
            case 'error':
                console.error('❌ Native host error:', message.message);
                break;
                
            default:
                console.log('❓ Unknown message type from native host:', message.type);
        }
    }
    
    sendToNativeHost(message) {
        if (!this.connected || !this.port) {
            console.log('⚠️ Cannot send message: not connected to native host');
            return false;
        }
        
        try {
            this.port.postMessage(message);
            console.log('📤 Sent to native host:', message);
            return true;
        } catch (error) {
            console.error('❌ Failed to send message to native host:', error);
            this.connected = false;
            return false;
        }
    }
    
    setupKeepAlive() {
        // Send ping to native host every 60 seconds
        this.keepAliveInterval = setInterval(() => {
            if (this.connected) {
                this.sendToNativeHost({
                    type: 'ping',
                    timestamp: new Date().toISOString()
                });
            }
        }, 60000);
    }
    
    // Public methods for bot integration
    startBot(tabId) {
        return this.sendToNativeHost({
            type: 'start_bot',
            tab_id: tabId,
            timestamp: new Date().toISOString()
        });
    }
    
    stopBot() {
        return this.sendToNativeHost({
            type: 'stop_bot',
            timestamp: new Date().toISOString()
        });
    }
    
    notifyScreenSharingStarted() {
        return this.sendToNativeHost({
            type: 'screen_sharing_started',
            timestamp: new Date().toISOString()
        });
    }
    
    notifyScreenSharingStopped() {
        return this.sendToNativeHost({
            type: 'screen_sharing_stopped',
            timestamp: new Date().toISOString()
        });
    }
    
    getStatus() {
        return this.sendToNativeHost({
            type: 'get_status'
        });
    }
    
    isAvailable() {
        return this.nativeHostAvailable && this.connected;
    }
    
    // Force a connection attempt
    forceConnect() {
        console.log('🔄 Force connecting to native host...');
        this.connectToNativeHost();
    }
    
    destroy() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }
        
        if (this.port) {
            this.port.disconnect();
        }
        
        this.connected = false;
        this.nativeHostAvailable = false;
    }
}

// Create global instance
console.log('🔌 Creating NativeMessagingHandler instance...');
const nativeMessaging = new NativeMessagingHandler();
console.log('✅ NativeMessagingHandler instance created');

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NativeMessagingHandler;
}

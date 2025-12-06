#!/usr/bin/env python3
"""
Native Messaging Host for Instagram Bot
Provides persistent background operation independent of Chrome's service worker lifecycle
"""

import sys
import json
import struct
import time
import threading
import subprocess
import os
from datetime import datetime

class InstagramBotNativeHost:
    def __init__(self):
        self.running = False
        self.bot_state = {
            'active': False,
            'last_activity': None,
            'screen_sharing_active': False,
            'bot_tab_id': None
        }
        self.keep_alive_thread = None
        
    def read_message(self):
        """Read a message from Chrome extension"""
        try:
            # Read message length (first 4 bytes)
            raw_length = sys.stdin.buffer.read(4)
            if len(raw_length) < 4:
                return None
            
            # Unpack message length
            message_length = struct.unpack('@I', raw_length)[0]
            
            # Read the actual message
            message = sys.stdin.buffer.read(message_length)
            if len(message) < message_length:
                return None
                
            message_data = json.loads(message.decode('utf-8'))
            print(f"📨 Received message: {message_data}", file=sys.stderr)
            return message_data
        except Exception as e:
            print(f"Error reading message: {e}", file=sys.stderr)
            return None
    
    def send_message(self, message):
        """Send a message to Chrome extension"""
        try:
            encoded_message = json.dumps(message).encode('utf-8')
            message_length = len(encoded_message)
            
            # Send message length (4 bytes)
            sys.stdout.buffer.write(struct.pack('@I', message_length))
            # Send actual message
            sys.stdout.buffer.write(encoded_message)
            sys.stdout.flush()
        except Exception as e:
            print(f"Error sending message: {e}", file=sys.stderr)
    
    def keep_alive_worker(self):
        """Background thread to maintain activity and prevent Chrome throttling"""
        while self.running:
            try:
                # Update last activity timestamp
                self.bot_state['last_activity'] = datetime.now().isoformat()
                
                # Only send keep-alive if we have an active connection
                # This prevents interference with initial connection
                if hasattr(self, '_connection_established') and self._connection_established:
                    self.send_message({
                        'type': 'keep_alive',
                        'timestamp': self.bot_state['last_activity'],
                        'bot_state': self.bot_state
                    })
                
                # Sleep for 30 seconds
                time.sleep(30)
                
            except Exception as e:
                print(f"Keep-alive error: {e}", file=sys.stderr)
                time.sleep(5)  # Shorter sleep on error
    
    def handle_message(self, message):
        """Handle incoming messages from Chrome extension"""
        try:
            msg_type = message.get('type', '')
            
            if msg_type == 'start_bot':
                self.bot_state['active'] = True
                self.bot_state['bot_tab_id'] = message.get('tab_id')
                self.send_message({
                    'type': 'bot_started',
                    'success': True,
                    'message': 'Bot started via native host'
                })
                
            elif msg_type == 'stop_bot':
                self.bot_state['active'] = False
                self.bot_state['bot_tab_id'] = None
                self.send_message({
                    'type': 'bot_stopped',
                    'success': True,
                    'message': 'Bot stopped via native host'
                })
                
            elif msg_type == 'screen_sharing_started':
                self.bot_state['screen_sharing_active'] = True
                self.send_message({
                    'type': 'screen_sharing_confirmed',
                    'success': True,
                    'message': 'Screen sharing status updated'
                })
                
            elif msg_type == 'screen_sharing_stopped':
                self.bot_state['screen_sharing_active'] = False
                self.send_message({
                    'type': 'screen_sharing_stopped',
                    'success': True,
                    'message': 'Screen sharing status updated'
                })
                
            elif msg_type == 'get_status':
                self.send_message({
                    'type': 'status_response',
                    'bot_state': self.bot_state,
                    'native_host_running': True,
                    'uptime': time.time() - self.start_time
                })
                
            elif msg_type == 'ping':
                # Mark connection as established
                self._connection_established = True
                self.send_message({
                    'type': 'pong',
                    'timestamp': datetime.now().isoformat(),
                    'native_host': 'Instagram Bot Native Host v1.0'
                })
                
            else:
                self.send_message({
                    'type': 'error',
                    'message': f'Unknown message type: {msg_type}'
                })
                
        except Exception as e:
            self.send_message({
                'type': 'error',
                'message': f'Error handling message: {str(e)}'
            })
    
    def run(self):
        """Main loop - runs indefinitely"""
        self.running = True
        self.start_time = time.time()
        
        print("🚀 Instagram Bot Native Host started", file=sys.stderr)
        print("📡 Listening for messages from Chrome extension...", file=sys.stderr)
        
        # Start keep-alive thread
        self.keep_alive_thread = threading.Thread(target=self.keep_alive_worker, daemon=True)
        self.keep_alive_thread.start()
        
        # Send initial status
        self.send_message({
            'type': 'native_host_ready',
            'message': 'Native host is running and ready',
            'timestamp': datetime.now().isoformat()
        })
        
        # Mark connection as established after initial message
        self._connection_established = True
        
        try:
            while self.running:
                message = self.read_message()
                if message:
                    print(f"🔧 Processing message: {message.get('type', 'unknown')}", file=sys.stderr)
                    self.handle_message(message)
                else:
                    # No message received, continue loop
                    time.sleep(0.1)
                    
        except KeyboardInterrupt:
            print("🛑 Native host shutting down...", file=sys.stderr)
        except Exception as e:
            print(f"💥 Fatal error: {e}", file=sys.stderr)
        finally:
            self.running = False
            print("✅ Native host stopped", file=sys.stderr)

if __name__ == "__main__":
    host = InstagramBotNativeHost()
    host.run()

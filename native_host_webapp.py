#!/usr/bin/env python3
"""
Web App for Native Messaging Host Management
Provides a web interface to control the native messaging host
"""

import json
import sys
import struct
import time
import threading
import subprocess
import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
import signal

app = Flask(__name__)
app.config['SECRET_KEY'] = 'instagram_bot_native_host_2024'
socketio = SocketIO(app, cors_allowed_origins="*")

class NativeHostManager:
    def __init__(self):
        self.native_host_process = None
        self.is_running = False
        self.connection_status = "disconnected"
        self.bot_state = {
            "active": False,
            "last_activity": None,
            "screen_sharing_active": False,
            "bot_tab_id": None
        }
        self.start_time = time.time()
        self.keep_alive_thread = None
        self.keep_alive_running = False
        
    def start_native_host(self):
        """Start the native messaging host process"""
        if self.is_running:
            return {"success": False, "message": "Native host is already running"}
            
        try:
            # Get the directory where this script is located
            script_dir = os.path.dirname(os.path.abspath(__file__))
            native_host_path = os.path.join(script_dir, "native_host.py")
            
            if not os.path.exists(native_host_path):
                return {"success": False, "message": "Native host script not found"}
            
            print(f"🚀 Starting native host from: {native_host_path}")
            
            # Start the native host process
            self.native_host_process = subprocess.Popen(
                ['python3', native_host_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=script_dir
            )
            
            self.is_running = True
            self.connection_status = "starting"
            
            # Start keep-alive thread
            self.keep_alive_running = True
            self.keep_alive_thread = threading.Thread(target=self._keep_alive_worker)
            self.keep_alive_thread.daemon = True
            self.keep_alive_thread.start()
            
            # Emit status update
            socketio.emit('status_update', {
                'status': 'starting',
                'message': 'Native host is starting...',
                'timestamp': datetime.now().isoformat()
            })
            
            return {"success": True, "message": "Native host started successfully"}
            
        except Exception as e:
            self.is_running = False
            self.connection_status = "error"
            return {"success": False, "message": f"Failed to start native host: {str(e)}"}
    
    def stop_native_host(self):
        """Stop the native messaging host process"""
        if not self.is_running:
            return {"success": False, "message": "Native host is not running"}
            
        try:
            # Stop keep-alive thread
            self.keep_alive_running = False
            if self.keep_alive_thread:
                self.keep_alive_thread.join(timeout=2)
            
            # Terminate the process
            if self.native_host_process:
                self.native_host_process.terminate()
                self.native_host_process.wait(timeout=5)
                self.native_host_process = None
            
            self.is_running = False
            self.connection_status = "disconnected"
            
            # Emit status update
            socketio.emit('status_update', {
                'status': 'disconnected',
                'message': 'Native host stopped',
                'timestamp': datetime.now().isoformat()
            })
            
            return {"success": True, "message": "Native host stopped successfully"}
            
        except Exception as e:
            return {"success": False, "message": f"Failed to stop native host: {str(e)}"}
    
    def get_status(self):
        """Get current status of the native host"""
        uptime = time.time() - self.start_time if self.is_running else 0
        
        return {
            "success": True,
            "status": self.connection_status,
            "is_running": self.is_running,
            "bot_state": self.bot_state,
            "uptime": uptime,
            "timestamp": datetime.now().isoformat()
        }
    
    def _keep_alive_worker(self):
        """Keep-alive worker thread"""
        while self.keep_alive_running and self.is_running:
            try:
                # Check if process is still running
                if self.native_host_process and self.native_host_process.poll() is None:
                    self.connection_status = "connected"
                    self.bot_state["last_activity"] = datetime.now().isoformat()
                    
                    # Emit keep-alive status
                    socketio.emit('keep_alive', {
                        'status': 'connected',
                        'bot_state': self.bot_state,
                        'timestamp': datetime.now().isoformat()
                    })
                else:
                    self.connection_status = "disconnected"
                    self.is_running = False
                    
                    # Emit disconnection status
                    socketio.emit('status_update', {
                        'status': 'disconnected',
                        'message': 'Native host process stopped',
                        'timestamp': datetime.now().isoformat()
                    })
                    break
                    
                time.sleep(5)  # Check every 5 seconds
                
            except Exception as e:
                print(f"Keep-alive error: {e}")
                time.sleep(5)

# Global instance
native_manager = NativeHostManager()

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/start', methods=['POST'])
def start_native_host():
    """Start the native host"""
    result = native_manager.start_native_host()
    return jsonify(result)

@app.route('/api/stop', methods=['POST'])
def stop_native_host():
    """Stop the native host"""
    result = native_manager.stop_native_host()
    return jsonify(result)

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get native host status"""
    result = native_manager.get_status()
    return jsonify(result)

@app.route('/api/restart', methods=['POST'])
def restart_native_host():
    """Restart the native host"""
    # Stop first
    stop_result = native_manager.stop_native_host()
    if not stop_result['success']:
        return jsonify(stop_result)
    
    # Wait a moment
    time.sleep(1)
    
    # Start again
    start_result = native_manager.start_native_host()
    return jsonify(start_result)

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    emit('status_update', {
        'status': native_manager.connection_status,
        'message': f'Native host is {native_manager.connection_status}',
        'timestamp': datetime.now().isoformat()
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    print('\n🛑 Shutting down web app...')
    native_manager.stop_native_host()
    sys.exit(0)

if __name__ == '__main__':
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print('🌐 Starting Native Host Web App...')
    print('📱 Open http://localhost:5000 in your browser')
    print('🛑 Press Ctrl+C to stop')
    
    # Start the web app
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)



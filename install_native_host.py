#!/usr/bin/env python3
"""
Install Native Messaging Host for Instagram Bot
This script installs the native host on macOS/Linux systems
"""

import os
import sys
import json
import shutil
import subprocess
from pathlib import Path

def get_chrome_native_messaging_path():
    """Get the Chrome Native Messaging hosts directory"""
    home = Path.home()
    
    # Try different Chrome data directories
    possible_paths = [
        home / ".config" / "google-chrome" / "NativeMessagingHosts",
        home / ".config" / "chromium" / "NativeMessagingHosts",
        home / "Library" / "Application Support" / "Google" / "Chrome" / "NativeMessagingHosts",
        home / "Library" / "Application Support" / "Chromium" / "NativeMessagingHosts"
    ]
    
    for path in possible_paths:
        if path.exists():
            return path
    
    # If none exist, create the standard one
    default_path = home / ".config" / "google-chrome" / "NativeMessagingHosts"
    default_path.mkdir(parents=True, exist_ok=True)
    return default_path

def get_extension_id():
    """Get the extension ID from Chrome"""
    try:
        # Try to get extension ID from Chrome
        result = subprocess.run([
            'osascript', '-e',
            'tell application "Google Chrome" to get id of extension "Instagram School-Based Follower Bot"'
        ], capture_output=True, text=True)
        
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except:
        pass
    
    # Fallback: prompt user
    print("🔍 Could not automatically detect extension ID.")
    print("📋 To find your extension ID:")
    print("   1. Go to chrome://extensions/")
    print("   2. Enable 'Developer mode'")
    print("   3. Find 'Instagram School-Based Follower Bot'")
    print("   4. Copy the ID (long string of letters)")
    print()
    
    extension_id = input("Enter your extension ID: ").strip()
    if not extension_id:
        print("❌ Extension ID is required")
        sys.exit(1)
    
    return extension_id

def install_native_host():
    """Install the native messaging host"""
    print("🚀 Installing Instagram Bot Native Host...")
    
    # Get current directory
    current_dir = Path(__file__).parent.absolute()
    native_host_script = current_dir / "native_host.py"
    manifest_template = current_dir / "com.instagrambot.host.json"
    
    # Check if files exist
    if not native_host_script.exists():
        print(f"❌ Native host script not found: {native_host_script}")
        sys.exit(1)
    
    if not manifest_template.exists():
        print(f"❌ Manifest template not found: {manifest_template}")
        sys.exit(1)
    
    # Get extension ID
    extension_id = get_extension_id()
    print(f"✅ Extension ID: {extension_id}")
    
    # Get Chrome Native Messaging directory
    nm_path = get_chrome_native_messaging_path()
    print(f"📁 Native Messaging path: {nm_path}")
    
    # Create manifest with correct extension ID
    manifest_content = {
        "name": "com.instagrambot.host",
        "description": "Instagram Bot Native Host - Provides persistent background operation",
        "path": str(native_host_script),
        "type": "stdio",
        "allowed_origins": [
            f"chrome-extension://{extension_id}/"
        ]
    }
    
    # Write manifest to Native Messaging directory
    manifest_path = nm_path / "com.instagrambot.host.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest_content, f, indent=2)
    
    print(f"✅ Manifest installed: {manifest_path}")
    
    # Make native host script executable
    os.chmod(native_host_script, 0o755)
    print(f"✅ Native host script made executable: {native_host_script}")
    
    print()
    print("🎉 Native Host installation complete!")
    print()
    print("📋 Next steps:")
    print("   1. Reload your Chrome extension")
    print("   2. The extension will now use the native host for persistent operation")
    print("   3. No more Chrome throttling or service worker limitations!")
    print()
    print("🔧 To uninstall:")
    print(f"   rm {manifest_path}")

if __name__ == "__main__":
    try:
        install_native_host()
    except KeyboardInterrupt:
        print("\n❌ Installation cancelled")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Installation failed: {e}")
        sys.exit(1)



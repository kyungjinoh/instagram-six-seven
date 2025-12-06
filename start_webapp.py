#!/usr/bin/env python3
"""
Startup script for the Native Host Web App
Installs dependencies and starts the web server
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements_webapp.txt'
        ])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_webapp():
    """Start the web app"""
    print("🚀 Starting Native Host Web App...")
    try:
        subprocess.run([sys.executable, 'native_host_webapp.py'])
    except KeyboardInterrupt:
        print("\n🛑 Web app stopped by user")
    except Exception as e:
        print(f"❌ Error starting web app: {e}")

if __name__ == "__main__":
    print("🌐 Instagram Bot Native Host Web App")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('native_host_webapp.py'):
        print("❌ Error: native_host_webapp.py not found")
        print("Please run this script from the Instagram Bot directory")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies. Exiting.")
        sys.exit(1)
    
    # Start the web app
    start_webapp()



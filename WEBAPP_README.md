# 🌐 Instagram Bot Native Host Web App

A beautiful web interface to manage the Instagram Bot's native messaging host without relying on the terminal.

## 🚀 Features

- **🎨 Beautiful Web Interface**: Modern, responsive design with real-time updates
- **🔄 Real-time Status**: Live connection status and bot state monitoring
- **📊 Status Dashboard**: Detailed information about bot activity and uptime
- **📝 Activity Logs**: Real-time logging of all native host activities
- **🎮 Easy Controls**: Start, stop, and restart the native host with one click
- **🔌 WebSocket Connection**: Real-time communication with the native host
- **📱 Mobile Friendly**: Responsive design that works on all devices

## 🛠️ Installation

### Option 1: Quick Start (Recommended)
```bash
python3 start_webapp.py
```

This will automatically install dependencies and start the web app.

### Option 2: Manual Installation
```bash
# Install dependencies
pip3 install -r requirements_webapp.txt

# Start the web app
python3 native_host_webapp.py
```

## 🌐 Usage

1. **Start the Web App**:
   ```bash
   python3 start_webapp.py
   ```

2. **Open in Browser**:
   - Go to `http://localhost:5000`
   - The web app will automatically open

3. **Manage Native Host**:
   - Click **"🚀 Start Native Host"** to start the native messaging host
   - Click **"🛑 Stop Native Host"** to stop it
   - Click **"🔄 Restart Native Host"** to restart it

4. **Monitor Status**:
   - View real-time connection status
   - Monitor bot activity and screen sharing status
   - Check uptime and last activity
   - View activity logs

## 📊 Status Information

The web app displays:
- **Connection Status**: Connected, Disconnected, Starting, Error
- **Bot Active**: Whether the Instagram bot is currently running
- **Screen Sharing**: Whether screen sharing is active
- **Uptime**: How long the native host has been running
- **Last Activity**: When the bot was last active

## 📝 Activity Logs

Real-time logging shows:
- Native host startup/shutdown events
- Connection status changes
- Bot state updates
- Error messages
- Keep-alive messages

## 🔧 Technical Details

### Architecture
- **Backend**: Flask web server with Socket.IO for real-time communication
- **Frontend**: HTML5, CSS3, JavaScript with Socket.IO client
- **Native Host**: Python process managed by the web app
- **Communication**: WebSocket for real-time updates, REST API for controls

### Dependencies
- `Flask`: Web framework
- `Flask-SocketIO`: WebSocket support
- `python-socketio`: Socket.IO server
- `eventlet`: Async networking

### Ports
- **Web App**: `http://localhost:5000`
- **Native Host**: Managed internally by the web app

## 🎯 Benefits

### For Users
- ✅ **No Terminal Required**: Manage everything through a web browser
- ✅ **Visual Feedback**: See exactly what's happening with the native host
- ✅ **Easy Controls**: Simple buttons to start/stop/restart
- ✅ **Real-time Updates**: Live status and logging
- ✅ **Mobile Access**: Use from any device with a web browser

### For Development
- ✅ **Better Debugging**: Visual logs and status information
- ✅ **Remote Management**: Access from any device on the network
- ✅ **Professional Interface**: Clean, modern web interface
- ✅ **Extensible**: Easy to add new features and controls

## 🔄 Integration with Chrome Extension

The web app works seamlessly with the Chrome extension:

1. **Start the Web App**: Run `python3 start_webapp.py`
2. **Start Native Host**: Click "Start Native Host" in the web app
3. **Use Chrome Extension**: The extension will automatically connect to the native host
4. **Monitor Status**: Watch the web app for real-time status updates

## 🚨 Troubleshooting

### Web App Won't Start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill any processes using port 5000
sudo kill -9 $(lsof -t -i:5000)
```

### Dependencies Issues
```bash
# Update pip
python3 -m pip install --upgrade pip

# Install dependencies manually
pip3 install Flask Flask-SocketIO python-socketio eventlet
```

### Native Host Issues
- Check the activity logs in the web app
- Restart the native host using the web app controls
- Check that `native_host.py` exists and is executable

## 📱 Mobile Access

The web app is fully responsive and works on mobile devices:

1. **Find Your IP**: Run `ifconfig` or `ipconfig` to find your computer's IP
2. **Access from Mobile**: Go to `http://YOUR_IP:5000` on your mobile device
3. **Manage Remotely**: Control the native host from anywhere on your network

## 🎉 Enjoy!

The web app provides a much better experience than managing the native host through the terminal. You can now:

- Start/stop the native host with one click
- Monitor everything in real-time
- Access from any device
- See detailed logs and status information

No more terminal commands needed! 🚀



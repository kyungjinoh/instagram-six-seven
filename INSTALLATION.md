# Installation Guide

## Quick Start Guide for Instagram School-Based Follower Bot

### Step 1: Create Icon Files

Before loading the extension, you need to create three icon files. You have two options:

#### Option A: Use Simple Colored Squares (Easiest)

1. Create three PNG files with these exact names in the extension folder:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. You can:
   - Use any image editor (Paint, Preview, Photoshop, etc.)
   - Create simple colored squares
   - Download placeholder icons from online generators
   - Use the provided Python script below

#### Option B: Use Python Script (Automated)

Save this as `create_icons.py` in the extension folder and run it:

```python
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # Create a gradient background
    img = Image.new('RGB', (size, size), color=(102, 126, 234))
    draw = ImageDraw.Draw(img)
    
    # Draw a simple design
    margin = size // 8
    draw.ellipse([margin, margin, size-margin, size-margin], 
                 fill=(118, 75, 162))
    
    # Add text for larger icons
    if size >= 48:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size//3)
            text = "IG"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            position = ((size - text_width) // 2, (size - text_height) // 2 - size//10)
            draw.text(position, text, fill=(255, 255, 255), font=font)
        except:
            pass
    
    img.save(filename)
    print(f"Created {filename}")

# Create all three icons
create_icon(16, 'icon16.png')
create_icon(48, 'icon48.png')
create_icon(128, 'icon128.png')

print("All icons created successfully!")
```

Run with: `python3 create_icons.py`

(Requires: `pip install Pillow`)

### Step 2: Verify Files

Make sure your extension folder contains these files:

```
✓ manifest.json
✓ popup.html
✓ popup.css
✓ popup.js
✓ content.js
✓ background.js
✓ schools.json
✓ icon16.png
✓ icon48.png
✓ icon128.png
✓ README.md
```

### Step 3: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in address bar and press Enter
   - OR: Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**
   - Look for "Developer mode" toggle in the top-right corner
   - Turn it ON

3. **Load Unpacked Extension**
   - Click "Load unpacked" button (top-left)
   - Navigate to your extension folder
   - Select the folder and click "Select" or "Open"

4. **Verify Installation**
   - You should see "Instagram School-Based Follower Bot" in your extensions list
   - The extension icon should appear in your Chrome toolbar
   - If you don't see it, click the puzzle icon (🧩) and pin it

### Step 4: First Use

1. **Navigate to Instagram**
   - Go to https://www.instagram.com
   - Log in to your account if not already logged in

2. **Open Extension**
   - Click the extension icon in Chrome toolbar
   - A popup window will appear

3. **Configure Settings**
   - Enter your Instagram username
   - Search and select one or more schools
   - Choose a bot mode (Mode 1 or Explore)

4. **Start Bot**
   - Click "Start Bot"
   - Monitor progress in the statistics panel
   - Bot will run until stopped or completed

## Troubleshooting Installation

### Extension Not Loading

**Error: "Manifest file is missing or unreadable"**
- Make sure `manifest.json` is in the root of the folder
- Check that the file is not corrupted
- Verify JSON syntax is valid

**Error: "Could not load icon"**
- Ensure all three icon files exist
- Check file names match exactly (icon16.png, icon48.png, icon128.png)
- Verify files are valid PNG images

**Error: "Could not load manifest"**
- Check that manifest.json has no syntax errors
- Ensure all referenced files exist
- Try removing and re-adding the extension

### Extension Icon Not Showing

1. Click the puzzle icon (🧩) in Chrome toolbar
2. Find "Instagram School-Based Follower Bot"
3. Click the pin icon to pin it to toolbar

### Popup Not Opening

1. Right-click the extension icon
2. Select "Inspect popup"
3. Check console for errors
4. Reload the extension

### Schools Not Loading

1. Verify `schools.json` exists in the extension folder
2. Check that JSON syntax is valid
3. Reload the extension
4. Check browser console for errors

## Common Installation Issues

### Issue: "Manifest version 2 is deprecated"

**Solution**: This extension uses Manifest V3, which is the latest version. If you see this error, check that your `manifest.json` has `"manifest_version": 3`.

### Issue: Content script not injecting

**Solution**: 
1. Make sure you're on instagram.com
2. Reload the Instagram page after installing extension
3. Check that content_scripts in manifest.json is correct

### Issue: Background script errors

**Solution**:
1. Go to chrome://extensions/
2. Click "Details" on the extension
3. Click "Inspect views: service worker"
4. Check console for errors

## Updating the Extension

After making changes to any files:

1. Go to chrome://extensions/
2. Find the extension
3. Click the refresh icon (🔄)
4. Test your changes

## Uninstalling

1. Go to chrome://extensions/
2. Find "Instagram School-Based Follower Bot"
3. Click "Remove"
4. Confirm removal

## System Requirements

- **Browser**: Google Chrome version 88 or higher
- **OS**: Windows, macOS, or Linux
- **Internet**: Active connection required
- **Instagram**: Must have an active Instagram account

## Security Notes

- This extension only runs on instagram.com
- No data is sent to external servers
- Your Instagram credentials are never accessed
- All processing happens locally in your browser

## Next Steps

After successful installation:

1. Read the [README.md](README.md) for detailed usage instructions
2. Familiarize yourself with rate limits and safety features
3. Start with a small number of schools to test
4. Monitor the bot's behavior on your first run

## Need Help?

If you encounter issues not covered here:

1. Check the browser console for error messages
2. Verify all files are present and correctly named
3. Try removing and reinstalling the extension
4. Make sure you're using the latest version of Chrome
5. Test on instagram.com while logged in

---

**Ready to use?** Head over to [README.md](README.md) for usage instructions!



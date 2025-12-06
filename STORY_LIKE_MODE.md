# Story Like Mode

## Overview
The **Story Like Mode** automatically likes Instagram stories from your feed. The bot will:
1. Navigate to Instagram home page
2. Click on the first story circle
3. Like each story (if not already liked) - **only clicks ONCE, never unlikes**
4. Click the next button to move to the next story immediately
5. Repeat until reaching the end of all available stories

**⚡ SUPER FAST:** Completes ~2 seconds per story!

## How to Use

### Step 1: Open the Extension
Click on the extension icon to open the popup.

### Step 2: Select Story Like Mode
- In the "Bot Mode" section, select the radio button: **❤️ Story Like Mode**
- **No need to enter username or select schools** - this mode works independently

### Step 3: Start the Bot
1. Click the **"Start Bot"** button
2. The bot will open an Instagram tab (or use an existing one)
3. You'll see the bot navigate to the home page
4. The bot will automatically start liking stories

### Step 4: Monitor Progress
- Watch the status updates in the popup
- The console will show detailed logs:
  - `🎬 Opening first story...`
  - `❤️ Liking story #X...`
  - `✅ Liked story #X!`
  - `ℹ️ Skipped story #X (already liked)`
  - `➡️ Moving to next story...`

### Step 5: Completion
When all stories are viewed, you'll see:
```
╔════════════════════════════════════════╗
║       ❤️ STORY LIKE MODE COMPLETE      ║
╚════════════════════════════════════════╝

📊 Final Statistics:
   Total stories viewed: X
   Stories liked: X
   Stories skipped: X
```

## Features

### Smart Detection
- **Detects if story is already liked** - skips if you've already liked it
- **NEVER unlikes** - only clicks on unfilled hearts (confirmed safe)
- **Supports multiple languages** - works with Korean (좋아요, 다음) and English (Like, Next)
- **Automatic end detection** - knows when to stop

### Safety Features
- **Single click only** - won't accidentally unlike by clicking multiple times
- **Path verification** - confirms heart is unfilled before clicking
- **Conservative approach** - skips if uncertain (better safe than sorry)
- **Super fast** - ~2 seconds per story with optimized timing

### Real-time Updates
- Shows current progress in popup
- Displays statistics:
  - Total stories viewed (shown as "Profiles Visited")
  - Stories liked (shown as "Followed")
  - Current status with live count

## Technical Details

### Story Detection
The bot identifies stories using Instagram's specific HTML structure:
- **Story circles**: `div.x6s0dn4.x78zum5.xl56j7k` with `canvas` element inside
- **Like button**: SVG with aria-label containing "좋아요" or "Like"
- **Next button**: SVG with aria-label containing "다음" or "Next"

### Like Detection
The bot checks if a story is already liked by examining the SVG path:
- **Unfilled heart** (not liked): path starts with `M16.792...`
- **Filled heart** (already liked): different path data

This ensures you won't accidentally like the same story twice.

### Error Handling
If the bot encounters issues:
- **No stories available**: Stops gracefully with message
- **Like button not found**: Logs and continues
- **Next button missing**: Assumes end of stories and stops
- **Story viewer closes**: Detects and stops the process

## Console Output Example

```
╔════════════════════════════════════════╗
║       ❤️ STORY LIKE MODE STARTED       ║
╚════════════════════════════════════════╝

📱 Navigating to Instagram home...
✅ On Instagram home page - stories should be visible at the top
🎬 Attempting to open first story...
🔍 Looking for story circles...
✅ Found 5 story circle(s)
✅ Clicking story circle...
✅ Story opened successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Story #1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❤️ Looking for like button...
✅ Found like button (not yet liked), clicking...
✅ Liked story #1!
➡️ Looking for next button...
✅ Found next button, clicking...
✅ Moved to next story

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Story #2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❤️ Looking for like button...
ℹ️ Story already liked, skipping...
ℹ️ Skipped story #2 (Already liked)
➡️ Looking for next button...
✅ Found next button, clicking...
✅ Moved to next story

...

✅ Reached the end of all stories!

╔════════════════════════════════════════╗
║       ❤️ STORY LIKE MODE COMPLETE      ║
╚════════════════════════════════════════╝

📊 Final Statistics:
   Total stories viewed: 15
   Stories liked: 12
   Stories skipped: 3
```

## Tips

1. **Make sure you're logged in** to Instagram before starting
2. **Stories must be available** - if no friends have posted stories, the bot will stop
3. **Watch the first few stories** to ensure everything works correctly
4. **You can stop anytime** by clicking the "Stop Bot" button
5. **Check console (F12)** on the Instagram tab for detailed logs

## Limitations

- Only works with stories visible on your home feed
- Cannot navigate to specific users' stories
- Skips video stories if they're still loading (but will try to like once loaded)
- Requires Instagram to be in English or Korean language

## Future Enhancements

Possible future improvements:
- Add delay customization between stories
- Option to skip certain users
- Only like stories from specific users
- Add daily limit tracking for story likes

---

**Note**: Use responsibly and respect Instagram's terms of service. Excessive automation may trigger rate limits.


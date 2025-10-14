# Troubleshooting Guide

## ❌ "Couldn't Establish Connection" Error

This is the most common error when first using the extension. Here's how to fix it:

### ✅ Solution 1: Refresh Instagram Page (Most Common Fix)

1. **Go to Instagram tab** (instagram.com)
2. **Press F5** or click the refresh button
3. **Wait for page to fully load** (2-3 seconds)
4. **Click extension icon again**
5. **Click "Start Bot"**

**Why this works**: The content script needs to load on the page. Refreshing after installing the extension loads it properly.

---

### ✅ Solution 2: Reload the Extension

1. Go to `chrome://extensions/`
2. Find "Instagram School-Based Follower Bot"
3. Click the **refresh icon** (🔄)
4. Go back to Instagram
5. **Refresh the Instagram page** (important!)
6. Try starting the bot again

**Why this works**: Sometimes the extension needs to be reloaded after installation to properly initialize.

---

### ✅ Solution 3: Make Sure You're on Instagram.com

The bot ONLY works on:
- ✅ `https://www.instagram.com/...`
- ✅ `https://instagram.com/...`

Will NOT work on:
- ❌ `https://m.instagram.com/...` (mobile site)
- ❌ Any other website
- ❌ Chrome's new tab page

**Fix**: Navigate to `instagram.com` in the address bar.

---

### ✅ Solution 4: Check if You're Logged In

1. Look at Instagram - can you see your profile icon?
2. Try clicking on your profile
3. If you see a login screen, **log in first**
4. Then try the bot again

---

### ✅ Solution 5: Clear Extension and Start Fresh

1. Go to `chrome://extensions/`
2. **Remove** the extension (trash icon)
3. **Reload** the extension folder
4. Go to Instagram
5. **Refresh the page**
6. Try again

---

## 🔧 Other Common Issues

### Issue: Bot Opens Following Tab But Stops and Doesn't Scroll

**This is now fixed!** The latest version includes improved scrolling logic.

**If you're still experiencing this:**

1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Find the extension
   - Click refresh icon (🔄)

2. **Check the browser console for debugging:**
   - Open Instagram tab
   - Press **F12** to open DevTools
   - Go to **Console** tab
   - Start the bot
   - Look for messages like:
     - "Getting following list..."
     - "Modal is open"
     - "Starting scroll..."
     - "Found X usernames in following list"

3. **What the logs tell you:**
   - ✅ If you see "Scrolling complete" → It's working!
   - ⚠️ If you see "Modal not found" → Try clicking following manually first
   - ⚠️ If you see "Could not click following button" → Profile may not have following
   - ⚠️ If scroll stops early → May be a network issue, try slower internet

4. **Manual test:**
   - Go to your Instagram profile
   - Click "following" manually
   - Does the modal open?
   - Can you scroll it manually?
   - If not, Instagram itself may have an issue

**Improved in this version:**
- ✅ Multiple methods to find scrollable element
- ✅ Better logging for debugging
- ✅ Longer wait times (2 seconds per scroll)
- ✅ Detects when modal fails to open
- ✅ Auto-closes modal on error

---

### Issue: Bot Starts But Stops Immediately

**Possible causes:**
1. Not logged into Instagram
2. Already hit daily follow limit
3. Instagram page not fully loaded

**Solutions:**
- Verify you're logged in (see your profile icon?)
- Wait 24 hours if you hit the limit
- Refresh Instagram page and wait 5 seconds before starting

---

### Issue: "No Active Tab Found"

**Solution:**
- Make sure Instagram tab is the **active tab** (selected/focused)
- Click on the Instagram tab to select it
- Then click the extension icon

---

### Issue: "Please Navigate to Instagram First"

**Solution:**
- Type `instagram.com` in address bar
- Wait for page to load
- Then start the bot

---

### Issue: No Profiles Being Followed

**This might be normal!** The bot only follows profiles that:
- ✅ Match your selected schools
- ✅ You're not already following
- ✅ Haven't already requested

**Solutions:**
- Select more schools (try 10-15)
- Try the other mode (Mode 1 vs Explore)
- Be patient - matches may be rare

---

### Issue: Bot Gets Stuck on "Taking 1 Hour Break"

**This is NORMAL and EXPECTED!**

After every 5 follows, the bot automatically pauses for 1 hour. This is a safety feature.

**What to do:**
- ✅ **Let it run** - it will resume automatically
- ✅ **Close popup** - bot continues in background
- ✅ **Use Instagram normally** during the break

**Do NOT:**
- ❌ Stop and restart the bot
- ❌ Try to skip the break
- ❌ Reload the extension

---

### Issue: Statistics Not Updating

**Solution:**
- Close the popup and reopen it (click extension icon)
- Statistics are stored and will show latest numbers

---

### Issue: Extension Icon Not Visible

**Solution:**
1. Click the **puzzle icon** (🧩) in Chrome toolbar
2. Find "Instagram School-Based Follower Bot"
3. Click the **pin icon** to pin it
4. Icon will now appear in toolbar

---

### Issue: Schools Not Loading in Dropdown

**Possible causes:**
1. `schools.json` file is missing
2. Extension not loaded properly

**Solutions:**
1. Run `python3 verify_installation.py` to check files
2. Reload the extension in chrome://extensions/
3. Reinstall if necessary

---

### Issue: "Daily Limit Reached"

**This is Instagram's limit, not the bot's!**

Instagram limits how many people you can follow per day:
- New accounts: ~20-50 per day
- Normal accounts: ~100-200 per day
- Established accounts: up to ~500 per day

**Solution:**
- Wait 24 hours
- Use Instagram normally
- Try again tomorrow with shorter sessions

---

### Issue: Search Box Not Filtering Schools

**Solution:**
- Type at least 2-3 characters
- Try different keywords (abbreviations, location names)
- Check spelling
- If still broken, reload the extension

---

### Issue: Can't Select Multiple Schools

**How to select multiple:**
1. Check the box next to first school
2. Check the box next to second school
3. Keep checking boxes for more schools
4. Counter at bottom shows how many selected

**Not working?** Try refreshing the popup (close and reopen).

---

## 🚨 When to Stop Using the Bot

Stop immediately if Instagram shows:
- "Action Blocked"
- "Try Again Later"
- "We restrict certain activity"
- "You're using this too fast"

**What to do:**
1. **Stop the bot immediately**
2. Close Instagram
3. Wait 24-48 hours
4. Use Instagram normally for a day
5. Resume bot with **shorter sessions**

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console

1. Click extension icon
2. Right-click on the popup
3. Select "Inspect"
4. Look at the **Console** tab
5. Look for red error messages

**Common error messages:**
- "Receiving end does not exist" → Refresh Instagram page
- "Cannot read property of undefined" → Reload extension
- "Failed to fetch" → Check internet connection

### Step 2: Check Background Script Console

1. Go to `chrome://extensions/`
2. Find the extension
3. Click "Inspect views: service worker"
4. Look at console for errors

### Step 3: Check Content Script Console

1. Go to Instagram tab
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for messages from "Instagram Follower Bot"

---

## 📞 Still Having Issues?

### Quick Checklist

Before asking for help, verify:

- [ ] Chrome is up to date
- [ ] Extension is loaded (visible in chrome://extensions/)
- [ ] All files present (run `verify_installation.py`)
- [ ] On instagram.com (not mobile site)
- [ ] Logged into Instagram
- [ ] Instagram page has been refreshed
- [ ] Extension has been reloaded
- [ ] Developer mode is enabled

### Information to Collect

If still broken, note:
1. What error message do you see?
2. What were you trying to do?
3. Any red errors in browser console?
4. What operating system?
5. What Chrome version?

---

## 💡 Pro Tips to Avoid Issues

### Before Starting Bot:

1. ✅ Log into Instagram first
2. ✅ Navigate to instagram.com
3. ✅ Refresh the page once
4. ✅ Wait 2-3 seconds
5. ✅ Click extension icon
6. ✅ Fill in all fields
7. ✅ Start bot

### While Bot is Running:

1. ✅ Leave the Instagram tab open
2. ✅ Don't close Chrome
3. ✅ Let the 1-hour breaks happen
4. ✅ Can close the popup (bot continues)
5. ✅ Can use other tabs/windows

### After Using Bot:

1. ✅ Click "Stop Bot" before closing tab
2. ✅ Check who you followed
3. ✅ Engage with some new followers
4. ✅ Take breaks between sessions

---

## 🎯 Most Common Fixes Summary

**90% of issues are solved by:**

1. **Refresh Instagram page** after installing extension
2. **Log into Instagram** before starting bot
3. **Make sure you're on instagram.com** (not mobile)
4. **Reload extension** in chrome://extensions/
5. **Wait for page to fully load** before starting

**Try these first!**

---

## ✅ "It's Working" Checklist

You'll know the bot is working correctly when:

- ✅ Statistics panel appears
- ✅ "Profiles Visited" number increases
- ✅ Status shows "Visiting @username"
- ✅ No error messages appear
- ✅ Instagram page changes/navigates
- ✅ After following 5 people, see "Taking 1 hour break"

---

**Remember**: Most issues are simple connection problems fixed by refreshing the Instagram page! 🔄


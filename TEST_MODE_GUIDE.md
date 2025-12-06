# 🧪 Test Mode Guide

## What is Test Mode?

Test Mode allows you to test the bot on a **single specific profile** before running the full Mode 1 or Explore Mode. This is perfect for:

✅ Verifying the bot works correctly  
✅ Testing if your school selections match profiles  
✅ Debugging without waiting through full Mode 1  
✅ Seeing detailed logs of what happens  

---

## How to Use Test Mode

### Step 1: Open Extension
Click the extension icon in Chrome toolbar

### Step 2: Select Schools
- Search and select 1-3 schools to test with
- Example: Search for "vanya" or select schools you think the profile might have

### Step 3: Choose Test Mode
- Click the **"🧪 Test Mode: Single Profile"** radio button
- A new input field will appear

### Step 4: Enter Test Username
- In the "Test Profile Username" field, enter: `vanyacampsvb.2027`
- Or any other Instagram username you want to test

### Step 5: Start Test
- Click "Start Bot"
- Watch the statistics panel

### Step 6: View Results
- Open browser console for detailed logs:
  - Press **F12** on Instagram tab
  - Go to **Console** tab
  - Or go to `chrome://extensions/` → "Inspect views: service worker"

---

## What Test Mode Does

```
1. Navigate to the profile (@vanyacampsvb.2027)
2. Read the bio and name
3. Check if bio/name contains any selected school keywords
4. Check if already following
5. If matches and not following → Click follow button
6. Show detailed results
7. Stop automatically
```

**Total time**: ~5-10 seconds

---

## Understanding Test Results

### ✅ Result: "Successfully followed!"

**Meaning**: Everything worked!
- Profile matched your selected schools
- You weren't already following them
- Follow button was clicked successfully

**Console shows**:
```
📊 Test Results:
═══════════════════════════════════════
✅ RESULT: Successfully followed!
   → Profile matched school criteria
   → Was not already following
   → Follow button clicked
```

**Next step**: You can now run Mode 1 or Explore with confidence!

---

### ℹ️ Result: "No school match"

**Meaning**: Profile doesn't contain your selected school keywords

**Console shows**:
```
ℹ️  RESULT: Did not follow
   → Reason: No school match
   → Profile bio/name does not contain selected school keywords
```

**What to do**:
1. Manually check the profile - look at bio and name
2. Check what school keywords they have
3. Add those schools to your selection
4. Run test again

**Example**: If bio says "Stanford '25", add Stanford schools to your selection

---

### ℹ️ Result: "Already following"

**Meaning**: You're already following this profile

**Console shows**:
```
ℹ️  RESULT: Did not follow
   → Reason: Already following
   → You are already following this profile
```

**What to do**: Test with a different profile you're not following

---

### ❌ Result: "Daily limit reached"

**Meaning**: Instagram has blocked follows for today

**Console shows**:
```
❌ RESULT: Error occurred
   → Error: Daily limit reached
   → Instagram has blocked further follows for today
   → Wait 24 hours before trying again
```

**What to do**: 
1. Stop using the bot for 24 hours
2. Use Instagram normally
3. Try again tomorrow

---

## Detailed Console Logs

When you run Test Mode, you'll see beautiful formatted logs:

```
╔════════════════════════════════════════╗
║       🧪 TEST MODE STARTED            ║
╚════════════════════════════════════════╝

Target profile: @vanyacampsvb.2027
Testing with 3 school(s): American Heritage Schools, Dalton School, Harvard-Westlake School

📍 Step 1: Navigating to profile...
✓ Page loaded

📖 Step 2: Reading profile bio and name...

📊 Test Results:
═══════════════════════════════════════
✅ RESULT: Successfully followed!
   → Profile matched school criteria
   → Was not already following
   → Follow button clicked
═══════════════════════════════════════

💡 Test Mode Tips:
   • Check the Instagram tab to see the profile
   • Open Console (F12) on Instagram tab for more details
   • If successful, you can now run Mode 1 or Explore Mode

╔════════════════════════════════════════╗
║       🧪 TEST MODE COMPLETE           ║
╚════════════════════════════════════════╝
```

---

## Quick Test with vanyacampsvb.2027

### Profile: [@vanyacampsvb.2027](https://www.instagram.com/vanyacampsvb.2027/)

To test with this specific profile:

1. **Open extension**
2. **Select schools** - try these:
   - Search for "camps" or "vanya"
   - Or select 2-3 random schools to test matching logic
3. **Select "🧪 Test Mode"**
4. **Enter**: `vanyacampsvb.2027`
5. **Click "Start Bot"**
6. **Open Console** (F12 → Console)
7. **Watch the logs**

You should see:
- Navigation to profile ✓
- Reading bio ✓
- Check for school match
- Result (match or no match)

---

## Troubleshooting Test Mode

### Issue: "Profile not found"

**Solution**: Check the username is correct (no @ symbol, exact spelling)

---

### Issue: Test Mode doesn't start

**Checklist**:
- [ ] At least 1 school selected?
- [ ] Test username entered?
- [ ] On Instagram and logged in?
- [ ] Extension reloaded?

---

### Issue: No console logs appearing

**Solution**:
1. Go to `chrome://extensions/`
2. Find the extension
3. Click "Inspect views: service worker"
4. Run test again
5. Logs will appear in this console

---

## Test Mode vs. Regular Modes

| Feature | Test Mode | Mode 1 | Explore |
|---------|-----------|--------|---------|
| Duration | 5-10 seconds | Hours | Hours |
| Profiles checked | 1 | Hundreds | Hundreds |
| Follows | 0-1 | Many | Many |
| Use case | Testing | Production | Production |
| Auto-stops | Yes | No | No |
| Rate limits | None | Yes | Yes |

---

## When to Use Test Mode

### ✅ Use Test Mode When:
- First time setting up the bot
- Testing new school selections
- Debugging why profiles aren't matching
- Verifying bot is working after updates
- Learning how the matching logic works

### ❌ Don't Use Test Mode When:
- You want to follow many people (use Mode 1 or Explore)
- You want continuous operation
- You've already verified bot works

---

## Example Test Scenarios

### Scenario 1: First Time User

**Goal**: Verify bot works

**Steps**:
1. Select 3-5 schools you know
2. Choose Test Mode
3. Enter `vanyacampsvb.2027`
4. Run test
5. Check console for results

**Expected**: You'll see if the profile matches or not

---

### Scenario 2: Debugging School Selection

**Goal**: Figure out why profiles aren't being followed

**Steps**:
1. Find a profile you want to follow
2. Manually check their bio for school keywords
3. Add those schools to your selection
4. Test Mode with that profile
5. Should now match and follow

**Expected**: Successful follow if schools are correct

---

### Scenario 3: Testing Updated Code

**Goal**: Verify recent fixes work

**Steps**:
1. Reload extension
2. Select any school
3. Test Mode with known profile
4. Check console for proper log format

**Expected**: See detailed, formatted logs

---

## Advanced: Reading the Content Script Logs

In addition to background script logs, you can see content script logs:

1. **Go to Instagram tab**
2. **Press F12** → Console
3. **Run Test Mode**
4. **Look for**:
   - "Getting profile bio and name..."
   - "Bio contains school: true/false"
   - "Already following: true/false"
   - "Clicked follow button"

These give even more detail about what's happening!

---

## Quick Command Reference

### To See Background Logs:
```
chrome://extensions/ → Inspect views: service worker
```

### To See Content Logs:
```
Instagram tab → F12 → Console
```

### To Reload Extension:
```
chrome://extensions/ → Refresh icon (🔄)
```

---

## Test Mode Checklist

Before running full Mode 1, verify:

- [ ] Test Mode successfully navigates to profile
- [ ] Bio is being read correctly
- [ ] School matching works (test with known school)
- [ ] Follow button clicking works
- [ ] Console shows detailed logs
- [ ] No errors appear
- [ ] Statistics panel updates

If all ✅ → Ready for Mode 1!

---

## Tips for Success

1. **Start with known profiles**: Test with people you know go to selected schools
2. **Check manually first**: Look at their bio before testing
3. **Use 2-3 schools**: Don't need all 97 for testing
4. **Read the console**: Detailed info is in the logs
5. **Test different scenarios**: Try matching profile, non-matching, already-following

---

## Next Steps After Successful Test

Once Test Mode works correctly:

1. **Run Mode 1** for systematic following through your network
2. **Or run Explore Mode** for broader discovery
3. **Monitor console** for the first 5-10 minutes
4. **Check quality** of follows after session

---

**Test Mode is your friend!** Use it before every major run to ensure everything is working correctly. 🧪✨

---

## Example Test Session

Here's what a complete test looks like:

```
User: Opens extension
User: Selects "Harvard-Westlake School"
User: Clicks "🧪 Test Mode"
User: Enters "vanyacampsvb.2027"
User: Clicks "Start Bot"

Bot: Navigates to profile
Bot: Reads bio: "vb player 🏐 | 2027"
Bot: Checks for "harvard-westlake", "hw", "westlake"
Bot: Match found: NO
Bot: Result: Did not follow (No school match)

User: Checks profile manually
User: Sees "vb" and "2027" but no school mentioned
User: Understands why no match
User: Tries different schools or different profile
```

Perfect! Now the user understands exactly how the bot works! 🎓








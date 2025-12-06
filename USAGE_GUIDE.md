# Usage Guide: Instagram School-Based Follower Bot

## Quick Start

### Before You Begin

1. ✅ Extension is installed in Chrome
2. ✅ You are logged into Instagram
3. ✅ You're on instagram.com in your browser

### Basic Usage (5 Steps)

#### Step 1: Open the Extension
- Click the extension icon in your Chrome toolbar
- The popup interface will appear

#### Step 2: Enter Your Instagram Username
- Type your Instagram handle (without the @ symbol)
- Example: If your profile is @john_smith, enter: `john_smith`

#### Step 3: Select Target Schools
- Use the search box to find schools quickly
- Check the boxes next to schools you want to target
- You can select multiple schools
- The counter at the bottom shows how many schools you've selected

#### Step 4: Choose Bot Mode

**Mode 1: Following → Followers**
- Best for: Targeted networking through your existing connections
- How it works:
  1. Looks at people YOU follow
  2. Examines THEIR followers
  3. Follows those who match your school criteria
- Use when: You want to connect with friends-of-friends

**Explore Mode**
- Best for: Discovering new people
- How it works:
  1. Visits Instagram's Explore People page
  2. Scans suggested profiles
  3. Follows those who match your school criteria
- Use when: You want to cast a wider net

#### Step 5: Start and Monitor

- Click "Start Bot"
- Watch the statistics panel for updates:
  - **Profiles Visited**: How many profiles have been checked
  - **Followed**: How many new follows were made
  - **Status**: What the bot is currently doing

- To stop: Click "Stop Bot" at any time

## Understanding the Interface

### Status Messages

| Message | Meaning |
|---------|---------|
| "Bot started..." | Initial setup is complete |
| "Navigating to @username" | Moving to a profile |
| "Getting following list..." | Extracting list of people you follow |
| "Getting followers of @username" | Extracting someone's followers |
| "Visiting @username" | Checking a profile |
| "Followed @username" | Successfully followed someone |
| "Taking 60 minute break..." | Cooldown period started |
| "Stopped" | Bot has been manually stopped |

### Statistics Panel

The stats panel shows real-time information:

```
┌─────────────────────────────────────┐
│ Statistics                          │
├─────────────────────────────────────┤
│ Profiles Visited: 47                │
│ Followed: 8                         │
│ Status: Visiting @username          │
└─────────────────────────────────────┘
```

- **Profiles Visited**: Total number of profiles the bot has viewed
- **Followed**: Total number of successful follow actions
- **Status**: Current bot activity

## Advanced Usage

### Optimizing School Selection

#### Strategy 1: Wide Net
- Select 10-15 schools
- Mix different regions
- Include common abbreviations
- Best for: Maximum reach

#### Strategy 2: Targeted
- Select 2-3 specific schools
- Use schools you have connection to
- Best for: Quality over quantity

#### Strategy 3: Geographic
- Select schools in one area
- Example: All Chicago schools
- Best for: Local networking

### School Search Tips

- Type full names: "Harvard-Westlake"
- Type abbreviations: "hw"
- Type locations: "chicago"
- Type school types: "prep"

### Combining Modes

For best results, alternate between modes:

1. **Day 1**: Run Mode 1 for 2 hours
2. **Day 2**: Run Explore Mode for 2 hours  
3. **Day 3**: Run Mode 1 for 2 hours
4. Repeat...

This prevents patterns and mimics natural behavior.

## Rate Limiting Explained

### Built-in Delays

The bot includes several safety features:

1. **15-Second Profile Delay**
   - After visiting each profile
   - Gives Instagram time to process
   - Prevents rapid-fire requests

2. **60-Minute Break After 5 Follows**
   - Automatically triggers
   - Bot will wait for 60 minutes
   - Status will show "Taking 60 minute break..."
   - This is NORMAL and EXPECTED

3. **Daily Limit Detection**
   - Instagram has daily follow limits
   - Bot detects when limit is reached
   - Will stop automatically
   - You'll see "Daily limit reached" message

### What to Expect

#### First Hour
- Expect 10-20 profiles visited
- Maybe 2-5 follows (depending on match rate)
- One 60-minute break after 5 follows

#### After 30-Minute Break
- Bot resumes automatically
- Continues from where it left off
- Will follow 5 more, then break again

#### Daily Totals
- **New accounts**: 20-50 follows per day
- **Established accounts**: 100-200 follows per day
- **Mature accounts**: Up to 500 follows per day

## Troubleshooting Common Issues

### Bot Starts Then Immediately Stops

**Possible causes:**
1. Not logged into Instagram
2. Instagram page not fully loaded
3. Daily limit already reached

**Solutions:**
1. Log in to Instagram
2. Refresh the Instagram page
3. Wait 24 hours and try again

### No Profiles Being Followed

**Possible causes:**
1. Selected schools too narrow
2. Already following most matches
3. Profiles don't list schools in bios

**Solutions:**
1. Add more schools to selection
2. Try Explore Mode instead
3. Be patient - matches may be rare

### Bot Gets Stuck on One Profile

**This is normal!** The bot waits 15 seconds between profiles.

If truly stuck for 5+ minutes:
1. Click "Stop Bot"
2. Refresh Instagram page
3. Click "Start Bot" again

### Extension Popup Closes

**No problem!** The bot continues running even when popup is closed.

To check progress:
1. Click extension icon again
2. Popup will show current stats
3. Bot is still working in background

### Instagram Page Looks Weird

Sometimes Instagram's dynamic loading causes visual issues.

**This is okay!** The bot interacts with the DOM directly, not visually.

If concerned:
1. Open a new tab
2. Check your Instagram normally
3. Bot is working in the background tab

## Best Practices

### Daily Usage

**Don't:**
- ❌ Run bot 24/7 continuously
- ❌ Start/stop repeatedly in short time
- ❌ Use on multiple accounts simultaneously
- ❌ Override rate limiting by modifying code

**Do:**
- ✅ Run for 2-3 hour sessions
- ✅ Take breaks between sessions
- ✅ Let the 60-minute cooldowns happen
- ✅ Respect daily limits

### School Selection

**Don't:**
- ❌ Select all 97 schools at once
- ❌ Only select 1 school
- ❌ Change selection mid-run

**Do:**
- ✅ Select 5-10 relevant schools
- ✅ Test with 2-3 schools first
- ✅ Stop bot before changing schools

### Account Safety

**Don't:**
- ❌ Use a brand new Instagram account
- ❌ Follow-unfollow rapidly
- ❌ Run multiple bots on same account
- ❌ Ignore Instagram's warnings

**Do:**
- ✅ Use an established account
- ✅ Mix bot activity with manual use
- ✅ Post content regularly
- ✅ Engage with your new followers

## Understanding Match Logic

### How Profiles Are Matched

The bot checks each profile's:
1. **Bio text** (description)
2. **Name field** (display name)

Then searches for any of your selected school abbreviations.

### Example Matches

Selected school: **"Harvard-Westlake School"**  
Abbreviations: `["Harvard-Westlake", "harvard-westlake", "HW", "hw", "westlake", "harvard"]`

**Will match:**
- Bio: "HW '25 🎓"
- Bio: "harvard-westlake senior"
- Name: "John Smith • hw"
- Bio: "westlake grad"

**Won't match:**
- Bio: "Love Harvard!" (matches "harvard" but context is wrong)
- Bio: "Going to west point"
- Name: "hw" (too ambiguous without context)

### Reducing False Positives

To reduce incorrect matches:
1. Choose schools with unique abbreviations
2. Avoid single-letter abbreviations
3. Use full school names when possible

## Stopping the Bot

### Normal Stop

Click "Stop Bot" button - this:
1. Halts profile processing
2. Saves current statistics
3. Closes any open Instagram modals
4. Returns to idle state

### Emergency Stop

If bot seems stuck:
1. Close the popup
2. Go to chrome://extensions/
3. Find the extension
4. Toggle it off then on
5. Reload Instagram page

## Resuming After Stop

The bot does NOT remember where it left off. Each start is fresh.

**Mode 1**: Will re-scan your following list  
**Explore Mode**: Will start from current explore page

Don't worry - the bot skips profiles you're already following.

## Privacy & Data

### What the Bot Accesses

- ✅ Public profile information (names, bios)
- ✅ Public following/follower lists
- ✅ Your Instagram username (stored locally)
- ✅ Your school selections (stored locally)

### What the Bot Does NOT Access

- ❌ Your Instagram password
- ❌ Direct messages
- ❌ Posts, stories, or media
- ❌ Private account information
- ❌ Location data
- ❌ Contact lists

### Where Data Is Stored

All data is stored in Chrome's local storage:
- Only accessible to this extension
- Not sent to any servers
- Cleared when extension is removed

## Tips for Success

### Week 1: Testing Phase
- Select 3-5 schools
- Run Mode 1 for 1 hour
- Check quality of follows
- Adjust school selection

### Week 2: Scaling Up
- Add more schools if needed
- Increase session length to 2-3 hours
- Try Explore Mode
- Monitor follower quality

### Week 3+: Maintenance
- Run 2-3 times per week
- Mix modes
- Engage with new followers
- Post regular content

## Common Questions

**Q: Why is the bot so slow?**  
A: The 15-second delays and 30-minute breaks are intentional safety features to prevent Instagram from flagging your account.

**Q: Can I speed it up?**  
A: No. The delays are hardcoded for your protection. Removing them risks account suspension.

**Q: How many follows per day should I expect?**  
A: 20-100 depending on your account age and Instagram's limits. Quality over quantity!

**Q: Will this get my account banned?**  
A: If used responsibly (following the rate limits), risk is minimal. However, any automation carries some risk.

**Q: Can I use this on multiple accounts?**  
A: Yes, but only one account at a time. Log out and log in to switch accounts.

**Q: Does this work on mobile?**  
A: No. This is a Chrome extension for desktop only.

**Q: Can I customize the school list?**  
A: Currently no. The 97 schools are pre-configured. Future versions may allow custom keywords.

---

## Getting Help

If something isn't working:

1. Check this guide for your specific issue
2. Review the [README.md](README.md) for technical details
3. Check the browser console for error messages
4. Try reinstalling the extension

Remember: Be patient, respect the rate limits, and use responsibly! 🎓








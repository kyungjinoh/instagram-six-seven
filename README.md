# Instagram School-Based Follower Bot

A Chrome Extension that automates Instagram following based on school affiliation detected in user profiles.

## Features

### Two Operating Modes

1. **Mode 1: Following → Followers**
   - Analyzes accounts that your target user follows
   - Examines the followers of those accounts
   - Follows users whose bios contain selected school keywords

2. **Explore Mode**
   - Browses Instagram's Explore People page
   - Identifies profiles matching school criteria
   - Automatically follows matching profiles

### School-Based Targeting

- Select from 98 schools with comprehensive abbreviation lists
- Matches school keywords in user bios and names
- Supports multiple school selection for broader targeting

### Safety Features

- **Rate Limiting**: 15-second delay between profile visits
- **Break System**: 60-minute break after every 5 follows
- **Daily Limit Detection**: Automatically detects and handles Instagram's follow limits
- **Human-like Behavior**: Mimics natural browsing patterns to avoid detection

## Installation

1. **Download the Extension**
   - Download all files to a folder on your computer

2. **Create Icon Files**
   - Create three icon files (icon16.png, icon48.png, icon128.png)
   - Or use any placeholder images with those names

3. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the folder containing the extension files

4. **Verify Installation**
   - The extension icon should appear in your Chrome toolbar
   - Click it to open the popup interface

## Usage

### Prerequisites

- You must be logged into Instagram in your Chrome browser
- Navigate to Instagram.com before starting the bot

### Steps

1. **Open the Extension**
   - Click the extension icon in Chrome toolbar

2. **Enter Your Instagram Username**
   - Type your Instagram handle (without @)

3. **Select Schools**
   - Use the search box to find schools
   - Check one or more schools you want to target
   - Selected count shows at the bottom

4. **Choose Bot Mode**
   - **Mode 1**: Analyzes your network's followers
   - **Explore Mode**: Browses Instagram's suggestions

5. **Start the Bot**
   - Click "Start Bot"
   - Monitor progress in the statistics panel
   - The bot will run until manually stopped or completion

6. **Monitor Progress**
   - Profiles Visited: Total profiles analyzed
   - Followed: Number of accounts followed
   - Status: Current bot activity

7. **Stop Anytime**
   - Click "Stop Bot" to halt execution
   - Progress is saved and can be resumed

## Rate Limits & Safety

### Built-in Protections

- ⏱️ **15-second delays**: Between each profile visit
- ⏸️ **60-minute breaks**: After every 5 follows
- 🚫 **Daily limit detection**: Stops when Instagram limit is reached
- 👤 **Skip already followed**: Won't re-follow existing connections

### Instagram Limits

Instagram enforces daily follow limits that vary by account:
- New accounts: ~20-50 follows per day
- Established accounts: ~150-200 follows per day
- Older accounts: Up to ~500 follows per day

**Important**: These are Instagram's limits, not the extension's limits. The bot will automatically stop when it detects the daily limit warning.

## File Structure

```
/
├── manifest.json           # Chrome extension configuration
├── popup.html             # User interface HTML
├── popup.css              # User interface styling
├── popup.js               # Popup logic and interactions
├── content.js             # Instagram DOM interactions
├── background.js          # Bot logic and flow control
├── schools.json           # School database (98 schools)
├── icon16.png            # Extension icon (16x16)
├── icon48.png            # Extension icon (48x48)
├── icon128.png           # Extension icon (128x128)
└── README.md             # Documentation
```

## Technical Details

### Content Script (`content.js`)

Handles all Instagram DOM interactions:
- Profile navigation
- Following/followers list extraction
- Bio and name text extraction
- Follow button detection and clicking
- Daily limit detection
- Modal scrolling and data extraction

### Background Script (`background.js`)

Manages bot execution and flow:
- Mode 1 and Explore mode logic
- Rate limiting enforcement
- Statistics tracking
- Error handling
- Break management (60-minute cooldown)

### Popup Interface (`popup.html/js/css`)

User-facing controls:
- Instagram username input
- School selection with search
- Mode selection (Mode 1 vs Explore)
- Statistics display
- Start/Stop controls

## School Database

The extension includes 98 schools with comprehensive abbreviation lists:

- **East Coast**: Dalton, Fieldston, Phillips Andover, Phillips Exeter, etc.
- **West Coast**: Harvard-Westlake, Monta Vista, Sierra Canyon, etc.
- **Midwest**: Walter Payton, New Trier, Stevenson, etc.
- **Specialized**: OCSA, Blair Academy, Pingry, etc.

Each school includes multiple abbreviations for accurate matching:
- Full names
- Common abbreviations
- Shorthand variations
- Popular nicknames

## Troubleshooting

### Bot Won't Start

- **Not logged in**: Make sure you're logged into Instagram
- **Wrong page**: Navigate to instagram.com first
- **No schools selected**: Select at least one school
- **Missing username**: Enter your Instagram username

### Bot Stops Unexpectedly

- **Daily limit reached**: Instagram has blocked further follows
- **Connection issues**: Check your internet connection
- **Page navigation errors**: Try reloading Instagram
- **Already at limit**: You may have hit Instagram's follow cap

### No Profiles Being Followed

- **Tight criteria**: Selected schools may have few members
- **Already following**: Many matching profiles may already be followed
- **Bio detection**: School names may not appear in bios
- **Try different mode**: Switch between Mode 1 and Explore

### Statistics Not Updating

- **Popup closed**: Statistics update even when popup is closed
- **Reopen popup**: Click extension icon to see latest stats
- **Check background**: Bot may be in 60-minute break period

## Best Practices

### For Optimal Results

1. **Start slow**: Use the bot for 1-2 hours initially
2. **Vary timing**: Don't run at the same time every day
3. **Mix modes**: Alternate between Mode 1 and Explore
4. **Select strategically**: Choose schools relevant to your network
5. **Monitor manually**: Check followed accounts periodically

### For Account Safety

1. **Don't exceed limits**: Let the bot handle rate limiting
2. **Take breaks**: Don't run 24/7
3. **Vary activity**: Mix bot use with manual browsing
4. **Keep profile authentic**: Maintain a real-looking profile
5. **Don't spam**: Focus on genuine connection building

## Limitations

- Requires Chrome browser
- Must be logged into Instagram
- Subject to Instagram's rate limits
- Bio matching depends on visible profile text
- Cannot follow private accounts that require approval
- Effectiveness varies by school popularity on Instagram

## Privacy & Ethics

This extension:
- ✅ Does not store your Instagram password
- ✅ Only accesses publicly visible profile information
- ✅ Respects Instagram's rate limits
- ✅ Can be stopped at any time
- ✅ Does not share your data with third parties

**Ethical Use**: This tool should be used responsibly to:
- Connect with peers from specific schools
- Build genuine community connections
- Network within educational communities

**Not for**:
- Spam following
- Harassment
- Violating Instagram's Terms of Service
- Commercial purposes without proper authorization

## Updates & Support

### Future Enhancements

- Custom school/keyword input
- Advanced filtering (graduation year, location)
- Multiple account support
- Detailed analytics dashboard
- Whitelist/blacklist functionality

### Known Issues

- Instagram's UI changes may break selectors
- Very large following lists may timeout
- Explore page may show repeated profiles
- Modal scrolling may miss some users on slow connections

## Legal Disclaimer

This extension is provided for educational purposes. By using this extension, you agree that:

1. You are responsible for complying with Instagram's Terms of Service
2. The developers are not liable for any account restrictions or bans
3. Use of automation tools may violate Instagram's policies
4. You use this extension at your own risk

Instagram is a trademark of Meta Platforms, Inc. This extension is not affiliated with, endorsed by, or sponsored by Instagram or Meta.

## Credits

Developed for connecting students within educational communities.

Built with:
- Chrome Extension Manifest V3
- Vanilla JavaScript
- Instagram web interface

---

**Version**: 1.0  
**Last Updated**: 2025  
**License**: Educational Use Only








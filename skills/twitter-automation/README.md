# Twitter Automation Skill for OpenClaw

A FREE browser automation skill for Twitter/X using Playwright with stealth plugins.

## Features

- ✅ Post tweets
- ✅ Read timeline
- ✅ Search tweets
- ✅ Like/retweet
- ✅ Human-like behavior (delays, mouse movements)
- ✅ Anti-detection (stealth plugins)
- ✅ FREE (no API fees)

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Usage

```bash
# Post a tweet
node skill.js post "Hello from OpenClaw!"

# Read timeline
node skill.js timeline

# Search tweets
node skill.js search "openclaw"

# Like a tweet
node skill.js like "https://x.com/user/status/123"
```

## Configuration

1. Copy `.env.example` to `.env`
2. Add your Twitter credentials:
   - `TWITTER_USERNAME`
   - `TWITTER_PASSWORD`
   - `TWITTER_EMAIL` (for 2FA)

## Anti-Detection Features

- User-agent rotation
- Viewport randomization
- Mouse movement curves
- Typing delays (50-150ms per character)
- Random wait times between actions
- WebDriver flag removal
- WebGL/Canvas fingerprint spoofing

## FREE Requirements

- Node.js 18+
- Playwright (free)
- Stealth plugins (free)
- Your own IP (use VM's native IP)

## Rate Limits (Recommended)

- Post: 1-3 times per day per account
- Actions: 5-10 seconds between
- Max: 50 actions per day per account

## Disclaimer

Twitter/X aggressively detects automation. This skill uses anti-detection techniques but:
- Accounts may still be limited or banned
- Use at your own risk
- Recommended: Use with 4 different VMs/IPs
- Post slowly and act human

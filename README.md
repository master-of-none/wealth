# WealthPulse — Personal Finance Tracker

A sleek Electron desktop app for tracking Fixed Deposits, Mutual Funds, and Stocks with smart notifications and automatic updates.

## Features

- **Fixed Deposits**: Track bank, amount, interest rate, start/maturity dates, auto-renewal
- **Mutual Funds**: Track SIP amount, SIP day, invested vs current value, returns %
- **Stocks**: Track holdings, buy/current price, P&L per stock and portfolio-wide
- **Dashboard**: Portfolio overview, asset allocation pie chart, alerts, SIP schedule
- **Smart Notifications**: Desktop alerts for FD maturity and SIP dates
- **Auto-Updates**: Users receive updates automatically via GitHub Releases
- **System Tray**: Runs in background with quick access menu
- **Persistent Storage**: Data saved locally via `electron-store`

## Quick Start

```bash
cd wealthpulse-electron
npm install
npm start
```

## Setup for Publishing & Auto-Updates

### 1. Create GitHub Repo

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/wealthpulse.git
```

### 2. Update `package.json`

Replace `YOUR_GITHUB_USERNAME` in the `build.publish` section:

```json
"publish": {
  "provider": "github",
  "owner": "YOUR_GITHUB_USERNAME",
  "repo": "wealthpulse"
}
```

### 3. Generate GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Select scope: `repo` (full control of private repos)
4. Copy the token

### 4. First Publish

```bash
export GH_TOKEN=your_github_token_here    # macOS/Linux
set GH_TOKEN=your_github_token_here       # Windows CMD
$env:GH_TOKEN="your_github_token_here"    # Windows PowerShell

npm run publish
```

This builds the app and uploads it to a GitHub Release tagged `v1.0.0`.

Users download the installer from your repo's **Releases** page.

## Releasing Updates

Every time you want to push an update to users:

```bash
# 1. Make your code changes

# 2. Bump the version (pick one)
npm version patch    # 1.0.0 → 1.0.1  (bug fixes)
npm version minor    # 1.0.0 → 1.1.0  (new features)
npm version major    # 1.0.0 → 2.0.0  (breaking changes)

# 3. Build & publish to GitHub Releases
GH_TOKEN=your_token npm run publish

# 4. Done — users get notified automatically!
```

### What Happens on the User's End

1. App launches → checks for updates in the background
2. If a new version exists → downloads silently
3. Shows an in-app banner: "Version X.Y.Z downloaded. Restart to install."
4. User clicks **Restart & Update** → app restarts with new version
5. Also re-checks every 4 hours while running

### Platform-Specific Publishing

```bash
npm run publish:win     # Windows only
npm run publish:mac     # macOS only
npm run publish:linux   # Linux only
npm run publish         # Current platform
```

## Auto-Update Behavior

| Event                  | What Happens                                             |
|------------------------|----------------------------------------------------------|
| App launch             | Checks for updates after 5 seconds                      |
| Every 4 hours          | Background check while app is running                    |
| Update found           | Downloads silently, shows banner + OS notification       |
| Download complete      | Dialog prompt: "Restart Now" or "Later"                  |
| "Later" chosen         | Banner stays visible, installs on next quit              |
| Tray → Check for Updates | Manual trigger from system tray                       |

## Notification Schedule

Desktop notifications fire at **9:00 AM** and **6:00 PM** daily, plus on startup.

### FD Alerts
| Trigger            | Urgency  |
|--------------------|----------|
| Matured (0 days)   | Critical |
| 1 day remaining    | Critical |
| 7 days remaining   | Critical |
| 30 days remaining  | Warning  |

### SIP Alerts
| Trigger            | Urgency  |
|--------------------|----------|
| SIP due today      | Critical |
| 1 day to SIP       | Critical |
| 3 days to SIP      | Warning  |

## Project Structure

```
wealthpulse-electron/
├── main.js          # Electron main process (window, tray, notifications, auto-updater)
├── preload.js       # Secure IPC bridge (storage + update APIs)
├── package.json     # Dependencies, build config, publish config
├── src/
│   └── index.html   # Full app UI with update banner
└── assets/          # App icons (add your own)
    ├── icon.png     # App icon (512x512)
    ├── icon.ico     # Windows icon
    ├── icon.icns    # macOS icon
    └── tray-icon.png # System tray (16x16 or 32x32)
```

## Data Storage

All data stays local:
- **Linux**: `~/.config/wealthpulse-data/`
- **macOS**: `~/Library/Application Support/wealthpulse-data/`
- **Windows**: `%APPDATA%/wealthpulse-data/`

## Code Signing (Recommended for Production)

For macOS and Windows, unsigned apps trigger security warnings. To sign:

- **macOS**: Get an Apple Developer certificate, set `CSC_LINK` and `CSC_KEY_PASSWORD` env vars
- **Windows**: Get a code signing certificate (e.g. from DigiCert), set `CSC_LINK` and `CSC_KEY_PASSWORD`

electron-builder handles the rest automatically during `npm run publish`.

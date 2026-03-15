# Wealth — Personal Finance Tracker

A desktop app built with Electron, React, and TypeScript for tracking Fixed Deposits, Mutual Funds, Stocks, Insurance, and Postal Accounts — with smart notifications and automatic updates.

## Features

- **Fixed Deposits**: Track bank, amount, interest rate, start/maturity dates, auto-renewal
- **Mutual Funds**: Track SIP amount, SIP day, invested vs current value, returns %
- **Stocks**: Track holdings, buy/current price, P&L per stock and portfolio-wide
- **Insurance**: Track LIC and private insurance policies
- **Postal Accounts**: Track post office savings and schemes
- **Dashboard**: Portfolio overview, asset allocation pie chart, alerts, SIP schedule
- **Smart Notifications**: Desktop alerts for FD maturity and SIP dates
- **Auto-Updates**: Automatic updates via GitHub Releases
- **System Tray**: Runs in background with quick access menu
- **Persistent Storage**: Data saved locally via `electron-store`

## Installation

Download the latest installer from the [Releases](https://github.com/master-of-none/wealth/releases) page.

## Development

```bash
npm install
npm run dev
```

## Project Structure

```
wealth/
├── src/
│   ├── main/           # Electron main process (window, tray, alerts, updater, IPC)
│   ├── preload/        # Secure IPC bridge
│   └── renderer/       # React + TypeScript frontend
│       └── src/
│           ├── components/   # UI components per feature
│           ├── hooks/        # useStore, useAlerts
│           └── types/        # TypeScript types
├── assets/             # App icons
└── package.json
```

## Data Storage

All data is stored locally on your machine:

- **Windows**: `%APPDATA%/wealth/`
- **macOS**: `~/Library/Application Support/wealth/`
- **Linux**: `~/.config/wealth/`

## Notification Schedule

Desktop notifications fire at **9:00 AM** and **6:00 PM** daily, plus on startup.

| Alert              | Trigger                              |
|--------------------|--------------------------------------|
| FD maturity        | 30 days, 7 days, 1 day, or overdue   |
| SIP due            | 3 days, 1 day, or due today          |

## License

Copyright (c) 2026 Shrikrishna Bhat. All rights reserved.

This software is proprietary. Unauthorized copying, distribution, or modification is strictly prohibited.

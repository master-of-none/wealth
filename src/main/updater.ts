import { autoUpdater } from 'electron-updater'
import { dialog, BrowserWindow, app } from 'electron'

function sendUpdateStatus(
  win: BrowserWindow,
  status: string,
  message: string,
  extra: Record<string, unknown> = {}
): void {
  if (!win.isDestroyed()) {
    win.webContents.send('update-status', { status, message, ...extra })
  }
}

export function setupAutoUpdater(win: BrowserWindow): void {
  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus(win, 'checking', 'Checking for updates…')
  })

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus(win, 'available', `Version ${info.version} is available. Downloading…`)
    const { Notification } = require('electron')
    if (Notification.isSupported()) {
      new Notification({
        title: '🔄 WealthPulse Update Available',
        body: `Version ${info.version} is being downloaded in the background.`,
      }).show()
    }
  })

  autoUpdater.on('update-not-available', () => {
    sendUpdateStatus(win, 'up-to-date', "You're on the latest version.")
  })

  autoUpdater.on('download-progress', (progress) => {
    const pct = Math.round(progress.percent)
    sendUpdateStatus(win, 'downloading', `Downloading update… ${pct}%`, { percent: pct })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateStatus(win, 'ready', `Version ${info.version} downloaded. Restart to install.`)
    dialog
      .showMessageBox(win, {
        type: 'info',
        title: 'Update Ready',
        message: `WealthPulse v${info.version} has been downloaded.`,
        detail: 'Would you like to restart and install the update now?',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(false, true)
        }
      })
  })

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err)
    sendUpdateStatus(win, 'error', 'Update check failed. Will retry later.')
  })

  // Initial check 5 seconds after launch
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {})
  }, 5000)

  // Re-check every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {})
  }, 4 * 60 * 60 * 1000)
}

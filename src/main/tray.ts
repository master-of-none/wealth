import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import { checkAndNotify } from './alerts'

let tray: Tray | null = null

export function createTray(win: BrowserWindow): void {
  const iconPath = path.join(__dirname, '../../..', 'assets', 'tray-icon.png')
  try {
    tray = new Tray(iconPath)
  } catch {
    const icon = nativeImage.createFromBuffer(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2P8z8BQz0BAwMjAwPCfgYHhPwMDAxMDHoCJAQ9gGDVg1IBRA0YNGE4GAAD2uAcRgniHfwAAAABJRU5ErkJggg==',
        'base64'
      )
    )
    tray = new Tray(icon)
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open WealthPulse',
      click: () => {
        win.show()
        win.focus()
      },
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: () => {
        autoUpdater.checkForUpdatesAndNotify().catch(() => {})
      },
    },
    {
      label: 'Check Alerts Now',
      click: () => checkAndNotify(),
    },
    { type: 'separator' },
    {
      label: `Version ${app.getVersion()}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        ;(app as typeof app & { isQuitting: boolean }).isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setToolTip(`WealthPulse v${app.getVersion()}`)
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    win.show()
    win.focus()
  })
}

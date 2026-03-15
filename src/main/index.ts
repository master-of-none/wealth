import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { createTray } from './tray'
import { setupAutoUpdater } from './updater'
import { scheduleAlerts, cancelAlerts } from './alerts'
import { setupIPC } from './ipc'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 600,
    title: 'WealthPulse',
    icon: path.join(__dirname, '../../..', 'assets', 'icon.png'),
    backgroundColor: '#0a0e17',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    frame: process.platform !== 'darwin',
    show: false,
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.on('close', (e) => {
    if (!(app as typeof app & { isQuitting: boolean }).isQuitting) {
      e.preventDefault()
      mainWindow!.hide()
    }
  })
}

// Setup IPC handlers (must be done before window creation)
setupIPC()

app.whenReady().then(() => {
  createWindow()
  createTray(mainWindow!)
  scheduleAlerts()
  setupAutoUpdater(mainWindow!)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  ;(app as typeof app & { isQuitting: boolean }).isQuitting = true
  cancelAlerts()
})

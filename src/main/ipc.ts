import { ipcMain } from 'electron'
import Store from 'electron-store'
import { autoUpdater } from 'electron-updater'
import { checkAndNotify } from './alerts'

const store = new Store({ name: 'wealthpulse-data' }) as InstanceType<typeof Store>

export function setupIPC(): void {
  // Storage
  ipcMain.handle('store-get', (_event, key: string) => store.get(key, null))
  ipcMain.handle('store-set', (_event, key: string, value: unknown) => {
    store.set(key, value)
    setTimeout(checkAndNotify, 1000)
    return true
  })
  ipcMain.handle('store-delete', (_event, key: string) => {
    store.delete(key)
    return true
  })

  // Alerts
  ipcMain.handle('check-alerts', () => {
    checkAndNotify()
    return true
  })

  // Updates — manual trigger from renderer
  ipcMain.handle('check-for-updates', () => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {})
    return true
  })

  // Install downloaded update immediately
  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall(false, true)
  })

  // App version
  ipcMain.handle('get-version', () => {
    const { app } = require('electron')
    return app.getVersion()
  })
}

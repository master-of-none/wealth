import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { checkAndNotify } from './alerts'
import { dbGetAll, dbReplaceAll, dbGetSetting, dbSetSetting, getDbPath } from './db'

export function setupIPC(): void {
  // ---- Per-table DB operations ----

  // Returns all rows for a given table
  ipcMain.handle('db-get-all', (_event, table: string) => {
    return dbGetAll(table)
  })

  // Replaces all rows in a table (used when any array is updated in the renderer)
  ipcMain.handle('db-replace-all', (_event, table: string, rows: Record<string, unknown>[]) => {
    dbReplaceAll(table, rows)
    setTimeout(checkAndNotify, 500)
    return true
  })

  // Key-value settings (dismissedAlerts, permanentlyClearedAlerts)
  ipcMain.handle('db-get-setting', (_event, key: string) => {
    return dbGetSetting(key)
  })

  ipcMain.handle('db-set-setting', (_event, key: string, value: string) => {
    dbSetSetting(key, value)
    return true
  })

  // DB file location
  ipcMain.handle('get-db-path', () => getDbPath())

  // ---- Alerts ----
  ipcMain.handle('check-alerts', () => {
    checkAndNotify()
    return true
  })

  // ---- Auto-updater ----
  ipcMain.handle('check-for-updates', () => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {})
    return true
  })

  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall(false, true)
  })

  // ---- App version ----
  ipcMain.handle('get-version', () => {
    const { app } = require('electron')
    return app.getVersion()
  })
}

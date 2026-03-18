import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // ---- SQLite DB operations ----
  dbGetAll: (table: string) => ipcRenderer.invoke('db-get-all', table),
  dbReplaceAll: (table: string, rows: unknown[]) => ipcRenderer.invoke('db-replace-all', table, rows),
  dbGetSetting: (key: string) => ipcRenderer.invoke('db-get-setting', key),
  dbSetSetting: (key: string, value: string) => ipcRenderer.invoke('db-set-setting', key, value),
  getDbPath: () => ipcRenderer.invoke('get-db-path'),

  // ---- Finance notifications ----
  checkAlerts: () => ipcRenderer.invoke('check-alerts'),

  // ---- Auto-updater ----
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Listen for update-status events from main process
  onUpdateStatus: (callback: (data: Record<string, unknown>) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: Record<string, unknown>) =>
      callback(data)
    ipcRenderer.on('update-status', handler)
    return () => ipcRenderer.removeListener('update-status', handler)
  },

  platform: process.platform,
})

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // ---- Persistent storage ----
  storeGet: (key: string) => ipcRenderer.invoke('store-get', key),
  storeSet: (key: string, value: unknown) => ipcRenderer.invoke('store-set', key, value),
  storeDelete: (key: string) => ipcRenderer.invoke('store-delete', key),

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
    // Return cleanup function
    return () => ipcRenderer.removeListener('update-status', handler)
  },

  // Platform info
  platform: process.platform,
})

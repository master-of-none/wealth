const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // ---- Persistent storage ----
  storeGet: (key) => ipcRenderer.invoke("store-get", key),
  storeSet: (key, value) => ipcRenderer.invoke("store-set", key, value),
  storeDelete: (key) => ipcRenderer.invoke("store-delete", key),

  // ---- Finance notifications ----
  checkAlerts: () => ipcRenderer.invoke("check-alerts"),

  // ---- Auto-updater ----
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  getVersion: () => ipcRenderer.invoke("get-version"),

  // Listen for update-status events from main process
  onUpdateStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("update-status", handler);
    // Return cleanup function
    return () => ipcRenderer.removeListener("update-status", handler);
  },

  // Platform info
  platform: process.platform,
});

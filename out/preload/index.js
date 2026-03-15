"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // ---- Persistent storage ----
  storeGet: (key) => electron.ipcRenderer.invoke("store-get", key),
  storeSet: (key, value) => electron.ipcRenderer.invoke("store-set", key, value),
  storeDelete: (key) => electron.ipcRenderer.invoke("store-delete", key),
  // ---- Finance notifications ----
  checkAlerts: () => electron.ipcRenderer.invoke("check-alerts"),
  // ---- Auto-updater ----
  checkForUpdates: () => electron.ipcRenderer.invoke("check-for-updates"),
  installUpdate: () => electron.ipcRenderer.invoke("install-update"),
  getVersion: () => electron.ipcRenderer.invoke("get-version"),
  // Listen for update-status events from main process
  onUpdateStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("update-status", handler);
    return () => electron.ipcRenderer.removeListener("update-status", handler);
  },
  // Platform info
  platform: process.platform
});

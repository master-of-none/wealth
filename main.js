const { app, BrowserWindow, Notification, Tray, Menu, ipcMain, nativeImage, dialog } = require("electron");
const path = require("path");
const schedule = require("node-schedule");
const Store = require("electron-store");
const { autoUpdater } = require("electron-updater");

const store = new Store({ name: "wealthpulse-data" });

let mainWindow = null;
let tray = null;
let notificationJobs = [];

// ============================================================
//  AUTO-UPDATER CONFIGURATION
// ============================================================
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
  // --- Checking ---
  autoUpdater.on("checking-for-update", () => {
    sendUpdateStatus("checking", "Checking for updates…");
  });

  // --- Update available ---
  autoUpdater.on("update-available", (info) => {
    sendUpdateStatus("available", `Version ${info.version} is available. Downloading…`);
    showNotification(
      "🔄 WealthPulse Update Available",
      `Version ${info.version} is being downloaded in the background.`
    );
  });

  // --- No update ---
  autoUpdater.on("update-not-available", () => {
    sendUpdateStatus("up-to-date", "You're on the latest version.");
  });

  // --- Download progress ---
  autoUpdater.on("download-progress", (progress) => {
    const pct = Math.round(progress.percent);
    sendUpdateStatus("downloading", `Downloading update… ${pct}%`, { percent: pct });
  });

  // --- Downloaded & ready to install ---
  autoUpdater.on("update-downloaded", (info) => {
    sendUpdateStatus("ready", `Version ${info.version} downloaded. Restart to install.`);
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Ready",
        message: `WealthPulse v${info.version} has been downloaded.`,
        detail: "Would you like to restart and install the update now?",
        buttons: ["Restart Now", "Later"],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
  });

  // --- Error ---
  autoUpdater.on("error", (err) => {
    console.error("Auto-updater error:", err);
    sendUpdateStatus("error", "Update check failed. Will retry later.");
  });

  // Initial check 5 seconds after launch
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }, 5000);

  // Re-check every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }, 4 * 60 * 60 * 1000);
}

/** Send update status to the renderer so it can show a banner */
function sendUpdateStatus(status, message, extra = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-status", { status, message, ...extra });
  }
}

// ============================================================
//  WINDOW
// ============================================================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 600,
    title: "WealthPulse",
    icon: path.join(__dirname, "assets", "icon.png"),
    backgroundColor: "#0a0e17",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: "hiddenInset",
    frame: process.platform !== "darwin",
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

// ============================================================
//  SYSTEM TRAY
// ============================================================
function createTray() {
  const iconPath = path.join(__dirname, "assets", "tray-icon.png");
  try {
    tray = new Tray(iconPath);
  } catch {
    const icon = nativeImage.createFromBuffer(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2P8z8BQz0BAwMjAwPCfgYHhPwMDAxMDHoCJAQ9gGDVg1IBRA0YNGE4GAAD2uAcRgniHfwAAAABJRU5ErkJggg==",
        "base64"
      )
    );
    tray = new Tray(icon);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open WealthPulse",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: "separator" },
    {
      label: "Check for Updates",
      click: () => {
        autoUpdater.checkForUpdatesAndNotify().catch(() => {});
      },
    },
    {
      label: "Check Alerts Now",
      click: () => checkAndNotify(),
    },
    { type: "separator" },
    {
      label: `Version ${app.getVersion()}`,
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip(`WealthPulse v${app.getVersion()}`);
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// ============================================================
//  FINANCE NOTIFICATIONS
// ============================================================
function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function getNextSIPDate(sipDay) {
  const now = new Date();
  let next = new Date(now.getFullYear(), now.getMonth(), sipDay);
  if (next <= now) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, sipDay);
  }
  return next.toISOString().split("T")[0];
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function checkAndNotify() {
  const data = store.get("finance-data", { fds: [], mutualFunds: [], stocks: [] });

  data.fds.forEach((fd) => {
    const days = daysUntil(fd.maturityDate);
    if (days === 0) {
      showNotification(
        "🏦 FD Matured Today!",
        `${fd.bankName}: ${formatCurrency(fd.amount)} has matured. ${fd.autoRenew ? "Auto-renewal is enabled." : "Please renew or withdraw."}`
      );
    } else if (days === 1) {
      showNotification(
        "🏦 FD Maturing Tomorrow!",
        `${fd.bankName}: ${formatCurrency(fd.amount)} @ ${fd.interestRate}% matures tomorrow.`
      );
    } else if (days === 7) {
      showNotification(
        "🏦 FD Maturing in 7 Days",
        `${fd.bankName}: ${formatCurrency(fd.amount)} matures in one week.`
      );
    } else if (days === 30) {
      showNotification(
        "🏦 FD Maturing in 30 Days",
        `${fd.bankName}: ${formatCurrency(fd.amount)} matures in one month.`
      );
    }
  });

  data.mutualFunds.forEach((mf) => {
    if (!mf.sipDay) return;
    const nextSIP = getNextSIPDate(Number(mf.sipDay));
    const days = daysUntil(nextSIP);
    if (days === 0) {
      showNotification("📈 SIP Due Today!", `${mf.fundName}: SIP of ${formatCurrency(mf.sipAmount)} is due today.`);
    } else if (days === 1) {
      showNotification("📈 SIP Due Tomorrow", `${mf.fundName}: SIP of ${formatCurrency(mf.sipAmount)} is due tomorrow.`);
    } else if (days === 3) {
      showNotification("📈 SIP Coming Up", `${mf.fundName}: SIP of ${formatCurrency(mf.sipAmount)} is due in 3 days.`);
    }
  });
}

function showNotification(title, body) {
  if (Notification.isSupported()) {
    const notif = new Notification({ title, body, silent: false });
    notif.on("click", () => {
      mainWindow?.show();
      mainWindow?.focus();
    });
    notif.show();
  }
}

function scheduleNotifications() {
  notificationJobs.forEach((job) => job.cancel());
  notificationJobs = [];

  const morningJob = schedule.scheduleJob("0 9 * * *", () => checkAndNotify());
  if (morningJob) notificationJobs.push(morningJob);

  const eveningJob = schedule.scheduleJob("0 18 * * *", () => checkAndNotify());
  if (eveningJob) notificationJobs.push(eveningJob);

  setTimeout(checkAndNotify, 5000);
}

// ============================================================
//  IPC HANDLERS
// ============================================================

// Storage
ipcMain.handle("store-get", (_event, key) => store.get(key, null));
ipcMain.handle("store-set", (_event, key, value) => {
  store.set(key, value);
  setTimeout(checkAndNotify, 1000);
  return true;
});
ipcMain.handle("store-delete", (_event, key) => {
  store.delete(key);
  return true;
});

// Alerts
ipcMain.handle("check-alerts", () => {
  checkAndNotify();
  return true;
});

// Updates — manual trigger from renderer
ipcMain.handle("check-for-updates", () => {
  autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  return true;
});

// Install downloaded update immediately
ipcMain.handle("install-update", () => {
  autoUpdater.quitAndInstall(false, true);
});

// App version
ipcMain.handle("get-version", () => app.getVersion());

// ============================================================
//  APP LIFECYCLE
// ============================================================
app.whenReady().then(() => {
  createWindow();
  createTray();
  scheduleNotifications();
  setupAutoUpdater();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  app.isQuitting = true;
  notificationJobs.forEach((job) => job.cancel());
});

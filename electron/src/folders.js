const { app, ipcMain, shell } = require("electron");
const { mkdirSync } = require("fs");
const path = require("path");

// Need this to avoid migrating savegames and mods
const userHome = app.getPath("home");
const platformStorageRoots = {
    win32: app.getPath("appData"),
    linux: process.env.XDG_DATA_HOME ?? path.join(userHome, ".local/share"),
    darwin: path.join(userHome, "Library/Preferences"),
};

app.setPath("appData", platformStorageRoots[process.platform]);

const appData = path.join(app.getPath("appData"), "shapez.io");
const savesDir = path.join(appData, "saves");
const modsDir = path.join(appData, "mods");
const crashLogsDir = path.join(appData, "crashes");

// Here, { recursive: true } permits omitting existsSync check
mkdirSync(savesDir, { recursive: true });
mkdirSync(modsDir, { recursive: true });
mkdirSync(crashLogsDir, { recursive: true });

// Folders need to exist before it is possible to set them
app.setPath("userData", appData);

/**
 * Sets IPC handler to open various folders.
 */
function initializeFolders() {
    ipcMain.handle("open-folder", (_, folder) => {
        const folderPath = {
            saves: savesDir,
            mods: modsDir,
        }[folder];

        if (folderPath === undefined) {
            // Asked to open unknown folder
            return;
        }
        return shell.openPath(folderPath);
    });
}

module.exports = {
    initializeFolders,
    savesDir,
    modsDir,
    crashLogsDir,
};

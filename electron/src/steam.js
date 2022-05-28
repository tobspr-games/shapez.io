const { readFileSync } = require("fs");
const { join } = require("path");
const { ipcMain, app, dialog } = require("electron");
const { isDev } = require("./switches");
const { anyModLoaded } = require("./mods");

let greenworks = null;
let appId = null;
let isInitialized = false;

try {
    greenworks = require("shapez.io-private-artifacts/steam/greenworks");
    appId = parseInt(readFileSync("steam_appid.txt", "utf-8"));
} catch (err) {
    console.warn("Failed to load Steam API:", err.message);
}

/**
 * Restarts the game immediately if Steam cannot be initialized
 * without restarting (game launched outside of Steam). Doesn't
 * restart if shapez.io was launched with --dev.
 */
function restartIfNeeded() {
    if (isDev) {
        // Skip restart when in development mode
        return;
    }

    if (greenworks.restartAppIfNecessary(appId)) {
        console.log("Restarting with Steam...");
        app.exit(0);
    }
}

/**
 * Initializes Steam API (if possible) and registers relevant
 * IPC handlers for achievements and DLC. Can be safely run
 * before "ready" event.
 */
function initializeSteam() {
    ipcMain.handle("steam:is-initialized", () => isInitialized);
    ipcMain.handle("steam:activate-achievement", (_, id) => activateAchievement(id));
    ipcMain.handle("steam:check-app-ownership", (_, id) => checkAppOwnership(id));
    ipcMain.handle("steam:get-ticket", () => getTicket());

    if (greenworks === null || anyModLoaded()) {
        // Skip initialization - we won't need it anyway
        return;
    }

    restartIfNeeded();

    try {
        isInitialized = greenworks.init();
    } catch (err) {
        // This mostly happens when Steam glitches occur
        dialog.showErrorBox("Steam API Error", err.message);
        app.exit(1);
    }
}

/**
 * Activates an achievement by ID, if the game isn't running
 * with mods.
 * @param {string} id ID of achievement to activate
 */
function activateAchievement(id) {
    if (!isInitialized) {
        // Either missing greenworks or running with mods
        return;
    }

    return new Promise((resolve, reject) => {
        greenworks.activateAchievement(
            id,
            () => resolve(),
            err => reject(err)
        );
    });
}

/**
 * Checks whether the user owns specified app, used for DLC.
 * @param {number} id ID of application to check ownership of
 */
function checkAppOwnership(id) {
    if (!isInitialized) {
        // No Steam access, therefore it's impossible to check
        return false;
    }

    return greenworks.isDLCInstalled(id);
}

function getTicket() {
    if (!isInitialized) {
        // Just fail because there's nothing to do
        return Promise.reject(new Error("Steam API is not initialized."));
    }

    console.log("Requesting Steam ticket...");
    return new Promise((resolve, reject) => {
        greenworks.getAuthSessionTicket(
            success => resolve(success.ticket.toString("hex")),
            error => {
                console.error("Failed to get steam ticket:", error);
                reject(error);
            }
        );
    });
}

module.exports = { initializeSteam };

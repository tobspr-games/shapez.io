const { app, dialog } = require("electron");
const { readFileSync } = require("fs");
const path = require("path");

/**
 * List of mods to load manually
 * @type {string[]}
 */
const externalModList = [];

/**
 * Retrieves external mod list and sets up the application,
 * should be called only before the app is ready.
 */
function initializeSwitches() {
    if (!app.commandLine.hasSwitch("disable-features")) {
        // Disable Chromium's media keys handler to avoid interfering with
        // media controls and other apps (such as pausing in-game music)
        app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling");
    }

    // First load mod list, then other mods
    externalModList.push(...parseExternalModList());
    externalModList.push(...parseCommandLineMods());
}

/**
 * Returns an array of absolute file paths to mods loaded using
 * --load-mod=path/mod1.js,path/mod2.js argument, or none if the
 * argument is missing.
 */
function parseCommandLineMods() {
    const loadModList = app.commandLine.getSwitchValue("load-mod");
    if (!loadModList) {
        // Empty or missing
        return [];
    }

    const files = loadModList.split(",");
    return resolveAllFiles(files);
}

/**
 * Returns an array of absolute file paths to mods loaded using
 * --mod-list=path/to/mods.json argument (JSON array), or none
 * if the file wasn't specified or found.
 */
function parseExternalModList() {
    const modListPath = app.commandLine.getSwitchValue("mod-list");
    if (!modListPath) {
        // None requested, let's just skip that
        return [];
    }

    try {
        // Read the file and return resolved mod file paths
        const json = readFileSync(modListPath, "utf-8");
        return resolveAllFiles(JSON.parse(json));
    } catch (err) {
        // Something went wrong - notify and continue
        dialog.showErrorBox("Failed to load external mod list!", err.stack);
        return [];
    }
}

/**
 * Small utility to resolve all file paths in an array.
 * @param {string[]} files
 */
function resolveAllFiles(files) {
    return files.map(file => path.resolve(file));
}

module.exports = {
    initializeSwitches,
    // Shows a menu on the window with useful actions
    isDev: app.commandLine.hasSwitch("dev"),
    // Instructs the renderer to use bundle hosted on localhost
    isLocal: app.commandLine.hasSwitch("local"),
    // Disables all mods except manually loaded ones
    isSafeMode: app.commandLine.hasSwitch("safe-mode"),
    // Suppresses initial toggle of developer tools
    shouldHideDevtools: app.commandLine.hasSwitch("hide-devtools"),
    externalModList,
};

const { dialog, ipcMain } = require("electron");
const { readdirSync, readFileSync, existsSync } = require("fs");
const { basename, join } = require("path");
const { modsDir } = require("./folders");
const { externalModList, isSafeMode, isDev } = require("./switches");

/**
 * Map of mod files to source code, populated when initializing mods.
 * @type {Map<string, string>}
 * @todo Leverage this to implement disalbing mods
 */
const modSources = new Map();

/**
 * Stores all mod loading errors to report them later.
 * @type {Map<string, Error>}
 */
const modErrors = new Map();

/**
 * Returns an array of all mod files found in mods/ directory,
 * skipping the search if safe mode is turned on.
 * @return {string[]}
 */
function getModFiles() {
    if (isSafeMode) {
        return [];
    }

    const files = readdirSync(modsDir).filter(file => file.endsWith(".js"));
    return files.map(file => join(modsDir, file));
}

/**
 * Tries to read all mod files and store their source code in a map,
 * and registers an IPC handler to return mod source code.
 */
function initializeMods() {
    // Not checking whether external mods exist, it's done later
    const loadOrder = [...getModFiles(), ...externalModList];

    for (const file of loadOrder) {
        // Each mod has own try/catch block so a single mod won't
        // break everything else
        try {
            const code = readFileSync(file, "utf-8");
            modSources.set(file, code);
        } catch (err) {
            if (err instanceof Error) {
                // Ensure only Error objects get there
                modErrors.set(basename(file), err);
            } else {
                // Otherwise, silently log them - the mod is throwing
                // random stuff
                console.error("A mod reported unknown error:", err);
            }

            console.warn("Failed to load a mod:", file);
        }
    }

    console.log(modSources.size, "mod files found");

    ipcMain.handle("get-mods", () => {
        // Renderer only needs relative file names
        /** @type {{ filename: string, source: string }[]} */
        const mods = [];
        for (const [file, source] of modSources.entries()) {
            // Note: duplicates are possible, so we're not using a map here
            mods.push({ filename: basename(file), source });
        }

        return mods;
    });

    ipcMain.on("mod-error", (_, filename, error) => {
        // A single mod can't have more than one error,
        // so just set filename -> error
        modErrors.set(filename, error);
    });

    ipcMain.on("show-mod-errors", () => showModErrors());
}

/**
 * Displays a warning about missing external mod files.
 * Make sure to call this after "ready" app event.
 */
function showMissingExternalMods() {
    const missing = externalModList.filter(mod => !existsSync(mod));
    if (missing.length == 0) {
        // None missing, or none were specified
        return;
    }

    const message = missing.map(mod => ` - ${mod}`).join("\n");
    return dialog.showMessageBox({
        title: "External Mod Errors",
        message: "These mod files could not be found:",
        detail: message,
        type: "warning",
    });
}

/**
 * Shows a dialog with collected mod loading errors, if
 * there were any. Can only be called once the app is ready.
 */
function showModErrors() {
    if (modErrors.size == 0) {
        // We're lucky - no errors reported
        return;
    }

    let errorText = "";
    for (const [mod, error] of modErrors.entries()) {
        // Show full errors with --dev
        errorText += `${mod}: ${isDev ? "\n" + error.stack : error.message}\n`;
    }

    return dialog.showMessageBox({
        title: "Mod Errors",
        message: "Failed to load some mods:",
        detail: errorText,
    });
}

function anyModLoaded() {
    return modSources.size > 0;
}

module.exports = {
    initializeMods,
    showMissingExternalMods,
    anyModLoaded,
};

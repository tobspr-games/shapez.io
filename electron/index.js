/* eslint-disable quotes,no-undef */

const { app, BrowserWindow, Menu, MenuItem, ipcMain, shell } = require("electron");
const { join, dirname, resolve } = require("path");
const url = require("url");
const fs = require("fs");

const steam = require("./steam");
const asyncLock = require("async-lock");

const isDev = app.commandLine.hasSwitch("dev");
const isLocal = app.commandLine.hasSwitch("local");
const temporaryMod = app.commandLine.getSwitchValue("load-mod");
const safeMode = app.commandLine.hasSwitch("safe-mode");

const roamingFolder =
    process.env.APPDATA ||
    (process.platform == "darwin"
        ? process.env.HOME + "/Library/Preferences"
        : process.env.HOME + "/.local/share");
let storePath = join(roamingFolder, "shapez.io", "saves");
let modsPath = join(roamingFolder, "shapez.io", "mods");

// No try-catch by design
fs.mkdirSync(storePath, { recursive: true });
fs.mkdirSync(modsPath, { recursive: true });

/** @type {BrowserWindow} */
let win = null;
let menu = null;

function createWindow() {
    let faviconExtension = ".png";
    if (process.platform === "win32") {
        faviconExtension = ".ico";
    }

    win = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        backgroundColor: "#222428",
        useContentSize: true,
        minWidth: 800,
        minHeight: 600,
        title: "shapez.io Standalone",
        transparent: false,
        icon: join(__dirname, "favicon" + faviconExtension),
        // fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
        },
        allowRunningInsecureContent: false,
    });

    if (isLocal) {
        win.loadURL("http://localhost:3005");
    } else {
        win.loadURL(
            url.format({
                pathname: join(__dirname, "index.html"),
                protocol: "file:",
                slashes: true,
            })
        );
    }
    win.webContents.session.clearCache();
    win.webContents.session.clearStorageData();

    win.webContents.on("new-window", (event, pth) => {
        event.preventDefault();
        shell.openExternal(pth);
    });

    win.on("closed", () => {
        console.log("Window closed");
        win = null;
    });

    if (isDev) {
        menu = new Menu();

        win.toggleDevTools();

        const mainItem = new MenuItem({
            label: "Toggle Dev Tools",
            click: () => win.toggleDevTools(),
            accelerator: "F12",
        });
        menu.append(mainItem);

        const reloadItem = new MenuItem({
            label: "Restart",
            click: () => win.reload(),
            accelerator: "F5",
        });
        menu.append(reloadItem);

        const fullscreenItem = new MenuItem({
            label: "Fullscreen",
            click: () => win.setFullScreen(!win.isFullScreen()),
            accelerator: "F11",
        });
        menu.append(fullscreenItem);

        Menu.setApplicationMenu(menu);
    } else {
        Menu.setApplicationMenu(null);
    }

    win.once("ready-to-show", () => {
        win.show();
        win.focus();
    });
}

if (!app.requestSingleInstanceLock()) {
    app.exit(0);
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus
        if (win) {
            if (win.isMinimized()) {
                win.restore();
            }
            win.focus();
        }
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    console.log("All windows closed");
    app.quit();
});

ipcMain.on("set-fullscreen", (_event, flag) => {
    win.setFullScreen(flag);
});

ipcMain.on("exit-app", (_event, _flag) => {
    win.close();
    app.quit();
});

let renameCounter = 1;

const fileLock = new asyncLock({
    timeout: 30000,
    maxPending: 1000,
});

function niceFileName(filename) {
    return filename.replace(storePath, "@");
}

async function writeFileSafe(filename, contents) {
    ++renameCounter;
    const prefix = "[ " + renameCounter + ":" + niceFileName(filename) + " ] ";
    const transactionId = String(new Date().getTime()) + "." + renameCounter;

    if (fileLock.isBusy()) {
        console.warn(prefix, "Concurrent write process on", filename);
    }

    fileLock.acquire(filename, async () => {
        console.log(prefix, "Starting write on", niceFileName(filename), "in transaction", transactionId);

        if (!fs.existsSync(filename)) {
            // this one is easy
            console.log(prefix, "Writing file instantly because it does not exist:", niceFileName(filename));
            await fs.promises.writeFile(filename, contents, "utf-8");
            return;
        }

        // first, write a temporary file (.tmp-XXX)
        const tempName = filename + ".tmp-" + transactionId;
        console.log(prefix, "Writing temporary file", niceFileName(tempName));
        await fs.promises.writeFile(tempName, contents, "utf-8");

        // now, rename the original file to (.backup-XXX)
        const oldTemporaryName = filename + ".backup-" + transactionId;
        console.log(
            prefix,
            "Renaming old file",
            niceFileName(filename),
            "to",
            niceFileName(oldTemporaryName)
        );
        await fs.promises.rename(filename, oldTemporaryName);

        // now, rename the temporary file (.tmp-XXX) to the target
        console.log(
            prefix,
            "Renaming the temporary file",
            niceFileName(tempName),
            "to the original",
            niceFileName(filename)
        );
        await fs.promises.rename(tempName, filename);

        // we are done now, try to create a backup, but don't fail if the backup fails
        try {
            // check if there is an old backup file
            const backupFileName = filename + ".backup";
            if (fs.existsSync(backupFileName)) {
                console.log(prefix, "Deleting old backup file", niceFileName(backupFileName));
                // delete the old backup
                await fs.promises.unlink(backupFileName);
            }

            // rename the old file to the new backup file
            console.log(prefix, "Moving", niceFileName(oldTemporaryName), "to the backup file location");
            await fs.promises.rename(oldTemporaryName, backupFileName);
        } catch (ex) {
            console.error(prefix, "Failed to switch backup files:", ex);
        }
    });
}

async function performFsJob(job) {
    const fname = join(storePath, job.filename);

    switch (job.type) {
        case "read": {
            if (!fs.existsSync(fname)) {
                return {
                    // Special FILE_NOT_FOUND error code
                    error: "file_not_found",
                };
            }

            try {
                const data = await fs.promises.readFile(fname, "utf-8");
                return {
                    success: true,
                    data,
                };
            } catch (ex) {
                return {
                    error: ex,
                };
            }
        }
        case "write": {
            try {
                await writeFileSafe(fname, job.contents);
                return {
                    success: true,
                    data: job.contents,
                };
            } catch (ex) {
                return {
                    error: ex,
                };
            }
        }

        case "delete": {
            try {
                await fs.promises.unlink(fname);
            } catch (ex) {
                return {
                    error: ex,
                };
            }

            return {
                success: true,
                data: null,
            };
        }

        default:
            throw new Error("Unknown fs job: " + job.type);
    }
}

ipcMain.on("fs-job", async (event, arg) => {
    const result = await performFsJob(arg);
    event.reply("fs-response", { id: arg.id, result });
});

ipcMain.on("open-mods-folder", async () => {
    shell.openPath(modsPath);
});

async function searchForMods() {
    const files = [];
    console.log("Searching for mods in %s", modsPath);

    try {
        for (const file of await fs.promises.readdir(modsPath)) {
            if (file.endsWith(".js")) {
                modFiles.push(resolve(modsPath, file));
            }
        }
    } catch (err) {
        // Most likely, the directory does not exist (ENOENT)
        console.warn("Failed to load mods from %s:", modsPath, err);
    }

    return files;
}

ipcMain.handle("get-mods", async (_event, _arg) => {
    const modFiles = [];

    if (temporaryMod) {
        // Load mod specified on the command line.
        // Together with --safe-mode, it's possible to load only
        // this mod.
        modFiles.push(resolve(temporaryMod));
    }

    if (!safeMode) {
        modFiles.push(...(await searchForMods()));
    } else {
        console.log("Safe mode is turned on, skipping mod search");
    }

    try {
        const modContents = [];
        console.log("Loading %d mod(s)", modFiles.length);

        for (const modFile of modFiles) {
            modContents.push(await fs.promises.readFile(modFile, "utf-8"));
        }

        return modContents;
    } catch (ex) {
        throw new Error(ex);
    }
});

steam.init(isDev);
steam.listen();

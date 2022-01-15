/* eslint-disable quotes,no-undef */

const { app, BrowserWindow, Menu, MenuItem, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");
const steam = require("./steam");
const asyncLock = require("async-lock");

const isDev = app.commandLine.hasSwitch("dev");
const isLocal = app.commandLine.hasSwitch("local");
const safeMode = app.commandLine.hasSwitch("safe-mode");
const externalMod = app.commandLine.getSwitchValue("load-mod");

const roamingFolder =
    process.env.APPDATA ||
    (process.platform == "darwin"
        ? process.env.HOME + "/Library/Preferences"
        : process.env.HOME + "/.local/share");

let storePath = path.join(roamingFolder, "shapez.io", "saves");
let modsPath = path.join(roamingFolder, "shapez.io", "mods");

if (!fs.existsSync(storePath)) {
    // No try-catch by design
    fs.mkdirSync(storePath, { recursive: true });
}

if (!fs.existsSync(modsPath)) {
    fs.mkdirSync(modsPath, { recursive: true });
}

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
        icon: path.join(__dirname, "favicon" + faviconExtension),
        // fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            webSecurity: true,
            sandbox: true,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
        allowRunningInsecureContent: false,
    });

    if (isLocal) {
        win.loadURL("http://localhost:3005");
    } else {
        win.loadURL(
            url.format({
                pathname: path.join(__dirname, "index.html"),
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
    app.on("second-instance", () => {
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

ipcMain.on("set-fullscreen", (event, flag) => {
    win.setFullScreen(flag);
});

ipcMain.on("exit-app", () => {
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
            await fs.promises.writeFile(filename, contents, "utf8");
            return;
        }

        // first, write a temporary file (.tmp-XXX)
        const tempName = filename + ".tmp-" + transactionId;
        console.log(prefix, "Writing temporary file", niceFileName(tempName));
        await fs.promises.writeFile(tempName, contents, "utf8");

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

ipcMain.handle("fs-job", async (event, job) => {
    const filenameSafe = job.filename.replace(/[^a-z\.\-_0-9]/i, "");
    const fname = path.join(storePath, filenameSafe);
    switch (job.type) {
        case "read": {
            if (!fs.existsSync(fname)) {
                // Special FILE_NOT_FOUND error code
                return { error: "file_not_found" };
            }
            return await fs.promises.readFile(fname, "utf8");
        }
        case "write": {
            await writeFileSafe(fname, job.contents);
            return job.contents;
        }

        case "delete": {
            await fs.promises.unlink(fname);
            return;
        }

        default:
            throw new Error("Unknown fs job: " + job.type);
    }
});

ipcMain.handle("open-mods-folder", async () => {
    shell.openPath(modsPath);
});

ipcMain.handle("get-mods", async () => {
    if (safeMode) {
        console.log("Safe Mode enabled for mods, skipping mod search");
    }

    try {
        console.log("Loading mods from", modsPath);
        let modFiles = safeMode
            ? []
            : fs
                  .readdirSync(modsPath)
                  .filter(filename => filename.endsWith(".js"))
                  .map(filename => path.join(modsPath, filename));

        if (externalMod) {
            console.log("Adding external mod source:", externalMod);
            modFiles.push(externalMod);
        }

        if (modFiles.length > 0 && !isDev) {
            let confirmed = false;
            while (!confirmed) {
                const response = await dialog.showMessageBox(win, {
                    message:
                        "You have installed one or more mods for shapez.io. Please confirm that you are aware of the risks and install mods only from trusted sources.",
                    buttons: ["Exit Game", "Continue"],
                    type: "warning",
                    defaultId: 0,

                    checkboxLabel:
                        "I understand that mods have access to my file system and can be potentially harmful",
                    checkboxChecked: false,
                    cancelId: 0,
                });
                if (response.response === 1) {
                    if (response.checkboxChecked) {
                        break;
                    } else {
                        await dialog.showMessageBox(win, {
                            message:
                                "Please confirm that you have understood the risks by checking the checkbox in the next dialog.",
                        });
                    }
                }
                if (response.response === 0) {
                    process.exit(0);
                    return;
                }
            }
        }

        return modFiles.map(filename => fs.readFileSync(filename, "utf8"));
    } catch (ex) {
        throw new Error(ex);
    }
});

steam.init(isDev);
steam.listen();

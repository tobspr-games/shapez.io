/* eslint-disable quotes,no-undef */

const { app, BrowserWindow, Menu, MenuItem, ipcMain, shell, dialog, session } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");
const http = require("http");
const steam = require("./steam");
const asyncLock = require("async-lock");
const windowStateKeeper = require("electron-window-state");

const isDev = app.commandLine.hasSwitch("dev");
const isLocal = app.commandLine.hasSwitch("local");
const safeMode = app.commandLine.hasSwitch("safe-mode");
const externalMod = app.commandLine.getSwitchValue("load-mod");
const rlApiEnabled = app.commandLine.hasSwitch("rl-api") || process.env.SHAPEZ_RL_API === "1";
const rlHeadlessEnabled =
    app.commandLine.hasSwitch("rl-headless") || process.env.SHAPEZ_RL_HEADLESS === "1";
const rlApiPort = Number(
    app.commandLine.getSwitchValue("rl-api-port") || process.env.SHAPEZ_RL_API_PORT || 17872
);
const localUrl =
    app.commandLine.getSwitchValue("local-url") || process.env.SHAPEZ_LOCAL_URL || "http://localhost:3005";
const rlUserDataDir =
    app.commandLine.getSwitchValue("rl-user-data-dir") || process.env.SHAPEZ_RL_USER_DATA_DIR;

// Disable hardware key handling, i.e. being able to pause/resume the game music
// with hardware keys
app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling");

if (rlHeadlessEnabled) {
    if (rlUserDataDir) {
        app.setPath("userData", rlUserDataDir);
    }
    app.commandLine.appendSwitch("disable-gpu");
    app.commandLine.appendSwitch("mute-audio");
}

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
let rlServer = null;
let rlRequestCounter = 1;
const rlPendingRequests = new Map();

function writeJsonResponse(res, statusCode, payload) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.setEncoding("utf8");
        req.on("data", chunk => {
            body += chunk;
            if (body.length > 1024) {
                reject(new Error("request-too-large"));
            }
        });
        req.on("end", () => resolve(body));
        req.on("error", reject);
    });
}

async function readJsonRequestBody(req) {
    const body = await readRequestBody(req);
    if (!body.trim()) {
        return {};
    }
    try {
        return JSON.parse(body);
    } catch (ex) {
        throw new Error("bad-json");
    }
}

function requestRlRenderer(channel, payload = {}) {
    return new Promise((resolve, reject) => {
        if (!win || win.isDestroyed()) {
            reject(new Error("window-not-ready"));
            return;
        }

        const requestId = String(rlRequestCounter++);
        const timeout = setTimeout(() => {
            rlPendingRequests.delete(requestId);
            reject(new Error("renderer-timeout"));
        }, 5000);

        rlPendingRequests.set(requestId, { resolve, reject, timeout });
        win.webContents.send(channel, {
            ...payload,
            requestId,
        });
    });
}

function requestRlGameStateFromRenderer() {
    return requestRlRenderer("rl:get-game-state");
}

function requestRlMapFromRenderer(bounds) {
    return requestRlRenderer("rl:get-map", { bounds });
}

function requestRlResetFromRenderer(seed) {
    return requestRlRenderer("rl:reset", { seed });
}

function requestRlTickFromRenderer(ticks) {
    return requestRlRenderer("rl:tick", { ticks });
}

function requestRlDestroyRemovableBuildingsFromRenderer() {
    return requestRlRenderer("rl:destroy-removable-buildings");
}

function requestRlPlaceBuildingFromRenderer(building) {
    return requestRlRenderer("rl:place-building", { building });
}

function sendRlRendererResult(res, result) {
    if (!result.ok) {
        writeJsonResponse(res, result.status || 503, { error: result.error || "not-ready" });
        return;
    }
    writeJsonResponse(res, 200, result.body);
}

function parseIntegerQueryParam(searchParams, name, defaultValue) {
    const value = searchParams.get(name);
    if (value === null) {
        return defaultValue;
    }
    if (!/^-?\d+$/.test(value)) {
        return null;
    }
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseOptionalSeed(seed) {
    if (seed === undefined || seed === null) {
        return null;
    }
    return Number.isSafeInteger(seed) && seed >= 0 ? seed : null;
}

function withHeadlessQuery(targetUrl) {
    if (!rlHeadlessEnabled) {
        return targetUrl;
    }
    const parsedUrl = new URL(targetUrl);
    parsedUrl.searchParams.set("rl-headless", "1");
    return parsedUrl.toString();
}

function startRlApiServer() {
    if (!rlApiEnabled || rlServer) {
        return;
    }

    rlServer = http.createServer(async (req, res) => {
        const requestUrl = new URL(req.url, "http://127.0.0.1");

        try {
            if (requestUrl.pathname === "/rl/gamestate") {
                if (req.method !== "GET") {
                    writeJsonResponse(res, 405, { error: "method-not-allowed" });
                    return;
                }
                sendRlRendererResult(res, await requestRlGameStateFromRenderer());
                return;
            }

            if (requestUrl.pathname === "/rl/map") {
                if (req.method !== "GET") {
                    writeJsonResponse(res, 405, { error: "method-not-allowed" });
                    return;
                }

                const bounds = {
                    x: parseIntegerQueryParam(requestUrl.searchParams, "x", -16),
                    y: parseIntegerQueryParam(requestUrl.searchParams, "y", -16),
                    w: parseIntegerQueryParam(requestUrl.searchParams, "w", 32),
                    h: parseIntegerQueryParam(requestUrl.searchParams, "h", 32),
                };
                if (
                    bounds.x === null ||
                    bounds.y === null ||
                    bounds.w === null ||
                    bounds.h === null ||
                    bounds.w <= 0 ||
                    bounds.h <= 0
                ) {
                    writeJsonResponse(res, 400, {
                        error: "map-bounds-must-be-safe-integers-with-positive-size",
                    });
                    return;
                }

                sendRlRendererResult(res, await requestRlMapFromRenderer(bounds));
                return;
            }

            if (requestUrl.pathname === "/rl/reset") {
                if (req.method !== "POST") {
                    writeJsonResponse(res, 405, { error: "method-not-allowed" });
                    return;
                }

                const body = await readJsonRequestBody(req);
                const seed = parseOptionalSeed(body.seed);
                if (body.seed !== undefined && body.seed !== null && seed === null) {
                    writeJsonResponse(res, 400, {
                        error: "seed-must-be-non-negative-safe-integer",
                    });
                    return;
                }

                sendRlRendererResult(res, await requestRlResetFromRenderer(seed));
                return;
            }

            if (requestUrl.pathname === "/rl/tick") {
                if (req.method !== "POST") {
                    writeJsonResponse(res, 405, { error: "method-not-allowed" });
                    return;
                }

                const body = await readJsonRequestBody(req);
                const ticks = body.ticks === undefined ? 1 : body.ticks;
                if (!Number.isInteger(ticks) || ticks < 0 || ticks > 100000) {
                    writeJsonResponse(res, 400, { error: "ticks-must-be-integer-0-to-100000" });
                    return;
                }

                sendRlRendererResult(res, await requestRlTickFromRenderer(ticks));
                return;
            }

            if (requestUrl.pathname === "/rl/building") {
                if (req.method !== "POST") {
                    writeJsonResponse(res, 405, { error: "method-not-allowed" });
                    return;
                }

                const body = await readJsonRequestBody(req);
                sendRlRendererResult(res, await requestRlPlaceBuildingFromRenderer(body));
                return;
            }

            if (requestUrl.pathname === "/rl/destroy-removable-buildings") {
                if (req.method !== "POST") {
                    writeJsonResponse(res, 405, { error: "method-not-allowed" });
                    return;
                }

                sendRlRendererResult(res, await requestRlDestroyRemovableBuildingsFromRenderer());
                return;
            }

            writeJsonResponse(res, 404, { error: "not-found" });
        } catch (ex) {
            writeJsonResponse(res, 503, { error: ex.message || "rl-api-failed" });
        }
    });

    rlServer.listen(rlApiPort, "127.0.0.1", () => {
        console.log("RL API listening at http://127.0.0.1:" + rlApiPort);
    });
}

function createWindow() {
    let faviconExtension = ".png";
    if (process.platform === "win32") {
        faviconExtension = ".ico";
    }

    const mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800,
    });

    win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        show: false,
        backgroundColor: "#222428",
        useContentSize: false,
        minWidth: 800,
        minHeight: 600,
        title: "shapez",
        transparent: false,
        icon: path.join(__dirname, "favicon" + faviconExtension),
        // fullscreen: true,
        autoHideMenuBar: !isDev,
        webPreferences: {
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            contextIsolation: true,
            enableRemoteModule: false,
            disableBlinkFeatures: "Auxclick",

            webSecurity: true,
            sandbox: true,
            backgroundThrottling: !rlHeadlessEnabled,
            preload: path.join(__dirname, "preload.js"),
            experimentalFeatures: false,
        },
        allowRunningInsecureContent: false,
    });

    mainWindowState.manage(win);

    if (isLocal) {
        win.loadURL(withHeadlessQuery(localUrl));
    } else {
        win.loadURL(
            url.format({
                pathname: path.join(__dirname, "index.html"),
                protocol: "file:",
                slashes: true,
                query: rlHeadlessEnabled ? { "rl-headless": "1" } : undefined,
            })
        );
    }
    win.webContents.session.clearCache();
    win.webContents.session.clearStorageData();

    ////// SECURITY

    // Disable permission requests
    win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        callback(false);
    });
    session.fromPartition("default").setPermissionRequestHandler((webContents, permission, callback) => {
        callback(false);
    });

    app.on("web-contents-created", (event, contents) => {
        // Disable vewbiew
        contents.on("will-attach-webview", (event, webPreferences, params) => {
            event.preventDefault();
        });
        // Disable navigation
        contents.on("will-navigate", (event, navigationUrl) => {
            event.preventDefault();
        });
    });

    win.webContents.on("will-redirect", (contentsEvent, navigationUrl) => {
        // Log and prevent the app from redirecting to a new page
        console.error(
            `The application tried to redirect to the following address: '${navigationUrl}'. This attempt was blocked.`
        );
        contentsEvent.preventDefault();
    });

    // Filter loading any module via remote;
    // you shouldn't be using remote at all, though
    // https://electronjs.org/docs/tutorial/security#16-filter-the-remote-module
    app.on("remote-require", (event, webContents, moduleName) => {
        event.preventDefault();
    });

    // built-ins are modules such as "app"
    app.on("remote-get-builtin", (event, webContents, moduleName) => {
        event.preventDefault();
    });

    app.on("remote-get-global", (event, webContents, globalName) => {
        event.preventDefault();
    });

    app.on("remote-get-current-window", (event, webContents) => {
        event.preventDefault();
    });

    app.on("remote-get-current-web-contents", (event, webContents) => {
        event.preventDefault();
    });

    //// END SECURITY

    win.webContents.on("new-window", (event, pth) => {
        event.preventDefault();

        if (pth.startsWith("https://") || pth.startsWith("steam://")) {
            shell.openExternal(pth);
        }
    });

    win.on("closed", () => {
        console.log("Window closed");
        win = null;
    });

    startRlApiServer();

    if (isDev) {
        menu = new Menu();

        if (!rlHeadlessEnabled) {
            win.webContents.toggleDevTools();
        }

        const mainItem = new MenuItem({
            label: "Toggle Dev Tools",
            click: () => win.webContents.toggleDevTools(),
            accelerator: "F12",
        });
        menu.append(mainItem);

        const reloadItem = new MenuItem({
            label: "Reload",
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

        const mainMenu = new Menu();
        mainMenu.append(
            new MenuItem({
                label: "shapez.io",
                submenu: menu,
            })
        );

        Menu.setApplicationMenu(mainMenu);
    } else {
        Menu.setApplicationMenu(null);
    }

    win.once("ready-to-show", () => {
        if (!rlHeadlessEnabled) {
            win.show();
            win.focus();
        }
    });
}

if (!rlHeadlessEnabled && !app.requestSingleInstanceLock()) {
    app.exit(0);
} else if (!rlHeadlessEnabled) {
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
    if (rlServer) {
        rlServer.close();
        rlServer = null;
    }
    app.quit();
});

function handleRlRendererResponse(event, payload) {
    if (!win || event.sender !== win.webContents || !payload || !payload.requestId) {
        return;
    }

    const pending = rlPendingRequests.get(payload.requestId);
    if (!pending) {
        return;
    }

    clearTimeout(pending.timeout);
    rlPendingRequests.delete(payload.requestId);
    pending.resolve(payload);
}

ipcMain.on("rl:game-state-response", handleRlRendererResponse);
ipcMain.on("rl:map-response", handleRlRendererResponse);
ipcMain.on("rl:reset-response", handleRlRendererResponse);
ipcMain.on("rl:tick-response", handleRlRendererResponse);
ipcMain.on("rl:destroy-removable-buildings-response", handleRlRendererResponse);
ipcMain.on("rl:place-building-response", handleRlRendererResponse);

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
    const filenameSafe = job.filename.replace(/[^a-z\.\-_0-9]/gi, "_");
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

console.log("Loading mods ...");

function loadMods() {
    if (safeMode) {
        console.log("Safe Mode enabled for mods, skipping mod search");
    }
    console.log("Loading mods from", modsPath);
    let modFiles = safeMode
        ? []
        : fs
              .readdirSync(modsPath)
              .filter(filename => filename.endsWith(".js"))
              .map(filename => path.join(modsPath, filename));

    if (externalMod) {
        console.log("Adding external mod source:", externalMod);
        const externalModPaths = externalMod.split(",");
        modFiles = modFiles.concat(externalModPaths);
    }

    return modFiles.map(filename => fs.readFileSync(filename, "utf8"));
}

let mods = [];
try {
    mods = loadMods();
    console.log("Loaded", mods.length, "mods");
} catch (ex) {
    console.error("Failed to load mods");
    dialog.showErrorBox("Failed to load mods:", ex);
}

ipcMain.handle("get-mods", async () => {
    return mods;
});

steam.init(isDev);

// Only allow achievements and puzzle DLC if no mods are loaded
if (mods.length === 0) {
    steam.listen();
}

const { app, ipcMain, shell } = require("electron");
const { writeFile } = require("fs/promises");
const path = require("path");
const { crashLogsDir } = require("./folders");

/**
 * Writes a crash log and reveals it in file manager.
 * @param {string} errorStack Stacktrace from renderer
 */
async function writeCrashLog(errorStack) {
    const separator = `\n${"=".repeat(20)}\n\n`;
    let contents = errorStack + separator;

    contents += "GPU Features:\n";

    const gpuFeatures = Object.entries(app.getGPUFeatureStatus());
    for (const [feature, status] of gpuFeatures) {
        contents += `${feature}:\t${status}`;
    }

    const gpuInfo = await app.getGPUInfo("basic");
    contents += separator;

    for (const gpu of gpuInfo.gpuDevice) {
        contents += "GPU Active: " + (gpu.active ? "Yes" : "No");
        contents += "Vendor: 0x" + gpu.vendorId.toString(16);
        contents += "Device: 0x" + gpu.deviceId.toString(16);
        contents += "\n";
    }

    const date = new Date().toISOString();
    contents += separator + "Date: " + date;

    const target = path.join(crashLogsDir, date + ".log");
    await writeFile(target, contents, "utf-8");
    console.log("Wrote crash log to", path.basename(target));

    shell.showItemInFolder(target);
}

/**
 * Setup an IPC handler to write and reveal crash logs as soon
 * as an error occurs.
 */
function initializeCrashLogs() {
    ipcMain.on("write-crash-log", (_, stack) => {
        // Write crash logs if we've been told to
        writeCrashLog(stack);
    });

    // Also attempt to catch main process errors
    process.on("uncaughtException", error => {
        writeCrashLog(error.stack);
    });
}

module.exports = { initializeCrashLogs };

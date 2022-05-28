const AsyncLock = require("async-lock");
const { ipcMain, shell } = require("electron");
const { existsSync } = require("fs");
const { unlink, readFile, writeFile, rename } = require("fs/promises");
const path = require("path");
const { savesDir } = require("./folders");

let renameCounter = 1;

const fileLock = new AsyncLock({
    timeout: 30000,
    maxPending: 1000,
});

/**
 * Generic handler for FS jobs.
 * @param {{ type: "read"|"write"|"delete"|"reveal", filename: string, contents?: any }} job
 */
async function onFilesystemJob(_, job) {
    const safeFileName = sanitizeFileName(job.filename);
    const filePath = path.join(savesDir, safeFileName);

    switch (job.type) {
        case "read":
            if (!existsSync(filePath)) {
                // Notify the renderer
                return { error: "file_not_found" };
            }

            return await readFile(filePath, "utf-8");
        case "write":
            await writeFileSafe(filePath, job.contents);
            return job.contents;
        case "delete":
            await unlink(filePath);
            return;
        case "reveal":
            shell.showItemInFolder(filePath);
            return;
        default:
            throw new Error("Unknown FS job: " + job.type);
    }
}

async function writeFileSafe(file, contents) {
    renameCounter++;
    const prefix = `[ ${renameCounter}:${path.basename(file)} ] `;
    const transactionId = Date.now() + "." + renameCounter;

    if (fileLock.isBusy()) {
        console.warn(prefix, "Concurrent write process on", file);
    }

    fileLock.acquire(file, async () => {
        console.log(prefix, "Starting write in transaction", transactionId);

        if (!existsSync(file)) {
            // This one is easy - write directly
            console.log(prefix, "Creating a new file");
            await writeFile(file, contents, "utf-8");
            return;
        }

        // First, write a temporary file (.tmp-XXX)
        const tempName = file + ".tmp-" + transactionId;
        console.log(prefix, "Writing temporary file", path.basename(tempName));
        await writeFile(tempName, contents, "utf-8");

        // Now, rename the original file to (.backup-XXX)
        const oldTemporaryName = file + ".backup-" + transactionId;
        console.log(prefix, "Renaming old file to", path.basename(oldTemporaryName));
        await rename(file, oldTemporaryName);

        // Now, rename the temporary file (.tmp-XXX) to the target
        console.log(prefix, "Renaming the temporary file", path.basename(tempName), "to the original file");
        await rename(tempName, file);

        // We are done now, try to create a backup, but don't fail if the backup fails
        try {
            // Check if there is an old backup file
            const backupFileName = file + ".backup";
            if (existsSync(backupFileName)) {
                console.log(prefix, "Deleting old backup file", path.basename(backupFileName));
                await unlink(backupFileName);
            }

            // Rename the old file to the new backup file
            console.log(prefix, "Moving", path.basename(oldTemporaryName), "to the backup file location");
            await rename(oldTemporaryName, backupFileName);
        } catch (err) {
            console.error(prefix, "Failed to swap backup files:", err);
        }
    });
}

function sanitizeFileName(filename) {
    return filename.replace(/[^a-z.\-_0-9]/gi, "_");
}

/**
 * Registers IPC handler for filesystem-related tasks.
 */
function initializeFilesystem() {
    ipcMain.handle("fs-job", onFilesystemJob);
}

module.exports = { initializeFilesystem };

import { FILE_NOT_FOUND, StorageInterface } from "../storage";
import { createLogger } from "../../core/logging";

const logger = createLogger("storage/browser");

const LOCAL_STORAGE_UNAVAILABLE = "local-storage-unavailable";
const LOCAL_STORAGE_NO_WRITE_PERMISSION = "local-storage-no-write-permission";

let randomDelay = () => 0;

if (G_IS_DEV) {
    // Random delay for testing
    // randomDelay = () => 500;
}

export class StorageImplBrowser extends StorageInterface {
    constructor(app) {
        super(app);
        this.currentBusyFilename = false;
    }

    initialize() {
        logger.error("Using localStorage, please update to a newer browser");
        return new Promise((resolve, reject) => {
            // Check for local storage availability in general
            if (!window.localStorage) {
                alert("Local storage is not available! Please upgrade to a newer browser!");
                reject(LOCAL_STORAGE_UNAVAILABLE);
            }

            // Check if we can set and remove items
            try {
                window.localStorage.setItem("storage_availability_test", "1");
                window.localStorage.removeItem("storage_availability_test");
            } catch (e) {
                alert(
                    "It seems we don't have permission to write to local storage! Please update your browsers settings or use a different browser!"
                );
                reject(LOCAL_STORAGE_NO_WRITE_PERMISSION);
                return;
            }
            setTimeout(resolve, 0);
        });
    }

    writeFileAsync(filename, contents) {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to write", filename, "while write process is not finished!");
        }

        this.currentBusyFilename = filename;
        window.localStorage.setItem(filename, contents);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.currentBusyFilename = false;
                resolve();
            }, 0);
        });
    }

    writeFileSyncIfSupported(filename, contents) {
        window.localStorage.setItem(filename, contents);
        return true;
    }

    readFileAsync(filename) {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to read", filename, "while write progress on it is ongoing!");
        }

        return new Promise((resolve, reject) => {
            const contents = window.localStorage.getItem(filename);
            if (!contents) {
                // File not found
                setTimeout(() => reject(FILE_NOT_FOUND), randomDelay());
                return;
            }

            // File read, simulate delay
            setTimeout(() => resolve(contents), 0);
        });
    }

    deleteFileAsync(filename) {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to delete", filename, "while write progres on it is ongoing!");
        }

        this.currentBusyFilename = filename;
        return new Promise((resolve, reject) => {
            window.localStorage.removeItem(filename);
            setTimeout(() => {
                this.currentBusyFilename = false;
                resolve();
            }, 0);
        });
    }
}

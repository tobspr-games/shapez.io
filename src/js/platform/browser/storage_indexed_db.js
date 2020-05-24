import { FILE_NOT_FOUND, StorageInterface } from "../storage";
import { createLogger } from "../../core/logging";

const logger = createLogger("storage/browserIDB");

const LOCAL_STORAGE_UNAVAILABLE = "local-storage-unavailable";
const LOCAL_STORAGE_NO_WRITE_PERMISSION = "local-storage-no-write-permission";

let randomDelay = () => 0;

if (G_IS_DEV) {
    // Random delay for testing
    // randomDelay = () => 500;
}

export class StorageImplBrowserIndexedDB extends StorageInterface {
    constructor(app) {
        super(app);
        this.currentBusyFilename = false;

        /** @type {IDBDatabase} */
        this.database = null;
    }

    initialize() {
        logger.log("Using indexed DB storage");
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open("app_storage", 10);
            request.onerror = event => {
                logger.error("IDB error:", event);
                alert(
                    "Sorry, it seems your browser has blocked the access to the storage system. This might be the case if you are browsing in private mode for example. I recommend to use google chrome or disable private browsing."
                );
                reject("Indexed DB access error");
            };

            // @ts-ignore
            request.onsuccess = event => resolve(event.target.result);

            request.onupgradeneeded = /** @type {IDBVersionChangeEvent} */ event => {
                /** @type {IDBDatabase} */
                // @ts-ignore
                const database = event.target.result;

                const objectStore = database.createObjectStore("files", {
                    keyPath: "filename",
                });

                objectStore.createIndex("filename", "filename", { unique: true });

                objectStore.transaction.onerror = event => {
                    logger.error("IDB transaction error:", event);
                    reject("Indexed DB transaction error during migration, check console output.");
                };

                objectStore.transaction.oncomplete = event => {
                    logger.log("Object store completely initialized");
                    resolve(database);
                };
            };
        }).then(database => {
            this.database = database;
        });
    }

    writeFileAsync(filename, contents) {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to write", filename, "while write process is not finished!");
        }
        if (!this.database) {
            return Promise.reject("Storage not ready");
        }

        this.currentBusyFilename = filename;
        const transaction = this.database.transaction(["files"], "readwrite");

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                this.currentBusyFilename = null;
                resolve();
            };

            transaction.onerror = error => {
                this.currentBusyFilename = null;
                logger.error("Error while writing", filename, ":", error);
                reject(error);
            };

            const store = transaction.objectStore("files");
            store.put({
                filename,
                contents,
            });
        });
    }

    writeFileSyncIfSupported(filename, contents) {
        // Not supported
        this.writeFileAsync(filename, contents);
        return true;
    }

    readFileAsync(filename) {
        if (!this.database) {
            return Promise.reject("Storage not ready");
        }

        this.currentBusyFilename = filename;
        const transaction = this.database.transaction(["files"], "readonly");

        return new Promise((resolve, reject) => {
            const store = transaction.objectStore("files");
            const request = store.get(filename);

            request.onsuccess = event => {
                this.currentBusyFilename = null;
                if (!request.result) {
                    reject(FILE_NOT_FOUND);
                    return;
                }
                resolve(request.result.contents);
            };

            request.onerror = error => {
                this.currentBusyFilename = null;
                logger.error("Error while reading", filename, ":", error);
                reject(error);
            };
        });
    }

    deleteFileAsync(filename) {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to delete", filename, "while write progres on it is ongoing!");
        }

        if (!this.database) {
            return Promise.reject("Storage not ready");
        }

        this.currentBusyFilename = filename;
        const transaction = this.database.transaction(["files"], "readwrite");

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                this.currentBusyFilename = null;
                resolve();
            };

            transaction.onerror = error => {
                this.currentBusyFilename = null;
                logger.error("Error while deleting", filename, ":", error);
                reject(error);
            };

            const store = transaction.objectStore("files");
            store.delete(filename);
        });
    }
}

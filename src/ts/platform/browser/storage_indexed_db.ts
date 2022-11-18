import { FILE_NOT_FOUND, StorageInterface } from "../storage";
import { createLogger } from "../../core/logging";
const logger: any = createLogger("storage/browserIDB");
const LOCAL_STORAGE_UNAVAILABLE: any = "local-storage-unavailable";
const LOCAL_STORAGE_NO_WRITE_PERMISSION: any = "local-storage-no-write-permission";
let randomDelay: any = (): any => 0;
if (G_IS_DEV) {
    // Random delay for testing
    // randomDelay = () => 500;
}
export class StorageImplBrowserIndexedDB extends StorageInterface {
    public currentBusyFilename = false;
    public database: IDBDatabase = null;

    constructor(app) {
        super(app);
    }
    initialize(): any {
        logger.log("Using indexed DB storage");
        return new Promise((resolve: any, reject: any): any => {
            const request: any = window.indexedDB.open("app_storage", 10);
            request.onerror = (event: any): any => {
                logger.error("IDB error:", event);
                alert("Sorry, it seems your browser has blocked the access to the storage system. This might be the case if you are browsing in private mode for example. I recommend to use google chrome or disable private browsing.");
                reject("Indexed DB access error");
            };
            // @ts-ignore
            request.onsuccess = (event: any): any => resolve(event.target.result);
            request.onupgradeneeded = vent: any): any => {
                                // @ts-ignore
                const database: IDBDatabase = event.target.result;
                const objectStore: any = database.createObjectStore("files", {
                    keyPath: "filename",
                });
                objectStore.createIndex("filename", "filename", { unique: true });
                objectStore.transaction.onerror = (event: any): any => {
                    logger.error("IDB transaction error:", event);
                    reject("Indexed DB transaction error during migration, check console output.");
                };
                objectStore.transaction.oncomplete = (event: any): any => {
                    logger.log("Object store completely initialized");
                    resolve(database);
                };
            };
        }).then((database: any): any => {
            this.database = database;
        });
    }
    writeFileAsync(filename: any, contents: any): any {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to write", filename, "while write process is not finished!");
        }
        if (!this.database) {
            return Promise.reject("Storage not ready");
        }
        this.currentBusyFilename = filename;
        const transaction: any = this.database.transaction(["files"], "readwrite");
        return new Promise((resolve: any, reject: any): any => {
            transaction.oncomplete = (): any => {
                this.currentBusyFilename = null;
                resolve();
            };
            transaction.onerror = (error: any): any => {
                this.currentBusyFilename = null;
                logger.error("Error while writing", filename, ":", error);
                reject(error);
            };
            const store: any = transaction.objectStore("files");
            store.put({
                filename,
                contents,
            });
        });
    }
    readFileAsync(filename: any): any {
        if (!this.database) {
            return Promise.reject("Storage not ready");
        }
        this.currentBusyFilename = filename;
        const transaction: any = this.database.transaction(["files"], "readonly");
        return new Promise((resolve: any, reject: any): any => {
            const store: any = transaction.objectStore("files");
            const request: any = store.get(filename);
            request.onsuccess = (event: any): any => {
                this.currentBusyFilename = null;
                if (!request.result) {
                    reject(FILE_NOT_FOUND);
                    return;
                }
                resolve(request.result.contents);
            };
            request.onerror = (error: any): any => {
                this.currentBusyFilename = null;
                logger.error("Error while reading", filename, ":", error);
                reject(error);
            };
        });
    }
    deleteFileAsync(filename: any): any {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to delete", filename, "while write progres on it is ongoing!");
        }
        if (!this.database) {
            return Promise.reject("Storage not ready");
        }
        this.currentBusyFilename = filename;
        const transaction: any = this.database.transaction(["files"], "readwrite");
        return new Promise((resolve: any, reject: any): any => {
            transaction.oncomplete = (): any => {
                this.currentBusyFilename = null;
                resolve();
            };
            transaction.onerror = (error: any): any => {
                this.currentBusyFilename = null;
                logger.error("Error while deleting", filename, ":", error);
                reject(error);
            };
            const store: any = transaction.objectStore("files");
            store.delete(filename);
        });
    }
}

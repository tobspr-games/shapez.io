import { FILE_NOT_FOUND, StorageInterface } from "../storage";
import { createLogger } from "../../core/logging";
const logger: any = createLogger("storage/browser");
const LOCAL_STORAGE_UNAVAILABLE: any = "local-storage-unavailable";
const LOCAL_STORAGE_NO_WRITE_PERMISSION: any = "local-storage-no-write-permission";
let randomDelay: any = (): any => 0;
if (G_IS_DEV) {
    // Random delay for testing
    // randomDelay = () => 500;
}
export class StorageImplBrowser extends StorageInterface {
    public currentBusyFilename = false;

    constructor(app) {
        super(app);
    }
    initialize(): any {
        logger.error("Using localStorage, please update to a newer browser");
        return new Promise((resolve: any, reject: any): any => {
            // Check for local storage availability in general
            if (!window.localStorage) {
                alert("Local storage is not available! Please upgrade to a newer browser!");
                reject(LOCAL_STORAGE_UNAVAILABLE);
            }
            // Check if we can set and remove items
            try {
                window.localStorage.setItem("storage_availability_test", "1");
                window.localStorage.removeItem("storage_availability_test");
            }
            catch (e: any) {
                alert("It seems we don't have permission to write to local storage! Please update your browsers settings or use a different browser!");
                reject(LOCAL_STORAGE_NO_WRITE_PERMISSION);
                return;
            }
            setTimeout(resolve, 0);
        });
    }
    writeFileAsync(filename: any, contents: any): any {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to write", filename, "while write process is not finished!");
        }
        this.currentBusyFilename = filename;
        window.localStorage.setItem(filename, contents);
        return new Promise((resolve: any, reject: any): any => {
            setTimeout((): any => {
                this.currentBusyFilename = false;
                resolve();
            }, 0);
        });
    }
    readFileAsync(filename: any): any {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to read", filename, "while write progress on it is ongoing!");
        }
        return new Promise((resolve: any, reject: any): any => {
            const contents: any = window.localStorage.getItem(filename);
            if (!contents) {
                // File not found
                setTimeout((): any => reject(FILE_NOT_FOUND), randomDelay());
                return;
            }
            // File read, simulate delay
            setTimeout((): any => resolve(contents), 0);
        });
    }
    deleteFileAsync(filename: any): any {
        if (this.currentBusyFilename === filename) {
            logger.warn("Attempt to delete", filename, "while write progres on it is ongoing!");
        }
        this.currentBusyFilename = filename;
        return new Promise((resolve: any, reject: any): any => {
            window.localStorage.removeItem(filename);
            setTimeout((): any => {
                this.currentBusyFilename = false;
                resolve();
            }, 0);
        });
    }
}

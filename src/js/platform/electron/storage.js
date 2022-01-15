import { StorageInterface } from "../storage";
import { createLogger } from "../../core/logging";

const logger = createLogger("electron-storage");

export class StorageImplElectron extends StorageInterface {
    constructor(app) {
        super(app);

        /** @type {Object.<number, {resolve:Function, reject: Function}>} */
        this.jobs = {};
        this.jobId = 0;

        ipcRenderer.on("fs-response", (event, arg) => {
            const id = arg.id;
            if (!this.jobs[id]) {
                logger.warn("Got unhandled FS response, job not known:", id);
                return;
            }
            const { resolve, reject } = this.jobs[id];
            if (arg.result.success) {
                resolve(arg.result.data);
            } else {
                reject(arg.result.error);
            }
        });
    }

    initialize() {
        return Promise.resolve();
    }

    writeFileAsync(filename, contents) {
        return new Promise((resolve, reject) => {
            // ipcMain
            const jobId = ++this.jobId;
            this.jobs[jobId] = { resolve, reject };

            ipcRenderer.send("fs-job", {
                type: "write",
                filename,
                contents,
                id: jobId,
            });
        });
    }

    readFileAsync(filename) {
        return new Promise((resolve, reject) => {
            // ipcMain
            const jobId = ++this.jobId;
            this.jobs[jobId] = { resolve, reject };

            ipcRenderer.send("fs-job", {
                type: "read",
                filename,
                id: jobId,
            });
        });
    }

    deleteFileAsync(filename) {
        return new Promise((resolve, reject) => {
            // ipcMain
            const jobId = ++this.jobId;
            this.jobs[jobId] = { resolve, reject };
            ipcRenderer.send("fs-job", {
                type: "delete",
                filename,
                id: jobId,
            });
        });
    }
}

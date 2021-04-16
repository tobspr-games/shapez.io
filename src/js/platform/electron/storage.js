import { StorageInterface } from "../storage";
import { getIPCRenderer } from "../../core/utils";
import { createLogger } from "../../core/logging";

const logger = createLogger("electron-storage");

export class StorageImplElectron extends StorageInterface {
    constructor(app) {
        super(app);
    }

    initialize() {
        return Promise.resolve();
    }

    writeFileAsync(filename, contents) {
        return new Promise((resolve, reject) => {
            getIPCRenderer()
                .invoke("fs-job", {
                    type: "write",
                    filename,
                    contents,
                })
                .then(result => {
                    if (result.success) {
                        resolve(result.data);
                    } else {
                        reject(result.error);
                    }
                });
        });
    }

    readFileAsync(filename) {
        return new Promise((resolve, reject) => {
            getIPCRenderer()
                .invoke("fs-job", {
                    type: "read",
                    filename,
                })
                .then(result => {
                    if (result.success) {
                        resolve(result.data);
                    } else {
                        reject(result.error);
                    }
                });
        });
    }

    deleteFileAsync(filename) {
        return new Promise((resolve, reject) => {
            getIPCRenderer()
                .invoke("fs-job", {
                    type: "delete",
                    filename,
                })
                .then(result => {
                    if (result.success) {
                        resolve(result.data);
                    } else {
                        reject(result.error);
                    }
                });
        });
    }
}

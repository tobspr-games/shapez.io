import { FILE_NOT_FOUND, StorageInterface } from "../storage";

export class StorageImplElectron extends StorageInterface {
    constructor(app) {
        super(app);
    }

    initialize() {
        return Promise.resolve();
    }

    writeFileAsync(filename, contents) {
        return ipcRenderer.invoke("fs-job", {
            type: "write",
            filename,
            contents,
        });
    }

    readFileAsync(filename) {
        return ipcRenderer
            .invoke("fs-job", {
                type: "read",
                filename,
            })
            .then(res => {
                if (res && res.error === FILE_NOT_FOUND) {
                    throw FILE_NOT_FOUND;
                }

                return res;
            });
    }

    deleteFileAsync(filename) {
        return ipcRenderer.invoke("fs-job", {
            type: "delete",
            filename,
        });
    }
}

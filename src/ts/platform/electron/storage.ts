import { FILE_NOT_FOUND, StorageInterface } from "../storage";
export class StorageImplElectron extends StorageInterface {

    constructor(app) {
        super(app);
    }
    initialize(): any {
        return Promise.resolve();
    }
    writeFileAsync(filename: any, contents: any): any {
        return ipcRenderer.invoke("fs-job", {
            type: "write",
            filename,
            contents,
        });
    }
    readFileAsync(filename: any): any {
        return ipcRenderer
            .invoke("fs-job", {
            type: "read",
            filename,
        })
            .then((res: any): any => {
            if (res && res.error === FILE_NOT_FOUND) {
                throw FILE_NOT_FOUND;
            }
            return res;
        });
    }
    deleteFileAsync(filename: any): any {
        return ipcRenderer.invoke("fs-job", {
            type: "delete",
            filename,
        });
    }
}

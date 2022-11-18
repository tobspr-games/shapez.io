/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
export const FILE_NOT_FOUND = "file_not_found";
export class StorageInterface {
    public app: Application = app;

    constructor(app) {
    }
    /**
     * Initializes the storage
     * {}
     * @abstract
     */
    initialize(): Promise<void> {
        abstract;
        return Promise.reject();
    }
    /**
     * Writes a string to a file asynchronously
     * {}
     * @abstract
     */
    writeFileAsync(filename: string, contents: string): Promise<void> {
        abstract;
        return Promise.reject();
    }
    /**
     * Reads a string asynchronously. Returns Promise<FILE_NOT_FOUND> if file was not found.
     * {}
     * @abstract
     */
    readFileAsync(filename: string): Promise<string> {
        abstract;
        return Promise.reject();
    }
    /**
     * Tries to delete a file
     * {}
     */
    deleteFileAsync(filename: string): Promise<void> {
        // Default implementation does not allow deleting files
        return Promise.reject();
    }
}

/* typehints:start */
import { Application } from "../application";
/* typehints:end */

export const FILE_NOT_FOUND = "file_not_found";

export class StorageInterface {
    constructor(app) {
        /** @type {Application} */
        this.app = app;
    }

    /**
     * Initializes the storage
     * @returns {Promise<void>}
     * @abstract
     */
    initialize() {
        abstract;
        return Promise.reject();
    }

    /**
     * Writes a string to a file asynchronously
     * @param {string} filename
     * @param {string} contents
     * @returns {Promise<void>}
     * @abstract
     */
    writeFileAsync(filename, contents) {
        abstract;
        return Promise.reject();
    }

    /**
     * Reads a string asynchronously. Returns Promise<FILE_NOT_FOUND> if file was not found.
     * @param {string} filename
     * @returns {Promise<string>}
     * @abstract
     */
    readFileAsync(filename) {
        abstract;
        return Promise.reject();
    }

    /**
     * Tries to delete a file
     * @param {string} filename
     * @returns {Promise<void>}
     */
    deleteFileAsync(filename) {
        // Default implementation does not allow deleting files
        return Promise.reject();
    }
}

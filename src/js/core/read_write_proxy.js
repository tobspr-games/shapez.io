/* typehints:start */
import { Application } from "../application";
/* typehints:end */

import { sha1, CRC_PREFIX, computeCrc } from "./sensitive_utils.encrypt";
import { createLogger } from "./logging";
import { FILE_NOT_FOUND } from "../platform/storage";
import { accessNestedPropertyReverse } from "./utils";
import { IS_DEBUG, globalConfig } from "./config";
import { ExplainedResult } from "./explained_result";
import { decompressX64, compressX64 } from "./lzstring";
import { asyncCompressor, compressionPrefix } from "./async_compression";
import { compressObject, decompressObject } from "../savegame/savegame_compressor";

const debounce = require("debounce-promise");

const logger = createLogger("read_write_proxy");

const salt = accessNestedPropertyReverse(globalConfig, ["file", "info"]);

// Helper which only writes / reads if verify() works. Also performs migration
export class ReadWriteProxy {
  constructor(app, filename) {
    /** @type {Application} */
    this.app = app;

    this.filename = filename;

    /** @type {object} */
    this.currentData = null;

    // TODO: EXTREMELY HACKY! To verify we need to do this a step later
    if (G_IS_DEV && IS_DEBUG) {
      setTimeout(() => {
        assert(
          this.verify(this.getDefaultData()).result,
          "Verify() failed for default data: " + this.verify(this.getDefaultData()).reason
        );
      });
    }

    /**
     * Store a debounced handler to prevent double writes
     */
    this.debouncedWrite = debounce(this.doWriteAsync.bind(this), 50);
  }

  // -- Methods to override

  /** @returns {ExplainedResult} */
  verify(data) {
    abstract;
    return ExplainedResult.bad();
  }

  // Should return the default data
  getDefaultData() {
    abstract;
    return {};
  }

  // Should return the current version as an integer
  getCurrentVersion() {
    abstract;
    return 0;
  }

  // Should migrate the data (Modify in place)
  /** @returns {ExplainedResult} */
  migrate(data) {
    abstract;
    return ExplainedResult.bad();
  }

  // -- / Methods

  // Resets whole data, returns promise
  resetEverythingAsync() {
    logger.warn("Reset data to default");
    this.currentData = this.getDefaultData();
    return this.writeAsync();
  }

  /**
   *
   * @param {object} obj
   */
  static serializeObject(obj) {
    const jsonString = JSON.stringify(compressObject(obj));
    const checksum = computeCrc(jsonString + salt);
    return compressionPrefix + compressX64(checksum + jsonString);
  }

  /**
   *
   * @param {object} text
   */
  static deserializeObject(text) {
    const decompressed = decompressX64(text.substr(compressionPrefix.length));
    if (!decompressed) {
      // LZ string decompression failure
      throw new Error("bad-content / decompression-failed");
    }
    if (decompressed.length < 40) {
      // String too short
      throw new Error("bad-content / payload-too-small");
    }

    // Compare stored checksum with actual checksum
    const checksum = decompressed.substring(0, 40);
    const jsonString = decompressed.substr(40);

    const desiredChecksum = checksum.startsWith(CRC_PREFIX)
      ? computeCrc(jsonString + salt)
      : sha1(jsonString + salt);

    if (desiredChecksum !== checksum) {
      // Checksum mismatch
      throw new Error("bad-content / checksum-mismatch");
    }

    const parsed = JSON.parse(jsonString);
    const decoded = decompressObject(parsed);
    return decoded;
  }

  /**
   * Writes the data asychronously, fails if verify() fails.
   * Debounces the operation by up to 50ms
   * @returns {Promise<void>}
   */
  writeAsync() {
    const verifyResult = this.internalVerifyEntry(this.currentData);

    if (!verifyResult.result) {
      logger.error("Tried to write invalid data to", this.filename, "reason:", verifyResult.reason);
      return Promise.reject(verifyResult.reason);
    }

    return this.debouncedWrite();
  }

  /**
   * Actually writes the data asychronously
   * @returns {Promise<void>}
   */
  doWriteAsync() {
    return asyncCompressor
      .compressObjectAsync(this.currentData)
      .then(compressed => {
        return this.app.storage.writeFileAsync(this.filename, compressed);
      })
      .then(() => {
        logger.log("📄 Wrote", this.filename);
      })
      .catch(err => {
        logger.error("Failed to write", this.filename, ":", err);
        throw err;
      });
  }

  // Reads the data asynchronously, fails if verify() fails
  readAsync() {

    /**
      * Decompresses raw data through `decompressX64`
      * Fails if decompression failed or
      * data is too small.
      * @param {string} data
      * @returns {Promise<string>}
      */
    const decompressRaw = data => {
      const decompressed = decompressX64(data.substr(compressionPrefix.length));
      if (!decompressed) return Promise.reject("bad-content / decompression-failed");
      return Promise.resolve(decompressed);
    };

    /**
      * Verifies the checksum and returns the payload.
      * Fails if the payload is too small to contain the checksum
      * or the checksums don't match.
      *
      * @param {string} data
      * @returns {Promise<string>}
      */
    const verifyChecksum = data => {
      if (data.length < 40) return Promise.reject("bad-content / payload-too-small");
      const checksum = data.substr(0, 40);
      const payload = data.substr(40);
      const saltedPayload = payload + salt;
      const desiredChecksum = checksum.startsWith(CRC_PREFIX) ? computeCrc(saltedPayload) : sha1(saltedPayload);
      if (desiredChecksum !== checksum) return Promise.reject(`bad-content / checksum-mismatch: ${desiredChecksum} vs ${checksum} `);
      return Promise.resolve(payload);
    };

    /**
      * Tries to parse the JSON data.
      * Logs and fails if the parser failed.
      *
      * @param {string} jsonString
      * @returns {Promise<any>}
      */
    const tryParseJSON = jsonString => {
      try {
        const parsedData = JSON.parse(jsonString);
        return Promise.resolve(parsedData);
      } catch (ex) {
        logger.error(
          "Failed to parse file content of",
          this.filename,
          ":",
          ex,
          "(content was:",
          jsonString,
          ")"
        );
        throw new Error("invalid-serialized-data");
      }
    };

    /**
      * Tries to decompress the data.
      * Fails if data is not compressed
      * and code is in production.
      *
      * @param {string} rawData 
      * @returns {Promise<string>}
      */
    const tryDecompress = rawData => {
      if (rawData.startsWith(compressionPrefix)) return decompressRaw(rawData);
      if (!G_IS_DEV) return Promise.reject("bad-content / missing-compression");
      return Promise.resolve(rawData);
    };

    /**
      * Checks for errors during file read.
      * If the file was not found, it will not fail
      * and instead return default data.
      * 
      * @param {FILE_NOT_FOUND | string} err
      * @returns {Promise<object>}
      */
    const onReadError = err => {
      if (err === FILE_NOT_FOUND) {
        logger.log("File not found, using default data");
        return Promise.resolve(this.getDefaultData());
      }
      return Promise.reject(`file-error: ${err}`);
    };

    /**
      * Verifies basic structure of the data
      * through `internalVerifyBasicStructure`.
      *
      * @param {any} contents
      * @returns {Promise<any>}
      */
    const verifyBasicStructure = contents => {
      const verifyResult = this.internalVerifyBasicStructure(contents);
      if (verifyResult.isBad()) return Promise.reject(`verify-failed: ${verifyResult.reason}`);
      return Promise.resolve(contents);
    };

    /**
      * Checks the version and migrates if required.
      * Fails if the version required for the data is newer
      * or migration failed.
      *
      * @param {any} contents
      * @returns {Promise<any>}
      */
    const checkVersionAndMigrate = contents => {
      const currentVersion = this.getCurrentVersion();
      if (contents.version > currentVersion) return Promise.reject("stored-data-is-newer");
      if (contents.version < currentVersion) {
        logger.log(
          `Trying to migrate data object from version ${contents.version} to ${currentVersion}`
        );
        const migrationResult = this.migrate(contents); // modify in place
        if (migrationResult.isBad()) {
          return Promise.reject(`migration-failed: ${migrationResult.reason}`);
        }
      }
      return Promise.resolve(contents);
    }

    /**
      * Verifies contents once they've been version-matched 
      * and migrated if needed, through `internalVerifyEntry`.
      * Fails if such method fails.
      *
      * @param {any} contents
      * @returns {Promise<any>}
      */
    const verifyEntry = contents => {
      const verifyResult = this.internalVerifyEntry(contents);
      if (!verifyResult.result) {
        logger.error(
          `Read invalid data from ${this.filename}, reason: ${verifyResult.reason}, contents: ${contents}`
        );
        return Promise.reject(`invalid-data: ${verifyResult.reason}`);
      }
      return Promise.resolve(contents);
    };

    /**
      * Stores the verified data.
      *
      * @param {any} contents
      * @returns {any}
      */
    const storeContents = contents => {
      this.currentData = contents;
      logger.log("📄 Read data with version", this.currentData.version, "from", this.filename);
      return contents;
    };

    /**
      * Generic handler for any failure.
      *
      * @param {any} err
      * @returns {Promise<void>}
      */
    const genericOnFail = err => Promise.reject(`Failed to read ${this.filename}: ${err}`);

    // Start read request
    return (
      this.app.storage
        .readFileAsync(this.filename)
        // Decrypt data (if its encrypted)
        // @ts-ignore
        .then(rawData => tryDecompress(rawData).then(verifyChecksum).then(tryParseJSON))

        // Check for errors during read
        .catch(onReadError)

        // Decompress
        .then(decompressObject)

        // Verify basic structure
        .then(verifyBasicStructure)

        // Check version and migrate if required
        .then(checkVersionAndMigrate)

        // Verify
        .then(verifyEntry)

        // Store
        .then(storeContents)

        // Catchall
        .catch(genericOnFail)
    );
  }

  /**
   * Deletes the file
   * @returns {Promise<void>}
   */
  deleteAsync() {
    return this.app.storage.deleteFileAsync(this.filename);
  }

  // Internal

  /** @returns {ExplainedResult} */
  internalVerifyBasicStructure(data) {
    if (!data) {
      return ExplainedResult.bad("Data is empty");
    }
    if (!Number.isInteger(data.version) || data.version < 0) {
      return ExplainedResult.bad(
        `Data has invalid version: ${data.version} (expected ${this.getCurrentVersion()})`
      );
    }

    return ExplainedResult.good();
  }

  /** @returns {ExplainedResult} */
  internalVerifyEntry(data) {
    // NOTE: this check could be removed if it's only used in `readAsync`,
    // as the data HAS to be migrated. Probably with a sanity check at `readAsync`
    // to check that migration did set the version flag accordingly, i.e
    // ```js
    // if (contents.version < currentVersion) { 
    //  // .. migrate contents and check result
    //  if (contents.version !== currentVersion) return Prmoise.reject(`Version mismatch after migration: ...`);
    // }
    // ```
    if (data.version !== this.getCurrentVersion()) {
      return ExplainedResult.bad(
        "Version mismatch, got " + data.version + " and expected " + this.getCurrentVersion()
      );
    }

    const verifyStructureError = this.internalVerifyBasicStructure(data);
    if (!verifyStructureError.isGood()) {
      return verifyStructureError;
    }
    return this.verify(data);
  }
}

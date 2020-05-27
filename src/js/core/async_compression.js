// @ts-ignore
import CompressionWorker from "../webworkers/compression.worker";
import { createLogger } from "./logging";
import { compressX64 } from "./lzstring";
import { performanceNow, JSON_stringify } from "./builtins";

const logger = createLogger("async_compression");

export let compressionPrefix = String.fromCodePoint(1);

function checkCryptPrefix(prefix) {
    try {
        window.localStorage.setItem("prefix_test", prefix);
        window.localStorage.removeItem("prefix_test");
        return true;
    } catch (ex) {
        logger.warn("Prefix '" + prefix + "' not available");
        return false;
    }
}

if (!checkCryptPrefix(compressionPrefix)) {
    logger.warn("Switching to basic prefix");
    compressionPrefix = " ";
    if (!checkCryptPrefix(compressionPrefix)) {
        logger.warn("Prefix not available, ls seems to be unavailable");
    }
}

/**
 * @typedef {{
 *   errorHandler: function(any) : void,
 *   resolver: function(any) : void,
 *   startTime: number
 * }} JobEntry
 */

class AsynCompression {
    constructor() {
        /** @type {Worker} */
        this.worker = new CompressionWorker();

        this.currentJobId = 1000;

        /** @type {Object.<number, JobEntry>} */
        this.currentJobs = {};

        this.worker.addEventListener("message", event => {
            const { jobId, result } = event.data;
            const jobData = this.currentJobs[jobId];
            if (!jobData) {
                logger.error("Failed to resolve job result, job id", jobId, "is not known");
                return;
            }

            const duration = performanceNow() - jobData.startTime;
            // log(this, "Got response from worker within", duration.toFixed(2), "ms");
            const resolver = jobData.resolver;
            delete this.currentJobs[jobId];
            resolver(result);
        });

        this.worker.addEventListener("error", err => {
            logger.error("Got error from webworker:", err, "aborting all jobs");
            const failureCalls = [];
            for (const jobId in this.currentJobs) {
                failureCalls.push(this.currentJobs[jobId].errorHandler);
            }
            this.currentJobs = {};
            for (let i = 0; i < failureCalls.length; ++i) {
                failureCalls[i](err);
            }
        });
    }

    /**
     * Compresses file
     * @param {string} text
     */
    compressFileAsync(text) {
        return this.internalQueueJob("compressFile", {
            text,
            compressionPrefix,
        });
    }

    /**
     * Queues a new job
     * @param {string} job
     * @param {any} data
     * @returns {Promise<any>}
     */
    internalQueueJob(job, data) {
        const jobId = ++this.currentJobId;
        return new Promise((resolve, reject) => {
            const errorHandler = err => {
                logger.error("Failed to compress job", jobId, ":", err);
                reject(err);
            };
            this.currentJobs[jobId] = {
                errorHandler,
                resolver: resolve,
                startTime: performanceNow(),
            };
            this.worker.postMessage({ jobId, job, data });
        });
    }
}

export const asyncCompressor = new AsynCompression();

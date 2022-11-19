// @ts-ignore
import CompressionWorker from "../webworkers/compression.worker";

import { createLogger } from "./logging";
import { round2Digits } from "./utils";

const logger = createLogger("async_compression");

export let compressionPrefix = String.fromCodePoint(1);

function checkCryptPrefix(prefix: string) {
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

export type JobEntry = {
    errorHandler: (err: any) => void;
    resolver: (res: any) => void;
    startTime: number;
};

class AsynCompression {
    public worker = new CompressionWorker();

    public currentJobId = 1000;

    public currentJobs: {
        [idx: number]: JobEntry;
    } = {};

    constructor() {
        this.worker.addEventListener("message", event => {
            const { jobId, result } = event.data;
            const jobData = this.currentJobs[jobId];
            if (!jobData) {
                logger.error("Failed to resolve job result, job id", jobId, "is not known");
                return;
            }

            const duration = performance.now() - jobData.startTime;
            logger.log(
                "Got job",
                jobId,
                "response within",
                round2Digits(duration),
                "ms: ",
                result.length,
                "bytes"
            );
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
     * Compresses any object
     */
    compressObjectAsync(obj: any) {
        logger.log("Compressing object async (optimized)");
        return this.internalQueueJob("compressObject", {
            obj,
            compressionPrefix,
        });
    }

    /**
     * Queues a new job
     */
    internalQueueJob(job: string, data: any): Promise<any> {
        const jobId = ++this.currentJobId;
        return new Promise((resolve, reject) => {
            const errorHandler = err => {
                logger.error("Failed to compress job", jobId, ":", err);
                reject(err);
            };
            this.currentJobs[jobId] = {
                errorHandler,
                resolver: resolve,
                startTime: performance.now(),
            };

            logger.log("Posting job", job, "/", jobId);
            this.worker.postMessage({ jobId, job, data });
        });
    }
}

export const asyncCompressor = new AsynCompression();

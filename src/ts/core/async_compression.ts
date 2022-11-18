// @ts-ignore
import CompressionWorker from "../webworkers/compression.worker";
import { createLogger } from "./logging";
import { round2Digits } from "./utils";
const logger: any = createLogger("async_compression");
export let compressionPrefix: any = String.fromCodePoint(1);
function checkCryptPrefix(prefix: any): any {
    try {
        window.localStorage.setItem("prefix_test", prefix);
        window.localStorage.removeItem("prefix_test");
        return true;
    }
    catch (ex: any) {
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
    errorHandler: function(: void):void;
    resolver: function(: void):void;
    startTime: number;
};

class AsynCompression {
    public worker = new CompressionWorker();
    public currentJobId = 1000;
    public currentJobs: {
        [idx: number]: JobEntry;
    } = {};

    constructor() {
        this.worker.addEventListener("message", (event: any): any => {
            const { jobId, result }: any = event.data;
            const jobData: any = this.currentJobs[jobId];
            if (!jobData) {
                logger.error("Failed to resolve job result, job id", jobId, "is not known");
                return;
            }
            const duration: any = performance.now() - jobData.startTime;
            logger.log("Got job", jobId, "response within", round2Digits(duration), "ms: ", result.length, "bytes");
            const resolver: any = jobData.resolver;
            delete this.currentJobs[jobId];
            resolver(result);
        });
        this.worker.addEventListener("error", (err: any): any => {
            logger.error("Got error from webworker:", err, "aborting all jobs");
            const failureCalls: any = [];
            for (const jobId: any in this.currentJobs) {
                failureCalls.push(this.currentJobs[jobId].errorHandler);
            }
            this.currentJobs = {};
            for (let i: any = 0; i < failureCalls.length; ++i) {
                failureCalls[i](err);
            }
        });
    }
    /**
     * Compresses any object
     */
    compressObjectAsync(obj: any): any {
        logger.log("Compressing object async (optimized)");
        return this.internalQueueJob("compressObject", {
            obj,
            compressionPrefix,
        });
    }
    /**
     * Queues a new job
     * {}
     */
    internalQueueJob(job: string, data: any): Promise<any> {
        const jobId: any = ++this.currentJobId;
        return new Promise((resolve: any, reject: any): any => {
            const errorHandler: any = (err: any): any => {
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
export const asyncCompressor: any = new AsynCompression();

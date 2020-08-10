import { compressX64 } from "../core/lzstring";
import { globalConfig } from "../core/config";
import { sha1 } from "../core/sensitive_utils.encrypt";

function accessNestedPropertyReverse(obj, keys) {
    let result = obj;
    for (let i = keys.length - 1; i >= 0; --i) {
        result = result[keys[i]];
    }
    return result;
}

const salt = accessNestedPropertyReverse(globalConfig, ["file", "info"]);

onmessage = function (event) {
    const { jobId, job, data } = event.data;
    console.log("[worker] Received message:");
    console.log(JSON.stringify(event.data));
    const result = performJob(job, data);
    postMessage({ jobId, result });
};

function performJob(job, data) {
    switch (job) {
        case "compressX64": {
            return compressX64(data);
        }
        case "compressFile": {
            const checksum = sha1(data.text + salt);
            return data.compressionPrefix + compressX64(checksum + data.text);
        }
        default:
            throw new Error("Webworker: Unknown job: " + job);
    }
}

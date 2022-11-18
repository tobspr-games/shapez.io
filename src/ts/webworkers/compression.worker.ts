import { globalConfig } from "../core/config";
import { compressX64 } from "../core/lzstring";
import { computeCrc } from "../core/sensitive_utils.encrypt";
import { compressObject } from "../savegame/savegame_compressor";
function accessNestedPropertyReverse(obj: any, keys: any): any {
    let result: any = obj;
    for (let i: any = keys.length - 1; i >= 0; --i) {
        result = result[keys[i]];
    }
    return result;
}
const salt: any = accessNestedPropertyReverse(globalConfig, ["file", "info"]);
self.addEventListener("message", (event: any): any => {
    // @ts-ignore
    const { jobId, job, data }: any = event.data;
    const result: any = performJob(job, data);
    // @ts-ignore
    self.postMessage({ jobId, result });
});
function performJob(job: any, data: any): any {
    switch (job) {
        case "compressX64": {
            return compressX64(data);
        }
        case "compressObject": {
            const optimized: any = compressObject(data.obj);
            const stringified: any = JSON.stringify(optimized);
            const checksum: any = computeCrc(stringified + salt);
            return data.compressionPrefix + compressX64(checksum + stringified);
        }
        default:
            throw new Error("Webworker: Unknown job: " + job);
    }
}

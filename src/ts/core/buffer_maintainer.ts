import { GameRoot } from "../game/root";
import { clearBufferBacklog, freeCanvas, getBufferStats, makeOffscreenBuffer } from "./buffer_utils";
import { createLogger } from "./logging";
import { round1Digit } from "./utils";
export type CacheEntry = {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    lastUse: number;
};

const logger: any = createLogger("buffers");
const bufferGcDurationSeconds: any = 0.5;
export class BufferMaintainer {
    public root = root;
    public cache: Map<string, Map<string, CacheEntry>> = new Map();
    public iterationIndex = 1;
    public lastIteration = 0;

        constructor(root) {
        this.root.signals.gameFrameStarted.add(this.update, this);
    }
    /**
     * Returns the buffer stats
     */
    getStats(): any {
        let stats: any = {
            rootKeys: 0,
            subKeys: 0,
            vramBytes: 0,
        };
        this.cache.forEach((subCache: any, key: any): any => {
            ++stats.rootKeys;
            subCache.forEach((cacheEntry: any, subKey: any): any => {
                ++stats.subKeys;
                const canvas: any = cacheEntry.canvas;
                stats.vramBytes += canvas.width * canvas.height * 4;
            });
        });
        return stats;
    }
    /**
     * Goes to the next buffer iteration, clearing all buffers which were not used
     * for a few iterations
     */
    garbargeCollect(): any {
        let totalKeys: any = 0;
        let deletedKeys: any = 0;
        const minIteration: any = this.iterationIndex;
        this.cache.forEach((subCache: any, key: any): any => {
            let unusedSubKeys: any = [];
            // Filter sub cache
            subCache.forEach((cacheEntry: any, subKey: any): any => {
                if (cacheEntry.lastUse < minIteration ||
                    // @ts-ignore
                    cacheEntry.canvas._contextLost) {
                    unusedSubKeys.push(subKey);
                    freeCanvas(cacheEntry.canvas);
                    ++deletedKeys;
                }
                else {
                    ++totalKeys;
                }
            });
            // Delete unused sub keys
            for (let i: any = 0; i < unusedSubKeys.length; ++i) {
                subCache.delete(unusedSubKeys[i]);
            }
        });
        // Make sure our backlog never gets too big
        clearBufferBacklog();
        // if (G_IS_DEV) {
        //     const bufferStats = getBufferStats();
        //     const mbUsed = round1Digit(bufferStats.vramUsage / (1024 * 1024));
        //     logger.log(
        //         "GC: Remove",
        //         (deletedKeys + "").padStart(4),
        //         ", Remain",
        //         (totalKeys + "").padStart(4),
        //         "(",
        //         (bufferStats.bufferCount + "").padStart(4),
        //         "total",
        //         ")",
        //         "(",
        //         (bufferStats.backlogSize + "").padStart(4),
        //         "backlog",
        //         ")",
        //         "VRAM:",
        //         mbUsed,
        //         "MB"
        //     );
        // }
        ++this.iterationIndex;
    }
    update(): any {
        const now: any = this.root.time.realtimeNow();
        if (now - this.lastIteration > bufferGcDurationSeconds) {
            this.lastIteration = now;
            this.garbargeCollect();
        }
    }
    /**
     * {}
     *
     */
    getForKey({ key, subKey, w, h, dpi, redrawMethod, additionalParams }: {
        key: string;
        subKey: string;
        w: number;
        h: number;
        dpi: number;
        redrawMethod: function(: void, : void, : void, : void, : void, : void):void;
        additionalParams: object=;
    }): HTMLCanvasElement {
        // First, create parent key
        let parent: any = this.cache.get(key);
        if (!parent) {
            parent = new Map();
            this.cache.set(key, parent);
        }
        // Now search for sub key
        const cacheHit: any = parent.get(subKey);
        if (cacheHit) {
            cacheHit.lastUse = this.iterationIndex;
            return cacheHit.canvas;
        }
        // Need to generate new buffer
        const effectiveWidth: any = w * dpi;
        const effectiveHeight: any = h * dpi;
        const [canvas, context]: any = makeOffscreenBuffer(effectiveWidth, effectiveHeight, {
            reusable: true,
            label: "buffer-" + key + "/" + subKey,
            smooth: true,
        });
        redrawMethod(canvas, context, w, h, dpi, additionalParams);
        parent.set(subKey, {
            canvas,
            context,
            lastUse: this.iterationIndex,
        });
        return canvas;
    }
    /**
     * {}
     *
     */
    getForKeyOrNullNoUpdate({ key, subKey }: {
        key: string;
        subKey: string;
    }): ?HTMLCanvasElement {
        let parent: any = this.cache.get(key);
        if (!parent) {
            return null;
        }
        // Now search for sub key
        const cacheHit: any = parent.get(subKey);
        if (cacheHit) {
            return cacheHit.canvas;
        }
        return null;
    }
}

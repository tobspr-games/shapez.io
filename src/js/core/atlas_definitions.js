/**
 * @typedef {{
 *   frame: { x: number, y: number, w: number, h: number },
 *   rotated: false,
 *   spriteSourceSize: { x: number, y: number, w: number, h: number },
 *   sourceSize: { w: number, h: number},
 *   trimmed: true
 * }} SpriteDefinition
 */

export class AtlasDefinition {
    constructor(sourceData) {
        this.sourceFileName = sourceData.meta.image;
        this.meta = sourceData.meta;

        /** @type {Object.<string, SpriteDefinition>} */
        this.sourceData = sourceData.frames;
    }

    getFullSourcePath() {
        return this.sourceFileName;
    }
}

export const atlasFiles = require
    // @ts-ignore
    .context("../../../res_built/atlas/", false, /.*\.json/i)
    .keys()
    .map(f => f.replace(/^\.\//gi, ""))
    .map(f => require("../../../res_built/atlas/" + f))
    .map(data => new AtlasDefinition(data));

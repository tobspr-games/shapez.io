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

// @ts-ignore
export const atlasFiles = require
    .context("../../../res_built/atlas/", false, /.*\.json/i)
    .keys()
    .map(f => f.replace(/^\.\//gi, ""))
    .map(f => require("../../../res_built/atlas/" + f))
    .map(data => new AtlasDefinition(data));

// export const atlasDefinitions = {
//     qualityPreload: atlasFiles.filter((atlas) => atlas.meta.image.indexOf("_preload") >= 0),
//     qualityLow: atlasFiles.filter((atlas) => atlas.meta.image.indexOf("_low") >= 0),
//     qualityMedium: atlasFiles.filter((atlas) => atlas.meta.image.indexOf("_medium") >= 0),
//     qualityHigh: atlasFiles.filter((atlas) => atlas.meta.image.indexOf("_high") >= 0),
// };

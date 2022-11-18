
export type Size = {
    w: number;
    h: number;
};
export type Position = {
    x: number;
    y: number;
};
export type SpriteDefinition = {
    frame: Position & Size;
    rotated: boolean;
    spriteSourceSize: Position & Size;
    sourceSize: Size;
    trimmed: boolean;
};
export type AtlasMeta = {
    app: string;
    version: string;
    image: string;
    format: string;
    size: Size;
    scale: string;
    smartupdate: string;
};
export type SourceData = {
    frames: Object<string, SpriteDefinition>;
    meta: AtlasMeta;
};
export class AtlasDefinition {
    public meta = meta;
    public sourceData = frames;
    public sourceFileName = meta.image;

        constructor({ frames, meta }) {
    }
    getFullSourcePath() {
        return this.sourceFileName;
    }
}
export const atlasFiles: AtlasDefinition[] = require
    // @ts-ignore
    .context("../../../res_built/atlas/", false, /.*\.json/i)
    .keys()
    .map(f => f.replace(/^\.\//gi, ""))
    .map(f => require("../../../res_built/atlas/" + f))
    .map(data => new AtlasDefinition(data));

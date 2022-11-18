import { DrawParameters } from "./draw_parameters";
import { Rectangle } from "./rectangle";
import { round3Digits } from "./utils";
export const ORIGINAL_SPRITE_SCALE = "0.75";
export const FULL_CLIP_RECT = new Rectangle(0, 0, 1, 1);
const EXTRUDE = 0.1;
export class BaseSprite {
    /**
     * Returns the raw handle
     * {}
     * @abstract
     */
    getRawTexture(): HTMLImageElement | HTMLCanvasElement {
        abstract;
        return null;
    }
    /**
     * Draws the sprite
     */
    draw(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        // eslint-disable-line no-unused-vars
        abstract;
    }
}
/**
 * Position of a sprite within an atlas
 */
export class SpriteAtlasLink {
    public packedX = packedX;
    public packedY = packedY;
    public packedW = packedW;
    public packedH = packedH;
    public packOffsetX = packOffsetX;
    public packOffsetY = packOffsetY;
    public atlas = atlas;
    public w = w;
    public h = h;

        constructor({ w, h, packedX, packedY, packOffsetX, packOffsetY, packedW, packedH, atlas }) {
    }
}
export class AtlasSprite extends BaseSprite {
    public linksByResolution: {
        [idx: string]: SpriteAtlasLink;
    } = {};
    public spriteName = spriteName;
    public frozen = false;

        constructor(spriteName = "sprite") {
        super();
    }
    getRawTexture() {
        return this.linksByResolution[ORIGINAL_SPRITE_SCALE].atlas;
    }
    /**
     * Draws the sprite onto a regular context using no contexts
     * @see {BaseSprite.draw}
     */
    draw(context, x, y, w, h) {
        if (G_IS_DEV) {
            assert(context instanceof CanvasRenderingContext2D, "Not a valid context");
        }
        const link = this.linksByResolution[ORIGINAL_SPRITE_SCALE];
        if (!link) {
            throw new Error("draw: Link for " +
                this.spriteName +
                " not known: " +
                ORIGINAL_SPRITE_SCALE +
                " (having " +
                Object.keys(this.linksByResolution) +
                ")");
        }
        const width = w || link.w;
        const height = h || link.h;
        const scaleW = width / link.w;
        const scaleH = height / link.h;
        context.drawImage(link.atlas, link.packedX, link.packedY, link.packedW, link.packedH, x + link.packOffsetX * scaleW, y + link.packOffsetY * scaleH, link.packedW * scaleW, link.packedH * scaleH);
    }
        drawCachedCentered(parameters: DrawParameters, x: number, y: number, size: number, clipping: boolean= = true) {
        this.drawCached(parameters, x - size / 2, y - size / 2, size, size, clipping);
    }
        drawCentered(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
        this.draw(context, x - size / 2, y - size / 2, size, size);
    }
    /**
     * Draws the sprite
     */
    drawCached(parameters: DrawParameters, x: number, y: number, w: number = null, h: number = null, clipping: boolean= = true) {
        if (G_IS_DEV) {
            assert(parameters instanceof DrawParameters, "Not a valid context");
            assert(!!w && w > 0, "Not a valid width:" + w);
            assert(!!h && h > 0, "Not a valid height:" + h);
        }
        const visibleRect = parameters.visibleRect;
        const scale = parameters.desiredAtlasScale;
        const link = this.linksByResolution[scale];
        if (!link) {
            throw new Error("drawCached: Link for " +
                this.spriteName +
                " at scale " +
                scale +
                " not known (having " +
                Object.keys(this.linksByResolution) +
                ")");
        }
        const scaleW = w / link.w;
        const scaleH = h / link.h;
        let destX = x + link.packOffsetX * scaleW;
        let destY = y + link.packOffsetY * scaleH;
        let destW = link.packedW * scaleW;
        let destH = link.packedH * scaleH;
        let srcX = link.packedX;
        let srcY = link.packedY;
        let srcW = link.packedW;
        let srcH = link.packedH;
        let intersection = null;
        if (clipping) {
            const rect = new Rectangle(destX, destY, destW, destH);
            intersection = rect.getIntersection(visibleRect);
            if (!intersection) {
                return;
            }
            srcX += (intersection.x - destX) / scaleW;
            srcY += (intersection.y - destY) / scaleH;
            srcW *= intersection.w / destW;
            srcH *= intersection.h / destH;
            destX = intersection.x;
            destY = intersection.y;
            destW = intersection.w;
            destH = intersection.h;
        }
        parameters.context.drawImage(link.atlas, 
        // atlas src pos
        srcX, srcY, 
        // atlas src size
        srcW, srcH, 
        // dest pos and size
        destX - EXTRUDE, destY - EXTRUDE, destW + 2 * EXTRUDE, destH + 2 * EXTRUDE);
    }
    /**
     * Draws a subset of the sprite. Does NO culling
     */
    drawCachedWithClipRect(parameters: DrawParameters, x: number, y: number, w: number = null, h: number = null, clipRect: Rectangle= = FULL_CLIP_RECT) {
        if (G_IS_DEV) {
            assert(parameters instanceof DrawParameters, "Not a valid context");
            assert(!!w && w > 0, "Not a valid width:" + w);
            assert(!!h && h > 0, "Not a valid height:" + h);
            assert(clipRect, "No clip rect given!");
        }
        const scale = parameters.desiredAtlasScale;
        const link = this.linksByResolution[scale];
        if (!link) {
            throw new Error("drawCachedWithClipRect: Link for " +
                this.spriteName +
                " at scale " +
                scale +
                " not known (having " +
                Object.keys(this.linksByResolution) +
                ")");
        }
        const scaleW = w / link.w;
        const scaleH = h / link.h;
        let destX = x + link.packOffsetX * scaleW + clipRect.x * w;
        let destY = y + link.packOffsetY * scaleH + clipRect.y * h;
        let destW = link.packedW * scaleW * clipRect.w;
        let destH = link.packedH * scaleH * clipRect.h;
        let srcX = link.packedX + clipRect.x * link.packedW;
        let srcY = link.packedY + clipRect.y * link.packedH;
        let srcW = link.packedW * clipRect.w;
        let srcH = link.packedH * clipRect.h;
        parameters.context.drawImage(link.atlas, 
        // atlas src pos
        srcX, srcY, 
        // atlas src siize
        srcW, srcH, 
        // dest pos and size
        destX - EXTRUDE, destY - EXTRUDE, destW + 2 * EXTRUDE, destH + 2 * EXTRUDE);
    }
    /**
     * Renders into an html element
     */
    renderToHTMLElement(element: HTMLElement, w: number = 1, h: number = 1) {
        element.style.position = "relative";
        element.innerHTML = this.getAsHTML(w, h);
    }
    /**
     * Returns the html to render as icon
     */
    getAsHTML(w: number, h: number) {
        const link = this.linksByResolution["0.5"];
        if (!link) {
            throw new Error("getAsHTML: Link for " +
                this.spriteName +
                " at scale 0.5" +
                " not known (having " +
                Object.keys(this.linksByResolution) +
                ")");
        }
        // Find out how much we have to scale it so that it fits
        const scaleX = w / link.w;
        const scaleY = h / link.h;
        // Find out how big the scaled atlas is
        const atlasW = link.atlas.width * scaleX;
        const atlasH = link.atlas.height * scaleY;
        // @ts-ignore
        const srcSafe = link.atlas.src.replaceAll("\\", "/");
        // Find out how big we render the sprite
        const widthAbsolute = scaleX * link.packedW;
        const heightAbsolute = scaleY * link.packedH;
        // Compute the position in the relative container
        const leftRelative = (link.packOffsetX * scaleX) / w;
        const topRelative = (link.packOffsetY * scaleY) / h;
        const widthRelative = widthAbsolute / w;
        const heightRelative = heightAbsolute / h;
        // Scale the atlas relative to the width and height of the element
        const bgW = atlasW / widthAbsolute;
        const bgH = atlasH / heightAbsolute;
        // Figure out what the position of the atlas is
        const bgX = link.packedX * scaleX;
        const bgY = link.packedY * scaleY;
        // Fuck you, whoever thought its a good idea to make background-position work like it does now
        const bgXRelative = -bgX / (widthAbsolute - atlasW);
        const bgYRelative = -bgY / (heightAbsolute - atlasH);
        return `
            <span class="spritesheetImage" style="
                background-image: url('${srcSafe}');
                left: ${round3Digits(leftRelative * 100.0)}%;
                top: ${round3Digits(topRelative * 100.0)}%;
                width: ${round3Digits(widthRelative * 100.0)}%;
                height: ${round3Digits(heightRelative * 100.0)}%;
                background-repeat: repeat;
                background-position: ${round3Digits(bgXRelative * 100.0)}% ${round3Digits(bgYRelative * 100.0)}%;
                background-size: ${round3Digits(bgW * 100.0)}% ${round3Digits(bgH * 100.0)}%;
            "></span>
        `;
    }
}
export class RegularSprite extends BaseSprite {
    public w = w;
    public h = h;
    public sprite = sprite;

    constructor(sprite, w, h) {
        super();
    }
    getRawTexture() {
        return this.sprite;
    }
    /**
     * Draws the sprite, do *not* use this for sprites which are rendered! Only for drawing
     * images into buffers
     */
    draw(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        assert(context, "No context given");
        assert(x !== undefined, "No x given");
        assert(y !== undefined, "No y given");
        assert(w !== undefined, "No width given");
        assert(h !== undefined, "No height given");
        context.drawImage(this.sprite, x, y, w, h);
    }
    /**
     * Draws the sprite, do *not* use this for sprites which are rendered! Only for drawing
     * images into buffers
     */
    drawCentered(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        assert(context, "No context given");
        assert(x !== undefined, "No x given");
        assert(y !== undefined, "No y given");
        assert(w !== undefined, "No width given");
        assert(h !== undefined, "No height given");
        context.drawImage(this.sprite, x - w / 2, y - h / 2, w, h);
    }
}

import type { AtlasSprite } from "./sprites";
import type { DrawParameters } from "./draw_parameters";

import { globalConfig } from "./config";
import { createLogger } from "./logging";
import { Rectangle } from "./rectangle";

const logger = createLogger("draw_utils");

export function initDrawUtils() {
    CanvasRenderingContext2D.prototype.beginRoundedRect = function (x, y, w, h, r) {
        this.beginPath();

        if (r < 0.05) {
            this.rect(x, y, w, h);
            return;
        }

        if (w < 2 * r) {
            r = w / 2;
        }

        if (h < 2 * r) {
            r = h / 2;
        }

        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
    };

    CanvasRenderingContext2D.prototype.beginCircle = function (x, y, r) {
        this.beginPath();

        if (r < 0.05) {
            this.rect(x, y, 1, 1);
            return;
        }

        this.arc(x, y, r, 0, 2.0 * Math.PI);
    };
}

export function drawRotatedSprite({
    parameters,
    sprite,
    x,
    y,
    angle,
    size,
    offsetX = 0,
    offsetY = 0,
}: {
    parameters: DrawParameters;
    sprite: AtlasSprite;
    x: number;
    y: number;
    angle: number;
    size: number;
    offsetX: number;
    offsetY: number;
}) {
    if (angle === 0) {
        sprite.drawCachedCentered(parameters, x + offsetX, y + offsetY, size);
        return;
    }

    parameters.context.translate(x, y);
    parameters.context.rotate(angle);
    sprite.drawCachedCentered(parameters, offsetX, offsetY, size, false);
    parameters.context.rotate(-angle);
    parameters.context.translate(-x, -y);
}

let warningsShown = 0;

/**
 * Draws a sprite with clipping
 */
export function drawSpriteClipped({
    parameters,
    sprite,
    x,
    y,
    w,
    h,
    originalW,
    originalH,
}: {
    parameters: DrawParameters;
    sprite: HTMLCanvasElement;
    x: number;
    y: number;
    w: number;
    h: number;
    originalW: number;
    originalH: number;
}) {
    const rect = new Rectangle(x, y, w, h);
    const intersection = rect.getIntersection(parameters.visibleRect);
    if (!intersection) {
        // Clipped
        if (++warningsShown % 200 === 1) {
            logger.warn(
                "Sprite drawn clipped but it's not on screen - perform culling before (",
                warningsShown,
                "warnings)"
            );
        }
        if (G_IS_DEV && globalConfig.debug.testClipping) {
            parameters.context.fillStyle = "yellow";
            parameters.context.fillRect(x, y, w, h);
        }
        return;
    }

    parameters.context.drawImage(
        sprite,
        // src pos and size
        ((intersection.x - x) / w) * originalW,
        ((intersection.y - y) / h) * originalH,
        (originalW * intersection.w) / w,
        (originalH * intersection.h) / h,

        // dest pos and size
        intersection.x,
        intersection.y,
        intersection.w,
        intersection.h
    );
}

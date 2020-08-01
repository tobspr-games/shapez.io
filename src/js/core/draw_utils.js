/**
 * @typedef {import("./sprites").AtlasSprite} AtlasSprite
 * @typedef {import("./draw_parameters").DrawParameters} DrawParameters
 */

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

/**
 *
 * @param {object} param0
 * @param {DrawParameters} param0.parameters
 * @param {AtlasSprite} param0.sprite
 * @param {number} param0.x
 * @param {number} param0.y
 * @param {number} param0.angle
 * @param {number} param0.size
 * @param {number=} param0.offsetX
 * @param {number=} param0.offsetY
 */
export function drawRotatedSprite({ parameters, sprite, x, y, angle, size, offsetX = 0, offsetY = 0 }) {
    parameters.context.translate(x, y);
    parameters.context.rotate(angle);
    sprite.drawCachedCentered(parameters, offsetX, offsetY, size, false);
    parameters.context.rotate(-angle);
    parameters.context.translate(-x, -y);
}

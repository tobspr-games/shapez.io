/* typehints:start */
import { AtlasSprite } from "./sprites";
import { DrawParameters } from "./draw_parameters";
/* typehints:end */

import { Math_PI, Math_round, Math_atan2, Math_hypot, Math_floor } from "./builtins";
import { Vector } from "./vector";
import { Rectangle } from "./rectangle";
import { createLogger } from "./logging";

const logger = createLogger("draw_utils");

export function initDrawUtils() {
    CanvasRenderingContext2D.prototype.beginRoundedRect = function (x, y, w, h, r) {
        if (r < 0.05) {
            this.beginPath();
            this.rect(x, y, w, h);
            return;
        }

        if (w < 2 * r) {
            r = w / 2;
        }
        if (h < 2 * r) {
            r = h / 2;
        }
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        // this.closePath();
    };

    CanvasRenderingContext2D.prototype.beginCircle = function (x, y, r) {
        if (r < 0.05) {
            this.beginPath();
            this.rect(x, y, 1, 1);
            return;
        }
        this.beginPath();
        this.arc(x, y, r, 0, 2.0 * Math_PI);
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

export function drawLineFast(context, { x1, x2, y1, y2, color = null, lineSize = 1 }) {
    const dX = x2 - x1;
    const dY = y2 - y1;

    const angle = Math_atan2(dY, dX) + 0.0 * Math_PI;
    const len = Math_hypot(dX, dY);

    context.translate(x1, y1);
    context.rotate(angle);

    if (color) {
        context.fillStyle = color;
    }

    context.fillRect(0, -lineSize / 2, len, lineSize);

    context.rotate(-angle);
    context.translate(-x1, -y1);
}

const INSIDE = 0;
const LEFT = 1;
const RIGHT = 2;
const BOTTOM = 4;
const TOP = 8;

// https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm

function computeOutCode(x, y, xmin, xmax, ymin, ymax) {
    let code = INSIDE;

    if (x < xmin)
        // to the left of clip window
        code |= LEFT;
    else if (x > xmax)
        // to the right of clip window
        code |= RIGHT;
    if (y < ymin)
        // below the clip window
        code |= BOTTOM;
    else if (y > ymax)
        // above the clip window
        code |= TOP;

    return code;
}

// Cohen–Sutherland clipping algorithm clips a line from
// P0 = (x0, y0) to P1 = (x1, y1) against a rectangle with
// diagonal from (xmin, ymin) to (xmax, ymax).
/**
 *
 * @param {CanvasRenderingContext2D} context
 */
export function drawLineFastClipped(context, rect, { x0, y0, x1, y1, color = null, lineSize = 1 }) {
    const xmin = rect.x;
    const ymin = rect.y;
    const xmax = rect.right();
    const ymax = rect.bottom();

    // compute outcodes for P0, P1, and whatever point lies outside the clip rectangle
    let outcode0 = computeOutCode(x0, y0, xmin, xmax, ymin, ymax);
    let outcode1 = computeOutCode(x1, y1, xmin, xmax, ymin, ymax);
    let accept = false;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (!(outcode0 | outcode1)) {
            // bitwise OR is 0: both points inside window; trivially accept and exit loop
            accept = true;
            break;
        } else if (outcode0 & outcode1) {
            // bitwise AND is not 0: both points share an outside zone (LEFT, RIGHT, TOP,
            // or BOTTOM), so both must be outside window; exit loop (accept is false)
            break;
        } else {
            // failed both tests, so calculate the line segment to clip
            // from an outside point to an intersection with clip edge
            let x, y;

            // At least one endpoint is outside the clip rectangle; pick it.
            let outcodeOut = outcode0 ? outcode0 : outcode1;

            // Now find the intersection point;
            // use formulas:
            //   slope = (y1 - y0) / (x1 - x0)
            //   x = x0 + (1 / slope) * (ym - y0), where ym is ymin or ymax
            //   y = y0 + slope * (xm - x0), where xm is xmin or xmax
            // No need to worry about divide-by-zero because, in each case, the
            // outcode bit being tested guarantees the denominator is non-zero
            if (outcodeOut & TOP) {
                // point is above the clip window
                x = x0 + ((x1 - x0) * (ymax - y0)) / (y1 - y0);
                y = ymax;
            } else if (outcodeOut & BOTTOM) {
                // point is below the clip window
                x = x0 + ((x1 - x0) * (ymin - y0)) / (y1 - y0);
                y = ymin;
            } else if (outcodeOut & RIGHT) {
                // point is to the right of clip window
                y = y0 + ((y1 - y0) * (xmax - x0)) / (x1 - x0);
                x = xmax;
            } else if (outcodeOut & LEFT) {
                // point is to the left of clip window
                y = y0 + ((y1 - y0) * (xmin - x0)) / (x1 - x0);
                x = xmin;
            }

            // Now we move outside point to intersection point to clip
            // and get ready for next pass.
            if (outcodeOut == outcode0) {
                x0 = x;
                y0 = y;
                outcode0 = computeOutCode(x0, y0, xmin, xmax, ymin, ymax);
            } else {
                x1 = x;
                y1 = y;
                outcode1 = computeOutCode(x1, y1, xmin, xmax, ymin, ymax);
            }
        }
    }
    if (accept) {
        // Following functions are left for implementation by user based on
        // their platform (OpenGL/graphics.h etc.)
        // DrawRectangle(xmin, ymin, xmax, ymax);
        // LineSegment(x0, y0, x1, y1);
        drawLineFast(context, {
            x1: x0,
            y1: y0,
            x2: x1,
            y2: y1,
            color,
            lineSize,
        });
    }
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
export function hslToRgb(h, s, l) {
    let r;
    let g;
    let b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        // tslint:disable-next-line:no-shadowed-variable
        const hue2rgb = function (p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        };

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math_round(r * 255), Math_round(g * 255), Math_round(b * 255)];
}

export function wrapText(context, text, x, y, maxWidth, lineHeight, stroke = false) {
    var words = text.split(" ");
    var line = "";

    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            if (stroke) {
                context.strokeText(line, x, y);
            } else {
                context.fillText(line, x, y);
            }
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }

    if (stroke) {
        context.strokeText(line, x, y);
    } else {
        context.fillText(line, x, y);
    }
}

/**
 * Returns a rotated trapez, used for spotlight culling
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} leftHeight
 * @param {number} angle
 */
export function rotateTrapezRightFaced(x, y, w, h, leftHeight, angle) {
    const halfY = y + h / 2;
    const points = [
        new Vector(x, halfY - leftHeight / 2),
        new Vector(x + w, y),
        new Vector(x, halfY + leftHeight / 2),
        new Vector(x + w, y + h),
    ];

    return Rectangle.getAroundPointsRotated(points, angle);
}

/**
 * Converts values from 0 .. 255 to values like 07, 7f, 5d etc
 * @param {number} value
 * @returns {string}
 */
export function mapClampedColorValueToHex(value) {
    const hex = "0123456789abcdef";
    return hex[Math_floor(value / 16)] + hex[value % 16];
}

/**
 * Converts rgb to a hex string
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
    return mapClampedColorValueToHex(r) + mapClampedColorValueToHex(g) + mapClampedColorValueToHex(b);
}

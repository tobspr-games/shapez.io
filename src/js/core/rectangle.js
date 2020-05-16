import { globalConfig } from "./config";
import { Math_ceil, Math_floor, Math_max, Math_min } from "./builtins";
import { clamp, epsilonCompare, round2Digits } from "./utils";
import { Vector } from "./vector";

export class Rectangle {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    /**
     * Creates a rectangle from top right bottom and left offsets
     * @param {number} top
     * @param {number} right
     * @param {number} bottom
     * @param {number} left
     */
    static fromTRBL(top, right, bottom, left) {
        return new Rectangle(left, top, right - left, bottom - top);
    }

    /**
     * Constructs a new square rectangle
     * @param {number} x
     * @param {number} y
     * @param {number} size
     */
    static fromSquare(x, y, size) {
        return new Rectangle(x, y, size, size);
    }

    /**
     *
     * @param {Vector} p1
     * @param {Vector} p2
     */
    static fromTwoPoints(p1, p2) {
        const left = Math_min(p1.x, p2.x);
        const top = Math_min(p1.y, p2.y);
        const right = Math_max(p1.x, p2.x);
        const bottom = Math_max(p1.y, p2.y);
        return new Rectangle(left, top, right - left, bottom - top);
    }

    /**
     * @param {Rectangle} a
     * @param {Rectangle} b
     */
    static intersects(a, b) {
        return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
    }

    /**
     * Returns a rectangle arround a rotated point
     * @param {Array<Vector>} points
     * @param {number} angle
     * @returns {Rectangle}
     */
    static getAroundPointsRotated(points, angle) {
        let minX = 1e10;
        let minY = 1e10;
        let maxX = -1e10;
        let maxY = -1e10;
        for (let i = 0; i < points.length; ++i) {
            const rotated = points[i].rotated(angle);
            minX = Math_min(minX, rotated.x);
            minY = Math_min(minY, rotated.y);
            maxX = Math_max(maxX, rotated.x);
            maxY = Math_max(maxY, rotated.y);
        }
        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    // Ensures the rectangle contains the given square
    extendBySquare(centerX, centerY, halfWidth, halfHeight) {
        if (this.isEmpty()) {
            // Just assign values since this rectangle is empty
            this.x = centerX - halfWidth;
            this.y = centerY - halfHeight;
            this.w = halfWidth * 2;
            this.h = halfHeight * 2;
        } else {
            this.setLeft(Math_min(this.x, centerX - halfWidth));
            this.setRight(Math_max(this.right(), centerX + halfWidth));
            this.setTop(Math_min(this.y, centerY - halfHeight));
            this.setBottom(Math_max(this.bottom(), centerY + halfHeight));
        }
    }

    isEmpty() {
        return epsilonCompare(this.w * this.h, 0);
    }

    equalsEpsilon(other, epsilon) {
        return (
            epsilonCompare(this.x, other.x, epsilon) &&
            epsilonCompare(this.y, other.y, epsilon) &&
            epsilonCompare(this.w, other.w, epsilon) &&
            epsilonCompare(this.h, other.h, epsilon)
        );
    }

    left() {
        return this.x;
    }

    right() {
        return this.x + this.w;
    }

    top() {
        return this.y;
    }

    bottom() {
        return this.y + this.h;
    }

    trbl() {
        return [this.y, this.right(), this.bottom(), this.x];
    }

    getCenter() {
        return new Vector(this.x + this.w / 2, this.y + this.h / 2);
    }

    setRight(right) {
        this.w = right - this.x;
    }

    setBottom(bottom) {
        this.h = bottom - this.y;
    }

    // Sets top while keeping bottom
    setTop(top) {
        const bottom = this.bottom();
        this.y = top;
        this.setBottom(bottom);
    }

    // Sets left while keeping right
    setLeft(left) {
        const right = this.right();
        this.x = left;
        this.setRight(right);
    }

    topLeft() {
        return new Vector(this.x, this.y);
    }

    bottomRight() {
        return new Vector(this.right(), this.bottom());
    }

    moveBy(x, y) {
        this.x += x;
        this.y += y;
    }

    moveByVector(vec) {
        this.x += vec.x;
        this.y += vec.y;
    }

    // Returns a scaled version which also scales the position of the rectangle
    allScaled(factor) {
        return new Rectangle(this.x * factor, this.y * factor, this.w * factor, this.h * factor);
    }

    /**
     * Expands the rectangle in all directions
     * @param {number} amount
     * @returns {Rectangle} new rectangle
     */

    expandedInAllDirections(amount) {
        return new Rectangle(this.x - amount, this.y - amount, this.w + 2 * amount, this.h + 2 * amount);
    }

    // Culling helpers
    getMinStartTile() {
        return new Vector(this.x, this.y).snapWorldToTile();
    }

    /**
     * Returns if the given rectangle is contained
     * @param {Rectangle} rect
     * @returns {boolean}
     */
    containsRect(rect) {
        return (
            this.x <= rect.right() &&
            rect.x <= this.right() &&
            this.y <= rect.bottom() &&
            rect.y <= this.bottom()
        );
    }

    containsRect4Params(x, y, w, h) {
        return this.x <= x + w && x <= this.right() && this.y <= y + h && y <= this.bottom();
    }

    /**
     * Returns if the rectangle contains the given circle at (x, y) with the radius (radius)
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     */
    containsCircle(x, y, radius) {
        return (
            this.x <= x + radius &&
            x - radius <= this.right() &&
            this.y <= y + radius &&
            y - radius <= this.bottom()
        );
    }

    /**
     * Returns if hte rectangle contains the given point
     * @param {number} x
     * @param {number} y
     */
    containsPoint(x, y) {
        return x >= this.x && x < this.right() && y >= this.y && y < this.bottom();
    }

    /**
     * Returns the shared area with another rectangle, or null if there is no intersection
     * @param {Rectangle} rect
     * @returns {Rectangle|null}
     */
    getUnion(rect) {
        const left = Math_max(this.x, rect.x);
        const top = Math_max(this.y, rect.y);

        const right = Math_min(this.x + this.w, rect.x + rect.w);
        const bottom = Math_min(this.y + this.h, rect.y + rect.h);

        if (right <= left || bottom <= top) {
            return null;
        }
        return Rectangle.fromTRBL(top, right, bottom, left);
    }

    /**
     * Good for caching stuff
     */
    toCompareableString() {
        return (
            round2Digits(this.x) +
            "/" +
            round2Digits(this.y) +
            "/" +
            round2Digits(this.w) +
            "/" +
            round2Digits(this.h)
        );
    }

    /**
     * Returns a new recangle in tile space which includes all tiles which are visible in this rect
     * @param {boolean=} includeHalfTiles
     * @returns {Rectangle}
     */
    toTileCullRectangle(includeHalfTiles = true) {
        let scaled = this.allScaled(1.0 / globalConfig.tileSize);

        if (includeHalfTiles) {
            // Increase rectangle size
            scaled = Rectangle.fromTRBL(
                Math_floor(scaled.y),
                Math_ceil(scaled.right()),
                Math_ceil(scaled.bottom()),
                Math_floor(scaled.x)
            );
        }

        return scaled;
    }
}

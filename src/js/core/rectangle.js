import { globalConfig } from "./config";
import { epsilonCompare, round2Digits } from "./utils";
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
        const left = Math.min(p1.x, p2.x);
        const top = Math.min(p1.y, p2.y);
        const right = Math.max(p1.x, p2.x);
        const bottom = Math.max(p1.y, p2.y);
        return new Rectangle(left, top, right - left, bottom - top);
    }

    /**
     * Returns if a intersects b
     * @param {Rectangle} a
     * @param {Rectangle} b
     */
    static intersects(a, b) {
        return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
    }

    /**
     * Copies this instance
     * @returns {Rectangle}
     */
    clone() {
        return new Rectangle(this.x, this.y, this.w, this.h);
    }

    /**
     * Returns if this rectangle is empty
     * @returns {boolean}
     */
    isEmpty() {
        return epsilonCompare(this.w * this.h, 0);
    }

    /**
     * Returns if this rectangle is equal to the other while taking an epsilon into account
     * @param {Rectangle} other
     * @param {number} epsilon
     */
    equalsEpsilon(other, epsilon) {
        return (
            epsilonCompare(this.x, other.x, epsilon) &&
            epsilonCompare(this.y, other.y, epsilon) &&
            epsilonCompare(this.w, other.w, epsilon) &&
            epsilonCompare(this.h, other.h, epsilon)
        );
    }

    /**
     * @returns {number}
     */
    left() {
        return this.x;
    }

    /**
     * @returns {number}
     */
    right() {
        return this.x + this.w;
    }

    /**
     * @returns {number}
     */
    top() {
        return this.y;
    }

    /**
     * @returns {number}
     */
    bottom() {
        return this.y + this.h;
    }

    /**
     * Returns Top, Right, Bottom, Left
     * @returns {[number, number, number, number]}
     */
    trbl() {
        return [this.y, this.right(), this.bottom(), this.x];
    }

    /**
     * Returns the center of the rect
     * @returns {Vector}
     */
    getCenter() {
        return new Vector(this.x + this.w / 2, this.y + this.h / 2);
    }

    /**
     * Sets the right side of the rect without moving it
     * @param {number} right
     */
    setRight(right) {
        this.w = right - this.x;
    }

    /**
     * Sets the bottom side of the rect without moving it
     * @param {number} bottom
     */
    setBottom(bottom) {
        this.h = bottom - this.y;
    }

    /**
     * Sets the top side of the rect without scaling it
     * @param {number} top
     */
    setTop(top) {
        const bottom = this.bottom();
        this.y = top;
        this.setBottom(bottom);
    }

    /**
     * Sets the left side of the rect without scaling it
     * @param {number} left
     */
    setLeft(left) {
        const right = this.right();
        this.x = left;
        this.setRight(right);
    }

    /**
     * Returns the top left point
     * @returns {Vector}
     */
    topLeft() {
        return new Vector(this.x, this.y);
    }

    /**
     * Returns the bottom left point
     * @returns {Vector}
     */
    bottomRight() {
        return new Vector(this.right(), this.bottom());
    }

    /**
     * Moves the rectangle by the given parameters
     * @param {number} x
     * @param {number} y
     */
    moveBy(x, y) {
        this.x += x;
        this.y += y;
    }

    /**
     * Moves the rectangle by the given vector
     * @param {Vector} vec
     */
    moveByVector(vec) {
        this.x += vec.x;
        this.y += vec.y;
    }

    /**
     * Scales every parameter (w, h, x, y) by the given factor. Useful to transform from world to
     * tile space and vice versa
     * @param {number} factor
     */
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

    /**
     * Returns if this rectangle contains the other rectangle specified by the parameters
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @returns {boolean}
     */
    containsRect4Params(x, y, w, h) {
        return this.x <= x + w && x <= this.right() && this.y <= y + h && y <= this.bottom();
    }

    /**
     * Returns if the rectangle contains the given circle at (x, y) with the radius (radius)
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @returns {boolean}
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
     * @returns {boolean}
     */
    containsPoint(x, y) {
        return x >= this.x && x < this.right() && y >= this.y && y < this.bottom();
    }

    /**
     * Returns the shared area with another rectangle, or null if there is no intersection
     * @param {Rectangle} rect
     * @returns {Rectangle|null}
     */
    getIntersection(rect) {
        const left = Math.max(this.x, rect.x);
        const top = Math.max(this.y, rect.y);

        const right = Math.min(this.x + this.w, rect.x + rect.w);
        const bottom = Math.min(this.y + this.h, rect.y + rect.h);

        if (right <= left || bottom <= top) {
            return null;
        }

        return Rectangle.fromTRBL(top, right, bottom, left);
    }

    /**
     * Returns the union of this rectangle with another
     * @param {Rectangle} rect
     */
    getUnion(rect) {
        if (this.isEmpty()) {
            // If this is rect is empty, return the other one
            return rect.clone();
        }
        if (rect.isEmpty()) {
            // If the other is empty, return this one
            return this.clone();
        }

        // Find contained area
        const left = Math.min(this.x, rect.x);
        const top = Math.min(this.y, rect.y);
        const right = Math.max(this.right(), rect.right());
        const bottom = Math.max(this.bottom(), rect.bottom());

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
     * Good for printing stuff
     */
    toString() {
        return (
            "[x:" +
            round2Digits(this.x) +
            "| y:" +
            round2Digits(this.y) +
            "| w:" +
            round2Digits(this.w) +
            "| h:" +
            round2Digits(this.h) +
            "]"
        );
    }

    /**
     * Returns a new rectangle in tile space which includes all tiles which are visible in this rect
     * @returns {Rectangle}
     */
    toTileCullRectangle() {
        return new Rectangle(
            Math.floor(this.x / globalConfig.tileSize),
            Math.floor(this.y / globalConfig.tileSize),
            Math.ceil(this.w / globalConfig.tileSize),
            Math.ceil(this.h / globalConfig.tileSize)
        );
    }
}

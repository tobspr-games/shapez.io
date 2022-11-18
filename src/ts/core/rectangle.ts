import { globalConfig } from "./config";
import { epsilonCompare, round2Digits } from "./utils";
import { Vector } from "./vector";
export class Rectangle {
    public x = x;
    public y = y;
    public w = w;
    public h = h;

    constructor(x = 0, y = 0, w = 0, h = 0) {
    }
    /**
     * Creates a rectangle from top right bottom and left offsets
     */
    static fromTRBL(top: number, right: number, bottom: number, left: number): any {
        return new Rectangle(left, top, right - left, bottom - top);
    }
    /**
     * Constructs a new square rectangle
     */
    static fromSquare(x: number, y: number, size: number): any {
        return new Rectangle(x, y, size, size);
    }
        static fromTwoPoints(p1: Vector, p2: Vector): any {
        const left: any = Math.min(p1.x, p2.x);
        const top: any = Math.min(p1.y, p2.y);
        const right: any = Math.max(p1.x, p2.x);
        const bottom: any = Math.max(p1.y, p2.y);
        return new Rectangle(left, top, right - left, bottom - top);
    }
        static centered(width: number, height: number): any {
        return new Rectangle(-Math.ceil(width / 2), -Math.ceil(height / 2), width, height);
    }
    /**
     * Returns if a intersects b
     */
    static intersects(a: Rectangle, b: Rectangle): any {
        return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
    }
    /**
     * Copies this instance
     * {}
     */
    clone(): Rectangle {
        return new Rectangle(this.x, this.y, this.w, this.h);
    }
    /**
     * Returns if this rectangle is empty
     * {}
     */
    isEmpty(): boolean {
        return epsilonCompare(this.w * this.h, 0);
    }
    /**
     * Returns if this rectangle is equal to the other while taking an epsilon into account
     */
    equalsEpsilon(other: Rectangle, epsilon: number): any {
        return (epsilonCompare(this.x, other.x, epsilon) &&
            epsilonCompare(this.y, other.y, epsilon) &&
            epsilonCompare(this.w, other.w, epsilon) &&
            epsilonCompare(this.h, other.h, epsilon));
    }
    /**
     * {}
     */
    left(): number {
        return this.x;
    }
    /**
     * {}
     */
    right(): number {
        return this.x + this.w;
    }
    /**
     * {}
     */
    top(): number {
        return this.y;
    }
    /**
     * {}
     */
    bottom(): number {
        return this.y + this.h;
    }
    /**
     * Returns Top, Right, Bottom, Left
     * {}
     */
    trbl(): [
        number,
        number,
        number,
        number
    ] {
        return [this.y, this.right(), this.bottom(), this.x];
    }
    /**
     * Returns the center of the rect
     * {}
     */
    getCenter(): Vector {
        return new Vector(this.x + this.w / 2, this.y + this.h / 2);
    }
    /**
     * Sets the right side of the rect without moving it
     */
    setRight(right: number): any {
        this.w = right - this.x;
    }
    /**
     * Sets the bottom side of the rect without moving it
     */
    setBottom(bottom: number): any {
        this.h = bottom - this.y;
    }
    /**
     * Sets the top side of the rect without scaling it
     */
    setTop(top: number): any {
        const bottom: any = this.bottom();
        this.y = top;
        this.setBottom(bottom);
    }
    /**
     * Sets the left side of the rect without scaling it
     */
    setLeft(left: number): any {
        const right: any = this.right();
        this.x = left;
        this.setRight(right);
    }
    /**
     * Returns the top left point
     * {}
     */
    topLeft(): Vector {
        return new Vector(this.x, this.y);
    }
    /**
     * Returns the bottom left point
     * {}
     */
    bottomRight(): Vector {
        return new Vector(this.right(), this.bottom());
    }
    /**
     * Moves the rectangle by the given parameters
     */
    moveBy(x: number, y: number): any {
        this.x += x;
        this.y += y;
    }
    /**
     * Moves the rectangle by the given vector
     */
    moveByVector(vec: Vector): any {
        this.x += vec.x;
        this.y += vec.y;
    }
    /**
     * Scales every parameter (w, h, x, y) by the given factor. Useful to transform from world to
     * tile space and vice versa
     */
    allScaled(factor: number): any {
        return new Rectangle(this.x * factor, this.y * factor, this.w * factor, this.h * factor);
    }
    /**
     * Expands the rectangle in all directions
     * {} new rectangle
     */
    expandedInAllDirections(amount: number): Rectangle {
        return new Rectangle(this.x - amount, this.y - amount, this.w + 2 * amount, this.h + 2 * amount);
    }
    /**
     * Returns if the given rectangle is contained
     * {}
     */
    containsRect(rect: Rectangle): boolean {
        return (this.x <= rect.right() &&
            rect.x <= this.right() &&
            this.y <= rect.bottom() &&
            rect.y <= this.bottom());
    }
    /**
     * Returns if this rectangle contains the other rectangle specified by the parameters
     * {}
     */
    containsRect4Params(x: number, y: number, w: number, h: number): boolean {
        return this.x <= x + w && x <= this.right() && this.y <= y + h && y <= this.bottom();
    }
    /**
     * Returns if the rectangle contains the given circle at (x, y) with the radius (radius)
     * {}
     */
    containsCircle(x: number, y: number, radius: number): boolean {
        return (this.x <= x + radius &&
            x - radius <= this.right() &&
            this.y <= y + radius &&
            y - radius <= this.bottom());
    }
    /**
     * Returns if the rectangle contains the given point
     * {}
     */
    containsPoint(x: number, y: number): boolean {
        return x >= this.x && x < this.right() && y >= this.y && y < this.bottom();
    }
    /**
     * Returns the shared area with another rectangle, or null if there is no intersection
     * {}
     */
    getIntersection(rect: Rectangle): Rectangle | null {
        const left: any = Math.max(this.x, rect.x);
        const top: any = Math.max(this.y, rect.y);
        const right: any = Math.min(this.x + this.w, rect.x + rect.w);
        const bottom: any = Math.min(this.y + this.h, rect.y + rect.h);
        if (right <= left || bottom <= top) {
            return null;
        }
        return Rectangle.fromTRBL(top, right, bottom, left);
    }
    /**
     * Returns whether the rectangle fully intersects the given rectangle
     */
    intersectsFully(rect: Rectangle): any {
        const intersection: any = this.getIntersection(rect);
        return intersection && Math.abs(intersection.w * intersection.h - rect.w * rect.h) < 0.001;
    }
    /**
     * Returns the union of this rectangle with another
     */
    getUnion(rect: Rectangle): any {
        if (this.isEmpty()) {
            // If this is rect is empty, return the other one
            return rect.clone();
        }
        if (rect.isEmpty()) {
            // If the other is empty, return this one
            return this.clone();
        }
        // Find contained area
        const left: any = Math.min(this.x, rect.x);
        const top: any = Math.min(this.y, rect.y);
        const right: any = Math.max(this.right(), rect.right());
        const bottom: any = Math.max(this.bottom(), rect.bottom());
        return Rectangle.fromTRBL(top, right, bottom, left);
    }
    /**
     * Good for caching stuff
     */
    toCompareableString(): any {
        return (round2Digits(this.x) +
            "/" +
            round2Digits(this.y) +
            "/" +
            round2Digits(this.w) +
            "/" +
            round2Digits(this.h));
    }
    /**
     * Good for printing stuff
     */
    toString(): any {
        return ("[x:" +
            round2Digits(this.x) +
            "| y:" +
            round2Digits(this.y) +
            "| w:" +
            round2Digits(this.w) +
            "| h:" +
            round2Digits(this.h) +
            "]");
    }
    /**
     * Returns a new rectangle in tile space which includes all tiles which are visible in this rect
     * {}
     */
    toTileCullRectangle(): Rectangle {
        return new Rectangle(Math.floor(this.x / globalConfig.tileSize), Math.floor(this.y / globalConfig.tileSize), Math.ceil(this.w / globalConfig.tileSize), Math.ceil(this.h / globalConfig.tileSize));
    }
}

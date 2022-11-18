import { globalConfig } from "./config";
import { safeModulo } from "./utils";
const tileSize = globalConfig.tileSize;
const halfTileSize = globalConfig.halfTileSize;
/**
 * @enum {string}
 */
export const enumDirection = {
    top: "top",
    right: "right",
    bottom: "bottom",
    left: "left",
};
/**
 * @enum {string}
 */
export const enumInvertedDirections = {
    [enumDirection.top]: enumDirection.bottom,
    [enumDirection.right]: enumDirection.left,
    [enumDirection.bottom]: enumDirection.top,
    [enumDirection.left]: enumDirection.right,
};
/**
 * @enum {number}
 */
export const enumDirectionToAngle = {
    [enumDirection.top]: 0,
    [enumDirection.right]: 90,
    [enumDirection.bottom]: 180,
    [enumDirection.left]: 270,
};
/**
 * @enum {enumDirection}
 */
export const enumAngleToDirection = {
    0: enumDirection.top,
    90: enumDirection.right,
    180: enumDirection.bottom,
    270: enumDirection.left,
};
export const arrayAllDirections: Array<enumDirection> = [
    enumDirection.top,
    enumDirection.right,
    enumDirection.bottom,
    enumDirection.left,
];
export class Vector {
    public x = x || 0;
    public y = y || 0;

        constructor(x, y) {
    }
    /**
     * return a copy of the vector
     * {}
     */
    copy(): Vector {
        return new Vector(this.x, this.y);
    }
    /**
     * Adds a vector and return a new vector
     * {}
     */
    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    /**
     * Adds a vector
     * {}
     */
    addInplace(other: Vector): Vector {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    /**
     * Substracts a vector and return a new vector
     * {}
     */
    sub(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    /**
     * Subs a vector
     * {}
     */
    subInplace(other: Vector): Vector {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    /**
     * Multiplies with a vector and return a new vector
     * {}
     */
    mul(other: Vector): Vector {
        return new Vector(this.x * other.x, this.y * other.y);
    }
    /**
     * Adds two scalars and return a new vector
     * {}
     */
    addScalars(x: number, y: number): Vector {
        return new Vector(this.x + x, this.y + y);
    }
    /**
     * Substracts a scalar and return a new vector
     * {}
     */
    subScalar(f: number): Vector {
        return new Vector(this.x - f, this.y - f);
    }
    /**
     * Substracts two scalars and return a new vector
     * {}
     */
    subScalars(x: number, y: number): Vector {
        return new Vector(this.x - x, this.y - y);
    }
    /**
     * Returns the euclidian length
     * {}
     */
    length(): number {
        return Math.hypot(this.x, this.y);
    }
    /**
     * Returns the square length
     * {}
     */
    lengthSquare(): number {
        return this.x * this.x + this.y * this.y;
    }
    /**
     * Divides both components by a scalar and return a new vector
     * {}
     */
    divideScalar(f: number): Vector {
        return new Vector(this.x / f, this.y / f);
    }
    /**
     * Divides both components by the given scalars and return a new vector
     * {}
     */
    divideScalars(a: number, b: number): Vector {
        return new Vector(this.x / a, this.y / b);
    }
    /**
     * Divides both components by a scalar
     * {}
     */
    divideScalarInplace(f: number): Vector {
        this.x /= f;
        this.y /= f;
        return this;
    }
    /**
     * Multiplies both components with a scalar and return a new vector
     * {}
     */
    multiplyScalar(f: number): Vector {
        return new Vector(this.x * f, this.y * f);
    }
    /**
     * Multiplies both components with two scalars and returns a new vector
     * {}
     */
    multiplyScalars(a: number, b: number): Vector {
        return new Vector(this.x * a, this.y * b);
    }
    /**
     * For both components, compute the maximum of each component and the given scalar, and return a new vector.
     * For example:
     *   - new Vector(-1, 5).maxScalar(0) -> Vector(0, 5)
     * {}
     */
    maxScalar(f: number): Vector {
        return new Vector(Math.max(f, this.x), Math.max(f, this.y));
    }
    /**
     * Adds a scalar to both components and return a new vector
     * {}
     */
    addScalar(f: number): Vector {
        return new Vector(this.x + f, this.y + f);
    }
    /**
     * Computes the component wise minimum and return a new vector
     * {}
     */
    min(v: Vector): Vector {
        return new Vector(Math.min(v.x, this.x), Math.min(v.y, this.y));
    }
    /**
     * Computes the component wise maximum and return a new vector
     * {}
     */
    max(v: Vector): Vector {
        return new Vector(Math.max(v.x, this.x), Math.max(v.y, this.y));
    }
    /**
     * Computes the component wise absolute
     * {}
     */
    abs(): Vector {
        return new Vector(Math.abs(this.x), Math.abs(this.y));
    }
    /**
     * Computes the scalar product
     * {}
     */
    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }
    /**
     * Computes the distance to a given vector
     * {}
     */
    distance(v: Vector): number {
        return Math.hypot(this.x - v.x, this.y - v.y);
    }
    /**
     * Computes the square distance to a given vectort
     * {}
     */
    distanceSquare(v: Vector): number {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }
    /**
     * Returns x % f, y % f
     * {} new vector
     */
    modScalar(f: number): Vector {
        return new Vector(safeModulo(this.x, f), safeModulo(this.y, f));
    }
    /**
     * Computes and returns the center between both points
     * {}
     */
    centerPoint(v: Vector): Vector {
        const cx = this.x + v.x;
        const cy = this.y + v.y;
        return new Vector(cx / 2, cy / 2);
    }
    /**
     * Computes componentwise floor and returns a new vector
     * {}
     */
    floor(): Vector {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }
    /**
     * Computes componentwise ceil and returns a new vector
     * {}
     */
    ceil(): Vector {
        return new Vector(Math.ceil(this.x), Math.ceil(this.y));
    }
    /**
     * Computes componentwise round and return a new vector
     * {}
     */
    round(): Vector {
        return new Vector(Math.round(this.x), Math.round(this.y));
    }
    /**
     * Converts this vector from world to tile space and return a new vector
     * {}
     */
    toTileSpace(): Vector {
        return new Vector(Math.floor(this.x / tileSize), Math.floor(this.y / tileSize));
    }
    /**
     * Converts this vector from world to street space and return a new vector
     * {}
     */
    toStreetSpace(): Vector {
        return new Vector(Math.floor(this.x / halfTileSize + 0.25), Math.floor(this.y / halfTileSize + 0.25));
    }
    /**
     * Converts this vector to world space and return a new vector
     * {}
     */
    toWorldSpace(): Vector {
        return new Vector(this.x * tileSize, this.y * tileSize);
    }
    /**
     * Converts this vector to world space and return a new vector
     * {}
     */
    toWorldSpaceCenterOfTile(): Vector {
        return new Vector(this.x * tileSize + halfTileSize, this.y * tileSize + halfTileSize);
    }
    /**
     * Converts the top left tile position of this vector
     * {}
     */
    snapWorldToTile(): Vector {
        return new Vector(Math.floor(this.x / tileSize) * tileSize, Math.floor(this.y / tileSize) * tileSize);
    }
    /**
     * Normalizes the vector, dividing by the length(), and return a new vector
     * {}
     */
    normalize(): Vector {
        const len = Math.max(1e-5, Math.hypot(this.x, this.y));
        return new Vector(this.x / len, this.y / len);
    }
    /**
     * Normalizes the vector, dividing by the length(), and return a new vector
     * {}
     */
    normalizeIfGreaterOne(): Vector {
        const len = Math.max(1, Math.hypot(this.x, this.y));
        return new Vector(this.x / len, this.y / len);
    }
    /**
     * Returns the normalized vector to the other point
     * {}
     */
    normalizedDirection(v: Vector): Vector {
        const dx = v.x - this.x;
        const dy = v.y - this.y;
        const len = Math.max(1e-5, Math.hypot(dx, dy));
        return new Vector(dx / len, dy / len);
    }
    /**
     * Returns a perpendicular vector
     * {}
     */
    findPerpendicular(): Vector {
        return new Vector(-this.y, this.x);
    }
    /**
     * Returns the unnormalized direction to the other point
     * {}
     */
    direction(v: Vector): Vector {
        return new Vector(v.x - this.x, v.y - this.y);
    }
    /**
     * Returns a string representation of the vector
     * {}
     */
    toString(): string {
        return this.x + "," + this.y;
    }
    /**
     * Compares both vectors for exact equality. Does not do an epsilon compare
     * {}
     */
    equals(v: Vector): Boolean {
        return this.x === v.x && this.y === v.y;
    }
    /**
     * Rotates this vector
     * {} new vector
     */
    rotated(angle: number): Vector {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
    /**
     * Rotates this vector
     * {} this vector
     */
    rotateInplaceFastMultipleOf90(angle: number): Vector {
        // const sin = Math.sin(angle);
        // const cos = Math.cos(angle);
        // let sin = 0, cos = 1;
        assert(angle >= 0 && angle <= 360, "Invalid angle, please clamp first: " + angle);
        switch (angle) {
            case 0:
            case 360: {
                return this;
            }
            case 90: {
                // sin = 1;
                // cos = 0;
                const x = this.x;
                this.x = -this.y;
                this.y = x;
                return this;
            }
            case 180: {
                // sin = 0
                // cos = -1
                this.x = -this.x;
                this.y = -this.y;
                return this;
            }
            case 270: {
                // sin = -1
                // cos = 0
                const x = this.x;
                this.x = this.y;
                this.y = -x;
                return this;
            }
            default: {
                assertAlways(false, "Invalid fast inplace rotation: " + angle);
                return this;
            }
        }
        // return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
    /**
     * Rotates this vector
     * {} new vector
     */
    rotateFastMultipleOf90(angle: number): Vector {
        assert(angle >= 0 && angle <= 360, "Invalid angle, please clamp first: " + angle);
        switch (angle) {
            case 360:
            case 0: {
                return new Vector(this.x, this.y);
            }
            case 90: {
                return new Vector(-this.y, this.x);
            }
            case 180: {
                return new Vector(-this.x, -this.y);
            }
            case 270: {
                return new Vector(this.y, -this.x);
            }
            default: {
                assertAlways(false, "Invalid fast inplace rotation: " + angle);
                return new Vector();
            }
        }
    }
    /**
     * Helper method to rotate a direction
     * {}
     */
    static transformDirectionFromMultipleOf90(direction: enumDirection, angle: number): enumDirection {
        if (angle === 0 || angle === 360) {
            return direction;
        }
        assert(angle >= 0 && angle <= 360, "Invalid angle: " + angle);
        switch (direction) {
            case enumDirection.top: {
                switch (angle) {
                    case 90:
                        return enumDirection.right;
                    case 180:
                        return enumDirection.bottom;
                    case 270:
                        return enumDirection.left;
                    default:
                        assertAlways(false, "Invalid angle: " + angle);
                        return;
                }
            }
            case enumDirection.right: {
                switch (angle) {
                    case 90:
                        return enumDirection.bottom;
                    case 180:
                        return enumDirection.left;
                    case 270:
                        return enumDirection.top;
                    default:
                        assertAlways(false, "Invalid angle: " + angle);
                        return;
                }
            }
            case enumDirection.bottom: {
                switch (angle) {
                    case 90:
                        return enumDirection.left;
                    case 180:
                        return enumDirection.top;
                    case 270:
                        return enumDirection.right;
                    default:
                        assertAlways(false, "Invalid angle: " + angle);
                        return;
                }
            }
            case enumDirection.left: {
                switch (angle) {
                    case 90:
                        return enumDirection.top;
                    case 180:
                        return enumDirection.right;
                    case 270:
                        return enumDirection.bottom;
                    default:
                        assertAlways(false, "Invalid angle: " + angle);
                        return;
                }
            }
            default:
                assertAlways(false, "Invalid angle: " + angle);
                return;
        }
    }
    /**
     * Compares both vectors for epsilon equality
     * {}
     */
    equalsEpsilon(v: Vector, epsilon = 1e-5): Boolean {
        return Math.abs(this.x - v.x) < 1e-5 && Math.abs(this.y - v.y) < epsilon;
    }
    /**
     * Returns the angle
     * {} 0 .. 2 PI
     */
    angle(): number {
        return Math.atan2(this.y, this.x) + Math.PI / 2;
    }
    /**
     * Serializes the vector to a string
     * {}
     */
    serializeTile(): string {
        return String.fromCharCode(33 + this.x) + String.fromCharCode(33 + this.y);
    }
    /**
     * Creates a simple representation of the vector
     */
    serializeSimple() {
        return { x: this.x, y: this.y };
    }
    /**
     * {}
     */
    serializeTileToInt(): number {
        return this.x + this.y * 256;
    }
    /**
     *
     * {}
     */
    static deserializeTileFromInt(i: number): Vector {
        const x = i % 256;
        const y = Math.floor(i / 256);
        return new Vector(x, y);
    }
    /**
     * Deserializes a vector from a string
     * {}
     */
    static deserializeTile(s: string): Vector {
        return new Vector(s.charCodeAt(0) - 33, s.charCodeAt(1) - 33);
    }
    /**
     * Deserializes a vector from a serialized json object
     * {}
     */
    static fromSerializedObject(obj: object): Vector {
        if (obj) {
            return new Vector(obj.x || 0, obj.y || 0);
        }
    }
}
/**
 * Interpolates two vectors, for a = 0, returns v1 and for a = 1 return v2, otherwise interpolate
 */
export function mixVector(v1: Vector, v2: Vector, a: number) {
    return new Vector(v1.x * (1 - a) + v2.x * a, v1.y * (1 - a) + v2.y * a);
}
/**
 * Mapping from string direction to actual vector
 * @enum {Vector}
 */
export const enumDirectionToVector = {
    top: new Vector(0, -1),
    right: new Vector(1, 0),
    bottom: new Vector(0, 1),
    left: new Vector(-1, 0),
};

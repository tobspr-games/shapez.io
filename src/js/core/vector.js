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

/** @type {Array<enumDirection>} */
export const arrayAllDirections = [
    enumDirection.top,
    enumDirection.right,
    enumDirection.bottom,
    enumDirection.left,
];

export class Vector {
    /**
     *
     * @param {number=} x
     * @param {number=} y
     */
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    /**
     * return a copy of the vector
     * @returns {Vector}
     */
    copy() {
        return new Vector(this.x, this.y);
    }

    /**
     * Adds a vector and return a new vector
     * @param {Vector} other
     * @returns {Vector}
     */
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Adds a vector
     * @param {Vector} other
     * @returns {Vector}
     */
    addInplace(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * Substracts a vector and return a new vector
     * @param {Vector} other
     * @returns {Vector}
     */
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    /**
     * Subs a vector
     * @param {Vector} other
     * @returns {Vector}
     */
    subInplace(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * Multiplies with a vector and return a new vector
     * @param {Vector} other
     * @returns {Vector}
     */
    mul(other) {
        return new Vector(this.x * other.x, this.y * other.y);
    }

    /**
     * Adds two scalars and return a new vector
     * @param {number} x
     * @param {number} y
     * @returns {Vector}
     */
    addScalars(x, y) {
        return new Vector(this.x + x, this.y + y);
    }

    /**
     * Substracts a scalar and return a new vector
     * @param {number} f
     * @returns {Vector}
     */
    subScalar(f) {
        return new Vector(this.x - f, this.y - f);
    }

    /**
     * Substracts two scalars and return a new vector
     * @param {number} x
     * @param {number} y
     * @returns {Vector}
     */
    subScalars(x, y) {
        return new Vector(this.x - x, this.y - y);
    }

    /**
     * Returns the euclidian length
     * @returns {number}
     */
    length() {
        return Math.hypot(this.x, this.y);
    }

    /**
     * Returns the square length
     * @returns {number}
     */
    lengthSquare() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Divides both components by a scalar and return a new vector
     * @param {number} f
     * @returns {Vector}
     */
    divideScalar(f) {
        return new Vector(this.x / f, this.y / f);
    }

    /**
     * Divides both components by the given scalars and return a new vector
     * @param {number} a
     * @param {number} b
     * @returns {Vector}
     */
    divideScalars(a, b) {
        return new Vector(this.x / a, this.y / b);
    }

    /**
     * Divides both components by a scalar
     * @param {number} f
     * @returns {Vector}
     */
    divideScalarInplace(f) {
        this.x /= f;
        this.y /= f;
        return this;
    }

    /**
     * Multiplies both components with a scalar and return a new vector
     * @param {number} f
     * @returns {Vector}
     */
    multiplyScalar(f) {
        return new Vector(this.x * f, this.y * f);
    }

    /**
     * Multiplies both components with two scalars and returns a new vector
     * @param {number} a
     * @param {number} b
     * @returns {Vector}
     */
    multiplyScalars(a, b) {
        return new Vector(this.x * a, this.y * b);
    }

    /**
     * For both components, compute the maximum of each component and the given scalar, and return a new vector.
     * For example:
     *   - new Vector(-1, 5).maxScalar(0) -> Vector(0, 5)
     * @param {number} f
     * @returns {Vector}
     */
    maxScalar(f) {
        return new Vector(Math.max(f, this.x), Math.max(f, this.y));
    }

    /**
     * Adds a scalar to both components and return a new vector
     * @param {number} f
     * @returns {Vector}
     */
    addScalar(f) {
        return new Vector(this.x + f, this.y + f);
    }

    /**
     * Computes the component wise minimum and return a new vector
     * @param {Vector} v
     * @returns {Vector}
     */
    min(v) {
        return new Vector(Math.min(v.x, this.x), Math.min(v.y, this.y));
    }

    /**
     * Computes the component wise maximum and return a new vector
     * @param {Vector} v
     * @returns {Vector}
     */
    max(v) {
        return new Vector(Math.max(v.x, this.x), Math.max(v.y, this.y));
    }
    /**
     * Computes the component wise absolute
     * @returns {Vector}
     */
    abs() {
        return new Vector(Math.abs(this.x), Math.abs(this.y));
    }

    /**
     * Computes the scalar product
     * @param {Vector} v
     * @returns {number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Computes the distance to a given vector
     * @param {Vector} v
     * @returns {number}
     */
    distance(v) {
        return Math.hypot(this.x - v.x, this.y - v.y);
    }

    /**
     * Computes the square distance to a given vectort
     * @param {Vector} v
     * @returns {number}
     */
    distanceSquare(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    /**
     * Returns x % f, y % f
     * @param {number} f
     * @returns {Vector} new vector
     */
    modScalar(f) {
        return new Vector(safeModulo(this.x, f), safeModulo(this.y, f));
    }

    /**
     * Computes and returns the center between both points
     * @param {Vector} v
     * @returns {Vector}
     */
    centerPoint(v) {
        const cx = this.x + v.x;
        const cy = this.y + v.y;
        return new Vector(cx / 2, cy / 2);
    }

    /**
     * Computes componentwise floor and returns a new vector
     * @returns {Vector}
     */
    floor() {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }

    /**
     * Computes componentwise ceil and returns a new vector
     * @returns {Vector}
     */
    ceil() {
        return new Vector(Math.ceil(this.x), Math.ceil(this.y));
    }

    /**
     * Computes componentwise round and return a new vector
     * @returns {Vector}
     */
    round() {
        return new Vector(Math.round(this.x), Math.round(this.y));
    }

    /**
     * Converts this vector from world to tile space and return a new vector
     * @returns {Vector}
     */
    toTileSpace() {
        return new Vector(Math.floor(this.x / tileSize), Math.floor(this.y / tileSize));
    }

    /**
     * Converts this vector from world to street space and return a new vector
     * @returns {Vector}
     */
    toStreetSpace() {
        return new Vector(Math.floor(this.x / halfTileSize + 0.25), Math.floor(this.y / halfTileSize + 0.25));
    }

    /**
     * Converts this vector to world space and return a new vector
     * @returns {Vector}
     */
    toWorldSpace() {
        return new Vector(this.x * tileSize, this.y * tileSize);
    }

    /**
     * Converts this vector to world space and return a new vector
     * @returns {Vector}
     */
    toWorldSpaceCenterOfTile() {
        return new Vector(this.x * tileSize + halfTileSize, this.y * tileSize + halfTileSize);
    }

    /**
     * Converts the top left tile position of this vector
     * @returns {Vector}
     */
    snapWorldToTile() {
        return new Vector(Math.floor(this.x / tileSize) * tileSize, Math.floor(this.y / tileSize) * tileSize);
    }

    /**
     * Normalizes the vector, dividing by the length(), and return a new vector
     * @returns {Vector}
     */
    normalize() {
        const len = Math.max(1e-5, Math.hypot(this.x, this.y));
        return new Vector(this.x / len, this.y / len);
    }

    /**
     * Normalizes the vector, dividing by the length(), and return a new vector
     * @returns {Vector}
     */
    normalizeIfGreaterOne() {
        const len = Math.max(1, Math.hypot(this.x, this.y));
        return new Vector(this.x / len, this.y / len);
    }

    /**
     * Returns the normalized vector to the other point
     * @param {Vector} v
     * @returns {Vector}
     */
    normalizedDirection(v) {
        const dx = v.x - this.x;
        const dy = v.y - this.y;
        const len = Math.max(1e-5, Math.hypot(dx, dy));
        return new Vector(dx / len, dy / len);
    }

    /**
     * Returns a perpendicular vector
     * @returns {Vector}
     */
    findPerpendicular() {
        return new Vector(-this.y, this.x);
    }

    /**
     * Returns the unnormalized direction to the other point
     * @param {Vector} v
     * @returns {Vector}
     */
    direction(v) {
        return new Vector(v.x - this.x, v.y - this.y);
    }

    /**
     * Returns a string representation of the vector
     * @returns {string}
     */
    toString() {
        return this.x + "," + this.y;
    }

    /**
     * Compares both vectors for exact equality. Does not do an epsilon compare
     * @param {Vector} v
     * @returns {Boolean}
     */
    equals(v) {
        return this.x === v.x && this.y === v.y;
    }

    /**
     * Rotates this vector
     * @param {number} angle
     * @returns {Vector} new vector
     */
    rotated(angle) {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }

    /**
     * Rotates this vector
     * @param {number} angle
     * @returns {Vector} this vector
     */
    rotateInplaceFastMultipleOf90(angle) {
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
     * @param {number} angle
     * @returns {Vector} new vector
     */
    rotateFastMultipleOf90(angle) {
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
     * @param {enumDirection} direction
     * @param {number} angle
     * @returns {enumDirection}
     */
    static transformDirectionFromMultipleOf90(direction, angle) {
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
     * @param {Vector} v
     * @returns {Boolean}
     */
    equalsEpsilon(v, epsilon = 1e-5) {
        return Math.abs(this.x - v.x) < 1e-5 && Math.abs(this.y - v.y) < epsilon;
    }

    /**
     * Returns the angle
     * @returns {number} 0 .. 2 PI
     */
    angle() {
        return Math.atan2(this.y, this.x) + Math.PI / 2;
    }

    /**
     * Serializes the vector to a string
     * @returns {string}
     */
    serializeTile() {
        return String.fromCharCode(33 + this.x) + String.fromCharCode(33 + this.y);
    }

    /**
     * Creates a simple representation of the vector
     */
    serializeSimple() {
        return { x: this.x, y: this.y };
    }

    /**
     * @returns {number}
     */
    serializeTileToInt() {
        return this.x + this.y * 256;
    }

    /**
     *
     * @param {number} i
     * @returns {Vector}
     */
    static deserializeTileFromInt(i) {
        const x = i % 256;
        const y = Math.floor(i / 256);
        return new Vector(x, y);
    }

    /**
     * Deserializes a vector from a string
     * @param {string} s
     * @returns {Vector}
     */
    static deserializeTile(s) {
        return new Vector(s.charCodeAt(0) - 33, s.charCodeAt(1) - 33);
    }

    /**
     * Deserializes a vector from a serialized json object
     * @param {object} obj
     * @returns {Vector}
     */
    static fromSerializedObject(obj) {
        if (obj) {
            return new Vector(obj.x || 0, obj.y || 0);
        }
    }
}

/**
 * Interpolates two vectors, for a = 0, returns v1 and for a = 1 return v2, otherwise interpolate
 * @param {Vector} v1
 * @param {Vector} v2
 * @param {number} a
 */
export function mixVector(v1, v2, a) {
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

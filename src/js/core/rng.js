// ALEA RNG

function Mash() {
    var n = 0xefc8249d;
    return function (data) {
        data = data.toString();
        for (var i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            var h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
}

/**
 * @param {number|string} seed
 */
function makeNewRng(seed) {
    // Johannes Baagøe <baagoe@baagoe.com>, 2010
    var c = 1;
    var mash = Mash();
    let s0 = mash(" ");
    let s1 = mash(" ");
    let s2 = mash(" ");

    s0 -= mash(seed);
    if (s0 < 0) {
        s0 += 1;
    }
    s1 -= mash(seed);
    if (s1 < 0) {
        s1 += 1;
    }
    s2 -= mash(seed);
    if (s2 < 0) {
        s2 += 1;
    }
    mash = null;

    var random = function () {
        var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
        s0 = s1;
        s1 = s2;
        return (s2 = t - (c = t | 0));
    };

    random.exportState = function () {
        return [s0, s1, s2, c];
    };

    random.importState = function (i) {
        s0 = +i[0] || 0;
        s1 = +i[1] || 0;
        s2 = +i[2] || 0;
        c = +i[3] || 0;
    };

    return random;
}

export class RandomNumberGenerator {
    /**
     *
     * @param {number|string=} seed
     */
    constructor(seed) {
        this.internalRng = makeNewRng(seed || Math.random());
    }

    /**
     * Re-seeds the generator
     * @param {number|string} seed
     */
    reseed(seed) {
        this.internalRng = makeNewRng(seed || Math.random());
    }

    /**
     * @returns {number} between 0 and 1
     */
    next() {
        return this.internalRng();
    }

    /**
     * Random choice of an array
     * @param {array} array
     */
    choice(array) {
        const index = this.nextIntRange(0, array.length);
        return array[index];
    }

    /**
     * @param {number} min
     * @param {number} max
     * @returns {number} Integer in range [min, max[
     */
    nextIntRange(min, max) {
        assert(Number.isFinite(min), "Minimum is no integer");
        assert(Number.isFinite(max), "Maximum is no integer");
        assert(max > min, "rng: max <= min");
        return Math.floor(this.next() * (max - min) + min);
    }

    /**
     * @param {number} min
     * @param {number} max
     * @returns {number} Number in range [min, max[
     */
    nextRange(min, max) {
        assert(max > min, "rng: max <= min");
        return this.next() * (max - min) + min;
    }

    /**
     * Updates the seed
     * @param {number} seed
     */
    setSeed(seed) {
        this.internalRng = makeNewRng(seed);
    }
}
